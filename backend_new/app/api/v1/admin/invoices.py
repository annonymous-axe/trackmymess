"""
Invoice management endpoints for admins
All endpoints require admin auth and are tenant-scoped
Includes monthly invoice generation with FIFO allocation
"""
from fastapi import APIRouter, Depends, HTTPException, status, Body
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict, Any
from datetime import datetime, timezone
import uuid
import logging
import calendar

from app.db.mongo import get_db
from app.core.dependencies import require_admin, get_tenant_info
from app.models.payment import Invoice, InvoiceGenerateRequest
from app.models.enums import InvoiceStatus
from app.repositories import invoices as invoice_repo
from app.services.payment_allocation import rebuild_customer_invoices_from_payments

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/invoices", response_model=List[Invoice])
async def list_invoices(
    current_user: Dict[str, Any] = Depends(require_admin),
    tenant: Dict[str, Any] = Depends(get_tenant_info),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    List all invoices for the current tenant
    
    Requires: ADMIN or SUPER_ADMIN role
    Returns: List of invoices sorted by generated_at (newest first)
    """
    invoices = await invoice_repo.list_invoices(db, tenant["id"])
    return [Invoice(**inv) for inv in invoices]


@router.get("/invoices/{invoice_id}", response_model=Invoice)
async def get_invoice(
    invoice_id: str,
    current_user: Dict[str, Any] = Depends(require_admin),
    tenant: Dict[str, Any] = Depends(get_tenant_info),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get a specific invoice by ID
    
    Requires: ADMIN or SUPER_ADMIN role
    Returns: Invoice details
    """
    invoice = await invoice_repo.get_invoice_by_id(db, tenant["id"], invoice_id)
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    return Invoice(**invoice)


@router.post("/invoices/generate-monthly")
async def generate_monthly_invoices(
    month: int = Body(...),
    year: int = Body(...),
    current_user: Dict[str, Any] = Depends(require_admin),
    tenant: Dict[str, Any] = Depends(get_tenant_info),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Generate invoices for all active customers for a specific month
    
    Requires: ADMIN or SUPER_ADMIN role
    Business Logic:
    - Skips customers who already have an invoice for that month/year
    - Calculates charges based on attendance and pause days
    - Initializes invoice with PENDING status
    - Rebuilds payment allocations for each customer after invoice creation
    
    Args:
        month: Month number (1-12)
        year: Year (e.g., 2024)
    """
    tenant_id = tenant["id"]
    
    # Get all active customers
    customers = await db.customers.find(
        {"tenant_id": tenant_id, "is_active": True},
        {"_id": 0}
    ).to_list(10000)
    
    if not customers:
        return {"message": "No active customers found"}
    
    # Calculate date range for the month
    start_date = datetime(year, month, 1, tzinfo=timezone.utc)
    if month == 12:
        end_date = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end_date = datetime(year, month + 1, 1, tzinfo=timezone.utc)
    
    total_days = calendar.monthrange(year, month)[1]
    
    invoices_created = 0
    invoices_skipped = 0
    
    for customer in customers:
        # Check if invoice already exists for this customer/month/year
        invoice_exists = await invoice_repo.check_invoice_exists(
            db, tenant_id, customer["id"], month, year
        )
        
        if invoice_exists:
            logger.debug(f"Invoice already exists for customer {customer['id']} {month}/{year}")
            invoices_skipped += 1
            continue
        
        # Get attendance for this month
        attendance_records = await db.attendance.find({
            "tenant_id": tenant_id,
            "customer_id": customer["id"],
            "date": {"$gte": start_date.isoformat(), "$lt": end_date.isoformat()}
        }, {"_id": 0}).to_list(1000)
        
        present_days = len(attendance_records)
        
        # Get pause days for this month
        pause_requests = await db.pause_requests.find({
            "tenant_id": tenant_id,
            "customer_id": customer["id"],
            "status": "APPROVED",
            "start_date": {"$lt": end_date.isoformat()},
            "end_date": {"$gte": start_date.isoformat()}
        }, {"_id": 0}).to_list(100)
        
        pause_days = 0
        for pr in pause_requests:
            pr_start = max(datetime.fromisoformat(pr["start_date"]), start_date)
            pr_end = min(datetime.fromisoformat(pr["end_date"]), end_date)
            pause_days += (pr_end - pr_start).days + 1
        
        # Calculate charges
        monthly_rate = customer.get("monthly_rate", 0)
        meal_plan = await db.meal_plans.find_one(
            {"id": customer.get("meal_plan_id")},
            {"_id": 0}
        )
        
        billing_type = meal_plan.get("billing_type", "MONTHLY") if meal_plan else "MONTHLY"
        
        if billing_type == "PER_DAY":
            # Per-day billing: charge only for present days
            meal_charges = (monthly_rate / total_days) * present_days
        else:
            # Monthly billing: charge full month minus pause days
            chargeable_days = total_days - pause_days
            meal_charges = (monthly_rate / total_days) * chargeable_days
        
        adjustments = 0  # Future: add adjustment logic if needed
        total_amount = meal_charges + adjustments
        paid_amount = 0
        due_amount = total_amount
        
        # Generate invoice number
        invoice_number = f"INV-{year}{month:02d}-{customer['id'][:8]}"
        
        # Create invoice document
        invoice_id = str(uuid.uuid4())
        invoice_doc = {
            "id": invoice_id,
            "tenant_id": tenant_id,
            "customer_id": customer["id"],
            "customer_name": customer.get("full_name"),
            "invoice_number": invoice_number,
            "month": month,
            "year": year,
            "total_days": total_days,
            "present_days": present_days,
            "pause_days": pause_days,
            "meal_charges": meal_charges,
            "adjustments": adjustments,
            "total_amount": total_amount,
            "paid_amount": paid_amount,
            "due_amount": due_amount,
            "status": InvoiceStatus.PENDING,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await invoice_repo.create_invoice(db, invoice_doc)
        
        # Rebuild allocations for this customer to apply existing payments
        await rebuild_customer_invoices_from_payments(db, tenant_id, customer["id"])
        
        invoices_created += 1
        logger.debug(f"Created invoice {invoice_id} for customer {customer['id']}")
    
    return {
        "message": f"Generated {invoices_created} invoices for {month}/{year}",
        "created": invoices_created,
        "skipped": invoices_skipped
    }
