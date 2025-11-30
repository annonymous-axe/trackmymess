/**
 * AttendanceStats Component
 * Shows summary statistics (total, present, absent)
 */
import React from 'react';

export function AttendanceStats({ total, present }) {
    const absent = total - present;

    return (
        <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
                Total Customers: <strong className="text-gray-900">{total}</strong>
            </span>
            <span className="text-success-600">
                Present: <strong>{present}</strong>
            </span>
            <span className="text-danger-600">
                Absent: <strong>{absent}</strong>
            </span>
        </div>
    );
}
