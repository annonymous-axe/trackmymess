"""
TrackMyMess Sample Data Generator
Run this script to populate your database with sample data for testing
"""

import asyncio
import os
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import bcrypt
import uuid
import random

# Load environment
load_dotenv()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Enums
class UserRole:
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    STAFF = "STAFF"

class SubscriptionPlan:
    FREE_TRIAL = "FREE_TRIAL"
    BASIC = "BASIC"
    STANDARD = "STANDARD"
    PREMIUM = "PREMIUM"

class TenantStatus:
    ACTIVE = "ACTIVE"
    TRIAL = "TRIAL"
    EXPIRED = "EXPIRED"

class Gender:
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"

class BillingType:
    PER_DAY = "PER_DAY"
    MONTHLY = "MONTHLY"

class PaymentMethod:
    RAZORPAY = "RAZORPAY"
    CASH = "CASH"
    UPI = "UPI"
    BANK_TRANSFER = "BANK_TRANSFER"

class PaymentStatus:
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class PauseRequestStatus:
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class StaffRole:
    MANAGER = "MANAGER"
    ATTENDANCE_OPERATOR = "ATTENDANCE_OPERATOR"
    ACCOUNTANT = "ACCOUNTANT"
    COOK = "COOK"
    HELPER = "HELPER"

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Sample data lists
first_names = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Rohan", "Pooja", "Arjun", "Divya",
               "Karan", "Meera", "Siddharth", "Kavya", "Aditya", "Ishita", "Varun", "Riya", "Nikhil", "Sakshi"]
last_names = ["Sharma", "Patel", "Kumar", "Singh", "Reddy", "Nair", "Gupta", "Verma", "Desai", "Joshi"]
cities = ["Mumbai", "Delhi", "Bangalore", "Pune", "Surat", "Chennai", "Kolkata", "Hyderabad"]
mess_names = ["Tasty Bites", "Home Kitchen", "Student Mess", "Royal Dining", "Fresh Meals", "Happy Tiffin"]

async def clear_collections():
    """Clear existing data (optional)"""
    print("🗑️  Clearing existing data...")
    collections = ['users', 'tenants', 'customers', 'meal_plans', 'attendance', 
                   'pause_requests', 'payments', 'invoices', 'staff', 'staff_payments', 
                   'subscription_logs']
    for coll in collections:
        await db[coll].delete_many({})
    print("✅ Collections cleared")

async def create_super_admin():
    """Create super admin user"""
    print("\n👤 Creating Super Admin...")
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
    print("✅ Super Admin created (username: superadmin, password: Admin@123)")
    return admin_id

async def create_tenants():
    """Create sample tenants with different plans"""
    print("\n🏢 Creating Tenants...")
    tenants = []
    plans = [SubscriptionPlan.FREE_TRIAL, SubscriptionPlan.BASIC, SubscriptionPlan.STANDARD, SubscriptionPlan.PREMIUM]
    
    for i, plan in enumerate(plans):
        tenant_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        
        # Vary subscription dates
        days_offset = random.randint(-60, 60)
        subscription_start = now - timedelta(days=abs(days_offset) if days_offset < 0 else 0)
        subscription_end = subscription_start + timedelta(days=30)
        
        # Determine status
        if plan == SubscriptionPlan.FREE_TRIAL:
            status = TenantStatus.TRIAL
        elif days_offset < -30:
            status = TenantStatus.EXPIRED
        else:
            status = TenantStatus.ACTIVE
        
        tenant_doc = {
            "id": tenant_id,
            "mess_name": f"{mess_names[i % len(mess_names)]} {i+1}",
            "owner_name": f"{first_names[i]} {last_names[i]}",
            "email": f"tenant{i+1}@example.com",
            "mobile": f"9{random.randint(100000000, 999999999)}",
            "address": f"{random.randint(1, 999)} MG Road, {cities[i % len(cities)]}, India",
            "capacity": [50, 100, 300, 999999][i],
            "subscription_plan": plan,
            "status": status,
            "subscription_start": subscription_start.isoformat(),
            "subscription_end": subscription_end.isoformat(),
            "customer_count": 0,
            "created_at": now.isoformat()
        }
        await db.tenants.insert_one(tenant_doc)
        tenants.append(tenant_doc)
        
        # Create admin user for tenant
        user_id = str(uuid.uuid4())
        user_doc = {
            "id": user_id,
            "username": f"admin{i+1}",
            "email": f"admin{i+1}@example.com",
            "full_name": f"{first_names[i]} {last_names[i]}",
            "password": hash_password("Password@123"),
            "role": UserRole.ADMIN,
            "tenant_id": tenant_id,
            "is_active": True,
            "created_at": now.isoformat()
        }
        await db.users.insert_one(user_doc)
        
        print(f"✅ Tenant {i+1}: {tenant_doc['mess_name']} ({plan}) - admin{i+1}/Password@123")
    
    return tenants

async def create_meal_plans(tenant_id: str):
    """Create meal plans for a tenant"""
    now = datetime.now(timezone.utc)
    plans = [
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
            "is_default": False,
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
            "is_default": False,
            "customer_count": 0,
            "created_at": now.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "name": "Per Day Plan",
            "description": "Pay per meal consumed",
            "meals_included": ["Breakfast", "Lunch", "Dinner"],
            "billing_type": BillingType.PER_DAY,
            "rate": 150,
            "is_active": True,
            "is_default": False,
            "customer_count": 0,
            "created_at": now.isoformat()
        }
    ]
    await db.meal_plans.insert_many(plans)
    return plans

async def create_customers(tenant_id: str, count: int):
    """Create sample customers for a tenant"""
    meal_plans = await db.meal_plans.find({"tenant_id": tenant_id}, {"_id": 0}).to_list(10)
    customers = []
    now = datetime.now(timezone.utc)
    
    for i in range(count):
        customer_id = str(uuid.uuid4())
        meal_plan = random.choice(meal_plans)
        joining_date = now - timedelta(days=random.randint(1, 180))
        
        customer_doc = {
            "id": customer_id,
            "tenant_id": tenant_id,
            "full_name": f"{random.choice(first_names)} {random.choice(last_names)}",
            "gender": random.choice([Gender.MALE, Gender.FEMALE, Gender.OTHER]),
            "mobile": f"9{random.randint(100000000, 999999999)}",
            "email": f"customer{i+1}_{tenant_id[:8]}@example.com",
            "address": f"{random.randint(1, 999)} Street, {random.choice(cities)}",
            "emergency_contact": f"9{random.randint(100000000, 999999999)}",
            "joining_date": joining_date.isoformat(),
            "meal_plan_id": meal_plan["id"],
            "monthly_rate": meal_plan["rate"],
            "security_deposit": random.choice([0, 1000, 2000, 3000]),
            "id_proof_type": random.choice(["Aadhar", "PAN", "Driving License"]),
            "id_proof_number": f"ID{random.randint(100000, 999999)}",
            "is_active": random.choice([True, True, True, False]),  # 75% active
            "current_dues": random.randint(0, 5000) if random.random() > 0.5 else 0,
            "created_at": now.isoformat()
        }
        customers.append(customer_doc)
        
        # Update meal plan customer count
        await db.meal_plans.update_one({"id": meal_plan["id"]}, {"$inc": {"customer_count": 1}})
    
    await db.customers.insert_many(customers)
    
    # Update tenant customer count
    await db.tenants.update_one({"id": tenant_id}, {"$set": {"customer_count": count}})
    
    return customers

async def create_attendance(tenant_id: str, customers: list):
    """Create attendance records for last 30 days"""
    print(f"  📋 Creating attendance records...")
    now = datetime.now(timezone.utc)
    attendance_records = []
    
    for days_ago in range(30):
        date = now - timedelta(days=days_ago)
        date = date.replace(hour=0, minute=0, second=0, microsecond=0)
        
        for customer in customers:
            if not customer["is_active"]:
                continue
            
            # 80% attendance probability
            if random.random() < 0.8:
                record_id = str(uuid.uuid4())
                attendance_doc = {
                    "id": record_id,
                    "tenant_id": tenant_id,
                    "date": date.isoformat(),
                    "customer_id": customer["id"],
                    "customer_name": customer["full_name"],
                    "breakfast": random.choice([True, False]),
                    "lunch": random.choice([True, True, False]),  # Higher chance for lunch
                    "dinner": random.choice([True, True, False]),
                    "created_at": now.isoformat()
                }
                attendance_records.append(attendance_doc)
    
    if attendance_records:
        await db.attendance.insert_many(attendance_records)
    print(f"  ✅ Created {len(attendance_records)} attendance records")

async def create_payments(tenant_id: str, customers: list):
    """Create payment records"""
    print(f"  💰 Creating payment records...")
    payments = []
    now = datetime.now(timezone.utc)
    
    for customer in customers:
        if not customer["is_active"]:
            continue
        
        # Create 1-3 payments per customer
        num_payments = random.randint(1, 3)
        for j in range(num_payments):
            payment_id = str(uuid.uuid4())
            payment_date = now - timedelta(days=random.randint(1, 60))
            
            payment_doc = {
                "id": payment_id,
                "tenant_id": tenant_id,
                "customer_id": customer["id"],
                "customer_name": customer["full_name"],
                "amount": random.choice([1000, 1500, 2000, 2500, 3000]),
                "payment_method": random.choice([PaymentMethod.CASH, PaymentMethod.UPI, PaymentMethod.BANK_TRANSFER]),
                "payment_status": random.choice([PaymentStatus.COMPLETED, PaymentStatus.COMPLETED, PaymentStatus.PENDING]),
                "transaction_id": f"TXN{random.randint(100000, 999999)}",
                "razorpay_order_id": None,
                "razorpay_payment_id": None,
                "notes": random.choice([None, "Monthly payment", "Advance payment", "Partial payment"]),
                "payment_date": payment_date.isoformat(),
                "created_at": payment_date.isoformat()
            }
            payments.append(payment_doc)
    
    if payments:
        await db.payments.insert_many(payments)
    print(f"  ✅ Created {len(payments)} payment records")

async def create_pause_requests(tenant_id: str, customers: list):
    """Create pause requests"""
    print(f"  ⏸️  Creating pause requests...")
    pause_requests = []
    now = datetime.now(timezone.utc)
    
    # Create pause requests for 20% of customers
    sample_customers = random.sample([c for c in customers if c["is_active"]], 
                                    min(len([c for c in customers if c["is_active"]]) // 5, 10))
    
    for customer in sample_customers:
        pause_id = str(uuid.uuid4())
        start_date = now + timedelta(days=random.randint(1, 15))
        end_date = start_date + timedelta(days=random.randint(3, 10))
        
        pause_doc = {
            "id": pause_id,
            "tenant_id": tenant_id,
            "customer_id": customer["id"],
            "customer_name": customer["full_name"],
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "reason": random.choice(["Going home", "Vacation", "Medical leave", "Travel"]),
            "status": random.choice([PauseRequestStatus.PENDING, PauseRequestStatus.APPROVED, PauseRequestStatus.REJECTED]),
            "admin_notes": random.choice([None, "Approved", "Denied - Already approved", "OK"]),
            "created_at": now.isoformat()
        }
        pause_requests.append(pause_doc)
    
    if pause_requests:
        await db.pause_requests.insert_many(pause_requests)
    print(f"  ✅ Created {len(pause_requests)} pause requests")

async def create_invoices(tenant_id: str, customers: list):
    """Create invoice records"""
    print(f"  🧾 Creating invoices...")
    invoices = []
    now = datetime.now(timezone.utc)
    
    # Create invoices for last 3 months
    for months_ago in range(3):
        target_date = now - timedelta(days=30 * months_ago)
        month = target_date.month
        year = target_date.year
        
        invoice_count = 0
        for customer in customers:
            if not customer["is_active"]:
                continue
            
            invoice_id = str(uuid.uuid4())
            total_days = 30
            present_days = random.randint(20, 30)
            pause_days = random.randint(0, 5)
            meal_charges = customer["monthly_rate"]
            adjustments = random.choice([0, 0, 0, -100, 100, 200])
            total_amount = meal_charges + adjustments
            paid_amount = random.randint(0, int(total_amount))
            due_amount = max(0, total_amount - paid_amount)
            
            invoice_doc = {
                "id": invoice_id,
                "tenant_id": tenant_id,
                "customer_id": customer["id"],
                "customer_name": customer["full_name"],
                "invoice_number": f"TMM-{tenant_id[:8]}-{year}-{invoice_count + 1:04d}",
                "month": month,
                "year": year,
                "total_days": total_days,
                "present_days": present_days,
                "pause_days": pause_days,
                "meal_charges": meal_charges,
                "adjustments": adjustments,
                "total_amount": total_amount,
                "paid_amount": paid_amount,
                "due_amount": due_amount,
                "generated_at": target_date.isoformat()
            }
            invoices.append(invoice_doc)
            invoice_count += 1
    
    if invoices:
        await db.invoices.insert_many(invoices)
    print(f"  ✅ Created {len(invoices)} invoices")

async def create_staff(tenant_id: str):
    """Create staff members"""
    print(f"  👥 Creating staff members...")
    staff_list = []
    now = datetime.now(timezone.utc)
    
    roles_salaries = [
        (StaffRole.MANAGER, 25000),
        (StaffRole.COOK, 15000),
        (StaffRole.ACCOUNTANT, 18000),
        (StaffRole.HELPER, 10000),
        (StaffRole.ATTENDANCE_OPERATOR, 12000)
    ]
    
    for i, (role, salary) in enumerate(roles_salaries[:3]):  # Create 3 staff members
        staff_id = str(uuid.uuid4())
        joining_date = now - timedelta(days=random.randint(30, 365))
        
        staff_doc = {
            "id": staff_id,
            "tenant_id": tenant_id,
            "full_name": f"{random.choice(first_names)} {random.choice(last_names)}",
            "gender": random.choice([Gender.MALE, Gender.FEMALE]),
            "mobile": f"9{random.randint(100000000, 999999999)}",
            "email": f"staff{i+1}_{tenant_id[:8]}@example.com",
            "address": f"{random.randint(1, 999)} Lane, {random.choice(cities)}",
            "role": role,
            "joining_date": joining_date.isoformat(),
            "salary": salary,
            "is_active": True,
            "total_advances": random.randint(0, 5000),
            "total_paid": random.randint(salary, salary * 3),
            "created_at": now.isoformat()
        }
        staff_list.append(staff_doc)
        
        # Create some payment records for staff
        for j in range(random.randint(1, 3)):
            payment_id = str(uuid.uuid4())
            payment_date = now - timedelta(days=random.randint(1, 90))
            
            staff_payment_doc = {
                "id": payment_id,
                "tenant_id": tenant_id,
                "staff_id": staff_id,
                "staff_name": staff_doc["full_name"],
                "amount": random.choice([salary, salary // 2, 2000, 3000]),
                "payment_type": random.choice(["SALARY", "ADVANCE", "BONUS"]),
                "notes": random.choice([None, "Monthly salary", "Advance payment", "Festival bonus"]),
                "payment_date": payment_date.isoformat(),
                "created_at": payment_date.isoformat()
            }
            await db.staff_payments.insert_one(staff_payment_doc)
    
    if staff_list:
        await db.staff.insert_many(staff_list)
    print(f"  ✅ Created {len(staff_list)} staff members")

async def create_subscription_logs(tenants: list):
    """Create subscription logs"""
    print("\n📜 Creating subscription logs...")
    logs = []
    now = datetime.now(timezone.utc)
    
    for tenant in tenants[:2]:  # Create logs for first 2 tenants
        log_id = str(uuid.uuid4())
        log_doc = {
            "id": log_id,
            "tenant_id": tenant["id"],
            "previous_plan": SubscriptionPlan.FREE_TRIAL,
            "new_plan": tenant["subscription_plan"],
            "amount": 500,
            "payment_status": PaymentStatus.COMPLETED,
            "notes": "Upgraded from trial",
            "changed_at": (now - timedelta(days=15)).isoformat()
        }
        logs.append(log_doc)
    
    if logs:
        await db.subscription_logs.insert_many(logs)
    print(f"✅ Created {len(logs)} subscription logs")

async def main():
    """Main function to generate all sample data"""
    print("🚀 TrackMyMess Sample Data Generator")
    print("=" * 50)
    
    # Optional: Clear existing data
    clear = input("Clear existing data? (y/n): ").lower()
    if clear == 'y':
        await clear_collections()
    
    # Create super admin
    await create_super_admin()
    
    # Create tenants
    tenants = await create_tenants()
    
    # For each active tenant, create complete data
    for i, tenant in enumerate(tenants):
        if tenant["status"] == TenantStatus.EXPIRED:
            continue
            
        print(f"\n📦 Populating data for: {tenant['mess_name']}")
        
        # Create meal plans
        await create_meal_plans(tenant["id"])
        
        # Create customers (varying counts)
        customer_count = random.randint(10, min(20, tenant["capacity"]))
        customers = await create_customers(tenant["id"], customer_count)
        print(f"  ✅ Created {customer_count} customers")
        
        # Create attendance
        await create_attendance(tenant["id"], customers)
        
        # Create payments
        await create_payments(tenant["id"], customers)
        
        # Create pause requests
        await create_pause_requests(tenant["id"], customers)
        
        # Create invoices
        await create_invoices(tenant["id"], customers)
        
        # Create staff
        await create_staff(tenant["id"])
    
    # Create subscription logs
    await create_subscription_logs(tenants)
    
    print("\n" + "=" * 50)
    print("✅ Sample data generation completed!")
    print("\n🔑 Login Credentials:")
    print("   Super Admin: superadmin / Admin@123")
    for i in range(len(tenants)):
        print(f"   Tenant {i+1}: admin{i+1} / Password@123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())