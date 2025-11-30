/**
 * useStaff Hook
 * React Query hook for fetching staff list
 */
import { useQuery } from '@tanstack/react-query';
import { listStaff } from '../api/staffApi';

/**
 * Hook to fetch and manage staff list with React Query
 * @param {Object} filters - Filter parameters { search, role, status }
 * @returns {Object} React Query result { data, isLoading, error, refetch }
 */
export function useStaff(filters = {}) {
  return useQuery({
    queryKey: ['staff', filters],
    queryFn: () => listStaff(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
