/**
 * PauseRequestsToolbar Component
 * Header with create button and total count
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function PauseRequestsToolbar({ totalCount, onCreateClick }) {
    return (
        <div className="flex justify-between items-center">
            <p className="text-gray-600">Total Requests: {totalCount}</p>
            <Button
                className="bg-primary hover:bg-primary-600 text-white h-11"
                onClick={onCreateClick}
            >
                <Plus className="w-4 h-4 mr-2" />
                Create Pause Request
            </Button>
        </div>
    );
}
