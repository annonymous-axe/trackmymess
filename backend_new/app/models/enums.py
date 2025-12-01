"""
Shared enums used across the application
Copied from legacy server.py for consistency
"""
from enum import Enum


class UserRole(str, Enum):
    """User roles in the system"""
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    STAFF = "STAFF"


class TenantStatus(str, Enum):
    """Tenant subscription status"""
    ACTIVE = "ACTIVE"
    TRIAL = "TRIAL"
    EXPIRED = "EXPIRED"
    SUSPENDED = "SUSPENDED"


class PaymentMethod(str, Enum):
    """Payment methods"""
    RAZORPAY = "RAZORPAY"
    CASH = "CASH"
    UPI = "UPI"
    BANK_TRANSFER = "BANK_TRANSFER"


class PaymentStatus(str, Enum):
    """Payment status"""
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class InvoiceStatus(str, Enum):
    """Invoice payment status"""
    PENDING = "PENDING"
    PARTIALLY_PAID = "PARTIALLY_PAID"
    PAID = "PAID"


class Gender(str, Enum):
    """Customer gender options"""
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"
