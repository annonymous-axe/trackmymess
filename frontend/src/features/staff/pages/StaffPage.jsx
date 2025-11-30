/**
 * StaffPage - Thin Orchestration Layer
 * 
 * Responsibilities:
 * - Manage local UI state (search term, modal visibility)
 * - Call React Query hooks (useStaff, useStaffMutations)
 * - Orchestrate child components
 * - Handle user actions (search, delete)
 * 
 * Follows the same pattern as CustomersPage (template).
 */
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// React Query hooks
import { useStaff } from '../hooks/useStaff';
import { useStaffMutations } from '../hooks/useStaffMutations';

// Feature components
import { StaffToolbar } from '../components/StaffToolbar';
import { StaffTable } from '../components/StaffTable';
import { StaffCards } from '../components/StaffCards';
import { StaffLoading } from '../components/StaffLoading';
import { StaffEmptyState } from '../components/StaffEmptyState';

export default function StaffPage() {
    // ==================== Local UI State ====================
    const [searchTerm, setSearchTerm] = useState('');

    // ==================== React Query Hooks ====================
    const { data: staff = [], isLoading, error, refetch } = useStaff({ search: searchTerm });
    const { deleteStaff, isDeleting } = useStaffMutations();

    // ==================== Event Handlers ====================
    const handleDelete = (member) => {
        const confirmed = window.confirm(
            `Delete staff member "${member.full_name}"? This action cannot be undone.`
        );
        if (!confirmed) return;
        deleteStaff(member.id);
    };

    const handleAddClick = () => {
        // TODO: Implement add staff modal (Phase 3.1)
        alert('Add Staff functionality coming soon! For now, use the old staff page.');
    };

    const handleEdit = (member) => {
        // TODO: Implement edit staff modal (Phase 3.1)
        alert('Edit functionality coming soon! For now, use the old staff page.');
    };

    const handleRecordPayment = (member) => {
        // TODO: Implement payment modal (Phase 3.1)
        alert('Payment recording coming soon! For now, use the old staff page.');
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
    };

    // ==================== Derived State ====================
    const filteredStaff = staff.filter(member =>
        member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.mobile?.includes(searchTerm) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ==================== Error State ====================
    if (error) {
        return (
            <Layout title="Staff Management">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-danger-600 mb-4">Error loading staff</p>
                        <Button onClick={() => refetch()}>
                            Retry
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

    // ==================== Main Render ====================
    return (
        <Layout title="Staff Management">
            <div className="space-y-6 animate-fade-in">
                {/* Toolbar: Search + Add Button */}
                <StaffToolbar
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    onAddClick={handleAddClick}
                />

                {/* Staff List Card */}
                <Card className="glass shadow-sm">
                    <CardHeader className="border-b border-gray-100">
                        <CardTitle className="text-xl font-semibold text-gray-900">
                            All Staff Members ({filteredStaff.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <StaffLoading />
                        ) : filteredStaff.length === 0 ? (
                            <StaffEmptyState hasSearchTerm={!!searchTerm} />
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <StaffTable
                                    staff={filteredStaff}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onRecordPayment={handleRecordPayment}
                                    isDeleting={isDeleting}
                                />

                                {/* Mobile Card View */}
                                <StaffCards
                                    staff={filteredStaff}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onRecordPayment={handleRecordPayment}
                                    isDeleting={isDeleting}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
