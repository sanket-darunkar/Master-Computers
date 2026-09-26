import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout              from '../components/AdminLayout';
import StatusBadge              from '../components/StatusBadge';
import ConfirmDialog            from '../components/ConfirmDialog';
import { useToast }             from '../components/Toast';
import {
  getCertificate,
  getVerificationHistory,
  updateCertificateStatus,
} from '../../services/adminApi';
import { adminNavigate } from '../AdminApp';

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    // Display as MONTH-YEAR, e.g. "September-2026"
    const d = new Date(iso);
    const month = d.toLocaleDateString('en-IN', { month: 'long' });
    return `${month}-${d.getFullYear()}`;
  }
  catch { return iso; }
}
function fmtDateTime(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return iso; }
}

function Row({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="admin-detail-row">
      <span className="admin-detail-label">{label}</span>
      <span className="admin-detail-value">{value}</span>
    </div>
  );
}

// ── Verification History ──────────────────────────────────────
function VerificationHistory({ certId }) {
  const [logs,    setLogs]    = useState([]);
  const [paging,  setPaging]  = useState({ page: 0, totalPages: 1, totalElements: 0, first: true, last: true });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [page,    setPage]    = useState(0);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await getVerificationHistory(certId, { page, size: 10 });
      setLogs(data.content ?? []);
      setPaging({ page: data.page, totalPages: data.totalPages, totalElements: data.totalElements, first: data.first, last: data.last });
    } catch (err) { setError(err.message || 'Failed to load verification history.'); }
    finally { setLoading(false); }
  }, [certId, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="admin-table-wrap mt-5">
      <div className="admin-card-header">
        <span className="admin-card-title">
          Verification History
          {paging.totalElements > 0 && (
            <span className="font-normal text-slate-400 ml-2" style={{ fontSize: 12 }}>
              ({paging.totalElements} {paging.totalElements === 1 ? 'record' : 'records'})
            </span>
          )}
        </span>
      </div>

      {loading ? (
        <div className="admin-loading">
          <svg className="animate-spin admin-spinner h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          Loading history…
        </div>
      ) : error ? (
        <div className="px-5 py-4 text-red-600 font-medium" style={{ fontSize: 13 }}>{error}</div>
      ) : logs.length === 0 ? (
        <div className="admin-empty py-10">
          <p className="admin-empty-title">No verifications recorded yet</p>
          <p className="admin-empty-sub">Verification events will appear here when someone checks this certificate.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead><tr>
                <th style={{ width: 48 }}>#</th>
                <th>Certificate No.</th>
                <th>Verified At</th>
              </tr></thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={log.id} style={{ cursor: 'default' }}>
                    <td className="text-slate-400" style={{ fontSize: 12 }}>{paging.page * 10 + idx + 1}</td>
                    <td><span className="admin-table-mono">{log.certificateNumber}</span></td>
                    <td style={{ color: '#64748b', fontSize: 13 }}>{fmtDateTime(log.verifiedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {paging.totalPages > 1 && (
            <div className="admin-pagination">
              <span className="admin-pagination-info">Page {paging.page + 1} of {paging.totalPages}</span>
              <div className="admin-pagination-controls">
                <button onClick={() => setPage(p => p - 1)} disabled={paging.first} className="admin-pagination-btn">← Prev</button>
                <button onClick={() => setPage(p => p + 1)} disabled={paging.last}  className="admin-pagination-btn">Next →</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
const STATUSES    = ['ACTIVE', 'PENDING', 'REVOKED'];
const STATUS_MSGS = {
  REVOKED: 'This will revoke the certificate. Students will no longer be able to verify it publicly.',
  ACTIVE : 'This will activate the certificate. It will be publicly verifiable.',
  PENDING: 'This will mark the certificate as pending. It will not be publicly verifiable.',
};

const IcoEdit    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoExtLink = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
const IcoChev    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>;

export default function AdminCertDetail({ id }) {
  const { showToast } = useToast();
  const [cert,          setCert]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [statusDialog,  setStatusDialog]  = useState(false);
  const [newStatus,     setNewStatus]     = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setCert(await getCertificate(id)); }
    catch (err) { setError(err.message || 'Failed to load certificate.'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const confirmStatusChange = async () => {
    setStatusLoading(true);
    try {
      const updated = await updateCertificateStatus(id, newStatus);
      setCert(updated);
      setStatusDialog(false);
      showToast(`Status changed to ${newStatus}.`, 'success');
    } catch (err) { showToast(err.message || 'Failed to change status.', 'error'); }
    finally { setStatusLoading(false); }
  };

  if (loading) return (
    <AdminLayout title="Certificate Details">
      <div className="admin-loading">
        <svg className="animate-spin admin-spinner h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Loading certificate…
      </div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout title="Certificate Details">
      <div className="admin-error" style={{ maxWidth: 520 }}>
        {error} <button onClick={load} className="underline ml-2">Retry</button>
      </div>
    </AdminLayout>
  );

  if (!cert) return null;

  const otherStatuses = STATUSES.filter(s => s !== cert.status);
  const photoSrc = cert.photoData && cert.photoMimeType
    ? `data:${cert.photoMimeType};base64,${cert.photoData}`
    : cert.studentPhotoUrl || null;

  return (
    <AdminLayout title="Certificate Details" subtitle={`${cert.certificateNumber} · ${cert.studentName}`}>

      <ConfirmDialog
        open={statusDialog}
        title={`Change Status to ${newStatus}?`}
        message={STATUS_MSGS[newStatus] || `Change status to ${newStatus}?`}
        confirmLabel={`Set ${newStatus}`}
        confirmClass={newStatus === 'REVOKED'
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-blue-600 hover:bg-blue-700 text-white'}
        loading={statusLoading}
        onConfirm={confirmStatusChange}
        onCancel={() => setStatusDialog(false)}
      />

      {/* Breadcrumb */}
      <div className="admin-breadcrumb">
        <button onClick={() => adminNavigate('/admin/certificates')} className="admin-breadcrumb-link">Certificates</button>
        <span className="admin-breadcrumb-sep">›</span>
        <span className="admin-breadcrumb-current font-mono">{cert.certificateNumber}</span>
      </div>

      {/* Action bar */}
      <div className="admin-action-bar">
        <button onClick={() => adminNavigate(`/admin/certificates/${id}/edit`)} className="admin-btn-secondary">
          <IcoEdit /> Edit
        </button>

        {/* Status dropdown */}
        <div className="relative group">
          <button className="admin-btn-secondary flex items-center gap-2">
            Change Status <IcoChev />
          </button>
          <div className="admin-status-menu-panel opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible transition-all duration-150">
            {otherStatuses.map(s => (
              <button key={s} onClick={() => { setNewStatus(s); setStatusDialog(true); }}
                className={`admin-status-menu-item
                  ${s === 'REVOKED' ? 'text-red-600 hover:bg-red-50'
                    : s === 'ACTIVE' ? 'text-green-700 hover:bg-green-50'
                    : 'text-yellow-700 hover:bg-yellow-50'}`}>
                Set {s}
              </button>
            ))}
          </div>
        </div>

        {/* View public verification */}
        <a href={`/certificate-verification?certificate=${encodeURIComponent(cert.certificateNumber)}`}
          target="_blank" rel="noopener noreferrer"
          className="admin-btn-secondary flex items-center gap-2">
          <IcoExtLink /> View Public
        </a>
      </div>

      {/* Certificate card */}
      <div className="admin-card overflow-hidden">

        {/* Header */}
        <div className="admin-profile-header">
          <div className="flex-shrink-0">
            {photoSrc ? (
              <img src={photoSrc} alt={cert.studentName} className="admin-profile-photo"
                onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
            ) : null}
            <div className={`admin-profile-photo-placeholder ${photoSrc ? 'hidden' : 'flex'}`}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="admin-profile-name">{cert.studentName}</div>
            <div className="admin-profile-sub">{cert.courseName}</div>
            <div className="admin-profile-id font-mono">{cert.certificateNumber}</div>
          </div>
          <div className="flex-shrink-0"><StatusBadge status={cert.status} /></div>
        </div>

        {/* Details */}
        <div className="px-5 py-4">
          <Row label="Certificate No."  value={cert.certificateNumber} />
          <Row label="Institution"      value={cert.institutionName} />
          <Row label="Course"           value={cert.courseName} />
          <Row label="Exam Date"       value={fmtDate(cert.issueDate)} />
          <Row label="Duration"         value={cert.duration} />
          <Row label="Marks"            value={cert.marks} />
          <Row label="Grade"            value={cert.grade} />
          <Row label="Status"           value={<StatusBadge status={cert.status} />} />
          <Row label="Created"          value={fmtDateTime(cert.createdAt)} />
          <Row label="Last Updated"     value={fmtDateTime(cert.updatedAt)} />
        </div>
      </div>

      {/* Verification history */}
      <VerificationHistory certId={id} />

    </AdminLayout>
  );
}
