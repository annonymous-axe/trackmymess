/**
 * CurrentPlanCard Component 
 * Displays current plan information
 */
import React from 'react';
import { CheckCircle } from 'lucide-react';

export function CurrentPlanCard({ planData }) {
    const currentPlan = planData?.current_plan;

    if (!currentPlan) return null;

    const statusClass =
        currentPlan.status === 'trial'
            ? 'bg-warning-100 text-warning-800'
            : currentPlan.status === 'active'
                ? 'bg-success-100 text-success-800'
                : 'bg-gray-200 text-gray-800';

    return (
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-primary-800 mb-1">Current Plan</p>
                    <h3 className="text-2xl font-bold text-primary-900">
                        {currentPlan.plan?.capacity} Users - {currentPlan.plan?.tenure}
                    </h3>
                    <div className="mt-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusClass}`}>
                            {currentPlan.status === 'trial' ? 'Trial Period' : currentPlan.status}
                        </span>
                    </div>
                </div>
                <CheckCircle className="w-16 h-16 text-primary-600" />
            </div>
        </div>
    );
}
