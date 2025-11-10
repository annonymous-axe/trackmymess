import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { API } from '@/App';
import { Users, Calendar, DollarSign, Utensils, PauseCircle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API}/admin/dashboard`);
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
      title: 'Total Customers',
      value: `${dashboard?.total_customers || 0} / ${dashboard?.capacity || 0}`,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      testId: 'total-customers-stat'
    },
    {
      title: "Today's Attendance",
      value: `${dashboard?.today_attendance?.present || 0} Present`,
      subtitle: `${dashboard?.today_attendance?.absent || 0} Absent`,
      icon: Calendar,
      color: 'from-green-500 to-emerald-500',
      testId: 'today-attendance-stat'
    },
    {
      title: 'Revenue Collected',
      value: `₹${dashboard?.monthly_revenue?.collected || 0}`,
      subtitle: `Pending: ₹${dashboard?.monthly_revenue?.pending || 0}`,
      icon: DollarSign,
      color: 'from-purple-500 to-pink-500',
      testId: 'revenue-stat'
    },
    {
      title: 'Meals Served',
      value: dashboard?.meals_served_month || 0,
      subtitle: 'This Month',
      icon: Utensils,
      color: 'from-yellow-500 to-orange-500',
      testId: 'meals-served-stat'
    },
  ];

  return (
    <Layout title="Dashboard">
      <div className="space-y-6 fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="glass card-hover" data-testid={stat.testId}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>
                    {stat.value}
                  </p>
                  {stat.subtitle && (
                    <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/admin/attendance" className="block">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-colors cursor-pointer" data-testid="mark-attendance-link">
                  <Calendar className="w-6 h-6 text-blue-600 mb-2" />
                  <p className="font-medium text-blue-900">Mark Attendance</p>
                  <p className="text-sm text-blue-700">Record today's attendance</p>
                </div>
              </a>
              <a href="/admin/payments" className="block">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-colors cursor-pointer" data-testid="record-payment-link">
                  <DollarSign className="w-6 h-6 text-green-600 mb-2" />
                  <p className="font-medium text-green-900">Record Payment</p>
                  <p className="text-sm text-green-700">Add new payment entry</p>
                </div>
              </a>
              <a href="/admin/customers" className="block">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-colors cursor-pointer" data-testid="add-customer-link">
                  <Users className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="font-medium text-purple-900">Add Customer</p>
                  <p className="text-sm text-purple-700">Register new customer</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Payments */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard?.recent_payments && dashboard.recent_payments.length > 0 ? (
                  dashboard.recent_payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`payment-${payment.id}`}>
                      <div>
                        <p className="font-medium text-sm">{payment.customer_name}</p>
                        <p className="text-xs text-gray-600">{payment.payment_method}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{payment.amount}</p>
                        <p className="text-xs text-gray-600">{format(new Date(payment.payment_date), 'MMM dd')}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent payments</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Pause Requests */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Recent Pause Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard?.recent_pause_requests && dashboard.recent_pause_requests.length > 0 ? (
                  dashboard.recent_pause_requests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`pause-request-${request.id}`}>
                      <div>
                        <p className="font-medium text-sm">{request.customer_name}</p>
                        <p className="text-xs text-gray-600">
                          {format(new Date(request.start_date), 'MMM dd')} - {format(new Date(request.end_date), 'MMM dd')}
                        </p>
                      </div>
                      <div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent pause requests</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
