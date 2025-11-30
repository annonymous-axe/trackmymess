import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import axios, { API } from '@/lib/http';
import { toast } from 'sonner';
import { Users, Sandwich, Users2, DollarSign, Calendar, Clock, ArrowRight, AlertCircle, FileText, CreditCard, UserCheck, PauseCircle, TrendingDown, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { AddCustomerModal } from '@/components/modals/AddCustomerModal';
import { RecordPaymentModal } from '@/components/modals/RecordPaymentModal';
import { CreatePauseRequestModal } from '@/components/modals/CreatePauseRequestModal';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentPauseRequests, setRecentPauseRequests] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [showCreatePauseRequestModal, setShowCreatePauseRequestModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      performSearch();
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchTerm]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSearchResults && !event.target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearchResults]);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, customersRes] = await Promise.all([
        axios.get(`${API}/admin/dashboard`),
        axios.get(`${API}/admin/customers`),
      ]);

      setDashboardData(dashboardRes.data);
      setCustomers(customersRes.data);
      setRecentPayments(dashboardRes.data.recent_payments || []);
      setRecentPauseRequests(dashboardRes.data.recent_pause_requests || []);

      // Get active customer names to filter out deleted/inactive customers
      const activeCustomerNames = new Set(
        customersRes.data
          .filter(c => c.is_active)
          .map(c => c.full_name?.trim())
      );

      // Filter upcoming payments - show all by default, optionally filter by active status
      const upcoming = (dashboardRes.data.upcoming_payments || [])
        .filter(payment => {
          // If we have customer name, check if they're active
          // Otherwise, show the payment (to avoid hiding valid data)
          if (payment.customer_name && activeCustomerNames.size > 0) {
            return activeCustomerNames.has(payment.customer_name.trim());
          }
          // If no customer_name, show it anyway (probably valid data)
          return true;
        });

      // Sort: pending (overdue) first, then by due date
      const sortedUpcoming = upcoming.sort((a, b) => {
        const aIsPending = new Date(a.due_date) < new Date();
        const bIsPending = new Date(b.due_date) < new Date();

        // Pending payments first
        if (aIsPending && !bIsPending) return -1;
        if (!aIsPending && bIsPending) return 1;

        // Then sort by due date (earliest first)
        return new Date(a.due_date) - new Date(b.due_date);
      });

      setUpcomingPayments(sortedUpcoming);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const performSearch = () => {
    const term = searchTerm.toLowerCase().trim();
    const results = customers.filter(customer =>
      customer.full_name?.toLowerCase().includes(term) ||
      customer.mobile?.includes(term) ||
      customer.email?.toLowerCase().includes(term)
    ).slice(0, 5); // Limit to 5 results
    setSearchResults(results);
    setShowSearchResults(true);
  };

  const viewCustomerDetail = (customerId) => {
    navigate(`/admin/customers/${customerId}/detail`);
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="p-4 md:p-6 space-y-6">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  const stats = dashboardData || {};
  const attendancePercent = stats.total_customers > 0
    ? Math.round((stats.today_attendance?.present || 0) / stats.total_customers * 100)
    : 0;

  return (
    <Layout title="Dashboard">
      <div className="space-y-6 p-4 md:p-6">
        {/* Welcome Section */}
        <div className="fade-in">
          <h1 className="text-3xl font-bold font-heading text-foreground">
            Welcome back, {user?.full_name || user?.username}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's what's happening with your mess today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Users} title="Total Customers" value={stats.total_customers || 0} description={`Capacity: ${stats.capacity || 0}`} color="primary" />
          <StatCard icon={UserCheck} title="Today's Attendance" value={`${stats.today_attendance?.present || 0}/${stats.total_customers || 0}`} description={`${attendancePercent}% present`} color="success" />
          <StatCard icon={DollarSign} title="Monthly Revenue" value={`₹${(stats.monthly_revenue?.collected || 0).toLocaleString()}`} description={`₹${(stats.monthly_revenue?.pending || 0).toLocaleString()} pending`} color="secondary" />
          <StatCard icon={Sandwich} title="Meals Served" value={stats.meals_served_month || 0} description="This month" color="warning" />
        </div>

        {/* Quick Actions & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-heading">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <QuickActionButton icon={Users} label="Add Customer" onClick={() => setShowAddCustomerModal(true)} />
              <QuickActionButton icon={CreditCard} label="Record Payment" onClick={() => setShowRecordPaymentModal(true)} />
              <QuickActionButton icon={Calendar} label="Mark Attendance" onClick={() => navigate('/admin/attendance')} />
              <QuickActionButton icon={FileText} label="Download Invoices" onClick={() => navigate('/admin/payments')} />
              <QuickActionButton icon={PauseCircle} label="Add Pause Request" onClick={() => setShowCreatePauseRequestModal(true)} />
              <QuickActionButton icon={Users2} label="Renew Subscription" onClick={() => navigate('/admin/subscription')} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Alerts & Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(stats.monthly_revenue?.pending || 0) > 0 && <AlertItem icon={DollarSign} title={`₹${(stats.monthly_revenue?.pending || 0).toLocaleString()} Pending Revenue`} description="Collect outstanding dues." link="/admin/payments" color="warning" />}
              {(stats.today_pause_requests || 0) > 0 && <AlertItem icon={PauseCircle} title={`${stats.today_pause_requests} New Pause Request(s)`} description="Review and approve/reject." link="/admin/pause-requests" color="secondary" />}
              {attendancePercent < 80 && stats.total_customers > 0 && <AlertItem icon={TrendingDown} title="Low Attendance Alert" description={`Today's attendance is ${attendancePercent}%`} link="/admin/attendance" color="primary" />}
              {(stats.monthly_revenue?.pending || 0) === 0 && (stats.today_pause_requests || 0) === 0 && attendancePercent >= 80 && <AlertItem icon={CheckCircle} title="All Systems Healthy" description="No pending actions." color="success" />}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivityCard title="Upcoming & Pending Payments" icon={Calendar} link="/admin/payments" items={upcomingPayments} renderItem={renderUpcomingPaymentItem} />
          <RecentActivityCard title="Recent Payments" icon={DollarSign} link="/admin/payments" items={recentPayments} renderItem={renderRecentPaymentItem} />
        </div>
      </div>
      <AddCustomerModal
        isOpen={showAddCustomerModal}
        onOpenChange={setShowAddCustomerModal}
        onCustomerAdded={fetchDashboardData}
      />
      <RecordPaymentModal
        isOpen={showRecordPaymentModal}
        onOpenChange={setShowRecordPaymentModal}
        onPaymentRecorded={fetchDashboardData}
      />
      <CreatePauseRequestModal
        isOpen={showCreatePauseRequestModal}
        onOpenChange={setShowCreatePauseRequestModal}
        onPauseRequestCreated={fetchDashboardData}
      />
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

function QuickActionButton({ icon: Icon, label, onClick }) {
  return (
    <Button
      variant="outline"
      className="w-full h-auto py-3 flex flex-col items-center gap-2 text-center"
      onClick={onClick}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-semibold">{label}</span>
    </Button>
  );
}

function AlertItem({ icon: Icon, title, description, link, color = 'primary' }) {
  const colorClasses = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    success: 'text-success bg-success/10 border-success/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
    secondary: 'text-secondary bg-secondary/10 border-secondary/20',
  };
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${colorClasses[color]}`}>
      <Icon className="w-5 h-5 mt-1 flex-shrink-0" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {link && (
        <Link to={link}>
          <Button size="sm" variant="ghost" className="h-8 px-2">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}

function RecentActivityCard({ title, icon: Icon, link, items, renderItem }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium font-heading">{title}</CardTitle>
        <Link to={link}>
          <Button size="sm" variant="ghost" className="text-primary">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.length > 0 ? (
            items.slice(0, 5).map(renderItem)
          ) : (
            <div className="text-center py-8 text-muted-foreground">No recent activity</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const renderUpcomingPaymentItem = (payment) => {
  const isPending = new Date(payment.due_date) < new Date();
  const IconComponent = isPending ? AlertCircle : Clock;
  return (
    <div key={payment.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isPending ? 'bg-warning/10' : 'bg-secondary/10'}`}>
          <IconComponent className={`w-4 h-4 ${isPending ? 'text-warning' : 'text-secondary'}`} />
        </div>
        <div>
          <p className="text-sm font-medium">{payment.customer_name}</p>
          <p className="text-xs text-muted-foreground">Due on {format(new Date(payment.due_date), 'dd MMM, yyyy')}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${isPending ? 'text-warning' : ''}`}>₹{payment.amount.toLocaleString()}</p>
        <Badge variant={isPending ? 'warning' : 'secondary'} className="text-xs">{isPending ? 'Pending' : 'Upcoming'}</Badge>
      </div>
    </div>
  );
};

const renderRecentPaymentItem = (payment) => (
  <div key={payment.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-success/10">
        <CheckCircle className="w-4 h-4 text-success" />
      </div>
      <div>
        <p className="text-sm font-medium">{payment.customer_name}</p>
        <p className="text-xs text-muted-foreground">{payment.payment_method} • {format(new Date(payment.payment_date), 'dd MMM, HH:mm')}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-semibold text-success">₹{payment.amount.toLocaleString()}</p>
      <Badge variant="success" className="text-xs">{payment.payment_status}</Badge>
    </div>
  </div>
);
