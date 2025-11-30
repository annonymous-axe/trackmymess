/**
 * AttendanceLoading Component
 * Loading state with spinner
 */
import React from 'react';

export function AttendanceLoading() {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-primary" />
                <p className="text-sm text-gray-600">Loading attendance...</p>
            </div>
        </div>
    );
}
