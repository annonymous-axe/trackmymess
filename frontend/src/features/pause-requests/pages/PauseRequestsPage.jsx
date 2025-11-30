/**
 * PauseRequestsPage - Orchestration Layer
 * 
 * Responsibilities:
 * - Manage modal visibility state
 * - Call React Query hooks (usePauseRequests, usePauseRequestMutations)
 * - Orchestrate child components
 * - Handle approve/reject actions
 */
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';

// React Query hooks
import { usePauseRequests } from '../hooks/usePauseRequests';
import { usePauseRequestMutations } from '../hooks/usePauseRequestMutations';

// Feature components
import {
    PauseRequestsToolbar,
    PauseRequestsList,
    CreatePauseRequestModal,
    PauseRequestsLoading,
    PauseRequestsEmptyState,
} from '../components';

export default function PauseRequestsPage() {
    // ==================== Local State ====================
    const [showCreateModal, setShowCreateModal] = useState(false);

    // ==================== React Query Hooks ====================
    const { data: requests = [], isLoading, error, refetch } = usePauseRequests();
    const {
        createPauseRequest,
        updatePauseRequestStatus,
        isCreating,
        isUpdating,
    } = usePauseRequestMutations();

    // ==================== Event Handlers ====================
    const handleCreateRequest = (formData) => {
        createPauseRequest(formData, {
            onSuccess: () => {
                setShowCreateModal(false);
            },
        });
    };

    const handleApprove = (id) => {
        updatePauseRequestStatus({
            id,
            status: 'APPROVED',
            notes: '',
        });
    };

    const handleReject = (id) => {
        updatePauseRequestStatus({
            id,
            status: 'REJECTED',
            notes: '',
        });
    };

    // ==================== Error State ====================
    if (error) {
        return (
            <Layout title="Pause Request Management">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-danger-600 mb-4">Error loading pause requests</p>
                        <Button onClick={() => refetch()}>Retry</Button>
                    </div>
                </div>
            </Layout>
        );
    }

    // ==================== Loading State ====================
    if (isLoading) {
        return (
            <Layout title="Pause Request Management">
                <PauseRequestsLoading />
            </Layout>
        );
    }

    // ==================== Main Render ====================
    return (
        <Layout title="Pause Request Management">
            <div className="space-y-6 animate-fade-in">
                {/* Toolbar */}
                <PauseRequestsToolbar
                    totalCount={requests.length}
                    onCreateClick={() => setShowCreateModal(true)}
                />

                {/* Requests List */}
                {requests.length === 0 ? (
                    <PauseRequestsEmptyState />
                ) : (
                    <PauseRequestsList
                        requests={requests}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        isUpdating={isUpdating}
                    />
                )}

                {/* Create Modal */}
                <CreatePauseRequestModal
                    isOpen={showCreateModal}
                    onOpenChange={setShowCreateModal}
                    onSubmit={handleCreateRequest}
                    isSubmitting={isCreating}
                />
            </div>
        </Layout>
    );
}
