/**
 * useStaffMutations Hook
 * React Query hooks for staff CRUD mutations
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStaff, updateStaff, deleteStaff, recordStaffPayment } from '../api/staffApi';
import { toast } from 'sonner';

/**
 * Hook for staff mutations (create, update, delete, payment)
 * @returns {Object} Mutation functions and loading states
 */
export function useStaffMutations() {
  const queryClient = useQueryClient();

  // Create staff mutation
  const createMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member added successfully');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.detail || 'Failed to add staff';
      toast.error(errorMessage);
    },
  });

  // Update staff mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff updated successfully');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.detail || 'Failed to update staff';
      toast.error(errorMessage);
    },
  });

  // Delete staff mutation
  const deleteMutation = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff deleted successfully');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.detail || 'Failed to delete staff';
      toast.error(errorMessage);
    },
  });

  // Record payment mutation
  const paymentMutation = useMutation({
    mutationFn: ({ id, data }) => recordStaffPayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Payment recorded successfully');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.detail || 'Failed to record payment';
      toast.error(errorMessage);
    },
  });

  return {
    // Mutation functions
    createStaff: createMutation.mutate,
    updateStaff: updateMutation.mutate,
    deleteStaff: deleteMutation.mutate,
    recordPayment: paymentMutation.mutate,
    
    // Async versions (return promises)
    createStaffAsync: createMutation.mutateAsync,
    updateStaffAsync: updateMutation.mutateAsync,
    deleteStaffAsync: deleteMutation.mutateAsync,
    recordPaymentAsync: paymentMutation.mutateAsync,
    
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isRecordingPayment: paymentMutation.isPending,
    
    // Raw mutation objects (for advanced usage)
    createMutation,
    updateMutation,
    deleteMutation,
    paymentMutation,
  };
}
