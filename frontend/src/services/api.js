/**
 * Centralized API Client for CODE3D-AI Frontend
 * Communicates with the Node.js/Express backend via VITE_API_URL.
 * Supports HttpOnly cookie credentials and bounded request times.
 */

const LOCAL_BACKEND_URL = 'http://localhost:5000/api';
const LIVE_RENDER_URL = 'https://code3d-ai-oscc.onrender.com/api';
const REQUEST_TIMEOUT_MS = 20000;

const isLocalhost = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (isLocalhost ? LOCAL_BACKEND_URL : LIVE_RENDER_URL);

/**
 * Standardized HTTP request function. A timeout prevents auth screens from
 * remaining in a permanent loading state when the hosted backend/database stalls.
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error('API request timed out')), REQUEST_TIMEOUT_MS);
  const externalSignal = options.signal;
  const abortFromCaller = () => controller.abort(externalSignal?.reason);

  if (externalSignal) {
    if (externalSignal.aborted) abortFromCaller();
    else externalSignal.addEventListener('abort', abortFromCaller, { once: true });
  }

  const fetchOptions = {
    ...options,
    headers,
    signal: controller.signal,
    credentials: 'include',
  };

  try {
    const res = await fetch(url, fetchOptions);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.message || data?.error || `HTTP ${res.status}: ${res.statusText}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) throw err;
    if (controller.signal.aborted) {
      if (externalSignal?.aborted) throw new Error('Request was cancelled.');
      throw new Error('Backend did not respond within 20 seconds. Please retry; if this continues, check the server/database logs.');
    }

    console.warn(`API call to ${url} failed network connection:`, err.message);
    throw new Error(`Cannot connect to CODE3D backend server at ${API_BASE_URL}. Please retry in a moment.`);
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', abortFromCaller);
  }
}
