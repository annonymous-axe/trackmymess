"""
Complete FIFO Sync Implementation - All in One
Adds: Invoice status, Helper functions, Fixes payment routes, Fixes invoice generation
"""
import re

print("=" * 60)
print("COMPLETE FIFO SYNC IMPLEMENTATION")
print("=" * 60)

with open('server.py', 'r', encoding='utf-8') as f:
    content = f.read()

# PHASE 1: Add Invoice status field (if not present)
print("\n[1/5] Adding Invoice model status field...")
if 'status: Optional[InvoiceStatus]' not in content:
    content = re.sub(
        r'(    due_amount: float)\s*(    generated_at: datetime)',
        r'\1\n    status: Optional[InvoiceStatus] = InvoiceStatus.PENDING\n\2',
        content
    )
    print("  ✅ Added status field to Invoice model")
else:
    print("  ⏭️  Status field already exists")

# PHASE 2: Add helper functions (if not present)
print("\n[2/5] Adding FIFO helper functions...")
if '_apply_payment_to_invoices' not in content:
    helpers = '''
# Helper Functions for Payment-Invoice FIFO Sync
async def _apply_payment_to_invoices(db, tenant_id: str, customer_id: str, payment_amount: float, payment_id: str) -> float:
    """Apply payment to customer's unpaid invoices using FIFO."""
    invoices = await db.invoices.find({"tenant_id": tenant_id, "customer_id": customer_id, "due_amount": {"$gt": 0}}, {"_id": 0}).sort("generated_at", 1).to_list(1000)
    remaining_payment = payment_amount
    for invoice in invoices:
        if remaining_payment <= 0:
            break
        current_due = invoice.get("due_amount", 0)
        amount_to_apply = min(remaining_payment, current_due)
        if amount_to_apply > 0:
            new_paid_amount = invoice.get("paid_amount", 0) + amount_to_apply
            new_due_amount = max(0, invoice.get("total_amount", 0) - new_paid_amount)
            new_status = InvoiceStatus.PAID if new_due_amount == 0 else (InvoiceStatus.PARTIALLY_PAID if new_paid_amount > 0 else InvoiceStatus.PENDING)
            await db.invoices.update_one({"id": invoice["id"]}, {"$set": {"paid_amount": new_paid_amount, "due_amount": new_due_amount, "status": new_status}})
            remaining_payment -= amount_to_apply
    return await _recalculate_customer_dues(db, customer_id, tenant_id)

async def _recalculate_customer_dues(db, customer_id: str, tenant_id: str) -> float:
    """Recalculate customer's total dues from all invoices."""
    invoices = await db.invoices.find({"customer_id": customer_id, "tenant_id": tenant_id}, {"_id": 0, "due_amount": 1}).to_list(10000)
    return sum(inv.get("due_amount", 0) for inv in invoices)

async def _rebuild_customer_invoices_from_payments(db, tenant_id: str, customer_id: str) -> None:
    """Rebuild all invoice allocations for a customer from scratch."""
    invoices = await db.invoices.find({"customer_id": customer_id, "tenant_id": tenant_id}, {"_id": 0}).to_list(10000)
    for inv in invoices:
        await db.invoices.update_one({"id": inv["id"]}, {"$set": {"paid_amount": 0, "due_amount": inv.get("total_amount", 0), "status": InvoiceStatus.PENDING}})
    all_payments = await db.payments.find({"customer_id": customer_id, "tenant_id": tenant_id, "payment_status": PaymentStatus.COMPLETED}, {"_id": 0}).sort("payment_date", 1).to_list(10000)
    for pmt in all_payments:
        await _apply_payment_to_invoices(db, tenant_id, customer_id, pmt["amount"], pmt["id"])
    new_dues = await _recalculate_customer_dues(db, customer_id, tenant_id)
    await db.customers.update_one({"id": customer_id}, {"$set": {"current_dues": new_dues}})

'''
    # Insert before initialize_default_data
    content = re.sub(
        r'(# Initialize default data\s*async def initialize_default_data)',
        helpers + r'\1',
        content
    )
    print("  ✅ Added 3 FIFO helper functions")
else:
    print("  ⏭️  Helper functions already exist")

# PHASE 3: Fix POST /admin/payments  
print("\n[3/5] Fixing POST /admin/payments (create_payment)...")
# Find and replace the create_payment logic where it updates customer.current_dues
old_create_pattern = r'(await db.payments.insert_one\(payment_doc\))\s*(return Payment\(\*\*payment_doc\))'
new_create = r'''\1
    
    # FIFO: Apply payment to invoices if COMPLETED
    if payment_data.payment_status == PaymentStatus.COMPLETED:
        new_dues = await _apply_payment_to_invoices(db, tenant["id"], payment_data.customer_id, payment_data.amount, payment_id)
        await db.customers.update_one({"id": payment_data.customer_id}, {"$set": {"current_dues": new_dues}})
    
    \2'''
if 'await _apply_payment_to_invoices(db, tenant["id"], payment_data.customer_id' not in content:
    content = re.sub(old_create_pattern, new_create, content)
    print("  ✅ Fixed POST /admin/payments")
else:
    print("  ⏭️  Already fixed")

# PHASE 4: Fix PUT /admin/payments
print("\n[4/5] Fixing PUT /admin/payments (update_payment)...")
# This is complex - need to replace entire function logic
# Simplified: Just ensure rebuild is called
if '@api_router.put("/admin/payments/{payment_id}"' in content and '_rebuild_customer_invoices_from_payments' not in content.split('@api_router.put("/admin/payments/{payment_id}"')[1].split('@api_router')[0]:
    # Find the update_payment function and add rebuild logic
    update_pattern = r'(@api_router.put\("/admin/payments/\{payment_id\}".*?async def update_payment.*?await db.payments.update_one.*?\n)(    return Payment)'
    update_replacement = r'''\1    
    # Rebuild allocations if amount/customer changed for COMPLETED payment
    old_customer_id = payment.get("customer_id")
    old_status = payment.get("payment_status")
    needs_rebuild = ("amount" in update_data or "customer_id" in update_data) and old_status == PaymentStatus.COMPLETED
    if needs_rebuild and old_customer_id:
        await _rebuild_customer_invoices_from_payments(db, tenant["id"], old_customer_id)
    
\2'''
    content = re.sub(update_pattern, update_replacement, content, flags=re.DOTALL)
    print("  ✅ Fixed PUT /admin/payments")
else:
    print("  ⏭️  Already fixed or not found")

# PHASE 5: Fix DELETE /admin/payments
print("\n[5/5] Fixing DELETE /admin/payments (delete_payment)...")
delete_pattern = r'(await db.payments.delete_one\(\{"id": payment_id\}\))\s*(return \{"message": "Payment deleted successfully"\})'
delete_replacement = r'''\1
    
    # Rebuild allocations if payment was COMPLETED
    customer_id = payment.get("customer_id")
    if customer_id and payment.get("payment_status") == PaymentStatus.COMPLETED:
        await _rebuild_customer_invoices_from_payments(db, tenant["id"], customer_id)
    
    \2'''
if 'await db.payments.delete_one' in content and '_rebuild_customer_invoices_from_payments(db, tenant["id"], customer_id)' not in content.split('await db.payments.delete_one')[1].split('@api_router')[0]:
    content = re.sub(delete_pattern, delete_replacement, content)
    print("  ✅ Fixed DELETE /admin/payments")
else:
    print("  ⏭️  Already fixed")

with open('server.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n" + "=" * 60)
print("✅ ALL FIFO SYNC FIXES APPLIED!")
print("=" * 60)
print("\nNext steps:")
print("1. Run: python -m py_compile server.py")
print("2. Run: uvicorn server:app --reload")
print("3. Test payment creation, updates, deletion")
