import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { API } from '@/App';
import { toast } from 'sonner';
import { Download, FileText, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('revenue');
  const [revenueData, setRevenueData] = useState([]);
  const [customersWithDues, setCustomersWithDues] = useState([]);
  const [agingData, setAgingData] = useState({});
  const [mealConsumption, setMealConsumption] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchReportData();
  }, [selectedReport, month, year]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      switch (selectedReport) {
        case 'revenue':
          const revenueRes = await axios.get(`${API}/admin/reports/revenue?months=6`);
          setRevenueData(revenueRes.data);
          break;
        case 'dues':
          const duesRes = await axios.get(`${API}/admin/reports/customers-with-dues`);
          setCustomersWithDues(duesRes.data);
          break;
        case 'aging':
          const agingRes = await axios.get(`${API}/admin/reports/aging`);
          setAgingData(agingRes.data);
          break;
        case 'meals':
          const mealsRes = await axios.get(`${API}/admin/reports/meal-consumption?month=${month}&year=${year}`);
          setMealConsumption(mealsRes.data);
          break;
      }
    } catch (error) {
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const response = await axios.get(`${API}/admin/export/customers?format=csv`);
      const blob = new Blob([response.data.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Export successful');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Export failed');
    }
  };

  const renderRevenueReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="stat-card lg:col-span-2">
          <h3 className="text-lg font-bold mb-4">Revenue Trend (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-4">
          <div className="stat-card gradient-primary text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold">₹{revenueData.reduce((sum, d) => sum + d.revenue, 0)}</p>
              </div>
              <DollarSign className="w-12 h-12 opacity-80" />
            </div>
          </div>
          <div className="stat-card gradient-success text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Total Payments</p>
                <p className="text-3xl font-bold">{revenueData.reduce((sum, d) => sum + d.payment_count, 0)}</p>
              </div>
              <FileText className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDuesReport = () => (
    <div className="space-y-6">
      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Customers with Pending Dues</h3>
          <Badge className="bg-red-100 text-red-800">{customersWithDues.length} Customers</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-sm font-medium text-gray-600">Customer</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Mobile</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Meal Plan</th>
                <th className="text-right p-3 text-sm font-medium text-gray-600">Dues Amount</th>
              </tr>
            </thead>
            <tbody>
              {customersWithDues.map((customer) => (
                <tr key={customer.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{customer.full_name}</td>
                  <td className="p-3">{customer.mobile}</td>
                  <td className="p-3">{customer.meal_plan_name || 'N/A'}</td>
                  <td className="p-3 text-right font-bold text-red-600">₹{customer.current_dues}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAgingReport = () => {
    const agingChartData = [
      { name: '0-30 Days', value: agingData['0-30']?.length || 0 },
      { name: '31-60 Days', value: agingData['31-60']?.length || 0 },
      { name: '61-90 Days', value: agingData['61-90']?.length || 0 },
      { name: '90+ Days', value: agingData['90+']?.length || 0 },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="stat-card">
            <h3 className="text-lg font-bold mb-4">Aging Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={agingChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {agingChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="stat-card">
            <h3 className="text-lg font-bold mb-4">Outstanding by Age</h3>
            <div className="space-y-3">
              {Object.entries(agingData).map(([range, invoices]) => {
                const total = invoices.reduce((sum, inv) => sum + inv.due_amount, 0);
                return (
                  <div key={range} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{range} Days</p>
                      <p className="text-sm text-gray-600">{invoices.length} invoices</p>
                    </div>
                    <p className="font-bold text-red-600">₹{total.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMealsReport = () => (
    <div className="space-y-6">
      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Meal Consumption Report</h3>
          <div className="flex gap-2">
            <Select value={month.toString()} onValueChange={(val) => setMonth(parseInt(val))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={year.toString()} onValueChange={(val) => setYear(parseInt(val))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-sm font-medium text-gray-600">Customer</th>
                <th className="text-center p-3 text-sm font-medium text-gray-600">Breakfast</th>
                <th className="text-center p-3 text-sm font-medium text-gray-600">Lunch</th>
                <th className="text-center p-3 text-sm font-medium text-gray-600">Dinner</th>
                <th className="text-center p-3 text-sm font-medium text-gray-600">Total Meals</th>
              </tr>
            </thead>
            <tbody>
              {mealConsumption.map((record, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <p className="font-medium">{record.customer_name}</p>
                    <p className="text-xs text-gray-600">{record.customer_mobile}</p>
                  </td>
                  <td className="p-3 text-center">{record.breakfast}</td>
                  <td className="p-3 text-center">{record.lunch}</td>
                  <td className="p-3 text-center">{record.dinner}</td>
                  <td className="p-3 text-center font-bold">{record.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout title="Reports & Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Reports & Analytics">
      <div className="space-y-6 fade-in">
        {/* Report Type Selector */}
        <div className="glass-strong p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Reports & Analytics</h2>
              <p className="text-gray-600">Comprehensive business insights and data analysis</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportCSV} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Report Tabs */}
        <div className="glass-strong p-2 rounded-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              variant={selectedReport === 'revenue' ? 'default' : 'ghost'}
              className={selectedReport === 'revenue' ? 'gradient-primary text-white' : ''}
              onClick={() => setSelectedReport('revenue')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Revenue
            </Button>
            <Button
              variant={selectedReport === 'dues' ? 'default' : 'ghost'}
              className={selectedReport === 'dues' ? 'gradient-primary text-white' : ''}
              onClick={() => setSelectedReport('dues')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Dues
            </Button>
            <Button
              variant={selectedReport === 'aging' ? 'default' : 'ghost'}
              className={selectedReport === 'aging' ? 'gradient-primary text-white' : ''}
              onClick={() => setSelectedReport('aging')}
            >
              <Clock className="w-4 h-4 mr-2" />
              Aging
            </Button>
            <Button
              variant={selectedReport === 'meals' ? 'default' : 'ghost'}
              className={selectedReport === 'meals' ? 'gradient-primary text-white' : ''}
              onClick={() => setSelectedReport('meals')}
            >
              <Users className="w-4 h-4 mr-2" />
              Meals
            </Button>
          </div>
        </div>

        {/* Report Content */}
        {selectedReport === 'revenue' && renderRevenueReport()}
        {selectedReport === 'dues' && renderDuesReport()}
        {selectedReport === 'aging' && renderAgingReport()}
        {selectedReport === 'meals' && renderMealsReport()}
      </div>
    </Layout>
  );
}
