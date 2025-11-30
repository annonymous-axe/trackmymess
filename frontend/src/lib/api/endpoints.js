/**
 * API Endpoint Constants
 * Centralized configuration for all API endpoints
 */

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  ME: '/auth/me',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
};

// Admin endpoints
export const ADMIN_ENDPOINTS = {
  // Dashboard
  DASHBOARD: '/admin/dashboard',
  DASHBOARD_STATS: '/admin/dashboard/stats',
  
  // Customers
  CUSTOMERS: '/admin/customers',
  CUSTOMER_BY_ID: (id) => `/admin/customers/${id}`,
  
  // Meal Plans
  MEAL_PLANS: '/admin/meal-plans',
  MEAL_PLAN_BY_ID: (id) => `/admin/meal-plans/${id}`,
  
  // Attendance
  ATTENDANCE: '/admin/attendance',
  ATTENDANCE_BY_ID: (id) => `/admin/attendance/${id}`,
  
  // Pause Requests
  PAUSE_REQUESTS: '/admin/pause-requests',
  PAUSE_REQUEST_BY_ID: (id) => `/admin/pause-requests/${id}`,
  PAUSE_REQUEST_APPROVE: (id) => `/admin/pause-requests/${id}/approve`,
  PAUSE_REQUEST_REJECT: (id) => `/admin/pause-requests/${id}/reject`,
  
  // Subscriptions
  TENANT_ME: '/auth/me',
  TENANT_BY_ID: (id) => `/admin/tenants/${id}`,
  TENANT_RENEW: (id) => `/admin/tenants/${id}/renew`,
  RAZORPAY_CREATE_ORDER: '/admin/payments/razorpay/create-order',
  
  // Billing
  BILLING_PLAN: '/billing/plan',
  BILLING_QUOTE: '/billing/quote',
  BILLING_CHECKOUT: '/billing/checkout',
  
  // Payments
  PAYMENTS: '/admin/payments',
  PAYMENT_BY_ID: (id) => `/admin/payments/${id}`,
  PAYMENT_REFUND: (id) => `/admin/payments/${id}/refund`,
  PAYMENTS_EXPORT: '/admin/payments/export',
  
  // Invoices
  INVOICES: '/admin/invoices',
  INVOICE_BY_ID: (id) => `/admin/invoices/${id}`,
  INVOICE_PDF: (id) => `/admin/invoices/${id}/pdf`,
  INVOICE_EMAIL: (id) => `/admin/invoices/${id}/send-email`,
  INVOICE_GENERATE_MONTHLY: '/admin/invoices/generate-monthly',
  INVOICES_GENERATE: '/admin/invoices/generate-monthly', // Alias
  
  
  // Staff
  STAFF: '/admin/staff',
  STAFF_BY_ID: (id) => `/admin/staff/${id}`,
  STAFF_PAYMENT: (id) => `/admin/staff/${id}/payment`,
  
  // Reports
  REPORTS_REVENUE: '/admin/reports/revenue',
  REPORTS_DUES: '/admin/reports/customers-with-dues',
  REPORTS_AGING: '/admin/reports/aging',
  REPORTS_MEAL_CONSUMPTION: '/admin/reports/meal-consumption',
  REPORTS_EXPORT_CSV: '/admin/export/customers',
  
  // Reports
  REPORTS_KPIS: '/admin/reports/kpis',
  REPORTS_EXPORT: '/admin/reports/export',
  
  // Subscription
  SUBSCRIPTION: '/admin/subscription',
  
  // Billing
  BILLING: '/admin/billing',
};

// Super Admin endpoints
export const SUPER_ADMIN_ENDPOINTS = {
  // Dashboard
  DASHBOARD: '/super-admin/dashboard',
  DASHBOARD_STATS: '/super-admin/dashboard/stats',
  
  // Clients
  CLIENTS: '/super-admin/clients',
  CLIENT_BY_ID: (id) => `/super-admin/clients/${id}`,
  
  // Platform Reports
  PLATFORM_REPORTS_KPIS: '/super-admin/reports/kpis',
  
  // Settings
  SETTINGS_PRICING: '/super-admin/settings/pricing',
};

/**
 * Combined endpoints object for easy access
 */
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  ADMIN: ADMIN_ENDPOINTS,
  SUPER_ADMIN: SUPER_ADMIN_ENDPOINTS,
};

/**
 * Helper to build query string from params object
 * @param {Object} params - Query parameters
 * @returns {string} URL-encoded query string
 */
export const buildQueryString = (params = {}) => {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ''
  );
  
  if (entries.length === 0) return '';
  
  const query = entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
    
  return `?${query}`;
};
