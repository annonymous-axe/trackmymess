/**
 * useCustomerMutations Hook
 * React Query hooks for customer CRUD mutations
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCustomer, updateCustomer, deleteCustomer } from '../api/customersApi';
import { toast } from 'sonner';

/**
 * Hook for customer mutations (create, update, delete)
 * @returns {Object} Mutation functions and loading states
 */
export function useCustomerMutations() {
  const queryClient = useQueryClient();

  // Create customer mutation
  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      // Invalidate and refetch customers list
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.detail || 'Failed to create customer';
      toast.error(errorMessage);
    },
  });

  // Update customer mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer updated successfully');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.detail || 'Failed to update customer';
      toast.error(errorMessage);
    },
  });

  // Delete customer mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted successfully');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.detail || 'Failed to delete customer';
      toast.error(errorMessage);
    },
  });

  return {
    // Mutation functions
    createCustomer: createMutation.mutate,
    updateCustomer: updateMutation.mutate,
    deleteCustomer: deleteMutation.mutate,
    
    // Async versions (return promises)
    createCustomerAsync: createMutation.mutateAsync,
    updateCustomerAsync: updateMutation.mutateAsync,
    deleteCustomerAsync: deleteMutation.mutateAsync,
    
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
