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

  const handleSubmit = async (data, photoFile) => {
    setSubmitting(true);
    setServerError('');
    try {
      const cert = await createCertificate(data, photoFile);
      showToast(`Certificate ${cert.certificateNumber} created successfully!`, 'success');
      adminNavigate(`/admin/certificates/${cert.id}`);
    } catch (err) {
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
    <AdminLayout title="Add Certificate" subtitle="Issue a new certificate to a student">
      <div style={{ maxWidth: 680 }}>
        <div className="admin-breadcrumb">
          <button onClick={() => adminNavigate('/admin/certificates')} className="admin-breadcrumb-link">Certificates</button>
          <span className="admin-breadcrumb-sep">›</span>
          <span className="admin-breadcrumb-current">New Certificate</span>
        </div>

        <div className="admin-card p-6 sm:p-8">
          <h2 className="font-bold text-slate-900 mb-1" style={{ fontSize: 16 }}>New Certificate</h2>
          <p className="text-slate-400 mb-6" style={{ fontSize: 13 }}>Fill in all required fields. Certificate Number must be unique.</p>

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
