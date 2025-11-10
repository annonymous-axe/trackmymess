import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { API } from '@/App';
import { toast } from 'sonner';
import { Plus, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'RAZORPAY', label: 'Razorpay (Online)' },
];

const STATUS_COLORS = {
  COMPLETED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FAILED: 'bg-red-100 text-red-800',
};

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    amount: 0,
    payment_method: 'CASH',
    transaction_id: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, customersRes] = await Promise.all([
        axios.get(`${API}/admin/payments`),
        axios.get(`${API}/admin/customers`),
      ]);
      setPayments(paymentsRes.data);
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
      await axios.post(`${API}/admin/payments`, formData);
      toast.success('Payment recorded successfully');
      setShowAddDialog(false);
      setFormData({
        customer_id: '',
        amount: 0,
        payment_method: 'CASH',
        transaction_id: '',
        notes: '',
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to record payment');
    }
  };

  const calculateTotalAmount = () => {
    return payments
      .filter(p => p.payment_status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  if (loading) {
    return (
      <Layout title="Payment Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Payment Management">
      <div className="space-y-6 fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass card-hover">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Total Payments</p>
              <p className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>
                {payments.length}
              </p>
            </CardContent>
          </Card>
          <Card className="glass card-hover">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Total Amount Collected</p>
              <p className="text-3xl font-bold text-green-600" style={{ fontFamily: 'Space Grotesk' }}>
                ₹{calculateTotalAmount()}
              </p>
            </CardContent>
          </Card>
          <Card className="glass card-hover">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">This Month</p>
              <p className="text-3xl font-bold text-blue-600" style={{ fontFamily: 'Space Grotesk' }}>
                {payments.filter(p => {
                  const paymentDate = new Date(p.payment_date);
                  const now = new Date();
                  return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <p className="text-gray-600">Total Payments: {payments.length}</p>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500" data-testid="add-payment-button">
                <Plus className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogDescription>Add a new payment entry</DialogDescription>
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
                          {customer.full_name} - {customer.mobile} (Dues: ₹{customer.current_dues})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                      required
                      data-testid="amount-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment_method">Payment Method *</Label>
                    <Select
                      value={formData.payment_method}
                      onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                    >
                      <SelectTrigger data-testid="payment-method-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction_id">Transaction ID</Label>
                  <Input
                    id="transaction_id"
                    value={formData.transaction_id}
                    onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                    placeholder="Optional"
                    data-testid="transaction-id-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Optional notes"
                    rows={2}
                    data-testid="notes-textarea"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500" data-testid="submit-payment-button">
                  Record Payment
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Payments List */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Customer</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Method</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Transaction ID</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50" data-testid={`payment-row-${payment.id}`}>
                      <td className="p-3">
                        <p className="font-medium">{payment.customer_name}</p>
                        {payment.notes && (
                          <p className="text-xs text-gray-600">{payment.notes}</p>
                        )}
                      </td>
                      <td className="p-3 font-bold text-green-600">₹{payment.amount}</td>
                      <td className="p-3">
                        <Badge variant="outline">{payment.payment_method}</Badge>
                      </td>
                      <td className="p-3 text-sm">
                        {payment.transaction_id || payment.razorpay_payment_id || '-'}
                      </td>
                      <td className="p-3">
                        <Badge className={STATUS_COLORS[payment.payment_status]}>
                          {payment.payment_status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        {format(new Date(payment.payment_date), 'dd MMM yyyy HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No payments found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
