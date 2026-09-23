import React, { useState } from 'react';
import AdminLayout       from '../components/AdminLayout';
import StudentForm       from '../components/StudentForm';
import { createStudent } from '../../services/adminApi';
import { adminNavigate } from '../AdminApp';
import { useToast }      from '../components/Toast';

export default function AdminStudentNew() {
  const { showToast }   = useToast();
  const [submitting,  setSubmitting]  = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (data, photoFile) => {
    setSubmitting(true); setServerError('');
    try {
      const student = await createStudent(data, photoFile);
      showToast(`Student ${student.studentId} added successfully!`, 'success');
      adminNavigate(`/admin/students/${student.id}`);
    } catch (err) {
      if (err.status === 409) {
        setServerError(`Student ID "${data.studentId}" already exists. Please use a unique ID.`);
      } else {
        setServerError(err.message || 'Failed to add student. Please try again.');
      }
    } finally { setSubmitting(false); }
  };

  return (
    <AdminLayout title="Add Student" subtitle="Create a new student admission record">
      <div style={{ maxWidth: 760 }}>
        <div className="admin-breadcrumb">
          <button onClick={() => adminNavigate('/admin/students')} className="admin-breadcrumb-link">Students</button>
          <span className="admin-breadcrumb-sep">›</span>
          <span className="admin-breadcrumb-current">New Student</span>
        </div>

        <div className="admin-card p-6 sm:p-8">
          <h2 className="font-bold text-slate-900 mb-1" style={{ fontSize: 16 }}>New Student Admission</h2>
          <p className="text-slate-400 mb-6" style={{ fontSize: 13 }}>Fields marked <span className="text-red-500 font-bold">*</span> are required</p>
          <StudentForm
            isEdit={false}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Save Student"
            serverError={serverError}
            onCancel={() => adminNavigate('/admin/students')}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
