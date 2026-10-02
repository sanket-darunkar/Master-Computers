/**
 * StudentPrint — Exact replica of MCA Application Form + Exam Form PDF
 * ─────────────────────────────────────────────────────────────────────
 * Source of truth: original MCA admission form PDF (October 2026).
 *
 * Field rendering rules (matched visually to PDF):
 *   Name fields (First/Middle/Surname/Mother)  → plain text with underline
 *   Applicant name                             → bordered rectangle
 *   Date of Birth                              → plain text (DD/MM/YYYY)
 *   Age                                        → plain text
 *   Mobile (Own + Other)                       → +91 + 10 individual digit boxes
 *   Aadhaar                                    → 3 groups of 4 digit boxes
 *   Pin Code                                   → 6 individual digit boxes
 *   All other fields                           → plain text label + value
 *
 * PRINT MECHANISM:
 *   React Portal → direct <body> child → @media print shows it, hides #root.
 *   inline style={{ display:'none' }} — NOT className="hidden" (Tailwind !important breaks print).
 */
import React from 'react';
import { createPortal } from 'react-dom';

// ── Helpers ───────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
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

// ── Individual digit boxes (Mobile, Aadhaar, PIN only) ────────
const DBOX = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '14px',
  height: '14px',
  border: '1px solid #666',
  fontSize: '7pt',
  fontWeight: 700,
  background: '#fff',
  flexShrink: 0,
  boxSizing: 'border-box',
};

function DigitBoxes({ value = '', count }) {
  const chars = String(value).replace(/\D/g, '').split('');
  return (
    <span style={{ display: 'inline-flex', gap: '1px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={DBOX}>{chars[i] || ''}</span>
      ))}
    </span>
  );
}

function AadhaarBoxes({ value = '' }) {
  const digits = String(value).replace(/\D/g, '').padEnd(12, '').split('');
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
      {[0, 1, 2].map(g => (
        <React.Fragment key={g}>
          <span style={{ display: 'inline-flex', gap: '1px' }}>
            {[0, 1, 2, 3].map(j => (
              <span key={j} style={DBOX}>{digits[g * 4 + j] || ''}</span>
            ))}
          </span>
          {g < 2 && <span style={{ width: 3 }} />}
        </React.Fragment>
      ))}
    </span>
  );
}

// ── Design tokens (matched to PDF) ───────────────────────────
const B_OUTER = '1.5px solid #222';
const B_INNER = '1px solid #aaa';
const C = { border: B_INNER, padding: '2px 5px', verticalAlign: 'top' };  // standard cell

const LBL = {
  fontSize: '6.5pt', color: '#555', fontWeight: 600,
  display: 'block', lineHeight: 1.3, marginBottom: 1,
};
const VAL = {
  fontSize: '8.5pt', fontWeight: 700, color: '#111',
  lineHeight: 1.4, display: 'block',
};

// Rectangle box field — used for names (matches PDF: full bordered rectangle)
function TextField({ label, value }) {
  return (
    <>
      <span style={LBL}>{label}</span>
      <div style={{
        border: '1px solid #aaa',
        minHeight: 15,
        padding: '1px 4px',
        fontSize: '8.5pt',
        fontWeight: 700,
        color: '#111',
        lineHeight: 1.4,
        background: '#fff',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {value}
      </div>
    </>
  );
}

// ── FormPage ──────────────────────────────────────────────────
function FormPage({ student: s, isExam }) {
  const fullName  = [s.firstName, s.middleName, s.surname].filter(Boolean).join(' ');
  const age       = calcAge(s.dateOfBirth);
  const balance   = (parseFloat(s.totalFees) || 0) - (parseFloat(s.feesPaid) || 0);
  const photo     = resolvePhoto(s);
  const courseStr = Array.isArray(s.courses) && s.courses.length > 0
    ? s.courses.join(', ')
    : v(s.course);

  return (
    <div className="print-page">

      {/* ════════════════════════════════════════════
          HEADER
          Left:   black square + Authorized Training Center + ISO
          Centre: Logo + address
          Right:  (exam: Reg No + ALC) + Student ID box + 3 colour squares
      ════════════════════════════════════════════ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 4 }}>
        <tbody><tr>
          {/* LEFT */}
          <td style={{ width: '22%', verticalAlign: 'top', paddingRight: 5 }}>
            {isExam && (
              <div style={{ fontSize: '6pt', fontWeight: 700, marginBottom: 3 }}>
                Reg No- IN8308A
              </div>
            )}
            <div style={{ width: 13, height: 13, background: '#000', marginBottom: 4 }} />
            <div style={{ color: '#1a56db', fontWeight: 700, fontSize: '7pt', lineHeight: 1.4 }}>
              Authorized Training Center
            </div>
            <div style={{ fontSize: '6pt', fontWeight: 600, lineHeight: 1.4 }}>
              ISO Certified Institute 9001:2015
            </div>
          </td>

          {/* CENTRE */}
          <td style={{ width: '56%', textAlign: 'center', verticalAlign: 'middle' }}>
            <img
              src="/images/master-computer-academy-logo.svg"
              alt="Master Computer Academy"
              style={{ height: 50, display: 'block', margin: '0 auto 3px' }}
            />
            <div style={{ fontSize: '6.5pt', fontWeight: 600 }}>
              18 Lok Kalyan Society, Wathoda Layout Nagpur (9156348591)
            </div>
          </td>

          {/* RIGHT */}
          <td style={{ width: '22%', textAlign: 'right', verticalAlign: 'top' }}>
            {isExam && (
              <div style={{ fontSize: '6pt', fontWeight: 700, textAlign: 'right', marginBottom: 3 }}>
                ALC -14210808
              </div>
            )}
            <div style={{ fontSize: '7pt', fontWeight: 700, marginBottom: 2 }}>
              Student ID No{isExam ? ':' : ''}
            </div>
            <div style={{
              border: B_OUTER, minHeight: 20, padding: '2px 5px',
              fontWeight: 700, fontSize: '9pt', marginBottom: 4,
            }}>
              {v(s.studentId)}
            </div>
            <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
              {['#222', '#888', '#ccc'].map((col, i) => (
                <div key={i} style={{ width: 14, height: 14, background: col }} />
              ))}
            </div>
          </td>
        </tr></tbody>
      </table>

      {/* ══ TITLE BAR ══ */}
      <div style={{
        background: '#222', color: '#fff', textAlign: 'center',
        fontWeight: 700, fontSize: '11pt', padding: '4px 0',
        letterSpacing: '0.3px', marginBottom: 3,
      }}>
        {isExam ? 'Exam Form' : 'Application Form'}
      </div>

      {/* ══ INSTRUCTIONS ROW ══ */}
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
      <div style={{
        background: '#1a56db', color: '#fff', fontWeight: 700,
        fontSize: '7.5pt', padding: '3px 7px', marginBottom: 0,
      }}>
        Sir, I Request You To Admit Me To Course :-&nbsp;
        <span>{courseStr}</span>
      </div>

      {/* ════════════════════════════════════════════
          SECTION 1 — PERSONAL DETAILS + PHOTO
          Structure (matches PDF):
            Row 1: 🎓(span5) | First Name (span4)            | Photo(span4, right)
            Row 2:            | Middle Name (span2)           | Mother Name (span2)
            Row 3:            | Surname (span4)               |
            Row 4:            | Blue instruction + name box   |
            Row 5:            | DOB | Age | blank×2           | (Photo) label
      ════════════════════════════════════════════ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: B_OUTER }}>
        <tbody>

          {/* Row 1 */}
          <tr>
            <td rowSpan={5} style={{ ...C, width: '5%', textAlign: 'center', verticalAlign: 'middle', fontSize: '18pt', padding: '3px' }}>
              🎓
            </td>
            <td colSpan={4} style={{ ...C, padding: '3px 6px' }}>
              <TextField label="First Name:" value={v(s.firstName)} />
            </td>
            {/* Photo box — rowspan 4 */}
            <td rowSpan={4} style={{ ...C, width: '16%', textAlign: 'center', verticalAlign: 'top', padding: '5px 4px' }}>
              <div style={{
                border: '1.5px solid #777',
                width: 72, height: 90,
                margin: '0 auto',
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#f5f5f5',
              }}>
                {photo
                  ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                  : <span style={{ fontSize: '6pt', color: '#bbb' }}>Photo</span>
                }
              </div>
            </td>
          </tr>

          {/* Row 2 */}
          <tr>
            <td colSpan={2} style={{ ...C, padding: '3px 6px' }}>
              <TextField label="Middle Name:" value={v(s.middleName)} />
            </td>
            <td colSpan={2} style={{ ...C, padding: '3px 6px' }}>
              <TextField label="Mother Name:" value={v(s.motherName)} />
            </td>
          </tr>

          {/* Row 3 */}
          <tr>
            <td colSpan={4} style={{ ...C, padding: '3px 6px' }}>
              <TextField label="Surname:" value={v(s.surname)} />
            </td>
          </tr>

          {/* Row 4 — applicant name as on certificate */}
          <tr>
            <td colSpan={4} style={{ ...C, padding: '3px 6px' }}>
              <span style={{ ...LBL, color: '#1a56db' }}>
                Name of the applicant as it should appear on the Fee Receipt, Hall Ticket and Final Certificate.
              </span>
              <div style={{
                border: '1px solid #aaa',
                minHeight: 14, padding: '1px 4px',
                fontSize: '8.5pt', fontWeight: 700, color: '#111',
                marginTop: 2,
              }}>
                {v(s.applicantName) || fullName}
              </div>
            </td>
          </tr>

          {/* Row 5 — DOB | Age | blank | (Photo) */}
          <tr>
            <td style={{ ...C, width: '26%', padding: '3px 6px' }}>
              <span style={LBL}>Date of Birth</span>
              <span style={VAL}>{fmtDate(s.dateOfBirth)}</span>
            </td>
            <td style={{ ...C, width: '12%', padding: '3px 6px' }}>
              <span style={LBL}>Age</span>
              <span style={VAL}>{age}</span>
            </td>
            <td colSpan={2} style={{ ...C }} />
            <td style={{
              ...C, textAlign: 'center', verticalAlign: 'bottom',
              fontSize: '6pt', color: '#888', padding: '2px',
            }}>
              (Photo)
            </td>
          </tr>

        </tbody>
      </table>

      {/* ════════════════════════════════════════════
          SECTION 2 — CONTACT
          Row 1: 📱(span2) | Mobile Own (+91 + 10 boxes) | Gender | 💞 | Marital
          Row 2:            | Mobile Other (+91 + 10 boxes)         | Aadhaar (4+4+4 boxes)
      ════════════════════════════════════════════ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: B_OUTER, borderTop: 'none' }}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ ...C, width: '5%', textAlign: 'center', verticalAlign: 'middle', fontSize: '16pt', padding: '3px' }}>
              📱
            </td>
            <td style={{ ...C, width: '37%', padding: '3px 6px' }}>
              <span style={{ ...LBL, fontWeight: 700 }}>Mobile No. (Own):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <span style={{ fontSize: '7.5pt', fontWeight: 700 }}>+91</span>
                <DigitBoxes value={v(s.ownMobile)} count={10} />
              </div>
            </td>
            <td style={{ ...C, width: '20%', padding: '3px 6px' }}>
              <span style={LBL}>Gender:</span>
              <span style={VAL}>{v(s.gender)}</span>
            </td>
            <td style={{ ...C, width: '5%', textAlign: 'center', verticalAlign: 'middle', fontSize: '13pt' }}>
              💞
            </td>
            <td style={{ ...C, padding: '3px 6px' }}>
              <span style={LBL}>Marital Status:</span>
              <span style={VAL}>{v(s.maritalStatus)}</span>
            </td>
          </tr>
          <tr>
            <td style={{ ...C, padding: '3px 6px' }}>
              <span style={LBL}>Mobile No.(Other): WhatsApp</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <span style={{ fontSize: '7.5pt', fontWeight: 700 }}>+91</span>
                <DigitBoxes value={v(s.otherMobile)} count={10} />
              </div>
            </td>
            <td colSpan={3} style={{ ...C, padding: '3px 6px' }}>
              <span style={{ ...LBL, fontWeight: 700 }}>Aadhaar Number:</span>
              <div style={{ marginTop: 3 }}>
                <AadhaarBoxes value={v(s.aadhaarNumber)} />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ════════════════════════════════════════════
          SECTION 3 — ADDRESS
          📍(span5) | Address header (span2)
                     | House No | Street/Colony
                     | City     | Tahsil
                     | District | Pin Code (6 boxes)
                     | Qualification | Category
      ════════════════════════════════════════════ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: B_OUTER, borderTop: 'none' }}>
        <tbody>
          <tr>
            <td rowSpan={5} style={{ ...C, width: '5%', textAlign: 'center', verticalAlign: 'middle', fontSize: '16pt', padding: '3px' }}>
              📍
            </td>
            <td colSpan={2} style={{ ...C, fontWeight: 700, fontSize: '7.5pt', padding: '3px 6px' }}>
              Address for Correspondence :
            </td>
          </tr>
          <tr>
            <td style={{ ...C, width: '47.5%', padding: '3px 6px' }}>
              <span style={LBL}>House No./Building No.</span>
              <span style={VAL}>{v(s.houseNo)}</span>
            </td>
            <td style={{ ...C, padding: '3px 6px' }}>
              <span style={LBL}>Stree/Colony</span>
              <span style={VAL}>{v(s.street)}</span>
            </td>
          </tr>
          <tr>
            <td style={{ ...C, padding: '3px 6px' }}>
              <span style={LBL}>City/Village/Suburb:</span>
              <span style={VAL}>{v(s.city)}</span>
            </td>
            <td style={{ ...C, padding: '3px 6px' }}>
              <span style={LBL}>Tahsil/Block</span>
              <span style={VAL}>{v(s.tahsil)}</span>
            </td>
          </tr>
          <tr>
            <td style={{ ...C, padding: '3px 6px' }}>
              <span style={LBL}>District:</span>
              <span style={VAL}>{v(s.district)}</span>
            </td>
            <td style={{ ...C, padding: '3px 6px' }}>
              <span style={LBL}>Pin Code</span>
              <div style={{ marginTop: 3 }}>
                <DigitBoxes value={v(s.pinCode)} count={6} />
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ ...C, padding: '3px 6px' }}>
              <span style={LBL}>Educational Qualification : (What do you do?)</span>
              <span style={VAL}>{v(s.qualification)}</span>
            </td>
            <td style={{ ...C, padding: '3px 6px' }}>
              <span style={LBL}>Cast/Category</span>
              <span style={VAL}>{v(s.category)}</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ════════════════════════════════════════════
          SECTION 4 — FEES AGREEMENT / SIGNATURE
          Application:
            Row 1: 🎓(span2) | "I Agree…" text + small text | Signature box
            Row 2:             | Blue TOTAL FEES             | Blue INSTALLMENT | blue blank
          Exam:
            Row 1: 🎓          | blank tall cell              | Signature box
      ════════════════════════════════════════════ */}
      {!isExam ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: B_OUTER, borderTop: 'none' }}>
          <tbody>
            <tr>
              <td rowSpan={2} style={{ ...C, width: '5%', textAlign: 'center', verticalAlign: 'middle', fontSize: '16pt', padding: '3px' }}>
                🎓
              </td>
              <td colSpan={2} style={{ ...C, fontSize: '7.5pt', padding: '5px 7px' }}>
                I Agree To Pay Rs.&nbsp;
                <span style={{ borderBottom: '1px solid #555', display: 'inline-block', minWidth: '20mm' }}>
                  {v(s.totalFees)}
                </span>
                &nbsp;(In Words)&nbsp;
                <span style={{ borderBottom: '1px solid #555', display: 'inline-block', minWidth: '45mm' }}>&nbsp;</span>
                <br />
                <span style={{ fontSize: '6.5pt', color: '#333' }}>
                  For Full Course And These Are Not To Be Refunded Under Any Circumstances.
                </span>
              </td>
              <td style={{ ...C, width: '20%', textAlign: 'center', fontSize: '6.5pt', fontWeight: 600, verticalAlign: 'bottom', padding: '4px 6px' }}>
                Signature of<br />Applicant
                <div style={{ borderTop: '1px solid #555', marginTop: 20 }} />
              </td>
            </tr>
            <tr>
              <td style={{ ...C, background: '#1a56db', color: '#fff', fontWeight: 700, fontSize: '8pt', textAlign: 'center', padding: '4px 8px' }}>
                TOTAL FEES
              </td>
              <td style={{ ...C, background: '#1a56db', color: '#fff', fontWeight: 700, fontSize: '8pt', textAlign: 'center', padding: '4px 8px' }}>
                INSTALLMENT
              </td>
              <td style={{ ...C, background: '#1a56db' }} />
            </tr>
          </tbody>
        </table>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: B_OUTER, borderTop: 'none' }}>
          <tbody>
            <tr>
              <td style={{ ...C, width: '5%', textAlign: 'center', verticalAlign: 'middle', fontSize: '16pt', padding: '3px' }}>
                🎓
              </td>
              <td style={{ ...C, padding: '26px 6px' }}>&nbsp;</td>
              <td style={{ ...C, width: '20%', textAlign: 'center', fontSize: '6.5pt', fontWeight: 600, verticalAlign: 'bottom', padding: '4px 6px' }}>
                Signature of<br />Applicant
                <div style={{ borderTop: '1px solid #555', marginTop: 20 }} />
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* ════════════════════════════════════════════
          SECTION 5 — BOTTOM INFO ROWS
          Application: Admission Date | Course Duration
                       *Certificate Issued: ___
                       Batch Time + green badge
          Exam:        Batch Time + green badge only
      ════════════════════════════════════════════ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: B_OUTER, borderTop: 'none' }}>
        <tbody>
          {!isExam && (
            <>
              <tr>
                <td style={{ ...C, width: '50%', padding: '3px 7px' }}>
                  <span style={{ ...LBL, display: 'inline' }}>Admission Date: </span>
                  <span style={{ ...VAL, display: 'inline' }}>{fmtDate(s.admissionDate)}</span>
                </td>
                <td style={{ ...C, padding: '3px 7px' }}>
                  <span style={{ ...LBL, display: 'inline' }}>Course Duration: </span>
                  <span style={{ ...VAL, display: 'inline' }}>{v(s.courseDuration)}</span>
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ ...C, padding: '3px 7px' }}>
                  <span style={{ ...LBL, display: 'inline', color: '#c0392b', fontWeight: 700 }}>
                    *Certificate Issued :&nbsp;
                  </span>
                  <span style={{ borderBottom: '1px solid #aaa', display: 'inline-block', minWidth: '65mm' }}>&nbsp;</span>
                </td>
              </tr>
            </>
          )}
          <tr>
            <td colSpan={2} style={{ ...C, padding: '3px 7px' }}>
              <span style={{ ...LBL, display: 'inline' }}>Batch Time: </span>
              <span style={{ ...VAL, display: 'inline', marginRight: 10 }}>{v(s.batchTime)}</span>
              <span style={{
                display: 'inline-block',
                background: '#1a7a3c', color: '#fff',
                fontWeight: 700, fontSize: '7pt',
                padding: '2px 12px', borderRadius: 2, marginLeft: 8,
              }}>
                *FOR OFFICE USE ONLY*
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ════════════════════════════════════════════
          SECTION 6A — FEES INSTALLMENT TABLE (Application only)
          Dark header (4 cols) + 1 filled data row + 9 blank rows
      ════════════════════════════════════════════ */}
      {!isExam && (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: B_OUTER, borderTop: 'none' }}>
          <thead>
            <tr style={{ background: '#111', color: '#fff' }}>
              {['Course Fees Paid', 'Receipt No', 'Receipt Date', 'Balance Amount'].map(h => (
                <th key={h} style={{
                  border: '1px solid #333',
                  padding: '3px 5px',
                  fontSize: '7.5pt', fontWeight: 700, textAlign: 'center', width: '25%',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...C, fontSize: '8pt', fontWeight: 700, height: 17 }}>{v(s.feesPaid)}</td>
              <td style={{ ...C, fontSize: '8pt', height: 17 }}>{v(s.receiptNumber)}</td>
              <td style={{ ...C, fontSize: '8pt', height: 17 }}>{fmtDate(s.receiptDate)}</td>
              <td style={{ ...C, fontSize: '8pt', fontWeight: 700, height: 17 }}>
                {s.totalFees ? Math.round(balance) : ''}
              </td>
            </tr>
            {Array.from({ length: 9 }).map((_, i) => (
              <tr key={i}>
                <td style={{ ...C, height: 17 }} />
                <td style={{ ...C, height: 17 }} />
                <td style={{ ...C, height: 17 }} />
                <td style={{ ...C, height: 17 }} />
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ════════════════════════════════════════════
          SECTION 6B — FOR OFFICE USE ONLY (Exam only)
          Dark full-width header + 8 blank rows (4 cols each)
      ════════════════════════════════════════════ */}
      {isExam && (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: B_OUTER, borderTop: 'none' }}>
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
                <td style={{ ...C, height: 18, width: '25%' }} />
                <td style={{ ...C, height: 18, width: '25%' }} />
                <td style={{ ...C, height: 18, width: '25%' }} />
                <td style={{ ...C, height: 18, width: '25%' }} />
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
      {/* Screen dialog — hidden when printing */}
      <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 print:hidden">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <h3 className="font-bold text-gray-900 mb-2 text-base">Print Student Forms</h3>
          <p className="text-slate-500 mb-1 text-sm"><strong>Page 1</strong> — Application Form</p>
          <p className="text-slate-500 mb-5 text-sm"><strong>Page 2</strong> — Exam Form</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
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

      {/*
        Portal to document.body — direct child so @media print rules work:
          body > * { display:none !important }          — hides #root (admin app)
          body > #student-print-doc { display:block !important } — shows the form
        inline style={{ display:'none' }} — NOT className="hidden" (Tailwind !important breaks print)
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
