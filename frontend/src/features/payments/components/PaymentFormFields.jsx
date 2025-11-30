/**
 * PaymentFormFields Component
 * Shared form fields for both Record and Edit Payment modals
 */
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PAYMENT_METHODS = [
    { value: 'CASH', label: 'Cash' },
    { value: 'UPI', label: 'UPI' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'RAZORPAY', label: 'Razorpay (Online)' },
];

export function PaymentFormFields({ formData, setFormData, customers, disabled = false }) {
    return (
        <div className="space-y-4">
            {/* Customer Selector */}
            <div className="space-y-2">
                <Label htmlFor="customer_id">Customer *</Label>
                <Select
                    value={formData.customer_id}
                    onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                    disabled={disabled}
                >
                    <SelectTrigger id="customer_id" className="h-11">
                        <SelectValue placeholder="Select customer..." />
                    </SelectTrigger>
                    <SelectContent>
                        {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                                {customer.full_name} - {customer.mobile}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    disabled={disabled}
                    className="h-11"
                />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method *</Label>
                <Select
                    value={formData.payment_method}
                    onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                    disabled={disabled}
                >
                    <SelectTrigger id="payment_method" className="h-11">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                                {method.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Transaction ID */}
            <div className="space-y-2">
                <Label htmlFor="transaction_id">Transaction ID</Label>
                <Input
                    id="transaction_id"
                    value={formData.transaction_id}
                    onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                    placeholder="Optional"
                    disabled={disabled}
                    className="h-11"
                />
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Optional notes"
                    rows={3}
                    disabled={disabled}
                />
            </div>
        </div>
    );
}
