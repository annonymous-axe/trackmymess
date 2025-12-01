"""
MASTER FIX: Reconstruct Invoice model correctly and add all FIFO sync
"""
print("Reading server.py...")
with open('server.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Finding Invoice model...")
# Find and fix Invoice model
for i, line in enumerate(lines):
    if 'class Invoice(BaseModel):' in line:
        print(f"Found Invoice class at line {i+1}")
        # Find where this class ends (next class definition)
        end_idx = i + 1
        for j in range(i+1, len(lines)):
            if lines[j].strip().startswith('class ') and 'BaseModel' in lines[j]:
                end_idx = j
                break
        
        # Replace the entire Invoice class
        correct_invoice = '''class Invoice(BaseModel):
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
    status: Optional[InvoiceStatus] = InvoiceStatus.PENDING
    generated_at: datetime

'''
        lines[i:end_idx] = [correct_invoice]
        print(f"✅ Fixed Invoice model (replaced lines {i+1} to {end_idx})")
        break

# Now add helper functions if not present
print("\nSearching for helper functions...")
has_helpers = any('_apply_payment_to_invoices' in line for line in lines)

if not has_helpers:
    print("Adding FIFO helper functions...")
    # Find initialize_default_data
    for i, line in enumerate(lines):
        if 'async def initialize_default_data' in line:
            helpers = '''# Helper Functions for Payment-Invoice FIFO Sync
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
            lines.insert(i, helpers)
            print(f"✅ Added helper functions before initialize_default_data at line {i+1}")
            break
else:
    print("  ⏭️  Helper functions already exist")

print("\nWriting fixed server.py...")
with open('server.py', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("\n✅ MASTER FIX COMPLETE!")
print("\nChanges:")
print("  1. Fixed Invoice model with correct fields")
print("  2. Added status field to Invoice")
print("  3. Added 3 FIFO helper functions")
print("\nNext: Test with python -m py_compile server.py")
