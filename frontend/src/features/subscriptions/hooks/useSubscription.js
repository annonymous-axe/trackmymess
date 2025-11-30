/**
 * useSubscription Hook
 * React Query hook for fetching current tenant subscription data
 */
import { useQuery } from '@tanstack/react-query';
import { getCurrentTenant } from '../api/subscriptionsApi';

/**
 * Hook to fetch and manage current tenant subscription with React Query
 * @returns {Object} React Query result { data, isLoading, error, refetch }
 */
export function useSubscription() {
  return useQuery({
    queryKey: ['subscription', 'current-tenant'],
    queryFn: () => getCurrentTenant(),
    staleTime: 5 * 60 * 1000, // 5 minutes (subscription data changes infrequently)
    retry: 1, // Only retry once if it fails
  });
}
