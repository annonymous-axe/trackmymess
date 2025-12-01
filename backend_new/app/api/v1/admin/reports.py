"""
Reports endpoints for admins
Provides detailed reports and analytics
"""
from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Any, List
from datetime import datetime, timezone, timedelta
import logging

from app.db.mongo import get_db
from app.core.dependencies import require_admin, get_tenant_info
from app.models.enums import PaymentStatus

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/reports/collections")
async def get_collections_report(
    days: int = Query(default=30, description="Number of days to include"),
    current_user: Dict[str, Any] = Depends(require_admin),
    tenant: Dict[str, Any] = Depends(get_tenant_info),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get payment collections report
    
    Requires: ADMIN or SUPER_ADMIN role
    Returns: Daily/aggregate collection data from COMPLETED payments
    
    Args:
        days: Number of days to include in report (default 30)
    """
    tenant_id = tenant["id"]
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Get all COMPLETED payments in the time range
    payments = await db.payments.find({
        "tenant_id": tenant_id,
        "payment_status": PaymentStatus.COMPLETED,
        "payment_date": {"$gte": start_date.isoformat()}
    }, {"_id": 0}).sort("payment_date", 1).to_list(10000)
    
    # Group by date
    daily_collections: Dict[str, float] = {}
    for payment in payments:
        try:
            payment_date = datetime.fromisoformat(payment["payment_date"].replace("Z", "+00:00"))
            date_key = payment_date.strftime("%Y-%m-%d")
            daily_collections[date_key] = daily_collections.get(date_key, 0) + payment["amount"]
        except Exception:
            continue
    
    # Calculate totals
    total_collected = sum(daily_collections.values())
    total_transactions = len(payments)
    average_per_day = total_collected / max(days, 1)
    
    # Format as list for frontend charts
    collections_list = [
        {"date": date, "amount": amount}
        for date, amount in sorted(daily_collections.items())
    ]
    
    return {
        "period_start": start_date.isoformat(),
        "period_end": datetime.now(timezone.utc).isoformat(),
        "days": days,
        "total_collected": total_collected,
        "total_transactions": total_transactions,
        "average_per_day": average_per_day,
        "daily_collections": collections_list
    }


@router.get("/reports/customers-with-dues")
async def get_customers_with_dues(
    current_user: Dict[str, Any] = Depends(require_admin),
    tenant: Dict[str, Any] = Depends(get_tenant_info),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get list of customers with outstanding dues
    
    Requires: ADMIN or SUPER_ADMIN role
    Returns: Active customers with dues > 0 (from FIFO-calculated current_dues)
    """
    customers = await db.customers.find({
        "tenant_id": tenant["id"],
        "is_active": True,
        "current_dues": {"$gt": 0}
    }, {"_id": 0}).to_list(1000)
    
    # Sort by dues (highest first)
    customers.sort(key=lambda c: c.get("current_dues", 0), reverse=True)
    
    total_outstanding = sum(c.get("current_dues", 0) for c in customers)
    
    return {
        "total_customers_with_dues": len(customers),
        "total_outstanding_amount": total_outstanding,
        "customers": customers
    }


@router.get("/reports/aging")
async def get_aging_report(
    current_user: Dict[str, Any] = Depends(require_admin),
    tenant: Dict[str, Any] = Depends(get_tenant_info),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get aging report for outstanding invoices
    
    Requires: ADMIN or SUPER_ADMIN role
    Returns: Invoices grouped by age buckets (0-30, 31-60, 61-90, 90+ days)
    
    Uses invoice due_amounts (FIFO source of truth)
    """
    tenant_id = tenant["id"]
    
    # Get all unpaid/partially paid invoices
    invoices = await db.invoices.find({
        "tenant_id": tenant_id,
        "due_amount": {"$gt": 0}
    }, {"_id": 0}).to_list(1000)
    
    now = datetime.now(timezone.utc)
    aging_data = {"0-30": [], "31-60": [], "61-90": [], "90+": []}
    
    for invoice in invoices:
        try:
            generated_at = datetime.fromisoformat(invoice["generated_at"].replace("Z", "+00:00"))
            days_old = (now - generated_at).days
        except Exception:
            continue
        
        # Get customer details
        customer = await db.customers.find_one(
            {"id": invoice["customer_id"]},
            {"_id": 0}
        )
        
        invoice_data = {
            "invoice_id": invoice["id"],
            "invoice_number": invoice.get("invoice_number", ""),
            "customer_id": invoice["customer_id"],
            "customer_name": invoice.get("customer_name", ""),
            "customer_mobile": customer.get("mobile", "") if customer else "",
            "invoice_number": invoice.get("invoice_number", ""),
            "due_amount": invoice.get("due_amount", 0),
            "days_old": days_old,
            "generated_at": invoice["generated_at"]
        }
        
        if days_old <= 30:
            aging_data["0-30"].append(invoice_data)
        elif days_old <= 60:
            aging_data["31-60"].append(invoice_data)
        elif days_old <= 90:
            aging_data["61-90"].append(invoice_data)
        else:
            aging_data["90+"].append(invoice_data)
    
    # Calculate totals per bucket
    totals = {
        bucket: sum(inv["due_amount"] for inv in invoices)
        for bucket, invoices in aging_data.items()
    }
    
    return {
        "aging_buckets": aging_data,
        "totals_by_bucket": totals,
        "grand_total": sum(totals.values())
    }


@router.get("/reports/revenue-trend")
async def get_revenue_trend(
    months: int = Query(default=6, description="Number of months to include"),
    current_user: Dict[str, Any] = Depends(require_admin),
    tenant: Dict[str, Any] = Depends(get_tenant_info),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get monthly revenue trend
    
    Requires: ADMIN or SUPER_ADMIN role
    Returns: Monthly collected amounts for trend charts
    
    Args:
        months: Number of months to include (default 6)
    """
    tenant_id = tenant["id"]
    
    # Calculate start date (beginning of month N months ago)
    now = datetime.now(timezone.utc)
    start_date = (now.replace(day=1) - timedelta(days=30 * months)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Get all COMPLETED payments in the time range
    payments = await db.payments.find({
        "tenant_id": tenant_id,
        "payment_status": PaymentStatus.COMPLETED,
        "payment_date": {"$gte": start_date.isoformat()}
    }, {"_id": 0}).to_list(10000)
    
    # Group by month
    monthly_revenue: Dict[str, float] = {}
    for payment in payments:
        try:
            payment_date = datetime.fromisoformat(payment["payment_date"].replace("Z", "+00:00"))
            month_key = payment_date.strftime("%Y-%m")
            monthly_revenue[month_key] = monthly_revenue.get(month_key, 0) + payment["amount"]
        except Exception:
            continue
    
    # Format as list
    revenue_list = [
        {"month": month, "revenue": amount}
        for month, amount in sorted(monthly_revenue.items())
    ]
    
    return {
        "period_start": start_date.isoformat(),
        "period_end": now.isoformat(),
        "months": months,
        "monthly_revenue": revenue_list,
        "total_revenue": sum(monthly_revenue.values())
    }
