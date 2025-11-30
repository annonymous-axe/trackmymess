/**
 * StaffToolbar Component
 * Manages search and add staff button
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';

export function StaffToolbar({ searchTerm, onSearchChange, onAddClick }) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                    placeholder="Search staff..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Add Button */}
            <Button
                className="bg-primary hover:bg-primary-600 text-white w-full sm:w-auto"
                onClick={onAddClick}
            >
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
            </Button>
        </div>
    );
}
