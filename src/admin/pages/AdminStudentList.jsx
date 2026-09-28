import React, { useCallback, useEffect, useRef, useState } from 'react';
import AdminLayout       from '../components/AdminLayout';
import StatusBadge       from '../components/StatusBadge';
import ConfirmDialog     from '../components/ConfirmDialog';
import { listStudents, deleteStudent } from '../../services/adminApi';
import { useToast }      from '../components/Toast';
import { adminNavigate } from '../AdminApp';
import { COURSES }       from '../../config/siteConfig';

const PAGE_SIZE = 15;
const EXAM_FORM_OPTIONS = ['', 'Exam Form Submitted', 'Exam Form Pending'];
const EF_LABELS = { '': 'All Status', 'Exam Form Submitted': 'Submitted', 'Exam Form Pending': 'Pending' };
const COURSE_OPTIONS = [{ value: '', label: 'All Courses' }, ...COURSES.map(c => ({ value: c.name, label: c.name }))];

function fmtDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

function courseLabel(s) {
  if (Array.isArray(s.courses) && s.courses.length > 0) {
    return s.courses.length === 1 ? s.courses[0] : `${s.courses[0]} +${s.courses.length - 1}`;
  }
  return s.course || '—';
}

function Avatar({ name }) {
  const parts   = (name || '').split(' ').filter(Boolean);
  const letters = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : (name || '?')[0];
  return (
    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center
                    text-blue-700 font-bold text-xs flex-shrink-0">
      {letters.toUpperCase()}
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────
const IcoSearch  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoPlus    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoTrash   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IcoFilter  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IcoEmpty   = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>;
const IcoChevR   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;

export default function AdminStudentList() {
  const { showToast } = useToast();
  const [students,      setStudents]      = useState([]);
  const [paging,        setPaging]        = useState({ page: 0, totalPages: 0, totalElements: 0, first: true, last: true });
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [searchInput,   setSearchInput]   = useState('');
  const [search,        setSearch]        = useState('');
  const [status,        setStatus]        = useState('');
  const [course,        setCourse]        = useState('');
  const [page,          setPage]          = useState(0);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
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

  const handleSearch  = (e) => { e.preventDefault(); setPage(0); setSearch(searchInput.trim()); };
  const clearFilters  = () => { setSearchInput(''); setSearch(''); setStatus(''); setCourse(''); setPage(0); searchRef.current?.focus(); };
  const hasFilters    = search || status || course;

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteStudent(deleteTarget.id);
      showToast(`Student "${deleteTarget.name}" deleted.`, 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(err.message || 'Failed to delete student.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AdminLayout title="Students" subtitle="Manage admissions and student records">

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Student?"
        message={deleteTarget
          ? `Permanently delete "${deleteTarget.name}" (${deleteTarget.studentId})? All their data will be removed. This cannot be undone.`
          : ''}
        confirmLabel="Delete Student"
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Students</h2>
          {!loading && paging.totalElements > 0 && (
            <p className="text-slate-400 text-sm mt-0.5">
              {paging.totalElements} student{paging.totalElements !== 1 ? 's' : ''} total
            </p>
          )}
        </div>
        <button onClick={() => adminNavigate('/admin/students/new')} className="admin-btn-primary flex-shrink-0">
          <IcoPlus /> Add Student
        </button>
      </div>

      {/* ── Search + Filters ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <IcoSearch />
            </div>
            <input
              ref={searchRef}
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by name, student ID, or mobile…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm
                         bg-slate-50 text-slate-800 placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400
                         focus:bg-white transition-all"
            />
          </div>

          {/* Status filter */}
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(0); }}
            className="admin-select text-sm"
          >
            {EXAM_FORM_OPTIONS.map(s => <option key={s} value={s}>{EF_LABELS[s]}</option>)}
          </select>

          {/* Course filter */}
          <select
            value={course}
            onChange={e => { setCourse(e.target.value); setPage(0); }}
            className="admin-select text-sm"
            style={{ maxWidth: 200 }}
          >
            {COURSE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <button type="submit" className="admin-btn-primary flex-shrink-0">
            <IcoFilter /> Search
          </button>
        </form>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex items-center flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Active:</span>
            {search && (
              <span className="admin-filter-chip">
                "{search}"
                <button onClick={() => { setSearch(''); setSearchInput(''); setPage(0); }}>×</button>
              </span>
            )}
            {status && (
              <span className="admin-filter-chip">
                {EF_LABELS[status]}
                <button onClick={() => { setStatus(''); setPage(0); }}>×</button>
              </span>
            )}
            {course && (
              <span className="admin-filter-chip">
                {course}
                <button onClick={() => { setCourse(''); setPage(0); }}>×</button>
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
            Loading students…
          </div>
        ) : students.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><IcoEmpty /></div>
            <p className="admin-empty-title">No students found</p>
            <p className="admin-empty-sub">
              {hasFilters ? 'Try adjusting your search or filters.' : 'Add your first student to get started.'}
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
                  <th className="hidden lg:table-cell">Admitted</th>
                  <th>Exam Form</th>
                  <th style={{ textAlign: 'right', paddingRight: 20 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const fullName = [s.firstName, s.middleName, s.surname].filter(Boolean).join(' ');
                  return (
                    <tr
                      key={s.id}
                      onClick={() => adminNavigate(`/admin/students/${s.id}`)}
                      className="group"
                    >
                      {/* Student name + ID */}
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={fullName} />
                          <div className="min-w-0">
                            <div className="admin-table-name truncate max-w-[180px]">{fullName}</div>
                            <div className="admin-table-secondary admin-table-mono">{s.studentId}</div>
                          </div>
                        </div>
                      </td>

                      {/* Mobile */}
                      <td className="hidden sm:table-cell">
                        <span className="text-slate-500 text-sm">{s.ownMobile || '—'}</span>
                      </td>

                      {/* Course */}
                      <td className="hidden md:table-cell">
                        <div className="max-w-[180px] truncate text-slate-500 text-sm">{courseLabel(s)}</div>
                      </td>

                      {/* Admitted date */}
                      <td className="hidden lg:table-cell">
                        <span className="text-slate-400 text-sm">{fmtDate(s.admissionDate)}</span>
                      </td>

                      {/* Exam form badge */}
                      <td><StatusBadge status={s.examForm} /></td>

                      {/* Actions */}
                      <td onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5 pr-1">
                          <button
                            onClick={() => adminNavigate(`/admin/students/${s.id}`)}
                            className="admin-row-action-view"
                            title="View student"
                          >
                            View
                          </button>
                          <button
                            onClick={() => adminNavigate(`/admin/students/${s.id}/edit`)}
                            className="admin-row-action-edit"
                            title="Edit student"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: s.id, name: fullName, studentId: s.studentId })}
                            className="admin-row-action-delete"
                            title="Delete student"
                            aria-label={`Delete ${fullName}`}
                          >
                            <IcoTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && students.length > 0 && (
          <div className="admin-pagination">
            <span className="admin-pagination-info">
              Showing&nbsp;
              <strong>{paging.page * PAGE_SIZE + 1}–{Math.min((paging.page + 1) * PAGE_SIZE, paging.totalElements)}</strong>
              &nbsp;of&nbsp;
              <strong>{paging.totalElements}</strong>&nbsp;students
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
