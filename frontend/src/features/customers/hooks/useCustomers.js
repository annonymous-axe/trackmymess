/**
 * useCustomers Hook
 * React Query hook for fetching customers list
 */
import { useQuery } from '@tanstack/react-query';
import { listCustomers } from '../api/customersApi';

/**
 * Hook to fetch and manage customers list with React Query
 * @param {Object} filters - Filter parameters { search, status, page, limit }
 * @returns {Object} React Query result { data, isLoading, error, refetch }
 */
export function useCustomers(filters = {}) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => listCustomers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
