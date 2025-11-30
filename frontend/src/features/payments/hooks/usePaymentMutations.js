/**
 * usePaymentMutations Hook
 * React Query hooks for payment CRUD mutations
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPayment, updatePayment, deletePayment, generateMonthlyInvoices } from '../api/paymentsApi';
import { toast } from 'sonner';

/**
 * Hook for payment mutations (create, update, delete)
 * @returns {Object} Mutation functions and loading states
 */
export function usePaymentMutations() {
  const queryClient = useQueryClient();

  // Create payment mutation
  const createMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] }); // Update customer dues
      toast.success('Payment recorded successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to record payment');
    },
  });

  // Update payment mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updatePayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Payment updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update payment');
    },
  });

  // Delete payment mutation
  const deleteMutation = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Payment deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete payment');
    },
  });

  // Generate invoices mutation
  const generateInvoicesMutation = useMutation({
    mutationFn: generateMonthlyInvoices,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success(data.message || 'Invoices generated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to generate invoices');
    },
  });

  return {
    // Mutation functions
    createPayment: createMutation.mutate,
    updatePayment: updateMutation.mutate,
    deletePayment: deleteMutation.mutate,
    generateInvoices: generateInvoicesMutation.mutate,
    
    // Async versions (return promises)
    createPaymentAsync: createMutation.mutateAsync,
    updatePaymentAsync: updateMutation.mutateAsync,
    deletePaymentAsync: deleteMutation.mutateAsync,
    generateInvoicesAsync: generateInvoicesMutation.mutateAsync,
    
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isGenerating: generateInvoicesMutation.isPending,
    
    // Raw mutation objects (for advanced usage)
    createMutation,
    updateMutation,
    deleteMutation,
    generateInvoicesMutation,
  };
}
