/**
 * RecordPaymentModal Component
 * Modal for recording a new payment
 */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
import { PaymentFormFields } from './PaymentFormFields';

const INITIAL_FORM_DATA = {
    customer_id: '',
    amount: '',
    payment_method: 'CASH',
    transaction_id: '',
    notes: '',
};

export function RecordPaymentModal({ isOpen, onOpenChange, onSubmit, isSubmitting }) {
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const { data: customers = [] } = useCustomers();

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

        onSubmit(formData);
    };

    const handleClose = (open) => {
        if (!open && !isSubmitting) {
            setFormData(INITIAL_FORM_DATA);
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Record Payment</DialogTitle>
                    <DialogDescription>Record a new payment from a customer</DialogDescription>
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
                            onClick={() => handleClose(false)}
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
                            {isSubmitting ? 'Recording...' : 'Record Payment'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
