/**
 * SubscriptionsPage - Orchestration Layer
 * 
 * Responsibilities:
 * - Fetch current tenant subscription data
 * - Manage renew modal state  
 * - Handle subscription renewal via Razorpay
 * - Orchestrate child components
 */
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

// React Query hooks
import { useSubscription } from '../hooks/useSubscription';
import { useSubscriptionMutations } from '../hooks/useSubscriptionMutations';

// Feature components
import {
    SubscriptionStatus,
    PlansGrid,
    RenewSubscriptionModal,
    SubscriptionBenefits,
    SubscriptionLoading,
} from '../components';

export default function SubscriptionsPage() {
    // ==================== Local State ====================
    const [showRenewDialog, setShowRenewDialog] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    // ==================== React Query Hooks ====================
    const { data: tenantInfo, isLoading, error, refetch } = useSubscription();
    const { renewSubscription } = useSubscriptionMutations();

    // ==================== Event Handlers ====================
    const handleSelectPlan = (planValue) => {
        setSelectedPlan(planValue);
        setShowRenewDialog(true);
    };

    const handleRenewSuccess = async (paymentData) => {
        renewSubscription(
            { tenantId: tenantInfo.tenant_id, data: paymentData },
            {
                onSuccess: () => {
                    setShowRenewDialog(false);
                    refetch();
                },
            }
        );
    };

    // ==================== Error State ====================
    if (error) {
        return (
            <Layout title="Subscription Management">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-danger-600 mb-4">Error loading subscription data</p>
                        <Button onClick={() => refetch()}>Retry</Button>
                    </div>
                </div>
            </Layout>
        );
    }

    // ==================== Loading State ====================
    if (isLoading) {
        return (
            <Layout title="Subscription Management">
                <SubscriptionLoading />
            </Layout>
        );
    }

    // ==================== Main Render ====================
    return (
        <Layout title="Subscription Management">
            <div className="space-y-6 p-4 md:p-6 animate-fade-in">
                {/* Current Subscription Status */}
                <SubscriptionStatus tenantInfo={tenantInfo} />

                {/* Available Plans with Header Button */}
                <div className="relative">
                    <div className="absolute top-6 right-6 z-10">
                        <Button
                            className="bg-primary hover:bg-primary-600 text-white font-semibold"
                            onClick={() => setShowRenewDialog(true)}
                        >
                            <CreditCard className="w-5 h-5 mr-2" />
                            Renew / Upgrade
                        </Button>
                    </div>
                    <PlansGrid
                        currentPlan={tenantInfo?.subscription_plan}
                        onSelectPlan={handleSelectPlan}
                    />
                </div>

                {/* Subscription Benefits */}
                <SubscriptionBenefits />

                {/* Renew Modal */}
                <RenewSubscriptionModal
                    isOpen={showRenewDialog}
                    onOpenChange={setShowRenewDialog}
                    tenantId={tenantInfo?.tenant_id}
                    selectedPlan={selectedPlan}
                    onRenewSuccess={handleRenewSuccess}
                />
            </div>
        </Layout>
    );
}
