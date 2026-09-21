/**
 * CertificateForm
 * ───────────────
 * Shared form component used by both AdminCertNew (create) and
 * AdminCertEdit (update).
 *
 * Props:
 *   initialValues  — pre-fill object (for edit mode); omit for new
 *   isEdit         — boolean; hides certificateNumber field when true
 *   onSubmit(data) — called with validated form data
 *   submitting     — boolean; disables the submit button
 *   submitLabel    — button label ('Add Certificate' or 'Save Changes')
 *   serverError    — error string from the API to display
 *   onCancel       — called when Cancel is clicked
 *
 * Field names match the backend DTOs exactly:
 *   CreateCertificateRequest  (all fields below)
 *   UpdateCertificateRequest  (same minus certificateNumber)
 */

import React, { useState } from 'react';

const EMPTY = {
  certificateNumber : '',
  studentName       : '',
  studentPhotoUrl   : '',
  courseName        : '',
  issueDate         : '',
  duration          : '',
  institutionName   : '',
  marks             : '',
  grade             : '',
};

function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint  && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1 font-semibold">{error}</p>}
    </div>
  );
}

const inputCls = (err) =>
  `w-full px-3.5 py-2.5 rounded-xl border text-sm bg-gray-50
   focus:outline-none focus:ring-2 focus:bg-white transition-all
   ${err
     ? 'border-red-300 focus:ring-red-400'
     : 'border-gray-200 focus:ring-primary-500 focus:border-primary-400'}`;

export default function CertificateForm({
  initialValues,
  isEdit       = false,
  onSubmit,
  submitting   = false,
  submitLabel  = 'Save',
  serverError  = '',
  onCancel,
}) {
  const [values, setValues] = useState({ ...EMPTY, ...initialValues });
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setValues(v => ({ ...v, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  // ── Validation ──────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!isEdit && !values.certificateNumber.trim())
      errs.certificateNumber = 'Certificate number is required.';
    if (!isEdit && values.certificateNumber.trim().length > 100)
      errs.certificateNumber = 'Max 100 characters.';

    if (!values.studentName.trim())
      errs.studentName = 'Student name is required.';
    if (values.studentName.trim().length > 255)
      errs.studentName = 'Max 255 characters.';

    if (!values.courseName.trim())
      errs.courseName = 'Course name is required.';
    if (values.courseName.trim().length > 255)
      errs.courseName = 'Max 255 characters.';

    if (!values.issueDate)
      errs.issueDate = 'Issue date is required.';

    if (values.studentPhotoUrl && values.studentPhotoUrl.trim().length > 1024)
      errs.studentPhotoUrl = 'URL too long (max 1024 characters).';
    if (values.duration && values.duration.trim().length > 100)
      errs.duration = 'Max 100 characters.';
    if (values.institutionName && values.institutionName.trim().length > 255)
      errs.institutionName = 'Max 255 characters.';
    if (values.marks && values.marks.trim().length > 50)
      errs.marks = 'Max 50 characters.';
    if (values.grade && values.grade.trim().length > 10)
      errs.grade = 'Max 10 characters.';

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    // Build payload — only include non-empty optional fields
    const payload = {
      studentName    : values.studentName.trim(),
      courseName     : values.courseName.trim(),
      issueDate      : values.issueDate,   // YYYY-MM-DD — matches LocalDate
    };
    if (!isEdit) payload.certificateNumber = values.certificateNumber.trim();
    if (values.studentPhotoUrl.trim())  payload.studentPhotoUrl  = values.studentPhotoUrl.trim();
    if (values.duration.trim())         payload.duration         = values.duration.trim();
    if (values.institutionName.trim())  payload.institutionName  = values.institutionName.trim();
    if (values.marks.trim())            payload.marks            = values.marks.trim();
    if (values.grade.trim())            payload.grade            = values.grade.trim();

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>

      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5 font-semibold" role="alert">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Certificate Number (create only) */}
        {!isEdit && (
          <Field
            label="Certificate Number"
            required
            hint="e.g. MCA-2024-001. Must be unique."
            error={errors.certificateNumber}
          >
            <input
              type="text"
              value={values.certificateNumber}
              onChange={e => set('certificateNumber', e.target.value)}
              placeholder="MCA-2024-001"
              className={inputCls(errors.certificateNumber)}
              autoComplete="off"
              autoCapitalize="characters"
            />
          </Field>
        )}

        {/* Student Name */}
        <Field label="Student Name" required error={errors.studentName}>
          <input
            type="text"
            value={values.studentName}
            onChange={e => set('studentName', e.target.value)}
            placeholder="Full name"
            className={inputCls(errors.studentName)}
          />
        </Field>

        {/* Course Name */}
        <Field label="Course Name" required error={errors.courseName}>
          <input
            type="text"
            value={values.courseName}
            onChange={e => set('courseName', e.target.value)}
            placeholder="e.g. MS-CIT"
            className={inputCls(errors.courseName)}
          />
        </Field>

        {/* Issue Date */}
        <Field label="Issue Date" required error={errors.issueDate}>
          <input
            type="date"
            value={values.issueDate}
            onChange={e => set('issueDate', e.target.value)}
            className={inputCls(errors.issueDate)}
          />
        </Field>

        {/* Institution Name */}
        <Field label="Institution Name" error={errors.institutionName}>
          <input
            type="text"
            value={values.institutionName}
            onChange={e => set('institutionName', e.target.value)}
            placeholder="Master Computer Academy"
            className={inputCls(errors.institutionName)}
          />
        </Field>

        {/* Duration */}
        <Field label="Duration" hint="e.g. 3 Months" error={errors.duration}>
          <input
            type="text"
            value={values.duration}
            onChange={e => set('duration', e.target.value)}
            placeholder="3 Months"
            className={inputCls(errors.duration)}
          />
        </Field>

        {/* Marks */}
        <Field label="Marks" hint="e.g. 85/100 or 85%" error={errors.marks}>
          <input
            type="text"
            value={values.marks}
            onChange={e => set('marks', e.target.value)}
            placeholder="85%"
            className={inputCls(errors.marks)}
          />
        </Field>

        {/* Grade */}
        <Field label="Grade" hint="e.g. A, B+, Distinction" error={errors.grade}>
          <input
            type="text"
            value={values.grade}
            onChange={e => set('grade', e.target.value)}
            placeholder="A"
            className={inputCls(errors.grade)}
          />
        </Field>

        {/* Student Photo URL */}
        <div className="sm:col-span-2">
          <Field
            label="Student Photo URL"
            hint="Paste a publicly accessible image URL. Photo upload is managed separately."
            error={errors.studentPhotoUrl}
          >
            <input
              type="url"
              value={values.studentPhotoUrl}
              onChange={e => set('studentPhotoUrl', e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className={inputCls(errors.studentPhotoUrl)}
            />
          </Field>
        </div>

      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end mt-6 pt-5 border-t border-gray-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700
                       hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary btn-md text-sm disabled:opacity-60"
        >
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
