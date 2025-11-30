import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import axios, { API } from '@/lib/http';
import { toast } from 'sonner';
import { Plus, Edit, Eye, RefreshCw } from 'lucide-react';

const PLANS = [
  { value: 'FREE_TRIAL', label: 'Free Trial', capacity: 50, price: 0 },
  { value: 'BASIC', label: 'Basic', capacity: 100, price: 500 },
  { value: 'STANDARD', label: 'Standard', capacity: 300, price: 1000 },
  { value: 'PREMIUM', label: 'Premium', capacity: 999999, price: 2000 },
  { value: 'ENTERPRISE', label: 'Enterprise', capacity: 999999, price: 0 },
];

const STATUS_COLORS = {
  ACTIVE: 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300',
  TRIAL: 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300',
  EXPIRED: 'bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-300',
  SUSPENDED: 'bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-300',
};

// Helper function to format error messages from FastAPI validation errors
const formatErrorMessage = (error) => {
  try {
    // Handle network errors
    if (!error || !error.response) {
      return 'Network error. Please check your connection.';
    }

    const { data } = error.response;

    // If data is null or undefined
    if (!data) {
      return 'An error occurred. Please try again.';
    }

    // Handle FastAPI validation errors (array of error objects)
    if (Array.isArray(data)) {
      const messages = data.map(err => {
        if (typeof err === 'string') return err;
        if (err && typeof err === 'object' && err.msg) return String(err.msg);
        return 'Validation error';
      }).filter(Boolean);
      return messages.length > 0 ? messages.join(', ') : 'Validation error occurred';
    }

    // Handle validation errors with detail array
    if (data.detail && Array.isArray(data.detail)) {
      const messages = data.detail.map(err => {
        if (typeof err === 'string') return err;
        if (err && typeof err === 'object') {
          if (err.msg) {
            const field = err.loc && Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : '';
            const message = String(err.msg);
            return field ? `${field}: ${message}` : message;
          }
          // If error object has no msg field, try to extract any useful info
          if (err.type) return `Validation error: ${err.type}`;
        }
        return 'Validation error';
      }).filter(Boolean);
      return messages.length > 0 ? messages.join(', ') : 'Validation error occurred';
    }

    // Handle simple string detail
    if (data.detail) {
      if (typeof data.detail === 'string') {
        return data.detail;
      }
      // If detail is an object, try to extract a message
      if (typeof data.detail === 'object' && data.detail.msg) {
        return String(data.detail.msg);
      }
    }

    // Handle message field
    if (data.message && typeof data.message === 'string') {
      return data.message;
    }

    // Last resort: try to stringify safely
    if (typeof data === 'string') {
      return data;
    }

    // Absolute fallback
    return 'An error occurred. Please try again.';
  } catch {
    // If anything goes wrong in error formatting, return safe string
    return 'An error occurred. Please try again.';
  }
};

export default function ClientManagement() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [renewingTenantId, setRenewingTenantId] = useState(null);
  const [renewMonths, setRenewMonths] = useState(1);
  const [renewPlan, setRenewPlan] = useState('BASIC');
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    mess_name: '',
    email: '',
    mobile: '',
    address: '',
    password: '',
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API}/super-admin/tenants`);
      setClients(response.data);
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        mess_name: formData.mess_name,
        email: formData.email,
        password: formData.password,
        mobile: formData.mobile,
        address: formData.address,
      };
      await axios.post(`${API}/super-admin/tenants`, payload);
      toast.success('Client created successfully');
      setShowAddDialog(false);
      resetForm();
      fetchClients();
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      mess_name: client.mess_name,
      email: client.email,
      mobile: client.mobile,
      address: client.address,
      password: '',
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        mess_name: formData.mess_name,
        owner_name: formData.owner_name,
        mobile: formData.mobile,
        address: formData.address,
        capacity: formData.capacity,
        subscription_plan: formData.subscription_plan,
      };
      await axios.put(`${API}/super-admin/tenants/${editingClient.id}`, updateData);
      toast.success('Client updated successfully');
      setShowEditDialog(false);
      setEditingClient(null);
      resetForm();
      fetchClients();
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      mess_name: '',
      email: '',
      mobile: '',
      address: '',
      password: '',
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Layout title="Client Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Client & Mess Owner Management">
      <div className="space-y-6 fade-in">
        {/* Info Banner */}
        <div className="bg-primary-50 border-l-4 border-primary-500 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-primary-800 font-medium">
                Adding a new client creates both the mess/canteen account AND an admin login for the mess owner.
              </p>
              <p className="text-xs text-primary-700 mt-1">
                The mess owner can then use their username and password to manage customers, staff, attendance, and payments.
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-foreground font-semibold">Total Mess Owners: {clients.length}</p>
            <p className="text-sm text-muted-foreground">Each client includes mess details and admin login</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white shadow-lg" data-testid="add-client-button">
                <Plus className="w-4 h-4 mr-2" />
                Add New Mess Owner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Mess Owner / Client</DialogTitle>
                <DialogDescription>Create a new mess/canteen with admin login credentials</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mess_name">Mess Name *</Label>
                    <Input
                      id="mess_name"
                      value={formData.mess_name}
                      onChange={(e) => setFormData({ ...formData, mess_name: e.target.value })}
                      required
                      data-testid="mess-name-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      data-testid="email-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile *</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      pattern="[0-9]{10}"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      required
                      data-testid="mobile-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password * (min 8 characters)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                      data-testid="password-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    data-testid="address-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      required
                      data-testid="capacity-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subscription_plan">Subscription Plan *</Label>
                    <Select
                      value={formData.subscription_plan}
                      onValueChange={(value) => setFormData({ ...formData, subscription_plan: value })}
                    >
                      <SelectTrigger data-testid="plan-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLANS.map((plan) => (
                          <SelectItem key={plan.value} value={plan.value}>
                            {plan.label} - ₹{plan.price}/month
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full gradient-primary text-white" data-testid="submit-client-button">
                  Create Client
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div >

        {/* Clients Table */}
        < Card className="glass" >
          <CardHeader>
            <CardTitle>All Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Mess Name</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Owner</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Mobile</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Customers</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Expiry</th>
                    <th className="text-center p-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b hover:bg-muted" data-testid={`client-row-${client.id}`}>
                      <td className="p-3">
                        <p className="font-medium text-foreground">{client.mess_name}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </td>
                      <td className="p-3">{client.owner_name}</td>
                      <td className="p-3">{client.mobile}</td>
                      <td className="p-3">
                        <Badge variant="outline">{client.subscription_plan}</Badge>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">{client.customer_count}</span> / {client.capacity}
                      </td>
                      <td className="p-3">
                        <Badge className={STATUS_COLORS[client.status]}>{client.status}</Badge>
                      </td>
                      <td className="p-3 text-sm">{formatDate(client.subscription_end)}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(client)}
                            data-testid={`edit-client-${client.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setRenewingTenantId(client.id); setShowRenewDialog(true); }}
                            data-testid={`renew-client-${client.id}`}
                          >
                            Renew
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {clients.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No clients found. Add your first client to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card >

        {/* Edit Client Dialog */}
        < Dialog open={showEditDialog} onOpenChange={setShowEditDialog} >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>Update client/tenant details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_mess_name">Mess Name *</Label>
                  <Input
                    id="edit_mess_name"
                    value={formData.mess_name}
                    onChange={(e) => setFormData({ ...formData, mess_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_owner_name">Owner Name *</Label>
                  <Input
                    id="edit_owner_name"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_mobile">Mobile * (10 digits)</Label>
                  <Input
                    id="edit_mobile"
                    type="tel"
                    pattern="[0-9]{10}"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_capacity">Capacity *</Label>
                  <Input
                    id="edit_capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_address">Address *</Label>
                <Input
                  id="edit_address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_subscription_plan">Subscription Plan *</Label>
                <Select
                  value={formData.subscription_plan}
                  onValueChange={(value) => setFormData({ ...formData, subscription_plan: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANS.map((plan) => (
                      <SelectItem key={plan.value} value={plan.value}>
                        {plan.label} - ₹{plan.price}/month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full gradient-primary text-white">
                Update Client
              </Button>
            </form>
          </DialogContent>
        </Dialog >
        {/* Manual Renew Dialog for SuperAdmin */}
        < Dialog open={showRenewDialog} onOpenChange={setShowRenewDialog} >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manual Renew Tenant</DialogTitle>
              <DialogDescription>Extend the subscription for the selected tenant</DialogDescription>
            </DialogHeader>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!renewingTenantId) return toast.error('No tenant selected');
              try {
                await axios.post(`${API}/super-admin/subscriptions/renew/${renewingTenantId}`, { months: renewMonths });
                toast.success('Tenant renewed successfully');
                setShowRenewDialog(false);
                setRenewingTenantId(null);
                fetchClients();
              } catch (err) {
                toast.error(err.response?.data?.detail || 'Failed to renew');
              }
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="renew_months">Months *</Label>
                <Input id="renew_months" type="number" min="1" value={renewMonths} onChange={(e) => setRenewMonths(parseInt(e.target.value || '1'))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="renew_plan">(Optional) Change Plan</Label>
                <Select value={renewPlan} onValueChange={(v) => setRenewPlan(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANS.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label} - ₹{p.price}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="w-full">Renew</Button>
                <Button type="button" variant="ghost" onClick={() => { setShowRenewDialog(false); setRenewingTenantId(null); }}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog >
      </div >
    </Layout >
  );
}
