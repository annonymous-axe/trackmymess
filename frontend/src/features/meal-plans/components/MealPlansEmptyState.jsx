/**
 * MealPlansEmptyState Component
 * Shown when no meal plans exist
 */
import React from 'react';
import { Sandwich } from 'lucide-react';

export function MealPlansEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Sandwich className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No meal plans yet
            </h3>
            <p className="text-sm text-gray-600 text-center max-w-sm">
                Get started by creating your first meal plan.
            </p>
        </div>
    );
}
