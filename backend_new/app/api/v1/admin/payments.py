"""
Payment management endpoints for admins
All endpoints require admin auth and are tenant-scoped
Implements FIFO payment allocation to invoices
"""
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict, Any
from datetime import datetime, timezone
import uuid
import logging

from app.db.mongo import get_db
from app.core.dependencies import require_admin, get_tenant_info
from app.models.payment import Payment, PaymentCreate, PaymentUpdate
from app.models.enums import PaymentStatus, PaymentMethod
from app.repositories import payments as payment_repo
from app.services.payment_allocation import (
    apply_payment_to_invoices,
    rebuild_customer_invoices_from_payments
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/payments", response_model=List[Payment])
async def list_payments(
    current_user: Dict[str, Any] = Depends(require_admin),
    tenant: Dict[str, Any] = Depends(get_tenant_info),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    List all payments for the current tenant
    
    Requires: ADMIN or SUPER_ADMIN role
    Returns: List of payments sorted by payment_date (newest first)
    """
    payments = await payment_repo.list_payments(db, tenant["id"])
    return [Payment(**p) for p in payments]


@router.get("/payments/{payment_id}", response_model=Payment)
async def get_payment(
    payment_id: str,
    current_user: Dict[str, Any] = Depends(require_admin),
    tenant: Dict[str, Any] = Depends(get_tenant_info),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get a specific payment by ID
    
    Requires: ADMIN or SUPER_ADMIN role
    Returns: Payment details
    """
    payment = await payment_repo.get_payment_by_id(db, tenant["id"], payment_id)
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    return Payment(**payment)


@router.post("/payments", response_model=Payment, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment_data: PaymentCreate,
    current_user: Dict[str, Any] = Depends(require_admin),
    tenant: Dict[str, Any] = Depends(get_tenant_info),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Record a new payment
    
    Requires: ADMIN or SUPER_ADMIN role
    Business Logic:
    - If payment_status is COMPLETED, applies payment to invoices using FIFO
    - Updates customer.current_dues after allocation
    """
    tenant_id = tenant["id"]
    
    # Verify customer exists and belongs to tenant
    customer = await db.customers.find_one(
        {"id": payment_data.customer_id, "tenant_id": tenant_id},
        {"_id": 0}
    )
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Create payment document
    payment_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    payment_doc = {
        "id": payment_id,
        "tenant_id": tenant_id,
        "customer_id": payment_data.customer_id,
        "customer_name": customer.get("full_name"),
        "amount": payment_data.amount,
        "payment_method": payment_data.payment_method,
        "payment_status": PaymentStatus.COMPLETED,  # Default to COMPLETED
        "transaction_id": payment_data.transaction_id,
        "razorpay_order_id": None,
        "razorpay_payment_id": None,
        "notes": payment_data.notes,
        "payment_date": now.isoformat(),
        "created_at": now.isoformat()
    }
    
    created_payment = await payment_repo.create_payment(db, payment_doc)
    
    # Apply FIFO allocation if payment is COMPLETED
    if payment_doc["payment_status"] == PaymentStatus.COMPLETED:
        new_dues = await apply_payment_to_invoices(
            db, tenant_id, payment_data.customer_id, payment_data.amount, payment_id
        )
        
        # Update customer dues
        await db.customers.update_one(
            {"id": payment_data.customer_id},
            {"$set": {"current_dues": new_dues}}
        )
        
        logger.info(
            f"Payment {payment_id} created and applied. "
            f"Amount: {payment_data.amount}, New dues: {new_dues}"
        )
    
    return Payment(**created_payment)


@router.put("/payments/{payment_id}", response_model=Payment)
async def update_payment(
    payment_id: str,
    updates: PaymentUpdate,
    current_user: Dict[str, Any] = Depends(require_admin),
    tenant: Dict[str, Any] = Depends(get_tenant_info),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Update an existing payment
    
    Requires: ADMIN or SUPER_ADMIN role
    Business Logic:
    - If amount or customer changes for a COMPLETED payment, rebuilds allocations
    """
    tenant_id = tenant["id"]
    
    # Check payment exists
    existing_payment = await payment_repo.get_payment_by_id(db, tenant_id, payment_id)
    if not existing_payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Build update data
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    
    # Determine if we need to rebuild allocations
    old_customer_id = existing_payment.get("customer_id")
    old_status = existing_payment.get("payment_status")
    needs_rebuild = (
        ("amount" in update_data or "customer_id" in update_data)
        and old_status == PaymentStatus.COMPLETED
        and old_customer_id
    )
    
    # Update payment
    updated_payment = await payment_repo.update_payment(
        db, tenant_id, payment_id, update_data
    )
    
    if not updated_payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Rebuild allocations if needed
    if needs_rebuild:
        await rebuild_customer_invoices_from_payments(db, tenant_id, old_customer_id)
        logger.info(f"Rebuilt allocations for customer {old_customer_id} after payment update")
    
    return Payment(**updated_payment)


@router.delete("/payments/{payment_id}")
async def delete_payment(
    payment_id: str,
    current_user: Dict[str, Any] = Depends(require_admin),
    tenant: Dict[str, Any] = Depends(get_tenant_info),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Delete a payment
    
    Requires: ADMIN or SUPER_ADMIN role
    Business Logic:
    - If payment was COMPLETED, rebuilds allocations for the customer
    """
    tenant_id = tenant["id"]
    
    # Get payment before deleting
    payment = await payment_repo.get_payment_by_id(db, tenant_id, payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Delete payment
    deleted = await payment_repo.delete_payment(db, tenant_id, payment_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Rebuild allocations if payment was COMPLETED
    customer_id = payment.get("customer_id")
    if customer_id and payment.get("payment_status") == PaymentStatus.COMPLETED:
        await rebuild_customer_invoices_from_payments(db, tenant_id, customer_id)
        logger.info(f"Rebuilt allocations for customer {customer_id} after payment deletion")
    
    return {"message": "Payment deleted successfully"}
