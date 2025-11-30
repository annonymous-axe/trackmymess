/**
 * MealsReport Component
 * Meal consumption table with month/year filters
 */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function MealsReport({ data, month, year, onMonthChange, onYearChange }) {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    const getMonthName = (monthNum) => {
        return new Date(2000, monthNum - 1).toLocaleString('default', { month: 'long' });
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Meal Consumption Report</h3>
                    <div className="flex gap-2">
                        <Select value={month.toString()} onValueChange={(val) => onMonthChange(parseInt(val))}>
                            <SelectTrigger className="w-32 h-11">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((m) => (
                                    <SelectItem key={m} value={m.toString()}>
                                        {getMonthName(m)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={year.toString()} onValueChange={(val) => onYearChange(parseInt(val))}>
                            <SelectTrigger className="w-24 h-11">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((y) => (
                                    <SelectItem key={y} value={y.toString()}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="p-3 text-left font-semibold text-gray-700">Customer</th>
                                <th className="p-3 text-center font-semibold text-gray-700">Breakfast</th>
                                <th className="p-3 text-center font-semibold text-gray-700">Lunch</th>
                                <th className="p-3 text-center font-semibold text-gray-700">Dinner</th>
                                <th className="p-3 text-center font-semibold text-gray-700">Total Meals</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((record, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-3">
                                        <p className="font-semibold text-gray-900">{record.customer_name}</p>
                                        <p className="text-xs text-gray-600">{record.customer_mobile}</p>
                                    </td>
                                    <td className="p-3 text-center text-gray-900">{record.breakfast}</td>
                                    <td className="p-3 text-center text-gray-900">{record.lunch}</td>
                                    <td className="p-3 text-center text-gray-900">{record.dinner}</td>
                                    <td className="p-3 text-center font-bold text-gray-900">{record.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
