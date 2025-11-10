import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { API } from '@/App';
import { toast } from 'sonner';
import { Plus, Edit, Eye } from 'lucide-react';

const PLANS = [
  { value: 'FREE_TRIAL', label: 'Free Trial', capacity: 50, price: 0 },
  { value: 'BASIC', label: 'Basic', capacity: 100, price: 500 },
  { value: 'STANDARD', label: 'Standard', capacity: 300, price: 1000 },
  { value: 'PREMIUM', label: 'Premium', capacity: 999999, price: 2000 },
  { value: 'ENTERPRISE', label: 'Enterprise', capacity: 999999, price: 0 },
];

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800',
  TRIAL: 'bg-blue-100 text-blue-800',
  EXPIRED: 'bg-yellow-100 text-yellow-800',
  SUSPENDED: 'bg-red-100 text-red-800',
};

export default function ClientManagement() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    mess_name: '',
    owner_name: '',
    email: '',
    mobile: '',
    address: '',
    capacity: 50,
    subscription_plan: 'FREE_TRIAL',
    username: '',
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
      await axios.post(`${API}/super-admin/tenants`, formData);
      toast.success('Client created successfully');
      setShowAddDialog(false);
      setFormData({
        mess_name: '',
        owner_name: '',
        email: '',
        mobile: '',
        address: '',
        capacity: 50,
        subscription_plan: 'FREE_TRIAL',
        username: '',
        password: '',
      });
      fetchClients();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create client');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Layout title="Client Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Client Management">
      <div className="space-y-6 fade-in">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <p className="text-gray-600">Total Clients: {clients.length}</p>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500" data-testid="add-client-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>Create a new mess/canteen account</DialogDescription>
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
                    <Label htmlFor="owner_name">Owner Name *</Label>
                    <Input
                      id="owner_name"
                      value={formData.owner_name}
                      onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                      required
                      data-testid="owner-name-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username * (6-20 characters)</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      minLength={6}
                      maxLength={20}
                      data-testid="username-input"
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
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500" data-testid="submit-client-button">
                  Create Client
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Clients Table */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>All Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Mess Name</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Owner</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Mobile</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Plan</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Customers</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b hover:bg-gray-50" data-testid={`client-row-${client.id}`}>
                      <td className="p-3">
                        <p className="font-medium">{client.mess_name}</p>
                        <p className="text-sm text-gray-600">{client.email}</p>
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
                    </tr>
                  ))}
                </tbody>
              </table>
              {clients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No clients found. Add your first client to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
