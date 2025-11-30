/**
 * InvoicesStats Component
 * Summary statistics cards for invoices
 */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Receipt, CheckCircle, AlertCircle } from 'lucide-react';

export function InvoicesStats({ invoices }) {
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paid_amount, 0);
    const totalDue = invoices.reduce((sum, inv) => sum + inv.due_amount, 0);

    const stats = [
        { icon: FileText, title: 'Total Invoices', value: invoices.length, color: 'primary' },
        { icon: Receipt, title: 'Total Invoiced', value: `₹${totalInvoiced.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'primary' },
        { icon: CheckCircle, title: 'Total Paid', value: `₹${totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'success' },
        { icon: AlertCircle, title: 'Total Due', value: `₹${totalDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'danger' },
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
        danger: 'text-danger-600 bg-danger-100',
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
