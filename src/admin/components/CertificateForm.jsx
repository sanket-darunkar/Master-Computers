/**
 * CertificateForm
 * ───────────────
 * Shared form component used by AdminCertNew (create) and AdminCertEdit (update).
 *
 * Props:
 *   initialValues  — pre-fill object (for edit mode); omit for new
 *   isEdit         — boolean; hides certificateNumber field when true
 *   onSubmit(data, photoFile) — called with (validatedFields, File|null)
 *   submitting     — boolean; disables the submit button
 *   submitLabel    — button label
 *   serverError    — error string from the API to display
 *   onCancel       — called when Cancel is clicked
 *
 * Photo upload behaviour:
 *   - Accepts JPG/JPEG/PNG only, max 2 MB
 *   - Shows an instant preview after selection
 *   - On edit, shows the existing photo (from photoData base64 or studentPhotoUrl)
 *   - "Remove photo" clears the preview and sets removePhoto=true in the payload
 *   - Selecting a new file cancels any pending removal
 *   - Client-side size validation mirrors the backend 2 MB limit
 */

import React, { useState, useRef, useCallback } from 'react';

const ACCEPTED_MIME    = ['image/jpeg', 'image/png'];
const ACCEPTED_ACCEPT  = '.jpg,.jpeg,.png';
const MAX_BYTES        = 2 * 1024 * 1024; // 2 MB

const EMPTY = {
  certificateNumber : '',
  studentName       : '',
  courseName        : '',
  issueDate         : '',
  duration          : '',
  institutionName   : '',
  marks             : '',
  grade             : '',
};

// ── Tiny sub-components ───────────────────────────────────────

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

const IconUpload  = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconUser = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────

/**
 * Build a displayable preview URL from the certificate data returned by the API.
 * Priority: binary photoData > legacy studentPhotoUrl > null.
 */
function existingPhotoSrc(initialValues) {
  if (!initialValues) return null;
  if (initialValues.photoData && initialValues.photoMimeType) {
    return `data:${initialValues.photoMimeType};base64,${initialValues.photoData}`;
  }
  if (initialValues.studentPhotoUrl) {
    return initialValues.studentPhotoUrl;
  }
  return null;
}

// ── Main component ────────────────────────────────────────────

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

  // Photo state
  const [photoFile,        setPhotoFile]        = useState(null);       // new File selected
  const [previewUrl,       setPreviewUrl]        = useState(            // shown in preview box
    () => existingPhotoSrc(initialValues)
  );
  const [photoError,       setPhotoError]        = useState('');
  const [removePhoto,      setRemovePhoto]       = useState(false);     // admin pressed "Remove"

  const fileInputRef = useRef(null);

  const set = (field, value) => {
    setValues(v => ({ ...v, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  // ── Photo selection ──────────────────────────────────────────
  const handlePhotoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError('');

    // Size check
    if (file.size > MAX_BYTES) {
      setPhotoError('File is too large. Maximum size is 2 MB.');
      e.target.value = '';
      return;
    }

    // Type check
    if (!ACCEPTED_MIME.includes(file.type)) {
      setPhotoError('Invalid file type. Please select a JPG or PNG image.');
      e.target.value = '';
      return;
    }

    // Valid — build an object URL for instant preview (revoked on cleanup)
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setPhotoFile(file);
    setRemovePhoto(false); // selecting a new file cancels any pending removal
  }, [previewUrl]);

  const handleRemovePhoto = useCallback(() => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPhotoFile(null);
    setRemovePhoto(true);
    setPhotoError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [previewUrl]);

  // ── Text field validation ────────────────────────────────────
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
      errs.issueDate = 'Exam date is required.';

    if (values.duration        && values.duration.trim().length        > 100) errs.duration        = 'Max 100 characters.';
    if (values.institutionName && values.institutionName.trim().length > 255) errs.institutionName = 'Max 255 characters.';
    if (values.marks           && values.marks.trim().length           >  50) errs.marks           = 'Max 50 characters.';
    if (values.grade           && values.grade.trim().length           >  10) errs.grade           = 'Max 10 characters.';

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    // Build text payload — only non-empty optional fields
    const payload = {
      studentName     : values.studentName.trim(),
      courseName      : values.courseName.trim(),
      issueDate       : values.issueDate,
      removePhoto,
    };
    if (!isEdit) payload.certificateNumber = values.certificateNumber.trim();
    if (values.duration.trim())        payload.duration        = values.duration.trim();
    if (values.institutionName.trim()) payload.institutionName = values.institutionName.trim();
    if (values.marks.trim())           payload.marks           = values.marks.trim();
    if (values.grade.trim())           payload.grade           = values.grade.trim();

    // Pass the File (or null) as the second argument
    onSubmit(payload, photoFile);
  };

  // ── Photo preview area ───────────────────────────────────────
  const hasPhoto = Boolean(previewUrl);

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
          <Field label="Certificate Number" required hint="e.g. MCA-2024-001. Must be unique." error={errors.certificateNumber}>
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

        {/* Exam Date */}
        <Field label="Exam Date" required error={errors.issueDate}>
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

        {/* ── Student Photo Upload ── */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
            Student Photo
          </label>

          <div className="flex items-start gap-4">

            {/* Preview box */}
            <div className="flex-shrink-0 w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50
                            flex items-center justify-center overflow-hidden relative group">
              {hasPhoto ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Student photo preview"
                    className="w-full h-full object-cover"
                    onError={() => setPreviewUrl(null)}
                  />
                  {/* Remove overlay on hover */}
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                               flex items-center justify-center text-white transition-opacity
                               rounded-xl"
                    title="Remove photo"
                    aria-label="Remove student photo"
                  >
                    <IconX />
                  </button>
                </>
              ) : (
                <div className="text-gray-300 flex flex-col items-center gap-1">
                  <IconUser />
                  <span className="text-[10px] text-gray-400">No photo</span>
                </div>
              )}
            </div>

            {/* Upload controls */}
            <div className="flex-1 min-w-0">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_ACCEPT}
                onChange={handlePhotoChange}
                className="sr-only"
                id="photo-upload-input"
                aria-label="Upload student photo"
              />

              <label
                htmlFor="photo-upload-input"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200
                           bg-white text-sm font-semibold text-gray-700 cursor-pointer
                           hover:bg-gray-50 hover:border-primary-400 transition-colors"
              >
                <IconUpload />
                {hasPhoto ? 'Replace Photo' : 'Upload Photo'}
              </label>

              <p className="text-xs text-gray-400 mt-1.5">
                JPG or PNG · Max 2 MB · Recommended ~400×400 px
              </p>

              {photoFile && !photoError && (
                <p className="text-xs text-green-700 font-semibold mt-1 truncate max-w-[200px]">
                  ✓ {photoFile.name}
                </p>
              )}

              {photoError && (
                <p className="text-xs text-red-600 font-semibold mt-1" role="alert">
                  {photoError}
                </p>
              )}

              {isEdit && hasPhoto && !photoFile && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="mt-1.5 text-xs text-red-500 hover:text-red-700 font-semibold
                             underline underline-offset-2 transition-colors"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>
        </div>
        {/* ── End Student Photo ── */}

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
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Saving…
            </span>
          ) : submitLabel}
        </button>
      </div>
    </form>
  );
}
