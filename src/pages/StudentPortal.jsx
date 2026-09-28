/**
 * StudentPortal — public student self-service page.
 * Login: Student ID + registered mobile number.
 * Shows: courses, fees, exam form status.
 * API: POST /api/students/lookup (studentPortalService)
 */
import React, { useState, useRef, useCallback } from 'react';
import { lookupStudent, PortalError, PortalErrorType } from '../services/studentPortalService';
import { ACADEMY_NAME, callLink, waLink, WA_MSG_GENERAL } from '../config/siteConfig';

// ── Icons ─────────────────────────────────────────────────────
const IcoUser     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoPhone    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 10.8 19.79 19.79 0 0 1 .03 2.18 2 2 0 0 1 2 0h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L6.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.05 12.05 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IcoLoader   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const IcoLock     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IcoLogout   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcoBook     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IcoRupee    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="6" y1="3" x2="18" y2="3"/><line x1="6" y1="8" x2="18" y2="8"/><line x1="6" y1="21" x2="9" y2="21"/><path d="M6 8h5a4 4 0 0 1 0 8H9l6 5"/></svg>;
const IcoClipboard= () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>;
const IcoWA       = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.852L0 24l6.335-1.496A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.795 9.795 0 0 1-5.032-1.392l-.36-.214-3.724.879.942-3.617-.235-.372A9.777 9.777 0 0 1 2.182 12C2.182 6.579 6.579 2.182 12 2.182S21.818 6.579 21.818 12 17.421 21.818 12 21.818z"/></svg>;

// ── Page states ───────────────────────────────────────────────
const State = Object.freeze({ IDLE: 'IDLE', LOADING: 'LOADING', FOUND: 'FOUND', ERROR: 'ERROR' });

// ── Helpers ───────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }); }
  catch { return iso; }
}
function calcBalance(total, paid) {
  return Math.max(0, (parseFloat(total) || 0) - (parseFloat(paid) || 0));
}

// ── Exam Form badge ───────────────────────────────────────────
function ExamBadge({ value }) {
  const ok = value === 'Exam Form Submitted';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border
      ${ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
      <span className="text-sm leading-none">{ok ? '✅' : '⏳'}</span>
      {value || 'Exam Form Pending'}
    </span>
  );
}

// ── Dashboard info card ───────────────────────────────────────
function Card({ icon, iconBg = 'bg-primary-50', iconColor = 'text-primary-700', title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
        <div className={`w-8 h-8 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, highlight }) {
  if (value == null || value === '') return null;
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2.5
      border-b border-gray-50 last:border-0 ${highlight ? '-mx-5 px-5 bg-primary-50/50 rounded-xl' : ''}`}>
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide sm:w-32 flex-shrink-0">
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
  const inFlight = useRef(false);

  const validate = () => {
    const e = {};
    if (!studentId.trim())                      e.studentId = 'Student ID आवश्यक आहे.';
    if (!mobile.trim())                         e.mobile    = 'Mobile Number आवश्यक आहे.';
    else if (!/^\d{10}$/.test(mobile.trim()))   e.mobile    = '10-digit Mobile Number टाका.';
    return e;
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (inFlight.current) return;

    inFlight.current = true;
    setErrors({}); setErrorMsg('');
    setPageState(State.LOADING);
    try {
      const data = await lookupStudent(studentId, mobile);
      setStudent(data);
      setPageState(State.FOUND);
    } catch (err) {
      setErrorMsg(err instanceof PortalError ? err.message : 'An unexpected error occurred. Please try again.');
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

  const fieldCls = (err) =>
    `w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-white
     focus:outline-none focus:ring-2 focus:bg-white transition-all
     ${err ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-primary-500 focus:border-primary-400'}`;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <div className="bg-hero-gradient text-white py-10 sm:py-14">
        <div className="container-main">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold
                               px-3 py-1 rounded-full mb-3 uppercase tracking-wide border border-white/20">
                <IcoUser /> Student Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight font-devanagari mb-1">
                विद्यार्थी माहिती
              </h1>
              <p className="text-blue-200 text-sm font-devanagari max-w-md">
                तुमचे Course, Fees आणि Exam Form Status येथे पाहा.
              </p>
            </div>
            {/* Academy branding chip */}
            <div className="hidden sm:flex items-center gap-3 bg-white/10 border border-white/15
                            rounded-2xl px-4 py-3 backdrop-blur-sm">
              <img src="/images/master-computer-academy-logo.svg" alt={ACADEMY_NAME}
                className="h-8 w-auto object-contain bg-white rounded-lg px-1.5 py-0.5" />
              <div>
                <p className="text-white font-bold text-sm leading-tight">{ACADEMY_NAME}</p>
                <p className="text-blue-300 text-xs">Wathoda Layout, Nagpur</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="container-main py-8 sm:py-12">
        <div className="max-w-lg mx-auto">

          {/* ── LOADING ── */}
          {pageState === State.LOADING && (
            <div className="flex flex-col items-center justify-center py-24 gap-5"
              role="status" aria-live="polite">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
                <IcoLoader />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900 font-devanagari">माहिती लोड होत आहे…</p>
                <p className="text-gray-400 text-sm mt-1 font-devanagari">कृपया थांबा.</p>
              </div>
            </div>
          )}

          {/* ── LOGIN FORM (IDLE / ERROR) ── */}
          {(pageState === State.IDLE || pageState === State.ERROR) && (
            <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">

              {/* Card header */}
              <div className="bg-gradient-to-r from-primary-800 to-primary-600 px-6 py-6 text-white">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <IcoLock />
                </div>
                <h2 className="font-extrabold text-lg leading-tight">Student Login</h2>
                <p className="text-blue-200 text-sm font-devanagari mt-1">
                  Student ID आणि registered Mobile Number टाका.
                </p>
              </div>

              {/* Form body */}
              <div className="px-6 py-6">

                {/* Error alert */}
                {pageState === State.ERROR && errorMsg && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl
                                  px-4 py-3 mb-5" role="alert">
                    <span className="text-red-500 text-lg flex-shrink-0 leading-none">⚠️</span>
                    <p className="text-red-700 text-sm font-devanagari font-semibold leading-snug">{errorMsg}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-4">

                  {/* Student ID */}
                  <div>
                    <label htmlFor="sp-sid" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Student ID <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <IcoUser />
                      </div>
                      <input
                        id="sp-sid"
                        type="text"
                        value={studentId}
                        onChange={e => setStudentId(e.target.value)}
                        placeholder="e.g. MCA-STU-001"
                        autoComplete="username"
                        autoCorrect="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        disabled={isLoading}
                        aria-describedby={errors.studentId ? 'sp-sid-err' : 'sp-sid-hint'}
                        className={fieldCls(errors.studentId)}
                      />
                    </div>
                    {errors.studentId
                      ? <p id="sp-sid-err" className="text-xs text-red-600 mt-1 font-semibold">{errors.studentId}</p>
                      : <p id="sp-sid-hint" className="text-xs text-gray-400 mt-1 font-devanagari">Academy ने दिलेले Student ID</p>
                    }
                  </div>

                  {/* Mobile */}
                  <div>
                    <label htmlFor="sp-mobile" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <IcoPhone />
                      </div>
                      <input
                        id="sp-mobile"
                        type="tel"
                        inputMode="numeric"
                        value={mobile}
                        onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        autoComplete="tel"
                        disabled={isLoading}
                        maxLength={10}
                        aria-describedby={errors.mobile ? 'sp-mob-err' : 'sp-mob-hint'}
                        className={fieldCls(errors.mobile)}
                      />
                    </div>
                    {errors.mobile
                      ? <p id="sp-mob-err" className="text-xs text-red-600 mt-1 font-semibold">{errors.mobile}</p>
                      : <p id="sp-mob-hint" className="text-xs text-gray-400 mt-1 font-devanagari">Registration च्या वेळी दिलेला Mobile Number</p>
                    }
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl
                               bg-primary-700 text-white font-bold text-sm
                               hover:bg-primary-800 active:bg-primary-900 transition-colors
                               disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                  >
                    {isLoading ? <><IcoLoader /> Loading…</> : '🔍 माहिती पाहा'}
                  </button>
                </form>

                {/* Help */}
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-center text-gray-400 text-xs font-devanagari mb-3">
                    Student ID माहित नाही? Academy शी संपर्क करा.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <a href={callLink()}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                                 border border-gray-200 text-gray-700 text-xs font-semibold
                                 hover:bg-gray-50 transition-colors">
                      📞 Call
                    </a>
                    <a href={waLink(WA_MSG_GENERAL)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                                 bg-[#25D366] text-white text-xs font-bold
                                 hover:bg-[#1ebe5c] transition-colors">
                      <IcoWA /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── DASHBOARD ── */}
          {pageState === State.FOUND && student && (
            <StudentDashboard student={student} onLogout={handleLogout} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Student Dashboard ─────────────────────────────────────────
function StudentDashboard({ student, onLogout }) {
  const fullName  = [student.firstName, student.middleName, student.surname].filter(Boolean).join(' ');
  const balance   = calcBalance(student.totalFees, student.feesPaid);
  const hasFees   = student.totalFees != null;
  const [imgErr,  setImgErr] = useState(false);

  // Photo: 3-field priority matching admin logic
  const photoSrc = !imgErr && (
    student.photoData && student.photoMimeType
      ? `data:${student.photoMimeType};base64,${student.photoData}`
      : student.studentPhotoUrl || null
  );

  // Normalise courses — array preferred, fallback to legacy single string
  const courseList = Array.isArray(student.courses) && student.courses.length > 0
    ? student.courses
    : student.course ? [student.course] : [];

  return (
    <div className="space-y-4">

      {/* ── Profile header card ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Gradient strip */}
        <div className="h-2 bg-gradient-to-r from-primary-700 to-primary-500" aria-hidden="true" />
        <div className="flex items-center gap-4 px-5 py-5">
          {/* Photo or initial avatar */}
          {photoSrc ? (
            <img
              src={photoSrc}
              alt={fullName}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-primary-100 flex-shrink-0 shadow-sm"
              onError={() => setImgErr(true)}
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800
                            flex items-center justify-center text-white font-extrabold text-xl
                            flex-shrink-0 shadow-sm">
              {fullName.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="font-extrabold text-gray-900 text-lg leading-tight truncate">{fullName}</h2>
            <p className="text-primary-600 text-xs font-mono font-bold mt-0.5">{student.studentId}</p>
            {student.admissionDate && (
              <p className="text-gray-400 text-xs mt-0.5 font-devanagari">
                Admitted: {fmtDate(student.admissionDate)}
              </p>
            )}
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200
                       text-gray-500 text-xs font-semibold hover:bg-gray-50 hover:text-gray-700
                       transition-colors flex-shrink-0"
            aria-label="Logout"
          >
            <IcoLogout /> Logout
          </button>
        </div>
      </div>

      {/* ── Enrolled courses ── */}
      <Card icon={<IcoBook />} title="Enrolled Course(s)">
        {courseList.length > 0 ? (
          <ul className="space-y-3">
            {courseList.map((c, i) => {
              const status = (student.courseExamStatuses && student.courseExamStatuses[c] !== undefined)
                ? student.courseExamStatuses[c]
                : student.examForm || 'Exam Form Pending';
              return (
                <li key={i} className="flex items-center justify-between gap-3 flex-wrap
                                       py-2 border-b border-gray-50 last:border-0">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" aria-hidden="true" />
                    {c}
                  </span>
                  <ExamBadge value={status} />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm font-devanagari py-2">कोणताही Course enrolled नाही.</p>
        )}
      </Card>

      {/* ── Fees details ── */}
      <Card icon={<IcoRupee />} iconBg="bg-emerald-50" iconColor="text-emerald-700" title="Fees Details">
        {hasFees ? (
          <div>
            <DetailRow label="Total Fees" value={`₹ ${parseFloat(student.totalFees).toLocaleString('en-IN')}`} />
            <DetailRow label="Fees Paid"  value={`₹ ${parseFloat(student.feesPaid || 0).toLocaleString('en-IN')}`} />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide sm:w-32 flex-shrink-0">
                Pending
              </span>
              <span className={`text-sm font-extrabold ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {balance > 0
                  ? `₹ ${balance.toLocaleString('en-IN')}`
                  : '✅ No Pending Fees'}
              </span>
            </div>
            {balance > 0 && (
              <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-red-700 text-xs font-devanagari">
                  तुमचे <strong>₹ {balance.toLocaleString('en-IN')}</strong> Fees pending आहेत.
                  कृपया लवकरात लवकर Academy मध्ये भरा.
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-sm font-devanagari py-2">Fees माहिती उपलब्ध नाही.</p>
        )}
      </Card>

      {/* ── Exam form status ── */}
      <Card icon={<IcoClipboard />} iconBg="bg-amber-50" iconColor="text-amber-700" title="Exam Form Status">
        {student.courseExamStatuses && Object.keys(student.courseExamStatuses).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(student.courseExamStatuses).map(([course, status]) => (
              <div key={course} className="py-2 border-b border-gray-50 last:border-0">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{course}</p>
                <ExamBadge value={status} />
                <p className={`text-xs mt-1.5 font-devanagari ${status === 'Exam Form Submitted' ? 'text-green-600' : 'text-amber-600'}`}>
                  {status === 'Exam Form Submitted'
                    ? 'यशस्वीरित्या Submit झाला आहे. 🎉'
                    : 'अजून Submit झालेला नाही. Academy शी संपर्क करा.'}
                </p>
              </div>
            ))}
          </div>
        ) : student.examForm ? (
          <div>
            <ExamBadge value={student.examForm} />
            <p className={`text-xs mt-2 font-devanagari ${student.examForm === 'Exam Form Submitted' ? 'text-green-600' : 'text-amber-600'}`}>
              {student.examForm === 'Exam Form Submitted'
                ? 'तुमचा Exam Form यशस्वीरित्या Submit झाला आहे. 🎉'
                : 'तुमचा Exam Form अजून Submit झालेला नाही. Academy शी संपर्क करा.'}
            </p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm font-devanagari py-2">Exam Form माहिती उपलब्ध नाही.</p>
        )}
      </Card>

      {/* ── Contact CTA ── */}
      <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 text-center">
        <p className="text-primary-900 font-bold text-sm font-devanagari mb-3">
          काही प्रश्न आहेत? Academy शी संपर्क करा.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <a href={callLink()}
            className="flex items-center justify-center gap-2 py-3 rounded-xl
                       bg-primary-700 text-white text-sm font-bold hover:bg-primary-800 transition-colors">
            📞 Call Now
          </a>
          <a href={waLink(WA_MSG_GENERAL)} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 rounded-xl
                       bg-[#25D366] text-white text-sm font-bold hover:bg-[#1ebe5c] transition-colors font-devanagari">
            <IcoWA /> WhatsApp
          </a>
        </div>
      </div>

      {/* ── Switch account ── */}
      <div className="text-center pb-2">
        <button
          onClick={onLogout}
          className="text-gray-400 hover:text-primary-600 text-xs font-semibold transition-colors"
        >
          ↩ वेगळ्या Student ID ने Login करा
        </button>
      </div>
    </div>
  );
}
