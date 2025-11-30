/**
 * useAttendanceMutations Hook
 * React Query hooks for attendance save operation
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveAttendance } from '../api/attendanceApi';
import { toast } from 'sonner';

/**
 * Hook for attendance mutations (save)
 * @returns {Object} Mutation functions and loading states
 */
export function useAttendanceMutations() {
  const queryClient = useQueryClient();

  // Save attendance mutation
  const saveMutation = useMutation({
    mutationFn: saveAttendance,
    onSuccess: (data, variables) => {
      // Invalidate the specific date's attendance query
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.date.split('T')[0]] });
      toast.success('Attendance saved successfully');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.detail || 'Failed to save attendance';
      toast.error(errorMessage);
    },
  });

  return {
    // Mutation functions
    saveAttendance: saveMutation.mutate,
    
    // Async version (returns promise)
    saveAttendanceAsync: saveMutation.mutateAsync,
    
    // Loading states
    isSaving: saveMutation.isPending,
    
    // Raw mutation object (for advanced usage)
    saveMutation,
  };
}
