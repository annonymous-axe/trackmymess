/**
 * usePauseRequests Hook
 * React Query hook for fetching pause requests list
 */
import { useQuery } from '@tanstack/react-query';
import { listPauseRequests } from '../api/pauseRequestsApi';

/**
 * Hook to fetch and manage pause requests list with React Query
 * @returns {Object} React Query result { data, isLoading, error, refetch }
 */
export function usePauseRequests() {
  return useQuery({
    queryKey: ['pauseRequests'],
    queryFn: () => listPauseRequests(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
