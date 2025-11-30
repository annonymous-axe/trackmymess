import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import axios, { API } from '@/lib/http';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export function CreatePauseRequestModal({ isOpen, onOpenChange, onPauseRequestCreated }) {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    reason: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      resetForm();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      const customersRes = await axios.get(`${API}/admin/customers`);
      setCustomers(customersRes.data.filter(c => c.is_active));
    } catch (error) {
      toast.error('Failed to fetch customers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };
      await axios.post(`${API}/admin/pause-requests`, submitData);
      toast.success('Pause request created successfully');
      onOpenChange(false);
      onPauseRequestCreated();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create pause request');
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      reason: '',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Pause Request</DialogTitle>
          <DialogDescription>Pause meal service for a customer</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer_id">Customer *</Label>
            <Select
              value={formData.customer_id}
              onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
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
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500">
            Create Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}