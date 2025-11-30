/**
 * Customers API Module
 * All API calls related to customer management
 */
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

/**
 * List all customers with optional filtering and pagination
 * @param {Object} params - Query parameters { page, limit, search, status }
 * @returns {Promise<Array>} Array of customer objects
 */
export const listCustomers = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.CUSTOMERS, { params });
  return response.data;
};

/**
 * Get a single customer by ID
 * @param {string} id - Customer ID
 * @returns {Promise<Object>} Customer object
 */
export const getCustomerById = async (id) => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.CUSTOMER_BY_ID(id));
  return response.data;
};

/**
 * Create a new customer
 * @param {Object} data - Customer data
 * @returns {Promise<Object>} Created customer object
 */
export const createCustomer = async (data) => {
  // Prepare payload with proper date formatting
  const payload = {
    full_name: data.full_name.trim(),
    gender: data.gender,
    mobile: data.mobile.trim(),
    email: data.email?.trim() || null,
    address: data.address.trim(),
    joining_date: data.joining_date 
      ? new Date(data.joining_date + 'T00:00:00Z').toISOString() 
      : new Date().toISOString(),
    meal_plan_id: data.meal_plan_id,
    monthly_rate: parseFloat(data.monthly_rate) || 0,
    security_deposit: parseFloat(data.security_deposit) || 0,
    id_proof_type: data.id_proof_type?.trim() || null,
    id_proof_number: data.id_proof_number?.trim() || null,
  };
  
  const response = await apiClient.post(API_ENDPOINTS.ADMIN.CUSTOMERS, payload);
  return response.data;
};

/**
 * Update an existing customer
 * @param {string} id - Customer ID
 * @param {Object} data - Updated customer data
 * @returns {Promise<Object>} Updated customer object
 */
export const updateCustomer = async (id, data) => {
  // Prepare payload with proper date formatting
  const payload = {
    full_name: data.full_name.trim(),
    gender: data.gender,
    mobile: data.mobile.trim(),
    email: data.email?.trim() || null,
    address: data.address.trim(),
    joining_date: data.joining_date 
      ? new Date(data.joining_date + 'T00:00:00Z').toISOString() 
      : new Date().toISOString(),
    meal_plan_id: data.meal_plan_id,
    monthly_rate: parseFloat(data.monthly_rate) || 0,
    security_deposit: parseFloat(data.security_deposit) || 0,
    id_proof_type: data.id_proof_type?.trim() || null,
    id_proof_number: data.id_proof_number?.trim() || null,
  };
  
  const response = await apiClient.put(API_ENDPOINTS.ADMIN.CUSTOMER_BY_ID(id), payload);
  return response.data;
};

/**
 * Delete a customer
 * @param {string} id - Customer ID
 * @returns {Promise<void>}
 */
export const deleteCustomer = async (id) => {
  const response = await apiClient.delete(API_ENDPOINTS.ADMIN.CUSTOMER_BY_ID(id));
  return response.data;
};

/**
 * Customers API object (alternative export style)
 */
export const customersApi = {
  list: listCustomers,
  getById: getCustomerById,
  create: createCustomer,
  update: updateCustomer,
  delete: deleteCustomer,
};
