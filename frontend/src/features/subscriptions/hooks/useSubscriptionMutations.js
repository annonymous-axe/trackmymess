/**
 * useSubscriptionMutations Hook
 * React Query hooks for subscription mutations (renew)
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renewSubscription } from '../api/subscriptionsApi';
import { toast } from 'sonner';

/**
 * Hook for subscription mutations
 * @returns {Object} Mutation functions and loading states
 */
export function useSubscriptionMutations() {
  const queryClient = useQueryClient();

  // Renew subscription mutation
  const renewMutation = useMutation({
    mutationFn: ({ tenantId, data }) => renewSubscription(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription renewed successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to finalize renewal');
    },
  });

  return {
    // Mutation functions
    renewSubscription: renewMutation.mutate,
    
    // Async version (returns promise)
    renewSubscriptionAsync: renewMutation.mutateAsync,
    
    // Loading states
    isRenewing: renewMutation.isPending,
    
    // Raw mutation object (for advanced usage)
    renewMutation,
  };
}
