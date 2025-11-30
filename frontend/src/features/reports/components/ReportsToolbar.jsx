/**
 * ReportsToolbar Component
 * Header with export functionality
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function ReportsToolbar({ onExport, isExporting }) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-white rounded-lg border border-gray-200">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reports & Analytics</h2>
                <p className="text-gray-600">Comprehensive business insights and data analysis</p>
            </div>
            <Button
                onClick={onExport}
                variant="outline"
                disabled={isExporting}
                className="h-11"
            >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
        </div>
    );
}
