import React, { useState } from 'react';
import AdminLayout       from '../components/AdminLayout';
import CertificateForm   from '../components/CertificateForm';
import { createCertificate } from '../../services/adminApi';
import { adminNavigate } from '../AdminApp';
import { useToast }      from '../components/Toast';

export default function AdminCertNew() {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setServerError('');
    try {
      const cert = await createCertificate(data);
      showToast(`Certificate ${cert.certificateNumber} created successfully!`, 'success');
      adminNavigate(`/admin/certificates/${cert.id}`);
    } catch (err) {
      // 409 Conflict = duplicate certificate number
      if (err.status === 409) {
        setServerError(`Certificate number "${data.certificateNumber}" already exists. Please use a unique number.`);
      } else {
        setServerError(err.message || 'Failed to create certificate. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Add Certificate">
      <div className="max-w-2xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
          <button onClick={() => adminNavigate('/admin/certificates')} className="hover:text-primary-600 font-semibold">
            Certificates
          </button>
          <span>›</span>
          <span className="text-gray-700 font-semibold">New Certificate</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
          <h2 className="font-extrabold text-gray-900 text-base mb-1">New Certificate</h2>
          <p className="text-sm text-gray-500 mb-6">
            Fill in all required fields. Certificate Number must be unique.
          </p>

          <CertificateForm
            isEdit={false}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Add Certificate"
            serverError={serverError}
            onCancel={() => adminNavigate('/admin/certificates')}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
