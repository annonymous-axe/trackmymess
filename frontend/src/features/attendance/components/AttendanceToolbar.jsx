/**
 * AttendanceToolbar Component
 * Manages date selector and bulk actions
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

export function AttendanceToolbar({
    selectedDate,
    onDateChange,
    onMarkAllPresent,
    onMarkAllAbsent,
    onSave,
    isSaving
}) {
    const maxDate = new Date().toISOString().split('T')[0];

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
            {/* Date Selector */}
            <div className="space-y-2">
                <Label htmlFor="date">Select Date</Label>
                <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    max={maxDate}
                    className="w-auto"
                />
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onMarkAllPresent}
                    className="border-gray-300"
                >
                    Mark All Present
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onMarkAllAbsent}
                    className="border-gray-300"
                >
                    Mark All Absent
                </Button>
                <Button
                    className="bg-primary hover:bg-primary-600 text-white"
                    onClick={onSave}
                    disabled={isSaving}
                >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Attendance'}
                </Button>
            </div>
        </div>
    );
}
