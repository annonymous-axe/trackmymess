"""
Simpler line-based approach to add remaining FIFO fixes
"""
print("Reading server.py...")
with open('server.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")

# Step 1: Find Invoice model and add status field
print("Step 1: Adding status field to Invoice model...")
for i, line in enumerate(lines):
    if 'class Invoice(BaseModel):' in line:
        # Find due_amount line
        for j in range(i, min(i+30, len(lines))):
            if 'due_amount: float' in lines[j] and 'generated_at: datetime' in lines[j+1]:
                # Insert status field between them
                indent = '    '
                lines.insert(j+1, f'{indent}status: Optional[InvoiceStatus] = InvoiceStatus.PENDING\r\n')
                print(f"✅ Added status field at line {j+2}")
                break
        break

# Step 2: Add helper functions after get_tenant_info
print("Step 2: Adding FIFO helper functions...")
for i, line in enumerate(lines):
    if 'return tenant_doc' in line and i > 500:  # get_tenant_info function
        # Check if next few lines have initialize_default_data
        found_init = False
        for j in range(i+1, min(i+10, len(lines))):
            if 'Initialize default data' in lines[j] or 'async def initialize_default_data' in lines[j]:
                found_init = True
                # Insert helper functions here
                helper_funcs = '''
# Helper Functions for Payment-Invoice FIFO Sync
async def _apply_payment_to_invoices(
    db,
    tenant_id: str,
    customer_id: str,
    payment_amount: float,
    payment_id: str
) -> float:
    """Apply payment to customer's unpaid invoices using FIFO (oldest first)."""
    invoices = await db.invoices.find(
        {
            "tenant_id": tenant_id,
            "customer_id": customer_id,
            "due_amount": {"$gt": 0}
        },
        {"_id": 0}
    ).sort("generated_at", 1).to_list(1000)
    
    remaining_payment = payment_amount
    
    for invoice in invoices:
        if remaining_payment <= 0:
            break
        
        current_due = invoice.get("due_amount", 0)
        amount_to_apply = min(remaining_payment, current_due)
        
        if amount_to_apply > 0:
            new_paid_amount = invoice.get("paid_amount", 0) + amount_to_apply
            new_due_amount = max(0, invoice.get("total_amount", 0) - new_paid_amount)
            
            if new_due_amount == 0:
                new_status = InvoiceStatus.PAID
            elif new_paid_amount > 0:
                new_status = InvoiceStatus.PARTIALLY_PAID
            else:
                new_status = InvoiceStatus.PENDING
            
            await db.invoices.update_one(
                {"id": invoice["id"]},
                {"$set": {
                    "paid_amount": new_paid_amount,
                    "due_amount": new_due_amount,
                    "status": new_status
                }}
            )
            
            remaining_payment -= amount_to_apply
    
    total_dues = await _recalculate_customer_dues(db, customer_id, tenant_id)
    return total_dues


async def _recalculate_customer_dues(
    db,
    customer_id: str,
    tenant_id: str
) -> float:
    """Recalculate customer's total dues from all invoices."""
    invoices = await db.invoices.find(
        {"customer_id": customer_id, "tenant_id": tenant_id},
        {"_id": 0, "due_amount": 1}
    ).to_list(10000)
    
    total_dues = sum(inv.get("due_amount", 0) for inv in invoices)
    return total_dues


async def _rebuild_customer_invoices_from_payments(
    db,
    tenant_id: str,
    customer_id: str
) -> None:
    """Rebuild all invoice allocations for a customer from scratch."""
    # 1. Reset all invoices
    invoices = await db.invoices.find(
        {"customer_id": customer_id, "tenant_id": tenant_id},
        {"_id": 0}
    ).to_list(10000)
    
    for inv in invoices:
        await db.invoices.update_one(
            {"id": inv["id"]},
            {"$set": {
                "paid_amount": 0,
                "due_amount": inv.get("total_amount", 0),
                "status": InvoiceStatus.PENDING
            }}
        )
    
    # 2. Get all COMPLETED payments in chronological order
    all_payments = await db.payments.find({
        "customer_id": customer_id,
        "tenant_id": tenant_id,
        "payment_status": PaymentStatus.COMPLETED
    }, {"_id": 0}).sort("payment_date", 1).to_list(10000)
    
    # 3. Reapply all payments in order
    for pmt in all_payments:
        await _apply_payment_to_invoices(
            db,
            tenant_id,
            customer_id,
            pmt["amount"],
            pmt["id"]
        )
    
    # 4. Update customer dues
    new_dues = await _recalculate_customer_dues(db, customer_id, tenant_id)
    await db.customers.update_one(
        {"id": customer_id},
        {"$set": {"current_dues": new_dues}}
    )

'''
                lines.insert(j, helper_funcs)
                print(f"✅ Added helper functions at line {j+1}")
                break
        if found_init:
            break

print("Writing updated server.py...")
with open('server.py', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("✅ All infrastructure fixes applied!")
print("Next: Compile check...")
