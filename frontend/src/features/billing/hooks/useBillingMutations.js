/**
 * useBillingMutations Hook
 * React Query hooks for billing mutations (quote, checkout)
 */
import { useMutation } from '@tanstack/react-query';
import { calculateQuote, createCheckout } from '../api/billingApi';
import { toast } from 'sonner';

/**
 * Hook for billing mutations
 * @returns {Object} Mutation functions and loading states
 */
export function useBillingMutations() {
  // Calculate quote mutation
  const quoteMutation = useMutation({
    mutationFn: calculateQuote,
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: createCheckout,
    onSuccess: (data) => {
      toast.success('Redirecting to payment gateway...');
      // In MVP, show placeholder message
      setTimeout(() => {
        toast.info(data.message);
      }, 1000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Error creating checkout');
    },
  });

  return {
    // Mutation functions
    calculateQuote: quoteMutation.mutate,
    createCheckout: checkoutMutation.mutate,
    
    // Async versions (return promises)
    calculateQuoteAsync: quoteMutation.mutateAsync,
    createCheckoutAsync: checkoutMutation.mutateAsync,
    
    // Loading states
    isCalculating: quoteMutation.isPending,
    isCheckingOut: checkoutMutation.isPending,
    
    // Raw mutation objects
    quoteMutation,
    checkoutMutation,
  };
}
