"""
Invoice repository - Data access layer for invoices
All queries are tenant-scoped for security
"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)


async def list_invoices(db: AsyncIOMotorDatabase, tenant_id: str) -> List[Dict[str, Any]]:
    """
    List all invoices for a tenant
    
    Args:
        db: MongoDB database instance
        tenant_id: Tenant ID to filter by
        
    Returns:
        List of invoice documents
    """
    invoices = await db.invoices.find(
        {"tenant_id": tenant_id},
        {"_id": 0}
    ).sort("generated_at", -1).to_list(10000)
    
    return invoices


async def get_invoice_by_id(
    db: AsyncIOMotorDatabase,
    tenant_id: str,
    invoice_id: str
) -> Optional[Dict[str, Any]]:
    """
    Get a specific invoice by ID (tenant-scoped)
    
    Args:
        db: MongoDB database instance
        tenant_id: Tenant ID to filter by
        invoice_id: Invoice ID
        
    Returns:
        Invoice document or None if not found
    """
    invoice = await db.invoices.find_one(
        {"id": invoice_id, "tenant_id": tenant_id},
        {"_id": 0}
    )
    
    return invoice


async def create_invoice(
    db: AsyncIOMotorDatabase,
    invoice_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create a new invoice
    
    Args:
        db: MongoDB database instance
        invoice_data: Invoice data dictionary
        
    Returns:
        Created invoice document
    """
    await db.invoices.insert_one(invoice_data)
    return invoice_data


async def check_invoice_exists(
    db: AsyncIOMotorDatabase,
    tenant_id: str,
    customer_id: str,
    month: int,
    year: int
) -> bool:
    """
    Check if an invoice already exists for customer/month/year
    
    Args:
        db: MongoDB database instance
        tenant_id: Tenant ID
        customer_id: Customer ID
        month: Invoice month
        year: Invoice year
        
    Returns:
        True if invoice exists, False otherwise
    """
    existing = await db.invoices.find_one({
        "tenant_id": tenant_id,
        "customer_id": customer_id,
        "month": month,
        "year": year
    })
    
    return existing is not None
