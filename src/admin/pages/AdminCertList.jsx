import React, { useCallback, useEffect, useRef, useState } from 'react';
import AdminLayout          from '../components/AdminLayout';
import StatusBadge          from '../components/StatusBadge';
import { listCertificates } from '../../services/adminApi';
import { adminNavigate }    from '../AdminApp';

const PAGE_SIZE = 10;
const STATUSES  = ['', 'ACTIVE', 'REVOKED', 'PENDING'];
const S_LABELS  = { '': 'All Status', ACTIVE: 'Active', REVOKED: 'Revoked', PENDING: 'Pending' };

function fmtDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

const IcoSearch = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoPlus   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoCerts  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;

export default function AdminCertList() {
  const [certs,   setCerts]   = useState([]);
  const [paging,  setPaging]  = useState({ page: 0, totalPages: 0, totalElements: 0, first: true, last: true });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState('');
  const [page,    setPage]    = useState(0);
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

  const handleSearch = (e) => { e.preventDefault(); setPage(0); setSearch(searchInput.trim()); };
  const clearFilters = () => { setSearchInput(''); setSearch(''); setStatus(''); setPage(0); searchRef.current?.focus(); };
  const hasFilters = search || status;

  return (
    <AdminLayout title="Certificates" subtitle="Issue and manage student certificates">

      <div className="admin-page-header">
        <div className="admin-page-header-left">
          {paging.totalElements > 0 && !loading && (
            <p className="text-slate-400 mt-1" style={{ fontSize: 13 }}>{paging.totalElements} certificate{paging.totalElements !== 1 ? 's' : ''} total</p>
          )}
        </div>
        <button onClick={() => adminNavigate('/admin/certificates/new')} className="admin-btn-primary">
          <IcoPlus /> Add Certificate
        </button>
      </div>

      <div className="admin-toolbar">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="admin-search-wrap flex-1">
            <div className="admin-search-icon"><IcoSearch /></div>
            <input ref={searchRef} type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by certificate number or student name…" className="admin-search-input" />
          </div>
          <button type="submit" className="admin-btn-secondary">Search</button>
        </form>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(0); }} className="admin-select">
          {STATUSES.map(s => <option key={s} value={s}>{S_LABELS[s]}</option>)}
        </select>
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-slate-400 font-medium" style={{ fontSize: 12.5 }}>Filters:</span>
          {search && <span className="admin-filter-chip">"{search}" <button onClick={() => { setSearch(''); setSearchInput(''); setPage(0); }}>×</button></span>}
          {status && <span className="admin-filter-chip">{S_LABELS[status]} <button onClick={() => { setStatus(''); setPage(0); }}>×</button></span>}
          <button onClick={clearFilters} className="text-slate-400 hover:text-red-500 font-medium transition-colors" style={{ fontSize: 12.5 }}>Clear all</button>
        </div>
      )}

      {error && (
        <div className="admin-error">{error} <button onClick={load} className="underline ml-2">Retry</button></div>
      )}

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">
            <svg className="animate-spin admin-spinner h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Loading certificates…
          </div>
        ) : certs.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><IcoCerts /></div>
            <p className="admin-empty-title">No certificates found</p>
            <p className="admin-empty-sub">{hasFilters ? 'Try adjusting your search or filters.' : 'Issue your first certificate to get started.'}</p>
            {hasFilters
              ? <button onClick={clearFilters} className="admin-btn-secondary admin-btn-sm">Clear filters</button>
              : <button onClick={() => adminNavigate('/admin/certificates/new')} className="admin-btn-primary admin-btn-sm"><IcoPlus /> Add Certificate</button>
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead><tr>
                <th>Certificate</th>
                <th>Student</th>
                <th className="hidden md:table-cell">Course</th>
                <th className="hidden lg:table-cell">Issue Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr></thead>
              <tbody>
                {certs.map(c => (
                  <tr key={c.id} onClick={() => adminNavigate(`/admin/certificates/${c.id}`)}>
                    <td><span className="admin-table-mono">{c.certificateNumber}</span></td>
                    <td><span className="admin-table-name">{c.studentName}</span></td>
                    <td className="hidden md:table-cell">
                      <div className="max-w-[160px] truncate" style={{ color: '#64748b', fontSize: 13 }}>{c.courseName}</div>
                    </td>
                    <td className="hidden lg:table-cell" style={{ color: '#94a3b8', fontSize: 13 }}>{fmtDate(c.issueDate)}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                        <button onClick={() => adminNavigate(`/admin/certificates/${c.id}`)} className="admin-row-action-view">View</button>
                        <button onClick={() => adminNavigate(`/admin/certificates/${c.id}/edit`)} className="admin-row-action-edit">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && certs.length > 0 && (
          <div className="admin-pagination">
            <span className="admin-pagination-info">
              Showing {paging.page * PAGE_SIZE + 1}–{Math.min((paging.page + 1) * PAGE_SIZE, paging.totalElements)} of{' '}
              <strong style={{ color: '#475569' }}>{paging.totalElements}</strong> certificates
            </span>
            <div className="admin-pagination-controls">
              <button onClick={() => setPage(p => p - 1)} disabled={paging.first} className="admin-pagination-btn">← Prev</button>
              <span className="admin-pagination-page">Page {paging.page + 1} / {paging.totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={paging.last} className="admin-pagination-btn">Next →</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
