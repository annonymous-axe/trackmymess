import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { API } from '@/App';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, DollarSign, Users2 } from 'lucide-react';
import { format } from 'date-fns';

const STAFF_ROLES = [
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ATTENDANCE_OPERATOR', label: 'Attendance Operator' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'COOK', label: 'Cook' },
  { value: 'HELPER', label: 'Helper' },
];

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    gender: 'MALE',
    mobile: '',
    email: '',
    address: '',
    role: 'HELPER',
    joining_date: new Date().toISOString().split('T')[0],
    salary: 0,
  });
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    payment_type: 'SALARY',
    notes: '',
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await axios.get(`${API}/admin/staff`);
      setStaff(response.data);
    } catch (error) {
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/staff`, formData);
      toast.success('Staff member added successfully');
      setShowAddDialog(false);
      setFormData({
        full_name: '',
        gender: 'MALE',
        mobile: '',
        email: '',
        address: '',
        role: 'HELPER',
        joining_date: new Date().toISOString().split('T')[0],
        salary: 0,
      });
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add staff');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/staff/${selectedStaff.id}/payment`, paymentData);
      toast.success('Payment recorded successfully');
      setShowPaymentDialog(false);
      setPaymentData({ amount: 0, payment_type: 'SALARY', notes: '' });
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to record payment');
    }
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    setFormData({
      full_name: member.full_name,
      gender: member.gender,
      mobile: member.mobile,
      email: member.email || '',
      address: member.address,
      role: member.role,
      joining_date: new Date(member.joining_date).toISOString().split('T')[0],
      salary: member.salary,
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/admin/staff/${editingStaff.id}`, formData);
      toast.success('Staff updated successfully');
      setShowEditDialog(false);
      setEditingStaff(null);
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update staff');
    }
  };

  const handleDelete = async (staffId) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      await axios.delete(`${API}/admin/staff/${staffId}`);
      toast.success('Staff deleted successfully');
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete staff');
    }
  };

  if (loading) {
    return (
      <Layout title="Staff Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  const totalSalary = staff.reduce((sum, s) => sum + s.salary, 0);
  const activeStaff = staff.filter(s => s.is_active).length;

  return (
    <Layout title="Staff Management">
      <div className="space-y-6 fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Staff</p>
                <p className="text-3xl font-bold text-gradient">{activeStaff}</p>
              </div>
              <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center">
                <Users2 className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Monthly Salary</p>
                <p className="text-3xl font-bold text-gradient">₹{totalSalary}</p>
              </div>
              <div className="w-14 h-14 rounded-full gradient-success flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Salary</p>
                <p className="text-3xl font-bold text-gradient">₹{activeStaff ? Math.round(totalSalary / activeStaff) : 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <p className="text-gray-600">Total Staff: {staff.length}</p>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white" data-testid="add-staff-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>Enter staff member details</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile * (10 digits)</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      pattern="[0-9]{10}"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STAFF_ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Monthly Salary *</Label>
                    <Input
                      id="salary"
                      type="number"
                      min="0"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joining_date">Joining Date *</Label>
                    <Input
                      id="joining_date"
                      type="date"
                      value={formData.joining_date}
                      onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full gradient-primary text-white">
                  Add Staff Member
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Staff Table */}
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle>All Staff Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Name</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Mobile</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Role</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Salary</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Joining Date</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <p className="font-medium">{member.full_name}</p>
                        <p className="text-xs text-gray-600">{member.email || 'No email'}</p>
                      </td>
                      <td className="p-3">{member.mobile}</td>
                      <td className="p-3">
                        <Badge variant="outline">{member.role.replace('_', ' ')}</Badge>
                      </td>
                      <td className="p-3 font-bold text-green-600">₹{member.salary}</td>
                      <td className="p-3 text-sm">{format(new Date(member.joining_date), 'dd MMM yyyy')}</td>
                      <td className="p-3">
                        <Badge className={member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {member.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(member)}
                            title="Edit Staff"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStaff(member);
                              setShowPaymentDialog(true);
                            }}
                            title="Record Payment"
                          >
                            <DollarSign className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStaff(member);
                              setShowAttendanceDialog(true);
                            }}
                            title="Mark Attendance"
                          >
                            <Calendar className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(member.id)}
                            title="Delete Staff"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {staff.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No staff members found. Add your first staff member to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment for {selectedStaff?.full_name}</DialogTitle>
              <DialogDescription>Record salary or advance payment</DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_type">Payment Type *</Label>
                  <Select value={paymentData.payment_type} onValueChange={(value) => setPaymentData({ ...paymentData, payment_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SALARY">Salary</SelectItem>
                      <SelectItem value="ADVANCE">Advance</SelectItem>
                      <SelectItem value="DEDUCTION">Deduction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
              <Button type="submit" className="w-full gradient-primary text-white">
                Record Payment
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Staff Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
              <DialogDescription>Update staff member details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_full_name">Full Name *</Label>
                  <Input
                    id="edit_full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_mobile">Mobile *</Label>
                  <Input
                    id="edit_mobile"
                    type="tel"
                    pattern="[0-9]{10}"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_role">Role *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAFF_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_salary">Monthly Salary *</Label>
                  <Input
                    id="edit_salary"
                    type="number"
                    min="0"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full gradient-primary text-white">
                Update Staff Member
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Staff Attendance Dialog */}
        <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Attendance for {selectedStaff?.full_name}</DialogTitle>
              <DialogDescription>Record staff attendance for a specific date</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  Staff attendance tracking feature coming soon! Currently, you can track customer attendance.
                </p>
              </div>
              <Button onClick={() => setShowAttendanceDialog(false)} className="w-full">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
