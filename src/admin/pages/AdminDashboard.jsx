import React, { useEffect, useState } from 'react';
import AdminLayout       from '../components/AdminLayout';
import StatusBadge       from '../components/StatusBadge';
import { listCertificates } from '../../services/adminApi';
import { adminNavigate }  from '../AdminApp';

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex items-start gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
          {value === null ? <span className="animate-pulse text-gray-300">—</span> : value}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState({ total: null, active: null, revoked: null, pending: null });
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Fetch all three status counts + first page for recent list in parallel
        const [allPage, activePage, revokedPage, pendingPage] = await Promise.all([
          listCertificates({ page: 0, size: 8 }),
          listCertificates({ page: 0, size: 1, status: 'ACTIVE' }),
          listCertificates({ page: 0, size: 1, status: 'REVOKED' }),
          listCertificates({ page: 0, size: 1, status: 'PENDING' }),
        ]);
        if (cancelled) return;
        setStats({
          total  : allPage.totalElements,
          active : activePage.totalElements,
          revoked: revokedPage.totalElements,
          pending: pendingPage.totalElements,
        });
        setRecent(allPage.content ?? []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load dashboard data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <AdminLayout title="Dashboard">

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => adminNavigate('/admin/certificates/new')}
          className="btn-primary btn-md text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Certificate
        </button>
        <button
          onClick={() => adminNavigate('/admin/certificates')}
          className="btn-outline btn-md text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          View All Certificates
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6 font-semibold">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Certificates"
          value={stats.total}
          color="bg-primary-100 text-primary-700"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
        />
        <StatCard
          label="Active"
          value={stats.active}
          color="bg-green-100 text-green-700"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
        />
        <StatCard
          label="Revoked"
          value={stats.revoked}
          color="bg-red-100 text-red-700"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          color="bg-yellow-100 text-yellow-700"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
      </div>

      {/* Recent certificates */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900 text-sm">Recent Certificates</h2>
          <button
            onClick={() => adminNavigate('/admin/certificates')}
            className="text-xs text-primary-600 font-semibold hover:underline"
          >
            View all →
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Loading…
          </div>
        ) : recent.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No certificates yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Cert No.</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Student</th>
                  <th className="hidden sm:table-cell px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Course</th>
                  <th className="hidden md:table-cell px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Issue Date</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(cert => (
                  <tr
                    key={cert.id}
                    onClick={() => adminNavigate(`/admin/certificates/${cert.id}`)}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors last:border-0"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-gray-700 font-semibold">{cert.certificateNumber}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900">{cert.studentName}</td>
                    <td className="hidden sm:table-cell px-5 py-3 text-gray-600">{cert.courseName}</td>
                    <td className="hidden md:table-cell px-5 py-3 text-gray-500">{formatDate(cert.issueDate)}</td>
                    <td className="px-5 py-3"><StatusBadge status={cert.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
