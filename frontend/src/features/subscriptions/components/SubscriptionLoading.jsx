/**
 * SubscriptionLoading Component
 * Loading state with skeleton for subscription page
 */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SubscriptionLoading() {
    return (
        <div className="space-y-6 p-4 md:p-6">
            <Card>
                <CardContent className="p-6">
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}
