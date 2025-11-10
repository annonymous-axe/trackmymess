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
import { Plus, Edit, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    gender: 'MALE',
    mobile: '',
    email: '',
    address: '',
    emergency_contact: '',
    joining_date: new Date().toISOString().split('T')[0],
    meal_plan_id: '',
    monthly_rate: 0,
    security_deposit: 0,
    id_proof_type: '',
    id_proof_number: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersRes, plansRes] = await Promise.all([
        axios.get(`${API}/admin/customers`),
        axios.get(`${API}/admin/meal-plans`),
      ]);
      setCustomers(customersRes.data);
      setMealPlans(plansRes.data.filter(p => p.is_active));
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleMealPlanChange = (planId) => {
    const plan = mealPlans.find(p => p.id === planId);
    setFormData({
      ...formData,
      meal_plan_id: planId,
      monthly_rate: plan ? plan.rate : 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        joining_date: new Date(formData.joining_date).toISOString(),
      };
      await axios.post(`${API}/admin/customers`, submitData);
      toast.success('Customer added successfully');
      setShowAddDialog(false);
      setFormData({
        full_name: '',
        gender: 'MALE',
        mobile: '',
        email: '',
        address: '',
        emergency_contact: '',
        joining_date: new Date().toISOString().split('T')[0],
        meal_plan_id: '',
        monthly_rate: 0,
        security_deposit: 0,
        id_proof_type: '',
        id_proof_number: '',
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add customer');
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.mobile.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout title="Customer Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Customer Management">
      <div className="space-y-6 fade-in">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-customers-input"
            />
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500" data-testid="add-customer-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
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
                      data-testid="full-name-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger data-testid="gender-select">
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
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      required
                      data-testid="mobile-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      data-testid="email-input"
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
                    <Label htmlFor="emergency_contact">Emergency Contact * (10 digits)</Label>
                    <Input
                      id="emergency_contact"
                      type="tel"
                      pattern="[0-9]{10}"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      required
                      data-testid="emergency-contact-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joining_date">Joining Date *</Label>
                    <Input
                      id="joining_date"
                      type="date"
                      value={formData.joining_date}
                      onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                      required
                      data-testid="joining-date-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meal_plan_id">Meal Plan *</Label>
                    <Select value={formData.meal_plan_id} onValueChange={handleMealPlanChange}>
                      <SelectTrigger data-testid="meal-plan-select">
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
                    <Label htmlFor="monthly_rate">Monthly Rate *</Label>
                    <Input
                      id="monthly_rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.monthly_rate}
                      onChange={(e) => setFormData({ ...formData, monthly_rate: parseFloat(e.target.value) })}
                      required
                      data-testid="monthly-rate-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="security_deposit">Security Deposit</Label>
                    <Input
                      id="security_deposit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.security_deposit}
                      onChange={(e) => setFormData({ ...formData, security_deposit: parseFloat(e.target.value) })}
                      data-testid="security-deposit-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="id_proof_type">ID Proof Type</Label>
                    <Input
                      id="id_proof_type"
                      placeholder="e.g., Aadhar, PAN"
                      value={formData.id_proof_type}
                      onChange={(e) => setFormData({ ...formData, id_proof_type: e.target.value })}
                      data-testid="id-proof-type-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_proof_number">ID Proof Number</Label>
                  <Input
                    id="id_proof_number"
                    value={formData.id_proof_number}
                    onChange={(e) => setFormData({ ...formData, id_proof_number: e.target.value })}
                    data-testid="id-proof-number-input"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500" data-testid="submit-customer-button">
                  Add Customer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Customers List */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>All Customers ({filteredCustomers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Name</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Mobile</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Meal Plan</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Monthly Rate</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Joining Date</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Dues</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-50" data-testid={`customer-row-${customer.id}`}>
                      <td className="p-3">
                        <p className="font-medium">{customer.full_name}</p>
                        <p className="text-xs text-gray-600">{customer.email || 'No email'}</p>
                      </td>
                      <td className="p-3">{customer.mobile}</td>
                      <td className="p-3">{customer.meal_plan_name || 'N/A'}</td>
                      <td className="p-3 font-medium">₹{customer.monthly_rate}</td>
                      <td className="p-3 text-sm">{format(new Date(customer.joining_date), 'dd MMM yyyy')}</td>
                      <td className="p-3">
                        <Badge className={customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className={customer.current_dues > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                          ₹{customer.current_dues}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCustomers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No customers found matching your search.' : 'No customers found. Add your first customer to get started.'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
