import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { API } from '@/App';
import { toast } from 'sonner';
import { Calendar, Save } from 'lucide-react';
import { format } from 'date-fns';

export default function AttendanceManagement() {
  const [customers, setCustomers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const customersRes = await axios.get(`${API}/admin/customers`);
      const activeCustomers = customersRes.data.filter(c => c.is_active);
      setCustomers(activeCustomers);

      // Fetch existing attendance for the date
      try {
        const attendanceRes = await axios.get(`${API}/admin/attendance?date=${selectedDate}`);
        const attendanceMap = {};
        attendanceRes.data.forEach(record => {
          attendanceMap[record.customer_id] = {
            breakfast: record.breakfast,
            lunch: record.lunch,
            dinner: record.dinner,
          };
        });
        setAttendance(attendanceMap);
      } catch (error) {
        // No attendance for this date yet
        setAttendance({});
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (customerId, meal) => {
    setAttendance(prev => ({
      ...prev,
      [customerId]: {
        breakfast: prev[customerId]?.breakfast || false,
        lunch: prev[customerId]?.lunch || false,
        dinner: prev[customerId]?.dinner || false,
        [meal]: !prev[customerId]?.[meal],
      },
    }));
  };

  const handleBulkAction = (action) => {
    const newAttendance = {};
    customers.forEach(customer => {
      if (action === 'all-present') {
        newAttendance[customer.id] = { breakfast: true, lunch: true, dinner: true };
      } else if (action === 'all-absent') {
        newAttendance[customer.id] = { breakfast: false, lunch: false, dinner: false };
      }
    });
    setAttendance(newAttendance);
    toast.success('Bulk action applied');
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const records = customers.map(customer => ({
        customer_id: customer.id,
        breakfast: attendance[customer.id]?.breakfast || false,
        lunch: attendance[customer.id]?.lunch || false,
        dinner: attendance[customer.id]?.dinner || false,
      }));

      await axios.post(`${API}/admin/attendance`, {
        date: new Date(selectedDate).toISOString(),
        records,
      });

      toast.success('Attendance saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Attendance Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const presentCount = customers.filter(c =>
    attendance[c.id]?.breakfast || attendance[c.id]?.lunch || attendance[c.id]?.dinner
  ).length;

  return (
    <Layout title="Attendance Management">
      <div className="space-y-6 fade-in">
        {/* Date Selector and Actions */}
        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="space-y-2">
                <Label htmlFor="date">Select Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  data-testid="attendance-date-input"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => handleBulkAction('all-present')}
                  data-testid="mark-all-present-button"
                >
                  Mark All Present
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleBulkAction('all-absent')}
                  data-testid="mark-all-absent-button"
                >
                  Mark All Absent
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-cyan-500"
                  onClick={handleSubmit}
                  disabled={saving}
                  data-testid="save-attendance-button"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Attendance'}
                </Button>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="text-gray-600">Total Customers: <strong>{customers.length}</strong></span>
              <span className="text-green-600">Present: <strong>{presentCount}</strong></span>
              <span className="text-red-600">Absent: <strong>{customers.length - presentCount}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Mark Attendance for {format(new Date(selectedDate), 'dd MMMM yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Customer Name</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-600">Breakfast</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-600">Lunch</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-600">Dinner</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => {
                    const isPresent = attendance[customer.id]?.breakfast ||
                                    attendance[customer.id]?.lunch ||
                                    attendance[customer.id]?.dinner;
                    return (
                      <tr key={customer.id} className="border-b hover:bg-gray-50" data-testid={`attendance-row-${customer.id}`}>
                        <td className="p-3">
                          <p className="font-medium">{customer.full_name}</p>
                          <p className="text-xs text-gray-600">{customer.mobile}</p>
                        </td>
                        <td className="p-3 text-center">
                          <Checkbox
                            checked={attendance[customer.id]?.breakfast || false}
                            onCheckedChange={() => handleToggle(customer.id, 'breakfast')}
                            data-testid={`breakfast-${customer.id}`}
                          />
                        </td>
                        <td className="p-3 text-center">
                          <Checkbox
                            checked={attendance[customer.id]?.lunch || false}
                            onCheckedChange={() => handleToggle(customer.id, 'lunch')}
                            data-testid={`lunch-${customer.id}`}
                          />
                        </td>
                        <td className="p-3 text-center">
                          <Checkbox
                            checked={attendance[customer.id]?.dinner || false}
                            onCheckedChange={() => handleToggle(customer.id, 'dinner')}
                            data-testid={`dinner-${customer.id}`}
                          />
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isPresent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {isPresent ? 'Present' : 'Absent'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {customers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No active customers found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
