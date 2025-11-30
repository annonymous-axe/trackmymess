/**
 * Reports API Module
 * All API calls related to reports and analytics
 */
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

/**
 * Get revenue report data
 * @param {Object} params - Query parameters
 * @param {number} params.months - Number of months to fetch (default: 6)
 * @returns {Promise<Array>} Array of revenue data by month
 */
export const getRevenue = async (params = { months: 6 }) => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.REPORTS_REVENUE, {  params });
  return response.data;
};

/**
 * Get customers with pending dues
 * @returns {Promise<Array>} Array of customers with dues
 */
export const getCustomersWithDues = async () => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.REPORTS_DUES);
  return response.data;
};

/**
 * Get aging analysis report
 * @returns {Promise<Object>} Aging data grouped by age buckets
 */
export const getAgingReport = async () => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.REPORTS_AGING);
  return response.data;
};

/**
 * Get meal consumption report
 * @param {Object} params - Query parameters
 * @param {number} params.month - Month (1-12)
 * @param {number} params.year - Year
 * @returns {Promise<Array>} Array of meal consumption records
 */
export const getMealConsumption = async (params) => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.REPORTS_MEAL_CONSUMPTION, {
    params
  });
  return response.data;
};

/**
 * Export customers data as CSV
 * @param {Object} params - Export parameters
 * @param {string} params.format - Format (default: 'csv')
 * @returns {Promise<Object>} Response with data and filename
 */
export const exportCustomersCSV = async (params = { format: 'csv' }) => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.REPORTS_EXPORT_CSV, {
    params
  });
  return response.data;
};

/**
 * Reports API object (alternative export style)
 */
export const reportsApi = {
  getRevenue,
  getCustomersWithDues,
  getAgingReport,
  getMealConsumption,
  exportCustomersCSV,
};
