"""
Dashboard service - Calculate metrics from FIFO-accurate data
"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Any, List
from datetime import datetime, timezone, timedelta
from app.models.enums import PaymentStatus
import logging

logger = logging.getLogger(__name__)


async def calculate_admin_dashboard_metrics(
    db: AsyncIOMotorDatabase,
    tenant_id: str,
    tenant_capacity: int
) -> Dict[str, Any]:
    """
    Calculate all dashboard metrics for an admin tenant
    
    Uses FIFO-accurate data:
    - Monthly revenue from COMPLETED payments
    - Pending from invoice due_amounts (FIFO source of truth)
    - Recent payments sorted by date
    - Upcoming payments from unpaid invoices
    
    Args:
        db: MongoDB database instance
        tenant_id: Tenant ID
        tenant_capacity: Tenant capacity from tenant document
        
    Returns:
        Dictionary with all dashboard metrics
    """
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    current_month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Total active customers
    customers = await db.customers.find(
        {"tenant_id": tenant_id, "is_active": True},
        {"_id": 0}
    ).to_list(10000)
    total_customers = len(customers)
    
    # Today's attendance
    attendance_records = await db.attendance.find({
        "tenant_id": tenant_id,
        "date": {
            "$gte": today.isoformat(),
            "$lt": (today + timedelta(days=1)).isoformat()
        }
    }, {"_id": 0}).to_list(10000)
    
    present = len(set(
        a["customer_id"] for a in attendance_records
        if a.get("breakfast") or a.get("lunch") or a.get("dinner")
    ))
    absent = total_customers - present
    
    # Monthly revenue (COMPLETED payments this month)
    payments = await db.payments.find({
        "tenant_id": tenant_id,
        "payment_date": {"$gte": current_month_start.isoformat()},
        "payment_status": PaymentStatus.COMPLETED
    }, {"_id": 0}).to_list(10000)
    collected = sum(p["amount"] for p in payments)
    
    # Total pending (from invoices - FIFO source of truth)
    invoices = await db.invoices.find({
        "tenant_id": tenant_id,
        "month": current_month_start.month,
        "year": current_month_start.year
    }, {"_id": 0}).to_list(10000)
    total_due = sum(inv.get("due_amount", 0) for inv in invoices)
    
    # Meals served this month
    month_attendance = await db.attendance.find({
        "tenant_id": tenant_id,
        "date": {"$gte": current_month_start.isoformat()}
    }, {"_id": 0}).to_list(10000)
    meals_served = sum(
        (1 if a.get("breakfast") else 0) +
        (1 if a.get("lunch") else 0) +
        (1 if a.get("dinner") else 0)
        for a in month_attendance
    )
    
    # Today's pause requests
    pause_requests_today = await db.pause_requests.find({
        "tenant_id": tenant_id,
        "status": "PENDING",
        "created_at": {"$gte": today.isoformat()}
    }, {"_id": 0}).to_list(10000)
    
    # Recent payments (last 5 completed)
    recent_payments_docs = await db.payments.find(
        {"tenant_id": tenant_id, "payment_status": PaymentStatus.COMPLETED},
        {"_id": 0}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    # Recent pause requests (last 5)
    recent_pause_docs = await db.pause_requests.find(
        {"tenant_id": tenant_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    # Upcoming/pending payments (from unpaid invoices)
    invoice_docs = await db.invoices.find(
        {"tenant_id": tenant_id, "due_amount": {"$gt": 0}},
        {"_id": 0}
    ).to_list(500)
    
    now = datetime.now(timezone.utc)
    payment_list = []
    for inv in invoice_docs:
        due_date_str = inv.get("due_date") or inv.get("generated_at")
        if not due_date_str:
            continue
        
        try:
            due_date = datetime.fromisoformat(due_date_str.replace("Z", "+00:00"))
        except Exception:
            continue
        
        payment_list.append({
            "id": inv.get("id"),
            "customer_name": inv.get("customer_name", ""),
            "due_date": due_date.isoformat(),
            "amount": inv.get("due_amount", 0),
            "is_pending": due_date < now
        })
    
    # Sort by due_date (oldest first)
    payment_list.sort(key=lambda x: x["due_date"])
    
    # Split into pending & upcoming, pick 5 each
    pending = [p for p in payment_list if p["is_pending"]][:5]
    upcoming = [p for p in payment_list if not p["is_pending"]][:5]
    upcoming_payments = pending + upcoming
    
    return {
        "total_customers": total_customers,
        "capacity": tenant_capacity,
        "today_attendance": {"present": present, "absent": absent},
        "monthly_revenue": {"collected": collected, "pending": total_due},
        "meals_served_month": meals_served,
        "today_pause_requests": len(pause_requests_today),
        "recent_payments": recent_payments_docs,
        "recent_pause_requests": recent_pause_docs,
        "upcoming_payments": upcoming_payments
    }
