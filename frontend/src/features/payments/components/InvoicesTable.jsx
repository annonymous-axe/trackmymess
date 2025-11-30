/**
 * InvoicesTable Component
 * Table view for invoices
 */
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock } from 'lucide-react';

export function InvoicesTable({ invoices }) {
    const getMonthName = (monthNum) => {
        const date = new Date();
        date.setMonth(monthNum - 1);
        return date.toLocaleString('en-US', { month: 'long' });
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="p-4 font-semibold text-gray-700 text-left">Invoice #</th>
                        <th className="p-4 font-semibold text-gray-700 text-left">Customer</th>
                        <th className="p-4 font-semibold text-gray-700 text-left">Period</th>
                        <th className="p-4 font-semibold text-gray-700 text-left">Days</th>
                        <th className="p-4 font-semibold text-gray-700 text-left">Amount</th>
                        <th className="p-4 font-semibold text-gray-700 text-left">Paid</th>
                        <th className="p-4 font-semibold text-gray-700 text-left">Due</th>
                        <th className="p-4 font-semibold text-gray-700 text-left">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map((invoice) => {
                        const isPaid = invoice.due_amount === 0;

                        return (
                            <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <span className="font-mono font-semibold text-gray-900">{invoice.invoice_number}</span>
                                </td>
                                <td className="p-4">
                                    <span className="font-semibold text-gray-900">{invoice.customer_name}</span>
                                </td>
                                <td className="p-4">
                                    <span className="text-gray-900">
                                        {getMonthName(invoice.month)} {invoice.year}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div>
                                        <span className="font-semibold text-gray-900">{invoice.present_days}</span>
                                        <span className="text-gray-600"> / {invoice.total_days}</span>
                                        {invoice.pause_days > 0 && (
                                            <span className="text-xs text-warning-600 ml-1">
                                                ({invoice.pause_days} paused)
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="font-bold text-gray-900">₹{invoice.total_amount}</span>
                                </td>
                                <td className="p-4">
                                    <span className="font-semibold text-success-600">₹{invoice.paid_amount}</span>
                                </td>
                                <td className="p-4">
                                    <span className={`font-semibold ${invoice.due_amount > 0 ? 'text-danger-600' : 'text-success-600'}`}>
                                        ₹{invoice.due_amount}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <Badge className={isPaid ? 'bg-success-100 text-success-800 border-success-200' : 'bg-warning-100 text-warning-800 border-warning-200'}>
                                        {isPaid ? (
                                            <>
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Paid
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="w-3 h-3 mr-1" />
                                                Pending
                                            </>
                                        )}
                                    </Badge>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
