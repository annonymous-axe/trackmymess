/**
 * ReportsEmptyState Component
 * Shown when no report data exists
 */
import React from 'react';
import { BarChart3 } from 'lucide-react';

export function ReportsEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No data available
            </h3>
            <p className="text-sm text-gray-600 text-center max-w-sm">
                There is no data to display for this report period
            </p>
        </div>
    );
}
