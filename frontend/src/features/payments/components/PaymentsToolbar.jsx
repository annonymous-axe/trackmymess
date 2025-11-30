/**
 * PaymentsToolbar Component
 * Search bar and action buttons for payments
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FileDown, Search } from 'lucide-react';

export function PaymentsToolbar({ searchQuery, onSearchChange, onRecordPayment, onExport }) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 w-full relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
                <Input
                    placeholder="Search by customer, transaction ID..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 h-11"
                />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <Button variant="outline" onClick={onExport} className="h-11">
                    <FileDown className="w-4 h-4 mr-2" />
                    Export
                </Button>
                <Button
                    className="bg-primary hover:bg-primary-600 text-white h-11"
                    onClick={onRecordPayment}
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Record Payment
                </Button>
            </div>
        </div>
    );
}
