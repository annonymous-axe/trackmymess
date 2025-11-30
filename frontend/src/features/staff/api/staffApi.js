/**
 * Staff API Module
 * All API calls related to staff management
 */
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

/**
 * List all staff members with optional filtering
 * @param {Object} params - Query parameters { search, role, status }
 * @returns {Promise<Array>} Array of staff objects
 */
export const listStaff = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.STAFF, { params });
  return response.data;
};

/**
 * Get a single staff member by ID
 * @param {string} id - Staff ID
 * @returns {Promise<Object>} Staff object
 */
export const getStaffById = async (id) => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.STAFF_BY_ID(id));
  return response.data;
};

/**
 * Create a new staff member
 * @param {Object} data - Staff data
 * @returns {Promise<Object>} Created staff object
 */
export const createStaff = async (data) => {
  const payload = {
    full_name: data.full_name.trim(),
    gender: data.gender,
    mobile: data.mobile.trim(),
    email: data.email?.trim() || null,
    address: data.address.trim(),
    role: data.role,
    joining_date: data.joining_date 
      ? new Date(data.joining_date + 'T00:00:00Z').toISOString() 
      : new Date().toISOString(),
    salary: parseFloat(data.salary) || 0,
  };
  
  const response = await apiClient.post(API_ENDPOINTS.ADMIN.STAFF, payload);
  return response.data;
};

/**
 * Update an existing staff member
 * @param {string} id - Staff ID
 * @param {Object} data - Updated staff data
 * @returns {Promise<Object>} Updated staff object
 */
export const updateStaff = async (id, data) => {
  const payload = {
    full_name: data.full_name.trim(),
    gender: data.gender,
    mobile: data.mobile.trim(),
    email: data.email?.trim() || null,
    address: data.address.trim(),
    role: data.role,
    joining_date: data.joining_date 
      ? new Date(data.joining_date + 'T00:00:00Z').toISOString() 
      : new Date().toISOString(),
    salary: parseFloat(data.salary) || 0,
  };
  
  const response = await apiClient.put(API_ENDPOINTS.ADMIN.STAFF_BY_ID(id), payload);
  return response.data;
};

/**
 * Delete a staff member
 * @param {string} id - Staff ID
 * @returns {Promise<void>}
 */
export const deleteStaff = async (id) => {
  const response = await apiClient.delete(API_ENDPOINTS.ADMIN.STAFF_BY_ID(id));
  return response.data;
};

/**
 * Record payment for a staff member
 * @param {string} id - Staff ID
 * @param {Object} data - Payment data (amount, payment_type, notes)
 * @returns {Promise<Object>} Payment record
 */
export const recordStaffPayment = async (id, data) => {
  const payload = {
    amount: parseFloat(data.amount),
    payment_type: data.payment_type,
    notes: data.notes?.trim() || null,
  };
  
  const response = await apiClient.post(API_ENDPOINTS.ADMIN.STAFF_PAYMENT(id), payload);
  return response.data;
};

/**
 * Staff API object (alternative export style)
 */
export const staffApi = {
  list: listStaff,
  getById: getStaffById,
  create: createStaff,
  update: updateStaff,
  delete: deleteStaff,
  recordPayment: recordStaffPayment,
};
