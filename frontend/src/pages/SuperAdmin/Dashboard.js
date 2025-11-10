import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/StatsCard';
import { useAuth } from '@/App';
import axios from 'axios';
import { API } from '@/App';
import { toast } from 'sonner';
import {
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_clients: 0,
    active_clients: 0,
    total_customers: 0,
    monthly_revenue: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [planData, setPlanData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/super-admin/tenants`);
      const clients = response.data || [];

      const activeClients = clients.filter(c => c.status === 'ACTIVE' || c.status === 'TRIAL').length;
      const totalCustomers = clients.reduce((sum, c) => sum + (c.customer_count || 0), 0);

      setStats({
        total_clients: clients.length,
        active_clients: activeClients,
        total_customers: totalCustomers,
        monthly_revenue: clients.length * 1500, // Mock calculation
      });

      // Mock revenue data
      const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: Math.floor(Math.random() * 50000) + clients.length * 1000,
        };
      });
      setRevenueData(monthlyRevenue);

      // Plan distribution
      const plans = ['FREE_TRIAL', 'BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE'];
      const planDistribution = plans.map(plan => ({
        name: plan.replace('_', ' '),
        count: clients.filter(c => c.subscription_plan === plan).length,
      }));
      setPlanData(planDistribution);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Super Admin Dashboard">
      <div className="space-y-6 page-transition">
        {/* Welcome Section */}
        <div className="glass-card p-6 fade-in">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, Super Admin! 🚀
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Platform overview and key metrics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Clients"
            value={stats.total_clients}
            icon={Building2}
            color="indigo"
            subtitle={`${stats.active_clients} active`}
            trend="up"
            trendValue="+8%"
          />
          <StatsCard
            title="Active Clients"
            value={stats.active_clients}
            icon={TrendingUp}
            color="green"
          />
          <StatsCard
            title="Total Customers"
            value={stats.total_customers}
            icon={Users}
            color="blue"
            trend="up"
            trendValue="+15%"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`₹${stats.monthly_revenue.toLocaleString()}`}
            icon={DollarSign}
            color="purple"
            trend="up"
            trendValue="+22%"
          />
        </div>

        {/* Quick Actions */}
        <Card className="glass-card fade-in-delay-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link to="/super-admin/clients">
                <Button className="w-full gradient-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Client
                </Button>
              </Link>
              <Link to="/super-admin/clients">
                <Button className="w-full gradient-button">
                  <Building2 className="w-4 h-4 mr-2" />
                  Manage Clients
                </Button>
              </Link>
              <Link to="/super-admin/reports">
                <Button className="w-full gradient-button">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <Card className="glass-card fade-in-delay-2">
            <CardHeader>
              <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Plan Distribution */}
          <Card className="glass-card fade-in-delay-3">
            <CardHeader>
              <CardTitle>Subscription Plan Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={planData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Clients */}
        <Card className="glass-card fade-in-delay-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Platform Insights</CardTitle>
              <Link to="/super-admin/clients">
                <Button size="sm" variant="outline">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Platform growth is steady with {stats.active_clients} active clients
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Customer satisfaction rate: 94%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Users className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Total of {stats.total_customers} end users across all clients
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Active engagement across the platform
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
