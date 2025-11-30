/**
 * EditPaymentModal Component
 * Modal for editing an existing payment
 */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
import { PaymentFormFields } from './PaymentFormFields';

export function EditPaymentModal({ isOpen, onOpenChange, payment, onSubmit, isSubmitting }) {
    const [formData, setFormData] = useState({
        customer_id: '',
        amount: '',
        payment_method: 'CASH',
        transaction_id: '',
        notes: '',
    });
    const { data: customers = [] } = useCustomers();

    // Load payment data when modal opens
    useEffect(() => {
        if (payment && isOpen) {
            setFormData({
                customer_id: payment.customer_id || '',
                amount: payment.amount || '',
                payment_method: payment.payment_method || 'CASH',
                transaction_id: payment.transaction_id || '',
                notes: payment.notes || '',
            });
        }
    }, [payment, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.customer_id) {
            alert('Please select a customer');
            return;
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        onSubmit(payment.id, formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Edit Payment</DialogTitle>
                    <DialogDescription>Update payment details</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <PaymentFormFields
                        formData={formData}
                        setFormData={setFormData}
                        customers={customers}
                        disabled={isSubmitting}
                    />

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="flex-1 h-11"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-primary hover:bg-primary-600 text-white h-11"
                        >
                            {isSubmitting ? 'Updating...' : 'Update Payment'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
