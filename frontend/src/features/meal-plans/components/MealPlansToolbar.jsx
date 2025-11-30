/**
 * MealPlansToolbar Component
 * Manages search and add meal plan button  
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function MealPlansToolbar({ onAddClick }) {
    return (
        <div className="flex justify-between items-center">
            <p className="text-gray-600">Manage your meal plan offerings</p>
            <Button
                className="bg-primary hover:bg-primary-600 text-white"
                onClick={onAddClick}
            >
                <Plus className="w-4 h-4 mr-2" />
                Add Meal Plan
            </Button>
        </div>
    );
}
