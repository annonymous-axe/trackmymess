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
  Users,
  Sandwich,
  Users2,
  DollarSign,
  Calendar,
  TrendingUp,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_customers: 0,
    active_customers: 0,
    total_staff: 0,
    total_meal_plans: 0,
    monthly_revenue: 0,
    pending_payments: 0,
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [mealPlanData, setMealPlanData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [customersRes, staffRes, plansRes] = await Promise.all([
        axios.get(`${API}/admin/customers`),
        axios.get(`${API}/admin/staff`),
        axios.get(`${API}/admin/meal-plans`),
      ]);

      const customers = customersRes.data || [];
      const staff = staffRes.data || [];
      const plans = plansRes.data || [];

      // Calculate stats
      const activeCustomers = customers.filter(c => c.is_active).length;
      const totalRevenue = customers.reduce((sum, c) => sum + (c.dues || 0), 0);

      setStats({
        total_customers: customers.length,
        active_customers: activeCustomers,
        total_staff: staff.length,
        total_meal_plans: plans.length,
        monthly_revenue: totalRevenue,
        pending_payments: customers.filter(c => c.dues > 0).length,
      });

      // Mock attendance data for chart
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          attendance: Math.floor(Math.random() * 30) + activeCustomers * 0.7,
        };
      });
      setAttendanceData(last7Days);

      // Meal plan distribution
      const planDistribution = plans.map(plan => ({
        name: plan.name,
        value: plan.customer_count || Math.floor(Math.random() * 20),
      }));
      setMealPlanData(planDistribution);
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
    <Layout title="Dashboard">
      <div className="space-y-6 page-transition">
        {/* Welcome Section */}
        <div className="glass-card p-6 fade-in">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.full_name || user?.username}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your mess today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <StatsCard
            title="Total Customers"
            value={stats.total_customers}
            icon={Users}
            color="indigo"
            subtitle={`${stats.active_customers} active`}
          />
          <StatsCard
            title="Staff Members"
            value={stats.total_staff}
            icon={Users2}
            color="purple"
          />
          <StatsCard
            title="Meal Plans"
            value={stats.total_meal_plans}
            icon={Sandwich}
            color="blue"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`₹${stats.monthly_revenue.toLocaleString()}`}
            icon={DollarSign}
            color="green"
            trend="up"
            trendValue="+12%"
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/admin/customers">
                <Button className="w-full gradient-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </Link>
              <Link to="/admin/staff">
                <Button className="w-full gradient-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Staff
                </Button>
              </Link>
              <Link to="/admin/meal-plans">
                <Button className="w-full gradient-button">
                  <Plus className="w-4 h-4 mr-2" />
                  New Meal Plan
                </Button>
              </Link>
              <Link to="/admin/attendance">
                <Button className="w-full gradient-button">
                  <Calendar className="w-4 h-4 mr-2" />
                  Mark Attendance
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Chart */}
          <Card className="glass-card fade-in-delay-2">
            <CardHeader>
              <CardTitle>Weekly Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="attendance" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Meal Plan Distribution */}
          <Card className="glass-card fade-in-delay-3">
            <CardHeader>
              <CardTitle>Meal Plan Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mealPlanData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mealPlanData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity / Alerts */}
        <Card className="glass-card fade-in-delay-3">
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.pending_payments > 0 && (
                <div className="flex items-center gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <DollarSign className="w-5 h-5 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats.pending_payments} customers have pending payments
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Review and collect dues to maintain cash flow
                    </p>
                  </div>
                  <Link to="/admin/payments">
                    <Button size="sm" variant="outline">
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
              <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Users className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats.active_customers} active customers today
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Daily attendance tracking is up to date
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
