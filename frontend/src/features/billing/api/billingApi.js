/**
 * Billing API Module
 * All API calls related to capacity-based billing
 */
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

/**
 * Get current billing plan
 * @returns {Promise<Object>} Current plan with capacity, tenure, status
 */
export const getBillingPlan = async () => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.BILLING_PLAN);
  return response.data;
};

/**
 * Calculate quote for selected capacity and tenure
 * @param {Object} params - Quote parameters
 * @param {number} params.capacity - User capacity
 * @param {string} params.tenure - Tenure (monthly, quarterly, half_yearly, yearly)
 * @returns {Promise<Object>} Quote with subtotal, tax, total, months
 */
export const calculateQuote = async (params) => {
  const response = await apiClient.post(API_ENDPOINTS.ADMIN.BILLING_QUOTE, {
    capacity: parseInt(params.capacity),
    tenure: params.tenure,
  });
  return response.data;
};

/**
 * Create checkout  (under construction)
 * @param {Object} params - Checkout parameters
 * @param {number} params.capacity - User capacity
 * @param {string} params.tenure - Tenure
 * @returns {Promise<Object>} Checkout response
 */
export const createCheckout = async (params) => {
  const response = await apiClient.post(API_ENDPOINTS.ADMIN.BILLING_CHECKOUT, {
    capacity: parseInt(params.capacity),
    tenure: params.tenure,
  });
  return response.data;
};

/**
 * Billing API object (alternative export style)
 */
export const billingApi = {
  getBillingPlan,
  calculateQuote,
  createCheckout,
};
