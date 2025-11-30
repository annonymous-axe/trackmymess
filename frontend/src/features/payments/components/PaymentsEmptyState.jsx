/**
 * PaymentsEmptyState Component
 * Shown when no payments exist or no results found
 */
import React from 'react';
import { CreditCard } from 'lucide-react';

export function PaymentsEmptyState({ hasSearchTerm }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {hasSearchTerm ? 'No payments found' : 'No payments yet'}
            </h3>
            <p className="text-sm text-gray-600 text-center max-w-sm">
                {hasSearchTerm
                    ? 'Try adjusting your search'
                    : 'Record your first payment to get started'}
            </p>
        </div>
    );
}
