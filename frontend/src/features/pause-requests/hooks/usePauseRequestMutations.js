/**
 * usePauseRequestMutations Hook
 * React Query hooks for pause request mutations (create, update status)
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPauseRequest, updatePauseRequestStatus } from '../api/pauseRequestsApi';
import { toast } from 'sonner';

/**
 * Hook for pause request mutations
 * @returns {Object} Mutation functions and loading states
 */
export function usePauseRequestMutations() {
  const queryClient = useQueryClient();

  // Create pause request mutation
  const createMutation = useMutation({
    mutationFn: createPauseRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pauseRequests'] });
      toast.success('Pause request created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create pause request');
    },
  });

  // Update status mutation (approve/reject)
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }) => updatePauseRequestStatus(id, status, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pauseRequests'] });
      const action = variables.status.toLowerCase();
      toast.success(`Request ${action}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update request');
    },
  });

  return {
    // Mutation functions
    createPauseRequest: createMutation.mutate,
    updatePauseRequestStatus: updateStatusMutation.mutate,
    
    // Async versions (return promises)
    createPauseRequestAsync: createMutation.mutateAsync,
    updatePauseRequestStatusAsync: updateStatusMutation.mutateAsync,
    
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
    
    // Raw mutation objects (for advanced usage)
    createMutation,
    updateStatusMutation,
  };
}
