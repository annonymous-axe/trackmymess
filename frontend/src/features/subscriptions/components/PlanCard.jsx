/**
 * PlanCard Component
 * Single subscription plan card
 */
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export function PlanCard({ plan, isCurrentPlan, onSelectPlan }) {
    const PlanIcon = plan.icon;

    return (
        <Card className={`border-2 overflow-hidden relative transition-all ${isCurrentPlan ? 'border-primary shadow-lg' : 'hover:shadow-md'}`}>
            {isCurrentPlan && (
                <Badge className="absolute top-2 right-2">CURRENT</Badge>
            )}
            <CardHeader className="text-center pb-4">
                <div className={`mx-auto p-4 bg-${plan.color}-100 rounded-xl w-fit mb-4`}>
                    <PlanIcon className={`w-12 h-12 text-${plan.color}-600`} />
                </div>
                <CardTitle className="text-2xl">{plan.label}</CardTitle>
                <div className="mt-4">
                    <span className="text-4xl font-bold">₹{plan.price}</span>
                    <span className="text-gray-600">/month</span>
                </div>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                        </li>
                    ))}
                </ul>
                <Button
                    className={`w-full mt-6 h-11 font-semibold ${!isCurrentPlan ? 'bg-primary hover:bg-primary-600 text-white' : ''}`}
                    variant={isCurrentPlan ? 'outline' : 'default'}
                    disabled={isCurrentPlan}
                    onClick={() => onSelectPlan(plan.value)}
                >
                    {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                </Button>
            </CardContent>
        </Card>
    );
}
