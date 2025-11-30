/**
 * AgingReport Component
 * Aging analysis with pie chart and breakdown
 */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export function AgingReport({ data }) {
    const agingChartData = [
        { name: '0-30 Days', value: data['0-30']?.length || 0 },
        { name: '31-60 Days', value: data['31-60']?.length || 0 },
        { name: '61-90 Days', value: data['61-90']?.length || 0 },
        { name: '90+ Days', value: data['90+']?.length || 0 },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">Aging Analysis</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={agingChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => `${entry.name}: ${entry.value}`}
                                outerRadius={100}
                                fill="#3b82f6"
                                dataKey="value"
                            >
                                {agingChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Breakdown */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">Outstanding by Age</h3>
                    <div className="space-y-3">
                        {Object.entries(data).map(([range, invoices]) => {
                            const total = invoices.reduce((sum, inv) => sum + inv.due_amount, 0);
                            return (
                                <div
                                    key={range}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-900">{range} Days</p>
                                        <p className="text-sm text-gray-600">{invoices.length} invoices</p>
                                    </div>
                                    <p className="font-bold text-danger-600">₹{total.toFixed(2)}</p>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
