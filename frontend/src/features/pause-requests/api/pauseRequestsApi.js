/**
 * Pause Requests API Module
 * All API calls related to pause request management
 */
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

/**
 * List all pause requests
 * @returns {Promise<Array>} Array of pause request objects
 */
export const listPauseRequests = async () => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.PAUSE_REQUESTS);
  return response.data;
};

/**
 * Create a new pause request
 * @param {Object} data - Pause request data
 * @param {string} data.customer_id - Customer ID
 * @param {string} data.start_date - Start date (ISO string)
 * @param {string} data.end_date - End date (ISO string)
 * @param {string} data.reason - Reason for pause
 * @returns {Promise<Object>} Created pause request object
 */
export const createPauseRequest = async (data) => {
  const payload = {
    customer_id: data.customer_id,
    start_date: new Date(data.start_date).toISOString(),
    end_date: new Date(data.end_date).toISOString(),
    reason: data.reason?.trim() || '',
  };
  
  const response = await apiClient.post(API_ENDPOINTS.ADMIN.PAUSE_REQUESTS, payload);
  return response.data;
};

/**
 * Update pause request status (approve/reject)
 * @param {string} id - Pause request ID
 * @param {string} status - New status ('APPROVED' or 'REJECTED')
 * @param {string} adminNotes - Optional admin notes
 * @returns {Promise<Object>} Updated pause request object
 */
export const updatePauseRequestStatus = async (id, status, adminNotes = '') => {
  const payload = {
    status,
    admin_notes: adminNotes?.trim() || '',
  };
  
  const response = await apiClient.put(API_ENDPOINTS.ADMIN.PAUSE_REQUEST_BY_ID(id), payload);
  return response.data;
};

/**
 * Pause Requests API object (alternative export style)
 */
export const pauseRequestsApi = {
  listPauseRequests,
  createPauseRequest,
  updatePauseRequestStatus,
};
