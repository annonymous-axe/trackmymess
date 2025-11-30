/**
 * EditCustomerModal Component
 * Modal for editing existing customer details
 */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios, { API } from '@/lib/http';
import { toast } from 'sonner';

export function EditCustomerModal({ isOpen, onOpenChange, customer, onCustomerUpdated }) {
    const [mealPlans, setMealPlans] = useState([]);
    const [formData, setFormData] = useState({
        full_name: '',
        gender: 'MALE',
        mobile: '',
        email: '',
        address: '',
        meal_plan_id: '',
        monthly_rate: '',
        security_deposit: '',
        id_proof_type: '',
        id_proof_number: '',
        is_active: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMealPlans();
            if (customer) {
                // Populate form with customer data
                setFormData({
                    full_name: customer.full_name || '',
                    gender: customer.gender || 'MALE',
                    mobile: customer.mobile || '',
                    email: customer.email || '',
                    address: customer.address || '',
                    meal_plan_id: customer.meal_plan_id || '',
                    monthly_rate: customer.monthly_rate?.toString() || '',
                    security_deposit: customer.security_deposit?.toString() || '',
                    id_proof_type: customer.id_proof_type || '',
                    id_proof_number: customer.id_proof_number || '',
                    is_active: customer.is_active ?? true,
                });
            }
        }
    }, [isOpen, customer]);

    const fetchMealPlans = async () => {
        try {
            const plansRes = await axios.get(`${API}/admin/meal-plans`);
            setMealPlans(plansRes.data.filter(p => p.is_active));
        } catch (error) {
            toast.error('Failed to fetch meal plans');
        }
    };

    const handleMealPlanChange = (planId) => {
        const plan = mealPlans.find(p => p.id === planId);
        setFormData(prev => ({
            ...prev,
            meal_plan_id: planId,
            monthly_rate: plan ? String(plan.rate) : prev.monthly_rate,
        }));
    };

    const validateForm = () => {
        if (!formData.full_name.trim()) {
            toast.error('Full name is required');
            return false;
        }
        if (!formData.mobile.trim() || !/^\d{10}$/.test(formData.mobile.trim())) {
            toast.error('Mobile must be exactly 10 digits');
            return false;
        }
        if (!formData.address.trim()) {
            toast.error('Address is required');
            return false;
        }
        if (!formData.meal_plan_id) {
            toast.error('Please select a meal plan');
            return false;
        }
        if (!formData.monthly_rate || parseFloat(formData.monthly_rate) <= 0) {
            toast.error('Monthly rate must be greater than 0');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const submitData = {
                full_name: formData.full_name.trim(),
                gender: formData.gender,
                mobile: formData.mobile.trim(),
                email: formData.email?.trim() || null,
                address: formData.address.trim(),
                meal_plan_id: formData.meal_plan_id,
                monthly_rate: parseFloat(formData.monthly_rate),
                security_deposit: parseFloat(formData.security_deposit) || 0,
                id_proof_type: formData.id_proof_type?.trim() || null,
                id_proof_number: formData.id_proof_number?.trim() || null,
                is_active: formData.is_active,
            };

            await axios.put(`${API}/admin/customers/${customer.id}`, submitData);
            toast.success('Customer updated successfully');
            onOpenChange(false);
            onCustomerUpdated();
        } catch (error) {
            const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Failed to update customer';
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Customer</DialogTitle>
                    <DialogDescription>Update customer information</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_full_name">Full Name *</Label>
                            <Input
                                id="edit_full_name"
                                value={formData.full_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_gender">Gender *</Label>
                            <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">Male</SelectItem>
                                    <SelectItem value="FEMALE">Female</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_mobile">Mobile * (10 digits)</Label>
                            <Input
                                id="edit_mobile"
                                type="tel"
                                pattern="[0-9]{10}"
                                maxLength={10}
                                value={formData.mobile}
                                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value.replace(/\D/g, '') }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_email">Email</Label>
                            <Input
                                id="edit_email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_address">Address *</Label>
                        <Input
                            id="edit_address"
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_meal_plan">Meal Plan *</Label>
                            <Select
                                value={formData.meal_plan_id}
                                onValueChange={handleMealPlanChange}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select meal plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mealPlans.map((plan) => (
                                        <SelectItem key={plan.id} value={plan.id}>
                                            {plan.name} - ₹{plan.rate}/{plan.billing_type === 'MONTHLY' ? 'month' : 'day'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_monthly_rate">Monthly Rate *</Label>
                            <Input
                                id="edit_monthly_rate"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.monthly_rate}
                                onChange={(e) => setFormData(prev => ({ ...prev, monthly_rate: e.target.value }))}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_security_deposit">Security Deposit</Label>
                            <Input
                                id="edit_security_deposit"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.security_deposit}
                                onChange={(e) => setFormData(prev => ({ ...prev, security_deposit: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_is_active">Status</Label>
                            <Select value={formData.is_active ? 'active' : 'inactive'} onValueChange={(value) => setFormData(prev => ({ ...prev, is_active: value === 'active' }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_id_proof_type">ID Proof Type</Label>
                            <Input
                                id="edit_id_proof_type"
                                placeholder="e.g., Aadhar, PAN"
                                value={formData.id_proof_type}
                                onChange={(e) => setFormData(prev => ({ ...prev, id_proof_type: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_id_proof_number">ID Proof Number</Label>
                            <Input
                                id="edit_id_proof_number"
                                value={formData.id_proof_number}
                                onChange={(e) => setFormData(prev => ({ ...prev, id_proof_number: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="flex-1 bg-primary hover:bg-primary-600 text-white">
                            {isSubmitting ? 'Updating...' : 'Update Customer'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
