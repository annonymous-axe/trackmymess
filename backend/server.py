from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from enum import Enum
import razorpay
from collections import defaultdict


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production')
JWT_ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 30

# Razorpay Configuration
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_demo')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', 'demo_secret')
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# Create the main app
app = FastAPI(title="TrackMyMess API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

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

# Plan Configuration
PLAN_CONFIG = {
    SubscriptionPlan.FREE_TRIAL: {
        "name": "Free Trial",
        "price": 0,
        "capacity": 50,
        "allow_downloads": False,
        "trial_days": 14
    },
    SubscriptionPlan.BASIC: {
        "name": "Basic",
        "price": 500,
        "capacity": 100,
        "allow_downloads": True
    },
    SubscriptionPlan.STANDARD: {
        "name": "Standard",
        "price": 1000,
        "capacity": 300,
        "allow_downloads": True
    },
    SubscriptionPlan.PREMIUM: {
        "name": "Premium",
        "price": 2000,
        "capacity": 999999,
        "allow_downloads": True
    },
    SubscriptionPlan.ENTERPRISE: {
        "name": "Enterprise",
        "price": 0,  # Custom pricing
        "capacity": 999999,
        "allow_downloads": True
    }
}

# Auth Models
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class RefreshTokenRequest(BaseModel):
    refresh_token: str

# User Models
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    role: UserRole
    tenant_id: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    created_at: datetime
    is_active: bool = True

# Tenant/Client Models
class TenantCreate(BaseModel):
    mess_name: str
    owner_name: str
    email: EmailStr
    mobile: str
    address: str
    capacity: int
    subscription_plan: SubscriptionPlan
    username: str
    password: str
    
    @field_validator('mobile')
    def validate_mobile(cls, v):
        if not v.isdigit() or len(v) != 10:
            raise ValueError('Mobile must be 10 digits')
        return v
    
    @field_validator('username')
    def validate_username(cls, v):
        if len(v) < 6 or len(v) > 20:
            raise ValueError('Username must be 6-20 characters')
        if not v.isalnum():
            raise ValueError('Username must be alphanumeric')
        return v

class TenantUpdate(BaseModel):
    mess_name: Optional[str] = None
    owner_name: Optional[str] = None
    mobile: Optional[str] = None
    address: Optional[str] = None
    capacity: Optional[int] = None
    subscription_plan: Optional[SubscriptionPlan] = None
    status: Optional[TenantStatus] = None

class Tenant(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    mess_name: str
    owner_name: str
    email: EmailStr
    mobile: str
    address: str
    capacity: int
    subscription_plan: SubscriptionPlan
    status: TenantStatus
    subscription_start: datetime
    subscription_end: datetime
    customer_count: int = 0
    created_at: datetime

# Customer Models
class CustomerCreate(BaseModel):
    full_name: str
    gender: Gender
    mobile: str
    email: Optional[EmailStr] = None
    address: str
    emergency_contact: str
    joining_date: datetime
    meal_plan_id: str
    monthly_rate: float
    security_deposit: float = 0
    id_proof_type: Optional[str] = None
    id_proof_number: Optional[str] = None
    
    @field_validator('mobile', 'emergency_contact')
    def validate_mobile(cls, v):
        if not v.isdigit() or len(v) != 10:
            raise ValueError('Mobile must be 10 digits')
        return v

class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    gender: Optional[Gender] = None
    mobile: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    meal_plan_id: Optional[str] = None
    monthly_rate: Optional[float] = None
    security_deposit: Optional[float] = None
    is_active: Optional[bool] = None

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    tenant_id: str
    full_name: str
    gender: Gender
    mobile: str
    email: Optional[EmailStr] = None
    address: str
    emergency_contact: str
    joining_date: datetime
    meal_plan_id: str
    meal_plan_name: Optional[str] = None
    monthly_rate: float
    security_deposit: float
    id_proof_type: Optional[str] = None
    id_proof_number: Optional[str] = None
    is_active: bool = True
    current_dues: float = 0
    created_at: datetime

# Meal Plan Models
class MealPlanCreate(BaseModel):
    name: str
    description: str
    meals_included: List[str]
    billing_type: BillingType
    rate: float
    is_active: bool = True

class MealPlan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    tenant_id: str
    name: str
    description: str
    meals_included: List[str]
    billing_type: BillingType
    rate: float
    is_active: bool
    is_default: bool = False
    customer_count: int = 0
    created_at: datetime

# Attendance Models
class AttendanceRecord(BaseModel):
    customer_id: str
    breakfast: bool = False
    lunch: bool = False
    dinner: bool = False

class AttendanceCreate(BaseModel):
    date: datetime
    records: List[AttendanceRecord]

class Attendance(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    tenant_id: str
    date: datetime
    customer_id: str
    customer_name: Optional[str] = None
    breakfast: bool
    lunch: bool
    dinner: bool
    created_at: datetime

# Pause Request Models
class PauseRequestCreate(BaseModel):
    customer_id: str
    start_date: datetime
    end_date: datetime
    reason: str

class PauseRequestUpdate(BaseModel):
    status: PauseRequestStatus
    admin_notes: Optional[str] = None

class PauseRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    tenant_id: str
    customer_id: str
    customer_name: Optional[str] = None
    start_date: datetime
    end_date: datetime
    reason: str
    status: PauseRequestStatus
    admin_notes: Optional[str] = None
    created_at: datetime

# Payment Models
class PaymentCreate(BaseModel):
    customer_id: str
    amount: float
    payment_method: PaymentMethod
    transaction_id: Optional[str] = None
    notes: Optional[str] = None

class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    tenant_id: str
    customer_id: str
    customer_name: Optional[str] = None
    amount: float
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    transaction_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    notes: Optional[str] = None
    payment_date: datetime
    created_at: datetime

# Invoice Models
class Invoice(BaseModel):
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
    generated_at: datetime

# Dashboard Models
class SuperAdminDashboard(BaseModel):
    total_clients: int
    active_clients: int
    trial_clients: int
    expired_clients: int
    suspended_clients: int
    total_customers: int
    mrr: float
    expiring_soon: int

class AdminDashboard(BaseModel):
    total_customers: int
    capacity: int
    today_attendance: Dict[str, int]
    monthly_revenue: Dict[str, float]
    meals_served_month: int
    today_pause_requests: int
    recent_payments: List[Payment]
    recent_pause_requests: List[PauseRequest]

# Utility Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    
    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
    
    user_id = payload.get("sub")
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    
    if not user_doc or not user_doc.get("is_active"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    
    return user_doc

async def require_super_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Super admin access required")
    return current_user

async def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user

async def get_tenant_info(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") == UserRole.SUPER_ADMIN:
        return None
    
    tenant_id = current_user.get("tenant_id")
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No tenant associated")
    
    tenant_doc = await db.tenants.find_one({"id": tenant_id}, {"_id": 0})
    if not tenant_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    
    return tenant_doc

# Initialize default data
async def initialize_default_data():
    # Check if super admin exists
    super_admin = await db.users.find_one({"role": UserRole.SUPER_ADMIN})
    if not super_admin:
        admin_id = str(uuid.uuid4())
        admin_doc = {
            "id": admin_id,
            "username": "superadmin",
            "email": "admin@trackmymess.com",
            "full_name": "Super Administrator",
            "password": hash_password("Admin@123"),
            "role": UserRole.SUPER_ADMIN,
            "tenant_id": None,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_doc)
        logger.info("Super admin created: superadmin / Admin@123")

# API Routes

# Auth Routes
@api_router.post("/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    user_doc = await db.users.find_one({"username": request.username}, {"_id": 0})
    
    if not user_doc or not verify_password(request.password, user_doc["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    if not user_doc.get("is_active"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
    
    # Create tokens
    token_data = {"sub": user_doc["id"], "role": user_doc["role"], "tenant_id": user_doc.get("tenant_id")}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    # Remove password from response
    user_data = {k: v for k, v in user_doc.items() if k != "password"}
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_data
    )

@api_router.post("/auth/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    payload = decode_token(request.refresh_token)
    
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
    
    user_id = payload.get("sub")
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    
    if not user_doc or not user_doc.get("is_active"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    
    token_data = {"sub": user_doc["id"], "role": user_doc["role"], "tenant_id": user_doc.get("tenant_id")}
    access_token = create_access_token(token_data)
    new_refresh_token = create_refresh_token(token_data)
    
    user_data = {k: v for k, v in user_doc.items() if k != "password"}
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user=user_data
    )

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != "password"}

# Super Admin Routes

@api_router.get("/super-admin/dashboard", response_model=SuperAdminDashboard)
async def get_super_admin_dashboard(current_user: dict = Depends(require_super_admin)):
    tenants = await db.tenants.find({}, {"_id": 0}).to_list(10000)
    
    total_clients = len(tenants)
    active_clients = len([t for t in tenants if t["status"] == TenantStatus.ACTIVE])
    trial_clients = len([t for t in tenants if t["status"] == TenantStatus.TRIAL])
    expired_clients = len([t for t in tenants if t["status"] == TenantStatus.EXPIRED])
    suspended_clients = len([t for t in tenants if t["status"] == TenantStatus.SUSPENDED])
    
    total_customers = sum(t.get("customer_count", 0) for t in tenants)
    
    # Calculate MRR
    mrr = sum(
        PLAN_CONFIG[t["subscription_plan"]]["price"]
        for t in tenants
        if t["status"] == TenantStatus.ACTIVE
    )
    
    # Expiring soon (next 7 days)
    now = datetime.now(timezone.utc)
    seven_days = now + timedelta(days=7)
    expiring_soon = len([
        t for t in tenants
        if t["status"] == TenantStatus.ACTIVE and
        datetime.fromisoformat(t["subscription_end"]) <= seven_days
    ])
    
    return SuperAdminDashboard(
        total_clients=total_clients,
        active_clients=active_clients,
        trial_clients=trial_clients,
        expired_clients=expired_clients,
        suspended_clients=suspended_clients,
        total_customers=total_customers,
        mrr=mrr,
        expiring_soon=expiring_soon
    )

@api_router.post("/super-admin/tenants", response_model=Tenant)
async def create_tenant(tenant_data: TenantCreate, current_user: dict = Depends(require_super_admin)):
    # Check if username or email already exists
    existing = await db.users.find_one({"$or": [{"username": tenant_data.username}, {"email": tenant_data.email}]})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username or email already exists")
    
    # Create tenant
    tenant_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    plan = tenant_data.subscription_plan
    trial_days = PLAN_CONFIG.get(plan, {}).get("trial_days", 14)
    
    tenant_doc = {
        "id": tenant_id,
        "mess_name": tenant_data.mess_name,
        "owner_name": tenant_data.owner_name,
        "email": tenant_data.email,
        "mobile": tenant_data.mobile,
        "address": tenant_data.address,
        "capacity": tenant_data.capacity,
        "subscription_plan": plan,
        "status": TenantStatus.TRIAL if plan == SubscriptionPlan.FREE_TRIAL else TenantStatus.ACTIVE,
        "subscription_start": now.isoformat(),
        "subscription_end": (now + timedelta(days=trial_days if plan == SubscriptionPlan.FREE_TRIAL else 30)).isoformat(),
        "customer_count": 0,
        "created_at": now.isoformat()
    }
    await db.tenants.insert_one(tenant_doc)
    
    # Create admin user
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "username": tenant_data.username,
        "email": tenant_data.email,
        "full_name": tenant_data.owner_name,
        "password": hash_password(tenant_data.password),
        "role": UserRole.ADMIN,
        "tenant_id": tenant_id,
        "is_active": True,
        "created_at": now.isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Create default meal plans for tenant
    default_plans = [
        {
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "name": "Full Board (3 meals)",
            "description": "Breakfast, Lunch, and Dinner",
            "meals_included": ["Breakfast", "Lunch", "Dinner"],
            "billing_type": BillingType.MONTHLY,
            "rate": 3000,
            "is_active": True,
            "is_default": True,
            "customer_count": 0,
            "created_at": now.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "name": "Lunch + Dinner",
            "description": "Two meals per day",
            "meals_included": ["Lunch", "Dinner"],
            "billing_type": BillingType.MONTHLY,
            "rate": 2100,
            "is_active": True,
            "is_default": True,
            "customer_count": 0,
            "created_at": now.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "name": "Only Lunch",
            "description": "Single meal - Lunch only",
            "meals_included": ["Lunch"],
            "billing_type": BillingType.MONTHLY,
            "rate": 1200,
            "is_active": True,
            "is_default": True,
            "customer_count": 0,
            "created_at": now.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "name": "Only Dinner",
            "description": "Single meal - Dinner only",
            "meals_included": ["Dinner"],
            "billing_type": BillingType.MONTHLY,
            "rate": 1350,
            "is_active": True,
            "is_default": True,
            "customer_count": 0,
            "created_at": now.isoformat()
        }
    ]
    await db.meal_plans.insert_many(default_plans)
    
    return Tenant(**tenant_doc)

@api_router.get("/super-admin/tenants", response_model=List[Tenant])
async def get_tenants(current_user: dict = Depends(require_super_admin)):
    tenants = await db.tenants.find({}, {"_id": 0}).to_list(10000)
    return [Tenant(**t) for t in tenants]

@api_router.get("/super-admin/tenants/{tenant_id}", response_model=Tenant)
async def get_tenant(tenant_id: str, current_user: dict = Depends(require_super_admin)):
    tenant = await db.tenants.find_one({"id": tenant_id}, {"_id": 0})
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    return Tenant(**tenant)

@api_router.put("/super-admin/tenants/{tenant_id}", response_model=Tenant)
async def update_tenant(tenant_id: str, updates: TenantUpdate, current_user: dict = Depends(require_super_admin)):
    tenant = await db.tenants.find_one({"id": tenant_id})
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    
    if update_data:
        await db.tenants.update_one({"id": tenant_id}, {"$set": update_data})
    
    updated_tenant = await db.tenants.find_one({"id": tenant_id}, {"_id": 0})
    return Tenant(**updated_tenant)

# Admin/Client Routes

@api_router.get("/admin/dashboard", response_model=AdminDashboard)
async def get_admin_dashboard(current_user: dict = Depends(require_admin), tenant: dict = Depends(get_tenant_info)):
    tenant_id = tenant["id"]
    
    # Get customer count
    customers = await db.customers.find({"tenant_id": tenant_id, "is_active": True}, {"_id": 0}).to_list(10000)
    total_customers = len(customers)
    
    # Today's attendance
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    attendance_records = await db.attendance.find({
        "tenant_id": tenant_id,
        "date": {"$gte": today.isoformat(), "$lt": (today + timedelta(days=1)).isoformat()}
    }, {"_id": 0}).to_list(10000)
    
    present = len(set(a["customer_id"] for a in attendance_records if a.get("breakfast") or a.get("lunch") or a.get("dinner")))
    absent = total_customers - present
    
    # Monthly revenue
    current_month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    payments = await db.payments.find({
        "tenant_id": tenant_id,
        "payment_date": {"$gte": current_month_start.isoformat()},
        "payment_status": PaymentStatus.COMPLETED
    }, {"_id": 0}).to_list(10000)
    
    collected = sum(p["amount"] for p in payments)
    
    # Calculate pending from invoices
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
        "status": PauseRequestStatus.PENDING,
        "created_at": {"$gte": today.isoformat()}
    }, {"_id": 0}).to_list(10000)
    
    # Recent payments
    recent_payments_docs = await db.payments.find({"tenant_id": tenant_id}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    recent_payments = [Payment(**p) for p in recent_payments_docs]
    
    # Recent pause requests
    recent_pause_docs = await db.pause_requests.find({"tenant_id": tenant_id}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    recent_pause_requests = [PauseRequest(**p) for p in recent_pause_docs]
    
    return AdminDashboard(
        total_customers=total_customers,
        capacity=tenant["capacity"],
        today_attendance={"present": present, "absent": absent},
        monthly_revenue={"collected": collected, "pending": total_due},
        meals_served_month=meals_served,
        today_pause_requests=len(pause_requests_today),
        recent_payments=recent_payments,
        recent_pause_requests=recent_pause_requests
    )

# Customer Routes
@api_router.post("/admin/customers", response_model=Customer)
async def create_customer(customer_data: CustomerCreate, current_user: dict = Depends(require_admin), tenant: dict = Depends(get_tenant_info)):
    tenant_id = tenant["id"]
    
    # Check capacity
    plan_config = PLAN_CONFIG[tenant["subscription_plan"]]
    if tenant["customer_count"] >= plan_config["capacity"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Capacity reached! {tenant['customer_count']}/{plan_config['capacity']}"
        )
    
    # Check if mobile already exists for this tenant
    existing = await db.customers.find_one({"tenant_id": tenant_id, "mobile": customer_data.mobile})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mobile number already exists")
    
    # Verify meal plan exists
    meal_plan = await db.meal_plans.find_one({"id": customer_data.meal_plan_id, "tenant_id": tenant_id})
    if not meal_plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal plan not found")
    
    customer_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    customer_doc = {
        "id": customer_id,
        "tenant_id": tenant_id,
        **customer_data.model_dump(),
        "joining_date": customer_data.joining_date.isoformat(),
        "is_active": True,
        "current_dues": 0,
        "created_at": now.isoformat()
    }
    
    await db.customers.insert_one(customer_doc)
    
    # Update tenant customer count
    await db.tenants.update_one({"id": tenant_id}, {"$inc": {"customer_count": 1}})
    
    # Update meal plan customer count
    await db.meal_plans.update_one({"id": customer_data.meal_plan_id}, {"$inc": {"customer_count": 1}})
    
    customer_doc["meal_plan_name"] = meal_plan["name"]
    return Customer(**customer_doc)

@api_router.get("/admin/customers", response_model=List[Customer])
async def get_customers(current_user: dict = Depends(require_admin), tenant: dict = Depends(get_tenant_info)):
    customers = await db.customers.find({"tenant_id": tenant["id"]}, {"_id": 0}).to_list(10000)
    
    # Enrich with meal plan names
    for customer in customers:
        meal_plan = await db.meal_plans.find_one({"id": customer["meal_plan_id"]}, {"_id": 0})
        if meal_plan:
            customer["meal_plan_name"] = meal_plan["name"]
    
    return [Customer(**c) for c in customers]

@api_router.get("/admin/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str, current_user: dict = Depends(require_admin), tenant: dict = Depends(get_tenant_info)):
    customer = await db.customers.find_one({"id": customer_id, "tenant_id": tenant["id"]}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    
    meal_plan = await db.meal_plans.find_one({"id": customer["meal_plan_id"]}, {"_id": 0})
    if meal_plan:
        customer["meal_plan_name"] = meal_plan["name"]
    
    return Customer(**customer)

@api_router.put("/admin/customers/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, updates: CustomerUpdate, current_user: dict = Depends(require_admin), tenant: dict = Depends(get_tenant_info)):
    customer = await db.customers.find_one({"id": customer_id, "tenant_id": tenant["id"]})
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    
    # If meal plan is being changed, update counts
    if "meal_plan_id" in update_data and update_data["meal_plan_id"] != customer["meal_plan_id"]:
        # Decrease old plan count
        await db.meal_plans.update_one({"id": customer["meal_plan_id"]}, {"$inc": {"customer_count": -1}})
        # Increase new plan count
        await db.meal_plans.update_one({"id": update_data["meal_plan_id"]}, {"$inc": {"customer_count": 1}})
    
    if update_data:
        await db.customers.update_one({"id": customer_id}, {"$set": update_data})
    
    updated_customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    meal_plan = await db.meal_plans.find_one({"id": updated_customer["meal_plan_id"]}, {"_id": 0})
    if meal_plan:
        updated_customer["meal_plan_name"] = meal_plan["name"]
    
    return Customer(**updated_customer)

# Meal Plan Routes
@api_router.get("/admin/meal-plans", response_model=List[MealPlan])
async def get_meal_plans(current_user: dict = Depends(require_admin), tenant: dict = Depends(get_tenant_info)):
    plans = await db.meal_plans.find({"tenant_id": tenant["id"]}, {"_id": 0}).to_list(10000)
    return [MealPlan(**p) for p in plans]

@api_router.post("/admin/meal-plans", response_model=MealPlan)
async def create_meal_plan(plan_data: MealPlanCreate, current_user: dict = Depends(require_admin), tenant: dict = Depends(get_tenant_info)):
    plan_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    plan_doc = {
        "id": plan_id,
        "tenant_id": tenant["id"],
        **plan_data.model_dump(),
        "is_default": False,
        "customer_count": 0,
        "created_at": now.isoformat()
    }
    
    await db.meal_plans.insert_one(plan_doc)
    return MealPlan(**plan_doc)

@api_router.put("/admin/meal-plans/{plan_id}", response_model=MealPlan)
async def update_meal_plan(plan_id: str, updates: MealPlanCreate, current_user: dict = Depends(require_admin), tenant: dict = Depends(get_tenant_info)):
    plan = await db.meal_plans.find_one({"id": plan_id, "tenant_id": tenant["id"]})
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal plan not found")
    
    update_data = updates.model_dump()
    await db.meal_plans.update_one({"id": plan_id}, {"$set": update_data})
    
    updated_plan = await db.meal_plans.find_one({"id": plan_id}, {"_id": 0})
    return MealPlan(**updated_plan)

@api_router.delete("/admin/meal-plans/{plan_id}")
async def delete_meal_plan(plan_id: str, current_user: dict = Depends(require_admin), tenant: dict = Depends(get_tenant_info)):
    plan = await db.meal_plans.find_one({"id": plan_id, "tenant_id": tenant["id"]})
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal plan not found")
    
    if plan.get("customer_count", 0) > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{plan['customer_count']} customers on this plan. Reassign first."
        )
    
    await db.meal_plans.delete_one({"id": plan_id})
    return {"message": "Meal plan deleted successfully"}

# Attendance Routes
@api_router.post("/admin/attendance")
async def mark_attendance(attendance_data: AttendanceCreate, current_user: dict = Depends(require_admin), tenant: dict = Depends(get_tenant_info)):
    tenant_id = tenant["id"]
    
    # Delete existing attendance for this date
    date_str = attendance_data.date.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    await db.attendance.delete_many({"tenant_id": tenant_id, "date": date_str})
    
    # Insert new records
    now = datetime.now(timezone.utc)
    records = []
    
    for record in attendance_data.records:
        customer = await db.customers.find_one({"id": record.customer_id, "tenant_id": tenant_id})
        if customer:
            doc = {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "date": date_str,
                "customer_id": record.customer_id,
                "customer_name": customer["full_name"],
                "breakfast": record.breakfast,
                "lunch": record.lunch,
                "dinner": record.dinner,
                "created_at": now.isoformat()
            }
            records.append(doc)
    
    if records:
        await db.attendance.insert_many(records)
    
    return {"message": f"Attendance marked for {len(records)} customers"}

@api_router.get("/admin/attendance", response_model=List[Attendance])
async def get_attendance(date: str, current_user: dict = Depends(require_admin), tenant: dict = Depends(get_tenant_info)):
    date_obj = datetime.fromisoformat(date).replace(hour=0, minute=0, second=0, microsecond=0)
    
    records = await db.attendance.find({
        "tenant_id": tenant["id"],
        "date": date_obj.isoformat()
    }, {"_id": 0}).to_list(10000)
    
    return [Attendance(**r) for r in records]

# Pause Request Routes
@api_router.post("/admin/pause-requests", response_model=PauseRequest)
async def create_pause_request(pause_data: PauseRequestCreate, current_user: dict = Depends(require_admin), tenant: dict = Depends(get_tenant_info)):
    customer = await db.customers.find_one({"id": pause_data.customer_id, "tenant_id": tenant["id"]})
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    
    pause_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    pause_doc = {
        "id": pause_id,
        "tenant_id": tenant["id"],
        "customer_id": pause_data.customer_id,
        "customer_name": customer["full_name"],
        "start_date": pause_data.start_date.isoformat(),
        "end_date": pause_data.end_date.isoformat(),
        "reason": pause_data.reason,
        "status": PauseRequestStatus.PENDING,
        "admin_notes": None,
        "created_at": now.isoformat()
    }
    
    await db.pause_requests.insert_one(pause_doc)
    return PauseRequest(**pause_doc)

@api_router.get("/admin/pause-requests", response_model=List[PauseRequest])
async def get_pause_requests(current_user: dict = Depends(require_admin), tenant: dict = Depends(get_tenant_info)):
    requests = await db.pause_requests.find({"tenant_id": tenant["id"]}, {"_id": 0}).to_list(10000)
    return [PauseRequest(**r) for r in requests]

@api_router.put("/admin/pause-requests/{pause_id}", response_model=PauseRequest)
async def update_pause_request(pause_id: str, updates: PauseRequestUpdate, current_user: dict = Depends(require_admin), tenant: dict = Depends(get_tenant_info)):
    pause_req = await db.pause_requests.find_one({"id": pause_id, "tenant_id": tenant["id"]})
    if not pause_req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pause request not found")
    
    update_data = updates.model_dump()
    await db.pause_requests.update_one({"id": pause_id}, {"$set": update_data})
    
    updated = await db.pause_requests.find_one({"id": pause_id}, {"_id": 0})
    return PauseRequest(**updated)

# Payment Routes
@api_router.post("/admin/payments/razorpay/create-order")
async def create_razorpay_order(amount: float = Body(...), customer_id: str = Body(...), current_user: dict = Depends(require_admin), tenant: dict = Depends(get_tenant_info)):
    try:
        order = razorpay_client.order.create({
            "amount": int(amount * 100),  # Razorpay amount in paise
            "currency": "INR",
            "payment_capture": 1
        })
        
        return {
            "order_id": order["id"],
            "amount": amount,
            "currency": "INR",
            "key_id": RAZORPAY_KEY_ID
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@api_router.post("/admin/payments", response_model=Payment)
async def create_payment(payment_data: PaymentCreate, current_user: dict = Depends(require_admin), tenant: dict = Depends(get_tenant_info)):
    customer = await db.customers.find_one({"id": payment_data.customer_id, "tenant_id": tenant["id"]})
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    
    payment_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    payment_doc = {
        "id": payment_id,
        "tenant_id": tenant["id"],
        "customer_id": payment_data.customer_id,
        "customer_name": customer["full_name"],
        "amount": payment_data.amount,
        "payment_method": payment_data.payment_method,
        "payment_status": PaymentStatus.COMPLETED,
        "transaction_id": payment_data.transaction_id,
        "notes": payment_data.notes,
        "payment_date": now.isoformat(),
        "created_at": now.isoformat()
    }
    
    await db.payments.insert_one(payment_doc)
    
    # Update customer dues
    current_dues = customer.get("current_dues", 0)
    new_dues = max(0, current_dues - payment_data.amount)
    await db.customers.update_one({"id": payment_data.customer_id}, {"$set": {"current_dues": new_dues}})
    
    return Payment(**payment_doc)

@api_router.get("/admin/payments", response_model=List[Payment])
async def get_payments(current_user: dict = Depends(require_admin), tenant: dict = Depends(get_tenant_info)):
    payments = await db.payments.find({"tenant_id": tenant["id"]}, {"_id": 0}).to_list(10000)
    return [Payment(**p) for p in payments]

# Invoice Routes
@api_router.get("/admin/invoices", response_model=List[Invoice])
async def get_invoices(current_user: dict = Depends(require_admin), tenant: dict = Depends(get_tenant_info)):
    invoices = await db.invoices.find({"tenant_id": tenant["id"]}, {"_id": 0}).to_list(10000)
    return [Invoice(**inv) for inv in invoices]

@api_router.post("/admin/invoices/generate-monthly")
async def generate_monthly_invoices(month: int = Body(...), year: int = Body(...), current_user: dict = Depends(require_admin), tenant: dict = Depends(get_tenant_info)):
    tenant_id = tenant["id"]
    
    # Get all active customers
    customers = await db.customers.find({"tenant_id": tenant_id, "is_active": True}, {"_id": 0}).to_list(10000)
    
    if not customers:
        return {"message": "No active customers found"}
    
    # Get attendance for the month
    start_date = datetime(year, month, 1, tzinfo=timezone.utc)
    if month == 12:
        end_date = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end_date = datetime(year, month + 1, 1, tzinfo=timezone.utc)
    
    total_days = (end_date - start_date).days
    
    invoices_created = 0
    
    for customer in customers:
        # Check if invoice already exists
        existing = await db.invoices.find_one({
            "tenant_id": tenant_id,
            "customer_id": customer["id"],
            "month": month,
            "year": year
        })
        
        if existing:
            continue
        
        # Get attendance
        attendance = await db.attendance.find({
            "tenant_id": tenant_id,
            "customer_id": customer["id"],
            "date": {"$gte": start_date.isoformat(), "$lt": end_date.isoformat()}
        }, {"_id": 0}).to_list(10000)
        
        present_days = len(set(a["date"] for a in attendance if a.get("breakfast") or a.get("lunch") or a.get("dinner")))
        
        # Get approved pause days
        pause_requests = await db.pause_requests.find({
            "tenant_id": tenant_id,
            "customer_id": customer["id"],
            "status": PauseRequestStatus.APPROVED
        }, {"_id": 0}).to_list(10000)
        
        pause_days = 0
        for pause in pause_requests:
            pause_start = max(datetime.fromisoformat(pause["start_date"]), start_date)
            pause_end = min(datetime.fromisoformat(pause["end_date"]), end_date)
            if pause_start < pause_end:
                pause_days += (pause_end - pause_start).days
        
        # Calculate charges
        meal_plan = await db.meal_plans.find_one({"id": customer["meal_plan_id"]})
        if not meal_plan:
            continue
        
        if meal_plan["billing_type"] == BillingType.MONTHLY:
            meal_charges = meal_plan["rate"]
        else:
            meal_charges = present_days * meal_plan["rate"]
        
        total_amount = meal_charges
        
        # Get payments made for this month
        payments = await db.payments.find({
            "tenant_id": tenant_id,
            "customer_id": customer["id"],
            "payment_status": PaymentStatus.COMPLETED,
            "payment_date": {"$gte": start_date.isoformat(), "$lt": end_date.isoformat()}
        }, {"_id": 0}).to_list(10000)
        
        paid_amount = sum(p["amount"] for p in payments)
        due_amount = max(0, total_amount - paid_amount)
        
        # Generate invoice number
        invoice_count = await db.invoices.count_documents({"tenant_id": tenant_id})
        invoice_number = f"TMM-{tenant_id[:8]}-{year}-{invoice_count + 1:04d}"
        
        invoice_doc = {
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "customer_id": customer["id"],
            "customer_name": customer["full_name"],
            "invoice_number": invoice_number,
            "month": month,
            "year": year,
            "total_days": total_days,
            "present_days": present_days,
            "pause_days": pause_days,
            "meal_charges": meal_charges,
            "adjustments": 0,
            "total_amount": total_amount,
            "paid_amount": paid_amount,
            "due_amount": due_amount,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.invoices.insert_one(invoice_doc)
        
        # Update customer dues
        await db.customers.update_one({"id": customer["id"]}, {"$set": {"current_dues": due_amount}})
        
        invoices_created += 1
    
    return {"message": f"Generated {invoices_created} invoices for {month}/{year}"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await initialize_default_data()
    logger.info("TrackMyMess API started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
