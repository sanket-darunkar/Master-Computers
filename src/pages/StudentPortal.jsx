/**
 * StudentPortal
 * ─────────────
 * Public page where a student can view their own details.
 * Authentication: Student ID + registered mobile number.
 * Only the matched student's data is returned — no other records are exposed.
 *
 * Accessible at: /?page=student-portal
 *
 * Flow:
 *   IDLE     → student fills in Student ID + mobile → submits
 *   LOADING  → API call in flight
 *   FOUND    → show student's own details
 *   ERROR    → show error message (invalid credentials / network)
 */
import React, { useState, useRef, useCallback } from 'react';
import { lookupStudent, PortalError, PortalErrorType } from '../services/studentPortalService';
import { ACADEMY_NAME, callLink, waLink, WA_MSG_GENERAL } from '../config/siteConfig';

// ── Icons ────────────────────────────────────────────────────
const IconUser    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconPhone   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 10.8 19.79 19.79 0 0 1 .03 2.18 2 2 0 0 1 2 0h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L6.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.05 12.05 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconLoader  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const IconLock    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconLogout  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconRefresh = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>;
const IconBook    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IconRupee   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="6" y1="3" x2="18" y2="3"/><line x1="6" y1="8" x2="18" y2="8"/><line x1="6" y1="21" x2="9" y2="21"/><path d="M6 8h5a4 4 0 0 1 0 8H9l6 5"/></svg>;
const IconClipboard = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;

// ── Page states ──────────────────────────────────────────────
const State = Object.freeze({ IDLE: 'IDLE', LOADING: 'LOADING', FOUND: 'FOUND', ERROR: 'ERROR' });

// ── Helpers ──────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return iso; }
}

function calcBalance(total, paid) {
  const t = parseFloat(total) || 0;
  const p = parseFloat(paid)  || 0;
  return Math.max(0, t - p);
}

// ── Exam Form badge ──────────────────────────────────────────
function ExamFormBadge({ value }) {
  const isSubmitted = value === 'Exam Form Submitted';
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border
      ${isSubmitted
        ? 'bg-green-100 text-green-800 border-green-200'
        : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
      {isSubmitted ? '✅ Exam Form Submitted' : '⏳ Exam Form Pending'}
    </span>
  );
}

// ── Info card used inside the portal ────────────────────────
function InfoCard({ icon, title, children }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-700 flex-shrink-0">
          {icon}
        </div>
        <h3 className="font-bold text-gray-900 text-base">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide sm:w-36 flex-shrink-0">
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-900 flex-1">{value}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function StudentPortal() {
  const [pageState,  setPageState]  = useState(State.IDLE);
  const [studentId,  setStudentId]  = useState('');
  const [mobile,     setMobile]     = useState('');
  const [student,    setStudent]    = useState(null);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [errors,     setErrors]     = useState({});
  const inFlight     = useRef(false);

  // ── Validation ─────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!studentId.trim())                          e.studentId = 'Student ID आवश्यक आहे.';
    if (!mobile.trim())                             e.mobile    = 'Mobile Number आवश्यक आहे.';
    else if (!/^\d{10}$/.test(mobile.trim()))       e.mobile    = '10-digit Mobile Number टाका.';
    return e;
  };

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (inFlight.current) return;

    inFlight.current = true;
    setErrors({});
    setErrorMsg('');
    setPageState(State.LOADING);

    try {
      const data = await lookupStudent(studentId, mobile);
      setStudent(data);
      setPageState(State.FOUND);
    } catch (err) {
      if (err instanceof PortalError) {
        if (err.errorType === PortalErrorType.INVALID_CREDENTIALS) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
        }
      } else {
        setErrorMsg('An unexpected error occurred. Please try again.');
      }
      setPageState(State.ERROR);
    } finally {
      inFlight.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, mobile]);

  const handleLogout = () => {
    setPageState(State.IDLE);
    setStudent(null);
    setStudentId('');
    setMobile('');
    setErrorMsg('');
    setErrors({});
  };

  const isLoading = pageState === State.LOADING;

  // ── Input classes ──────────────────────────────────────────
  const inp = (err) =>
    `w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm bg-gray-50
     focus:outline-none focus:ring-2 focus:bg-white transition-all duration-150
     ${err ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-primary-500'}`;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero strip ── */}
      <div className="bg-hero-gradient text-white py-12 print:hidden">
        <div className="container-main text-center">
          <span className="section-label bg-white/20 text-white border-0">
            Student Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-3 mb-3 font-devanagari">
            विद्यार्थी माहिती
          </h1>
          <p className="text-blue-200 font-devanagari text-sm sm:text-base max-w-xl mx-auto">
            तुमचे Course, Fees आणि Exam Form Status येथे पाहा.
            Student ID आणि तुमचा registered Mobile Number वापरून Login करा.
          </p>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="container-main py-10">
        <div className="max-w-2xl mx-auto">

          {/* ── LOGIN FORM (IDLE / ERROR states) ── */}
          {(pageState === State.IDLE || pageState === State.ERROR) && (
            <div className="card p-6 sm:p-8">

              {/* Security notice */}
              <div className="flex items-start gap-3 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 mb-6">
                <span className="text-primary-600 flex-shrink-0 mt-0.5"><IconLock /></span>
                <p className="text-primary-800 text-sm font-devanagari">
                  हे एक secure portal आहे. फक्त तुम्हीच तुमची माहिती पाहू शकता.
                  तुमचे <strong>Student ID</strong> आणि <strong>Mobile Number</strong> टाका.
                </p>
              </div>

              <h2 className="font-bold text-gray-900 text-lg mb-5">Student Login</h2>

              {/* Error banner */}
              {pageState === State.ERROR && errorMsg && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-3" role="alert">
                  <span className="text-red-500 text-xl flex-shrink-0">⚠️</span>
                  <p className="text-red-700 text-sm font-devanagari font-semibold">{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Student ID */}
                <div className="mb-4">
                  <label htmlFor="sp-student-id" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Student ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <IconUser />
                    </div>
                    <input
                      id="sp-student-id"
                      type="text"
                      value={studentId}
                      onChange={e => setStudentId(e.target.value)}
                      placeholder="e.g. MCA-STU-001"
                      autoComplete="username"
                      autoCorrect="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      disabled={isLoading}
                      aria-describedby={errors.studentId ? 'sp-sid-err' : undefined}
                      className={inp(errors.studentId)}
                    />
                  </div>
                  {errors.studentId && (
                    <p id="sp-sid-err" className="text-xs text-red-600 mt-1 font-semibold">{errors.studentId}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1 font-devanagari">
                    तुमचे Student ID Academy ने दिलेल्या Receipt/Form वर असते.
                  </p>
                </div>

                {/* Mobile */}
                <div className="mb-6">
                  <label htmlFor="sp-mobile" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Registered Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <IconPhone />
                    </div>
                    <input
                      id="sp-mobile"
                      type="tel"
                      value={mobile}
                      onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      autoComplete="tel"
                      disabled={isLoading}
                      maxLength={10}
                      aria-describedby={errors.mobile ? 'sp-mob-err' : undefined}
                      className={inp(errors.mobile)}
                    />
                  </div>
                  {errors.mobile && (
                    <p id="sp-mob-err" className="text-xs text-red-600 mt-1 font-semibold">{errors.mobile}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1 font-devanagari">
                    Academy मध्ये Registration च्या वेळी दिलेला Mobile Number.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary btn-md w-full justify-center disabled:opacity-60"
                  aria-label="Login to Student Portal"
                >
                  {isLoading ? (
                    <><IconLoader /> Loading…</>
                  ) : (
                    '🔍 माहिती पाहा'
                  )}
                </button>
              </form>

              {/* Help */}
              <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <p className="text-gray-500 text-sm font-devanagari mb-3">
                  Student ID माहित नाही? Academy शी संपर्क करा.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <a href={callLink()} className="btn-outline btn-sm">
                    📞 Call Academy
                  </a>
                  <a
                    href={waLink(WA_MSG_GENERAL)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp btn-sm font-devanagari"
                  >
                    💬 WhatsApp करा
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ── LOADING STATE ── */}
          {pageState === State.LOADING && (
            <div className="flex flex-col items-center justify-center py-20 gap-5" role="status" aria-live="polite">
              <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                <IconLoader />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900 text-lg font-devanagari">माहिती लोड होत आहे…</p>
                <p className="text-gray-500 text-sm mt-1 font-devanagari">कृपया थांबा.</p>
              </div>
            </div>
          )}

          {/* ── FOUND STATE — Student Dashboard ── */}
          {pageState === State.FOUND && student && (
            <StudentDashboard student={student} onLogout={handleLogout} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Student Dashboard ────────────────────────────────────────
function StudentDashboard({ student, onLogout }) {
  const fullName  = [student.firstName, student.middleName, student.surname].filter(Boolean).join(' ');
  const balance   = calcBalance(student.totalFees, student.feesPaid);
  const hasFees   = student.totalFees != null;

  // Normalise courses: support both legacy single `course` string and future `courses` array (Task 7)
  const courseList = Array.isArray(student.courses) && student.courses.length > 0
    ? student.courses
    : student.course
    ? [student.course]
    : [];

  return (
    <div className="animate-fade-up space-y-5">

      {/* Profile header */}
      <div className="card p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center
                        text-primary-700 font-extrabold text-xl flex-shrink-0">
          {fullName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-extrabold text-gray-900 text-xl leading-tight">{fullName}</h2>
          <p className="text-primary-600 text-sm font-mono mt-0.5">{student.studentId}</p>
          {student.admissionDate && (
            <p className="text-gray-400 text-xs mt-0.5 font-devanagari">
              Admission: {fmtDate(student.admissionDate)}
            </p>
          )}
        </div>
        <button
          onClick={onLogout}
          className="btn-outline btn-sm flex-shrink-0 flex items-center gap-1.5"
          aria-label="Logout from Student Portal"
        >
          <IconLogout />
          Logout
        </button>
      </div>

      {/* Courses */}
      <InfoCard icon={<IconBook />} title="Enrolled Course(s)">
        {courseList.length > 0 ? (
          <ul className="space-y-2">
            {courseList.map((c, i) => (
              <li key={i} className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" aria-hidden="true" />
                {c}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm font-devanagari">कोणताही Course enrolled नाही.</p>
        )}
      </InfoCard>

      {/* Fees */}
      <InfoCard icon={<IconRupee />} title="Fees Details">
        {hasFees ? (
          <>
            <DetailRow label="Total Fees"  value={`₹ ${parseFloat(student.totalFees).toLocaleString('en-IN')}`} />
            <DetailRow label="Fees Paid"   value={`₹ ${parseFloat(student.feesPaid || 0).toLocaleString('en-IN')}`} />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide sm:w-36 flex-shrink-0">
                Pending Fees
              </span>
              <span className={`text-sm font-extrabold flex-1 ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {balance > 0 ? `₹ ${balance.toLocaleString('en-IN')}` : '✅ No Pending Fees'}
              </span>
            </div>
            {balance > 0 && (
              <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-red-700 text-sm font-devanagari">
                  तुमचे <strong>₹ {balance.toLocaleString('en-IN')}</strong> Fees pending आहेत.
                  कृपया लवकरात लवकर Academy मध्ये भरा.
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-400 text-sm font-devanagari">Fees माहिती उपलब्ध नाही.</p>
        )}
      </InfoCard>

      {/* Exam Form Status */}
      <InfoCard icon={<IconClipboard />} title="Exam Form Status">
        {student.examForm ? (
          <>
            <div className="mb-3">
              <ExamFormBadge value={student.examForm} />
            </div>
            {student.examForm === 'Exam Form Pending' && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3">
                <p className="text-yellow-800 text-sm font-devanagari">
                  तुमचा Exam Form अजून Submit झालेला नाही.
                  कृपया Academy शी संपर्क करा.
                </p>
              </div>
            )}
            {student.examForm === 'Exam Form Submitted' && (
              <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                <p className="text-green-800 text-sm font-devanagari">
                  तुमचा Exam Form यशस्वीरित्या Submit झाला आहे. 🎉
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-400 text-sm font-devanagari">Exam Form माहिती उपलब्ध नाही.</p>
        )}
      </InfoCard>

      {/* Contact CTA */}
      <div className="card p-6 text-center bg-primary-50 border-primary-100">
        <p className="text-primary-900 font-devanagari font-semibold mb-3">
          काही प्रश्न आहेत? Academy शी संपर्क करा.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={callLink()} className="btn-primary btn-md font-devanagari">
            📞 Call Academy
          </a>
          <a
            href={waLink(WA_MSG_GENERAL)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp btn-md font-devanagari"
          >
            💬 WhatsApp करा
          </a>
        </div>
      </div>

      {/* Refresh hint */}
      <div className="text-center">
        <button
          onClick={onLogout}
          className="text-gray-400 hover:text-primary-600 text-sm flex items-center gap-1.5 mx-auto transition-colors"
          aria-label="Go back to login"
        >
          <IconRefresh /> वेगळ्या Student ID ने Login करा
        </button>
      </div>
    </div>
  );
}
