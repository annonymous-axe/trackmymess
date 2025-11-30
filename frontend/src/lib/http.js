/**
 * Legacy HTTP Module - Backward Compatibility Layer
 * 
 * This file now re-exports from the new API client layer for backward compatibility.
 * All existing imports from this file will continue to work.
 * 
 * Old code can continue using:
 *   import axios, { http, API } from '@/lib/http';
 * 
 * New code should import from:
 *   import { apiClient } from '@/lib/api/client';
 */

// Re-export everything from the new API client
export { 
  apiClient,           // New axios instance
  apiClient as http,   // Backward compatibility alias
  apiClient as default, // Default export
  API_BASE_URL as API, // Backward compatibility
  BACKEND_URL,         // Backward compatibility
  tokenHelpers,        // Token management helpers
} from './api/client';

// Note: The axios instance is now managed in ./api/client.js
// with the same interceptors and configuration as before