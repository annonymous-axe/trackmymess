/**
 * DuesReport Component
 * Table of customers with pending dues
 */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function DuesReport({ data }) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Customers with Pending Dues</h3>
                    <Badge className="bg-danger-100 text-danger-800 border-danger-200">
                        {data.length} Customers
                    </Badge>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="p-3 text-left font-semibold text-gray-700">Customer</th>
                                <th className="p-3 text-left font-semibold text-gray-700">Mobile</th>
                                <th className="p-3 text-left font-semibold text-gray-700">Meal Plan</th>
                                <th className="p-3 text-right font-semibold text-gray-700">Dues Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((customer) => (
                                <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-3 font-semibold text-gray-900">{customer.full_name}</td>
                                    <td className="p-3 text-gray-900">{customer.mobile}</td>
                                    <td className="p-3 text-gray-900">{customer.meal_plan_name || 'N/A'}</td>
                                    <td className="p-3 text-right font-bold text-danger-600">
                                        ₹{customer.current_dues}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
