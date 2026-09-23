import React, { useEffect, useState } from 'react';
import AdminLayout          from '../components/AdminLayout';
import StatusBadge          from '../components/StatusBadge';
import { listCertificates, listStudents } from '../../services/adminApi';
import { adminNavigate }    from '../AdminApp';

function fmtDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({ label, value, icon, iconBg, iconColor, trend }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon" style={{ background: iconBg }}>
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <div className="admin-stat-value">
        {value === null
          ? <span className="inline-block w-12 h-8 admin-skeleton rounded" />
          : value}
      </div>
      <div className="admin-stat-label">{label}</div>
      {trend && <div className="admin-stat-sub">{trend}</div>}
    </div>
  );
}

const IcoStudents = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IcoCerts = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);
const IcoActive = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IcoPending = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IcoPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export default function AdminDashboard() {
  const [certStats,   setCertStats]   = useState({ total: null, active: null });
  const [stuStats,    setStuStats]    = useState({ total: null, active: null });
  const [recentCerts, setRecentCerts] = useState([]);
  const [recentStus,  setRecentStus]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [allCerts, activeCerts, allStus, activeStus] = await Promise.allSettled([
          listCertificates({ page: 0, size: 5 }),
          listCertificates({ page: 0, size: 1, status: 'ACTIVE' }),
          listStudents({ page: 0, size: 5 }),
          listStudents({ page: 0, size: 1, status: 'ACTIVE' }),
        ]);
        if (cancelled) return;

        if (allCerts.status    === 'fulfilled') { setRecentCerts(allCerts.value.content ?? []); setCertStats(p => ({ ...p, total: allCerts.value.totalElements })); }
        if (activeCerts.status === 'fulfilled') setCertStats(p => ({ ...p, active: activeCerts.value.totalElements }));
        if (allStus.status     === 'fulfilled') { setRecentStus(allStus.value.content ?? []); setStuStats(p => ({ ...p, total: allStus.value.totalElements })); }
        if (activeStus.status  === 'fulfilled') setStuStats(p => ({ ...p, active: activeStus.value.totalElements }));
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <AdminLayout title="Dashboard" subtitle={`${getGreeting()} — here's an overview of your academy`}>

      {error && <div className="admin-error mb-5">{error}</div>}

      {/* ── Quick Actions ──────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-7">
        <button onClick={() => adminNavigate('/admin/students/new')} className="admin-btn-primary">
          <IcoPlus /> Add Student
        </button>
        <button onClick={() => adminNavigate('/admin/certificates/new')} className="admin-btn-secondary">
          <IcoPlus /> Add Certificate
        </button>
        <button onClick={() => adminNavigate('/admin/students')} className="admin-btn-ghost">
          View All Students →
        </button>
        <button onClick={() => adminNavigate('/admin/certificates')} className="admin-btn-ghost">
          View All Certificates →
        </button>
      </div>

      {/* ── Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        <StatCard label="Total Students"      value={stuStats.total}    iconBg="#dbeafe" iconColor="#1d4ed8" icon={<IcoStudents />} />
        <StatCard label="Active Students"     value={stuStats.active}   iconBg="#dcfce7" iconColor="#15803d" icon={<IcoActive />}   />
        <StatCard label="Total Certificates"  value={certStats.total}   iconBg="#f3e8ff" iconColor="#7e22ce" icon={<IcoCerts />}    />
        <StatCard label="Active Certificates" value={certStats.active}  iconBg="#fef9c3" iconColor="#a16207" icon={<IcoPending />}  />
      </div>

      {/* ── Recent tables ─────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Recent Students */}
        <div className="admin-table-wrap">
          <div className="admin-card-header">
            <span className="admin-card-title">Recent Students</span>
            <button onClick={() => adminNavigate('/admin/students')}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              style={{ fontSize: 12.5 }}>View all →</button>
          </div>
          {loading ? (
            <div className="admin-loading"><svg className="animate-spin admin-spinner h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Loading…</div>
          ) : recentStus.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon"><IcoStudents /></div>
              <p className="admin-empty-title">No students yet</p>
              <p className="admin-empty-sub">Add your first student to get started.</p>
              <button onClick={() => adminNavigate('/admin/students/new')} className="admin-btn-primary admin-btn-sm">Add Student</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead><tr>
                  <th>Student</th>
                  <th className="hidden sm:table-cell">Course</th>
                  <th>Status</th>
                </tr></thead>
                <tbody>
                  {recentStus.map(s => (
                    <tr key={s.id} onClick={() => adminNavigate(`/admin/students/${s.id}`)}>
                      <td>
                        <div className="admin-table-name">{[s.firstName, s.surname].filter(Boolean).join(' ')}</div>
                        <div className="admin-table-secondary admin-table-mono">{s.studentId}</div>
                      </td>
                      <td className="hidden sm:table-cell">
                        <div className="text-slate-600 max-w-[160px] truncate" style={{ fontSize: 13 }}>{s.course || '—'}</div>
                      </td>
                      <td><StatusBadge status={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Certificates */}
        <div className="admin-table-wrap">
          <div className="admin-card-header">
            <span className="admin-card-title">Recent Certificates</span>
            <button onClick={() => adminNavigate('/admin/certificates')}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              style={{ fontSize: 12.5 }}>View all →</button>
          </div>
          {loading ? (
            <div className="admin-loading"><svg className="animate-spin admin-spinner h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Loading…</div>
          ) : recentCerts.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon"><IcoCerts /></div>
              <p className="admin-empty-title">No certificates yet</p>
              <p className="admin-empty-sub">Issue your first certificate to get started.</p>
              <button onClick={() => adminNavigate('/admin/certificates/new')} className="admin-btn-primary admin-btn-sm">Add Certificate</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead><tr>
                  <th>Certificate</th>
                  <th className="hidden sm:table-cell">Date</th>
                  <th>Status</th>
                </tr></thead>
                <tbody>
                  {recentCerts.map(c => (
                    <tr key={c.id} onClick={() => adminNavigate(`/admin/certificates/${c.id}`)}>
                      <td>
                        <div className="admin-table-name">{c.studentName}</div>
                        <div className="admin-table-secondary admin-table-mono">{c.certificateNumber}</div>
                      </td>
                      <td className="hidden sm:table-cell">
                        <div style={{ fontSize: 13, color: '#64748b' }}>{fmtDate(c.issueDate)}</div>
                      </td>
                      <td><StatusBadge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
