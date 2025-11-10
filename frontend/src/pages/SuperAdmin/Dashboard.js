import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PremiumStatCard from '@/components/PremiumStatCard';
import DashboardCard from '@/components/DashboardCard';
import { Button } from '@/components/ui/button';
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
  Activity,
  Clock,
  CheckCircle2,
  BarChart3,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_clients: 0,
    active_clients: 0,
    trial_clients: 0,
    total_customers: 0,
    monthly_revenue: 0,
    growth_rate: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [planData, setPlanData] = useState([]);
  const [recentClients, setRecentClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/super-admin/tenants`);
      const clients = response.data || [];

      const activeClients = clients.filter(c => c.status === 'ACTIVE').length;
      const trialClients = clients.filter(c => c.status === 'TRIAL').length;
      const totalCustomers = clients.reduce((sum, c) => sum + (c.customer_count || 0), 0);

      setStats({
        total_clients: clients.length,
        active_clients: activeClients,
        trial_clients: trialClients,
        total_customers: totalCustomers,
        monthly_revenue: clients.length * 1500,
        growth_rate: 18,
      });

      // Generate revenue data for last 6 months
      const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        const baseRevenue = clients.length * 1000;
        const growth = i * 8000;
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: baseRevenue + growth + Math.floor(Math.random() * 10000),
          clients: Math.floor(clients.length * (0.6 + i * 0.08)),
        };
      });
      setRevenueData(monthlyRevenue);

      // Plan distribution
      const plans = ['FREE_TRIAL', 'BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE'];
      const planDistribution = plans.map(plan => ({
        name: plan.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        count: clients.filter(c => c.subscription_plan === plan).length,
        revenue: clients.filter(c => c.subscription_plan === plan).length * (plan === 'FREE_TRIAL' ? 0 : plan === 'BASIC' ? 1000 : plan === 'STANDARD' ? 1500 : plan === 'PREMIUM' ? 2500 : 5000)
      }));
      setPlanData(planDistribution);

      // Recent clients (last 3)
      const recent = clients.slice(-3).reverse().map(c => ({
        id: c.id,
        name: c.mess_name,
        status: c.status,
        plan: c.subscription_plan,
        customers: c.customer_count || 0,
        date: new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
      setRecentClients(recent);
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
      <div className="space-y-8 pb-8">
        {/* Welcome Section */}
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, Super Admin! 🚀
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Platform overview and key performance metrics
          </p>
        </div>

        {/* Primary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PremiumStatCard
            title="Total Clients"
            value={stats.total_clients}
            subtitle={`${stats.active_clients} active, ${stats.trial_clients} on trial`}
            icon={Building2}
            color="indigo"
            trend="up"
            trendValue="+12%"
            delay={0}
          />
          <PremiumStatCard
            title="Active Subscriptions"
            value={stats.active_clients}
            subtitle="Paying customers"
            icon={CheckCircle2}
            color="green"
            trend="up"
            trendValue="+8%"
            delay={100}
          />
          <PremiumStatCard
            title="Total End Users"
            value={stats.total_customers}
            subtitle="Across all clients"
            icon={Users}
            color="cyan"
            trend="up"
            trendValue="+22%"
            delay={200}
          />
          <PremiumStatCard
            title="Monthly Revenue"
            value={`₹${stats.monthly_revenue.toLocaleString()}`}
            subtitle="Recurring income"
            icon={DollarSign}
            color="violet"
            trend="up"
            trendValue="+18%"
            delay={300}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PremiumStatCard
            title="Trial Accounts"
            value={stats.trial_clients}
            subtitle="Conversion opportunities"
            icon={Clock}
            color="orange"
            trend="up"
            trendValue="+5"
            delay={400}
          />
          <PremiumStatCard
            title="Platform Growth"
            value={`${stats.growth_rate}%`}
            subtitle="Month over month"
            icon={TrendingUp}
            color="purple"
            trend="up"
            trendValue="+3%"
            delay={500}
          />
          <PremiumStatCard
            title="Avg Customers/Client"
            value={Math.round(stats.total_customers / stats.total_clients) || 0}
            subtitle="Per mess owner"
            icon={BarChart3}
            color="green"
            trend="up"
            trendValue="+1.2"
            delay={600}
          />
        </div>

        {/* Quick Actions */}
        <DashboardCard
          title="Quick Actions"
          icon={Zap}
          delay={700}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link to="/super-admin/clients">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Plus className="w-5 h-5" />
                <span className="text-sm font-semibold">Add New Client</span>
              </Button>
            </Link>
            <Link to="/super-admin/clients">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Building2 className="w-5 h-5" />
                <span className="text-sm font-semibold">Manage Clients</span>
              </Button>
            </Link>
            <Link to="/super-admin/reports">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm font-semibold">View Reports</span>
              </Button>
            </Link>
          </div>
        </DashboardCard>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue & Growth Chart */}
          <DashboardCard
            title="Revenue & Growth Trend"
            icon={TrendingUp}
            delay={800}
          >
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="clientsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                  name="Revenue (₹)"
                />
                <Area
                  type="monotone"
                  dataKey="clients"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#clientsGradient)"
                  name="Clients"
                />
              </AreaChart>
            </ResponsiveContainer>
          </DashboardCard>

          {/* Subscription Plans */}
          <DashboardCard
            title="Subscription Distribution"
            icon={BarChart3}
            delay={900}
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={planData}>
                <defs>
                  <linearGradient id="planGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="url(#planGradient)" 
                  radius={[12, 12, 0, 0]}
                  name="Clients"
                />
              </BarChart>
            </ResponsiveContainer>
          </DashboardCard>
        </div>

        {/* Recent Clients & Platform Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Clients */}
          <DashboardCard
            title="Recent Clients"
            icon={Activity}
            action={
              <Link to="/super-admin/clients">
                <Button size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-700">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            }
            delay={1000}
          >
            <div className="space-y-3">
              {recentClients.length > 0 ? (
                recentClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {client.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {client.customers} customers • {client.plan.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        client.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        client.status === 'TRIAL' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {client.status}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {client.date}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No recent clients
                </p>
              )}
            </div>
          </DashboardCard>

          {/* Platform Health */}
          <DashboardCard
            title="Platform Health"
            icon={Activity}
            delay={1100}
          >
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Client Retention</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">94%</span>
                </div>
                <div className="w-full bg-green-200 dark:bg-green-900/50 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trial Conversion</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">67%</span>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-900/50 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl border border-violet-200 dark:border-violet-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Customer Satisfaction</span>
                  <span className="text-lg font-bold text-violet-600 dark:text-violet-400">4.8/5</span>
                </div>
                <div className="w-full bg-violet-200 dark:bg-violet-900/50 rounded-full h-2">
                  <div className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </Layout>
  );
}
