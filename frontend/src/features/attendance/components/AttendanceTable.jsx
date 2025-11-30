/**
 * AttendanceTable Component
 * Table view for marking attendance with meal checkboxes
 */
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

export function AttendanceTable({ customers, attendance, onToggle }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left p-3 font-semibold text-gray-700">Customer Name</th>
                        <th className="text-center p-3 font-semibold text-gray-700">Breakfast</th>
                        <th className="text-center p-3 font-semibold text-gray-700">Lunch</th>
                        <th className="text-center p-3 font-semibold text-gray-700">Dinner</th>
                        <th className="text-center p-3 font-semibold text-gray-700">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((customer) => {
                        const isPresent =
                            attendance[customer.id]?.breakfast ||
                            attendance[customer.id]?.lunch ||
                            attendance[customer.id]?.dinner;

                        return (
                            <tr
                                key={customer.id}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                <td className="p-3">
                                    <p className="font-medium text-gray-900">{customer.full_name}</p>
                                    <p className="text-xs text-gray-600">{customer.mobile}</p>
                                </td>
                                <td className="p-3 text-center">
                                    <div className="flex justify-center">
                                        <Checkbox
                                            checked={attendance[customer.id]?.breakfast || false}
                                            onCheckedChange={() => onToggle(customer.id, 'breakfast')}
                                        />
                                    </div>
                                </td>
                                <td className="p-3 text-center">
                                    <div className="flex justify-center">
                                        <Checkbox
                                            checked={attendance[customer.id]?.lunch || false}
                                            onCheckedChange={() => onToggle(customer.id, 'lunch')}
                                        />
                                    </div>
                                </td>
                                <td className="p-3 text-center">
                                    <div className="flex justify-center">
                                        <Checkbox
                                            checked={attendance[customer.id]?.dinner || false}
                                            onCheckedChange={() => onToggle(customer.id, 'dinner')}
                                        />
                                    </div>
                                </td>
                                <td className="p-3 text-center">
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full font-medium ${isPresent
                                                ? 'bg-success-100 text-success-800 border border-success-200'
                                                : 'bg-danger-100 text-danger-800 border border-danger-200'
                                            }`}
                                    >
                                        {isPresent ? 'Present' : 'Absent'}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
