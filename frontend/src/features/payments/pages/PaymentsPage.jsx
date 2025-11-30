/**
 * PaymentsPage - Orchestration Layer with Payments + Invoices Tabs
 * 
 * Responsibilities:
 * - Manage tab state and local UI state
 * - Call React Query hooks for both payments and invoices
 * - Orchestrate child components, modals, and tabs
 * - Handle user actions for both payments and invoices
 */
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CreditCard, FileText } from 'lucide-react';
import axios, { API } from '@/lib/http';

// React Query hooks
import { usePayments } from '../hooks/usePayments';
import { useInvoices } from '../hooks/useInvoices';
import { usePaymentMutations } from '../hooks/usePaymentMutations';
import { exportPayments } from '../api/paymentsApi';

// Feature components
import {
    // Payments components
    PaymentsToolbar,
    PaymentsStats,
    PaymentsTable,
    PaymentsLoading,
    PaymentsEmptyState,
    RecordPaymentModal,
    EditPaymentModal,
    // Invoices components
    InvoicesToolbar,
    InvoicesStats,
    InvoicesTable,
    InvoicesLoading,
    InvoicesEmptyState,
} from '../components';

export default function PaymentsPage() {
    // ==================== Tab State ====================
    const [activeTab, setActiveTab] = useState('payments');

    // ==================== Payments State ====================
    const [searchQuery, setSearchQuery] = useState('');
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    // ==================== Invoices State ====================
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [customers, setCustomers] = useState([]);

    // ==================== React Query Hooks ====================
    const { data: payments = [], isLoading: isLoadingPayments, error: paymentsError, refetch: refetchPayments } = usePayments();
    const { data: invoices = [], isLoading: isLoadingInvoices, error: invoicesError, refetch: refetchInvoices } = useInvoices();
    const { createPayment, updatePayment, deletePayment, generateInvoices, isCreating, isUpdating, isDeleting, isGenerating } = usePaymentMutations();

    // ==================== Fetch Customers ====================
    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await axios.get(`${API}/admin/customers`);
            setCustomers(response.data);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        }
    };

    // ==================== Payment Event Handlers ====================
    const handleRecordPayment = (formData) => {
        createPayment(formData, {
            onSuccess: () => {
                setShowRecordModal(false);
            }
        });
    };

    const handleEditPayment = (id, formData) => {
        updatePayment({ id, data: formData }, {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedPayment(null);
            }
        });
    };

    const handleDelete = (payment) => {
        const confirmed = window.confirm(
            `Delete payment of ₹${payment.amount} from ${payment.customer_name}? Customer dues will be recalculated.`
        );
        if (!confirmed) return;
        deletePayment(payment.id);
    };

    const handleEdit = (payment) => {
        setSelectedPayment(payment);
        setShowEditModal(true);
    };

    const handleExport = async () => {
        try {
            const blob = await exportPayments({ searchQuery });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `payments_export_${format(new Date(), 'yyyyMMdd')}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Payments exported successfully');
        } catch (error) {
            toast.error('Failed to export payments');
        }
    };

    // ==================== Invoice Event Handlers ====================
    const handleGenerateInvoices = (data) => {
        generateInvoices(data);
    };

    // ==================== Derived State ====================
    const filteredPayments = payments.filter(payment => {
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();
        return (
            payment.customer_name?.toLowerCase().includes(query) ||
            payment.transaction_id?.toLowerCase().includes(query) ||
            payment.razorpay_payment_id?.toLowerCase().includes(query) ||
            payment.notes?.toLowerCase().includes(query)
        );
    });

    const filteredInvoices = invoices.filter(invoice => {
        if (!selectedCustomerId) return true;
        return invoice.customer_id === selectedCustomerId;
    });

    // ==================== Error States ====================
    if (paymentsError && activeTab === 'payments') {
        return (
            <Layout title="Payments & Invoices">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-danger-600 mb-4">Error loading payments</p>
                        <Button onClick={() => refetchPayments()}>Retry</Button>
                    </div>
                </div>
            </Layout>
        );
    }

    if (invoicesError && activeTab === 'invoices') {
        return (
            <Layout title="Payments & Invoices">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-danger-600 mb-4">Error loading invoices</p>
                        <Button onClick={() => refetchInvoices()}>Retry</Button>
                    </div>
                </div>
            </Layout>
        );
    }

    // ==================== Main Render ====================
    return (
        <Layout title="Payments & Invoices">
            <div className="space-y-6 animate-fade-in">
                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-14 p-1 bg-gray-100 rounded-lg">
                        <TabsTrigger
                            value="payments"
                            className="text-base font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                        >
                            <CreditCard className="w-5 h-5 mr-2" />
                            Payments
                        </TabsTrigger>
                        <TabsTrigger
                            value="invoices"
                            className="text-base font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                        >
                            <FileText className="w-5 h-5 mr-2" />
                            Invoices
                        </TabsTrigger>
                    </TabsList>

                    {/* Payments Tab Content */}
                    <TabsContent value="payments" className="space-y-6 mt-6">
                        <PaymentsStats payments={payments} />

                        <PaymentsToolbar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            onRecordPayment={() => setShowRecordModal(true)}
                            onExport={handleExport}
                        />

                        <Card>
                            <CardHeader className="border-b border-gray-100">
                                <CardTitle className="text-xl font-semibold text-gray-900">
                                    Payment History
                                </CardTitle>
                                <CardDescription>
                                    Showing {filteredPayments.length} of {payments.length} payments
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isLoadingPayments ? (
                                    <PaymentsLoading />
                                ) : filteredPayments.length === 0 ? (
                                    <PaymentsEmptyState hasSearchTerm={!!searchQuery} />
                                ) : (
                                    <PaymentsTable
                                        payments={filteredPayments}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        isDeleting={isDeleting}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Invoices Tab Content */}
                    <TabsContent value="invoices" className="space-y-6 mt-6">
                        <InvoicesStats invoices={invoices} />

                        <InvoicesToolbar
                            onGenerateInvoices={handleGenerateInvoices}
                            isGenerating={isGenerating}
                            customers={customers}
                            selectedCustomerId={selectedCustomerId}
                            onCustomerChange={setSelectedCustomerId}
                        />

                        <Card>
                            <CardHeader className="border-b border-gray-100">
                                <CardTitle className="text-xl font-semibold text-gray-900">
                                    All Invoices
                                </CardTitle>
                                <CardDescription>
                                    {selectedCustomerId
                                        ? `Showing ${filteredInvoices.length} of ${invoices.length} invoices`
                                        : `Complete invoice history for all customers (${invoices.length} total)`
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isLoadingInvoices ? (
                                    <InvoicesLoading />
                                ) : filteredInvoices.length === 0 ? (
                                    <InvoicesEmptyState />
                                ) : (
                                    <InvoicesTable invoices={filteredInvoices} />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Updated Note */}
                <div className="text-sm text-gray-600 italic p-4 bg-gray-50 rounded-lg">
                    <strong>Note:</strong> Payment recording/editing and invoice generation now work.
                    For advanced features (invoice PDF/email, advanced filters), use the original page temporarily.
                </div>

                {/* Modals */}
                <RecordPaymentModal
                    isOpen={showRecordModal}
                    onOpenChange={setShowRecordModal}
                    onSubmit={handleRecordPayment}
                    isSubmitting={isCreating}
                />

                <EditPaymentModal
                    isOpen={showEditModal}
                    onOpenChange={setShowEditModal}
                    payment={selectedPayment}
                    onSubmit={handleEditPayment}
                    isSubmitting={isUpdating}
                />
            </div>
        </Layout>
    );
}
