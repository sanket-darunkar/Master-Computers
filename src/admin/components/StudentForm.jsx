/**
 * StudentForm
 * ───────────
 * Shared form for Add Student (isEdit=false) and Edit Student (isEdit=true).
 * Organized into 6 sections matching the admission form layout.
 *
 * Props:
 *   initialValues  — pre-fill for edit mode
 *   isEdit         — hides studentId field when true
 *   onSubmit(data, photoFile) — called with validated fields + File|null
 *   submitting     — disables submit button
 *   submitLabel
 *   serverError
 *   onCancel
 */
import React, { useRef, useState } from 'react';
import { COURSES } from '../../config/siteConfig';

const COURSE_OPTIONS = COURSES.map(c => c.name);

const GENDERS   = ['Male', 'Female', 'Other'];
const MARITAL   = ['Single', 'Married', 'Divorced', 'Widowed'];
const CATS      = ['General', 'OBC', 'SC', 'ST', 'NT', 'SBC', 'EWS', 'Other'];
const QUALS     = ['Below SSC', 'SSC (10th)', 'HSC (12th)', 'ITI', 'Diploma', 'Graduate', 'Post Graduate', 'Other'];
const BATCHES   = ['Morning 7–9', 'Morning 9–11', 'Afternoon 12–2', 'Afternoon 2–4', 'Evening 4–6', 'Evening 6–8', 'Flexible'];
const STATUSES  = ['ACTIVE', 'INACTIVE', 'COMPLETED', 'DROPPED'];

const EMPTY = {
  studentId: '', firstName: '', middleName: '', surname: '',
  applicantName: '', motherName: '',
  dateOfBirth: '', gender: '', maritalStatus: '', aadhaarNumber: '',
  ownMobile: '', otherMobile: '',
  houseNo: '', street: '', city: '', tahsil: '', district: '', pinCode: '',
  qualification: '', category: '',
  course: '', admissionDate: '', courseDuration: '', batchTime: '',
  totalFees: '', feesPaid: '', receiptNumber: '', receiptDate: '',
  status: 'ACTIVE', notes: '',
};

// ── Helpers ───────────────────────────────────────────────────
function calcAge(dob) {
  if (!dob) return '';
  const diff = Date.now() - new Date(dob).getTime();
  const age  = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  return age > 0 && age < 120 ? String(age) : '';
}

function calcBalance(total, paid) {
  const t = parseFloat(total) || 0;
  const p = parseFloat(paid)  || 0;
  return t - p;
}

// ── Sub-components ────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <div className="col-span-full border-b border-primary-100 pb-2 mb-1">
      <h3 className="text-xs font-extrabold text-primary-700 uppercase tracking-widest">{children}</h3>
    </div>
  );
}

function Field({ label, required, hint, error, className = '', children }) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint  && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1 font-semibold">{error}</p>}
    </div>
  );
}

const inp = (err) =>
  `w-full px-3 py-2 rounded-xl border text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:bg-white transition-all
   ${err ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-primary-500'}`;

const sel = (err) =>
  `w-full px-3 py-2 rounded-xl border text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:bg-white transition-all cursor-pointer
   ${err ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-primary-500'}`;

// ── Main component ────────────────────────────────────────────
export default function StudentForm({
  initialValues, isEdit = false,
  onSubmit, submitting = false,
  submitLabel = 'Save', serverError = '', onCancel,
}) {
  const [v, setV]         = useState({ ...EMPTY, ...initialValues });
  const [errs, setErrs]   = useState({});
  const [photo, setPhoto] = useState(null);          // File object
  const [preview, setPrev] = useState(initialValues?.studentPhotoUrl || '');
  const fileRef           = useRef(null);

  const set = (field, value) => {
    setV(prev => ({ ...prev, [field]: value }));
    setErrs(e => ({ ...e, [field]: '' }));
  };

  // ── Photo handler ──────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setErrs(e => ({ ...e, photo: 'JPG or PNG only.' })); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrs(e => ({ ...e, photo: 'Max file size is 2 MB.' })); return;
    }
    setErrs(e => ({ ...e, photo: '' }));
    setPhoto(file);
    setPrev(URL.createObjectURL(file));
  };

  // ── Validation ─────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!isEdit && !v.studentId.trim())  e.studentId  = 'Student ID is required.';
    if (!v.firstName.trim())             e.firstName  = 'First name is required.';
    if (!v.surname.trim())               e.surname    = 'Surname is required.';
    if (!v.ownMobile.trim())             e.ownMobile  = 'Mobile number is required.';
    if (v.ownMobile.trim() && !/^\d{10}$/.test(v.ownMobile.trim()))
                                         e.ownMobile  = 'Enter a valid 10-digit mobile number.';
    if (!v.course)                       e.course     = 'Please select a course.';
    if (!v.admissionDate)                e.admissionDate = 'Admission date is required.';
    if (v.aadhaarNumber && !/^\d{12}$/.test(v.aadhaarNumber.replace(/\s/g, '')))
                                         e.aadhaarNumber = 'Aadhaar must be 12 digits.';
    if (v.pinCode && !/^\d{6}$/.test(v.pinCode.trim()))
                                         e.pinCode    = 'PIN code must be 6 digits.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrs(errs); return; }

    const payload = { ...v };
    if (!isEdit) payload.studentId = v.studentId.trim();
    // Computed/display-only — don't send to backend
    delete payload.balanceAmount;

    // Normalize empty strings to null for optional fields
    Object.keys(payload).forEach(k => {
      if (payload[k] === '') payload[k] = null;
    });

    onSubmit(payload, photo);
  };

  const age     = calcAge(v.dateOfBirth);
  const balance = calcBalance(v.totalFees, v.feesPaid);

  return (
    <form onSubmit={handleSubmit} noValidate>

      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5 font-semibold" role="alert">
          {serverError}
        </div>
      )}

      {/* ── PERSONAL DETAILS ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4 mb-6">
        <SectionTitle>Personal Details</SectionTitle>

        {!isEdit && (
          <Field label="Student ID" required error={errs.studentId} hint="Unique ID e.g. MCA-STU-001">
            <input type="text" value={v.studentId} onChange={e => set('studentId', e.target.value)}
              className={inp(errs.studentId)} placeholder="MCA-STU-001" autoComplete="off" />
          </Field>
        )}

        <Field label="First Name" required error={errs.firstName}>
          <input type="text" value={v.firstName} onChange={e => set('firstName', e.target.value)} className={inp(errs.firstName)} placeholder="First name" />
        </Field>
        <Field label="Middle Name" error={errs.middleName}>
          <input type="text" value={v.middleName} onChange={e => set('middleName', e.target.value)} className={inp(errs.middleName)} placeholder="Middle name" />
        </Field>
        <Field label="Surname" required error={errs.surname}>
          <input type="text" value={v.surname} onChange={e => set('surname', e.target.value)} className={inp(errs.surname)} placeholder="Surname" />
        </Field>
        <Field label="Applicant Name (as in docs)" error={errs.applicantName}>
          <input type="text" value={v.applicantName} onChange={e => set('applicantName', e.target.value)} className={inp(errs.applicantName)} placeholder="Full name as in documents" />
        </Field>
        <Field label="Mother's Name" error={errs.motherName}>
          <input type="text" value={v.motherName} onChange={e => set('motherName', e.target.value)} className={inp(errs.motherName)} placeholder="Mother's name" />
        </Field>
        <Field label="Date of Birth" error={errs.dateOfBirth}>
          <input type="date" value={v.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} className={inp(errs.dateOfBirth)} />
        </Field>
        <Field label="Age" hint="Auto-calculated from DOB">
          <input type="text" value={age} readOnly className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-100 text-gray-600 cursor-not-allowed" />
        </Field>
        <Field label="Gender" error={errs.gender}>
          <select value={v.gender} onChange={e => set('gender', e.target.value)} className={sel(errs.gender)}>
            <option value="">Select gender</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Marital Status" error={errs.maritalStatus}>
          <select value={v.maritalStatus} onChange={e => set('maritalStatus', e.target.value)} className={sel(errs.maritalStatus)}>
            <option value="">Select status</option>
            {MARITAL.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Aadhaar Number" error={errs.aadhaarNumber} hint="12 digits">
          <input type="text" value={v.aadhaarNumber} onChange={e => set('aadhaarNumber', e.target.value.replace(/\D/g, '').slice(0, 12))}
            className={inp(errs.aadhaarNumber)} placeholder="xxxx xxxx xxxx" maxLength={12} />
        </Field>

        {/* Photo upload */}
        <Field label="Student Photo" error={errs.photo} hint="JPG or PNG, max 2 MB" className="sm:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-16 h-20 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
              {preview
                ? <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              }
            </div>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                {preview ? 'Change Photo' : 'Upload Photo'}
              </button>
              {preview && (
                <button type="button" onClick={() => { setPhoto(null); setPrev(''); if (fileRef.current) fileRef.current.value = ''; }}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  Remove
                </button>
              )}
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png" onChange={handlePhotoChange} className="hidden" />
            </div>
          </div>
        </Field>
      </div>

      {/* ── CONTACT ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 mb-6">
        <SectionTitle>Contact</SectionTitle>
        <Field label="Own Mobile" required error={errs.ownMobile} hint="10-digit number">
          <input type="tel" value={v.ownMobile} onChange={e => set('ownMobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
            className={inp(errs.ownMobile)} placeholder="9876543210" maxLength={10} />
        </Field>
        <Field label="Other Mobile / WhatsApp" error={errs.otherMobile}>
          <input type="tel" value={v.otherMobile} onChange={e => set('otherMobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
            className={inp(errs.otherMobile)} placeholder="9876543210" maxLength={10} />
        </Field>
      </div>

      {/* ── ADDRESS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4 mb-6">
        <SectionTitle>Address</SectionTitle>
        <Field label="House / Building No." error={errs.houseNo}>
          <input type="text" value={v.houseNo} onChange={e => set('houseNo', e.target.value)} className={inp(errs.houseNo)} placeholder="Flat/House No." />
        </Field>
        <Field label="Street / Colony" error={errs.street} className="sm:col-span-2 lg:col-span-2">
          <input type="text" value={v.street} onChange={e => set('street', e.target.value)} className={inp(errs.street)} placeholder="Street or colony name" />
        </Field>
        <Field label="City / Village / Suburb" error={errs.city}>
          <input type="text" value={v.city} onChange={e => set('city', e.target.value)} className={inp(errs.city)} placeholder="City or village" />
        </Field>
        <Field label="Tahsil / Block" error={errs.tahsil}>
          <input type="text" value={v.tahsil} onChange={e => set('tahsil', e.target.value)} className={inp(errs.tahsil)} placeholder="Tahsil" />
        </Field>
        <Field label="District" error={errs.district}>
          <input type="text" value={v.district} onChange={e => set('district', e.target.value)} className={inp(errs.district)} placeholder="District" />
        </Field>
        <Field label="PIN Code" error={errs.pinCode} hint="6 digits">
          <input type="text" value={v.pinCode} onChange={e => set('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
            className={inp(errs.pinCode)} placeholder="440034" maxLength={6} />
        </Field>
      </div>

      {/* ── EDUCATION ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 mb-6">
        <SectionTitle>Education</SectionTitle>
        <Field label="Educational Qualification" error={errs.qualification}>
          <select value={v.qualification} onChange={e => set('qualification', e.target.value)} className={sel(errs.qualification)}>
            <option value="">Select qualification</option>
            {QUALS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
        </Field>
        <Field label="Cast / Category" error={errs.category}>
          <select value={v.category} onChange={e => set('category', e.target.value)} className={sel(errs.category)}>
            <option value="">Select category</option>
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      {/* ── ADMISSION ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 mb-6">
        <SectionTitle>Admission Details</SectionTitle>
        <Field label="Course" required error={errs.course}>
          <select value={v.course} onChange={e => set('course', e.target.value)} className={sel(errs.course)}>
            <option value="">Select course</option>
            {COURSE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Admission Date" required error={errs.admissionDate}>
          <input type="date" value={v.admissionDate} onChange={e => set('admissionDate', e.target.value)} className={inp(errs.admissionDate)} />
        </Field>
        <Field label="Course Duration" error={errs.courseDuration} hint="e.g. 3 Months">
          <input type="text" value={v.courseDuration} onChange={e => set('courseDuration', e.target.value)} className={inp(errs.courseDuration)} placeholder="3 Months" />
        </Field>
        <Field label="Batch Time" error={errs.batchTime}>
          <select value={v.batchTime} onChange={e => set('batchTime', e.target.value)} className={sel(errs.batchTime)}>
            <option value="">Select batch time</option>
            {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
        {isEdit && (
          <Field label="Status" error={errs.status}>
            <select value={v.status} onChange={e => set('status', e.target.value)} className={sel(errs.status)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        )}
      </div>

      {/* ── FEES ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4 mb-6">
        <SectionTitle>Fees</SectionTitle>
        <Field label="Total Course Fees (₹)" error={errs.totalFees}>
          <input type="number" min="0" step="1" value={v.totalFees}
            onChange={e => set('totalFees', e.target.value)} className={inp(errs.totalFees)} placeholder="0" />
        </Field>
        <Field label="Fees Paid (₹)" error={errs.feesPaid}>
          <input type="number" min="0" step="1" value={v.feesPaid}
            onChange={e => set('feesPaid', e.target.value)} className={inp(errs.feesPaid)} placeholder="0" />
        </Field>
        <Field label="Balance Amount (₹)" hint="Auto-calculated">
          <input type="text" value={v.totalFees || v.feesPaid ? `₹ ${balance.toFixed(0)}` : ''}
            readOnly className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-100 text-gray-700 font-semibold cursor-not-allowed" />
        </Field>
        <Field label="Receipt Number" error={errs.receiptNumber}>
          <input type="text" value={v.receiptNumber} onChange={e => set('receiptNumber', e.target.value)} className={inp(errs.receiptNumber)} placeholder="RCP-001" />
        </Field>
        <Field label="Receipt Date" error={errs.receiptDate}>
          <input type="date" value={v.receiptDate} onChange={e => set('receiptDate', e.target.value)} className={inp(errs.receiptDate)} />
        </Field>
      </div>

      {/* ── NOTES ──────────────────────────────────────────── */}
      <div className="mb-6">
        <Field label="Notes (optional)" error={errs.notes}>
          <textarea value={v.notes || ''} onChange={e => set('notes', e.target.value)}
            rows={2} className={`${inp(errs.notes)} resize-none`} placeholder="Any additional notes…" />
        </Field>
      </div>

      {/* ── Actions ────────────────────────────────────────── */}
      <div className="flex gap-3 justify-end pt-5 border-t border-gray-100">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={submitting}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors">
            Cancel
          </button>
        )}
        <button type="submit" disabled={submitting} className="btn-primary btn-md text-sm disabled:opacity-60">
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Saving…
            </span>
          ) : submitLabel}
        </button>
      </div>
    </form>
  );
}
