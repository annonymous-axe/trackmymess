/**
 * Attendance API Module
 * All API calls related to attendance management
 */
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

/**
 * Get attendance records for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of attendance records
 */
export const getAttendance = async (date) => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.ATTENDANCE, {
    params: { date }
  });
  return response.data;
};

/**
 * Save attendance for a specific date
 * @param {Object} data - { date: ISO string, records: [{customer_id, breakfast, lunch, dinner}] }
 * @returns {Promise<Object>} Saved attendance response
 */
export const saveAttendance = async (data) => {
  const payload = {
    date: data.date, // Should be ISO string
    records: data.records.map(record => ({
      customer_id: record.customer_id,
      breakfast: Boolean(record.breakfast),
      lunch: Boolean(record.lunch),
      dinner: Boolean(record.dinner),
    })),
  };
  
  const response = await apiClient.post(API_ENDPOINTS.ADMIN.ATTENDANCE, payload);
  return response.data;
};

/**
 * Attendance API object (alternative export style)
 */
export const attendanceApi = {
  get: getAttendance,
  save: saveAttendance,
};
