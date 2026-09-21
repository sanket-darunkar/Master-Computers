/**
 * ============================================================
 * CERTIFICATE SERVICE
 * ============================================================
 * Single point of contact for all certificate-related API calls.
 * Uses VITE_API_BASE_URL from .env — never hardcode the base URL
 * anywhere else in the codebase.
 *
 * Backend: Spring Boot  →  https://api.mastercomputeracademy.org (production)
 *                           http://localhost:8081 (development via Vite proxy)
 * Endpoint: GET /api/certificates/verify/{certificateNumber}
 *
 * Successful 200 response shape:
 * {
 *   success  : true,
 *   message  : "Certificate found",
 *   data     : {
 *     certificateNumber : string,
 *     studentName       : string,
 *     studentPhotoUrl   : string | null,
 *     courseName        : string,
 *     issueDate         : string  (YYYY-MM-DD),
 *     duration          : string | null,
 *     institutionName   : string,
 *     marks             : string | null,
 *     grade             : string | null,
 *     status            : "ACTIVE" | "REVOKED" | "PENDING"
 *   },
 *   timestamp : string
 * }
 *
 * 404 / error response shape:
 * {
 *   success  : false,
 *   message  : "Certificate not found: X",
 *   timestamp: string
 * }
 * ============================================================
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

/** How long (ms) to wait before treating the request as timed-out */
const REQUEST_TIMEOUT_MS = 15_000;

// ── Error types ──────────────────────────────────────────────
export const CertErrorType = Object.freeze({
  NOT_FOUND      : 'NOT_FOUND',      // 404
  REVOKED        : 'REVOKED',        // 200 but status === REVOKED
  PENDING        : 'PENDING',        // 200 but status === PENDING
  VALIDATION     : 'VALIDATION',     // 400
  NETWORK        : 'NETWORK',        // fetch failed / offline
  TIMEOUT        : 'TIMEOUT',        // request took too long
  SERVER         : 'SERVER',         // 5xx
  UNKNOWN        : 'UNKNOWN',        // anything else
});

/**
 * Structured error thrown by verifyCertificate() on failure.
 * Always read `errorType` instead of parsing message strings.
 */
export class CertificateError extends Error {
  constructor(errorType, message) {
    super(message);
    this.name        = 'CertificateError';
    this.errorType   = errorType;
  }
}

// ── Helpers ──────────────────────────────────────────────────

/**
 * Wraps fetch() with an AbortController timeout.
 */
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timerId    = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new CertificateError(
        CertErrorType.TIMEOUT,
        'Request timed out. Please check your connection and try again.'
      );
    }
    // fetch itself threw — network unreachable, DNS failure, etc.
    throw new CertificateError(
      CertErrorType.NETWORK,
      'Unable to reach the server. Please check your internet connection.'
    );
  } finally {
    clearTimeout(timerId);
  }
}

/**
 * Maps an HTTP status code to a CertErrorType.
 */
function errorTypeFromStatus(status) {
  if (status === 400) return CertErrorType.VALIDATION;
  if (status === 401) return CertErrorType.UNKNOWN;   // shouldn't happen on public endpoint
  if (status === 403) return CertErrorType.UNKNOWN;
  if (status === 404) return CertErrorType.NOT_FOUND;
  if (status >= 500)  return CertErrorType.SERVER;
  return CertErrorType.UNKNOWN;
}

// ── Public API ───────────────────────────────────────────────

/**
 * Verify a certificate by its certificate number.
 *
 * @param {string} rawCertificateNumber  — may contain surrounding whitespace
 * @returns {Promise<CertificateData>}   — resolved with the `data` object from the API
 * @throws {CertificateError}            — always a CertificateError with an `errorType`
 */
export async function verifyCertificate(rawCertificateNumber) {
  // ── Input validation (client-side) ─────────────────────────
  const certNumber = (rawCertificateNumber ?? '').trim();

  if (!certNumber) {
    throw new CertificateError(
      CertErrorType.VALIDATION,
      'Please enter a certificate number.'
    );
  }

  // URL-encode safely (handles spaces, special chars, Devanagari, etc.)
  const encodedNumber = encodeURIComponent(certNumber);
  const url           = `${BASE_URL}/api/certificates/verify/${encodedNumber}`;

  // ── Network call ────────────────────────────────────────────
  const response = await fetchWithTimeout(url, {
    method  : 'GET',
    headers : { 'Accept': 'application/json' },
  });

  // ── Parse body ──────────────────────────────────────────────
  let body;
  try {
    body = await response.json();
  } catch {
    throw new CertificateError(
      CertErrorType.SERVER,
      'Server returned an unreadable response. Please try again later.'
    );
  }

  // ── Handle non-2xx ──────────────────────────────────────────
  if (!response.ok) {
    const errorType = errorTypeFromStatus(response.status);
    const message   = body?.message || 'An error occurred. Please try again.';
    throw new CertificateError(errorType, message);
  }

  // ── Handle unexpected success=false on 200 ──────────────────
  if (!body?.success || !body?.data) {
    throw new CertificateError(
      CertErrorType.UNKNOWN,
      body?.message || 'Unexpected response from server.'
    );
  }

  const cert = body.data;

  // ── Status-level errors (certificate exists but isn't valid) ─
  if (cert.status === 'REVOKED') {
    // Return the data anyway so the UI can display the student info,
    // but signal the caller via errorType on the thrown error.
    const err      = new CertificateError(
      CertErrorType.REVOKED,
      'This certificate has been revoked.'
    );
    err.certificate = cert;   // attach data so UI can still render it
    throw err;
  }

  if (cert.status === 'PENDING') {
    const err      = new CertificateError(
      CertErrorType.PENDING,
      'This certificate is pending activation and has not been issued yet.'
    );
    err.certificate = cert;
    throw err;
  }

  // ── All good ─────────────────────────────────────────────────
  return cert;
}
