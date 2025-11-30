/**
 * useMealPlans Hook
 * React Query hook for fetching meal plans list
 */
import { useQuery } from '@tanstack/react-query';
import { listMealPlans } from '../api/mealPlansApi';

/**
 * Hook to fetch and manage meal plans list with React Query
 * @param {Object} filters - Filter parameters { search, status }
 * @returns {Object} React Query result {  data, isLoading, error, refetch }
 */
export function useMealPlans(filters = {}) {
  return useQuery({
    queryKey: ['meal-plans', filters],
    queryFn: () => listMealPlans(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
