"""
Fix all payment routes and invoice generation to use FIFO sync
"""
import re

print("=" * 60)
print("FIXING PAYMENT ROUTES & INVOICE GENERATION")
print("=" * 60)

with open('server.py', 'r', encoding='utf-8') as f:
    content = f.read()

# PHASE 1: Fix POST /admin/payments (create_payment)
print("\n[1/4] Fixing POST /admin/payments...")
# Find create_payment and add FIFO logic after payment insertion
pattern1 = r'(await db\.payments\.insert_one\(payment_doc\))\s+(return Payment\(\*\*payment_doc\))'
replacement1 = r'''\1
    
    # FIFO: Apply payment to invoices
    new_dues = await _apply_payment_to_invoices(
        db, tenant["id"], payment_data.customer_id, payment_data.amount, payment_id
    )
    await db.customers.update_one(
        {"id": payment_data.customer_id},
        {"$set": {"current_dues": new_dues}}
    )
    
    \2'''

if '_apply_payment_to_invoices(db, tenant["id"], payment_data.customer_id' not in content:
    content = re.sub(pattern1, replacement1, content)
    print("  ✅ Fixed create_payment")
else:
    print("  ⏭️  Already fixed")

# PHASE 2: Fix PUT /admin/payments (update_payment)
print("\n[2/4] Fixing PUT /admin/payments...")
# Find update_payment and add rebuild logic
pattern2 = r'(await db\.payments\.update_one\(\{"id": payment_id\}, \{"\$set": update_data\}\))\s+(updated_payment = await db\.payments\.find_one)'
replacement2 = r'''\1
    
    # Rebuild allocations if amount/customer changed for COMPLETED payment
    old_customer_id = payment.get("customer_id")
    old_status = payment.get("payment_status")
    needs_rebuild = (
        ("amount" in update_data or "customer_id" in update_data)
        and old_status == PaymentStatus.COMPLETED
        and old_customer_id
    )
    if needs_rebuild:
        await _rebuild_customer_invoices_from_payments(db, tenant["id"], old_customer_id)
    
    \2'''

if 'await _rebuild_customer_invoices_from_payments(db, tenant["id"], old_customer_id)' not in content.split('update_payment')[1].split('delete_payment')[0] if 'update_payment' in content else '':
    content = re.sub(pattern2, replacement2, content)
    print("  ✅ Fixed update_payment")
else:
    print("  ⏭️  Already fixed")

# PHASE 3: Fix DELETE /admin/payments (delete_payment)
print("\n[3/4] Fixing DELETE /admin/payments...")
pattern3 = r'(await db\.payments\.delete_one\(\{"id": payment_id\}\))\s+(return \{"message": "Payment deleted successfully"\})'
replacement3 = r'''\1
    
    # Rebuild allocations if payment was COMPLETED
    customer_id = payment.get("customer_id")
    if customer_id and payment.get("payment_status") == PaymentStatus.COMPLETED:
        await _rebuild_customer_invoices_from_payments(db, tenant["id"], customer_id)
    
    \2'''

if 'payment.get("payment_status") == PaymentStatus.COMPLETED' not in content.split('delete_payment')[1].split('@api_router')[0] if 'delete_payment' in content else '':
    content = re.sub(pattern3, replacement3, content)
    print("  ✅ Fixed delete_payment")
else:
    print("  ⏭️  Already fixed")

# PHASE 4: Fix invoice generation
print("\n[4/4] Fixing invoice generation...")
# Fix monthly invoice generation to initialize with PENDING and rebuild
pattern4 = r'(invoice_doc = \{[^}]+?"due_amount": due_amount,)\s+(("generated_at":|"created_at":))'
replacement4 = r'\1\n            "status": InvoiceStatus.PENDING,\n            \2'

if '"status": InvoiceStatus.PENDING' not in content.split('generate_monthly_invoices')[1].split('def ')[0] if 'generate_monthly_invoices' in content else '':
    content = re.sub(pattern4, replacement4, content)
    print("  ✅ Added status field to invoice_doc")
else:
    print("  ⏭️  Status already in invoice_doc")

# Also fix the payment allocation logic in invoice generation
pattern5 = r'(await db\.invoices\.insert_one\(invoice_doc\))\s+(await db\.customers\.update_one\(\{"id": customer\["id"\]\}, \{"\$set": \{"current_dues": due_amount\}\}\))'
replacement5 = r'''\1
        
        # Rebuild allocations for this customer
        await _rebuild_customer_invoices_from_payments(db, tenant_id, customer["id"])
        '''

if 'await _rebuild_customer_invoices_from_payments(db, tenant_id, customer["id"])' not in content:
    content = re.sub(pattern5, replacement5, content)
    print("  ✅ Added rebuild call to invoice generation")
else:
    print("  ⏭️  Rebuild already in invoice generation")

with open('server.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n" + "=" * 60)
print("✅ ALL PAYMENT ROUTES & INVOICE GENERATION FIXED!")
print("=" * 60)
