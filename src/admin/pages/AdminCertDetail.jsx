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
import { adminNavigate }        from '../AdminApp';

// ── Helpers ───────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }); }
  catch { return iso; }
}
function formatDateTime(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return iso; }
}

function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-100 last:border-0">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide sm:w-40 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-900 flex-1">{value}</span>
    </div>
  );
}

// ── Status change dialog ──────────────────────────────────────
const STATUSES    = ['ACTIVE', 'PENDING', 'REVOKED'];
const STATUS_MSGS = {
  REVOKED: 'This will permanently revoke the certificate. The student will no longer be able to verify it.',
  ACTIVE : 'This will activate the certificate. It will be publicly verifiable.',
  PENDING: 'This will mark the certificate as pending. It will not be publicly verifiable.',
};

// ── Verification History sub-component ───────────────────────
function VerificationHistory({ certId }) {
  const [logs,    setLogs]    = useState([]);
  const [paging,  setPaging]  = useState({ page: 0, totalPages: 1, totalElements: 0, first: true, last: true });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [page,    setPage]    = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getVerificationHistory(certId, { page, size: 10 });
      setLogs(data.content ?? []);
      setPaging({ page: data.page, totalPages: data.totalPages, totalElements: data.totalElements, first: data.first, last: data.last });
    } catch (err) {
      setError(err.message || 'Failed to load verification history.');
    } finally {
      setLoading(false);
    }
  }, [certId, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card mt-6">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-extrabold text-gray-900 text-sm">
          Verification History
          {paging.totalElements > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-500">
              ({paging.totalElements} {paging.totalElements === 1 ? 'record' : 'records'})
            </span>
          )}
        </h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-gray-400 text-sm gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          Loading history…
        </div>
      ) : error ? (
        <div className="px-5 py-4 text-sm text-red-600 font-semibold">{error}</div>
      ) : logs.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-gray-400">
          No verifications recorded yet.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-5 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">#</th>
                  <th className="px-5 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Certificate No.</th>
                  <th className="px-5 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Verified At</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={log.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-2.5 text-xs text-gray-400">
                      {paging.page * 10 + idx + 1}
                    </td>
                    <td className="px-5 py-2.5 font-mono text-xs font-semibold text-gray-700">
                      {log.certificateNumber}
                    </td>
                    <td className="px-5 py-2.5 text-xs text-gray-600">
                      {formatDateTime(log.verifiedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {paging.totalPages > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Page {paging.page + 1} of {paging.totalPages}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => p - 1)} disabled={paging.first}
                  className="px-3 py-1 text-xs font-semibold rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                  ← Prev
                </button>
                <button onClick={() => setPage(p => p + 1)} disabled={paging.last}
                  className="px-3 py-1 text-xs font-semibold rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function AdminCertDetail({ id }) {
  const { showToast } = useToast();
  const [cert,         setCert]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus,    setNewStatus]    = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCertificate(id);
      setCert(data);
    } catch (err) {
      setError(err.message || 'Failed to load certificate.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const openStatusDialog = (status) => {
    setNewStatus(status);
    setStatusDialog(true);
  };

  const confirmStatusChange = async () => {
    setStatusLoading(true);
    try {
      const updated = await updateCertificateStatus(id, newStatus);
      setCert(updated);
      setStatusDialog(false);
      showToast(`Status changed to ${newStatus}.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to change status.', 'error');
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Render states ─────────────────────────────────────────
  if (loading) return (
    <AdminLayout title="Certificate Details">
      <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Loading certificate…
      </div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout title="Certificate Details">
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-5 py-4 max-w-lg font-semibold flex items-center justify-between">
        {error}
        <button onClick={load} className="underline ml-4">Retry</button>
      </div>
    </AdminLayout>
  );

  if (!cert) return null;

  const otherStatuses = STATUSES.filter(s => s !== cert.status);

  return (
    <AdminLayout title="Certificate Details">

      {/* Confirm status change dialog */}
      <ConfirmDialog
        open={statusDialog}
        title={`Change Status to ${newStatus}?`}
        message={STATUS_MSGS[newStatus] || `Change status to ${newStatus}?`}
        confirmLabel={`Set ${newStatus}`}
        confirmClass={newStatus === 'REVOKED'
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-primary-700 hover:bg-primary-800 text-white'}
        loading={statusLoading}
        onConfirm={confirmStatusChange}
        onCancel={() => setStatusDialog(false)}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
        <button onClick={() => adminNavigate('/admin/certificates')} className="hover:text-primary-600 font-semibold">
          Certificates
        </button>
        <span>›</span>
        <span className="text-gray-700 font-mono font-semibold">{cert.certificateNumber}</span>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <button
          onClick={() => adminNavigate(`/admin/certificates/${id}/edit`)}
          className="btn-outline btn-md text-sm"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>

        {/* Status change dropdown */}
        <div className="relative group">
          <button className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700
                             bg-white hover:bg-gray-50 flex items-center gap-2">
            Change Status
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div className="absolute left-0 mt-1 w-40 bg-white rounded-xl border border-gray-200 shadow-lg
                          opacity-0 invisible group-hover:opacity-100 group-hover:visible
                          focus-within:opacity-100 focus-within:visible
                          transition-all duration-150 z-10">
            {otherStatuses.map(s => (
              <button
                key={s}
                onClick={() => openStatusDialog(s)}
                className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors first:rounded-t-xl last:rounded-b-xl
                  ${s === 'REVOKED'
                    ? 'text-red-700 hover:bg-red-50'
                    : s === 'ACTIVE'
                    ? 'text-green-700 hover:bg-green-50'
                    : 'text-yellow-700 hover:bg-yellow-50'}`}
              >
                Set {s}
              </button>
            ))}
          </div>
        </div>

        {/* View public verification */}
        <a
          href={`/certificate-verification?certificate=${encodeURIComponent(cert.certificateNumber)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700
                     bg-white hover:bg-gray-50 flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          View Public
        </a>
      </div>

      {/* Certificate info card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card">

        {/* Card header */}
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Photo */}
          <div className="flex-shrink-0">
            {cert.studentPhotoUrl ? (
              <img
                src={cert.studentPhotoUrl}
                alt={cert.studentName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-primary-100"
                onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div
              className={`w-16 h-16 rounded-2xl bg-primary-50 border-2 border-primary-100
                          flex items-center justify-center text-primary-300
                          ${cert.studentPhotoUrl ? 'hidden' : 'flex'}`}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Student</p>
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{cert.studentName}</h2>
            <p className="text-primary-600 font-semibold text-sm mt-0.5">{cert.courseName}</p>
          </div>
          <div className="flex-shrink-0">
            <StatusBadge status={cert.status} />
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-4">
          <DetailRow label="Certificate No." value={cert.certificateNumber} />
          <DetailRow label="Institution"     value={cert.institutionName} />
          <DetailRow label="Course"          value={cert.courseName} />
          <DetailRow label="Issue Date"      value={formatDate(cert.issueDate)} />
          <DetailRow label="Duration"        value={cert.duration} />
          <DetailRow label="Marks"           value={cert.marks} />
          <DetailRow label="Grade"           value={cert.grade} />
          <DetailRow label="Photo URL"       value={cert.studentPhotoUrl} />
          <DetailRow label="Status"          value={<StatusBadge status={cert.status} />} />
          <DetailRow label="Created"         value={formatDateTime(cert.createdAt)} />
          <DetailRow label="Last Updated"    value={formatDateTime(cert.updatedAt)} />
        </div>
      </div>

      {/* Verification history */}
      <VerificationHistory certId={id} />

    </AdminLayout>
  );
}
