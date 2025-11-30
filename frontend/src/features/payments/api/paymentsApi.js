/**
 * Payments API Module
 * All API calls related to payments and invoices management
 */
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

/**
 * List all payments with optional filtering
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise<Array>} Array of payment objects
 */
export const listPayments = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.PAYMENTS, { params });
  return response.data;
};

/**
 * Create a new payment
 * @param {Object} data - Payment data
 * @returns {Promise<Object>} Created payment object
 */
export const createPayment = async (data) => {
  const payload = {
    customer_id: data.customer_id,
    amount: parseFloat(data.amount),
    payment_method: data.payment_method,
    transaction_id: data.transaction_id?.trim() || null,
    notes: data.notes?.trim() || null,
  };
  
  const response = await apiClient.post(API_ENDPOINTS.ADMIN.PAYMENTS, payload);
  return response.data;
};

/**
 * Update an existing payment
 * @param {string} id - Payment ID
 * @param {Object} data - Updated payment data
 * @returns {Promise<Object>} Updated payment object
 */
export const updatePayment = async (id, data) => {
  const payload = {
    customer_id: data.customer_id,
    amount: parseFloat(data.amount),
    payment_method: data.payment_method,
    transaction_id: data.transaction_id?.trim() || null,
    notes: data.notes?.trim() || null,
  };
  
  const response = await apiClient.put(API_ENDPOINTS.ADMIN.PAYMENT_BY_ID(id), payload);
  return response.data;
};

/**
 * Delete a payment
 * @param {string} id - Payment ID
 * @returns {Promise<void>}
 */
export const deletePayment = async (id) => {
  const response = await apiClient.delete(API_ENDPOINTS.ADMIN.PAYMENT_BY_ID(id));
  return response.data;
};

/**
 * Export payments to Excel
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Blob>} Excel file blob
 */
export const exportPayments = async (filters = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.PAYMENTS_EXPORT, {
    params: filters,
    responseType: 'blob'
  });
  return response.data;
};

/**
 * List all invoices
 * @returns {Promise<Array>} Array of invoice objects
 */
export const listInvoices = async () => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.INVOICES);
  return response.data;
};

/**
 * Generate monthly invoices
 * @param {Object} data - { month, year, customer_ids (optional) }
 * @returns {Promise<Object>} Generation result
 */
export const generateMonthlyInvoices = async (data) => {
  const payload = {
    month: data.month,
    year: data.year,
    customer_ids: data.customer_ids || null,
  };
  
  const response = await apiClient.post(API_ENDPOINTS.ADMIN.INVOICES_GENERATE, payload);
  return response.data;
};

/**
 * Payments API object (alternative export style)
 */
export const paymentsApi = {
  listPayments,
  createPayment,
  updatePayment,
  deletePayment,
  exportPayments,
  listInvoices,
  generateMonthlyInvoices,
};
