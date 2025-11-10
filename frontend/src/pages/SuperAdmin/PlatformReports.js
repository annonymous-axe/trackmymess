import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { API } from '@/App';
import { toast } from 'sonner';
import { TrendingUp, Users, DollarSign, Building2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];

export default function PlatformReports() {
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [subscriptionLogs, setSubscriptionLogs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tenantsRes, logsRes] = await Promise.all([
        axios.get(`${API}/super-admin/tenants`),
        axios.get(`${API}/super-admin/subscriptions/logs`),
      ]);
      setTenants(tenantsRes.data);
      setSubscriptionLogs(logsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Platform Reports">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
        </div>
      </Layout>
    );
  }

  // Plan distribution
  const planDistribution = tenants.reduce((acc, t) => {
    acc[t.subscription_plan] = (acc[t.subscription_plan] || 0) + 1;
    return acc;
  }, {});

  const planChartData = Object.entries(planDistribution).map(([plan, count]) => ({
    name: plan.replace('_', ' '),
    value: count
  }));

  // Revenue by plan
  const PLAN_PRICES = {
    FREE_TRIAL: 0,
    BASIC: 500,
    STANDARD: 1000,
    PREMIUM: 2000,
    ENTERPRISE: 5000
  };

  const revenueData = Object.entries(planDistribution).map(([plan, count]) => ({
    plan: plan.replace('_', ' '),
    revenue: PLAN_PRICES[plan] * count,
    clients: count
  }));

  // Recent subscription activities
  const recentLogs = subscriptionLogs.slice(0, 10);

  return (
    <Layout title="Platform Reports & Analytics">
      <div className="space-y-6 fade-in">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="stat-card bg-white border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Clients</p>
                <p className="text-3xl font-bold text-gray-900">{tenants.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="stat-card bg-white border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Clients</p>
                <p className="text-3xl font-bold text-gray-900">{tenants.filter(t => t.status === 'ACTIVE').length}</p>
              </div>
              <div className="w-12 h-12 rounded-full gradient-success flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="stat-card bg-white border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                <p className="text-3xl font-bold text-gray-900">{tenants.reduce((sum, t) => sum + t.customer_count, 0)}</p>
              </div>
              <div className="w-12 h-12 rounded-full gradient-warning flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="stat-card bg-white border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">MRR</p>
                <p className="text-3xl font-bold text-gray-900">₹{revenueData.reduce((sum, d) => sum + d.revenue, 0)}</p>
              </div>
              <div className="w-12 h-12 rounded-full gradient-indigo flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Plan Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={planChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {planChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Revenue by Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="plan" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Subscription Activities */}
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle>Recent Subscription Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium">Tenant: {log.tenant_id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">
                      {log.previous_plan ? `${log.previous_plan} → ${log.new_plan}` : `New: ${log.new_plan}`}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(log.changed_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₹{log.amount}</p>
                    <p className="text-xs text-gray-600">{log.payment_status}</p>
                  </div>
                </div>
              ))}
              {recentLogs.length === 0 && (
                <p className="text-center text-gray-500 py-4">No subscription activities yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
