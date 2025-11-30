/**
 * CustomersCards Component
 * Mobile card view for customers
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash, Pencil } from 'lucide-react';
import { format } from 'date-fns';

export function CustomersCards({ customers, onDelete, onEdit, isDeleting }) {
    return (
        <div className="md:hidden space-y-3">
            {customers.map((customer) => (
                <div
                    key={customer.id}
                    className="p-4 border border-gray-200 rounded-lg bg-white space-y-3"
                >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="font-semibold text-gray-900">{customer.full_name}</p>
                            <p className="text-xs text-gray-600">{customer.email || 'No email'}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onEdit(customer)}
                                className="p-2 h-auto hover:bg-primary-50"
                            >
                                <Pencil className="w-4 h-4 text-primary-600" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onDelete(customer)}
                                className="p-2 h-auto hover:bg-danger-50"
                                disabled={isDeleting}
                            >
                                <Trash className="w-4 h-4 text-danger-600" />
                            </Button>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-xs font-medium text-gray-600">Mobile</p>
                            <p className="text-gray-900">{customer.mobile}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Meal Plan</p>
                            <p className="text-gray-900">{customer.meal_plan_name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Monthly Rate</p>
                            <p className="font-medium text-gray-900">₹{customer.monthly_rate}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Joining Date</p>
                            <p className="text-gray-900">
                                {customer.joining_date ? format(new Date(customer.joining_date), 'dd MMM yyyy') : '-'}
                            </p>
                        </div>
                    </div>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-600">Status:</span>
                            <Badge
                                className={customer.is_active
                                    ? 'bg-success-100 text-success-800 border-success-200'
                                    : 'bg-gray-100 text-gray-800 border-gray-200'
                                }
                            >
                                {customer.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-medium text-gray-600">Dues</p>
                            <p className={customer.current_dues > 0
                                ? 'text-danger-600 font-medium'
                                : 'text-success-600'
                            }>
                                ₹{customer.current_dues}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
