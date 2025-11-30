/**
 * RevenueReport Component
 * Revenue trend chart and summary cards
 */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function RevenueReport({ data }) {
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const totalPayments = data.reduce((sum, d) => sum + d.payment_count, 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <Card className="lg:col-span-2">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-900">Revenue Trend (Last 6 Months)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="month"
                                    stroke="#6b7280"
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ r: 6 }}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="space-y-4">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-1">Total Revenue</p>
                                    <p className="text-3xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
                                </div>
                                <div className="p-3 rounded-full bg-primary-100 text-primary-600">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-1">Total Payments</p>
                                    <p className="text-3xl font-bold text-gray-900">{totalPayments}</p>
                                </div>
                                <div className="p-3 rounded-full bg-success-100 text-success-600">
                                    <FileText className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
