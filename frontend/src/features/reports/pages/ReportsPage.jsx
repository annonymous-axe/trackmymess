/**
 * ReportsPage - Orchestration Layer
 * 
 * Responsibilities:
 * - Manage report type selection and filters
 * - Call React Query hooks for report data
 * - Orchestrate child components
 * - Handle export action
 */
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { toast } from 'sonner';

// React Query hooks
import {
    useRevenueReport,
    useDuesReport,
    useAgingReport,
    useMealConsumptionReport,
} from '../hooks/useReports';
import { exportCustomersCSV } from '../api/reportsApi';

// Feature components
import {
    ReportsToolbar,
    ReportsTabs,
    ReportsLoading,
    ReportsEmptyState,
    RevenueReport,
    DuesReport,
    AgingReport,
    MealsReport,
} from '../components';

export default function ReportsPage() {
    // ==================== Local State ====================
    const [selectedReport, setSelectedReport] = useState('revenue');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [isExporting, setIsExporting] = useState(false);

    // ==================== React Query Hooks ====================
    const {
        data: revenueData = [],
        isLoading: isLoadingRevenue,
    } = useRevenueReport({ months: 6 });

    const {
        data: duesData = [],
        isLoading: isLoadingDues,
    } = useDuesReport();

    const {
        data: agingData = {},
        isLoading: isLoadingAging,
    } = useAgingReport();

    const {
        data: mealsData = [],
        isLoading: isLoadingMeals,
    } = useMealConsumptionReport({ month, year });

    // ==================== Event Handlers ====================
    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await exportCustomersCSV({ format: 'csv' });
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = response.filename || 'customers_export.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Export successful');
        } catch (error) {
            toast.error('Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    // ==================== Loading State ====================
    const isLoading =
        (selectedReport === 'revenue' && isLoadingRevenue) ||
        (selectedReport === 'dues' && isLoadingDues) ||
        (selectedReport === 'aging' && isLoadingAging) ||
        (selectedReport === 'meals' && isLoadingMeals);

    //==================== Render Helpers ====================
    const renderContent = () => {
        if (isLoading) {
            return <ReportsLoading />;
        }

        switch (selectedReport) {
            case 'revenue':
                return revenueData.length === 0 ? (
                    <ReportsEmptyState />
                ) : (
                    <RevenueReport data={revenueData} />
                );

            case 'dues':
                return duesData.length === 0 ? (
                    <ReportsEmptyState />
                ) : (
                    <DuesReport data={duesData} />
                );

            case 'aging':
                return Object.keys(agingData).length === 0 ? (
                    <ReportsEmptyState />
                ) : (
                    <AgingReport data={agingData} />
                );

            case 'meals':
                return mealsData.length === 0 ? (
                    <ReportsEmptyState />
                ) : (
                    <MealsReport
                        data={mealsData}
                        month={month}
                        year={year}
                        onMonthChange={setMonth}
                        onYearChange={setYear}
                    />
                );

            default:
                return <ReportsEmptyState />;
        }
    };

    // ==================== Main Render ====================
    return (
        <Layout title="Reports & Analytics">
            <div className="space-y-6 animate-fade-in">
                {/* Toolbar */}
                <ReportsToolbar onExport={handleExport} isExporting={isExporting} />

                {/* Tabs */}
                <ReportsTabs
                    selectedReport={selectedReport}
                    onReportChange={setSelectedReport}
                />

                {/* Report Content */}
                {renderContent()}
            </div>
        </Layout>
    );
}
