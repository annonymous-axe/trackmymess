/**
 * PlansGrid Component
 * Grid of available subscription plans
 */
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PlanCard } from './PlanCard';
import { SUBSCRIPTION_PLANS } from '../constants/plans';

export function PlansGrid({ currentPlan, onSelectPlan }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Available Plans</CardTitle>
                <CardDescription>Choose the perfect plan for your mess</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SUBSCRIPTION_PLANS.map((plan) => (
                    <PlanCard
                        key={plan.value}
                        plan={plan}
                        isCurrentPlan={currentPlan === plan.value}
                        onSelectPlan={onSelectPlan}
                    />
                ))}
            </CardContent>
        </Card>
    );
}
