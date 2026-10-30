/**
 * Shared API transport for every frontend service.
 * VITE_BACKEND_URL is canonical; VITE_API_URL remains a backwards-compatible alias.
 */
const LOCAL_BACKEND_URL = 'http://localhost:5000/api';
const LIVE_BACKEND_URL = 'https://code3d-ai-oscc.onrender.com/api';
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');
const trimTrailingSlashes = (value) => String(value || '').replace(/\/+$/, '');

export const API_BASE_URL = trimTrailingSlashes(
  import.meta.env?.VITE_BACKEND_URL ||
  import.meta.env?.VITE_API_URL ||
  (isLocalhost ? LOCAL_BACKEND_URL : LIVE_BACKEND_URL)
);
export const API_FALLBACK_URL = trimTrailingSlashes(
  import.meta.env?.VITE_FALLBACK_BACKEND_URL || ''
);

function isSafeFallbackUrl(value) {
  try {
    const fallback = new URL(value);
    const localHttp =
      fallback.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '[::1]'].includes(fallback.hostname);
    return !fallback.username && !fallback.password &&
      (fallback.protocol === 'https:' || localHttp);
  } catch {
    return false;
  }
}

/** Return a raw Response for endpoint-specific response parsing. */
export async function requestApi(endpoint, options = {}, { allowFallback = true } = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && typeof options.body === 'string' &&
      !Object.keys(headers).some((key) => key.toLowerCase() === 'content-type')) {
    headers['Content-Type'] = 'application/json';
  }
  const fetchOptions = { ...options, headers, credentials: 'include' };
  try {
    return await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
  } catch (error) {
    if (allowFallback && isSafeFallbackUrl(API_FALLBACK_URL) &&
        API_FALLBACK_URL !== API_BASE_URL) {
      console.warn(`Backend unreachable at ${API_BASE_URL}. Trying the explicitly configured fallback...`);
      return fetch(`${API_FALLBACK_URL}${endpoint}`, fetchOptions);
    }
    throw error;
  }
}
