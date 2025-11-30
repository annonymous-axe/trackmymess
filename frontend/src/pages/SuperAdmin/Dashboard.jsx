import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import axios, { API } from '@/lib/http';
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
import { Skeleton } from '@/components/ui/skeleton';

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
        <div className="p-4 md:p-6 space-y-6">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Super Admin Dashboard">
      <div className="space-y-6 p-4 md:p-6">
        {/* Welcome Section */}
        <div className="fade-in">
          <h1 className="text-3xl font-bold font-heading text-foreground">
            Welcome, Super Admin! 🚀
          </h1>
          <p className="text-muted-foreground text-lg">
            Platform overview and key performance metrics.
          </p>
        </div>

        {/* Primary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Building2} title="Total Clients" value={stats.total_clients} description={`${stats.active_clients} active, ${stats.trial_clients} on trial`} color="primary" />
          <StatCard icon={CheckCircle2} title="Active Subscriptions" value={stats.active_clients} description="Paying customers" color="success" />
          <StatCard icon={Users} title="Total End Users" value={stats.total_customers} description="Across all clients" color="secondary" />
          <StatCard icon={DollarSign} title="Monthly Revenue" value={`₹${stats.monthly_revenue.toLocaleString()}`} description="Recurring income" color="warning" />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <QuickActionButton icon={Plus} label="Add New Client" link="/super-admin/clients" />
            <QuickActionButton icon={Building2} label="Manage Clients" link="/super-admin/clients" />
            <QuickActionButton icon={BarChart3} label="View Reports" link="/super-admin/reports" />
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="font-heading">Revenue & Growth Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--foreground-secondary)" fontSize={12} />
                  <YAxis stroke="var(--foreground-secondary)" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-primary-500)" strokeWidth={2} fill="url(#revenueGradient)" name="Revenue (₹)" />
                  <Area type="monotone" dataKey="clients" stroke="var(--color-secondary-500)" strokeWidth={2} fill="transparent" name="Clients" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-heading">Subscription Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={planData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--foreground-secondary)" fontSize={11} />
                  <YAxis stroke="var(--foreground-secondary)" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }} />
                  <Bar dataKey="count" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} name="Clients" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Clients & Platform Health */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="font-heading">Recent Clients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentClients.length > 0 ? (
                recentClients.map((client) => <RecentClientItem key={client.id} client={client} />)
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No recent clients</p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-heading">Platform Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <HealthMetric title="Client Retention" value="94%" color="success" />
              <HealthMetric title="Trial Conversion" value="67%" color="primary" />
              <HealthMetric title="Customer Satisfaction" value="4.8/5" color="secondary" />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

// Helper Components
function StatCard({ icon: Icon, title, value, description, color = 'primary' }) {
  const colorClasses = {
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    secondary: 'text-secondary bg-secondary/10',
  };
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold font-heading">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({ icon: Icon, label, link }) {
  return (
    <Link to={link}>
      <Button variant="outline" className="w-full h-auto py-3 flex flex-col items-center gap-2 text-center">
        <Icon className="w-5 h-5" />
        <span className="text-xs font-semibold">{label}</span>
      </Button>
    </Link>
  );
}

function RecentClientItem({ client }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Building2 className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">{client.name}</h4>
          <p className="text-xs text-muted-foreground">{client.customers} customers • {client.plan.replace('_', ' ')}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
          client.status === 'ACTIVE' ? 'bg-success/10 text-success' :
          client.status === 'TRIAL' ? 'bg-primary/10 text-primary' :
          'bg-muted text-muted-foreground'
        }`}>
          {client.status}
        </span>
        <p className="text-xs text-muted-foreground mt-1">{client.date}</p>
      </div>
    </div>
  );
}

function HealthMetric({ title, value, color }) {
  const width = (parseFloat(value) / (title.includes('/5') ? 5 : 100)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{title}</span>
        <span className={`text-sm font-bold text-${color}`}>{value}</span>
      </div>
      <div className={`w-full bg-${color}/10 rounded-full h-2`}>
        <div className={`bg-${color} h-2 rounded-full`} style={{ width: `${width}%` }}></div>
      </div>
    </div>
  );
}
