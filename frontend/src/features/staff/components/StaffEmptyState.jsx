/**
 * StaffEmptyState Component
 * Shown when no staff exist or search returns no results
 */
import React from 'react';
import { Users2 } from 'lucide-react';

export function StaffEmptyState({ hasSearchTerm }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Users2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {hasSearchTerm ? 'No staff found' : 'No staff members yet'}
            </h3>
            <p className="text-sm text-gray-600 text-center max-w-sm">
                {hasSearchTerm
                    ? 'Try adjusting your search term.'
                    : 'Get started by adding your first staff member.'}
            </p>
        </div>
    );
}
