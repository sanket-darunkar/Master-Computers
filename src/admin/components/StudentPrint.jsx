/**
 * StudentPrint
 * ────────────
 * Matches the exact Master Computer Academy admission form layout from PDF.
 *
 * Page 1 — Application Form (with fees installment table at bottom)
 * Page 2 — Exam Form        (same layout, no fees table, with Reg No)
 *
 * Screen: shows a confirmation dialog overlay (print:hidden)
 * Print:  only #student-print-doc is visible — all admin UI hidden
 */
import React from 'react';

function fmtDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return iso; }
}
const v = (val) => val || '';

/* ── Reusable field cell ─────────────────────────────────────── */
function Cell({ label, value, w = 'auto', border = true }) {
  return (
    <td style={{ border: border ? '1px solid #999' : 'none', padding: '2px 4px', width: w, verticalAlign: 'top', fontSize: '8pt' }}>
      {label && <div style={{ fontSize: '7pt', color: '#555', fontWeight: 600, marginBottom: 1 }}>{label}</div>}
      <div style={{ minHeight: 14, fontWeight: 700, fontSize: '8.5pt', color: '#111' }}>{value}</div>
    </td>
  );
}

/* ── Both pages share this shell ─────────────────────────────── */
function FormPage({ student: s, isExam }) {
  const fullName = [s.firstName, s.middleName, s.surname].filter(Boolean).join(' ');
  const age = (() => {
    if (!s.dateOfBirth) return '';
    const diff = Date.now() - new Date(s.dateOfBirth).getTime();
    const a = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
    return a > 0 && a < 120 ? String(a) : '';
  })();
  const balance = (parseFloat(s.totalFees) || 0) - (parseFloat(s.feesPaid) || 0);

  const outerBorder = { border: '1.5px solid #333' };
  const innerBorder = { border: '1px solid #aaa' };
  const tdStyle = { ...innerBorder, padding: '2px 4px', fontSize: '8pt', verticalAlign: 'top' };
  const labelStyle = { fontSize: '7pt', color: '#555', fontWeight: 600 };
  const valueStyle = { fontWeight: 700, fontSize: '8.5pt', color: '#111', minHeight: 14 };

  /* installment rows — show up to 8 rows for the fees table */
  const installmentRows = Array.from({ length: 8 });

  return (
    <div className="print-page" style={{ fontFamily: 'Arial, sans-serif', fontSize: '8pt', color: '#111' }}>

      {/* ── HEADER ───────────────────────────────────────────── */}
      <table width="100%" style={{ borderCollapse: 'collapse', marginBottom: 3 }}>
        <tbody>
          <tr>
            {/* Left: black box + Authorized Training Center */}
            <td width="22%" style={{ verticalAlign: 'top', paddingRight: 6 }}>
              {isExam && (
                <div style={{ fontSize: '6.5pt', fontWeight: 700, color: '#000', marginBottom: 2 }}>
                  Reg No- IN8308A
                </div>
              )}
              <div style={{ background: '#000', width: 18, height: 18, marginBottom: 4 }} />
              <div style={{ color: '#1565c0', fontWeight: 700, fontSize: '7pt' }}>Authorized Training Center</div>
              <div style={{ fontSize: '6.5pt', fontWeight: 600 }}>ISO Certified Institute 9001:2015</div>
            </td>

            {/* Centre: Logo + address */}
            <td width="56%" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
              <img src="/images/master-computer-academy-logo.svg" alt="MCA" style={{ height: 52 }} />
              <div style={{ fontSize: '7pt', fontWeight: 600, marginTop: 2 }}>
                18 Lok Kalyan Society, Wathoda Layout Nagpur (9156348591)
              </div>
            </td>

            {/* Right: Student ID + colour boxes */}
            <td width="22%" style={{ textAlign: 'right', verticalAlign: 'top' }}>
              {isExam && (
                <div style={{ fontSize: '6.5pt', fontWeight: 700, color: '#000', textAlign: 'right', marginBottom: 2 }}>
                  ALC -14210808
                </div>
              )}
              <div style={{ fontWeight: 700, fontSize: '7.5pt', marginBottom: 3 }}>Student ID No{isExam ? ':' : ''}</div>
              <div style={{ border: '1.5px solid #333', minHeight: 18, padding: '2px 4px', fontWeight: 700, fontSize: '9pt' }}>
                {v(s.studentId)}
              </div>
              {/* Colour indicator boxes */}
              <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end', marginTop: 4 }}>
                {['#333', '#999', '#ccc'].map((c, i) => (
                  <div key={i} style={{ width: 16, height: 16, background: c }} />
                ))}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── FORM TITLE ───────────────────────────────────────── */}
      <div style={{ background: '#333', color: '#fff', textAlign: 'center', fontWeight: 700, fontSize: '11pt', padding: '4px 0', borderRadius: 2, marginBottom: 3 }}>
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
            All fields marked with * are MANDATORY. Tick The appropriate bracket □
          </td>
        </tr></tbody>
      </table>

      {/* Course request bar */}
      <div style={{ background: '#1565c0', color: '#fff', fontWeight: 700, fontSize: '8pt', padding: '3px 6px', marginBottom: 4 }}>
        Sir, I Request You To Admit Me To Course :- &nbsp;&nbsp;&nbsp;
        <span style={{ borderBottom: '1px solid #fff', display: 'inline-block', minWidth: 180 }}>{v(s.course)}</span>
      </div>

      {/* ── PERSONAL DETAILS + PHOTO ──────────────────────────── */}
      <table width="100%" style={{ borderCollapse: 'collapse', marginBottom: 0, ...outerBorder }}>
        <tbody>
          <tr>
            {/* Icon column */}
            <td rowSpan={5} width="6%" style={{ ...innerBorder, textAlign: 'center', verticalAlign: 'middle', padding: 4, fontSize: '20pt' }}>
              🎓
            </td>

            {/* Main personal fields */}
            <td colSpan={4} style={{ ...innerBorder, padding: '2px 4px' }}>
              <span style={labelStyle}>First Name: </span>
              <span style={{ ...valueStyle, borderBottom: '1px solid #999', display: 'inline-block', minWidth: 260 }}>{v(s.firstName)}</span>
            </td>

            {/* Photo box — rowspan */}
            <td rowSpan={4} width="15%" style={{ ...innerBorder, textAlign: 'center', verticalAlign: 'top', padding: 4 }}>
              <div style={{ border: '1.5px solid #555', width: 70, height: 85, margin: '0 auto', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.studentPhotoUrl
                  ? <img src={s.studentPhotoUrl} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '6pt', color: '#aaa', textAlign: 'center', padding: 2 }}>Photo</span>
                }
              </div>
            </td>
          </tr>

          <tr>
            <td colSpan={2} style={{ ...innerBorder, padding: '2px 4px' }}>
              <span style={labelStyle}>Middle Name: </span>
              <span style={{ ...valueStyle, borderBottom: '1px solid #999', display: 'inline-block', minWidth: 100 }}>{v(s.middleName)}</span>
            </td>
            <td colSpan={2} style={{ ...innerBorder, padding: '2px 4px' }}>
              <span style={labelStyle}>Mother Name: </span>
              <span style={{ ...valueStyle, borderBottom: '1px solid #999', display: 'inline-block', minWidth: 100 }}>{v(s.motherName)}</span>
            </td>
          </tr>

          <tr>
            <td colSpan={4} style={{ ...innerBorder, padding: '2px 4px' }}>
              <span style={labelStyle}>Surname: </span>
              <span style={{ ...valueStyle, borderBottom: '1px solid #999', display: 'inline-block', minWidth: 260 }}>{v(s.surname)}</span>
            </td>
          </tr>

          <tr>
            <td colSpan={4} style={{ ...innerBorder, padding: '2px 4px' }}>
              <span style={{ fontSize: '7pt', color: '#1565c0', fontWeight: 600 }}>
                Name of the applicant as it should appear on the Fee Receipt, Hall Ticket and Final Certificate.
              </span>
              <div style={{ border: '1px solid #aaa', minHeight: 16, padding: '1px 4px', fontWeight: 700, fontSize: '8.5pt', marginTop: 2 }}>
                {v(s.applicantName) || fullName}
              </div>
            </td>
          </tr>

          {/* DOB + Age + Photo continues */}
          <tr>
            <td width="28%" style={{ ...innerBorder, padding: '2px 4px', fontWeight: 700, fontSize: '8pt' }}>
              <span style={labelStyle}>Date of Birth</span>
              <div style={{ ...valueStyle, marginTop: 1 }}>{fmtDate(s.dateOfBirth)}</div>
            </td>
            <td width="18%" style={{ ...innerBorder, padding: '2px 4px', fontWeight: 700, fontSize: '8pt' }}>
              <span style={labelStyle}>Age</span>
              <div style={{ ...valueStyle, marginTop: 1 }}>{age}</div>
            </td>
            <td colSpan={2} width="33%" style={{ ...innerBorder, padding: '2px 4px', fontSize: '7pt', color: '#777', fontStyle: 'italic' }}>
              {/* spacer */}
            </td>
            {/* Photo cell ends with rowspan */}
            <td style={{ ...innerBorder, padding: '2px 4px', textAlign: 'center', fontSize: '6.5pt', color: '#555' }}>
              (Photo)
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── CONTACT ROW ───────────────────────────────────────── */}
      <table width="100%" style={{ borderCollapse: 'collapse', ...outerBorder, borderTop: 'none' }}>
        <tbody>
          <tr>
            <td width="5%" style={{ ...innerBorder, textAlign: 'center', fontSize: '18pt', padding: 4 }} rowSpan={2}>📱</td>
            <td width="38%" style={{ ...innerBorder, padding: '2px 4px' }}>
              <div style={{ ...labelStyle, fontWeight: 700 }}>Mobile No. (Own):</div>
              <div style={{ ...valueStyle }}>+91 &nbsp; {v(s.ownMobile)}</div>
            </td>
            <td width="20%" style={{ ...innerBorder, padding: '2px 4px' }}>
              <div style={labelStyle}>Gender:</div>
              <div style={valueStyle}>{v(s.gender)}</div>
            </td>
            <td width="5%" style={{ ...innerBorder, textAlign: 'center', fontSize: '14pt' }}>💞</td>
            <td width="25%" style={{ ...innerBorder, padding: '2px 4px' }}>
              <div style={labelStyle}>Marital Status:</div>
              <div style={valueStyle}>{v(s.maritalStatus)}</div>
            </td>
          </tr>
          <tr>
            <td style={{ ...innerBorder, padding: '2px 4px' }}>
              <div style={labelStyle}>Mobile No.(Other): WhatsApp</div>
              <div style={valueStyle}>+91 &nbsp; {v(s.otherMobile)}</div>
            </td>
            <td colSpan={3} style={{ ...innerBorder, padding: '2px 4px' }}>
              <div style={{ ...labelStyle, fontWeight: 700 }}>Aadhaar Number:</div>
              <div style={valueStyle}>{v(s.aadhaarNumber)}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── ADDRESS ───────────────────────────────────────────── */}
      <table width="100%" style={{ borderCollapse: 'collapse', ...outerBorder, borderTop: 'none' }}>
        <tbody>
          <tr>
            <td width="5%" style={{ ...innerBorder, textAlign: 'center', fontSize: '18pt', padding: 4 }} rowSpan={3}>📍</td>
            <td colSpan={3} style={{ ...innerBorder, padding: '2px 4px', fontWeight: 700, fontSize: '8pt' }}>
              Address for Correspondence :
            </td>
          </tr>
          <tr>
            <td style={{ ...innerBorder, padding: '2px 4px' }}>
              <span style={labelStyle}>House No./Building No. </span>
              <div style={valueStyle}>{v(s.houseNo)}</div>
            </td>
            <td style={{ ...innerBorder, padding: '2px 4px' }}>
              <span style={labelStyle}>Stree/Colony </span>
              <div style={valueStyle}>{v(s.street)}</div>
            </td>
          </tr>
          <tr>
            <td style={{ ...innerBorder, padding: '2px 4px' }}>
              <span style={labelStyle}>City/Village/Suburb </span>
              <div style={valueStyle}>{v(s.city)}</div>
            </td>
            <td style={{ ...innerBorder, padding: '2px 4px' }}>
              <span style={labelStyle}>Tahsil/Block </span>
              <div style={valueStyle}>{v(s.tahsil)}</div>
            </td>
          </tr>
          <tr>
            <td style={{ ...innerBorder }} />
            <td style={{ ...innerBorder, padding: '2px 4px' }}>
              <span style={labelStyle}>District </span>
              <div style={valueStyle}>{v(s.district)}</div>
            </td>
            <td style={{ ...innerBorder, padding: '2px 4px' }}>
              <span style={labelStyle}>Pin Code </span>
              <div style={valueStyle}>{v(s.pinCode)}</div>
            </td>
          </tr>
          <tr>
            <td style={{ ...innerBorder }} />
            <td style={{ ...innerBorder, padding: '2px 4px' }}>
              <span style={labelStyle}>Educational Qualification: (What do you do?) </span>
              <div style={valueStyle}>{v(s.qualification)}</div>
            </td>
            <td style={{ ...innerBorder, padding: '2px 4px' }}>
              <span style={labelStyle}>Cast/Category </span>
              <div style={valueStyle}>{v(s.category)}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── FEES AGREEMENT + SIGNATURE (Application only) ─────── */}
      {!isExam && (
        <table width="100%" style={{ borderCollapse: 'collapse', ...outerBorder, borderTop: 'none' }}>
          <tbody>
            <tr>
              <td width="5%" style={{ ...innerBorder, textAlign: 'center', fontSize: '18pt', padding: 4 }} rowSpan={2}>🎓</td>
              <td colSpan={2} style={{ ...innerBorder, padding: '3px 4px', fontSize: '7.5pt' }}>
                I Agree To Pay Rs.&nbsp;
                <span style={{ borderBottom: '1px solid #555', display: 'inline-block', minWidth: 80 }}>
                  {s.totalFees ? s.totalFees : ''}
                </span>
                &nbsp;(In Words)&nbsp;
                <span style={{ borderBottom: '1px solid #555', display: 'inline-block', minWidth: 160 }}>&nbsp;</span>
                <br />
                <span style={{ fontSize: '7pt' }}>For Full Course And These Are Not To Be Refunded Under Any Circumstances.</span>
              </td>
              <td width="18%" style={{ ...innerBorder, padding: '2px 4px', textAlign: 'center', fontSize: '7pt', fontWeight: 600 }}>
                Signature of<br />Applicant<br /><br /><br />
                <div style={{ borderTop: '1px solid #555', marginTop: 8 }} />
              </td>
            </tr>
            <tr>
              <td style={{ ...innerBorder, background: '#1565c0', color: '#fff', fontWeight: 700, fontSize: '8pt', padding: '3px 6px', textAlign: 'center' }}>
                TOTAL FEES
              </td>
              <td style={{ ...innerBorder, background: '#1565c0', color: '#fff', fontWeight: 700, fontSize: '8pt', padding: '3px 6px', textAlign: 'center' }}>
                INSTALLMENT
              </td>
              <td style={{ ...innerBorder, background: '#1565c0', padding: 0 }} />
            </tr>
          </tbody>
        </table>
      )}

      {/* Exam form — signature area */}
      {isExam && (
        <table width="100%" style={{ borderCollapse: 'collapse', ...outerBorder, borderTop: 'none' }}>
          <tbody>
            <tr>
              <td width="5%" style={{ ...innerBorder, textAlign: 'center', fontSize: '18pt', padding: 4 }}>🎓</td>
              <td style={{ ...innerBorder, padding: '20px 4px', minHeight: 50 }}>&nbsp;</td>
              <td width="22%" style={{ ...innerBorder, padding: '2px 4px', textAlign: 'center', fontSize: '7pt', fontWeight: 600, verticalAlign: 'bottom' }}>
                Signature of<br />Applicant<br /><br />
                <div style={{ borderTop: '1px solid #555', marginTop: 8 }} />
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* ── BOTTOM SECTION ────────────────────────────────────── */}
      <table width="100%" style={{ borderCollapse: 'collapse', ...outerBorder, borderTop: 'none', marginBottom: 0 }}>
        <tbody>
          {!isExam && (
            <tr>
              <td width="35%" style={{ ...innerBorder, padding: '2px 6px' }}>
                <span style={labelStyle}>Admission Date: </span>
                <span style={{ ...valueStyle }}>{fmtDate(s.admissionDate)}</span>
              </td>
              <td style={{ ...innerBorder, padding: '2px 6px' }}>
                <span style={labelStyle}>Course Duration: </span>
                <span style={valueStyle}>{v(s.courseDuration)}</span>
              </td>
            </tr>
          )}
          {!isExam && (
            <tr>
              <td colSpan={2} style={{ ...innerBorder, padding: '2px 6px' }}>
                <span style={{ ...labelStyle, color: '#c62828', fontWeight: 700 }}>*Certificate Issued : </span>
                <span style={{ borderBottom: '1px solid #aaa', display: 'inline-block', minWidth: 300 }}>&nbsp;</span>
              </td>
            </tr>
          )}
          <tr>
            <td colSpan={2} style={{ ...innerBorder, padding: '2px 6px' }}>
              <span style={labelStyle}>Batch Time: </span>
              <span style={valueStyle}>{v(s.batchTime)}</span>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span style={{ background: '#1a7a3c', color: '#fff', fontWeight: 700, fontSize: '8pt', padding: '2px 14px', borderRadius: 2 }}>
                *FOR OFFICE USE ONLY*
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── FEES TABLE (Application only) ─────────────────────── */}
      {!isExam && (
        <table width="100%" style={{ borderCollapse: 'collapse', ...outerBorder, borderTop: 'none' }}>
          <thead>
            <tr style={{ background: '#111', color: '#fff' }}>
              {['Course Fees Paid', 'Receipt No', 'Receipt Date', 'Balance Amount'].map(h => (
                <th key={h} style={{ border: '1px solid #555', padding: '3px 4px', fontSize: '7.5pt', fontWeight: 700, textAlign: 'center' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* First row pre-filled with first payment */}
            <tr>
              <td style={{ ...innerBorder, padding: '2px 4px', fontSize: '8pt', fontWeight: 700, minHeight: 16, height: 18 }}>{s.feesPaid || ''}</td>
              <td style={{ ...innerBorder, padding: '2px 4px', fontSize: '8pt', height: 18 }}>{v(s.receiptNumber)}</td>
              <td style={{ ...innerBorder, padding: '2px 4px', fontSize: '8pt', height: 18 }}>{fmtDate(s.receiptDate)}</td>
              <td style={{ ...innerBorder, padding: '2px 4px', fontSize: '8pt', fontWeight: 700, height: 18 }}>
                {s.totalFees ? balance.toFixed(0) : ''}
              </td>
            </tr>
            {/* Blank installment rows */}
            {installmentRows.map((_, i) => (
              <tr key={i}>
                <td style={{ ...innerBorder, height: 18 }} />
                <td style={{ ...innerBorder, height: 18 }} />
                <td style={{ ...innerBorder, height: 18 }} />
                <td style={{ ...innerBorder, height: 18 }} />
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Exam form — FOR OFFICE USE ONLY blank area */}
      {isExam && (
        <table width="100%" style={{ borderCollapse: 'collapse', ...outerBorder, borderTop: 'none' }}>
          <thead>
            <tr style={{ background: '#111', color: '#fff' }}>
              <th colSpan={4} style={{ padding: '3px 4px', fontSize: '7.5pt', fontWeight: 700, textAlign: 'center' }}>
                *FOR OFFICE USE ONLY*
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                <td style={{ ...innerBorder, height: 18, width: '25%' }} />
                <td style={{ ...innerBorder, height: 18, width: '25%' }} />
                <td style={{ ...innerBorder, height: 18, width: '25%' }} />
                <td style={{ ...innerBorder, height: 18, width: '25%' }} />
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
      {/* Screen overlay — hidden when printing */}
      <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 print:hidden">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <h3 className="font-extrabold text-gray-900 text-base mb-2">Print Student Forms</h3>
          <p className="text-sm text-gray-500 mb-1"><strong>Page 1</strong> — Application Form</p>
          <p className="text-sm text-gray-500 mb-5"><strong>Page 2</strong> — Exam Form</p>
          <div className="flex gap-3 justify-end">
            <button onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={() => window.print()} className="btn-primary btn-md text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Printable document — hidden on screen, shown only when printing */}
      <div id="student-print-doc" className="hidden print:block">
        <FormPage student={student} isExam={false} />
        <FormPage student={student} isExam={true} />
      </div>
    </>
  );
}
