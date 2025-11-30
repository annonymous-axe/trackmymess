/**
 * useReports Hooks
 * React Query hooks for reports data
 */
import { useQuery } from '@tanstack/react-query';
import {
  getRevenue,
  getCustomersWithDues,
  getAgingReport,
  getMealConsumption,
} from '../api/reportsApi';

/**
 * Hook to fetch revenue report data
 * @param {Object} params - Query parameters
 * @param {number} params.months - Number of months (default: 6)
 * @returns {Object} React Query result
 */
export function useRevenueReport(params = { months: 6 }) {
  return useQuery({
    queryKey: ['reports', 'revenue', params],
    queryFn: () => getRevenue(params),
    staleTime: 5 * 60 * 1000, // 5 minutes (reports data changes less frequently)
  });
}

/**
 * Hook to fetch customers with dues
 * @returns {Object} React Query result
 */
export function useDuesReport() {
  return useQuery({
    queryKey: ['reports', 'dues'],
    queryFn: () => getCustomersWithDues(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch aging analysis report
 * @returns {Object} React Query result
 */
export function useAgingReport() {
  return useQuery({
    queryKey: ['reports', 'aging'],
    queryFn: () => getAgingReport(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch meal consumption report
 * @param {Object} params - Query parameters
 * @param {number} params.month - Month (1-12)
 * @param {number} params.year - Year
 * @returns {Object} React Query result
 */
export function useMealConsumptionReport(params) {
  return useQuery({
    queryKey: ['reports', 'meal-consumption', params],
    queryFn: () => getMealConsumption(params),
    staleTime: 5 * 60 * 1000,
    enabled: !!params.month && !!params.year, // Only fetch if month and year are provided
  });
}
