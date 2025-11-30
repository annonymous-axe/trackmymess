/**
 * PauseRequestsList Component
 * Container component that maps through pause requests
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PauseRequestCard } from './PauseRequestCard';

export function PauseRequestsList({ requests, onApprove, onReject, isUpdating }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                    All Pause Requests
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {requests.map((request) => (
                        <PauseRequestCard
                            key={request.id}
                            request={request}
                            onApprove={onApprove}
                            onReject={onReject}
                            isUpdating={isUpdating}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
