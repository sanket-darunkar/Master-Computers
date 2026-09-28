import React, { useCallback, useEffect, useRef, useState } from 'react';
import AdminLayout          from '../components/AdminLayout';
import StatusBadge          from '../components/StatusBadge';
import ConfirmDialog        from '../components/ConfirmDialog';
import { listCertificates, deleteCertificate } from '../../services/adminApi';
import { useToast }         from '../components/Toast';
import { adminNavigate }    from '../AdminApp';

const PAGE_SIZE = 10;
const STATUSES  = ['', 'ACTIVE', 'REVOKED', 'PENDING'];
const S_LABELS  = { '': 'All Status', ACTIVE: 'Active', REVOKED: 'Revoked', PENDING: 'Pending' };

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString('en-IN', { month: 'long' })}-${d.getFullYear()}`;
  } catch { return iso; }
}

// Status dot colors
function StatusDot({ status }) {
  const colors = { ACTIVE: '#22c55e', REVOKED: '#ef4444', PENDING: '#f59e0b' };
  return (
    <span
      className="inline-block w-2 h-2 rounded-full mr-1.5 flex-shrink-0"
      style={{ background: colors[status] || '#94a3b8' }}
      aria-hidden="true"
    />
  );
}

// ── Icons ──────────────────────────────────────────────────────
const IcoSearch = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoPlus   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoTrash  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IcoFilter = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IcoCert   = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IcoDoc    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;

export default function AdminCertList() {
  const { showToast } = useToast();
  const [certs,         setCerts]         = useState([]);
  const [paging,        setPaging]        = useState({ page: 0, totalPages: 0, totalElements: 0, first: true, last: true });
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [searchInput,   setSearchInput]   = useState('');
  const [search,        setSearch]        = useState('');
  const [status,        setStatus]        = useState('');
  const [page,          setPage]          = useState(0);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const searchRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await listCertificates({ page, size: PAGE_SIZE, search, status });
      setCerts(data.content ?? []);
      setPaging({ page: data.page, totalPages: data.totalPages, totalElements: data.totalElements, first: data.first, last: data.last });
    } catch (err) { setError(err.message || 'Failed to load certificates.'); }
    finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  const handleSearch  = (e) => { e.preventDefault(); setPage(0); setSearch(searchInput.trim()); };
  const clearFilters  = () => { setSearchInput(''); setSearch(''); setStatus(''); setPage(0); searchRef.current?.focus(); };
  const hasFilters    = search || status;

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteCertificate(deleteTarget.id);
      showToast(`Certificate "${deleteTarget.certificateNumber}" deleted.`, 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(err.message || 'Failed to delete certificate.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AdminLayout title="Certificates" subtitle="Issue and manage student certificates">

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Certificate?"
        message={deleteTarget
          ? `Permanently delete certificate "${deleteTarget.certificateNumber}" issued to "${deleteTarget.studentName}"? Students will no longer be able to verify it. This cannot be undone.`
          : ''}
        confirmLabel="Delete Certificate"
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Certificates</h2>
          {!loading && paging.totalElements > 0 && (
            <p className="text-slate-400 text-sm mt-0.5">
              {paging.totalElements} certificate{paging.totalElements !== 1 ? 's' : ''} total
            </p>
          )}
        </div>
        <button onClick={() => adminNavigate('/admin/certificates/new')} className="admin-btn-primary flex-shrink-0">
          <IcoPlus /> Add Certificate
        </button>
      </div>

      {/* ── Search + Filters ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <IcoSearch />
            </div>
            <input
              ref={searchRef}
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by certificate number or student name…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm
                         bg-slate-50 text-slate-800 placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400
                         focus:bg-white transition-all"
            />
          </div>

          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(0); }}
            className="admin-select text-sm flex-shrink-0"
          >
            {STATUSES.map(s => <option key={s} value={s}>{S_LABELS[s]}</option>)}
          </select>

          <button type="submit" className="admin-btn-primary flex-shrink-0">
            <IcoFilter /> Search
          </button>
        </form>

        {hasFilters && (
          <div className="flex items-center flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Active:</span>
            {search && (
              <span className="admin-filter-chip">
                "{search}" <button onClick={() => { setSearch(''); setSearchInput(''); setPage(0); }}>×</button>
              </span>
            )}
            {status && (
              <span className="admin-filter-chip">
                {S_LABELS[status]} <button onClick={() => { setStatus(''); setPage(0); }}>×</button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors ml-1">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="admin-error mb-4">
          {error} <button onClick={load} className="underline font-semibold ml-2">Retry</button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">
            <svg className="animate-spin h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Loading certificates…
          </div>
        ) : certs.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><IcoCert /></div>
            <p className="admin-empty-title">No certificates found</p>
            <p className="admin-empty-sub">
              {hasFilters ? 'Try adjusting your search or filters.' : 'Issue your first certificate to get started.'}
            </p>
            {hasFilters
              ? <button onClick={clearFilters} className="admin-btn-secondary admin-btn-sm">Clear filters</button>
              : <button onClick={() => adminNavigate('/admin/certificates/new')} className="admin-btn-primary admin-btn-sm"><IcoPlus /> Add Certificate</button>
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Certificate No.</th>
                  <th>Student</th>
                  <th className="hidden md:table-cell">Course</th>
                  <th className="hidden lg:table-cell">Exam Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: 20 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {certs.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => adminNavigate(`/admin/certificates/${c.id}`)}
                    className="group"
                  >
                    {/* Certificate number */}
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center
                                        text-purple-600 flex-shrink-0">
                          <IcoDoc />
                        </div>
                        <span className="admin-table-mono font-semibold">{c.certificateNumber}</span>
                      </div>
                    </td>

                    {/* Student */}
                    <td>
                      <div className="admin-table-name">{c.studentName}</div>
                    </td>

                    {/* Course */}
                    <td className="hidden md:table-cell">
                      <div className="max-w-[180px] truncate text-slate-500 text-sm">{c.courseName || '—'}</div>
                    </td>

                    {/* Date */}
                    <td className="hidden lg:table-cell">
                      <span className="text-slate-400 text-sm">{fmtDate(c.issueDate)}</span>
                    </td>

                    {/* Status */}
                    <td>
                      <div className="flex items-center">
                        <StatusDot status={c.status} />
                        <StatusBadge status={c.status} />
                      </div>
                    </td>

                    {/* Actions */}
                    <td onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5 pr-1">
                        <button
                          onClick={() => adminNavigate(`/admin/certificates/${c.id}`)}
                          className="admin-row-action-view"
                          title="View certificate"
                        >
                          View
                        </button>
                        <button
                          onClick={() => adminNavigate(`/admin/certificates/${c.id}/edit`)}
                          className="admin-row-action-edit"
                          title="Edit certificate"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: c.id, certificateNumber: c.certificateNumber, studentName: c.studentName })}
                          className="admin-row-action-delete"
                          title="Delete certificate"
                          aria-label={`Delete ${c.certificateNumber}`}
                        >
                          <IcoTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && certs.length > 0 && (
          <div className="admin-pagination">
            <span className="admin-pagination-info">
              Showing&nbsp;
              <strong>{paging.page * PAGE_SIZE + 1}–{Math.min((paging.page + 1) * PAGE_SIZE, paging.totalElements)}</strong>
              &nbsp;of&nbsp;
              <strong>{paging.totalElements}</strong>&nbsp;certificates
            </span>
            <div className="admin-pagination-controls">
              <button onClick={() => setPage(p => p - 1)} disabled={paging.first} className="admin-pagination-btn">← Prev</button>
              <span className="admin-pagination-page">{paging.page + 1} / {paging.totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={paging.last} className="admin-pagination-btn">Next →</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
