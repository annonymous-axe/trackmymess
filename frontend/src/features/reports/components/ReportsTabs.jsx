/**
 * ReportsTabs Component
 * Tab buttons for switching between report types
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Clock, Users } from 'lucide-react';

export function ReportsTabs({ selectedReport, onReportChange }) {
    const tabs = [
        { id: 'revenue', label: 'Revenue', icon: TrendingUp },
        { id: 'dues', label: 'Dues', icon: DollarSign },
        { id: 'aging', label: 'Aging', icon: Clock },
        { id: 'meals', label: 'Meals', icon: Users },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 bg-gray-100 rounded-lg">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = selectedReport === tab.id;

                return (
                    <Button
                        key={tab.id}
                        variant={isActive ? 'default' : 'ghost'}
                        className={`h-11 ${isActive ? 'bg-primary hover:bg-primary-600 text-white shadow-sm' : 'hover:bg-white'}`}
                        onClick={() => onReportChange(tab.id)}
                    >
                        <Icon className="w-4 h-4 mr-2" />
                        {tab.label}
                    </Button>
                );
            })}
        </div>
    );
}
