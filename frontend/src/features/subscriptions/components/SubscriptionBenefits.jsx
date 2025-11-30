/**
 * SubscriptionBenefits Component
 * Displays subscription benefits section
 */
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Star, TrendingUp, CheckCircle, DollarSign } from 'lucide-react';

export function SubscriptionBenefits() {
    const benefits = [
        { icon: Star, title: 'Uninterrupted Service', description: 'Keep your mess operations running smoothly without any interruptions', color: 'primary' },
        { icon: TrendingUp, title: 'Regular Updates', description: 'Get access to new features and improvements as they\'re released', color: 'secondary' },
        { icon: CheckCircle, title: 'Priority Support', description: 'Get faster response times and dedicated assistance when you need it', color: 'success' },
        { icon: DollarSign, title: 'Cost Effective', description: 'Better value than traditional manual management systems', color: 'warning' },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Why Subscribe?</CardTitle>
                <CardDescription>Benefits of maintaining an active subscription</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit) => (
                    <Benefit key={benefit.title} {...benefit} />
                ))}
            </CardContent>
        </Card>
    );
}

function Benefit({ icon: Icon, title, description, color }) {
    const colorClasses = {
        primary: 'text-primary bg-primary/10',
        success: 'text-success bg-success/10',
        warning: 'text-warning bg-warning/10',
        secondary: 'text-secondary bg-secondary/10',
    };

    return (
        <div className="flex gap-4">
            <div className={`p-3 rounded-xl h-fit ${colorClasses[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-semibold text-lg mb-1">{title}</h4>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
        </div>
    );
}
