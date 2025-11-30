/**
 * Centralized API module for TrackMyMess
 * 
 * Adjust endpoint paths if your backend uses different routes;
 * these are conventional guesses based on page names and REST patterns.
 * 
 * Usage:
 *   import api from '@/lib/api';
 *   const customers = await api.Admin.Customers.list({ page: 1, limit: 10 });
 *   const user = await api.Auth.me();
 */

import { http, API } from '@/lib/http';

// ==================== Utilities ====================

/**
 * Extract response.data from axios response
 * @param {Object} res - Axios response
 * @returns {*} Response data payload
 */
const unwrap = (res) => res?.data;

/**
 * Build query string from object, filtering out empty values
 * @param {Object} params - Query parameters
 * @returns {string} URL-encoded query string (without leading ?)
 */
const buildQuery = (params = {}) =>
  Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

/**
 * Merge axios config with abort signal if provided
 * @param {Object} config - Axios config object
 * @param {AbortSignal} signal - Abort signal for request cancellation
 * @returns {Object} Config with signal merged in
 */
const withSignal = (config = {}, signal) => (signal ? { ...config, signal } : config);

/**
 * Generic request wrapper that unwraps response and re-throws errors
 * @param {Promise} promise - Axios promise
 * @returns {Promise} Unwrapped response data
 */
async function request(promise) {
  try {
    const res = await promise;
    return unwrap(res);
  } catch (err) {
    // Re-throw so callers/pages can handle toasts or error UI
    throw err;
  }
}

// ==================== Auth API ====================

/**
 * Authentication endpoints
 */
export const Auth = {
  /**
   * Login with email and password
   * @param {string} email
   * @param {string} password
   * @param {AbortSignal} [signal] - Optional abort signal
   * @returns {Promise<{access_token, refresh_token, user}>}
   */
  login: (email, password, signal) =>
    request(http.post(`/auth/login`, { email, password }, withSignal({}, signal))),

  /**
   * Get current authenticated user
   * @param {AbortSignal} [signal] - Optional abort signal
   * @returns {Promise<{id, name, email, role}>}
   */
  me: (signal) => request(http.get(`/auth/me`, withSignal({}, signal))),

  // Note: logout is client-side (clears localStorage) handled in AuthContext
};

// ==================== Admin API ====================

/**
 * Admin endpoints for managing customers, meal plans, attendance, etc.
 */
export const Admin = {
  /**
   * Customer management endpoints
   */
  Customers: {
    /**
     * List customers with pagination and filtering
     * @param {Object} params - { page, limit, search, status }
     * @param {AbortSignal} [signal]
     * @returns {Promise<{data, pagination}>}
     */
    list: (params = {}, signal) => {
      const q = buildQuery(params);
      return request(http.get(`/admin/customers${q ? '?' + q : ''}`, withSignal({}, signal)));
    },

    /**
     * Get single customer by ID
     * @param {string|number} id
     * @param {AbortSignal} [signal]
     * @returns {Promise<{id, name, email, ...}>}
     */
    get: (id, signal) => request(http.get(`/admin/customers/${id}`, withSignal({}, signal))),

    /**
     * Create new customer
     * @param {Object} payload - Customer data
     * @param {AbortSignal} [signal]
     * @returns {Promise<{id, name, ...}>}
     */
    create: (payload, signal) => request(http.post(`/admin/customers`, payload, withSignal({}, signal))),

    /**
     * Update customer
     * @param {string|number} id
     * @param {Object} payload - Updated customer data
     * @param {AbortSignal} [signal]
     * @returns {Promise<{id, name, ...}>}
     */
    update: (id, payload, signal) => request(http.put(`/admin/customers/${id}`, payload, withSignal({}, signal))),

    /**
     * Delete customer
     * @param {string|number} id
     * @param {AbortSignal} [signal]
     * @returns {Promise<void>}
     */
    remove: (id, signal) => request(http.delete(`/admin/customers/${id}`, withSignal({}, signal))),
  },

  /**
   * Meal plan management endpoints
   */
  MealPlans: {
    /**
     * List meal plans
     * @param {Object} params - { page, limit, search }
     * @param {AbortSignal} [signal]
     * @returns {Promise<{data, pagination}>}
     */
    list: (params = {}, signal) => {
      const q = buildQuery(params);
      return request(http.get(`/admin/meal-plans${q ? '?' + q : ''}`, withSignal({}, signal)));
    },

    get: (id, signal) => request(http.get(`/admin/meal-plans/${id}`, withSignal({}, signal))),
    create: (payload, signal) => request(http.post(`/admin/meal-plans`, payload, withSignal({}, signal))),
    update: (id, payload, signal) => request(http.put(`/admin/meal-plans/${id}`, payload, withSignal({}, signal))),
    remove: (id, signal) => request(http.delete(`/admin/meal-plans/${id}`, withSignal({}, signal))),
  },

  /**
   * Attendance tracking endpoints
   */
  Attendance: {
    /**
     * List attendance records
     * @param {Object} params - { date, customerId, status, page, limit }
     * @param {AbortSignal} [signal]
     * @returns {Promise<{data, pagination}>}
     */
    list: (params = {}, signal) => {
      const q = buildQuery(params);
      return request(http.get(`/admin/attendance${q ? '?' + q : ''}`, withSignal({}, signal)));
    },

    /**
     * Mark attendance for a customer
     * @param {Object} payload - { customerId, date, status, ... }
     * @param {AbortSignal} [signal]
     * @returns {Promise<{id, status, ...}>}
     */
    mark: (payload, signal) => request(http.post(`/admin/attendance`, payload, withSignal({}, signal))),

    get: (id, signal) => request(http.get(`/admin/attendance/${id}`, withSignal({}, signal))),
  },

  /**
   * Pause request management endpoints
   */
  Pause: {
    /**
     * List pause requests
     * @param {Object} params - { page, limit, status }
     * @param {AbortSignal} [signal]
     * @returns {Promise<{data, pagination}>}
     */
    list: (params = {}, signal) => {
      const q = buildQuery(params);
      return request(http.get(`/admin/pause-requests${q ? '?' + q : ''}`, withSignal({}, signal)));
    },

    create: (payload, signal) => request(http.post(`/admin/pause-requests`, payload, withSignal({}, signal))),
    approve: (id, signal) => request(http.post(`/admin/pause-requests/${id}/approve`, null, withSignal({}, signal))),
    reject: (id, signal) => request(http.post(`/admin/pause-requests/${id}/reject`, null, withSignal({}, signal))),
  },

  /**
   * Payment management endpoints
   */
  Payments: {
    /**
     * List payments
     * @param {Object} params - { page, limit, customerId, status }
     * @param {AbortSignal} [signal]
     * @returns {Promise<{data, pagination}>}
     */
    list: (params = {}, signal) => {
      const q = buildQuery(params);
      return request(http.get(`/admin/payments${q ? '?' + q : ''}`, withSignal({}, signal)));
    },

    get: (id, signal) => request(http.get(`/admin/payments/${id}`, withSignal({}, signal))),
    create: (payload, signal) => request(http.post(`/admin/payments`, payload, withSignal({}, signal))),
    refund: (id, signal) => request(http.post(`/admin/payments/${id}/refund`, null, withSignal({}, signal))),
  },

  /**
   * Invoice management endpoints
   */
  Invoices: {
    /**
     * List invoices
     * @param {Object} params - { page, limit, customerId, status }
     * @param {AbortSignal} [signal]
     * @returns {Promise<{data, pagination}>}
     */
    list: (params = {}, signal) => {
      const q = buildQuery(params);
      return request(http.get(`/admin/invoices${q ? '?' + q : ''}`, withSignal({}, signal)));
    },

    get: (id, signal) => request(http.get(`/admin/invoices/${id}`, withSignal({}, signal))),
    create: (payload, signal) => request(http.post(`/admin/invoices`, payload, withSignal({}, signal))),

    /**
     * Download invoice as PDF
     * @param {string|number} id
     * @param {AbortSignal} [signal]
     * @returns {Promise<Blob>}
     */
    pdf: (id, signal) => request(http.get(`/admin/invoices/${id}/pdf`, withSignal({ responseType: 'blob' }, signal))),

    /**
     * Send invoice via email
     * @param {string|number} id
     * @param {AbortSignal} [signal]
     * @returns {Promise<void>}
     */
    email: (id, signal) => request(http.post(`/admin/invoices/${id}/send-email`, null, withSignal({}, signal))),
    
    /**
     * Generate monthly invoices for all or selected customers
     * @param {Object} payload - { month, year, customer_ids? }
     * @param {AbortSignal} [signal]
     * @returns {Promise<{message}>}
     */
    generateMonthly: (payload, signal) => request(http.post(`/admin/invoices/generate-monthly`, payload, withSignal({}, signal))),
  },

  /**
   * Staff management endpoints
   */
  Staff: {
    /**
     * List staff members
     * @param {Object} params - { page, limit, search, role }
     * @param {AbortSignal} [signal]
     * @returns {Promise<{data, pagination}>}
     */
    list: (params = {}, signal) => {
      const q = buildQuery(params);
      return request(http.get(`/admin/staff${q ? '?' + q : ''}`, withSignal({}, signal)));
    },

    get: (id, signal) => request(http.get(`/admin/staff/${id}`, withSignal({}, signal))),
    create: (payload, signal) => request(http.post(`/admin/staff`, payload, withSignal({}, signal))),
    update: (id, payload, signal) => request(http.put(`/admin/staff/${id}`, payload, withSignal({}, signal))),
    remove: (id, signal) => request(http.delete(`/admin/staff/${id}`, withSignal({}, signal))),
  },

  /**
   * Reports and analytics endpoints
   */
  Reports: {
    /**
     * Get KPI metrics for a date range
     * @param {Object} params - { from, to }
     * @param {AbortSignal} [signal]
     * @returns {Promise<{totalRevenue, activeCustomers, ...}>}
     */
    kpis: (params = {}, signal) => {
      const q = buildQuery(params);
      return request(http.get(`/admin/reports/kpis${q ? '?' + q : ''}`, withSignal({}, signal)));
    },

    /**
     * Export reports as CSV
     * @param {Object} params - { type, from, to }
     * @param {AbortSignal} [signal]
     * @returns {Promise<Blob>}
     */
    exportCsv: (params = {}, signal) => {
      const q = buildQuery(params);
      return request(http.get(`/admin/reports/export${q ? '?' + q : ''}`, withSignal({ responseType: 'blob' }, signal)));
    },
  },

  /**
   * Dashboard statistics endpoints
   */
  Dashboard: {
    /**
     * Get dashboard statistics
     * @param {AbortSignal} [signal]
     * @returns {Promise<{totalCustomers, activeCustomers, ...}>}
     */
    stats: (signal) => request(http.get(`/admin/dashboard/stats`, withSignal({}, signal))),
  },
};

// ==================== SuperAdmin API ====================

/**
 * SuperAdmin endpoints for managing clients and platform-wide reports
 */
export const SuperAdmin = {
  /**
   * Client (organization) management endpoints
   */
  Clients: {
    /**
     * List clients
     * @param {Object} params - { page, limit, search, status }
     * @param {AbortSignal} [signal]
     * @returns {Promise<{data, pagination}>}
     */
    list: (params = {}, signal) => {
      const q = buildQuery(params);
      return request(http.get(`/super-admin/clients${q ? '?' + q : ''}`, withSignal({}, signal)));
    },

    get: (id, signal) => request(http.get(`/super-admin/clients/${id}`, withSignal({}, signal))),
    create: (payload, signal) => request(http.post(`/super-admin/clients`, payload, withSignal({}, signal))),
    update: (id, payload, signal) => request(http.put(`/super-admin/clients/${id}`, payload, withSignal({}, signal))),
    remove: (id, signal) => request(http.delete(`/super-admin/clients/${id}`, withSignal({}, signal))),
  },

  /**
   * Platform-wide reporting endpoints
   */
  PlatformReports: {
    /**
     * Get platform KPI metrics
     * @param {Object} params - { from, to }
     * @param {AbortSignal} [signal]
     * @returns {Promise<{totalClients, totalUsers, ...}>}
     */
    kpis: (params = {}, signal) => {
      const q = buildQuery(params);
      return request(http.get(`/super-admin/reports/kpis${q ? '?' + q : ''}`, withSignal({}, signal)));
    },
  },

  /**
   * SuperAdmin dashboard statistics endpoints
   */
  Dashboard: {
    /**
     * Get superadmin dashboard statistics
     * @param {AbortSignal} [signal]
     * @returns {Promise<{totalClients, activeClients, ...}>}
     */
    stats: (signal) => request(http.get(`/super-admin/dashboard/stats`, withSignal({}, signal))),
  },
};

// ==================== Exports ====================

/**
 * Default export: combined API module
 */
const api = { API, Auth, Admin, SuperAdmin };
export default api;

// Re-export API constant in case pages use it directly
export { API };
