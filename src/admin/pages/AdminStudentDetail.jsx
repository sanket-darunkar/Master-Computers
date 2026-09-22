import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout           from '../components/AdminLayout';
import StatusBadge           from '../components/StatusBadge';
import ConfirmDialog         from '../components/ConfirmDialog';
import StudentPrint          from '../components/StudentPrint';
import { useToast }          from '../components/Toast';
import { getStudent, updateStudentStatus } from '../../services/adminApi';
import { adminNavigate }     from '../AdminApp';

function formatDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }); }
  catch { return iso; }
}
function fmt(v) { return v || '—'; }

function Row({ label, value }) {
  if (!value || value === '—') return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide sm:w-44 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm font-semibold text-gray-900 flex-1">{value}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-extrabold text-primary-700 uppercase tracking-widest mb-2 pb-1 border-b border-primary-100">{title}</p>
      {children}
    </div>
  );
}

const STATUSES = ['ACTIVE', 'INACTIVE', 'COMPLETED', 'DROPPED'];

export default function AdminStudentDetail({ id }) {
  const { showToast }  = useToast();
  const [student, setStudent]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error,   setError]       = useState('');
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus,    setNewStatus]    = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [showPrint, setShowPrint] = useState(false);

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
      const updated = await updateStudentStatus(id, newStatus);
      setStudent(updated);
      setStatusDialog(false);
      showToast(`Status changed to ${newStatus}.`, 'success');
    } catch (err) { showToast(err.message || 'Failed to change status.', 'error'); }
    finally { setStatusLoading(false); }
  };

  if (loading) return (
    <AdminLayout title="Student Details">
      <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Loading…
      </div>
    </AdminLayout>
  );
  if (error) return (
    <AdminLayout title="Student Details">
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-5 py-4 max-w-lg font-semibold flex items-center justify-between">
        {error} <button onClick={load} className="underline ml-4">Retry</button>
      </div>
    </AdminLayout>
  );
  if (!student) return null;

  const fullName = [student.firstName, student.middleName, student.surname].filter(Boolean).join(' ');
  const balance  = (parseFloat(student.totalFees) || 0) - (parseFloat(student.feesPaid) || 0);
  const others   = STATUSES.filter(s => s !== student.status);

  return (
    <AdminLayout title="Student Details">

      {showPrint && <StudentPrint student={student} onClose={() => setShowPrint(false)} />}

      <ConfirmDialog
        open={statusDialog}
        title={`Change Status to ${newStatus}?`}
        message={newStatus === 'DROPPED' ? 'This will mark the student as dropped.' : `Change student status to ${newStatus}?`}
        confirmLabel={`Set ${newStatus}`}
        confirmClass={newStatus === 'DROPPED' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-primary-700 hover:bg-primary-800 text-white'}
        loading={statusLoading}
        onConfirm={confirmStatus}
        onCancel={() => setStatusDialog(false)}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
        <button onClick={() => adminNavigate('/admin/students')} className="hover:text-primary-600 font-semibold">Students</button>
        <span>›</span>
        <span className="text-gray-700 font-mono font-semibold">{student.studentId}</span>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <button onClick={() => adminNavigate(`/admin/students/${id}/edit`)} className="btn-outline btn-md text-sm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
        <button onClick={() => setShowPrint(true)}
          className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print Forms
        </button>

        {/* Status dropdown */}
        <div className="relative group">
          <button className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2">
            Change Status <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div className="absolute left-0 mt-1 w-40 bg-white rounded-xl border border-gray-200 shadow-lg
                          opacity-0 invisible group-hover:opacity-100 group-hover:visible
                          focus-within:opacity-100 focus-within:visible transition-all duration-150 z-10">
            {others.map(s => (
              <button key={s} onClick={() => { setNewStatus(s); setStatusDialog(true); }}
                className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors first:rounded-t-xl last:rounded-b-xl
                  ${s === 'DROPPED' ? 'text-red-700 hover:bg-red-50' : s === 'ACTIVE' ? 'text-green-700 hover:bg-green-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                Set {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-shrink-0">
            {student.studentPhotoUrl
              ? <img src={student.studentPhotoUrl} alt={fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-primary-100"
                  onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
              : null}
            <div className={`w-16 h-16 rounded-2xl bg-primary-50 border-2 border-primary-100 items-center justify-center text-primary-300 ${student.studentPhotoUrl ? 'hidden' : 'flex'}`}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Student</p>
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{fullName}</h2>
            <p className="text-primary-600 font-semibold text-sm mt-0.5">{fmt(student.course)}</p>
          </div>
          <div className="flex-shrink-0"><StatusBadge status={student.status} /></div>
        </div>

        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <div>
            <Section title="Personal Details">
              <Row label="Student ID"     value={fmt(student.studentId)} />
              <Row label="Full Name"      value={fullName} />
              <Row label="Applicant Name" value={fmt(student.applicantName)} />
              <Row label="Mother's Name"  value={fmt(student.motherName)} />
              <Row label="Date of Birth"  value={formatDate(student.dateOfBirth)} />
              <Row label="Gender"         value={fmt(student.gender)} />
              <Row label="Marital Status" value={fmt(student.maritalStatus)} />
              <Row label="Aadhaar No."    value={fmt(student.aadhaarNumber)} />
            </Section>
            <Section title="Education">
              <Row label="Qualification"  value={fmt(student.qualification)} />
              <Row label="Category"       value={fmt(student.category)} />
            </Section>
          </div>
          <div>
            <Section title="Contact">
              <Row label="Mobile"         value={fmt(student.ownMobile)} />
              <Row label="Other Mobile"   value={fmt(student.otherMobile)} />
            </Section>
            <Section title="Address">
              <Row label="House No."      value={fmt(student.houseNo)} />
              <Row label="Street"         value={fmt(student.street)} />
              <Row label="City/Village"   value={fmt(student.city)} />
              <Row label="Tahsil"         value={fmt(student.tahsil)} />
              <Row label="District"       value={fmt(student.district)} />
              <Row label="PIN Code"       value={fmt(student.pinCode)} />
            </Section>
            <Section title="Admission">
              <Row label="Course"         value={fmt(student.course)} />
              <Row label="Admission Date" value={formatDate(student.admissionDate)} />
              <Row label="Duration"       value={fmt(student.courseDuration)} />
              <Row label="Batch Time"     value={fmt(student.batchTime)} />
            </Section>
            <Section title="Fees">
              <Row label="Total Fees"     value={student.totalFees ? `₹ ${student.totalFees}` : '—'} />
              <Row label="Fees Paid"      value={student.feesPaid  ? `₹ ${student.feesPaid}`  : '—'} />
              <Row label="Balance"        value={student.totalFees ? `₹ ${balance.toFixed(0)}` : '—'} />
              <Row label="Receipt No."    value={fmt(student.receiptNumber)} />
              <Row label="Receipt Date"   value={formatDate(student.receiptDate)} />
            </Section>
          </div>
        </div>

        {student.notes && (
          <div className="px-6 pb-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-gray-700">{student.notes}</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
