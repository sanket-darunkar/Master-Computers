import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout       from '../components/AdminLayout';
import CertificateForm   from '../components/CertificateForm';
import { useToast }      from '../components/Toast';
import {
  getCertificate,
  updateCertificate,
} from '../../services/adminApi';
import { adminNavigate } from '../AdminApp';

export default function AdminCertEdit({ id }) {
  const { showToast } = useToast();

  const [cert,        setCert]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [serverError, setServerError] = useState('');

  // Load existing certificate data to pre-fill the form
  const load = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await getCertificate(id);
      setCert(data);
    } catch (err) {
      setFetchError(err.message || 'Failed to load certificate.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (data, photoFile) => {
    setSubmitting(true);
    setServerError('');
    try {
      const updated = await updateCertificate(id, data, photoFile);
      showToast('Certificate updated successfully!', 'success');
      adminNavigate(`/admin/certificates/${updated.id}`);
    } catch (err) {
      setServerError(err.message || 'Failed to update certificate. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render states ─────────────────────────────────────────
  if (loading) return (
    <AdminLayout title="Edit Certificate">
      <div className="admin-loading">
        <svg className="animate-spin admin-spinner h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Loading certificate…
      </div>
    </AdminLayout>
  );

  if (fetchError) return (
    <AdminLayout title="Edit Certificate">
      <div className="admin-error" style={{ maxWidth: 520 }}>
        {fetchError} <button onClick={load} className="underline ml-2">Retry</button>
      </div>
    </AdminLayout>
  );

  // Build initialValues from the loaded cert
  // issueDate from backend comes as YYYY-MM-DD (LocalDate serialised by Jackson)
  const initialValues = {
    studentName    : cert.studentName     ?? '',
    courseName     : cert.courseName      ?? '',
    issueDate      : cert.issueDate       ?? '',
    duration       : cert.duration        ?? '',
    institutionName: cert.institutionName ?? '',
    marks          : cert.marks           ?? '',
    grade          : cert.grade           ?? '',
    // Photo fields — CertificateForm reads these to show the existing preview
    photoData      : cert.photoData       ?? null,
    photoMimeType  : cert.photoMimeType   ?? null,
    studentPhotoUrl: cert.studentPhotoUrl ?? null,
  };

  return (
    <AdminLayout title="Edit Certificate" subtitle="Update certificate details">
      <div style={{ maxWidth: 680 }}>
        <div className="admin-breadcrumb">
          <button onClick={() => adminNavigate('/admin/certificates')} className="admin-breadcrumb-link">Certificates</button>
          <span className="admin-breadcrumb-sep">›</span>
          <button onClick={() => adminNavigate(`/admin/certificates/${id}`)} className="admin-breadcrumb-link font-mono">{cert.certificateNumber}</button>
          <span className="admin-breadcrumb-sep">›</span>
          <span className="admin-breadcrumb-current">Edit</span>
        </div>

        <div className="admin-card p-6 sm:p-8">
          <div className="flex items-start gap-3 rounded-lg px-4 py-3 mb-6" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-slate-400 flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p className="text-slate-600 font-medium" style={{ fontSize: 13 }}>
              Certificate Number <span className="font-mono text-slate-800 font-semibold">{cert.certificateNumber}</span> cannot be changed after creation.
            </p>
          </div>

          <h2 className="font-bold text-slate-900 mb-1" style={{ fontSize: 16 }}>Edit Certificate</h2>
          <p className="text-slate-400 mb-6" style={{ fontSize: 13 }}>Update the certificate details below.</p>

          <CertificateForm
            initialValues={initialValues}
            isEdit={true}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Save Changes"
            serverError={serverError}
            onCancel={() => adminNavigate(`/admin/certificates/${id}`)}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
