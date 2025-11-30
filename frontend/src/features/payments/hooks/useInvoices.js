/**
 * useInvoices Hook
 * React Query hook for fetching invoices list
 */
import { useQuery } from '@tanstack/react-query';
import { listInvoices } from '../api/paymentsApi';

/**
 * Hook to fetch invoices list
 * @returns {Object} React Query result { data, isLoading, error, refetch }
 */
export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: () => listInvoices(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
