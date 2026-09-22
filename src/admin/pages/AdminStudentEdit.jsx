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
      <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Loading…
      </div>
    </AdminLayout>
  );
  if (fetchError) return (
    <AdminLayout title="Edit Student">
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-5 py-4 max-w-lg font-semibold flex items-center justify-between">
        {fetchError} <button onClick={load} className="underline ml-4">Retry</button>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Edit Student">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
          <button onClick={() => adminNavigate('/admin/students')} className="hover:text-primary-600 font-semibold">Students</button>
          <span>›</span>
          <button onClick={() => adminNavigate(`/admin/students/${id}`)} className="hover:text-primary-600 font-mono font-semibold">{student?.studentId}</button>
          <span>›</span>
          <span className="text-gray-700 font-semibold">Edit</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
          <div className="bg-gray-50 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-400 flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p className="text-xs text-gray-600 font-semibold">
              Student ID <span className="font-mono text-gray-900">{student?.studentId}</span> cannot be changed after creation.
            </p>
          </div>

          <h2 className="font-extrabold text-gray-900 text-base mb-1">Edit Student</h2>
          <p className="text-sm text-gray-500 mb-6">Update student details below.</p>

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
