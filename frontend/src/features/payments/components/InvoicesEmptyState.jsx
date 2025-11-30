/**
 * InvoicesEmptyState Component
 * Shown when no invoices exist
 */
import React from 'react';
import { FileText } from 'lucide-react';

export function InvoicesEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No invoices found
            </h3>
            <p className="text-sm text-gray-600 text-center max-w-sm">
                Generate monthly invoices to get started
            </p>
        </div>
    );
}
