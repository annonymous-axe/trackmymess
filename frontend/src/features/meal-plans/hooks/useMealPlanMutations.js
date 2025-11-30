/**
 * useMealPlanMutations Hook
 * React Query hooks for meal plan CRUD mutations
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMealPlan, updateMealPlan, deleteMealPlan } from '../api/mealPlansApi';
import { toast } from 'sonner';

/**
 * Hook for meal plan mutations (create, update, delete)
 * @returns {Object} Mutation functions and loading states
 */
export function useMealPlanMutations() {
  const queryClient = useQueryClient();

  // Create meal plan mutation
  const createMutation = useMutation({
    mutationFn: createMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success('Meal plan created successfully');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.detail || 'Failed to create meal plan';
      toast.error(errorMessage);
    },
  });

  // Update meal plan mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateMealPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success('Meal plan updated successfully');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.detail || 'Failed to update meal plan';
      toast.error(errorMessage);
    },
  });

  // Delete meal plan mutation
  const deleteMutation = useMutation({
    mutationFn: deleteMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success('Meal plan deleted successfully');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.detail || 'Failed to delete meal plan';
      toast.error(errorMessage);
    },
  });

  return {
    // Mutation functions
    createMealPlan: createMutation.mutate,
    updateMealPlan: updateMutation.mutate,
    deleteMealPlan: deleteMutation.mutate,
    
    // Async versions (return promises)
    createMealPlanAsync: createMutation.mutateAsync,
    updateMealPlanAsync: updateMutation.mutateAsync,
    deleteMealPlanAsync: deleteMutation.mutateAsync,
    
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Raw mutation objects (for advanced usage)
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
