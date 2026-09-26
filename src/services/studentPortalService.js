/**
 * ============================================================
 * STUDENT PORTAL SERVICE
 * ============================================================
 * Public endpoint for student self-service lookup.
 * Students authenticate with Student ID + registered mobile number.
 *
 * Backend endpoint: POST /api/students/lookup
 * Request body: { studentId: string, mobile: string }
 *
 * Success 200 response shape:
 * {
 *   success: true,
 *   data: {
 *     studentId    : string,
 *     firstName    : string,
 *     middleName   : string | null,
 *     surname      : string,
 *     course       : string,          // single course (will be array in future)
 *     courses      : string[] | null, // multi-course support (Task 7)
 *     totalFees    : number | null,
 *     feesPaid     : number | null,
 *     examForm     : string,          // 'Exam Form Submitted' | 'Exam Form Pending'
 *     admissionDate: string | null,   // YYYY-MM-DD
 *   }
 * }
 *
 * 401 / 404 — invalid credentials (never reveal which field is wrong)
 * ============================================================
 */

const BASE_URL         = import.meta.env.VITE_API_BASE_URL ?? '';
const REQUEST_TIMEOUT  = 90_000;

export const PortalErrorType = Object.freeze({
  INVALID_CREDENTIALS : 'INVALID_CREDENTIALS',
  NETWORK             : 'NETWORK',
  TIMEOUT             : 'TIMEOUT',
  SERVER              : 'SERVER',
  UNKNOWN             : 'UNKNOWN',
});

export class PortalError extends Error {
  constructor(errorType, message) {
    super(message);
    this.name      = 'PortalError';
    this.errorType = errorType;
  }
}

/**
 * Look up a student's own record using their Student ID and registered mobile number.
 * Only returns data for that specific student — no other records are exposed.
 *
 * @param {string} studentId  — e.g. "MCA-STU-001"
 * @param {string} mobile     — 10-digit registered mobile
 * @returns {Promise<object>} — the student data object
 * @throws {PortalError}
 */
export async function lookupStudent(studentId, mobile) {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  let response;
  try {
    response = await fetch(`${BASE_URL}/api/students/lookup`, {
      method  : 'POST',
      headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body    : JSON.stringify({
        studentId : studentId.trim(),
        mobile    : mobile.trim(),
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new PortalError(PortalErrorType.TIMEOUT,
        'Server is starting up — please wait a moment and try again. (This can take up to 90 seconds.)');
    }
    throw new PortalError(PortalErrorType.NETWORK,
      'Unable to reach the server. Please check your internet connection.');
  } finally {
    clearTimeout(timer);
  }

  // 401 or 404 → invalid credentials — same message to avoid user enumeration
  if (response.status === 401 || response.status === 404) {
    throw new PortalError(PortalErrorType.INVALID_CREDENTIALS,
      'Student ID किंवा Mobile Number चुकीचे आहे. कृपया पुन्हा तपासा.');
  }

  let body;
  try { body = await response.json(); } catch {
    throw new PortalError(PortalErrorType.SERVER, 'Server returned an unreadable response.');
  }

  if (!response.ok) {
    if (response.status >= 500) {
      throw new PortalError(PortalErrorType.SERVER, body?.message || 'Server error. Please try again later.');
    }
    throw new PortalError(PortalErrorType.UNKNOWN, body?.message || 'An unexpected error occurred.');
  }

  return body.data;
}
