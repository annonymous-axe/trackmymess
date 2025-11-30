/**
 * MealPlansGrid Component
 * Grid card view for meal plans
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

export function MealPlansGrid({ plans, onEdit, onDelete, isDeleting }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-lg text-gray-900">{plan.name}</CardTitle>
                                {plan.is_default && (
                                    <Badge className="mt-1 bg-primary-100 text-primary-800 border-primary-200">
                                        Default
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit(plan)}
                                    className="p-2 h-auto hover:bg-gray-100"
                                    title="Edit plan"
                                >
                                    <Edit className="w-4 h-4 text-gray-600" />
                                </Button>
                                {!plan.is_default && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDelete(plan)}
                                        className="p-2 h-auto hover:bg-danger-50"
                                        title="Delete plan"
                                        disabled={isDeleting || plan.customer_count > 0}
                                    >
                                        <Trash2 className="w-4 h-4 text-danger-600" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-gray-600">{plan.description}</p>

                        {/* Meals Included */}
                        <div className="flex flex-wrap gap-1">
                            {plan.meals_included?.map((meal) => (
                                <Badge key={meal} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                                    {meal}
                                </Badge>
                            ))}
                        </div>

                        {/* Rate and Customer Count */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    ₹{plan.rate}
                                </p>
                                <p className="text-xs text-gray-600">
                                    {plan.billing_type === 'MONTHLY' ? 'per month' : 'per day'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{plan.customer_count || 0}</p>
                                <p className="text-xs text-gray-600">customers</p>
                            </div>
                        </div>

                        {/* Warning if customers using plan */}
                        {plan.customer_count > 0 && !plan.is_default && (
                            <p className="text-xs text-warning-600 mt-2">
                                Cannot delete: {plan.customer_count} customers using this plan
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
