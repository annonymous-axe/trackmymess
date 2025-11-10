import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { API } from '@/App';
import { toast } from 'sonner';
import { FileText, Download, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API}/admin/invoices`);
      setInvoices(response.data);
    } catch (error) {
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoices = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`${API}/admin/invoices/generate-monthly`, {
        month,
        year,
      });
      toast.success(response.data.message);
      setShowGenerateDialog(false);
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate invoices');
    } finally {
      setGenerating(false);
    }
  };

  const getMonthName = (monthNum) => {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  };

  if (loading) {
    return (
      <Layout title="Invoice Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paid_amount, 0);
  const totalDue = invoices.reduce((sum, inv) => sum + inv.due_amount, 0);

  return (
    <Layout title="Invoice Management">
      <div className="space-y-6 fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass card-hover">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
              <p className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>
                {invoices.length}
              </p>
            </CardContent>
          </Card>
          <Card className="glass card-hover">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Total Invoiced</p>
              <p className="text-3xl font-bold text-blue-600" style={{ fontFamily: 'Space Grotesk' }}>
                ₹{totalInvoiced.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card className="glass card-hover">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Total Paid</p>
              <p className="text-3xl font-bold text-green-600" style={{ fontFamily: 'Space Grotesk' }}>
                ₹{totalPaid.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card className="glass card-hover">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Total Due</p>
              <p className="text-3xl font-bold text-red-600" style={{ fontFamily: 'Space Grotesk' }}>
                ₹{totalDue.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <p className="text-gray-600">Total Invoices: {invoices.length}</p>
          <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500" data-testid="generate-invoices-button">
                <Plus className="w-4 h-4 mr-2" />
                Generate Monthly Invoices
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Monthly Invoices</DialogTitle>
                <DialogDescription>
                  Generate invoices for all active customers for a specific month
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Input
                      id="month"
                      type="number"
                      min="1"
                      max="12"
                      value={month}
                      onChange={(e) => setMonth(parseInt(e.target.value))}
                      data-testid="month-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      min="2020"
                      max="2100"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value))}
                      data-testid="year-input"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Generating invoices for: <strong>{getMonthName(month)} {year}</strong>
                </p>
                <Button
                  onClick={handleGenerateInvoices}
                  disabled={generating}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  data-testid="confirm-generate-button"
                >
                  {generating ? 'Generating...' : 'Generate Invoices'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Invoices List */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Invoice #</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Customer</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Period</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Days</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Paid</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Due</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50" data-testid={`invoice-row-${invoice.id}`}>
                      <td className="p-3 font-mono text-sm">{invoice.invoice_number}</td>
                      <td className="p-3">{invoice.customer_name}</td>
                      <td className="p-3 text-sm">
                        {getMonthName(invoice.month)} {invoice.year}
                      </td>
                      <td className="p-3 text-sm">
                        {invoice.present_days} / {invoice.total_days}
                        {invoice.pause_days > 0 && (
                          <span className="text-xs text-gray-600"> ({invoice.pause_days} paused)</span>
                        )}
                      </td>
                      <td className="p-3 font-medium">₹{invoice.total_amount}</td>
                      <td className="p-3 text-green-600">₹{invoice.paid_amount}</td>
                      <td className="p-3 font-medium">
                        <span className={invoice.due_amount > 0 ? 'text-red-600' : 'text-green-600'}>
                          ₹{invoice.due_amount}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge className={invoice.due_amount === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {invoice.due_amount === 0 ? 'Paid' : 'Pending'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {invoices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No invoices found. Generate monthly invoices to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
