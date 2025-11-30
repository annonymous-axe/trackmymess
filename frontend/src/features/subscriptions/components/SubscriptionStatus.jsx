/**
 * SubscriptionStatus Component
 * Displays current subscription status card
 */
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { SUBSCRIPTION_PLANS } from '../constants/plans';

export function SubscriptionStatus({ tenantInfo }) {
    const calculateDaysRemaining = () => {
        if (!tenantInfo?.subscription_end_date) return null;
        const endDate = new Date(tenantInfo.subscription_end_date);
        const today = new Date();
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const isSubscriptionActive = () => {
        if (!tenantInfo?.subscription_end_date) return false;
        const endDate = new Date(tenantInfo.subscription_end_date);
        return endDate > new Date();
    };

    const daysRemaining = calculateDaysRemaining();
    const isActive = isSubscriptionActive();
    const currentPlan = SUBSCRIPTION_PLANS.find(p => p.value === tenantInfo?.subscription_plan) || SUBSCRIPTION_PLANS[0];
    const CurrentPlanIcon = currentPlan.icon;

    return (
        <Card className={`border-2 ${isActive ? 'border-success-200' : 'border-warning-200'}`}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl">Current Subscription</CardTitle>
                        <CardDescription>
                            Manage your mess management system subscription
                        </CardDescription>
                    </div>
                    <Badge className={isActive ? 'bg-success-100 text-success-800 border-success-200 text-base px-4 py-2' : 'bg-warning-100 text-warning-800 border-warning-200 text-base px-4 py-2'}>
                        {isActive ? <CheckCircle className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
                        {isActive ? 'Active' : 'Expired'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatInfo
                        icon={CurrentPlanIcon}
                        title="Current Plan"
                        value={currentPlan.label}
                        color={currentPlan.color}
                    />
                    <StatInfo
                        icon={Calendar}
                        title="Expires On"
                        value={tenantInfo?.subscription_end_date ? format(new Date(tenantInfo.subscription_end_date), 'dd MMM yyyy') : 'N/A'}
                        color="primary"
                    />
                    <StatInfo
                        icon={Clock}
                        title="Days Remaining"
                        value={daysRemaining !== null ? (daysRemaining > 0 ? daysRemaining : 0) : 'N/A'}
                        color={daysRemaining && daysRemaining > 30 ? 'success' : daysRemaining && daysRemaining > 0 ? 'warning' : 'destructive'}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

function StatInfo({ icon: Icon, title, value, color }) {
    const colorClasses = {
        primary: 'text-primary bg-primary/10',
        success: 'text-success bg-success/10',
        warning: 'text-warning bg-warning/10',
        destructive: 'text-destructive bg-destructive/10',
        secondary: 'text-secondary bg-secondary/10',
    };

    return (
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
