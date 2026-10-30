/**
 * Backward-compatible JSON API helper.
 * All network requests share apiConfig.js for base URL, credentials and fallback.
 */
import { API_BASE_URL, requestApi } from './apiConfig.js';
export { API_BASE_URL };

export async function apiRequest(endpoint, options = {}) {
  try {
    const res = await requestApi(endpoint, options);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const errorMsg = data?.message || data?.error?.message || data?.error ||
        `HTTP ${res.status}: ${res.statusText}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }
    return data;
  } catch (err) {
    if (err.status) throw err;
    console.warn('API request failed:', err.message);
    throw new Error(`Cannot connect to CODE3D backend server at ${API_BASE_URL}. Ensure server is running on port 5000.`);
  }
}
