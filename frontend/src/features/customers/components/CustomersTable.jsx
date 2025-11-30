/**
 * CustomersTable Component
 * Desktop table view for customers
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash, Pencil } from 'lucide-react';
import { format } from 'date-fns';

export function CustomersTable({ customers, onDelete, onEdit, isDeleting }) {
    return (
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left p-3 font-semibold text-gray-700">Name</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Mobile</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Meal Plan</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Monthly Rate</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Joining Date</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Dues</th>
                        <th className="text-center p-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((customer) => (
                        <tr
                            key={customer.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                            <td className="p-3">
                                <p className="font-medium text-gray-900">{customer.full_name}</p>
                                <p className="text-xs text-gray-600">{customer.email || 'No email'}</p>
                            </td>
                            <td className="p-3 text-gray-700">{customer.mobile}</td>
                            <td className="p-3 text-gray-700">{customer.meal_plan_name || 'N/A'}</td>
                            <td className="p-3 font-medium text-gray-900">₹{customer.monthly_rate}</td>
                            <td className="p-3 text-gray-700">
                                {customer.joining_date ? format(new Date(customer.joining_date), 'dd MMM yyyy') : '-'}
                            </td>
                            <td className="p-3">
                                <Badge
                                    className={customer.is_active
                                        ? 'bg-success-100 text-success-800 border-success-200'
                                        : 'bg-gray-100 text-gray-800 border-gray-200'
                                    }
                                >
                                    {customer.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </td>
                            <td className="p-3">
                                <span className={customer.current_dues > 0
                                    ? 'text-danger-600 font-medium'
                                    : 'text-success-600'
                                }>
                                    ₹{customer.current_dues}
                                </span>
                            </td>
                            <td className="p-3">
                                <div className="flex items-center justify-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => onEdit(customer)}
                                        className="p-2 h-auto hover:bg-primary-50"
                                        title="Edit customer"
                                    >
                                        <Pencil className="w-4 h-4 text-primary-600" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => onDelete(customer)}
                                        className="p-2 h-auto hover:bg-danger-50"
                                        title="Delete customer"
                                        disabled={isDeleting}
                                    >
                                        <Trash className="w-4 h-4 text-danger-600" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
