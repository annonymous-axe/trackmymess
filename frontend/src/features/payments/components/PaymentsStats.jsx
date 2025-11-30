/**
 * PaymentsStats Component
 * Summary statistics cards for payments
 */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';

export function PaymentsStats({ payments }) {
    const completedPayments = payments.filter(p => p.payment_status === 'COMPLETED');
    const totalAmount = completedPayments.reduce((sum, p) => sum + p.amount, 0);

    const now = new Date();
    const thisMonthAmount = completedPayments.filter(p => {
        const paymentDate = new Date(p.payment_date);
        return paymentDate.getMonth() === now.getMonth() &&
            paymentDate.getFullYear() === now.getFullYear();
    }).reduce((sum, p) => sum + p.amount, 0);

    const avgPayment = completedPayments.length > 0
        ? Math.round(totalAmount / completedPayments.length)
        : 0;

    const stats = [
        { icon: Users, title: 'Total Payments', value: payments.length, color: 'primary' },
        { icon: DollarSign, title: 'Total Collected', value: `₹${totalAmount.toLocaleString()}`, color: 'success' },
        { icon: Calendar, title: 'This Month', value: `₹${thisMonthAmount.toLocaleString()}`, color: 'secondary' },
        { icon: TrendingUp, title: 'Average Payment', value: `₹${avgPayment.toLocaleString()}`, color: 'warning' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
            ))}
        </div>
    );
}

function StatCard({ icon: Icon, title, value, color = 'primary' }) {
    const colorClasses = {
        primary: 'text-primary-600 bg-primary-100',
        success: 'text-success-600 bg-success-100',
        warning: 'text-warning-600 bg-warning-100',
        secondary: 'text-secondary-600 bg-secondary-100',
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">{title}</p>
                        <p className="text-3xl font-bold text-gray-900">{value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
