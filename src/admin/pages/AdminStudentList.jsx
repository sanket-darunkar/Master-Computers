import React, { useCallback, useEffect, useRef, useState } from 'react';
import AdminLayout       from '../components/AdminLayout';
import StatusBadge       from '../components/StatusBadge';
import { listStudents }  from '../../services/adminApi';
import { adminNavigate } from '../AdminApp';
import { COURSES }       from '../../config/siteConfig';

const PAGE_SIZE = 15;
const STATUSES  = ['', 'ACTIVE', 'INACTIVE', 'COMPLETED', 'DROPPED'];
const S_LABELS  = { '': 'All Status', ACTIVE: 'Active', INACTIVE: 'Inactive', COMPLETED: 'Completed', DROPPED: 'Dropped' };
const COURSE_OPTIONS = [{ value: '', label: 'All Courses' }, ...COURSES.map(c => ({ value: c.name, label: c.name }))];

function fmtDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

function Initials({ name }) {
  const parts = (name || '').split(' ').filter(Boolean);
  const letters = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : (name || '?')[0];
  return (
    <div className="admin-avatar flex-shrink-0">
      <span className="admin-avatar-initials">{letters.toUpperCase()}</span>
    </div>
  );
}

const IcoSearch = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoPlus   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoEmpty  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>;

export default function AdminStudentList() {
  const [students, setStudents] = useState([]);
  const [paging,   setPaging]   = useState({ page: 0, totalPages: 0, totalElements: 0, first: true, last: true });
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search,      setSearch]      = useState('');
  const [status,      setStatus]      = useState('');
  const [course,      setCourse]      = useState('');
  const [page,        setPage]        = useState(0);
  const searchRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await listStudents({ page, size: PAGE_SIZE, search, status, course });
      setStudents(data.content ?? []);
      setPaging({ page: data.page, totalPages: data.totalPages, totalElements: data.totalElements, first: data.first, last: data.last });
    } catch (err) { setError(err.message || 'Failed to load students.'); }
    finally { setLoading(false); }
  }, [page, search, status, course]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => { e.preventDefault(); setPage(0); setSearch(searchInput.trim()); };
  const clearFilters = () => { setSearchInput(''); setSearch(''); setStatus(''); setCourse(''); setPage(0); searchRef.current?.focus(); };
  const hasFilters   = search || status || course;

  return (
    <AdminLayout title="Students" subtitle="Manage student admissions and records">

      {/* Page header */}
      <div className="admin-page-header">
        <div className="admin-page-header-left">
          {paging.totalElements > 0 && !loading && (
            <p className="text-slate-400 mt-1" style={{ fontSize: 13 }}>
              {paging.totalElements} student{paging.totalElements !== 1 ? 's' : ''} total
            </p>
          )}
        </div>
        <button onClick={() => adminNavigate('/admin/students/new')} className="admin-btn-primary">
          <IcoPlus /> Add Student
        </button>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="admin-search-wrap flex-1">
            <div className="admin-search-icon"><IcoSearch /></div>
            <input ref={searchRef} type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by student ID, name or mobile…" className="admin-search-input" />
          </div>
          <button type="submit" className="admin-btn-secondary">Search</button>
        </form>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(0); }} className="admin-select">
          {STATUSES.map(s => <option key={s} value={s}>{S_LABELS[s]}</option>)}
        </select>
        <select value={course} onChange={e => { setCourse(e.target.value); setPage(0); }} className="admin-select" style={{ maxWidth: 180 }}>
          {COURSE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Active filters */}
      {hasFilters && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-slate-400 font-medium" style={{ fontSize: 12.5 }}>Filters:</span>
          {search && <span className="admin-filter-chip">"{search}" <button onClick={() => { setSearch(''); setSearchInput(''); setPage(0); }}>×</button></span>}
          {status && <span className="admin-filter-chip">{S_LABELS[status]} <button onClick={() => { setStatus(''); setPage(0); }}>×</button></span>}
          {course && <span className="admin-filter-chip">{course} <button onClick={() => { setCourse(''); setPage(0); }}>×</button></span>}
          <button onClick={clearFilters} className="text-slate-400 hover:text-red-500 font-medium transition-colors" style={{ fontSize: 12.5 }}>Clear all</button>
        </div>
      )}

      {error && (
        <div className="admin-error">
          {error}
          <button onClick={load} className="underline font-semibold ml-2">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">
            <svg className="animate-spin admin-spinner h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Loading students…
          </div>
        ) : students.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><IcoEmpty /></div>
            <p className="admin-empty-title">No students found</p>
            <p className="admin-empty-sub">
              {hasFilters ? 'Try adjusting your search or filters.' : 'Add your first student to start managing admissions.'}
            </p>
            {hasFilters
              ? <button onClick={clearFilters} className="admin-btn-secondary admin-btn-sm">Clear filters</button>
              : <button onClick={() => adminNavigate('/admin/students/new')} className="admin-btn-primary admin-btn-sm"><IcoPlus /> Add Student</button>
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th className="hidden sm:table-cell">Mobile</th>
                  <th className="hidden md:table-cell">Course</th>
                  <th className="hidden lg:table-cell">Admission</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const fullName = [s.firstName, s.middleName, s.surname].filter(Boolean).join(' ');
                  return (
                    <tr key={s.id} onClick={() => adminNavigate(`/admin/students/${s.id}`)}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Initials name={fullName} />
                          <div>
                            <div className="admin-table-name">{fullName}</div>
                            <div className="admin-table-secondary admin-table-mono">{s.studentId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell" style={{ color: '#64748b', fontSize: 13 }}>{s.ownMobile || '—'}</td>
                      <td className="hidden md:table-cell">
                        <div className="max-w-[160px] truncate" style={{ color: '#64748b', fontSize: 13 }}>{s.course || '—'}</div>
                      </td>
                      <td className="hidden lg:table-cell" style={{ color: '#94a3b8', fontSize: 13 }}>{fmtDate(s.admissionDate)}</td>
                      <td><StatusBadge status={s.status} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                          <button onClick={() => adminNavigate(`/admin/students/${s.id}`)} className="admin-row-action-view">View</button>
                          <button onClick={() => adminNavigate(`/admin/students/${s.id}/edit`)} className="admin-row-action-edit">Edit</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && students.length > 0 && (
          <div className="admin-pagination">
            <span className="admin-pagination-info">
              Showing {paging.page * PAGE_SIZE + 1}–{Math.min((paging.page + 1) * PAGE_SIZE, paging.totalElements)} of{' '}
              <strong style={{ color: '#475569' }}>{paging.totalElements}</strong> students
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
