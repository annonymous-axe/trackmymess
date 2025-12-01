"""
Payment and Invoice models/schemas
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.enums import PaymentMethod, PaymentStatus, InvoiceStatus


# Payment Models
class PaymentBase(BaseModel):
    """Base payment fields"""
    customer_id: str
    amount: float
    payment_method: PaymentMethod
    transaction_id: Optional[str] = None
    notes: Optional[str] = None


class PaymentCreate(PaymentBase):
    """Schema for creating a new payment"""
    pass


class PaymentUpdate(BaseModel):
    """Schema for updating an existing payment"""
    amount: Optional[float] = None
    payment_method: Optional[PaymentMethod] = None
    transaction_id: Optional[str] = None
    notes: Optional[str] = None
    payment_status: Optional[PaymentStatus] = None


class Payment(PaymentBase):
    """Full payment response model"""
    model_config = ConfigDict(extra="ignore")
    
    id: str
    tenant_id: str
    customer_name: Optional[str] = None
    payment_status: PaymentStatus
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    payment_date: datetime
    created_at: datetime


# Invoice Models
class Invoice(BaseModel):
    """Full invoice response model"""
    model_config = ConfigDict(extra="ignore")
    
    id: str
    tenant_id: str
    customer_id: str
    customer_name: Optional[str] = None
    invoice_number: str
    month: int
    year: int
    total_days: int
    present_days: int
    pause_days: int
    meal_charges: float
    adjustments: float = 0
    total_amount: float
    paid_amount: float = 0
    due_amount: float
    status: InvoiceStatus = InvoiceStatus.PENDING
    generated_at: datetime


class InvoiceGenerateRequest(BaseModel):
    """Request for generating monthly invoices"""
    month: int
    year: int
