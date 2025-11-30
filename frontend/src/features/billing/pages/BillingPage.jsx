/**
 * BillingPage - Orchestration Layer
 * 
 * Responsibilities:
 * - Fetch current billing plan
 * - Manage capacity/tenure selection
 * - Auto-calculate quote on selection change
 * - Handle checkout action
 */
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import UnderConstructionBanner from '@/components/UnderConstructionBanner';

// React Query hooks
import { useBilling } from '../hooks/useBilling';
import { useBillingMutations } from '../hooks/useBillingMutations';

// Feature components
import {
    CurrentPlanCard,
    PlanSelector,
    PricingBreakdown,
    BillingLoading,
} from '../components';

export default function BillingPage() {
    // ==================== Local State ====================
    const [selectedCapacity, setSelectedCapacity] = useState('100');
    const [selectedTenure, setSelectedTenure] = useState('monthly');
    const [quote, setQuote] = useState(null);

    // ==================== React Query Hooks ====================
    const { data: planData, isLoading, error, refetch } = useBilling();
    const {
        calculateQuoteAsync,
        createCheckout,
        isCalculating,
        isCheckingOut,
    } = useBillingMutations();

    // ==================== Auto-calculate quote on change ====================
    useEffect(() => {
        if (selectedCapacity && selectedTenure) {
            handleCalculateQuote();
        }
    }, [selectedCapacity, selectedTenure]);

    const handleCalculateQuote = async () => {
        try {
            const result = await calculateQuoteAsync({
                capacity: selectedCapacity,
                tenure: selectedTenure,
            });
            setQuote(result);
        } catch (error) {
            // Error already handled by mutation
        }
    };

    const handleCheckout = () => {
        createCheckout({
            capacity: selectedCapacity,
            tenure: selectedTenure,
        });
    };

    // ==================== Error State ====================
    if (error) {
        return (
            <Layout title="Plan & Billing">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-danger-600 mb-4">Error loading billing data</p>
                        <Button onClick={() => refetch()}>Retry</Button>
                    </div>
                </div>
            </Layout>
        );
    }

    // ==================== Loading State ====================
    if (isLoading) {
        return (
            <Layout title="Plan & Billing">
                <BillingLoading />
            </Layout>
        );
    }

    // ==================== Main Render ====================
    return (
        <Layout title="Plan & Billing">
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                {/* Under Construction Banner */}
                <UnderConstructionBanner message="The billing and payment gateway integration is currently under development. You can view plan details, but checkout functionality will be available soon." />

                {/* Current Plan */}
                <CurrentPlanCard planData={planData} />

                {/* Plan Selection */}
                <Card className="rounded-xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Choose Your Plan</ CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PlanSelector
                            capacity={selectedCapacity}
                            tenure={selectedTenure}
                            onCapacityChange={setSelectedCapacity}
                            onTenureChange={setSelectedTenure}
                        />

                        {/* Pricing Breakdown */}
                        <PricingBreakdown quote={quote} isCalculating={isCalculating} />

                        {/* Checkout Button */}
                        <Button
                            onClick={handleCheckout}
                            disabled={isCalculating || !quote || isCheckingOut}
                            className="w-full mt-6 h-12 bg-primary hover:bg-primary-600 text-white font-medium"
                        >
                            <CreditCard className="w-5 h-5 mr-2" />
                            {isCheckingOut ? 'Processing...' : 'Proceed to Pay'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
