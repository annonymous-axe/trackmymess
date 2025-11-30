/**
 * CreatePauseRequestModal Component
 * Modal for creating a new pause request
 */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomers } from '@/features/customers/hooks/useCustomers';

export function CreatePauseRequestModal({ isOpen, onOpenChange, onSubmit, isSubmitting }) {
    const [formData, setFormData] = useState({
        customer_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        reason: '',
    });

    // Fetch active customers for selector
    const { data: allCustomers = [] } = useCustomers();
    const customers = allCustomers.filter(c => c.is_active);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                customer_id: '',
                start_date: new Date().toISOString().split('T')[0],
                end_date: '',
                reason: '',
            });
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.customer_id) {
            return;
        }
        if (!formData.end_date) {
            return;
        }
        if (new Date(formData.end_date) <= new Date(formData.start_date)) {
            return;
        }

        onSubmit(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Create Pause Request</DialogTitle>
                    <DialogDescription>
                        Create a new pause request for a customer's meal service
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Customer Selector */}
                    <div className="space-y-2">
                        <Label htmlFor="customer_id">Customer *</Label>
                        <Select
                            value={formData.customer_id}
                            onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                            required
                        >
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.map((customer) => (
                                    <SelectItem key={customer.id} value={customer.id.toString()}>
                                        {customer.full_name} ({customer.mobile})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_date">Start Date *</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end_date">End Date *</Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                min={formData.start_date}
                                required
                                className="h-11"
                            />
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea
                            id="reason"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            placeholder="Optional reason for the pause request"
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
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
                            {isSubmitting ? 'Creating...' : 'Create Request'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
