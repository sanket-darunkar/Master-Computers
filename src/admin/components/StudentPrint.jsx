/**
 * StudentPrint
 * ────────────
 * Renders a 2-page A4 print document matching the MCA admission/exam form PDF exactly.
 *
 * Page 1 — Application Form  (fees installment table at bottom)
 * Page 2 — Exam Form         (Reg No + ALC header, no fees table, FOR OFFICE USE ONLY)
 *
 * ROOT CAUSE NOTE:
 *   Using inline style={{ display:'none' }} — NOT className="hidden".
 *   Tailwind `hidden` = display:none !important which @media print cannot override.
 *   Inline style has no !important so @media print can override it correctly.
 *
 *   Rendered via React Portal directly into document.body so it is a direct body
 *   child — the @media print rule `body > #student-print-doc { display:block !important }`
 *   shows it while `body > * { display:none !important }` hides everything else
 *   (including #root / the full admin app).
 */
import React from 'react';
import { createPortal } from 'react-dom';

// ── Utilities ─────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch { return iso; }
}

/** Coerce falsy to empty string for display */
const v = (val) => val ?? '';

/** Resolve photo src: binary upload > URL > null */
function photoSrc(s) {
  if (s.photoData && s.photoMimeType) return `data:${s.photoMimeType};base64,${s.photoData}`;
  if (s.studentPhotoUrl) return s.studentPhotoUrl;
  return null;
}

/** Auto-calculate age from DOB ISO string */
function calcAge(dob) {
  if (!dob) return '';
  const diff = Date.now() - new Date(dob).getTime();
  const a = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  return a > 0 && a < 120 ? String(a) : '';
}

// ── Style constants (mirrors the PDF exactly) ─────────────────
const OUTER_BORDER  = { border: '1.5px solid #222' };
const INNER_BORDER  = { border: '1px solid #999' };
const LABEL_STYLE   = { fontSize: '6.5pt', color: '#444', fontWeight: 600, lineHeight: 1.2 };
const VALUE_STYLE   = { fontWeight: 700, fontSize: '8.5pt', color: '#111', minHeight: 13, lineHeight: 1.3 };
const CELL_PAD      = { padding: '2px 5px' };
const UNDERLINE_VAL = { borderBottom: '1px solid #888', display: 'inline-block', minWidth: 200 };

// ── FormPage ──────────────────────────────────────────────────
function FormPage({ student: s, isExam }) {
  const fullName  = [s.firstName, s.middleName, s.surname].filter(Boolean).join(' ');
  const age       = calcAge(s.dateOfBirth);
  const balance   = (parseFloat(s.totalFees) || 0) - (parseFloat(s.feesPaid) || 0);
  const photo     = photoSrc(s);
  const courseStr = Array.isArray(s.courses) && s.courses.length > 0
    ? s.courses.join(', ')
    : v(s.course);

  return (
    <div className="print-page">

      {/* ══════════════════════════════════════════════════
          HEADER — logo row
      ══════════════════════════════════════════════════ */}
      <table width="100%" style={{ borderCollapse: 'collapse', marginBottom: 3 }}>
        <tbody>
          <tr>
            {/* Left: black square + authorized text */}
            <td width="25%" style={{ verticalAlign: 'top', paddingRight: 4 }}>
              {isExam && (
                <div style={{ fontSize: '6pt', fontWeight: 700, marginBottom: 2 }}>
                  Reg No- IN8308A
                </div>
              )}
              <div style={{ background: '#000', width: 14, height: 14, marginBottom: 3 }} />
              <div style={{ color: '#1565c0', fontWeight: 700, fontSize: '7pt', lineHeight: 1.3 }}>
                Authorized Training Center
              </div>
              <div style={{ fontSize: '6pt', fontWeight: 600, lineHeight: 1.3 }}>
                ISO Certified Institute 9001:2015
              </div>
            </td>

            {/* Centre: logo + address */}
            <td width="50%" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
              <img
                src="/images/master-computer-academy-logo.svg"
                alt="Master Computer Academy"
                style={{ height: 48, display: 'block', margin: '0 auto 3px' }}
              />
              <div style={{ fontSize: '6.5pt', fontWeight: 600 }}>
                18 Lok Kalyan Society, Wathoda Layout Nagpur (9156348591)
              </div>
            </td>

            {/* Right: ALC code (exam only) + Student ID box + colour squares */}
            <td width="25%" style={{ textAlign: 'right', verticalAlign: 'top' }}>
              {isExam && (
                <div style={{ fontSize: '6pt', fontWeight: 700, textAlign: 'right', marginBottom: 2 }}>
                  ALC -14210808
                </div>
              )}
              <div style={{ fontWeight: 700, fontSize: '7pt', marginBottom: 2 }}>
                Student ID No{isExam ? ':' : ''}
              </div>
              <div style={{
                border: '1.5px solid #222',
                minHeight: 18,
                padding: '2px 5px',
                fontWeight: 700,
                fontSize: '9pt',
                marginBottom: 3,
              }}>
                {v(s.studentId)}
              </div>
              <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
                {['#333', '#888', '#ccc'].map((c, i) => (
                  <div key={i} style={{ width: 14, height: 14, background: c }} />
                ))}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ══════════════════════════════════════════════════
          TITLE BAR
      ══════════════════════════════════════════════════ */}
      <div style={{
        background: '#222',
        color: '#fff',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '11pt',
        padding: '4px 0',
        letterSpacing: '0.3px',
        marginBottom: 3,
      }}>
        {isExam ? 'Exam Form' : 'Application Form'}
      </div>

      {/* Instructions row */}
      <table width="100%" style={{ borderCollapse: 'collapse', marginBottom: 3 }}>
        <tbody>
          <tr>
            <td style={{ fontSize: '6.5pt', fontWeight: 600 }}>
              Please fill in the form in English and CAPITAL letter only<br />
              To be Filled in by the Applicant only
            </td>
            <td style={{ fontSize: '6.5pt', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>
              All fields marked with * are MANDATORY.&nbsp;Tick The appropriate bracket&nbsp;□
            </td>
          </tr>
        </tbody>
      </table>

      {/* Course bar */}
      <div style={{
        background: '#1565c0',
        color: '#fff',
        fontWeight: 700,
        fontSize: '7.5pt',
        padding: '3px 6px',
        marginBottom: 3,
      }}>
        Sir, I Request You To Admit Me To Course :-&nbsp;&nbsp;
        <span style={{
          borderBottom: '1px solid rgba(255,255,255,0.6)',
          display: 'inline-block',
          minWidth: 220,
          paddingBottom: 1,
        }}>
          {courseStr}
        </span>
      </div>

      {/* ══════════════════════════════════════════════════
          SECTION 1: PERSONAL DETAILS + PHOTO
      ══════════════════════════════════════════════════ */}
      <table width="100%" style={{ borderCollapse: 'collapse', ...OUTER_BORDER }}>
        <tbody>

          {/* Row 1: icon | First Name (wide) | Photo (rowspan 4) */}
          <tr>
            <td rowSpan={5} width="5%" style={{ ...INNER_BORDER, textAlign: 'center', verticalAlign: 'middle', fontSize: '18pt', ...CELL_PAD }}>
              🎓
            </td>
            <td colSpan={4} style={{ ...INNER_BORDER, ...CELL_PAD }}>
              <span style={LABEL_STYLE}>First Name: </span>
              <span style={{ ...VALUE_STYLE, ...UNDERLINE_VAL }}>{v(s.firstName)}</span>
            </td>
            {/* Photo box — rowspan 4 to cover personal rows */}
            <td rowSpan={4} width="18%" style={{ ...INNER_BORDER, textAlign: 'center', verticalAlign: 'top', padding: '5px 4px' }}>
              <div style={{
                border: '1.5px solid #555',
                width: 76,
                height: 92,
                margin: '0 auto',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8f8f8',
              }}>
                {photo
                  ? <img src={photo} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '6pt', color: '#aaa', textAlign: 'center' }}>Photo</span>
                }
              </div>
            </td>
          </tr>

          {/* Row 2: Middle Name | Mother Name */}
          <tr>
            <td colSpan={2} style={{ ...INNER_BORDER, ...CELL_PAD }}>
              <span style={LABEL_STYLE}>Middle Name: </span>
              <span style={{ ...VALUE_STYLE, borderBottom: '1px solid #888', display: 'inline-block', minWidth: 80 }}>{v(s.middleName)}</span>
            </td>
            <td colSpan={2} style={{ ...INNER_BORDER, ...CELL_PAD }}>
              <span style={LABEL_STYLE}>Mother Name: </span>
              <span style={{ ...VALUE_STYLE, borderBottom: '1px solid #888', display: 'inline-block', minWidth: 80 }}>{v(s.motherName)}</span>
            </td>
          </tr>

          {/* Row 3: Surname */}
          <tr>
            <td colSpan={4} style={{ ...INNER_BORDER, ...CELL_PAD }}>
              <span style={LABEL_STYLE}>Surname: </span>
              <span style={{ ...VALUE_STYLE, ...UNDERLINE_VAL }}>{v(s.surname)}</span>
            </td>
          </tr>

          {/* Row 4: Applicant name as on certificate */}
          <tr>
            <td colSpan={4} style={{ ...INNER_BORDER, ...CELL_PAD }}>
              <div style={{ color: '#1565c0', fontSize: '6.5pt', fontWeight: 600, lineHeight: 1.3 }}>
                Name of the applicant as it should appear on the Fee Receipt, Hall Ticket and Final Certificate.
              </div>
              <div style={{
                border: '1px solid #999',
                minHeight: 14,
                padding: '1px 4px',
                ...VALUE_STYLE,
                marginTop: 2,
              }}>
                {v(s.applicantName) || fullName}
              </div>
            </td>
          </tr>

          {/* Row 5: DOB | Age | (empty) | (empty) | Photo label */}
          <tr>
            <td width="28%" style={{ ...INNER_BORDER, ...CELL_PAD }}>
              <div style={LABEL_STYLE}>Date of Birth</div>
              <div style={VALUE_STYLE}>{fmtDate(s.dateOfBirth)}</div>
            </td>
            <td width="14%" style={{ ...INNER_BORDER, ...CELL_PAD }}>
              <div style={LABEL_STYLE}>Age</div>
              <div style={VALUE_STYLE}>{age}</div>
            </td>
            <td colSpan={2} style={{ ...INNER_BORDER }} />
            <td style={{ ...INNER_BORDER, textAlign: 'center', fontSize: '6pt', color: '#666', verticalAlign: 'bottom', padding: '2px' }}>
              (Photo)
            </td>
          </tr>

        </tbody>
      </table>

      {/* ══════════════════════════════════════════════════
          SECTION 2: CONTACT
      ══════════════════════════════════════════════════ */}
      <table width="100%" style={{ borderCollapse: 'collapse', ...OUTER_BORDER, borderTop: 'none' }}>
        <tbody>
          <tr>
            <td rowSpan={2} width="5%" style={{ ...INNER_BORDER, textAlign: 'center', fontSize: '16pt', ...CELL_PAD, verticalAlign: 'middle' }}>📱</td>
            <td width="38%" style={{ ...INNER_BORDER, ...CELL_PAD }}>
              <div style={{ ...LABEL_STYLE, fontWeight: 700 }}>Mobile No. (Own):</div>
              <div style={VALUE_STYLE}>+91 {v(s.ownMobile)}</div>
            </td>
            <td width="22%" style={{ ...INNER_BORDER, ...CELL_PAD }}>
              <div style={LABEL_STYLE}>Gender:</div>
              <div style={VALUE_STYLE}>{v(s.gender)}</div>
            </td>
            <td width="5%" style={{ ...INNER_BORDER, textAlign: 'center', fontSize: '12pt', verticalAlign: 'middle' }}>💞</td>
            <td style={{ ...INNER_BORDER, ...CELL_PAD }}>
              <div style={LABEL_STYLE}>Marital Status:</div>
              <div style={VALUE_STYLE}>{v(s.maritalStatus)}</div>
            </td>
          </tr>
          <tr>
            <td style={{ ...INNER_BORDER, ...CELL_PAD }}>
              <div style={LABEL_STYLE}>Mobile No.(Other): WhatsApp</div>
              <div style={VALUE_STYLE}>+91 {v(s.otherMobile)}</div>
            </td>
            <td colSpan={3} style={{ ...INNER_BORDER, ...CELL_PAD }}>
              <div style={{ ...LABEL_STYLE, fontWeight: 700 }}>Aadhaar Number:</div>
              <div style={VALUE_STYLE}>{v(s.aadhaarNumber)}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ══════════════════════════════════════════════════
          SECTION 3: ADDRESS
      ══════════════════════════════════════════════════ */}
      <table width="100%" style={{ borderCollapse: 'collapse', ...OUTER_BORDER, borderTop: 'none' }}>
        <tbody>
          <tr>
            <td rowSpan={5} width="5%" style={{ ...INNER_BORDER, textAlign: 'center', fontSize: '16pt', verticalAlign: 'middle', ...CELL_PAD }}>📍</td>
            <td colSpan={2} style={{ ...INNER_BORDER, ...CELL_PAD, fontWeight: 700, fontSize: '7.5pt' }}>
              Address for Correspondence :
            </td>
          </tr>
          <tr>
            <td style={{ ...INNER_BORDER, ...CELL_PAD }}>
              <div style={LABEL_STYLE}>House No./Building No.</div>
              <div style={VALUE_STYLE}>{v(s.houseNo)}</div>
            </td>
            <td style={{ ...INNER_BORDER, ...CELL_PAD }}>
              <div style={LABEL_STYLE}>Stree/Colony</div>
              <div style={VALUE_STYLE}>{v(s.street)}</div>
            </td>
          </tr>
          <tr>
            <td style={{ ...INNER_BORDER, ...CELL_PAD }}>
              <div style={LABEL_STYLE}>City/Village/Suburb:</div>
              <div style={VALUE_STYLE}>{v(s.city)}</div>
            </td>
            <td style={{ ...INNER_BORDER, ...CELL_PAD }}>
              <div style={LABEL_STYLE}>Tahsil/Block</div>
              <div style={VALUE_STYLE}>{v(s.tahsil)}</div>
            </td>
          </tr>
          <tr>
            <td style={{ ...INNER_BORDER, ...CELL_PAD }}>
              <div style={LABEL_STYLE}>District:</div>
              <div style={VALUE_STYLE}>{v(s.district)}</div>
            </td>
            <td style={{ ...INNER_BORDER, ...CELL_PAD }}>
              <div style={LABEL_STYLE}>Pin Code</div>
              <div style={VALUE_STYLE}>{v(s.pinCode)}</div>
            </td>
          </tr>
          <tr>
            <td style={{ ...INNER_BORDER, ...CELL_PAD }}>
              <div style={LABEL_STYLE}>Educational Qualification : (What do you do?)</div>
              <div style={VALUE_STYLE}>{v(s.qualification)}</div>
            </td>
            <td style={{ ...INNER_BORDER, ...CELL_PAD }}>
              <div style={LABEL_STYLE}>Cast/Category</div>
              <div style={VALUE_STYLE}>{v(s.category)}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ══════════════════════════════════════════════════
          SECTION 4: FEES AGREEMENT / SIGNATURE
          (Application Form only — full form)
          (Exam Form — blank space + signature)
      ══════════════════════════════════════════════════ */}
      {!isExam ? (
        <table width="100%" style={{ borderCollapse: 'collapse', ...OUTER_BORDER, borderTop: 'none' }}>
          <tbody>
            <tr>
              <td width="5%" rowSpan={2} style={{ ...INNER_BORDER, textAlign: 'center', fontSize: '16pt', verticalAlign: 'middle', ...CELL_PAD }}>🎓</td>
              <td colSpan={2} style={{ ...INNER_BORDER, padding: '4px 6px', fontSize: '7.5pt' }}>
                I Agree To Pay Rs.&nbsp;
                <span style={{ borderBottom: '1px solid #555', display: 'inline-block', minWidth: 90 }}>
                  {s.totalFees || ''}
                </span>
                &nbsp;(In Words)&nbsp;
                <span style={{ borderBottom: '1px solid #555', display: 'inline-block', minWidth: 160 }}>&nbsp;</span>
                <br />
                <span style={{ fontSize: '6.5pt', color: '#333' }}>
                  For Full Course And These Are Not To Be Refunded Under Any Circumstances.
                </span>
              </td>
              <td width="20%" style={{ ...INNER_BORDER, padding: '4px 6px', textAlign: 'center', fontSize: '6.5pt', fontWeight: 600, verticalAlign: 'bottom' }}>
                Signature of<br />Applicant
                <div style={{ borderTop: '1px solid #555', marginTop: 16 }} />
              </td>
            </tr>
            <tr>
              <td style={{
                ...INNER_BORDER,
                background: '#1565c0',
                color: '#fff',
                fontWeight: 700,
                fontSize: '8pt',
                padding: '4px 8px',
                textAlign: 'center',
              }}>
                TOTAL FEES
              </td>
              <td style={{
                ...INNER_BORDER,
                background: '#1565c0',
                color: '#fff',
                fontWeight: 700,
                fontSize: '8pt',
                padding: '4px 8px',
                textAlign: 'center',
              }}>
                INSTALLMENT
              </td>
              <td style={{ ...INNER_BORDER, background: '#1565c0' }} />
            </tr>
          </tbody>
        </table>
      ) : (
        /* Exam form: blank area + signature */
        <table width="100%" style={{ borderCollapse: 'collapse', ...OUTER_BORDER, borderTop: 'none' }}>
          <tbody>
            <tr>
              <td width="5%" style={{ ...INNER_BORDER, textAlign: 'center', fontSize: '16pt', verticalAlign: 'middle', ...CELL_PAD }}>🎓</td>
              <td style={{ ...INNER_BORDER, padding: '22px 4px' }}>&nbsp;</td>
              <td width="22%" style={{ ...INNER_BORDER, padding: '4px 6px', textAlign: 'center', fontSize: '6.5pt', fontWeight: 600, verticalAlign: 'bottom' }}>
                Signature of<br />Applicant
                <div style={{ borderTop: '1px solid #555', marginTop: 16 }} />
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* ══════════════════════════════════════════════════
          SECTION 5: BOTTOM INFO ROW
          (Admission Date, Course Duration, Certificate Issued, Batch Time)
      ══════════════════════════════════════════════════ */}
      <table width="100%" style={{ borderCollapse: 'collapse', ...OUTER_BORDER, borderTop: 'none' }}>
        <tbody>
          {!isExam && (
            <>
              <tr>
                <td width="42%" style={{ ...INNER_BORDER, padding: '3px 6px' }}>
                  <span style={LABEL_STYLE}>Admission Date: </span>
                  <span style={VALUE_STYLE}>{fmtDate(s.admissionDate)}</span>
                </td>
                <td style={{ ...INNER_BORDER, padding: '3px 6px' }}>
                  <span style={LABEL_STYLE}>Course Duration: </span>
                  <span style={VALUE_STYLE}>{v(s.courseDuration)}</span>
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ ...INNER_BORDER, padding: '3px 6px' }}>
                  <span style={{ ...LABEL_STYLE, color: '#c62828', fontWeight: 700 }}>*Certificate Issued : </span>
                  <span style={{ borderBottom: '1px solid #aaa', display: 'inline-block', minWidth: 300 }}>&nbsp;</span>
                </td>
              </tr>
            </>
          )}
          <tr>
            <td colSpan={2} style={{ ...INNER_BORDER, padding: '3px 6px' }}>
              <span style={LABEL_STYLE}>Batch Time: </span>
              <span style={{ ...VALUE_STYLE, marginRight: 16 }}>{v(s.batchTime)}</span>
              <span style={{
                background: '#1a7a3c',
                color: '#fff',
                fontWeight: 700,
                fontSize: '7.5pt',
                padding: '2px 14px',
                borderRadius: 2,
                marginLeft: 8,
              }}>
                *FOR OFFICE USE ONLY*
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ══════════════════════════════════════════════════
          SECTION 6a: FEES INSTALLMENT TABLE (Application Form only)
          Matches the PDF: Course Fees Paid | Receipt No | Receipt Date | Balance Amount
          First row filled, 8 blank rows follow.
      ══════════════════════════════════════════════════ */}
      {!isExam && (
        <table width="100%" style={{ borderCollapse: 'collapse', ...OUTER_BORDER, borderTop: 'none' }}>
          <thead>
            <tr style={{ background: '#111', color: '#fff' }}>
              {['Course Fees Paid', 'Receipt No', 'Receipt Date', 'Balance Amount'].map(h => (
                <th key={h} style={{
                  border: '1px solid #444',
                  padding: '3px 5px',
                  fontSize: '7.5pt',
                  fontWeight: 700,
                  textAlign: 'center',
                  width: '25%',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* First row: real data */}
            <tr>
              <td style={{ ...INNER_BORDER, padding: '2px 5px', fontSize: '8pt', fontWeight: 700, height: 18 }}>
                {v(s.feesPaid)}
              </td>
              <td style={{ ...INNER_BORDER, padding: '2px 5px', fontSize: '8pt', height: 18 }}>
                {v(s.receiptNumber)}
              </td>
              <td style={{ ...INNER_BORDER, padding: '2px 5px', fontSize: '8pt', height: 18 }}>
                {fmtDate(s.receiptDate)}
              </td>
              <td style={{ ...INNER_BORDER, padding: '2px 5px', fontSize: '8pt', fontWeight: 700, height: 18 }}>
                {s.totalFees ? balance.toFixed(0) : ''}
              </td>
            </tr>
            {/* 9 blank installment rows (matching PDF) */}
            {Array.from({ length: 9 }).map((_, i) => (
              <tr key={i}>
                <td style={{ ...INNER_BORDER, height: 17 }} />
                <td style={{ ...INNER_BORDER, height: 17 }} />
                <td style={{ ...INNER_BORDER, height: 17 }} />
                <td style={{ ...INNER_BORDER, height: 17 }} />
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ══════════════════════════════════════════════════
          SECTION 6b: FOR OFFICE USE ONLY table (Exam Form only)
          Matches PDF: dark header + 6 blank rows
      ══════════════════════════════════════════════════ */}
      {isExam && (
        <table width="100%" style={{ borderCollapse: 'collapse', ...OUTER_BORDER, borderTop: 'none' }}>
          <thead>
            <tr style={{ background: '#111', color: '#fff' }}>
              <th colSpan={4} style={{ padding: '4px 6px', fontSize: '8pt', fontWeight: 700, textAlign: 'center' }}>
                *FOR OFFICE USE ONLY*
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                <td style={{ ...INNER_BORDER, height: 18, width: '25%' }} />
                <td style={{ ...INNER_BORDER, height: 18, width: '25%' }} />
                <td style={{ ...INNER_BORDER, height: 18, width: '25%' }} />
                <td style={{ ...INNER_BORDER, height: 18, width: '25%' }} />
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}

// ── Main export ───────────────────────────────────────────────
export default function StudentPrint({ student, onClose }) {
  if (!student) return null;

  return (
    <>
      {/*
        Screen overlay — shown on screen, hidden when printing.
        Uses print:hidden (Tailwind) so it disappears in @media print.
      */}
      <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 print:hidden">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <h3 className="font-bold text-gray-900 mb-2" style={{ fontSize: 16 }}>
            Print Student Forms
          </h3>
          <p className="text-slate-500 mb-1" style={{ fontSize: 13 }}>
            <strong>Page 1</strong> — Application Form (with Fees Installment table)
          </p>
          <p className="text-slate-500 mb-5" style={{ fontSize: 13 }}>
            <strong>Page 2</strong> — Exam Form
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button onClick={() => window.print()} className="admin-btn-primary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.2" strokeLinecap="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print
            </button>
          </div>
        </div>
      </div>

      {/*
        Print document rendered as a DIRECT CHILD OF <body> via React Portal.

        Why portal to document.body?
          body > * { display:none !important }   — hides entire admin app (#root)
          body > #student-print-doc { display:block !important }  — shows only our doc

        Why inline style={{ display:'none' }} and NOT className="hidden"?
          Tailwind hidden = display:none !important → @media print CANNOT override it.
          Inline style has no !important → @media print CAN override it (shows the doc).
      */}
      {createPortal(
        <div id="student-print-doc" style={{ display: 'none' }}>
          <FormPage student={student} isExam={false} />
          <FormPage student={student} isExam={true} />
        </div>,
        document.body
      )}
    </>
  );
}
