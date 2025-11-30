/**
 * useAttendance Hook
 * React Query hook for fetching attendance records for a specific date
 */
import { useQuery } from '@tanstack/react-query';
import { getAttendance } from '../api/attendanceApi';

/**
 * Hook to fetch attendance for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Object} React Query result { data, isLoading, error, refetch }
 */
export function useAttendance(date) {
  return useQuery({
    queryKey: ['attendance', date],
    queryFn: () => getAttendance(date),
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for real-time data)
    enabled: !!date, // Only fetch if date is provided
  });
}
