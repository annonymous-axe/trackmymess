/**
 * PauseRequestCard Component
 * Single pause request card with approve/reject actions
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS = {
    PENDING: 'bg-warning-100 text-warning-800 border-warning-200',
    APPROVED: 'bg-success-100 text-success-800 border-success-200',
    REJECTED: 'bg-danger-100 text-danger-800 border-danger-200',
};

export function PauseRequestCard({ request, onApprove, onReject, isUpdating }) {
    return (
        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{request.customer_name}</h4>
                        <Badge className={STATUS_COLORS[request.status]}>
                            {request.status}
                        </Badge>
                    </div>

                    {/* Details */}
                    <div className="space-y-1 text-sm text-gray-600">
                        <p>
                            <strong className="text-gray-900">Duration:</strong>{' '}
                            {format(new Date(request.start_date), 'dd MMM yyyy')} to{' '}
                            {format(new Date(request.end_date), 'dd MMM yyyy')}
                        </p>
                        <p>
                            <strong className="text-gray-900">Reason:</strong> {request.reason}
                        </p>
                        {request.admin_notes && (
                            <p>
                                <strong className="text-gray-900">Admin Notes:</strong> {request.admin_notes}
                            </p>
                        )}
                        <p className="text-xs">
                            <strong className="text-gray-900">Created:</strong>{' '}
                            {format(new Date(request.created_at), 'dd MMM yyyy HH:mm')}
                        </p>
                    </div>
                </div>

                {/* Actions (only for pending requests) */}
                {request.status === 'PENDING' && (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-success-600 hover:bg-success-50 border-success-200 h-9"
                            onClick={() => onApprove(request.id)}
                            disabled={isUpdating}
                        >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-danger-600 hover:bg-danger-50 border-danger-200 h-9"
                            onClick={() => onReject(request.id)}
                            disabled={isUpdating}
                        >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
