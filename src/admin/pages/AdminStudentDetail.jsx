import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout           from '../components/AdminLayout';
import StatusBadge           from '../components/StatusBadge';
import ConfirmDialog         from '../components/ConfirmDialog';
import StudentPrint          from '../components/StudentPrint';
import { useToast }          from '../components/Toast';
import { getStudent, updateStudentStatus, deleteStudent } from '../../services/adminApi';
import { adminNavigate }     from '../AdminApp';

function fmtDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }); }
  catch { return iso; }
}
const f = (v) => v || '—';

function Row({ label, value }) {
  if (!value || value === '—') return null;
  return (
    <div className="admin-detail-row">
      <span className="admin-detail-label">{label}</span>
      <span className="admin-detail-value">{value}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <p className="admin-form-section-title">
        <span className="admin-form-section-dot" />
        {title}
      </p>
      {children}
    </div>
  );
}

const EXAM_FORM_STATUSES = ['Exam Form Submitted', 'Exam Form Pending'];

// Helper: get per-course status from the map, falling back to the
// legacy top-level examForm if the map is absent (old data).
function getCourseStatus(student, courseName) {
  if (student.courseExamStatuses && student.courseExamStatuses[courseName] !== undefined) {
    return student.courseExamStatuses[courseName];
  }
  // Fallback for rows created before the per-course feature
  return student.examForm || 'Exam Form Pending';
}

const IcoEdit  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoPrint = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const IcoChev  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>;
const IcoTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;

export default function AdminStudentDetail({ id }) {
  const { showToast }  = useToast();
  const [student,      setStudent]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus,    setNewStatus]    = useState('');
  const [statusLoading,setStatusLoading]= useState(false);
  const [showPrint,    setShowPrint]    = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteLoading,setDeleteLoading]= useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setStudent(await getStudent(id)); }
    catch (err) { setError(err.message || 'Failed to load student.'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const confirmStatus = async () => {
    setStatusLoading(true);
    try {
      const updated = await updateStudentStatus(id, newStatus.examForm, newStatus.courseName);
      setStudent(updated);
      setStatusDialog(false);
      const label = newStatus.courseName
        ? `${newStatus.courseName}: "${newStatus.examForm}"`
        : `All courses: "${newStatus.examForm}"`;
      showToast(`Exam Form updated — ${label}`, 'success');
    } catch (err) { showToast(err.message || 'Failed to update Exam Form.', 'error'); }
    finally { setStatusLoading(false); }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteStudent(id);
      showToast('Student deleted successfully.', 'success');
      adminNavigate('/admin/students');
    } catch (err) {
      showToast(err.message || 'Failed to delete student.', 'error');
      setDeleteDialog(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return (
    <AdminLayout title="Student Details">
      <div className="admin-loading">
        <svg className="animate-spin admin-spinner h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Loading student…
      </div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout title="Student Details">
      <div className="admin-error" style={{ maxWidth: 520 }}>
        {error} <button onClick={load} className="underline ml-2">Retry</button>
      </div>
    </AdminLayout>
  );

  if (!student) return null;

  const fullName = [student.firstName, student.middleName, student.surname].filter(Boolean).join(' ');
  // Balance = total − sum of all installment payments (falls back to legacy feesPaid)
  const totalPaid = Array.isArray(student.installments) && student.installments.length > 0
    ? student.installments.reduce((s, i) => s + (parseFloat(i.amountPaid) || 0), 0)
    : parseFloat(student.feesPaid) || 0;
  const balance  = (parseFloat(student.totalFees) || 0) - totalPaid;

  // Build photo src using the same 3-field priority as certificates:
  // 1. Binary blob (photoData + photoMimeType) — most reliable, no network required
  // 2. URL (studentPhotoUrl)                   — legacy / CDN-stored
  // 3. null                                     — show placeholder
  const photoSrc = student.photoData && student.photoMimeType
    ? `data:${student.photoMimeType};base64,${student.photoData}`
    : student.studentPhotoUrl || null;

  return (
    <AdminLayout title="Student Details" subtitle={`${fullName} · ${student.studentId}`}>

      {showPrint && <StudentPrint student={student} onClose={() => setShowPrint(false)} />}

      <ConfirmDialog
        open={deleteDialog}
        title="Delete Student?"
        message={`This will permanently delete "${fullName}" (${student.studentId}) and all their data. This cannot be undone.`}
        confirmLabel="Delete Student"
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog(false)}
      />

      <ConfirmDialog
        open={statusDialog}
        title={newStatus.courseName
          ? `Change "${newStatus.courseName}" to "${newStatus.examForm}"?`
          : `Change all courses to "${newStatus.examForm}"?`}
        message={newStatus.courseName
          ? `This will update the Exam Form status for "${newStatus.courseName}" only.`
          : `This will update Exam Form status for all enrolled courses.`}
        confirmLabel={`Set ${newStatus.examForm}`}
        confirmClass="bg-blue-600 hover:bg-blue-700 text-white"
        loading={statusLoading}
        onConfirm={confirmStatus}
        onCancel={() => setStatusDialog(false)}
      />

      {/* Breadcrumb */}
      <div className="admin-breadcrumb">
        <button onClick={() => adminNavigate('/admin/students')} className="admin-breadcrumb-link">Students</button>
        <span className="admin-breadcrumb-sep">›</span>
        <span className="admin-breadcrumb-current font-mono">{student.studentId}</span>
      </div>

      {/* Action bar */}
      <div className="admin-action-bar">
        <button onClick={() => adminNavigate(`/admin/students/${id}/edit`)} className="admin-btn-secondary">
          <IcoEdit /> Edit
        </button>
        <button onClick={() => setShowPrint(true)} className="admin-btn-secondary">
          <IcoPrint /> Print Forms
        </button>
        <button onClick={() => setDeleteDialog(true)} className="admin-btn-danger">
          <IcoTrash /> Delete Student
        </button>
        {/* Per-course Exam Form dropdowns */}
        {(Array.isArray(student.courses) && student.courses.length > 0
          ? student.courses
          : student.course ? [student.course] : []
        ).map(courseName => {
          const current = getCourseStatus(student, courseName);
          const others  = EXAM_FORM_STATUSES.filter(s => s !== current);
          return (
            <div key={courseName} className="relative group">
              <button className="admin-btn-secondary flex items-center gap-2 text-xs">
                <span className="max-w-[120px] truncate font-semibold">{courseName}</span>
                <IcoChev />
              </button>
              <div className="admin-status-menu-panel opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible transition-all duration-150 min-w-[200px]">
                <div className="px-3 py-1.5 text-xs text-gray-400 font-semibold border-b border-gray-100 truncate">
                  {courseName}
                </div>
                {others.map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setNewStatus({ examForm: s, courseName });
                      setStatusDialog(true);
                    }}
                    className={`admin-status-menu-item ${s === 'Exam Form Submitted' ? 'text-green-700 hover:bg-green-50' : 'text-yellow-700 hover:bg-yellow-50'}`}
                  >
                    Set {s}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Profile card */}
      <div className="admin-card overflow-hidden">
        {/* Profile header */}
        <div className="admin-profile-header">
          <div className="flex-shrink-0">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt={fullName}
                className="admin-profile-photo"
                onError={e => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`admin-profile-photo-placeholder ${photoSrc ? 'hidden' : 'flex'}`}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="admin-profile-name">{fullName}</div>
            <div className="admin-profile-sub">
              {Array.isArray(student.courses) && student.courses.length > 0
                ? student.courses.join(' · ')
                : f(student.course)}
            </div>
            <div className="admin-profile-id">{student.studentId}</div>
          </div>
          <div className="flex-shrink-0"><StatusBadge status={student.examForm} /></div>
        </div>

        {/* Details grid */}
        <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-10">
          <div>
            <Section title="Personal Details">
              <Row label="Full Name"      value={fullName} />
              <Row label="Applicant Name" value={f(student.applicantName)} />
              <Row label="Mother's Name"  value={f(student.motherName)} />
              <Row label="Date of Birth"  value={fmtDate(student.dateOfBirth)} />
              <Row label="Gender"         value={f(student.gender)} />
              <Row label="Marital Status" value={f(student.maritalStatus)} />
              <Row label="Aadhaar No."    value={f(student.aadhaarNumber)} />
            </Section>
            <Section title="Education">
              <Row label="Qualification"  value={f(student.qualification)} />
              <Row label="Category"       value={f(student.category)} />
            </Section>
            <Section title="Contact">
              <Row label="Mobile"         value={f(student.ownMobile)} />
              <Row label="Other Mobile"   value={f(student.otherMobile)} />
            </Section>
          </div>
          <div>
            <Section title="Address">
              <Row label="House No."      value={f(student.houseNo)} />
              <Row label="Street"         value={f(student.street)} />
              <Row label="City / Village" value={f(student.city)} />
              <Row label="Tahsil"         value={f(student.tahsil)} />
              <Row label="District"       value={f(student.district)} />
              <Row label="PIN Code"       value={f(student.pinCode)} />
            </Section>
            <Section title="Admission">
              <Row label="Course(s)"      value={
                Array.isArray(student.courses) && student.courses.length > 0
                  ? student.courses.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1 flex-wrap">
                        <span>{c}</span>
                        <StatusBadge status={getCourseStatus(student, c)} />
                      </div>
                    ))
                  : f(student.course)
              } />
              <Row label="Admission Date" value={fmtDate(student.admissionDate)} />
              <Row label="Duration"       value={f(student.courseDuration)} />
              <Row label="Batch Time"     value={f(student.batchTime)} />
              <Row label="Exam Form"      value={
                student.courseExamStatuses && Object.keys(student.courseExamStatuses).length > 0
                  ? Object.entries(student.courseExamStatuses).map(([course, status]) => (
                      <div key={course} className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs text-gray-500">{course}:</span>
                        <StatusBadge status={status} />
                      </div>
                    ))
                  : <StatusBadge status={student.examForm} />
              } />
            </Section>
            <Section title="Fees">
              <Row label="Total Fees" value={student.totalFees ? `₹ ${student.totalFees}` : undefined} />
              <Row label="Balance"    value={student.totalFees ? `₹ ${balance.toFixed(0)}` : undefined} />
              {/* Installments table */}
              {(() => {
                const insts = Array.isArray(student.installments) && student.installments.length > 0
                  ? student.installments
                  : (student.feesPaid || student.receiptNumber || student.receiptDate)
                    ? [{ amountPaid: student.feesPaid, receiptNumber: student.receiptNumber, receiptDate: student.receiptDate }]
                    : [];
                if (insts.length === 0) return null;
                const totalPaid = insts.reduce((s, i) => s + (parseFloat(i.amountPaid) || 0), 0);
                return (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="admin-detail-label">Installments</p>
                      <span className="text-xs font-bold text-primary-700">Total Paid: ₹ {totalPaid.toFixed(0)}</span>
                    </div>
                    <div className="rounded-xl border border-gray-200 overflow-hidden">
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9' }}>
                            {['#', 'Amount Paid', 'Receipt No.', 'Receipt Date'].map(h => (
                              <th key={h} style={{ padding: '6px 10px', fontSize: 11, fontWeight: 700, color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {insts.map((inst, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '6px 10px', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                              <td style={{ padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>₹ {inst.amountPaid || '—'}</td>
                              <td style={{ padding: '6px 10px', fontSize: 13, color: '#334155' }}>{inst.receiptNumber || '—'}</td>
                              <td style={{ padding: '6px 10px', fontSize: 13, color: '#334155' }}>{fmtDate(inst.receiptDate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </Section>
          </div>
        </div>

        {student.notes && (
          <div className="px-5 pb-5">
            <p className="admin-detail-label mb-1">Notes</p>
            <p className="text-slate-700" style={{ fontSize: 13.5 }}>{student.notes}</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
