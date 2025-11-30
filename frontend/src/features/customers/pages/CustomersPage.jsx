/**
 * CustomersPage - Thin Orchestration Layer
 * 
 * Responsibilities:
 * - Manage local UI state (search term, modal visibility)
 * - Call React Query hooks (useCustomers, useCustomerMutations)
 * - Orchestrate child components
 * - Handle user actions (search, delete, add)
 * 
 * This page is a template for all future feature pages.
 */
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddCustomerModal } from '@/components/modals/AddCustomerModal';
import { EditCustomerModal } from '../components/EditCustomerModal';

// React Query hooks
import { useCustomers } from '../hooks/useCustomers';
import { useCustomerMutations } from '../hooks/useCustomerMutations';

// Feature components
import { CustomersToolbar } from '../components/CustomersToolbar';
import { CustomersTable } from '../components/CustomersTable';
import { CustomersCards } from '../components/CustomersCards';
import { CustomersLoading } from '../components/CustomersLoading';
import { CustomersEmptyState } from '../components/CustomersEmptyState';

export default function CustomersPage() {
    // ==================== Local UI State ====================
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    // ==================== React Query Hooks ====================
    // Data fetching with automatic caching
    const { data: customers = [], isLoading, error, refetch } = useCustomers({ search: searchTerm });

    // Mutations with automatic cache invalidation
    const { deleteCustomer, isDeleting } = useCustomerMutations();

    // ==================== Event Handlers ====================
    const handleDelete = (customer) => {
        const confirmed = window.confirm(
            `Delete customer "${customer.full_name}"? This action cannot be undone.`
        );
        if (!confirmed) return;
        deleteCustomer(customer.id);
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setShowEditModal(true);
    };

    const handleAddClick = () => {
        setShowAddModal(true);
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
    };

    // ==================== Derived State ====================
    // Filter customers (could also be done server-side via React Query)
    const filteredCustomers = customers.filter(customer =>
        customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.mobile?.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ==================== Error State ====================
    if (error) {
        return (
            <Layout title="Customer Management">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-danger-600 mb-4">Error loading customers</p>
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
        <Layout title="Customer Management">
            <div className="space-y-6 animate-fade-in">
                {/* Toolbar: Search + Add Button */}
                <CustomersToolbar
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    onAddClick={handleAddClick}
                />

                {/* Customers List Card */}
                <Card className="glass shadow-sm">
                    <CardHeader className="border-b border-gray-100">
                        <CardTitle className="text-xl font-semibold text-gray-900">
                            All Customers ({filteredCustomers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <CustomersLoading />
                        ) : filteredCustomers.length === 0 ? (
                            <CustomersEmptyState hasSearchTerm={!!searchTerm} />
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <CustomersTable
                                    customers={filteredCustomers}
                                    onDelete={handleDelete}
                                    onEdit={handleEdit}
                                    isDeleting={isDeleting}
                                />

                                {/* Mobile Card View */}
                                <CustomersCards
                                    customers={filteredCustomers}
                                    onDelete={handleDelete}
                                    onEdit={handleEdit}
                                    isDeleting={isDeleting}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Add Customer Modal (reused from existing components) */}
                <AddCustomerModal
                    isOpen={showAddModal}
                    onOpenChange={setShowAddModal}
                    onCustomerAdded={refetch}
                />

                {/* Edit Customer Modal */}
                <EditCustomerModal
                    isOpen={showEditModal}
                    onOpenChange={setShowEditModal}
                    customer={editingCustomer}
                    onCustomerUpdated={refetch}
                />
            </div>
        </Layout>
    );
}
