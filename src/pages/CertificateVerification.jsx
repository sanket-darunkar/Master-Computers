import React, { useState, useEffect, useRef, useCallback } from 'react';
import { verifyCertificate, CertErrorType, CertificateError } from '../services/certificateService';
import { ACADEMY_NAME, ADDRESS_LINE2, callLink, waLink, WA_MSG_GENERAL } from '../config/siteConfig';

// ─────────────────────────────────────────────────────────────
// ICONS  (inline SVG — zero extra dependencies)
// ─────────────────────────────────────────────────────────────
const IconSearch      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconCheck       = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IconX           = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
const IconWarning     = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconLoader      = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const IconRefresh     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>;
const IconPhone       = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 10.8 19.79 19.79 0 0 1 .03 2.18 2 2 0 0 1 2 0h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L6.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.05 12.05 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconUser        = () => <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconCert        = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;

// ─────────────────────────────────────────────────────────────
// PAGE STATE ENUM
// ─────────────────────────────────────────────────────────────
const State = Object.freeze({
  IDLE    : 'IDLE',
  LOADING : 'LOADING',
  VALID   : 'VALID',
  REVOKED : 'REVOKED',
  PENDING : 'PENDING',
  NOT_FOUND: 'NOT_FOUND',
  ERROR   : 'ERROR',
});

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—';
  try {
    // Display as MONTH-YEAR, e.g. "September-2026"
    const d = new Date(iso);
    const month = d.toLocaleDateString('en-IN', { month: 'long' });
    const year  = d.getFullYear();
    return `${month}-${year}`;
  } catch {
    return iso;
  }
}

function statusBadge(status) {
  const map = {
    ACTIVE : { label: 'Active',  cls: 'bg-green-100 text-green-800 border-green-200'  },
    REVOKED: { label: 'Revoked', cls: 'bg-red-100   text-red-800   border-red-200'    },
    PENDING: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  };
  const s = map[status] || { label: status, cls: 'bg-gray-100 text-gray-800 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${s.cls}`}>
      {s.label}
    </span>
  );
}

/** One row in the certificate detail table */
function DetailRow({ label, value, highlight = false }) {
  if (!value) return null;
  return (
    <div className={`flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-100 last:border-0 ${highlight ? 'bg-primary-50 -mx-4 px-4 rounded-xl' : ''}`}>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide sm:w-44 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-900 flex-1">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

/** ── Loading state ── */
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5" role="status" aria-live="polite">
      <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
        <IconLoader />
      </div>
      <div className="text-center">
        <p className="font-bold text-gray-900 text-lg">Certificate तपासत आहे…</p>
        <p className="text-gray-500 text-sm mt-1 font-devanagari">कृपया थांबा — सर्व्हर सुरू होत आहे, यास 30–90 सेकंद लागू शकतात.</p>
      </div>
    </div>
  );
}

/** ── Valid certificate card ── */
function ValidCertificate({ cert }) {

  // Build the photo src from whichever field is available.
  // Priority: uploaded binary (photoData + photoMimeType) > legacy URL.
  const photoSrc = cert.photoData && cert.photoMimeType
    ? `data:${cert.photoMimeType};base64,${cert.photoData}`
    : cert.studentPhotoUrl || null;

  const hasPhoto = Boolean(photoSrc);

  return (
    <div className="animate-fade-up">
      {/* Status banner */}
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
          <IconCheck />
        </div>
        <div>
          <p className="font-extrabold text-green-800 text-base">✅ Certificate Verified</p>
          <p className="text-green-700 text-sm font-devanagari mt-0.5">
            हे Certificate अधिकृत आणि Valid आहे.
          </p>
        </div>
        <div className="ml-auto flex-shrink-0">{statusBadge(cert.status)}</div>
      </div>

      {/* Main card — printable area */}
      <div id="cert-print-area" className="card p-0 overflow-hidden">

        {/* Card header — branding strip */}
        <div className="bg-hero-gradient text-white px-6 py-5 print:bg-primary-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/master-computer-academy-logo.svg"
              alt={`${ACADEMY_NAME} logo`}
              className="h-10 w-auto object-contain bg-white rounded-lg px-2 py-1"
              loading="eager"
            />
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider">Certificate Verification</p>
            <p className="text-white font-bold text-sm mt-0.5">{ADDRESS_LINE2}</p>
          </div>
        </div>

        {/* Card body */}
        <div className="p-6 sm:p-8">
          {/* Student photo + name */}
          <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
            <div className="flex-shrink-0">
              {hasPhoto ? (
                <img
                  src={photoSrc}
                  alt={`Photo of ${cert.studentName}`}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-primary-100 shadow-card"
                  loading="lazy"
                  onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div
                className={`w-24 h-24 rounded-2xl bg-primary-50 border-2 border-primary-100 flex items-center justify-center text-primary-300 ${hasPhoto ? 'hidden' : 'flex'}`}
                aria-hidden="true"
              >
                <IconUser />
              </div>
            </div>

            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Student Name</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">{cert.studentName}</h2>
              <p className="text-primary-600 font-semibold mt-1 text-sm">{cert.courseName}</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="space-y-0 mb-6">
            <DetailRow label="Certificate No."  value={cert.certificateNumber} highlight />
            <DetailRow label="Institution"      value={cert.institutionName} />
            <DetailRow label="Course"           value={cert.courseName} />
            <DetailRow label="Exam Date"        value={formatDate(cert.issueDate)} />
            <DetailRow label="Duration"         value={cert.duration} />
            <DetailRow label="Marks"            value={cert.marks} />
            <DetailRow label="Grade"            value={cert.grade} />
            <DetailRow label="Status"           value={statusBadge(cert.status)} />
          </div>

          {/* Verification note */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500 font-devanagari print:hidden">
            हे verification {new Date().toLocaleString('en-IN')} रोजी केले गेले.
            अधिक माहितीसाठी Master Computer Academy शी संपर्क करा.
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-5 print:hidden">
        <a
          href={callLink()}
          className="btn-primary btn-md flex-1 sm:flex-none"
          aria-label="Call Master Computer Academy"
        >
          <IconPhone />
          Contact Academy
        </a>
      </div>
    </div>
  );
}

/** ── Revoked certificate card ── */
function RevokedCertificate({ cert, onReset }) {
  return (
    <div className="animate-fade-up">
      {/* Status banner */}
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
          <IconWarning />
        </div>
        <div>
          <p className="font-extrabold text-red-800 text-base">⚠️ Certificate Revoked</p>
          <p className="text-red-700 text-sm font-devanagari mt-0.5">
            हे Certificate रद्द करण्यात आले आहे आणि Valid नाही.
          </p>
        </div>
        <div className="ml-auto flex-shrink-0">{statusBadge('REVOKED')}</div>
      </div>

      {cert && (
        <div className="card p-6 mb-5 border-red-100">
          <div className="space-y-0">
            <DetailRow label="Certificate No." value={cert.certificateNumber} />
            <DetailRow label="Student Name"    value={cert.studentName} />
            <DetailRow label="Course"          value={cert.courseName} />
            <DetailRow label="Exam Date"      value={formatDate(cert.issueDate)} />
            <DetailRow label="Institution"     value={cert.institutionName} />
            <DetailRow label="Status"          value={statusBadge('REVOKED')} />
          </div>
        </div>
      )}

      <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-5">
        <p className="text-red-800 text-sm font-semibold font-devanagari">
          अधिक माहितीसाठी किंवा तक्रारीसाठी कृपया Master Computer Academy शी थेट संपर्क करा.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={onReset} className="btn-outline btn-md flex-1 sm:flex-none">
          <IconRefresh /> Try Again
        </button>
        <a href={callLink()} className="btn-primary btn-md flex-1 sm:flex-none">
          <IconPhone /> Contact Academy
        </a>
      </div>
    </div>
  );
}

/** ── Not found card ── */
function NotFoundCard({ certNumber, onReset }) {
  return (
    <div className="animate-fade-up text-center py-4">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-400 mx-auto mb-4">
        <IconX />
      </div>
      <h3 className="font-extrabold text-gray-900 text-xl mb-2">❌ Certificate Not Found</h3>
      <p className="text-gray-600 font-devanagari text-sm mb-1">
        दिलेल्या Certificate Number साठी कोणताही Record सापडला नाही.
      </p>
      {certNumber && (
        <p className="text-gray-400 text-xs font-mono mt-1 mb-6">
          Searched: <span className="text-gray-600 font-semibold">{certNumber}</span>
        </p>
      )}

      <div className="bg-gray-50 rounded-2xl p-5 text-left mb-6 max-w-md mx-auto">
        <p className="text-sm font-semibold text-gray-700 mb-2">तपासा:</p>
        <ul className="text-sm text-gray-600 space-y-1 font-devanagari list-disc list-inside">
          <li>Certificate Number बरोबर आहे का?</li>
          <li>Capital/small letters तपासा (e.g. MCA-2024-001)</li>
          <li>Extra spaces नाहीत ना?</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={onReset} className="btn-primary btn-md">
          <IconRefresh /> Try Again
        </button>
        <a href={callLink()} className="btn-outline btn-md">
          <IconPhone /> Contact Academy
        </a>
      </div>
    </div>
  );
}

/** ── Generic error card ── */
function ErrorCard({ message, onReset }) {
  return (
    <div className="animate-fade-up text-center py-4">
      <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center text-amber-400 mx-auto mb-4">
        <IconWarning />
      </div>
      <h3 className="font-extrabold text-gray-900 text-xl mb-2">Something went wrong</h3>
      <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={onReset} className="btn-primary btn-md">
          <IconRefresh /> Try Again
        </button>
        <a href={callLink()} className="btn-outline btn-md">
          <IconPhone /> Contact Academy
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────
export default function CertificateVerification() {
  // ── Read the certificate query param ONCE, outside of state ──
  // We read it here (not inside an effect) so it is stable for the
  // lifetime of this component instance and never triggers re-renders.
  // Supports both URL formats:
  //   /certificate-verification?certificate=MCA-XXX   (path-based, used by QR codes)
  //   /?page=certificate-verification&certificate=MCA-XXX  (query-param router)
  const certFromUrl = useRef(
    new URLSearchParams(window.location.search).get('certificate')?.trim() || ''
  );

  const [inputValue, setInputValue]   = useState(certFromUrl.current); // pre-populate immediately
  const [pageState, setPageState]     = useState(State.IDLE);
  const [certificate, setCertificate] = useState(null);
  const [errorMsg, setErrorMsg]       = useState('');
  const [lastQueried, setLastQueried] = useState('');

  const inputRef          = useRef(null);
  const resultRef         = useRef(null);
  const inFlightRef       = useRef(false);  // prevent duplicate concurrent requests
  const hasAutoVerified   = useRef(false);  // fire auto-verify exactly once (StrictMode-safe)

  // ── QR / URL query param — auto-verify on mount ────────────
  // This effect depends only on the stable certFromUrl.current ref value.
  // hasAutoVerified ensures it fires exactly once even in React StrictMode
  // (where effects run twice in development: mount → unmount → remount).
  useEffect(() => {
    if (certFromUrl.current && !hasAutoVerified.current) {
      hasAutoVerified.current = true;
      // Directly call runVerification with the explicit value.
      // We do NOT use setTimeout — state is already initialised above.
      runVerification(certFromUrl.current);
    } else if (!certFromUrl.current) {
      // No query param — just focus the input for keyboard users
      inputRef.current?.focus();
    }
    // runVerification is stable for the values we care about at mount;
    // certFromUrl.current never changes after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Scroll to result whenever it appears ───────────────────
  useEffect(() => {
    if (pageState !== State.IDLE && pageState !== State.LOADING) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [pageState]);

  // ── Core verification logic ─────────────────────────────────
  const runVerification = useCallback(async (value) => {
    const certNumber = (value ?? inputValue).trim();

    if (!certNumber) {
      setErrorMsg('Please enter a certificate number.');
      setPageState(State.ERROR);
      return;
    }

    // Deduplicate: ignore if same number is already showing a result
    if (certNumber === lastQueried && pageState === State.VALID) return;

    // Prevent concurrent calls
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    setLastQueried(certNumber);
    setPageState(State.LOADING);
    setCertificate(null);
    setErrorMsg('');

    try {
      const cert = await verifyCertificate(certNumber);
      setCertificate(cert);
      setPageState(State.VALID);
    } catch (err) {
      if (err instanceof CertificateError) {
        switch (err.errorType) {
          case CertErrorType.NOT_FOUND:
            setPageState(State.NOT_FOUND);
            break;
          case CertErrorType.REVOKED:
            setCertificate(err.certificate || null);
            setPageState(State.REVOKED);
            break;
          case CertErrorType.PENDING:
            setCertificate(err.certificate || null);
            setPageState(State.REVOKED);   // show similar warning UI
            setErrorMsg(err.message);
            break;
          case CertErrorType.NETWORK:
          case CertErrorType.TIMEOUT:
            setErrorMsg(err.message);
            setPageState(State.ERROR);
            break;
          case CertErrorType.VALIDATION:
            setErrorMsg(err.message);
            setPageState(State.ERROR);
            break;
          default:
            setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
            setPageState(State.ERROR);
        }
      } else {
        // Truly unexpected error — don't expose stack trace
        setErrorMsg('An unexpected error occurred. Please try again.');
        setPageState(State.ERROR);
      }
    } finally {
      inFlightRef.current = false;
    }
  }, [inputValue, lastQueried, pageState]);

  const handleSubmit = (e) => {
    e.preventDefault();
    runVerification(inputValue);
  };

  const handleReset = () => {
    setPageState(State.IDLE);
    setCertificate(null);
    setErrorMsg('');
    setLastQueried('');
    setInputValue('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const isLoading = pageState === State.LOADING;

  // ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero / header strip ── */}
      <div className="bg-hero-gradient text-white py-12 print:hidden">
        <div className="container-main text-center">
          <span className="section-label bg-white/20 text-white border-0">
            Certificate Verification
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-3 mb-3 font-devanagari">
            Certificate तपासा
          </h1>
          <p className="text-blue-200 font-devanagari text-sm sm:text-base max-w-xl mx-auto">
            Master Computer Academy ने जारी केलेले Certificate
            येथे verify करा — Certificate Number टाका आणि Verify करा.
          </p>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="container-main py-10">
        <div className="max-w-2xl mx-auto">

          {/* ── Search form ── */}
          <div className="card p-6 sm:p-8 mb-6 print:hidden">
            <h2 className="font-bold text-gray-900 text-lg mb-1">Certificate Number टाका</h2>
            <p className="text-gray-500 text-sm font-devanagari mb-5">
              तुमच्या Certificate वर दिलेला number खाली टाका.
              उदा: <span className="font-mono text-primary-600">MCA-2024-001</span>
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <IconSearch />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
                    placeholder="e.g. MCA-2024-001"
                    disabled={isLoading}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    aria-label="Certificate Number"
                    aria-describedby="cert-input-hint"
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-gray-900 bg-gray-50
                                font-mono text-sm tracking-wider
                                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white
                                disabled:opacity-60 disabled:cursor-not-allowed
                                transition-all duration-150
                                ${pageState === State.NOT_FOUND || pageState === State.ERROR
                                  ? 'border-red-300 focus:ring-red-400'
                                  : pageState === State.VALID
                                  ? 'border-green-300 focus:ring-green-400'
                                  : 'border-gray-200'
                                }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="btn-primary btn-md px-5 flex-shrink-0"
                  aria-label="Verify Certificate"
                >
                  {isLoading ? <IconLoader /> : <IconSearch />}
                  <span className="hidden sm:inline">
                    {isLoading ? 'Verifying…' : 'Verify'}
                  </span>
                </button>
              </div>
              <p id="cert-input-hint" className="text-xs text-gray-400 mt-2 font-devanagari">
                Enter key दाबूनही verify करता येते.
              </p>
            </form>
          </div>

          {/* ── Result area ── */}
          <div ref={resultRef}>
            {pageState === State.LOADING && <LoadingState />}

            {pageState === State.VALID && certificate && (
              <ValidCertificate cert={certificate} />
            )}

            {pageState === State.REVOKED && (
              <RevokedCertificate
                cert={certificate}
                onReset={handleReset}
              />
            )}

            {pageState === State.NOT_FOUND && (
              <NotFoundCard certNumber={lastQueried} onReset={handleReset} />
            )}

            {pageState === State.ERROR && (
              <ErrorCard message={errorMsg} onReset={handleReset} />
            )}
          </div>

          {/* ── Info strip (shown only when idle) ── */}
          {pageState === State.IDLE && (
            <div className="mt-4 bg-primary-50 rounded-2xl p-5 border border-primary-100 print:hidden">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 flex-shrink-0">
                  <IconCert />
                </div>
                <div>
                  <p className="font-bold text-primary-900 text-sm">Certificate कुठे सापडेल?</p>
                  <p className="text-gray-600 text-sm font-devanagari mt-1 leading-relaxed">
                    Certificate Number तुमच्या original certificate वर upper-right किंवा
                    bottom मध्ये असतो. उदा: <span className="font-mono text-primary-700 font-semibold">MCA-2024-001</span>
                  </p>
                  <p className="text-gray-500 text-xs font-devanagari mt-2">
                    मदत हवी असल्यास{' '}
                    <a href={callLink()} className="text-primary-600 font-semibold underline">
                      Call करा
                    </a>{' '}
                    किंवा{' '}
                    <a
                      href={waLink(WA_MSG_GENERAL)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 font-semibold underline"
                    >
                      WhatsApp करा
                    </a>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
