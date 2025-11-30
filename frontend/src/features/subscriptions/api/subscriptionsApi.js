/**
 * Subscriptions API Module
 * All API calls related to subscription management
 */
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

/**
 * Get current tenant subscription data
 * Fetches /auth/me and then tenant details
 * @returns {Promise<Object>} Tenant object with subscription info
 */
export const getCurrentTenant = async () => {
  const meResponse = await apiClient.get(API_ENDPOINTS.ADMIN.TENANT_ME);
  const tenantId = meResponse.data.tenant_id;
  
  if (!tenantId) {
    throw new Error('Tenant ID not found');
  }
  
  const tenantResponse = await apiClient.get(API_ENDPOINTS.ADMIN.TENANT_BY_ID(tenantId));
  return { ...tenantResponse.data, tenant_id: tenantId };
};

/**
 * Create Razorpay order for payment
 * @param {Object} data - Order data
 * @param {number} data.amount - Amount in INR
 * @returns {Promise<Object>} Order object with order_id and key_id
 */
export const createRazorpayOrder = async (data) => {
  const response = await apiClient.post(API_ENDPOINTS.ADMIN.RAZORPAY_CREATE_ORDER, {
    amount: data.amount,
    customer_id: data.customer_id || '',
  });
  return response.data;
};

/**
 * Renew subscription after payment
 * @param {string} tenantId - Tenant ID
 * @param {Object} data - Renewal data
 * @param {string} data.subscription_plan - Plan (BASIC/STANDARD/PREMIUM)
 * @param {number} data.months - Number of months
 * @param {string} data.razorpay_order_id - Razorpay order ID
 * @param {string} data.razorpay_payment_id - Razorpay payment ID
 * @returns {Promise<Object>} Updated tenant object
 */
export const renewSubscription = async (tenantId, data) => {
  const response = await apiClient.post(API_ENDPOINTS.ADMIN.TENANT_RENEW(tenantId), data);
  return response.data;
};

/**
 * Subscriptions API object (alternative export style)
 */
export const subscriptionsApi = {
  getCurrentTenant,
  createRazorpayOrder,
  renewSubscription,
};
