"""
Dashboard models and schemas
"""
from pydantic import BaseModel
from typing import List, Dict, Any
from app.models.payment import Payment


class AdminDashboard(BaseModel):
    """Admin dashboard response model"""
    total_customers: int
    capacity: int
    today_attendance: Dict[str, int]
    monthly_revenue: Dict[str, float]
    meals_served_month: int
    today_pause_requests: int
    recent_payments: List[Payment]
    recent_pause_requests: List[Dict[str, Any]]
    upcoming_payments: List[Dict[str, Any]] = []
