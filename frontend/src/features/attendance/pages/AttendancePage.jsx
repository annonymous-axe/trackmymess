/**
 * AttendancePage - Thin Orchestration Layer
 * 
 * Responsibilities:
 * - Manage local UI state (selected date, attendance map)
 * - Call React Query hooks (useCustomers for active list, useAttendance for records)
 * - Orchestrate child components
 * - Handle user actions (toggle checkboxes, bulk actions, save)
 * 
 * Follows the same pattern as other feature pages (template).
 */
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

// React Query hooks
import { useCustomers } from '@/features/customers/hooks/useCustomers'; // Reuse customers hook
import { useAttendance } from '../hooks/useAttendance';
import { useAttendanceMutations } from '../hooks/useAttendanceMutations';

// Feature components
import {
    AttendanceToolbar,
    AttendanceTable,
    AttendanceStats,
    AttendanceLoading,
    AttendanceEmptyState
} from '../components';

export default function AttendancePage() {
    // ==================== Local UI State ====================
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance] = useState({});

    // ==================== React Query Hooks ====================
    // Fetch active customers
    const { data: allCustomers = [], isLoading: isLoadingCustomers } = useCustomers();
    const activeCustomers = allCustomers.filter(c => c.is_active);

    // Fetch attendance for selected date
    const { data: attendanceRecords = [], isLoading: isLoadingAttendance } = useAttendance(selectedDate);

    // Mutations
    const { saveAttendance, isSaving } = useAttendanceMutations();

    // ==================== Effects ====================
    // Convert attendance records array to map when data loads
    useEffect(() => {
        if (attendanceRecords && attendanceRecords.length > 0) {
            const attendanceMap = {};
            attendanceRecords.forEach(record => {
                attendanceMap[record.customer_id] = {
                    breakfast: record.breakfast,
                    lunch: record.lunch,
                    dinner: record.dinner,
                };
            });
            setAttendance(attendanceMap);
        } else {
            // Reset attendance when changing dates or no data
            setAttendance({});
        }
    }, [attendanceRecords, selectedDate]);

    // ==================== Event Handlers ====================
    const handleToggle = (customerId, meal) => {
        setAttendance(prev => ({
            ...prev,
            [customerId]: {
                breakfast: prev[customerId]?.breakfast || false,
                lunch: prev[customerId]?.lunch || false,
                dinner: prev[customerId]?.dinner || false,
                [meal]: !prev[customerId]?.[meal],
            },
        }));
    };

    const handleMarkAllPresent = () => {
        const newAttendance = {};
        activeCustomers.forEach(customer => {
            newAttendance[customer.id] = { breakfast: true, lunch: true, dinner: true };
        });
        setAttendance(newAttendance);
    };

    const handleMarkAllAbsent = () => {
        const newAttendance = {};
        activeCustomers.forEach(customer => {
            newAttendance[customer.id] = { breakfast: false, lunch: false, dinner: false };
        });
        setAttendance(newAttendance);
    };

    const handleSave = () => {
        const records = activeCustomers.map(customer => ({
            customer_id: customer.id,
            breakfast: attendance[customer.id]?.breakfast || false,
            lunch: attendance[customer.id]?.lunch || false,
            dinner: attendance[customer.id]?.dinner || false,
        }));

        saveAttendance({
            date: new Date(selectedDate + 'T00:00:00Z').toISOString(),
            records,
        });
    };

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
        // Attendance will be refetched automatically by React Query
    };

    // ==================== Derived State ====================
    const presentCount = activeCustomers.filter(c =>
        attendance[c.id]?.breakfast || attendance[c.id]?.lunch || attendance[c.id]?.dinner
    ).length;

    const isLoading = isLoadingCustomers || isLoadingAttendance;

    // ==================== Main Render ====================
    if (isLoading) {
        return (
            <Layout title="Attendance Management">
                <AttendanceLoading />
            </Layout>
        );
    }

    return (
        <Layout title="Attendance Management">
            <div className="space-y-6 animate-fade-in">
                {/* Toolbar with Date & Actions */}
                <Card>
                    <CardContent className="p-6">
                        <AttendanceToolbar
                            selectedDate={selectedDate}
                            onDateChange={handleDateChange}
                            onMarkAllPresent={handleMarkAllPresent}
                            onMarkAllAbsent={handleMarkAllAbsent}
                            onSave={handleSave}
                            isSaving={isSaving}
                        />

                        {/* Stats */}
                        <div className="mt-4">
                            <AttendanceStats
                                total={activeCustomers.length}
                                present={presentCount}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Attendance Table */}
                <Card>
                    <CardHeader className="border-b border-gray-100">
                        <CardTitle className="text-xl font-semibold text-gray-900">
                            Mark Attendance for {format(new Date(selectedDate), 'dd MMMM yyyy')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {activeCustomers.length === 0 ? (
                            <AttendanceEmptyState />
                        ) : (
                            <AttendanceTable
                                customers={activeCustomers}
                                attendance={attendance}
                                onToggle={handleToggle}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
