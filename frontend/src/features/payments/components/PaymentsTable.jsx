/**
 * PaymentsTable Component  
 * Table view for payments with actions
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const PAYMENT_METHODS = {
    CASH: 'Cash',
    UPI: 'UPI',
    BANK_TRANSFER: 'Bank Transfer',
    RAZORPAY: 'Razorpay',
};

const STATUS_CONFIG = {
    COMPLETED: { variant: 'default', icon: CheckCircle, className: 'bg-success-100 text-success-800 border-success-200' },
    PENDING: { variant: 'default', icon: Clock, className: 'bg-warning-100 text-warning-800 border-warning-200' },
    FAILED: { variant: 'default', icon: AlertCircle, className: 'bg-danger-100 text-danger-800 border-danger-200' },
};

export function PaymentsTable({ payments, onEdit, onDelete, isDeleting }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="p-4 font-semibold text-gray-700 text-left">Customer</th>
                        <th className="p-4 font-semibold text-gray-700 text-left">Amount</th>
                        <th className="p-4 font-semibold text-gray-700 text-left">Method</th>
                        <th className="p-4 font-semibold text-gray-700 text-left">Transaction ID</th>
                        <th className="p-4 font-semibold text-gray-700 text-left">Status</th>
                        <th className="p-4 font-semibold text-gray-700 text-left">Date</th>
                        <th className="p-4 font-semibold text-gray-700 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment) => {
                        const statusConfig = STATUS_CONFIG[payment.payment_status] || STATUS_CONFIG.PENDING;
                        const StatusIcon = statusConfig.icon;

                        return (
                            <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <p className="font-semibold text-gray-900">{payment.customer_name}</p>
                                    {payment.notes && (
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">{payment.notes}</p>
                                    )}
                                </td>
                                <td className="p-4">
                                    <span className="font-bold text-success-600">₹{payment.amount.toLocaleString()}</span>
                                </td>
                                <td className="p-4">
                                    <Badge variant="outline" className="border-gray-300">
                                        {PAYMENT_METHODS[payment.payment_method] || payment.payment_method}
                                    </Badge>
                                </td>
                                <td className="p-4">
                                    <span className="font-mono text-gray-600 text-xs">
                                        {payment.transaction_id || payment.razorpay_payment_id || '-'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <Badge className={statusConfig.className}>
                                        <StatusIcon className="w-3 h-3 mr-1" />
                                        {payment.payment_status}
                                    </Badge>
                                </td>
                                <td className="p-4">
                                    <span className="text-gray-900">
                                        {format(new Date(payment.payment_date), 'dd MMM yyyy')}
                                    </span>
                                    <p className="text-xs text-gray-600">
                                        {format(new Date(payment.payment_date), 'HH:mm')}
                                    </p>
                                </td>
                                <td className="p-4">
                                    <div className="flex justify-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(payment)}
                                            className="p-2 h-auto hover:bg-gray-100"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4 text-gray-600" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(payment)}
                                            className="p-2 h-auto hover:bg-danger-50"
                                            disabled={isDeleting}
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4 text-danger-600" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
