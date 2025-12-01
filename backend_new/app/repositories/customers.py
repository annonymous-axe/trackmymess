"""
Customer repository - Data access layer for customers
All queries are tenant-scoped for security
"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


async def list_customers(db: AsyncIOMotorDatabase, tenant_id: str) -> List[Dict[str, Any]]:
    """
    List all customers for a tenant
    
    Args:
        db: MongoDB database instance
        tenant_id: Tenant ID to filter by
        
    Returns:
        List of customer documents
    """
    customers = await db.customers.find(
        {"tenant_id": tenant_id},
        {"_id": 0}
    ).to_list(10000)
    
    # Enrich with meal plan names
    for customer in customers:
        meal_plan = await db.meal_plans.find_one(
            {"id": customer["meal_plan_id"]},
            {"_id": 0}
        )
        if meal_plan:
            customer["meal_plan_name"] = meal_plan["name"]
    
    return customers


async def get_customer_by_id(
    db: AsyncIOMotorDatabase,
    tenant_id: str,
    customer_id: str
) -> Optional[Dict[str, Any]]:
    """
    Get a specific customer by ID (tenant-scoped)
    
    Args:
        db: MongoDB database instance
        tenant_id: Tenant ID to filter by
        customer_id: Customer ID
        
    Returns:
        Customer document or None if not found
    """
    customer = await db.customers.find_one(
        {"id": customer_id, "tenant_id": tenant_id},
        {"_id": 0}
    )
    
    if customer:
        # Enrich with meal plan name
        meal_plan = await db.meal_plans.find_one(
            {"id": customer["meal_plan_id"]},
            {"_id": 0}
        )
        if meal_plan:
            customer["meal_plan_name"] = meal_plan["name"]
    
    return customer


async def create_customer(
    db: AsyncIOMotorDatabase,
    tenant_id: str,
    customer_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create a new customer
    
    Args:
        db: MongoDB database instance
        tenant_id: Tenant ID
        customer_data: Customer data dictionary
        
    Returns:
        Created customer document
    """
    await db.customers.insert_one(customer_data)
    
    # Enrich with meal plan name for response
    meal_plan = await db.meal_plans.find_one(
        {"id": customer_data["meal_plan_id"]},
        {"_id": 0}
    )
    if meal_plan:
        customer_data["meal_plan_name"] = meal_plan["name"]
    
    return customer_data


async def update_customer(
    db: AsyncIOMotorDatabase,
    tenant_id: str,
    customer_id: str,
    update_data: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """
    Update an existing customer (tenant-scoped)
    
    Args:
        db: MongoDB database instance
        tenant_id: Tenant ID to filter by
        customer_id: Customer ID
        update_data: Fields to update
        
    Returns:
        Updated customer document or None if not found
    """
    if update_data:
        result = await db.customers.update_one(
            {"id": customer_id, "tenant_id": tenant_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            return None
    
    # Fetch and return updated customer
    updated_customer = await db.customers.find_one(
        {"id": customer_id, "tenant_id": tenant_id},
        {"_id": 0}
    )
    
    if updated_customer:
        # Enrich with meal plan name
        meal_plan = await db.meal_plans.find_one(
            {"id": updated_customer["meal_plan_id"]},
            {"_id": 0}
        )
        if meal_plan:
            updated_customer["meal_plan_name"] = meal_plan["name"]
    
    return updated_customer


async def delete_customer(
    db: AsyncIOMotorDatabase,
    tenant_id: str,
    customer_id: str
) -> bool:
    """
    Delete a customer (tenant-scoped)
    
    Args:
        db: MongoDB database instance
        tenant_id: Tenant ID to filter by
        customer_id: Customer ID
        
    Returns:
        True if deleted, False if not found
    """
    result = await db.customers.delete_one(
        {"id": customer_id, "tenant_id": tenant_id}
    )
    
    return result.deleted_count > 0


async def get_customer_details(
    db: AsyncIOMotorDatabase,
    tenant_id: str,
    customer_id: str
) -> Optional[Dict[str, Any]]:
    """
    Get detailed customer information including payments, invoices, and attendance
    
    Args:
        db: MongoDB database instance
        tenant_id: Tenant ID to filter by
        customer_id: Customer ID
        
    Returns:
        Dictionary with customer, payments, invoices, and attendance records
    """
    from datetime import datetime, timezone, timedelta
    
    # Get customer
    customer = await db.customers.find_one(
        {"id": customer_id, "tenant_id": tenant_id},
        {"_id": 0}
    )
    
    if not customer:
        return None
    
    # Get recent payments
    payments = await db.payments.find(
        {"customer_id": customer_id, "tenant_id": tenant_id},
        {"_id": 0}
    ).sort("payment_date", -1).limit(100).to_list(100)
    
    # Get invoices
    invoices = await db.invoices.find(
        {"customer_id": customer_id, "tenant_id": tenant_id},
        {"_id": 0}
    ).sort("generated_at", -1).limit(100).to_list(100)
    
    # Get recent attendance (last 30 days)
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    attendance = await db.attendance.find(
        {
            "customer_id": customer_id,
            "tenant_id": tenant_id,
            "date": {"$gte": thirty_days_ago.isoformat()}
        },
        {"_id": 0}
    ).to_list(1000)
    
    return {
        "customer": customer,
        "payments": payments,
        "invoices": invoices,
        "attendance_records": attendance
    }
