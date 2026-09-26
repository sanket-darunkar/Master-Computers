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

const BASE_URL   = import.meta.env.VITE_API_BASE_URL ?? '';
const TIMEOUT_MS = 90_000; // 90 s — handles Render free-tier cold starts (~50–90 s spin-up)

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

// ── Core fetch wrapper (JSON) ────────────────────────────────
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
      throw new AdminApiError(0, 'Server is starting up — please wait a moment and try again. (This can take up to 90 seconds after a period of inactivity.)');
    }
    throw new AdminApiError(0, 'Cannot connect to server. Please check your connection.');
  } finally {
    clearTimeout(timerId);
  }

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
    throw new AdminApiError(
      response.status,
      body?.message || `Request failed (${response.status}).`,
      body
    );
  }

  return body;
}

// ── Multipart fetch wrapper (FormData) ───────────────────────
/**
 * Like adminFetch but for multipart/form-data requests.
 * Do NOT set Content-Type — the browser sets it automatically
 * with the correct boundary when sending FormData.
 */
async function adminFetchMultipart(path, method, formData) {
  const controller = new AbortController();
  const timerId    = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const token = getStoredToken();
  const headers = {
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // Content-Type intentionally omitted — browser handles multipart boundary
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body   : formData,
      signal : controller.signal,
    });
  } catch (err) {
    clearTimeout(timerId);
    if (err.name === 'AbortError') {
      throw new AdminApiError(0, 'Server is starting up — please wait a moment and try again. (This can take up to 90 seconds after a period of inactivity.)');
    }
    throw new AdminApiError(0, 'Cannot connect to server. Please check your connection.');
  } finally {
    clearTimeout(timerId);
  }

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
    throw new AdminApiError(
      response.status,
      body?.message || `Request failed (${response.status}).`,
      body
    );
  }

  return body;
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
  return res.data;
}

// ── Certificates ─────────────────────────────────────────────

/**
 * GET /api/admin/certificates
 */
export async function listCertificates({ page = 0, size = 10, search = '', status = '', course = '' } = {}) {
  const params = new URLSearchParams({ page, size });
  if (search)  params.set('search', search);
  if (status)  params.set('status', status);
  if (course)  params.set('course', course);
  const res = await adminFetch(`/api/admin/certificates?${params}`);
  return res.data;
}

/**
 * GET /api/admin/certificates/{id}
 */
export async function getCertificate(id) {
  const res = await adminFetch(`/api/admin/certificates/${id}`);
  return res.data;
}

/**
 * POST /api/admin/certificates  (multipart/form-data)
 *
 * @param {object}  data  – certificate text fields matching CreateCertificateRequest
 * @param {File|null} photoFile – optional JPG/PNG File object (max 2 MB)
 *
 * The backend expects two multipart parts:
 *   "data"  – JSON blob (application/json)
 *   "photo" – optional image file
 */
export async function createCertificate(data, photoFile = null) {
  const formData = new FormData();

  // "data" part: serialize the text fields as JSON with explicit content type
  formData.append(
    'data',
    new Blob([JSON.stringify(data)], { type: 'application/json' })
  );

  // "photo" part: only append when a file is actually selected
  if (photoFile) {
    formData.append('photo', photoFile);
  }

  const res = await adminFetchMultipart('/api/admin/certificates', 'POST', formData);
  return res.data;
}

/**
 * PUT /api/admin/certificates/{id}  (multipart/form-data)
 *
 * @param {number}    id        – certificate database ID
 * @param {object}    data      – text fields matching UpdateCertificateRequest
 *                                Set data.removePhoto = true to clear existing photo.
 * @param {File|null} photoFile – optional replacement photo (null = no change)
 */
export async function updateCertificate(id, data, photoFile = null) {
  const formData = new FormData();

  formData.append(
    'data',
    new Blob([JSON.stringify(data)], { type: 'application/json' })
  );

  if (photoFile) {
    formData.append('photo', photoFile);
  }

  const res = await adminFetchMultipart(`/api/admin/certificates/${id}`, 'PUT', formData);
  return res.data;
}

/**
 * PATCH /api/admin/certificates/{id}/status
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
 */
export async function getVerificationHistory(id, { page = 0, size = 10 } = {}) {
  const params = new URLSearchParams({ page, size });
  const res = await adminFetch(
    `/api/admin/certificates/${id}/verification-history?${params}`
  );
  return res.data;
}

// ── Students ──────────────────────────────────────────────────

/**
 * GET /api/admin/students
 * Params: { page, size, search, examForm, course }
 * Returns: PagedResponse<StudentResponse>
 */
export async function listStudents({ page = 0, size = 15, search = '', status = '', course = '' } = {}) {
  const params = new URLSearchParams({ page, size });
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  if (course) params.set('course', course);
  const res = await adminFetch(`/api/admin/students?${params}`);
  return res.data;
}

/**
 * GET /api/admin/students/{id}
 * Returns: StudentResponse
 */
export async function getStudent(id) {
  const res = await adminFetch(`/api/admin/students/${id}`);
  return res.data;
}

/**
 * POST /api/admin/students  (multipart/form-data)
 * @param {object}   data      – student fields; includes `courses` string[] and `course` string (first course, backward compat)
 * @param {File|null} photoFile – optional student photo
 */
export async function createStudent(data, photoFile = null) {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
  if (photoFile) formData.append('photo', photoFile);
  const res = await adminFetchMultipart('/api/admin/students', 'POST', formData);
  return res.data;
}

/**
 * PUT /api/admin/students/{id}  (multipart/form-data)
 * @param {number}   id
 * @param {object}   data
 * @param {File|null} photoFile
 */
export async function updateStudent(id, data, photoFile = null) {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
  if (photoFile) formData.append('photo', photoFile);
  const res = await adminFetchMultipart(`/api/admin/students/${id}`, 'PUT', formData);
  return res.data;
}

/**
 * PATCH /api/admin/students/{id}/status
 *
 * Per-course update (preferred):
 *   updateStudentStatus(id, 'Exam Form Submitted', 'DCA')
 *   → only the DCA entry in courseExamStatuses is changed.
 *
 * Global update (backward compat, omit courseName):
 *   updateStudentStatus(id, 'Exam Form Submitted')
 *   → every enrolled course is set to the given status.
 *
 * @param {number}      id
 * @param {string}      examForm    – 'Exam Form Submitted' | 'Exam Form Pending'
 * @param {string|null} courseName  – specific course to update (omit for global)
 */
export async function updateStudentStatus(id, examForm, courseName = null) {
  const body = courseName
    ? { examForm, courseName }
    : { examForm };
  const res = await adminFetch(`/api/admin/students/${id}/status`, {
    method: 'PATCH',
    body  : JSON.stringify(body),
  });
  return res.data;
}
