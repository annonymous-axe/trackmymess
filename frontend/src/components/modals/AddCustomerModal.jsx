import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios, { API } from '@/lib/http';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export function AddCustomerModal({ isOpen, onOpenChange, onCustomerAdded }) {
  const [mealPlans, setMealPlans] = useState([]);
  const [formData, setFormData] = useState({
    full_name: '',
    gender: 'MALE',
    mobile: '',
    email: '',
    address: '',
    joining_date: new Date().toISOString().split('T')[0],
    meal_plan_id: '',
    monthly_rate: '',
    security_deposit: '',
    id_proof_type: '',
    id_proof_number: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchMealPlans();
      resetForm();
    }
  }, [isOpen]);

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
      monthly_rate: plan ? String(plan.rate) : '',
    }));
  };

  const preparePayload = (data) => {
    const joiningDateTime = data.joining_date ? new Date(data.joining_date + 'T00:00:00Z').toISOString() : new Date().toISOString();

    return {
      full_name: data.full_name.trim(),
      gender: data.gender,
      mobile: data.mobile.trim(),
      email: data.email?.trim() || null,
      address: data.address.trim(),
      joining_date: joiningDateTime,
      meal_plan_id: data.meal_plan_id,
      monthly_rate: parseFloat(data.monthly_rate) || 0,
      security_deposit: parseFloat(data.security_deposit) || 0,
      id_proof_type: data.id_proof_type?.trim() || null,
      id_proof_number: data.id_proof_number?.trim() || null,
    };
  };

  const getErrorMessage = (err, fallback = 'An error occurred') => {
    try {
      const resp = err?.response?.data;
      if (!resp) return err?.message || fallback;

      const detail = resp.detail ?? resp.message ?? resp.error ?? resp;

      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail)) {
        return detail.map(d => {
          if (typeof d === 'object' && d.msg) {
            const field = d.loc ? d.loc.join('.') : '';
            return field ? `${field}: ${d.msg}` : d.msg;
          }
          return typeof d === 'string' ? d : JSON.stringify(d);
        }).join('; ');
      }
      if (typeof detail === 'object' && detail !== null) {
        if ('msg' in detail) return detail.msg;
        if ('errors' in detail && Array.isArray(detail.errors)) {
          return detail.errors.map(e => e.msg || JSON.stringify(e)).join('; ');
        }
        return JSON.stringify(detail);
      }

      return String(detail);
    } catch (e) {
      return fallback;
    }
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

    try {
      const submitData = preparePayload(formData);
      await axios.post(`${API}/admin/customers`, submitData);
      toast.success('Customer added successfully');
      onOpenChange(false);
      onCustomerAdded();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to add customer'));
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      gender: 'MALE',
      mobile: '',
      email: '',
      address: '',
      joining_date: new Date().toISOString().split('T')[0],
      meal_plan_id: '',
      monthly_rate: '',
      security_deposit: '',
      id_proof_type: '',
      id_proof_number: '',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>Register a new customer to your mess</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
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
              <Label htmlFor="mobile">Mobile * (10 digits)</Label>
              <Input
                id="mobile"
                type="tel"
                pattern="[0-9]{10}"
                maxLength={10}
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value.replace(/\D/g, '') }))}
                required
                placeholder="1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="customer@example.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              required
              placeholder="Full address"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="joining_date">Joining Date *</Label>
              <Input
                id="joining_date"
                type="date"
                value={formData.joining_date}
                onChange={(e) => setFormData(prev => ({ ...prev, joining_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meal_plan_id">Meal Plan *</Label>
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly_rate">Monthly Rate *</Label>
              <Input
                id="monthly_rate"
                type="number"
                min="0"
                step="0.01"
                value={formData.monthly_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, monthly_rate: e.target.value }))}
                required
                placeholder="3000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="security_deposit">Security Deposit</Label>
              <Input
                id="security_deposit"
                type="number"
                min="0"
                step="0.01"
                value={formData.security_deposit}
                onChange={(e) => setFormData(prev => ({ ...prev, security_deposit: e.target.value }))}
                placeholder="1000"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id_proof_type">ID Proof Type</Label>
              <Input
                id="id_proof_type"
                placeholder="e.g., Aadhar, PAN"
                value={formData.id_proof_type}
                onChange={(e) => setFormData(prev => ({ ...prev, id_proof_type: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="id_proof_number">ID Proof Number</Label>
              <Input
                id="id_proof_number"
                value={formData.id_proof_number}
                onChange={(e) => setFormData(prev => ({ ...prev, id_proof_number: e.target.value }))}
                placeholder="1234 5678 9012"
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary-600 text-white">
            Add Customer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}