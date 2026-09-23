import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout       from '../components/AdminLayout';
import StudentForm       from '../components/StudentForm';
import { useToast }      from '../components/Toast';
import { getStudent, updateStudent } from '../../services/adminApi';
import { adminNavigate } from '../AdminApp';

export default function AdminStudentEdit({ id }) {
  const { showToast }   = useToast();
  const [student,     setStudent]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [serverError, setServerError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setFetchError('');
    try { setStudent(await getStudent(id)); }
    catch (err) { setFetchError(err.message || 'Failed to load student.'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (data, photoFile) => {
    setSubmitting(true); setServerError('');
    try {
      const updated = await updateStudent(id, data, photoFile);
      showToast('Student updated successfully!', 'success');
      adminNavigate(`/admin/students/${updated.id}`);
    } catch (err) {
      setServerError(err.message || 'Failed to update student. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <AdminLayout title="Edit Student">
      <div className="admin-loading">
        <svg className="animate-spin admin-spinner h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Loading student…
      </div>
    </AdminLayout>
  );
  if (fetchError) return (
    <AdminLayout title="Edit Student">
      <div className="admin-error" style={{ maxWidth: 520 }}>
        {fetchError} <button onClick={load} className="underline ml-2">Retry</button>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Edit Student" subtitle="Update student admission details">
      <div style={{ maxWidth: 760 }}>
        <div className="admin-breadcrumb">
          <button onClick={() => adminNavigate('/admin/students')} className="admin-breadcrumb-link">Students</button>
          <span className="admin-breadcrumb-sep">›</span>
          <button onClick={() => adminNavigate(`/admin/students/${id}`)} className="admin-breadcrumb-link font-mono">{student?.studentId}</button>
          <span className="admin-breadcrumb-sep">›</span>
          <span className="admin-breadcrumb-current">Edit</span>
        </div>

        <div className="admin-card p-6 sm:p-8">
          <div className="flex items-start gap-3 rounded-lg px-4 py-3 mb-6" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-slate-400 flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p className="text-slate-600 font-medium" style={{ fontSize: 13 }}>
              Student ID <span className="font-mono text-slate-800 font-semibold">{student?.studentId}</span> cannot be changed after creation.
            </p>
          </div>

          <h2 className="font-bold text-slate-900 mb-1" style={{ fontSize: 16 }}>Edit Student</h2>
          <p className="text-slate-400 mb-6" style={{ fontSize: 13 }}>Update student details below.</p>

          <StudentForm
            initialValues={student}
            isEdit={true}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Save Changes"
            serverError={serverError}
            onCancel={() => adminNavigate(`/admin/students/${id}`)}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
