"""
Payment allocation service - FIFO logic for applying payments to invoices
This is the core business logic for managing payment-invoice relationships
"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.enums import InvoiceStatus, PaymentStatus
import logging

logger = logging.getLogger(__name__)


async def apply_payment_to_invoices(
    db: AsyncIOMotorDatabase,
    tenant_id: str,
    customer_id: str,
    payment_amount: float,
    payment_id: str
) -> float:
    """
    Apply payment to customer's unpaid invoices using FIFO (oldest first)
    
    This is the core FIFO allocation logic. It:
    1. Finds all unpaid/partially paid invoices for the customer (oldest first)
    2. Applies the payment amount across them in order
    3. Updates each invoice's paid_amount, due_amount, and status
    4. Returns the new total dues for the customer
    
    Args:
        db: MongoDB database instance
        tenant_id: Tenant ID (for security)
        customer_id: Customer ID
        payment_amount: Amount to allocate
        payment_id: Payment ID (for tracking)
        
    Returns:
        New total dues for the customer after allocation
    """
    # Get all unpaid/partially paid invoices, oldest first
    invoices = await db.invoices.find(
        {
            "tenant_id": tenant_id,
            "customer_id": customer_id,
            "due_amount": {"$gt": 0}
        },
        {"_id": 0}
    ).sort("generated_at", 1).to_list(1000)
    
    remaining_payment = payment_amount
    
    for invoice in invoices:
        if remaining_payment <= 0:
            break
        
        current_due = invoice.get("due_amount", 0)
        amount_to_apply = min(remaining_payment, current_due)
        
        if amount_to_apply > 0:
            new_paid_amount = invoice.get("paid_amount", 0) + amount_to_apply
            new_due_amount = max(0, invoice.get("total_amount", 0) - new_paid_amount)
            
            # Determine new status
            if new_due_amount == 0:
                new_status = InvoiceStatus.PAID
            elif new_paid_amount > 0:
                new_status = InvoiceStatus.PARTIALLY_PAID
            else:
                new_status = InvoiceStatus.PENDING
            
            # Update invoice
            await db.invoices.update_one(
                {"id": invoice["id"]},
                {"$set": {
                    "paid_amount": new_paid_amount,
                    "due_amount": new_due_amount,
                    "status": new_status
                }}
            )
            
            remaining_payment -= amount_to_apply
            
            logger.debug(
                f"Applied {amount_to_apply} to invoice {invoice['id']}. "
                f"New status: {new_status}, due: {new_due_amount}"
            )
    
    # Recalculate and return total dues
    total_dues = await recalculate_customer_dues(db, customer_id, tenant_id)
    return total_dues


async def recalculate_customer_dues(
    db: AsyncIOMotorDatabase,
    customer_id: str,
    tenant_id: str
) -> float:
    """
    Recalculate customer's total dues from all invoices
    
    Invoices are the source of truth. This sums all due_amount fields.
    
    Args:
        db: MongoDB database instance
        customer_id: Customer ID
        tenant_id: Tenant ID (for security)
        
    Returns:
        Total dues amount
    """
    invoices = await db.invoices.find(
        {"customer_id": customer_id, "tenant_id": tenant_id},
        {"_id": 0, "due_amount": 1}
    ).to_list(10000)
    
    total_dues = sum(inv.get("due_amount", 0) for inv in invoices)
    return total_dues


async def rebuild_customer_invoices_from_payments(
    db: AsyncIOMotorDatabase,
    tenant_id: str,
    customer_id: str
) -> None:
    """
    Rebuild all invoice allocations for a customer from scratch
    
    This is the "nuclear option" used when:
    - A payment is updated or deleted
    - We need to ensure complete consistency
    
   Process:
    1. Reset ALL invoices for this customer to unpaid
    2. Get ALL COMPLETED payments in chronological order
    3. Reapply each payment FIFO
    4. Update customer.current_dues
    
    Args:
        db: MongoDB database instance
        tenant_id: Tenant ID (for security)
        customer_id: Customer ID
    """
    logger.info(f"Rebuilding invoice allocations for customer {customer_id}")
    
    # Step 1: Reset all invoices to unpaid
    invoices = await db.invoices.find(
        {"customer_id": customer_id, "tenant_id": tenant_id},
        {"_id": 0}
    ).to_list(10000)
    
    for inv in invoices:
        await db.invoices.update_one(
            {"id": inv["id"]},
            {"$set": {
                "paid_amount": 0,
                "due_amount": inv.get("total_amount", 0),
                "status": InvoiceStatus.PENDING
            }}
        )
    
    # Step 2: Get all COMPLETED payments in chronological order
    all_payments = await db.payments.find({
        "customer_id": customer_id,
        "tenant_id": tenant_id,
        "payment_status": PaymentStatus.COMPLETED
    }, {"_id": 0}).sort("payment_date", 1).to_list(10000)
    
    # Step 3: Reapply all payments FIFO
    for pmt in all_payments:
        await apply_payment_to_invoices(
            db,
            tenant_id,
            customer_id,
            pmt["amount"],
            pmt["id"]
        )
    
    # Step 4: Update customer.current_dues
    new_dues = await recalculate_customer_dues(db, customer_id, tenant_id)
    await db.customers.update_one(
        {"id": customer_id},
        {"$set": {"current_dues": new_dues}}
    )
    
    logger.info(
        f"Rebuilt allocations for customer {customer_id}. "
        f"New dues: {new_dues}, Payments applied: {len(all_payments)}"
    )
