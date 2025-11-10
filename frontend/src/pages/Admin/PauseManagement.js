import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { API } from '@/App';
import { toast } from 'sonner';
import { Plus, Check, X } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export default function PauseManagement() {
  const [requests, setRequests] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    reason: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsRes, customersRes] = await Promise.all([
        axios.get(`${API}/admin/pause-requests`),
        axios.get(`${API}/admin/customers`),
      ]);
      setRequests(requestsRes.data);
      setCustomers(customersRes.data.filter(c => c.is_active));
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
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
      setShowAddDialog(false);
      setFormData({
        customer_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        reason: '',
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create pause request');
    }
  };

  const handleUpdateStatus = async (requestId, status, notes = '') => {
    try {
      await axios.put(`${API}/admin/pause-requests/${requestId}`, {
        status,
        admin_notes: notes,
      });
      toast.success(`Request ${status.toLowerCase()}`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update request');
    }
  };

  if (loading) {
    return (
      <Layout title="Pause Request Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Pause Request Management">
      <div className="space-y-6 fade-in">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <p className="text-gray-600">Total Requests: {requests.length}</p>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500" data-testid="add-pause-request-button">
                <Plus className="w-4 h-4 mr-2" />
                Create Pause Request
              </Button>
            </DialogTrigger>
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
                    <SelectTrigger data-testid="customer-select">
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
                      data-testid="start-date-input"
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
                      data-testid="end-date-input"
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
                    data-testid="reason-textarea"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500" data-testid="submit-pause-request-button">
                  Create Request
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Requests List */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>All Pause Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  data-testid={`pause-request-${request.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{request.customer_name}</h4>
                        <Badge className={STATUS_COLORS[request.status]}>{request.status}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <strong>Duration:</strong> {format(new Date(request.start_date), 'dd MMM yyyy')} to{' '}
                          {format(new Date(request.end_date), 'dd MMM yyyy')}
                        </p>
                        <p><strong>Reason:</strong> {request.reason}</p>
                        {request.admin_notes && (
                          <p><strong>Admin Notes:</strong> {request.admin_notes}</p>
                        )}
                        <p className="text-xs">
                          <strong>Created:</strong> {format(new Date(request.created_at), 'dd MMM yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    {request.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:bg-green-50"
                          onClick={() => handleUpdateStatus(request.id, 'APPROVED')}
                          data-testid={`approve-${request.id}`}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleUpdateStatus(request.id, 'REJECTED')}
                          data-testid={`reject-${request.id}`}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {requests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No pause requests found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
