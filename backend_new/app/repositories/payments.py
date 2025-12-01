"""
Payment repository - Data access layer for payments
All queries are tenant-scoped for security
"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


async def list_payments(db: AsyncIOMotorDatabase, tenant_id: str) -> List[Dict[str, Any]]:
    """
    List all payments for a tenant
    
    Args:
        db: MongoDB database instance
        tenant_id: Tenant ID to filter by
        
    Returns:
        List of payment documents
    """
    payments = await db.payments.find(
        {"tenant_id": tenant_id},
        {"_id": 0}
    ).sort("payment_date", -1).to_list(10000)
    
    return payments


async def get_payment_by_id(
    db: AsyncIOMotorDatabase,
    tenant_id: str,
    payment_id: str
) -> Optional[Dict[str, Any]]:
    """
    Get a specific payment by ID (tenant-scoped)
    
    Args:
        db: MongoDB database instance
        tenant_id: Tenant ID to filter by
        payment_id: Payment ID
        
    Returns:
        Payment document or None if not found
    """
    payment = await db.payments.find_one(
        {"id": payment_id, "tenant_id": tenant_id},
        {"_id": 0}
    )
    
    return payment


async def create_payment(
    db: AsyncIOMotorDatabase,
    payment_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create a new payment
    
    Args:
        db: MongoDB database instance
        payment_data: Payment data dictionary
        
    Returns:
        Created payment document
    """
    await db.payments.insert_one(payment_data)
    return payment_data


async def update_payment(
    db: AsyncIOMotorDatabase,
    tenant_id: str,
    payment_id: str,
    update_data: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """
    Update an existing payment (tenant-scoped)
    
    Args:
        db: MongoDB database instance
        tenant_id: Tenant ID to filter by
        payment_id: Payment ID
        update_data: Fields to update
        
    Returns:
        Updated payment document or None if not found
    """
    if update_data:
        result = await db.payments.update_one(
            {"id": payment_id, "tenant_id": tenant_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            return None
    
    # Fetch and return updated payment
    updated_payment = await db.payments.find_one(
        {"id": payment_id, "tenant_id": tenant_id},
        {"_id": 0}
    )
    
    return updated_payment


async def delete_payment(
    db: AsyncIOMotorDatabase,
    tenant_id: str,
    payment_id: str
) -> bool:
    """
    Delete a payment (tenant-scoped)
    
    Args:
        db: MongoDB database instance
        tenant_id: Tenant ID to filter by
        payment_id: Payment ID
        
    Returns:
        True if deleted, False if not found
    """
    result = await db.payments.delete_one(
        {"id": payment_id, "tenant_id": tenant_id}
    )
    
    return result.deleted_count > 0
