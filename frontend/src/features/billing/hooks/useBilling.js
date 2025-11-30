/**
 * useBilling Hook
 * React Query hook for fetching current billing plan
 */
import { useQuery } from '@tanstack/react-query';
import { getBillingPlan } from '../api/billingApi';

/**
 * Hook to fetch current billing plan with React Query
 * @returns {Object} React Query result { data, isLoading, error, refetch }
 */
export function useBilling() {
  return useQuery({
    queryKey: ['billing', 'current-plan'],
    queryFn: () => getBillingPlan(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
