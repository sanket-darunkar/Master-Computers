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
    <AdminLayout title="Add Student">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
          <button onClick={() => adminNavigate('/admin/students')} className="hover:text-primary-600 font-semibold">Students</button>
          <span>›</span>
          <span className="text-gray-700 font-semibold">New Student</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
          <h2 className="font-extrabold text-gray-900 text-base mb-1">New Student Admission</h2>
          <p className="text-sm text-gray-500 mb-6">Fill in all required fields marked with <span className="text-red-500 font-bold">*</span></p>
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
