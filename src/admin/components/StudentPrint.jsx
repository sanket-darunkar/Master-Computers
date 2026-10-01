/**
 * StudentPrint — Exact replica of MCA Application Form + Exam Form PDF
 * ─────────────────────────────────────────────────────────────────────
 * All text fields use individual character boxes matching the original PDF.
 * Mobile: 10 boxes. Aadhaar: 3×4 boxes. PIN: 6 boxes.
 * Names / DOB / Age: individual letter/digit boxes.
 *
 * PRINT MECHANISM:
 *   React Portal → direct <body> child → @media print shows it, hides #root.
 *   inline style={{ display:'none' }} NOT className="hidden" (Tailwind adds !important).
 */
import React from 'react';
import { createPortal } from 'react-dom';

// ── Helpers ───────────────────────────────────────────────────
function fmtDateParts(iso) {
  // Returns { dd, mm, yyyy } strings for individual box rendering
  if (!iso) return { dd: '', mm: '', yyyy: '' };
  try {
    const d = new Date(iso);
    return {
      dd:   String(d.getDate()).padStart(2, '0'),
      mm:   String(d.getMonth() + 1).padStart(2, '0'),
      yyyy: String(d.getFullYear()),
    };
  } catch { return { dd: '', mm: '', yyyy: '' }; }
}

function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return iso; }
}

const v = (val) => (val == null || val === '' ? '' : String(val));

function resolvePhoto(s) {
  if (s.photoData && s.photoMimeType) return `data:${s.photoMimeType};base64,${s.photoData}`;
  if (s.studentPhotoUrl) return s.studentPhotoUrl;
  return null;
}

function calcAge(dob) {
  if (!dob) return '';
  const diff = Date.now() - new Date(dob).getTime();
  const a = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  return a > 0 && a < 120 ? String(a) : '';
}

// ── Character box components ──────────────────────────────────

/** Single bordered box */
const SB = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width:  '5mm',
  height: '5mm',
  border: '1px solid #777',
  fontSize: '7pt',
  fontWeight: 700,
  background: '#fff',
  flexShrink: 0,
  boxSizing: 'border-box',
};

/** Slightly wider box for letters in names */
const SBL = { ...SB, width: '5.2mm' };

/** Render individual character boxes for a text string (letters/spaces) */
function LetterBoxes({ value = '', count, boxStyle = SBL }) {
  const chars = String(value).toUpperCase().split('');
  return (
    <span style={{ display: 'inline-flex', gap: '0.4mm', flexWrap: 'wrap' }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={boxStyle}>{chars[i] || ''}</span>
      ))}
    </span>
  );
}

/** Digit-only boxes (mobile, pin etc) */
function DigitBoxes({ value = '', count }) {
  const chars = String(value).replace(/\D/g, '').split('');
  return (
    <span style={{ display: 'inline-flex', gap: '0.4mm' }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={SB}>{chars[i] || ''}</span>
      ))}
    </span>
  );
}

/** DOB: DD / MM / YYYY boxes with separators */
function DobBoxes({ iso }) {
  const { dd, mm, yyyy } = fmtDateParts(iso);
  const boxRow = (str, len) =>
    Array.from({ length: len }).map((_, i) => (
      <span key={i} style={SB}>{str[i] || ''}</span>
    ));

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5mm' }}>
      {boxRow(dd, 2)}
      <span style={{ fontSize: '7pt', fontWeight: 700, margin: '0 0.5mm' }}>/</span>
      {boxRow(mm, 2)}
      <span style={{ fontSize: '7pt', fontWeight: 700, margin: '0 0.5mm' }}>/</span>
      {boxRow(yyyy, 4)}
    </span>
  );
}

/** Age boxes — 2 digits */
function AgeBoxes({ dob }) {
  const age = calcAge(dob);
  return <DigitBoxes value={age} count={2} />;
}

/** Aadhaar: 3 groups of 4 boxes */
function AadhaarBoxes({ value = '' }) {
  const digits = String(value).replace(/\D/g, '').padEnd(12, '').split('');
  return (
    <span style={{ display: 'inline-flex', gap: '1mm' }}>
      {[0, 1, 2].map(g => (
        <span key={g} style={{ display: 'inline-flex', gap: '0.4mm' }}>
          {[0, 1, 2, 3].map(j => (
            <span key={j} style={SB}>{digits[g * 4 + j] || ''}</span>
          ))}
        </span>
      ))}
    </span>
  );
}

// ── Design tokens ─────────────────────────────────────────────
const B1   = '1.5px solid #222';
const B2   = '1px solid #aaa';
const PAD  = '3px 5px';
const LBL  = { fontSize: '6.5pt', color: '#555', fontWeight: 600, display: 'block', lineHeight: 1.3, marginBottom: 2 };
const VAL  = { fontSize: '8pt',   fontWeight: 700, color: '#111', lineHeight: 1.3, display: 'block' };
const CELL = { border: B2, padding: PAD, verticalAlign: 'top' };

// ── FormPage ──────────────────────────────────────────────────
function FormPage({ student: s, isExam }) {
  const fullName  = [s.firstName, s.middleName, s.surname].filter(Boolean).join(' ');
  const balance   = (parseFloat(s.totalFees) || 0) - (parseFloat(s.feesPaid) || 0);
  const photo     = resolvePhoto(s);
  const courseStr = Array.isArray(s.courses) && s.courses.length > 0
    ? s.courses.join(', ')
    : v(s.course);

  return (
    <div className="print-page">

      {/* ══ HEADER ══ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 4 }}>
        <tbody><tr>
          {/* Left */}
          <td style={{ width: '22%', verticalAlign: 'top', paddingRight: 5 }}>
            {isExam && <div style={{ fontSize: '6pt', fontWeight: 700, marginBottom: 2 }}>Reg No- IN8308A</div>}
            <div style={{ width: 13, height: 13, background: '#000', marginBottom: 4 }} />
            <div style={{ color: '#1a56db', fontWeight: 700, fontSize: '7pt', lineHeight: 1.35 }}>Authorized Training Center</div>
            <div style={{ fontSize: '6pt', fontWeight: 600, lineHeight: 1.35 }}>ISO Certified Institute 9001:2015</div>
          </td>
          {/* Centre */}
          <td style={{ width: '56%', textAlign: 'center', verticalAlign: 'middle' }}>
            <img src="/images/master-computer-academy-logo.svg" alt="MCA"
              style={{ height: 50, display: 'block', margin: '0 auto 2px' }} />
            <div style={{ fontSize: '6.5pt', fontWeight: 600 }}>
              18 Lok Kalyan Society, Wathoda Layout Nagpur (9156348591)
            </div>
          </td>
          {/* Right */}
          <td style={{ width: '22%', textAlign: 'right', verticalAlign: 'top' }}>
            {isExam && <div style={{ fontSize: '6pt', fontWeight: 700, textAlign: 'right', marginBottom: 2 }}>ALC -14210808</div>}
            <div style={{ fontSize: '7pt', fontWeight: 700, marginBottom: 2 }}>Student ID No{isExam ? ':' : ''}</div>
            <div style={{ border: B1, minHeight: 20, padding: '2px 5px', fontWeight: 700, fontSize: '9pt', marginBottom: 4 }}>
              {v(s.studentId)}
            </div>
            <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
              {['#222', '#888', '#ccc'].map((c, i) => <div key={i} style={{ width: 14, height: 14, background: c }} />)}
            </div>
          </td>
        </tr></tbody>
      </table>

      {/* ══ TITLE BAR ══ */}
      <div style={{ background: '#222', color: '#fff', textAlign: 'center', fontWeight: 700, fontSize: '11pt', padding: '4px 0', letterSpacing: 0.3, marginBottom: 3 }}>
        {isExam ? 'Exam Form' : 'Application Form'}
      </div>

      {/* ══ INSTRUCTIONS ══ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 2 }}>
        <tbody><tr>
          <td style={{ fontSize: '6.5pt', fontWeight: 600, lineHeight: 1.5 }}>
            Please fill in the form in English and CAPITAL letter only<br />
            To be Filled in by the Applicant only
          </td>
          <td style={{ fontSize: '6.5pt', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap', lineHeight: 1.5 }}>
            All fields marked with * are MANDATORY.&nbsp;Tick The appropriate bracket&nbsp;□
          </td>
        </tr></tbody>
      </table>

      {/* ══ COURSE BAR ══ */}
      <div style={{ background: '#1a56db', color: '#fff', fontWeight: 700, fontSize: '7.5pt', padding: '3px 7px', marginBottom: 0 }}>
        Sir, I Request You To Admit Me To Course :-&nbsp;
        <span style={{ fontWeight: 700 }}>{courseStr}</span>
      </div>

      {/* ══ SECTION 1 — PERSONAL + PHOTO ══ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: B1 }}>
        <tbody>

          {/* Row 1: icon | First Name | Photo (rowspan=4) */}
          <tr>
            <td rowSpan={5} style={{ ...CELL, width: '5%', textAlign: 'center', verticalAlign: 'middle', fontSize: '18pt' }}>🎓</td>
            <td colSpan={4} style={{ ...CELL }}>
              <span style={LBL}>First Name:</span>
              <LetterBoxes value={v(s.firstName)} count={20} />
            </td>
            {/* Photo — rowspan=4 */}
            <td rowSpan={4} style={{ ...CELL, width: '17%', textAlign: 'center', verticalAlign: 'top', padding: 5 }}>
              <div style={{ border: '1.5px solid #666', width: 70, height: 88, margin: '0 auto', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                {photo
                  ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                  : <span style={{ fontSize: '6pt', color: '#bbb' }}>Photo</span>}
              </div>
            </td>
          </tr>

          {/* Row 2: Middle Name | Mother Name */}
          <tr>
            <td colSpan={2} style={{ ...CELL }}>
              <span style={LBL}>Middle Name:</span>
              <LetterBoxes value={v(s.middleName)} count={14} />
            </td>
            <td colSpan={2} style={{ ...CELL }}>
              <span style={LBL}>Mother Name:</span>
              <LetterBoxes value={v(s.motherName)} count={14} />
            </td>
          </tr>

          {/* Row 3: Surname */}
          <tr>
            <td colSpan={4} style={{ ...CELL }}>
              <span style={LBL}>Surname:</span>
              <LetterBoxes value={v(s.surname)} count={20} />
            </td>
          </tr>

          {/* Row 4: Applicant name (full name box) */}
          <tr>
            <td colSpan={4} style={{ ...CELL }}>
              <span style={{ ...LBL, color: '#1a56db' }}>
                Name of the applicant as it should appear on the Fee Receipt, Hall Ticket and Final Certificate.
              </span>
              <div style={{ border: '1px solid #aaa', minHeight: 15, padding: '1px 4px', ...VAL, marginTop: 1 }}>
                {v(s.applicantName) || fullName}
              </div>
            </td>
          </tr>

          {/* Row 5: DOB boxes | Age boxes | blank | (Photo label) */}
          <tr>
            <td style={{ ...CELL, width: '30%' }}>
              <span style={LBL}>Date of Birth</span>
              <DobBoxes iso={s.dateOfBirth} />
            </td>
            <td style={{ ...CELL, width: '12%' }}>
              <span style={LBL}>Age</span>
              <AgeBoxes dob={s.dateOfBirth} />
            </td>
            <td colSpan={2} style={{ ...CELL }} />
            <td style={{ ...CELL, textAlign: 'center', fontSize: '6pt', color: '#888', verticalAlign: 'bottom', padding: 2 }}>(Photo)</td>
          </tr>

        </tbody>
      </table>

      {/* ══ SECTION 2 — CONTACT ══ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: B1, borderTop: 'none' }}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ ...CELL, width: '5%', textAlign: 'center', verticalAlign: 'middle', fontSize: '16pt' }}>📱</td>
            <td style={{ ...CELL, width: '38%' }}>
              <span style={{ ...LBL, fontWeight: 700 }}>Mobile No. (Own):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5mm', marginTop: 2 }}>
                <span style={{ fontSize: '7.5pt', fontWeight: 700 }}>+91</span>
                <DigitBoxes value={v(s.ownMobile)} count={10} />
              </div>
            </td>
            <td style={{ ...CELL, width: '20%' }}>
              <span style={LBL}>Gender:</span>
              <span style={VAL}>{v(s.gender)}</span>
            </td>
            <td style={{ ...CELL, width: '5%', textAlign: 'center', verticalAlign: 'middle', fontSize: '12pt' }}>💞</td>
            <td style={{ ...CELL }}>
              <span style={LBL}>Marital Status:</span>
              <span style={VAL}>{v(s.maritalStatus)}</span>
            </td>
          </tr>
          <tr>
            <td style={{ ...CELL }}>
              <span style={LBL}>Mobile No.(Other): WhatsApp</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5mm', marginTop: 2 }}>
                <span style={{ fontSize: '7.5pt', fontWeight: 700 }}>+91</span>
                <DigitBoxes value={v(s.otherMobile)} count={10} />
              </div>
            </td>
            <td colSpan={3} style={{ ...CELL }}>
              <span style={{ ...LBL, fontWeight: 700 }}>Aadhaar Number:</span>
              <div style={{ marginTop: 2 }}>
                <AadhaarBoxes value={v(s.aadhaarNumber)} />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ══ SECTION 3 — ADDRESS ══ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: B1, borderTop: 'none' }}>
        <tbody>
          <tr>
            <td rowSpan={5} style={{ ...CELL, width: '5%', textAlign: 'center', verticalAlign: 'middle', fontSize: '16pt' }}>📍</td>
            <td colSpan={2} style={{ ...CELL, fontWeight: 700, fontSize: '7.5pt' }}>Address for Correspondence :</td>
          </tr>
          <tr>
            <td style={{ ...CELL, width: '47.5%' }}>
              <span style={LBL}>House No./Building No.</span>
              <span style={VAL}>{v(s.houseNo)}</span>
            </td>
            <td style={{ ...CELL }}>
              <span style={LBL}>Stree/Colony</span>
              <span style={VAL}>{v(s.street)}</span>
            </td>
          </tr>
          <tr>
            <td style={{ ...CELL }}>
              <span style={LBL}>City/Village/Suburb:</span>
              <span style={VAL}>{v(s.city)}</span>
            </td>
            <td style={{ ...CELL }}>
              <span style={LBL}>Tahsil/Block</span>
              <span style={VAL}>{v(s.tahsil)}</span>
            </td>
          </tr>
          <tr>
            <td style={{ ...CELL }}>
              <span style={LBL}>District:</span>
              <span style={VAL}>{v(s.district)}</span>
            </td>
            <td style={{ ...CELL }}>
              <span style={LBL}>Pin Code</span>
              <div style={{ marginTop: 2 }}>
                <DigitBoxes value={v(s.pinCode)} count={6} />
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ ...CELL }}>
              <span style={LBL}>Educational Qualification : (What do you do?)</span>
              <span style={VAL}>{v(s.qualification)}</span>
            </td>
            <td style={{ ...CELL }}>
              <span style={LBL}>Cast/Category</span>
              <span style={VAL}>{v(s.category)}</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ══ SECTION 4 — FEES AGREEMENT / SIGNATURE ══ */}
      {!isExam ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: B1, borderTop: 'none' }}>
          <tbody>
            <tr>
              <td rowSpan={2} style={{ ...CELL, width: '5%', textAlign: 'center', verticalAlign: 'middle', fontSize: '16pt' }}>🎓</td>
              <td colSpan={2} style={{ ...CELL, fontSize: '7.5pt', padding: '5px 7px' }}>
                I Agree To Pay Rs.&nbsp;
                <span style={{ borderBottom: '1px solid #555', display: 'inline-block', minWidth: '18mm' }}>{v(s.totalFees)}</span>
                &nbsp;(In Words)&nbsp;
                <span style={{ borderBottom: '1px solid #555', display: 'inline-block', minWidth: '40mm' }}>&nbsp;</span>
                <br />
                <span style={{ fontSize: '6.5pt', color: '#333' }}>For Full Course And These Are Not To Be Refunded Under Any Circumstances.</span>
              </td>
              <td style={{ ...CELL, width: '19%', textAlign: 'center', fontSize: '6.5pt', fontWeight: 600, verticalAlign: 'bottom', padding: '4px 6px' }}>
                Signature of<br />Applicant
                <div style={{ borderTop: '1px solid #555', marginTop: 18 }} />
              </td>
            </tr>
            <tr>
              <td style={{ ...CELL, background: '#1a56db', color: '#fff', fontWeight: 700, fontSize: '8pt', textAlign: 'center', padding: '4px' }}>TOTAL FEES</td>
              <td style={{ ...CELL, background: '#1a56db', color: '#fff', fontWeight: 700, fontSize: '8pt', textAlign: 'center', padding: '4px' }}>INSTALLMENT</td>
              <td style={{ ...CELL, background: '#1a56db' }} />
            </tr>
          </tbody>
        </table>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: B1, borderTop: 'none' }}>
          <tbody><tr>
            <td style={{ ...CELL, width: '5%', textAlign: 'center', verticalAlign: 'middle', fontSize: '16pt' }}>🎓</td>
            <td style={{ ...CELL, padding: '24px 6px' }}>&nbsp;</td>
            <td style={{ ...CELL, width: '19%', textAlign: 'center', fontSize: '6.5pt', fontWeight: 600, verticalAlign: 'bottom', padding: '4px 6px' }}>
              Signature of<br />Applicant
              <div style={{ borderTop: '1px solid #555', marginTop: 18 }} />
            </td>
          </tr></tbody>
        </table>
      )}

      {/* ══ SECTION 5 — BOTTOM INFO ══ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: B1, borderTop: 'none' }}>
        <tbody>
          {!isExam && (
            <>
              <tr>
                <td style={{ ...CELL, width: '50%' }}>
                  <span style={{ ...LBL, display: 'inline' }}>Admission Date: </span>
                  <span style={{ ...VAL, display: 'inline' }}>{fmtDate(s.admissionDate)}</span>
                </td>
                <td style={{ ...CELL }}>
                  <span style={{ ...LBL, display: 'inline' }}>Course Duration: </span>
                  <span style={{ ...VAL, display: 'inline' }}>{v(s.courseDuration)}</span>
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ ...CELL }}>
                  <span style={{ ...LBL, display: 'inline', color: '#c0392b', fontWeight: 700 }}>*Certificate Issued : </span>
                  <span style={{ borderBottom: '1px solid #aaa', display: 'inline-block', minWidth: '60mm' }}>&nbsp;</span>
                </td>
              </tr>
            </>
          )}
          <tr>
            <td colSpan={2} style={{ ...CELL, padding: '3px 6px' }}>
              <span style={{ ...LBL, display: 'inline' }}>Batch Time: </span>
              <span style={{ ...VAL, display: 'inline', marginRight: 12 }}>{v(s.batchTime)}</span>
              <span style={{ display: 'inline-block', background: '#1a7a3c', color: '#fff', fontWeight: 700, fontSize: '7pt', padding: '2px 10px', borderRadius: 2, marginLeft: 8 }}>
                *FOR OFFICE USE ONLY*
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ══ SECTION 6A — FEES TABLE (Application only) ══ */}
      {!isExam && (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: B1, borderTop: 'none' }}>
          <thead>
            <tr style={{ background: '#111', color: '#fff' }}>
              {['Course Fees Paid', 'Receipt No', 'Receipt Date', 'Balance Amount'].map(h => (
                <th key={h} style={{ border: '1px solid #444', padding: '3px 5px', fontSize: '7.5pt', fontWeight: 700, textAlign: 'center', width: '25%' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...CELL, fontSize: '8pt', fontWeight: 700, height: 16 }}>{v(s.feesPaid)}</td>
              <td style={{ ...CELL, fontSize: '8pt', height: 16 }}>{v(s.receiptNumber)}</td>
              <td style={{ ...CELL, fontSize: '8pt', height: 16 }}>{fmtDate(s.receiptDate)}</td>
              <td style={{ ...CELL, fontSize: '8pt', fontWeight: 700, height: 16 }}>{s.totalFees ? Math.round(balance) : ''}</td>
            </tr>
            {Array.from({ length: 9 }).map((_, i) => (
              <tr key={i}>
                <td style={{ ...CELL, height: 16 }} /><td style={{ ...CELL, height: 16 }} />
                <td style={{ ...CELL, height: 16 }} /><td style={{ ...CELL, height: 16 }} />
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ══ SECTION 6B — OFFICE USE ONLY (Exam only) ══ */}
      {isExam && (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: B1, borderTop: 'none' }}>
          <thead>
            <tr style={{ background: '#111', color: '#fff' }}>
              <th colSpan={4} style={{ padding: '4px 6px', fontSize: '8pt', fontWeight: 700, textAlign: 'center' }}>*FOR OFFICE USE ONLY*</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                <td style={{ ...CELL, height: 17, width: '25%' }} /><td style={{ ...CELL, height: 17, width: '25%' }} />
                <td style={{ ...CELL, height: 17, width: '25%' }} /><td style={{ ...CELL, height: 17, width: '25%' }} />
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
      <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 print:hidden">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <h3 className="font-bold text-gray-900 mb-2 text-base">Print Student Forms</h3>
          <p className="text-slate-500 mb-1 text-sm"><strong>Page 1</strong> — Application Form</p>
          <p className="text-slate-500 mb-5 text-sm"><strong>Page 2</strong> — Exam Form</p>
          <div className="flex gap-3 justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={() => window.print()} className="admin-btn-primary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print
            </button>
          </div>
        </div>
      </div>
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
