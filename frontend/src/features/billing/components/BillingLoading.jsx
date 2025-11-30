/**
 * BillingLoading Component
 */
import React from 'react';

export function BillingLoading() {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-primary" />
        </div>
    );
}
