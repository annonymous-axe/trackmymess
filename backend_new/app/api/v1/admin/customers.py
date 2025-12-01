"""
Customer management endpoints for admins
All endpoints require admin auth and are tenant-scoped
"""
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict, Any
from datetime import datetime, timezone
import uuid
import logging

from app.db.mongo import get_db
from app.core.dependencies import require_admin, get_tenant_info
from app.models.customer import Customer, CustomerCreate, CustomerUpdate
from app.repositories import customers as customer_repo

logger = logging.getLogger(__name__)

router = APIRouter()


# Plan configuration (matching legacy)
PLAN_CONFIG = {
    "FREE_TRIAL": {"capacity": 50},
    "BASIC": {"capacity": 100},
    "STANDARD": {"capacity": 300},
    "PREMIUM": {"capacity": 999999},
    "ENTERPRISE": {"capacity": 999999}
}


@router.get("/customers", response_model=List[Customer])
async def list_customers(
    current_user: Dict[str, Any] = Depends(require_admin),
    tenant: Dict[str, Any] = Depends(get_tenant_info),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    List all customers for the current tenant
    
    Requires: ADMIN or SUPER_ADMIN role
    Returns: List of customers with meal plan names
    """
    customers = await customer_repo.list_customers(db, tenant["id"])
    return [Customer(**c) for c in customers]


@router.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(
    customer_id: str,
    current_user: Dict[str, Any] = Depends(require_admin),
    tenant: Dict[str, Any] = Depends(get_tenant_info),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get a specific customer by ID
    
    Requires: ADMIN or SUPER_ADMIN role
    Returns: Customer with meal plan name
    """
    customer = await customer_repo.get_customer_by_id(db, tenant["id"], customer_id)
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    return Customer(**customer)


@router.post("/customers", response_model=Customer, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_data: CustomerCreate,
    current_user: Dict[str, Any] = Depends(require_admin),
    tenant: Dict[str, Any] = Depends(get_tenant_info),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Create a new customer
    
    Requires: ADMIN or SUPER_ADMIN role
    Enforces: Tenant capacity limits
    Updates: Tenant customer_count and meal plan customer_count
    """
    tenant_id = tenant["id"]
    
    # Check capacity
    capacity = tenant.get("capacity")
    if capacity is None:
        plan_config = PLAN_CONFIG.get(tenant.get("subscription_plan"), {})
        capacity = plan_config.get("capacity", 0)
    
    # Atomic capacity check and increment
    updated = await db.tenants.update_one(
        {"id": tenant_id, "customer_count": {"$lt": capacity}},
        {"$inc": {"customer_count": 1}}
    )
    
    if updated.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tenant capacity limit reached ({capacity})"
        )
    
    # Verify meal plan exists and belongs to tenant
    meal_plan = await db.meal_plans.find_one(
        {"id": customer_data.meal_plan_id, "tenant_id": tenant_id},
        {"_id": 0}
    )
    
    if not meal_plan:
        # Rollback tenant count
        await db.tenants.update_one(
            {"id": tenant_id},
            {"$inc": {"customer_count": -1}}
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found"
        )
    
    # Create customer document
    customer_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    customer_doc = {
        "id": customer_id,
        "tenant_id": tenant_id,
        **customer_data.model_dump(),
        "joining_date": customer_data.joining_date.isoformat(),
        "is_active": True,
        "current_dues": 0,
        "created_at": now.isoformat()
    }
    
    try:
        created_customer = await customer_repo.create_customer(db, tenant_id, customer_doc)
    except Exception as e:
        # Rollback tenant count on error
        await db.tenants.update_one(
            {"id": tenant_id},
            {"$inc": {"customer_count": -1}}
        )
        logger.error(f"Error creating customer: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating customer"
        )
    
    # Increment meal plan customer count
    try:
        await db.meal_plans.update_one(
            {"id": customer_data.meal_plan_id},
            {"$inc": {"customer_count": 1}}
        )
    except Exception:
        pass
    
    return Customer(**created_customer)


@router.put("/customers/{customer_id}", response_model=Customer)
async def update_customer(
    customer_id: str,
    updates: CustomerUpdate,
    current_user: Dict[str, Any] = Depends(require_admin),
    tenant: Dict[str, Any] = Depends(get_tenant_info),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Update an existing customer
    
    Requires: ADMIN or SUPER_ADMIN role
    Enforces: Tenant-scoped access
    Updates: Meal plan customer_count if meal plan changed
    """
    tenant_id = tenant["id"]
    
    # Check customer exists
    existing_customer = await customer_repo.get_customer_by_id(db, tenant_id, customer_id)
    if not existing_customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Build update data (only non-None fields)
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    
    # If meal plan is changing, update counts
    if "meal_plan_id" in update_data and update_data["meal_plan_id"] != existing_customer["meal_plan_id"]:
        # Verify new meal plan exists
        new_meal_plan = await db.meal_plans.find_one(
            {"id": update_data["meal_plan_id"], "tenant_id": tenant_id}
        )
        if not new_meal_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meal plan not found"
            )
        
        # Decrement old meal plan count
        await db.meal_plans.update_one(
            {"id": existing_customer["meal_plan_id"]},
            {"$inc": {"customer_count": -1}}
        )
        
        # Increment new meal plan count
        await db.meal_plans.update_one(
            {"id": update_data["meal_plan_id"]},
            {"$inc": {"customer_count": 1}}
        )
    
    # Update customer
    updated_customer = await customer_repo.update_customer(
        db, tenant_id, customer_id, update_data
    )
    
    if not updated_customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    return Customer(**updated_customer)


@router.delete("/customers/{customer_id}")
async def delete_customer(
    customer_id: str,
    current_user: Dict[str, Any] = Depends(require_admin),
    tenant: Dict[str, Any] = Depends(get_tenant_info),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Delete a customer
    
    Requires: ADMIN or SUPER_ADMIN role
    Enforces: Tenant-scoped access
    Updates: Tenant customer_count and meal plan customer_count
    """
    tenant_id = tenant["id"]
    
    # Get customer before deleting (to get meal_plan_id)
    customer = await customer_repo.get_customer_by_id(db, tenant_id, customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Delete customer
    deleted = await customer_repo.delete_customer(db, tenant_id, customer_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Decrement tenant customer count
    await db.tenants.update_one(
        {"id": tenant_id},
        {"$inc": {"customer_count": -1}}
    )
    
    # Decrement meal plan customer count
    try:
        await db.meal_plans.update_one(
            {"id": customer["meal_plan_id"]},
            {"$inc": {"customer_count": -1}}
        )
    except Exception:
        pass
    
    return {"message": "Customer deleted successfully"}


@router.get("/customers/{customer_id}/detail")
async def get_customer_detail(
    customer_id: str,
    current_user: Dict[str, Any] = Depends(require_admin),
    tenant: Dict[str, Any] = Depends(get_tenant_info),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get detailed customer information including payments, invoices, and attendance
    
    Requires: ADMIN or SUPER_ADMIN role
    Returns: Customer + recent payments + invoices + attendance (last 30 days)
    """
    details = await customer_repo.get_customer_details(db, tenant["id"], customer_id)
    
    if not details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    return details
