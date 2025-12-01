"""
Dashboard endpoints for admins
Provides metrics and overview data
"""
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Any
import logging

from app.db.mongo import get_db
from app.core.dependencies import require_admin, get_tenant_info
from app.models.dashboard import AdminDashboard
from app.models.payment import Payment
from app.services.dashboard import calculate_admin_dashboard_metrics

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/dashboard", response_model=AdminDashboard)
async def get_admin_dashboard(
    current_user: Dict[str, Any] = Depends(require_admin),
    tenant: Dict[str, Any] = Depends(get_tenant_info),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get admin dashboard metrics
    
    Requires: ADMIN or SUPER_ADMIN role
    Returns: Comprehensive dashboard data with FIFO-accurate metrics
    
    Metrics include:
    - Total active customers
    - Today's attendance (present/absent)
    - Monthly revenue (collected from COMPLETED payments)
    - Pending dues (from invoice due_amounts - FIFO source of truth)
    - Meals served this month
    - Today's pause requests
    - Recent payments (last 5)
    - Recent pause requests (last 5)
    - Upcoming/overdue payments (from unpaid invoices)
    """
    metrics = await calculate_admin_dashboard_metrics(
        db, tenant["id"], tenant.get("capacity", 0)
    )
    
    # Convert recent payments to Payment models
    recent_payments = [Payment(**p) for p in metrics["recent_payments"]]
    
    return AdminDashboard(
        total_customers=metrics["total_customers"],
        capacity=metrics["capacity"],
        today_attendance=metrics["today_attendance"],
        monthly_revenue=metrics["monthly_revenue"],
        meals_served_month=metrics["meals_served_month"],
        today_pause_requests=metrics["today_pause_requests"],
        recent_payments=recent_payments,
        recent_pause_requests=metrics["recent_pause_requests"],
        upcoming_payments=metrics["upcoming_payments"]
    )
