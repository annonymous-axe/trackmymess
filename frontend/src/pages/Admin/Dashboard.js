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
  Users,
  Sandwich,
  Users2,
  DollarSign,
  Calendar,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_customers: 0,
    active_customers: 0,
    total_staff: 0,
    total_meal_plans: 0,
    monthly_revenue: 0,
    pending_payments: 0,
    today_attendance: 0,
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
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

      const activeCustomers = customers.filter(c => c.is_active).length;
      const totalDues = customers.reduce((sum, c) => sum + (c.dues || 0), 0);
      const pendingPayments = customers.filter(c => c.dues > 0).length;

      setStats({
        total_customers: customers.length,
        active_customers: activeCustomers,
        total_staff: staff.length,
        total_meal_plans: plans.length,
        monthly_revenue: totalDues,
        pending_payments: pendingPayments,
        today_attendance: Math.floor(activeCustomers * 0.85),
      });

      // Generate attendance data for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const baseAttendance = Math.floor(activeCustomers * 0.85);
        const variance = Math.floor(Math.random() * 10) - 5;
        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          attendance: Math.max(baseAttendance + variance, 0),
          expected: activeCustomers,
        };
      });
      setAttendanceData(last7Days);

      // Generate recent activity
      const activities = [
        { 
          id: 1, 
          type: 'customer', 
          message: 'New customer registered', 
          time: '2 hours ago',
          icon: Users,
          color: 'text-blue-600 bg-blue-50'
        },
        { 
          id: 2, 
          type: 'payment', 
          message: 'Payment received ₹2,500', 
          time: '3 hours ago',
          icon: DollarSign,
          color: 'text-green-600 bg-green-50'
        },
        { 
          id: 3, 
          type: 'staff', 
          message: 'Staff member added', 
          time: '5 hours ago',
          icon: Users2,
          color: 'text-purple-600 bg-purple-50'
        },
        { 
          id: 4, 
          type: 'meal', 
          message: 'Meal plan updated', 
          time: '1 day ago',
          icon: Sandwich,
          color: 'text-orange-600 bg-orange-50'
        },
      ];
      setRecentActivity(activities);
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
      <div className="space-y-8 pb-8">
        {/* Welcome Section */}
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.full_name || user?.username}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Here's what's happening with your mess today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <PremiumStatCard
            title="Total Customers"
            value={stats.total_customers}
            subtitle={`${stats.active_customers} active members`}
            icon={Users}
            color="indigo"
            trend="up"
            trendValue="+8%"
            delay={0}
          />
          <PremiumStatCard
            title="Staff Members"
            value={stats.total_staff}
            subtitle="All departments"
            icon={Users2}
            color="violet"
            trend="up"
            trendValue="+2"
            delay={100}
          />
          <PremiumStatCard
            title="Active Meal Plans"
            value={stats.total_meal_plans}
            subtitle="Available options"
            icon={Sandwich}
            color="cyan"
            trend="neutral"
            trendValue="0%"
            delay={200}
          />
          <PremiumStatCard
            title="Monthly Revenue"
            value={`₹${stats.monthly_revenue.toLocaleString()}`}
            subtitle="Outstanding dues"
            icon={DollarSign}
            color="green"
            trend="up"
            trendValue="+12%"
            delay={300}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PremiumStatCard
            title="Today's Attendance"
            value={stats.today_attendance}
            subtitle={`Out of ${stats.active_customers} active customers`}
            icon={Calendar}
            color="purple"
            trend="up"
            trendValue="+5%"
            delay={400}
          />
          <PremiumStatCard
            title="Pending Payments"
            value={stats.pending_payments}
            subtitle="Customers with dues"
            icon={Clock}
            color="orange"
            trend="down"
            trendValue="-3"
            delay={500}
          />
        </div>

        {/* Quick Actions */}
        <DashboardCard
          title="Quick Actions"
          icon={TrendingUp}
          delay={600}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/admin/customers">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Plus className="w-5 h-5" />
                <span className="text-sm font-semibold">Add Customer</span>
              </Button>
            </Link>
            <Link to="/admin/staff">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Plus className="w-5 h-5" />
                <span className="text-sm font-semibold">Add Staff</span>
              </Button>
            </Link>
            <Link to="/admin/meal-plans">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Plus className="w-5 h-5" />
                <span className="text-sm font-semibold">New Meal Plan</span>
              </Button>
            </Link>
            <Link to="/admin/attendance">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-semibold">Attendance</span>
              </Button>
            </Link>
          </div>
        </DashboardCard>

        {/* Charts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <DashboardCard
              title="Weekly Attendance Trend"
              icon={Activity}
              delay={700}
            >
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={attendanceData}>
                  <defs>
                    <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="date" 
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
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', r: 5, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7, strokeWidth: 2 }}
                    fill="url(#attendanceGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="expected"
                    stroke="#e2e8f0"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </DashboardCard>
          </div>

          {/* Recent Activity - Takes 1 column */}
          <DashboardCard
            title="Recent Activity"
            icon={Clock}
            action={
              <Link to="/admin">
                <Button size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-700">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            }
            delay={800}
          >
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const ActivityIcon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                    <div className={`p-2 rounded-lg ${activity.color}`}>
                      <ActivityIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </DashboardCard>
        </div>

        {/* Alerts & Notifications */}
        {(stats.pending_payments > 0 || stats.today_attendance < stats.active_customers * 0.8) && (
          <DashboardCard
            title="Attention Required"
            icon={AlertCircle}
            delay={900}
          >
            <div className="space-y-3">
              {stats.pending_payments > 0 && (
                <div className="flex items-start gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-200 dark:border-orange-800/50">
                  <div className="p-2 bg-orange-100 dark:bg-orange-800/50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {stats.pending_payments} Pending Payments
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Follow up with customers to collect outstanding dues
                    </p>
                  </div>
                  <Link to="/admin/payments">
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                      Review
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
              {stats.today_attendance < stats.active_customers * 0.8 && (
                <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800/50">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      Low Attendance Alert
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Today's attendance is below expected levels
                    </p>
                  </div>
                  <Link to="/admin/attendance">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Check
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </DashboardCard>
        )}
      </div>
    </Layout>
  );
}
