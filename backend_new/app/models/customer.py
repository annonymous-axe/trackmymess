"""
Customer models and schemas
"""
from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.enums import Gender


class CustomerBase(BaseModel):
    """Base customer fields"""
    full_name: str
    gender: Gender
    mobile: str
    email: Optional[EmailStr] = None
    address: str
    meal_plan_id: str
    monthly_rate: float
    security_deposit: float = 0
    id_proof_type: Optional[str] = None
    id_proof_number: Optional[str] = None


class CustomerCreate(CustomerBase):
    """Schema for creating a new customer"""
    joining_date: datetime
    
    @field_validator('mobile')
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        if not v.isdigit() or len(v) != 10:
            raise ValueError('Mobile must be 10 digits')
        return v


class CustomerUpdate(BaseModel):
    """Schema for updating an existing customer"""
    full_name: Optional[str] = None
    gender: Optional[Gender] = None
    mobile: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    meal_plan_id: Optional[str] = None
    monthly_rate: Optional[float] = None
    security_deposit: Optional[float] = None
    is_active: Optional[bool] = None
    
    @field_validator('mobile')
    @classmethod
    def validate_mobile(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not v.isdigit() or len(v) != 10:
                raise ValueError('Mobile must be 10 digits')
        return v


class Customer(CustomerBase):
    """Full customer response model"""
    model_config = ConfigDict(extra="ignore")
    
    id: str
    tenant_id: str
    joining_date: datetime
    meal_plan_name: Optional[str] = None
    is_active: bool = True
    current_dues: float = 0
    created_at: datetime
