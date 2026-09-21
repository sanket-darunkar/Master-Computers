/**
 * ============================================================
 * ADMIN API SERVICE
 * ============================================================
 * All /api/admin/** requests go through this module.
 *
 * - Automatically attaches Authorization: Bearer <token>
 * - On 401: clears stored auth and dispatches a redirect event
 * - Never exposes the token in the UI
 *
 * Token is stored in sessionStorage under the key defined in
 * AUTH_TOKEN_KEY.  sessionStorage is cleared automatically when
 * the browser tab/window closes — safer than localStorage for
 * admin credentials on a shared machine.
 *
 * REQUEST ROUTING
 * ───────────────
 * In development (Vite dev server), all /api/* requests are
 * proxied to VITE_API_BASE_URL by vite.config.js.  Using a
 * relative BASE_URL ('') means the browser sends requests to
 * the same origin (localhost:5173/5174/…) and Vite forwards
 * them — so CORS is never involved regardless of which port
 * Vite lands on.
 *
 * In production (built bundle served from the same origin as
 * the backend, or behind a reverse-proxy), the same relative
 * URL approach works without any change.
 *
 * If you need to call the backend directly from a different
 * domain, set VITE_API_BASE_URL to the backend origin AND
 * ensure the backend CORS_ALLOWED_ORIGIN matches the frontend.
 * ============================================================
 */

// ── Base URL ──────────────────────────────────────────────────
// In development the Vite proxy intercepts /api/* and forwards it to the
// backend, so a relative BASE_URL ('') works fine.
//
// In production there is no Vite proxy. The browser must call the backend
// directly, so we use VITE_API_BASE_URL (e.g. https://api.mastercomputeracademy.org).
// VITE_API_BASE_URL must be set in the production environment — the build
// will succeed without it but API calls will fail at runtime.
//
// Never put the backend URL as a hardcoded fallback in production code.
// Set it via your hosting platform's environment variable configuration.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const TIMEOUT_MS  = 15_000;

// ── Storage key ──────────────────────────────────────────────
export const AUTH_TOKEN_KEY = 'mca_admin_token';

// ── Custom error class ───────────────────────────────────────
export class AdminApiError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.name   = 'AdminApiError';
    this.status = status;
    this.data   = data;
  }
}

// ── Token helpers ────────────────────────────────────────────
export function getStoredToken() {
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function storeToken(token) {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearToken() {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
}

// ── Core fetch wrapper ───────────────────────────────────────
async function adminFetch(path, options = {}) {
  const controller = new AbortController();
  const timerId    = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const token   = getStoredToken();
  const headers = {
    'Content-Type' : 'application/json',
    'Accept'       : 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timerId);
    if (err.name === 'AbortError') {
      throw new AdminApiError(0, 'Request timed out. Please try again.');
    }
    throw new AdminApiError(0, 'Cannot connect to server. Please check your connection.');
  } finally {
    clearTimeout(timerId);
  }

  // 401 → clear token and signal the app to redirect to login
  if (response.status === 401) {
    clearToken();
    window.dispatchEvent(new CustomEvent('mca:admin:unauthorized'));
    throw new AdminApiError(401, 'Session expired. Please log in again.');
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new AdminApiError(response.status, 'Server returned an unreadable response.');
  }

  if (!response.ok) {
    // Spring returns { success: false, message: '...' }
    throw new AdminApiError(
      response.status,
      body?.message || `Request failed (${response.status}).`,
      body
    );
  }

  return body; // full ApiResponse envelope
}

// ── Auth ─────────────────────────────────────────────────────

/**
 * POST /api/admin/auth/login
 * Returns: { token, tokenType }
 */
export async function adminLogin(email, password) {
  const res = await adminFetch('/api/admin/auth/login', {
    method : 'POST',
    body   : JSON.stringify({ email, password }),
  });
  return res.data; // { token, tokenType }
}

// ── Certificates ─────────────────────────────────────────────

/**
 * GET /api/admin/certificates
 * Params: { page=0, size=10, search='', status='', course='' }
 * Returns: PagedResponse<CertificateResponse>
 */
export async function listCertificates({ page = 0, size = 10, search = '', status = '', course = '' } = {}) {
  const params = new URLSearchParams({ page, size });
  if (search)  params.set('search', search);
  if (status)  params.set('status', status);
  if (course)  params.set('course', course);
  const res = await adminFetch(`/api/admin/certificates?${params}`);
  return res.data; // PagedResponse
}

/**
 * GET /api/admin/certificates/{id}
 * Returns: CertificateResponse
 */
export async function getCertificate(id) {
  const res = await adminFetch(`/api/admin/certificates/${id}`);
  return res.data;
}

/**
 * POST /api/admin/certificates
 * Body: CreateCertificateRequest
 * Returns: CertificateResponse
 */
export async function createCertificate(data) {
  const res = await adminFetch('/api/admin/certificates', {
    method : 'POST',
    body   : JSON.stringify(data),
  });
  return res.data;
}

/**
 * PUT /api/admin/certificates/{id}
 * Body: UpdateCertificateRequest (no certificateNumber field)
 * Returns: CertificateResponse
 */
export async function updateCertificate(id, data) {
  const res = await adminFetch(`/api/admin/certificates/${id}`, {
    method : 'PUT',
    body   : JSON.stringify(data),
  });
  return res.data;
}

/**
 * PATCH /api/admin/certificates/{id}/status
 * Body: { status: 'ACTIVE' | 'REVOKED' | 'PENDING' }
 * Returns: CertificateResponse
 */
export async function updateCertificateStatus(id, status) {
  const res = await adminFetch(`/api/admin/certificates/${id}/status`, {
    method : 'PATCH',
    body   : JSON.stringify({ status }),
  });
  return res.data;
}

/**
 * GET /api/admin/certificates/{id}/verification-history
 * Params: { page=0, size=10 }
 * Returns: PagedResponse<VerificationLogResponse>
 */
export async function getVerificationHistory(id, { page = 0, size = 10 } = {}) {
  const params = new URLSearchParams({ page, size });
  const res = await adminFetch(
    `/api/admin/certificates/${id}/verification-history?${params}`
  );
  return res.data;
}
