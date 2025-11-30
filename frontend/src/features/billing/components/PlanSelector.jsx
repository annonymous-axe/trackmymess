/**
 * PlanSelector Component
 * Capacity and tenure selectors
 */
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CAPACITIES = ['100', '200', '300', '400', '500', '1000'];
const TENURES = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly (3 months)' },
    { value: 'half_yearly', label: 'Half-Yearly (6 months)' },
    { value: 'yearly', label: 'Yearly (12 months)' },
];

export function PlanSelector({ capacity, tenure, onCapacityChange, onTenureChange }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
                <Label>Capacity (Users)</Label>
                <Select value={capacity} onValueChange={onCapacityChange}>
                    <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select capacity" />
                    </SelectTrigger>
                    <SelectContent>
                        {CAPACITIES.map((cap) => (
                            <SelectItem key={cap} value={cap}>
                                {cap} Users
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Tenure</Label>
                <Select value={tenure} onValueChange={onTenureChange}>
                    <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select tenure" />
                    </SelectTrigger>
                    <SelectContent>
                        {TENURES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                                {t.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
