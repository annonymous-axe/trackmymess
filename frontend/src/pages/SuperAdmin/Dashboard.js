import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { API } from '@/App';
import { Users, Building2, DollarSign, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SuperAdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API}/super-admin/dashboard`);
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      title: 'Total Clients',
      value: dashboard?.total_clients || 0,
      icon: Building2,
      color: 'from-blue-500 to-cyan-500',
      testId: 'total-clients-stat'
    },
    {
      title: 'Active Clients',
      value: dashboard?.active_clients || 0,
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      testId: 'active-clients-stat'
    },
    {
      title: 'Total Customers',
      value: dashboard?.total_customers || 0,
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      testId: 'total-customers-stat'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${dashboard?.mrr || 0}`,
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-500',
      testId: 'mrr-stat'
    },
    {
      title: 'Trial Clients',
      value: dashboard?.trial_clients || 0,
      icon: TrendingUp,
      color: 'from-indigo-500 to-blue-500',
      testId: 'trial-clients-stat'
    },
    {
      title: 'Expiring Soon',
      value: dashboard?.expiring_soon || 0,
      icon: AlertCircle,
      color: 'from-red-500 to-pink-500',
      testId: 'expiring-soon-stat'
    },
  ];

  return (
    <Layout title="Super Admin Dashboard">
      <div className="space-y-6 fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="glass card-hover" data-testid={stat.testId}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Client Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Client Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active</span>
                  <span className="text-sm font-bold text-green-600">{dashboard?.active_clients || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Trial</span>
                  <span className="text-sm font-bold text-blue-600">{dashboard?.trial_clients || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Expired</span>
                  <span className="text-sm font-bold text-yellow-600">{dashboard?.expired_clients || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Suspended</span>
                  <span className="text-sm font-bold text-red-600">{dashboard?.suspended_clients || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <a href="/super-admin/clients" className="block">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-colors cursor-pointer" data-testid="manage-clients-link">
                    <p className="font-medium text-blue-900">Manage Clients</p>
                    <p className="text-sm text-blue-700">Add, edit, or view client details</p>
                  </div>
                </a>
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <p className="font-medium text-green-900">Platform Health</p>
                  <p className="text-sm text-green-700">All systems operational</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
