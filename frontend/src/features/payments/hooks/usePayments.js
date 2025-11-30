/**
 * usePayments Hook
 * React Query hook for fetching payments list
 */
import { useQuery } from '@tanstack/react-query';
import { listPayments } from '../api/paymentsApi';

/**
 * Hook to fetch and manage payments list with React Query
 * @param {Object} filters - Filter parameters
 * @returns {Object} React Query result { data, isLoading, error, refetch }
 */
export function usePayments(filters = {}) {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: () => listPayments(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
