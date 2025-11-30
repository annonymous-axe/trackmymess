/**
 * MealPlansPage - Thin Orchestration Layer
 * 
 * Responsibilities:
 * - Manage local UI state (modal visibility)
 * - Call React Query hooks (useMealPlans, useMealPlanMutations)
 * - Orchestrate child components
 * - Handle user actions (edit, delete)
 * 
 * Follows the same pattern as CustomersPage/StaffPage (template).
 */
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';

// React Query hooks
import { useMealPlans } from '../hooks/useMealPlans';
import { useMealPlanMutations } from '../hooks/useMealPlanMutations';

// Feature components
import { MealPlansToolbar } from '../components/MealPlansToolbar';
import { MealPlansGrid } from '../components/MealPlansGrid';
import { MealPlansLoading } from '../components/MealPlansLoading';
import { MealPlansEmptyState } from '../components/MealPlansEmptyState';

export default function MealPlansPage() {
    // ==================== Local UI State ====================
    // (Add/Edit modals will be added later - Phase 4.1)

    // ==================== React Query Hooks ====================
    const { data: plans = [], isLoading, error, refetch } = useMealPlans();
    const { deleteMealPlan, isDeleting } = useMealPlanMutations();

    // ==================== Event Handlers ====================
    const handleDelete = (plan) => {
        if (plan.is_default) {
            alert('Cannot delete the default plan.');
            return;
        }

        if (plan.customer_count > 0) {
            alert(`Cannot delete: ${plan.customer_count} customers are using this plan.`);
            return;
        }

        const confirmed = window.confirm(
            `Delete meal plan "${plan.name}"? This action cannot be undone.`
        );
        if (!confirmed) return;
        deleteMealPlan(plan.id);
    };

    const handleAddClick = () => {
        // TODO: Implement add meal plan modal (Phase 4.1)
        alert('Add Meal Plan functionality coming soon! For now, use the old page.');
    };

    const handleEdit = (plan) => {
        // TODO: Implement edit meal plan modal (Phase 4.1)
        alert('Edit functionality coming soon! For now, use the old page.');
    };

    // ==================== Error State ====================
    if (error) {
        return (
            <Layout title="Meal Plan Management">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-danger-600 mb-4">Error loading meal plans</p>
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
        <Layout title="Meal Plan Management">
            <div className="space-y-6 animate-fade-in">
                {/* Toolbar */}
                <MealPlansToolbar onAddClick={handleAddClick} />

                {/* Meal Plans Grid */}
                {isLoading ? (
                    <MealPlansLoading />
                ) : plans.length === 0 ? (
                    <MealPlansEmptyState />
                ) : (
                    <MealPlansGrid
                        plans={plans}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isDeleting={isDeleting}
                    />
                )}
            </div>
        </Layout>
    );
}
