import React, { useCallback, useEffect, useRef, useState } from 'react';
import AdminLayout       from '../components/AdminLayout';
import StatusBadge       from '../components/StatusBadge';
import { listStudents }  from '../../services/adminApi';
import { adminNavigate } from '../AdminApp';
import { COURSES }       from '../../config/siteConfig';

const PAGE_SIZE = 15;
const STATUSES  = ['', 'ACTIVE', 'INACTIVE', 'COMPLETED', 'DROPPED'];
const S_LABELS  = { '': 'All Status', ACTIVE: 'Active', INACTIVE: 'Inactive', COMPLETED: 'Completed', DROPPED: 'Dropped' };

const COURSE_OPTIONS = [
  { value: '', label: 'All Courses' },
  ...COURSES.map(c => ({ value: c.name, label: c.name })),
];

function formatDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

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
    } catch (err) {
      setError(err.message || 'Failed to load students.');
    } finally { setLoading(false); }
  }, [page, search, status, course]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => { e.preventDefault(); setPage(0); setSearch(searchInput.trim()); };
  const clearFilters = () => { setSearchInput(''); setSearch(''); setStatus(''); setCourse(''); setPage(0); searchRef.current?.focus(); };
  const hasFilters   = search || status || course;

  return (
    <AdminLayout title="Students">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input ref={searchRef} type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by ID, name or mobile…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <button type="submit" className="btn-primary btn-md text-sm px-4">Search</button>
        </form>

        <select value={status} onChange={e => { setStatus(e.target.value); setPage(0); }}
          className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
          {STATUSES.map(s => <option key={s} value={s}>{S_LABELS[s]}</option>)}
        </select>

        <select value={course} onChange={e => { setCourse(e.target.value); setPage(0); }}
          className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer max-w-[180px]">
          {COURSE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <button onClick={() => adminNavigate('/admin/students/new')} className="btn-primary btn-md text-sm flex-shrink-0">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Student
        </button>
      </div>

      {/* Active filters */}
      {hasFilters && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-gray-500 font-semibold">Filters:</span>
          {search && <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full border border-primary-100">"{search}" <button onClick={() => { setSearch(''); setSearchInput(''); setPage(0); }}>×</button></span>}
          {status && <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full border border-primary-100">{S_LABELS[status]} <button onClick={() => { setStatus(''); setPage(0); }}>×</button></span>}
          {course && <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full border border-primary-100">{course} <button onClick={() => { setCourse(''); setPage(0); }}>×</button></span>}
          <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-600 font-semibold">Clear all</button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 font-semibold flex items-center justify-between">
          {error} <button onClick={load} className="underline ml-3">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Loading students…
          </div>
        ) : students.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-sm font-semibold">No students found.</p>
            {hasFilters && <button onClick={clearFilters} className="mt-2 text-sm text-primary-600 hover:underline font-semibold">Clear filters</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Student ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Mobile</th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Course</th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Admission</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors last:border-0">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700 whitespace-nowrap">{s.studentId}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      {[s.firstName, s.middleName, s.surname].filter(Boolean).join(' ')}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-gray-600 whitespace-nowrap">{s.ownMobile || '—'}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-gray-600 max-w-[160px] truncate">{s.course || '—'}</td>
                    <td className="hidden lg:table-cell px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(s.admissionDate)}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => adminNavigate(`/admin/students/${s.id}`)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">View</button>
                        <button onClick={() => adminNavigate(`/admin/students/${s.id}/edit`)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && students.length > 0 && (
          <div className="px-4 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              Showing {paging.page * PAGE_SIZE + 1}–{Math.min((paging.page + 1) * PAGE_SIZE, paging.totalElements)} of{' '}
              <span className="font-bold text-gray-700">{paging.totalElements}</span> students
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={paging.first}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">← Prev</button>
              <span className="text-xs font-bold text-gray-700">Page {paging.page + 1} / {paging.totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={paging.last}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">Next →</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
