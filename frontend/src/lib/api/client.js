/**
 * API Client Configuration
 * Centralized Axios instance with interceptors for authentication and token refresh
 */
import axios from 'axios';

// ==================== Environment Configuration ====================
// Hybrid environment variable support for Vite and CRA
const viteBackendUrl =
  typeof import.meta !== 'undefined' &&
  import.meta.env &&
  import.meta.env.VITE_BACKEND_URL;

export const BACKEND_URL =
  viteBackendUrl ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_BACKEND_URL) ||
  'http://localhost:8000';

export const API_BASE_URL = `${BACKEND_URL}/api`;

// ==================== Token Storage Helpers ====================
const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
};

const getAccessToken = () => localStorage.getItem(TOKEN_KEYS.ACCESS);
const getRefreshToken = () => localStorage.getItem(TOKEN_KEYS.REFRESH);

const setTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
  if (refreshToken) localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
};

const clearTokens = () => localStorage.clear();

// Export token helpers for use in other modules
export const tokenHelpers = {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
};

// ==================== Axios Instance ====================
/**
 * Main API client instance
 * Pre-configured with base URL, timeout, and interceptors
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== Token Refresh State Management ====================
let isRefreshing = false;
let refreshPromise = null;

// ==================== Helper Functions ====================
/**
 * Check if URL is an auth endpoint (skip token handling)
 * @param {string} url - Request URL
 * @returns {boolean}
 */
const isAuthURL = (url) => {
  return url && (url.includes('/auth/refresh') || url.includes('/auth/login'));
};

// ==================== Request Interceptor ====================
/**
 * Automatically attach JWT token to all requests (except auth endpoints)
 */
apiClient.interceptors.request.use(
  (config) => {
    // Skip adding token to auth endpoints
    if (isAuthURL(config.url)) {
      return config;
    }

    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== Response Interceptor ====================
/**
 * Handle 401/419 errors with automatic token refresh
 * Redirect to login if refresh fails
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip retry logic for auth endpoints
    if (isAuthURL(originalRequest?.url)) {
      return Promise.reject(error);
    }

    // Only retry on 401 (Unauthorized) or 419 (Token Expired)
    const status = error.response?.status;
    if ((status === 401 || status === 419) && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();

      // If no refresh token, redirect to login
      if (!refreshToken) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(new Error('No refresh token available'));
      }

      // If not already refreshing, start refresh
      if (!isRefreshing) {
        isRefreshing = true;

        const REFRESH_URL = `${API_BASE_URL}/auth/refresh`;

        refreshPromise = axios
          .post(REFRESH_URL, { refresh_token: refreshToken }, { timeout: 20000 })
          .then((response) => {
            const { access_token, refresh_token } = response.data;
            setTokens(access_token, refresh_token);
            isRefreshing = false;
            return true;
          })
          .catch((refreshError) => {
            isRefreshing = false;
            clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          });
      }

      // Wait for refresh, then retry original request
      return refreshPromise.then(() => {
        try {
          originalRequest.headers.Authorization = `Bearer ${getAccessToken()}`;
          return apiClient(originalRequest);
        } catch (retryError) {
          return Promise.reject(retryError);
        }
      });
    }

    // For 403 (Forbidden) or other errors, just reject
    return Promise.reject(error);
  }
);

// ==================== Exports ====================
/**
 * Default export: axios instance
 */
export default apiClient;

/**
 * Named export for backward compatibility
 */
export const http = apiClient;
