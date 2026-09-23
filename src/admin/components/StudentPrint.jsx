/**
 * StudentPrint
 * ────────────
 * Renders a 2-page A4 print document matching the MCA admission form PDF.
 *
 * Page 1 — Application Form (with fees installment table)
 * Page 2 — Exam Form (same layout, Reg No header, no fees table)
 *
 * ROOT CAUSE FIX: the previous version used className="hidden print:block"
 * on #student-print-doc. Tailwind's `hidden` = `display:none !important`
 * which overrides everything including @media print rules. The element was
 * never rendered in the print layout → blank preview.
 *
 * FIX: use inline style={{ display:'none' }} (no !important) so @media print
 * can override it. Also removed page-break-inside:avoid from .print-page so
 * Chrome can paginate across the full A4 height.
 */
import React from 'react';

function fmtDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return iso; }
}
const v = (val) => val || '';

/** Resolve photo src — binary upload takes priority over URL */
function photoSrc(s) {
  if (s.photoData && s.photoMimeType) return `data:${s.photoMimeType};base64,${s.photoData}`;
  if (s.studentPhotoUrl) return s.studentPhotoUrl;
  return null;
}

function FormPage({ student: s, isExam }) {
  const fullName = [s.firstName, s.middleName, s.surname].filter(Boolean).join(' ');
  const age = (() => {
    if (!s.dateOfBirth) return '';
    const diff = Date.now() - new Date(s.dateOfBirth).getTime();
    const a = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
    return a > 0 && a < 120 ? String(a) : '';
  })();
  const balance  = (parseFloat(s.totalFees) || 0) - (parseFloat(s.feesPaid) || 0);
  const photo    = photoSrc(s);

  const ob  = { border: '1.5px solid #333' };            // outer border
  const ib  = { border: '1px solid #aaa' };              // inner border
  const lbl = { fontSize: '7pt', color: '#555', fontWeight: 600 };
  const val = { fontWeight: 700, fontSize: '8.5pt', color: '#111', minHeight: 14 };

  return (
    /* print-page class controls A4 sizing; page-break-after forces new page */
    <div className="print-page">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <table width="100%" style={{ borderCollapse: 'collapse', marginBottom: 4 }}>
        <tbody><tr>
          {/* Left col */}
          <td width="22%" style={{ verticalAlign: 'top', paddingRight: 6 }}>
            {isExam && <div style={{ fontSize: '6.5pt', fontWeight: 700, marginBottom: 2 }}>Reg No- IN8308A</div>}
            <div style={{ background: '#000', width: 16, height: 16, marginBottom: 3 }} />
            <div style={{ color: '#1565c0', fontWeight: 700, fontSize: '7pt' }}>Authorized Training Center</div>
            <div style={{ fontSize: '6.5pt', fontWeight: 600 }}>ISO Certified Institute 9001:2015</div>
          </td>

          {/* Centre: logo + address */}
          <td width="56%" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
            <img src="/images/master-computer-academy-logo.svg" alt="MCA"
              style={{ height: 50, display: 'block', margin: '0 auto' }} />
            <div style={{ fontSize: '7pt', fontWeight: 600, marginTop: 2 }}>
              18 Lok Kalyan Society, Wathoda Layout Nagpur (9156348591)
            </div>
          </td>

          {/* Right: student ID box */}
          <td width="22%" style={{ textAlign: 'right', verticalAlign: 'top' }}>
            {isExam && <div style={{ fontSize: '6.5pt', fontWeight: 700, textAlign: 'right', marginBottom: 2 }}>ALC -14210808</div>}
            <div style={{ fontWeight: 700, fontSize: '7.5pt', marginBottom: 2 }}>Student ID No{isExam ? ':' : ''}</div>
            <div style={{ border: '1.5px solid #333', minHeight: 18, padding: '2px 4px', fontWeight: 700, fontSize: '9pt' }}>
              {v(s.studentId)}
            </div>
            <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end', marginTop: 3 }}>
              {['#333', '#888', '#ccc'].map((c, i) => <div key={i} style={{ width: 14, height: 14, background: c }} />)}
            </div>
          </td>
        </tr></tbody>
      </table>

      {/* ── TITLE BAR ──────────────────────────────────────── */}
      <div style={{ background: '#2b2b2b', color: '#fff', textAlign: 'center', fontWeight: 700,
        fontSize: '11pt', padding: '3px 0', marginBottom: 3 }}>
        {isExam ? 'Exam Form' : 'Application Form'}
      </div>

      {/* Instructions */}
      <table width="100%" style={{ borderCollapse: 'collapse', marginBottom: 2 }}>
        <tbody><tr>
          <td style={{ fontSize: '7pt', fontWeight: 600 }}>
            Please fill in the form in English and CAPITAL letter only<br />
            To be Filled in by the Applicant only
          </td>
          <td style={{ fontSize: '7pt', fontWeight: 600, textAlign: 'right' }}>
            All fields marked with * are MANDATORY.&nbsp;Tick The appropriate bracket □
          </td>
        </tr></tbody>
      </table>

      {/* Course bar */}
      <div style={{ background: '#1565c0', color: '#fff', fontWeight: 700, fontSize: '8pt',
        padding: '3px 6px', marginBottom: 3 }}>
        Sir, I Request You To Admit Me To Course :-&nbsp;&nbsp;
        <span style={{ borderBottom: '1px solid #fff', display: 'inline-block', minWidth: 200 }}>{v(s.course)}</span>
      </div>

      {/* ── PERSONAL DETAILS + PHOTO ───────────────────────── */}
      <table width="100%" style={{ borderCollapse: 'collapse', ...ob }}>
        <tbody>
          <tr>
            <td rowSpan={5} width="6%" style={{ ...ib, textAlign: 'center', verticalAlign: 'middle', fontSize: '18pt', padding: 3 }}>🎓</td>
            <td colSpan={4} style={{ ...ib, padding: '2px 4px' }}>
              <span style={lbl}>First Name: </span>
              <span style={{ ...val, borderBottom: '1px solid #999', display: 'inline-block', minWidth: 240 }}>{v(s.firstName)}</span>
            </td>
            {/* Photo box — rowSpan=4 */}
            <td rowSpan={4} width="16%" style={{ ...ib, textAlign: 'center', verticalAlign: 'top', padding: 4 }}>
              <div style={{ border: '1.5px solid #555', width: 72, height: 88, margin: '0 auto',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {photo
                  ? <img src={photo} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '6pt', color: '#aaa', textAlign: 'center' }}>Photo</span>}
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ ...ib, padding: '2px 4px' }}>
              <span style={lbl}>Middle Name: </span>
              <span style={{ ...val, borderBottom: '1px solid #999', display: 'inline-block', minWidth: 90 }}>{v(s.middleName)}</span>
            </td>
            <td colSpan={2} style={{ ...ib, padding: '2px 4px' }}>
              <span style={lbl}>Mother Name: </span>
              <span style={{ ...val, borderBottom: '1px solid #999', display: 'inline-block', minWidth: 90 }}>{v(s.motherName)}</span>
            </td>
          </tr>
          <tr>
            <td colSpan={4} style={{ ...ib, padding: '2px 4px' }}>
              <span style={lbl}>Surname: </span>
              <span style={{ ...val, borderBottom: '1px solid #999', display: 'inline-block', minWidth: 240 }}>{v(s.surname)}</span>
            </td>
          </tr>
          <tr>
            <td colSpan={4} style={{ ...ib, padding: '2px 4px' }}>
              <div style={{ fontSize: '7pt', color: '#1565c0', fontWeight: 600 }}>
                Name of the applicant as it should appear on the Fee Receipt, Hall Ticket and Final Certificate.
              </div>
              <div style={{ border: '1px solid #aaa', minHeight: 15, padding: '1px 4px', ...val, marginTop: 2 }}>
                {v(s.applicantName) || fullName}
              </div>
            </td>
          </tr>
          <tr>
            <td width="26%" style={{ ...ib, padding: '2px 4px' }}>
              <div style={lbl}>Date of Birth</div>
              <div style={val}>{fmtDate(s.dateOfBirth)}</div>
            </td>
            <td width="16%" style={{ ...ib, padding: '2px 4px' }}>
              <div style={lbl}>Age</div>
              <div style={val}>{age}</div>
            </td>
            <td colSpan={2} style={{ ...ib }} />
            <td style={{ ...ib, padding: '2px 4px', textAlign: 'center', fontSize: '6.5pt', color: '#666' }}>(Photo)</td>
          </tr>
        </tbody>
      </table>

      {/* ── CONTACT ────────────────────────────────────────── */}
      <table width="100%" style={{ borderCollapse: 'collapse', ...ob, borderTop: 'none' }}>
        <tbody>
          <tr>
            <td rowSpan={2} width="5%" style={{ ...ib, textAlign: 'center', fontSize: '16pt', padding: 3 }}>📱</td>
            <td width="36%" style={{ ...ib, padding: '2px 4px' }}>
              <div style={{ ...lbl, fontWeight: 700 }}>Mobile No. (Own):</div>
              <div style={val}>+91 {v(s.ownMobile)}</div>
            </td>
            <td width="20%" style={{ ...ib, padding: '2px 4px' }}>
              <div style={lbl}>Gender:</div>
              <div style={val}>{v(s.gender)}</div>
            </td>
            <td width="5%" style={{ ...ib, textAlign: 'center', fontSize: '12pt' }}>💞</td>
            <td style={{ ...ib, padding: '2px 4px' }}>
              <div style={lbl}>Marital Status:</div>
              <div style={val}>{v(s.maritalStatus)}</div>
            </td>
          </tr>
          <tr>
            <td style={{ ...ib, padding: '2px 4px' }}>
              <div style={lbl}>Mobile No.(Other): WhatsApp</div>
              <div style={val}>+91 {v(s.otherMobile)}</div>
            </td>
            <td colSpan={3} style={{ ...ib, padding: '2px 4px' }}>
              <div style={{ ...lbl, fontWeight: 700 }}>Aadhaar Number:</div>
              <div style={val}>{v(s.aadhaarNumber)}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── ADDRESS ────────────────────────────────────────── */}
      <table width="100%" style={{ borderCollapse: 'collapse', ...ob, borderTop: 'none' }}>
        <tbody>
          <tr>
            <td rowSpan={4} width="5%" style={{ ...ib, textAlign: 'center', fontSize: '16pt', padding: 3 }}>📍</td>
            <td colSpan={3} style={{ ...ib, padding: '2px 4px', fontWeight: 700, fontSize: '8pt' }}>Address for Correspondence :</td>
          </tr>
          <tr>
            <td style={{ ...ib, padding: '2px 4px' }}>
              <div style={lbl}>House No./Building No.</div><div style={val}>{v(s.houseNo)}</div>
            </td>
            <td style={{ ...ib, padding: '2px 4px' }}>
              <div style={lbl}>Stree/Colony</div><div style={val}>{v(s.street)}</div>
            </td>
          </tr>
          <tr>
            <td style={{ ...ib, padding: '2px 4px' }}>
              <div style={lbl}>City/Village/Suburb</div><div style={val}>{v(s.city)}</div>
            </td>
            <td style={{ ...ib, padding: '2px 4px' }}>
              <div style={lbl}>Tahsil/Block</div><div style={val}>{v(s.tahsil)}</div>
            </td>
          </tr>
          <tr>
            <td style={{ ...ib, padding: '2px 4px' }}>
              <div style={lbl}>District</div><div style={val}>{v(s.district)}</div>
            </td>
            <td style={{ ...ib, padding: '2px 4px' }}>
              <div style={lbl}>Pin Code</div><div style={val}>{v(s.pinCode)}</div>
            </td>
          </tr>
          <tr>
            <td style={{ ...ib }} />
            <td style={{ ...ib, padding: '2px 4px' }}>
              <div style={lbl}>Educational Qualification: (What do you do?)</div><div style={val}>{v(s.qualification)}</div>
            </td>
            <td style={{ ...ib, padding: '2px 4px' }}>
              <div style={lbl}>Cast/Category</div><div style={val}>{v(s.category)}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── FEES AGREEMENT / SIGNATURE ─────────────────────── */}
      {!isExam ? (
        <table width="100%" style={{ borderCollapse: 'collapse', ...ob, borderTop: 'none' }}>
          <tbody>
            <tr>
              <td width="5%" style={{ ...ib, textAlign: 'center', fontSize: '16pt', padding: 3 }} rowSpan={2}>🎓</td>
              <td colSpan={2} style={{ ...ib, padding: '3px 4px', fontSize: '7.5pt' }}>
                I Agree To Pay Rs.&nbsp;
                <span style={{ borderBottom: '1px solid #555', display: 'inline-block', minWidth: 80 }}>{s.totalFees || ''}</span>
                &nbsp;(In Words)&nbsp;
                <span style={{ borderBottom: '1px solid #555', display: 'inline-block', minWidth: 150 }}>&nbsp;</span>
                <br />
                <span style={{ fontSize: '7pt' }}>For Full Course And These Are Not To Be Refunded Under Any Circumstances.</span>
              </td>
              <td width="18%" style={{ ...ib, padding: '2px 4px', textAlign: 'center', fontSize: '7pt', fontWeight: 600, verticalAlign: 'bottom' }}>
                Signature of<br />Applicant<br /><br /><br />
                <div style={{ borderTop: '1px solid #555', marginTop: 6 }} />
              </td>
            </tr>
            <tr>
              <td style={{ ...ib, background: '#1565c0', color: '#fff', fontWeight: 700, fontSize: '8pt', padding: '3px 6px', textAlign: 'center' }}>TOTAL FEES</td>
              <td style={{ ...ib, background: '#1565c0', color: '#fff', fontWeight: 700, fontSize: '8pt', padding: '3px 6px', textAlign: 'center' }}>INSTALLMENT</td>
              <td style={{ ...ib, background: '#1565c0' }} />
            </tr>
          </tbody>
        </table>
      ) : (
        <table width="100%" style={{ borderCollapse: 'collapse', ...ob, borderTop: 'none' }}>
          <tbody><tr>
            <td width="5%" style={{ ...ib, textAlign: 'center', fontSize: '16pt', padding: 3 }}>🎓</td>
            <td style={{ ...ib, padding: '18px 4px' }}>&nbsp;</td>
            <td width="20%" style={{ ...ib, padding: '2px 4px', textAlign: 'center', fontSize: '7pt', fontWeight: 600, verticalAlign: 'bottom' }}>
              Signature of<br />Applicant<br /><br />
              <div style={{ borderTop: '1px solid #555', marginTop: 6 }} />
            </td>
          </tr></tbody>
        </table>
      )}

      {/* ── BOTTOM INFO ROW ────────────────────────────────── */}
      <table width="100%" style={{ borderCollapse: 'collapse', ...ob, borderTop: 'none' }}>
        <tbody>
          {!isExam && (
            <>
              <tr>
                <td width="38%" style={{ ...ib, padding: '2px 6px' }}>
                  <span style={lbl}>Admission Date: </span><span style={val}>{fmtDate(s.admissionDate)}</span>
                </td>
                <td style={{ ...ib, padding: '2px 6px' }}>
                  <span style={lbl}>Course Duration: </span><span style={val}>{v(s.courseDuration)}</span>
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ ...ib, padding: '2px 6px' }}>
                  <span style={{ ...lbl, color: '#c62828', fontWeight: 700 }}>*Certificate Issued : </span>
                  <span style={{ borderBottom: '1px solid #aaa', display: 'inline-block', minWidth: 280 }}>&nbsp;</span>
                </td>
              </tr>
            </>
          )}
          <tr>
            <td colSpan={2} style={{ ...ib, padding: '2px 6px' }}>
              <span style={lbl}>Batch Time: </span>
              <span style={val}>{v(s.batchTime)}</span>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span style={{ background: '#1a7a3c', color: '#fff', fontWeight: 700, fontSize: '7.5pt', padding: '2px 12px', borderRadius: 2 }}>
                *FOR OFFICE USE ONLY*
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── FEES TABLE (Application only) ──────────────────── */}
      {!isExam && (
        <table width="100%" style={{ borderCollapse: 'collapse', ...ob, borderTop: 'none' }}>
          <thead>
            <tr style={{ background: '#111', color: '#fff' }}>
              {['Course Fees Paid', 'Receipt No', 'Receipt Date', 'Balance Amount'].map(h => (
                <th key={h} style={{ border: '1px solid #555', padding: '3px 4px', fontSize: '7.5pt', fontWeight: 700, textAlign: 'center' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...ib, padding: '2px 4px', fontSize: '8pt', fontWeight: 700, height: 17 }}>{v(s.feesPaid)}</td>
              <td style={{ ...ib, padding: '2px 4px', fontSize: '8pt', height: 17 }}>{v(s.receiptNumber)}</td>
              <td style={{ ...ib, padding: '2px 4px', fontSize: '8pt', height: 17 }}>{fmtDate(s.receiptDate)}</td>
              <td style={{ ...ib, padding: '2px 4px', fontSize: '8pt', fontWeight: 700, height: 17 }}>
                {s.totalFees ? balance.toFixed(0) : ''}
              </td>
            </tr>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                <td style={{ ...ib, height: 17 }} /><td style={{ ...ib, height: 17 }} />
                <td style={{ ...ib, height: 17 }} /><td style={{ ...ib, height: 17 }} />
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── EXAM OFFICE USE ONLY ───────────────────────────── */}
      {isExam && (
        <table width="100%" style={{ borderCollapse: 'collapse', ...ob, borderTop: 'none' }}>
          <thead>
            <tr style={{ background: '#111', color: '#fff' }}>
              <th colSpan={4} style={{ padding: '3px 4px', fontSize: '7.5pt', fontWeight: 700, textAlign: 'center' }}>*FOR OFFICE USE ONLY*</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                <td style={{ ...ib, height: 17, width: '25%' }} /><td style={{ ...ib, height: 17, width: '25%' }} />
                <td style={{ ...ib, height: 17, width: '25%' }} /><td style={{ ...ib, height: 17, width: '25%' }} />
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────── */
export default function StudentPrint({ student, onClose }) {
  if (!student) return null;

  return (
    <>
      {/* Screen overlay — print:hidden so it disappears when printing */}
      <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 print:hidden">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <h3 className="font-bold text-gray-900 mb-2" style={{ fontSize: 16 }}>Print Student Forms</h3>
          <p className="text-slate-500 mb-1" style={{ fontSize: 13 }}><strong>Page 1</strong> — Application Form</p>
          <p className="text-slate-500 mb-5" style={{ fontSize: 13 }}><strong>Page 2</strong> — Exam Form</p>
          <div className="flex gap-3 justify-end">
            <button onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={() => window.print()} className="admin-btn-primary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print
            </button>
          </div>
        </div>
      </div>

      {/*
        CRITICAL: use inline style={{ display:'none' }} — NOT className="hidden".
        Tailwind's `hidden` = display:none !important which @media print cannot override.
        Inline style has no !important so the @media print rule can show this element.
      */}
      <div id="student-print-doc" style={{ display: 'none' }}>
        <FormPage student={student} isExam={false} />
        <FormPage student={student} isExam={true} />
      </div>
    </>
  );
}
