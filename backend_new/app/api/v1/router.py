"""
Main v1 API router
Aggregates all v1 sub-routers
"""
from fastapi import APIRouter
from app.api.v1 import system
from app.api.v1.auth import me
from app.api.v1.admin import customers, payments, invoices, dashboard, reports

# Create main v1 router
router = APIRouter()

# Include system routes (health, version, etc.)
router.include_router(system.router, tags=["system"])

# Include auth routes
router.include_router(me.router, prefix="/auth", tags=["auth"])

# Include admin routes
router.include_router(customers.router, prefix="/admin", tags=["customers"])
router.include_router(payments.router, prefix="/admin", tags=["payments"])
router.include_router(invoices.router, prefix="/admin", tags=["invoices"])
router.include_router(dashboard.router, prefix="/admin", tags=["dashboard"])
router.include_router(reports.router, prefix="/admin", tags=["reports"])

# Future routers will be added here:
# router.include_router(meal_plans.router, prefix="/admin", tags=["meal_plans"])
# etc.
