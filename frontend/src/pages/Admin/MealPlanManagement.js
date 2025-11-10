import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';
import { API } from '@/App';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

export default function MealPlanManagement() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    meals_included: { Breakfast: false, Lunch: false, Dinner: false },
    billing_type: 'MONTHLY',
    rate: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API}/admin/meal-plans`);
      setPlans(response.data);
    } catch (error) {
      toast.error('Failed to fetch meal plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const meals = Object.keys(formData.meals_included).filter(key => formData.meals_included[key]);
      if (meals.length === 0) {
        toast.error('Please select at least one meal');
        return;
      }

      const submitData = {
        name: formData.name,
        description: formData.description,
        meals_included: meals,
        billing_type: formData.billing_type,
        rate: formData.rate,
        is_active: formData.is_active,
      };

      await axios.post(`${API}/admin/meal-plans`, submitData);
      toast.success('Meal plan created successfully');
      setShowAddDialog(false);
      setFormData({
        name: '',
        description: '',
        meals_included: { Breakfast: false, Lunch: false, Dinner: false },
        billing_type: 'MONTHLY',
        rate: 0,
        is_active: true,
      });
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create meal plan');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    const mealsObj = { Breakfast: false, Lunch: false, Dinner: false };
    plan.meals_included.forEach(meal => {
      mealsObj[meal] = true;
    });
    setFormData({
      name: plan.name,
      description: plan.description,
      meals_included: mealsObj,
      billing_type: plan.billing_type,
      rate: plan.rate,
      is_active: plan.is_active,
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const meals = Object.keys(formData.meals_included).filter(key => formData.meals_included[key]);
      if (meals.length === 0) {
        toast.error('Please select at least one meal');
        return;
      }

      const submitData = {
        name: formData.name,
        description: formData.description,
        meals_included: meals,
        billing_type: formData.billing_type,
        rate: formData.rate,
        is_active: formData.is_active,
      };

      await axios.put(`${API}/admin/meal-plans/${editingPlan.id}`, submitData);
      toast.success('Meal plan updated successfully');
      setShowEditDialog(false);
      setEditingPlan(null);
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update meal plan');
    }
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this meal plan?')) {
      return;
    }

    try {
      await axios.delete(`${API}/admin/meal-plans/${planId}`);
      toast.success('Meal plan deleted successfully');
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete meal plan');
    }
  };

  if (loading) {
    return (
      <Layout title="Meal Plan Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Meal Plan Management">
      <div className="space-y-6 fade-in">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <p className="text-gray-600">Total Plans: {plans.length}</p>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500" data-testid="add-meal-plan-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Meal Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Meal Plan</DialogTitle>
                <DialogDescription>Create a custom meal plan for your customers</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="plan-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    data-testid="plan-description-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meals Included *</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="breakfast"
                        checked={formData.meals_included.Breakfast}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            meals_included: { ...formData.meals_included, Breakfast: checked },
                          })
                        }
                        data-testid="breakfast-checkbox"
                      />
                      <Label htmlFor="breakfast" className="cursor-pointer">Breakfast</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="lunch"
                        checked={formData.meals_included.Lunch}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            meals_included: { ...formData.meals_included, Lunch: checked },
                          })
                        }
                        data-testid="lunch-checkbox"
                      />
                      <Label htmlFor="lunch" className="cursor-pointer">Lunch</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dinner"
                        checked={formData.meals_included.Dinner}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            meals_included: { ...formData.meals_included, Dinner: checked },
                          })
                        }
                        data-testid="dinner-checkbox"
                      />
                      <Label htmlFor="dinner" className="cursor-pointer">Dinner</Label>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billing_type">Billing Type *</Label>
                    <Select
                      value={formData.billing_type}
                      onValueChange={(value) => setFormData({ ...formData, billing_type: value })}
                    >
                      <SelectTrigger data-testid="billing-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="PER_DAY">Per Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Rate (₹) *</Label>
                    <Input
                      id="rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                      required
                      data-testid="rate-input"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500" data-testid="submit-meal-plan-button">
                  Create Meal Plan
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Meal Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="glass card-hover" data-testid={`meal-plan-${plan.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {plan.is_default && (
                      <Badge className="mt-1" variant="outline">Default</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(plan)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      data-testid={`edit-plan-${plan.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {!plan.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(plan.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`delete-plan-${plan.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">{plan.description}</p>
                <div className="flex flex-wrap gap-1">
                  {plan.meals_included.map((meal) => (
                    <Badge key={meal} variant="secondary" className="text-xs">{meal}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>
                      ₹{plan.rate}
                    </p>
                    <p className="text-xs text-gray-600">{plan.billing_type === 'MONTHLY' ? 'per month' : 'per day'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{plan.customer_count}</p>
                    <p className="text-xs text-gray-600">customers</p>
                  </div>
                </div>
                {plan.customer_count > 0 && !plan.is_default && (
                  <p className="text-xs text-yellow-600 mt-2">Cannot delete: {plan.customer_count} customers using this plan</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {plans.length === 0 && (
          <Card className="glass">
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No meal plans found.</p>
            </CardContent>
          </Card>
        )}

        {/* Edit Meal Plan Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Meal Plan</DialogTitle>
              <DialogDescription>Update meal plan details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Plan Name *</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_description">Description *</Label>
                <Input
                  id="edit_description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Meals Included *</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_breakfast"
                      checked={formData.meals_included.Breakfast}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          meals_included: { ...formData.meals_included, Breakfast: checked },
                        })
                      }
                    />
                    <Label htmlFor="edit_breakfast" className="cursor-pointer">Breakfast</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_lunch"
                      checked={formData.meals_included.Lunch}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          meals_included: { ...formData.meals_included, Lunch: checked },
                        })
                      }
                    />
                    <Label htmlFor="edit_lunch" className="cursor-pointer">Lunch</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_dinner"
                      checked={formData.meals_included.Dinner}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          meals_included: { ...formData.meals_included, Dinner: checked },
                        })
                      }
                    />
                    <Label htmlFor="edit_dinner" className="cursor-pointer">Dinner</Label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_billing_type">Billing Type *</Label>
                  <Select
                    value={formData.billing_type}
                    onValueChange={(value) => setFormData({ ...formData, billing_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="PER_DAY">Per Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_rate">Rate (₹) *</Label>
                  <Input
                    id="edit_rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full gradient-primary text-white">
                Update Meal Plan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
