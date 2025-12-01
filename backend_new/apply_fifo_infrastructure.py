"""
Script to apply all payment-invoice FIFO sync fixes to server.py
This bypasses the automated editing tool limitations
"""
import re

print("Reading server.py...")
with open('server.py', 'r', encoding='utf-8') as f:
    content = f.read()

print("Step 1: Fix corrupted enum section...")
# Fix the corrupted PaymentStatus enum that has PLAN_CONFIG inside it
pattern1 = r'(class PaymentStatus\(str, Enum\):\s+PENDING = "PENDING"\s+COMPLETED = "COMPLETED"\s+FAILED = "FAILED")\s+("capacity":.+?}\s*}\s*\r?\n)'
replacement1 = r'''\1

class PauseRequestStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class StaffRole(str, Enum):
    MANAGER = "MANAGER"
    ATTENDANCE_OPERATOR = "ATTENDANCE_OPERATOR"
    ACCOUNTANT = "ACCOUNTANT"
    COOK = "COOK"
    HELPER = "HELPER"

class InvoiceStatus(str, Enum):
    PENDING = "PENDING"
    PARTIALLY_PAID = "PARTIALLY_PAID"
    PAID = "PAID"

# Plan Configuration
PLAN_CONFIG = {
    SubscriptionPlan.FREE_TRIAL: {
        "name": "Free Trial",
        "price": 0,
        \2
'''

content = re.sub(pattern1, replacement1, content, flags=re.DOTALL)

print("Step 2: Add status field to Invoice model...")
# Find Invoice model and add status field
pattern2 = r'(class Invoice\(BaseModel\):.*?due_amount: float)\s+(generated_at: datetime)'
replacement2 = r'\1\n    status: Optional[InvoiceStatus] = InvoiceStatus.PENDING\n    \2'
content = re.sub(pattern2, replacement2, content, flags=re.DOTALL)

print("Step 3: Add FIFO helper functions after get_tenant_info...")
# Find where to insert helpers (after get_tenant_info, before initialize_default_data)
helper_functions = '''
# Helper Functions for Payment-Invoice FIFO Sync
async def _apply_payment_to_invoices(
    db,
    tenant_id: str,
    customer_id: str,
    payment_amount: float,
    payment_id: str
) -> float:
    """Apply payment to customer's unpaid invoices using FIFO (oldest first)."""
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
            
            if new_due_amount == 0:
                new_status = InvoiceStatus.PAID
            elif new_paid_amount > 0:
                new_status = InvoiceStatus.PARTIALLY_PAID
            else:
                new_status = InvoiceStatus.PENDING
            
            await db.invoices.update_one(
                {"id": invoice["id"]},
                {"$set": {
                    "paid_amount": new_paid_amount,
                    "due_amount": new_due_amount,
                    "status": new_status
                }}
            )
            
            remaining_payment -= amount_to_apply
    
    total_dues = await _recalculate_customer_dues(db, customer_id, tenant_id)
    return total_dues


async def _recalculate_customer_dues(
    db,
    customer_id: str,
    tenant_id: str
) -> float:
    """Recalculate customer's total dues from all invoices."""
    invoices = await db.invoices.find(
        {"customer_id": customer_id, "tenant_id": tenant_id},
        {"_id": 0, "due_amount": 1}
    ).to_list(10000)
    
    total_dues = sum(inv.get("due_amount", 0) for inv in invoices)
    return total_dues


async def _rebuild_customer_invoices_from_payments(
    db,
    tenant_id: str,
    customer_id: str
) -> None:
    """Rebuild all invoice allocations for a customer from scratch."""
    # 1. Reset all invoices
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
    
    # 2. Get all COMPLETED payments in chronological order
    all_payments = await db.payments.find({
        "customer_id": customer_id,
        "tenant_id": tenant_id,
        "payment_status": PaymentStatus.COMPLETED
    }, {"_id": 0}).sort("payment_date", 1).to_list(10000)
    
    # 3. Reapply all payments in order
    for pmt in all_payments:
        await _apply_payment_to_invoices(
            db,
            tenant_id,
            customer_id,
            pmt["amount"],
            pmt["id"]
        )
    
    # 4. Update customer dues
    new_dues = await _recalculate_customer_dues(db, customer_id, tenant_id)
    await db.customers.update_one(
        {"id": customer_id},
        {"$set": {"current_dues": new_dues}}
    )

'''

pattern3 = r'(return tenant_doc\s+)(# Initialize default data)'
replacement3 = r'\1' + helper_functions + r'\2'
content = re.sub(pattern3, replacement3, content, flags=re.DOTALL)

print("Writing updated server.py...")
with open('server.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Infrastructure fixes applied successfully!")
print("Next: Run apply_payment_route_fixes.py")
