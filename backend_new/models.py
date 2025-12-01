from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    STAFF = "STAFF"

class SubscriptionPlan(str, Enum):
    FREE_TRIAL = "FREE_TRIAL"
    BASIC = "BASIC"
    STANDARD = "STANDARD"
    PREMIUM = "PREMIUM"
    ENTERPRISE = "ENTERPRISE"

class TenantStatus(str, Enum):
    ACTIVE = "ACTIVE"
    TRIAL = "TRIAL"
    EXPIRED = "EXPIRED"
    SUSPENDED = "SUSPENDED"

class Gender(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"

class BillingType(str, Enum):
    PER_DAY = "PER_DAY"
    MONTHLY = "MONTHLY"

class PaymentMethod(str, Enum):
    RAZORPAY = "RAZORPAY"
    CASH = "CASH"
    UPI = "UPI"
    BANK_TRANSFER = "BANK_TRANSFER"

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class PauseRequestStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class StaffRole(str, Enum):
    MANAGER = "MANAGER"
    ATTENDANCE_OPERATOR = "ATTENDANCE_OPERATOR"
    ACCOUNTANT = "ACCOUNTANT"
    COOK = "COOK"
    HELPER = "HELPER"

class ReportType(str, Enum):
    CUSTOMERS_WITH_DUES = "CUSTOMERS_WITH_DUES"
    PAYMENT_HISTORY = "PAYMENT_HISTORY"
    ATTENDANCE_SUMMARY = "ATTENDANCE_SUMMARY"
    MEAL_CONSUMPTION = "MEAL_CONSUMPTION"
    STAFF_ATTENDANCE = "STAFF_ATTENDANCE"
    AGING_REPORT = "AGING_REPORT"
    REVENUE_REPORT = "REVENUE_REPORT"

# Staff Models
class StaffCreate(BaseModel):
    full_name: str
    gender: Gender
    mobile: str
    email: Optional[EmailStr] = None
    address: str
    role: StaffRole
    joining_date: datetime
    salary: float
    
    @field_validator('mobile')
    def validate_mobile(cls, v):
        if not v.isdigit() or len(v) != 10:
            raise ValueError('Mobile must be 10 digits')
        return v

class StaffUpdate(BaseModel):
    full_name: Optional[str] = None
    gender: Optional[Gender] = None
    mobile: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    role: Optional[StaffRole] = None
    salary: Optional[float] = None
    is_active: Optional[bool] = None

class Staff(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    tenant_id: str
    full_name: str
    gender: Gender
    mobile: str
    email: Optional[EmailStr] = None
    address: str
    role: StaffRole
    joining_date: datetime
    salary: float
    is_active: bool = True
    total_advances: float = 0
    total_paid: float = 0
    created_at: datetime

class StaffPayment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    tenant_id: str
    staff_id: str
    staff_name: str
    amount: float
    payment_type: str  # SALARY, ADVANCE, DEDUCTION
    notes: Optional[str] = None
    payment_date: datetime
    created_at: datetime

# Subscription Log
class SubscriptionLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    tenant_id: str
    previous_plan: Optional[SubscriptionPlan] = None
    new_plan: SubscriptionPlan
    amount: float
    payment_status: PaymentStatus
    notes: Optional[str] = None
    changed_at: datetime
