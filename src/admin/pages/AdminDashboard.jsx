import React, { useEffect, useState } from 'react';
import AdminLayout          from '../components/AdminLayout';
import StatusBadge          from '../components/StatusBadge';
import { listCertificates, listStudents } from '../../services/adminApi';
import { adminNavigate }    from '../AdminApp';

const ADMIN_NAME = 'Ravi Lande';
function fmtDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', emoji: '☀️' };
  if (h < 17) return { text: 'Good afternoon', emoji: '🌤️' };
  return { text: 'Good evening', emoji: '🌙' };
}

function todayLabel() {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function initials(first, last) {
  return ((first?.[0] ?? '') + (last?.[0] ?? '')).toUpperCase() || '?';
}

// ── Icons ─────────────────────────────────────────────────────
const IcoStudents  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoCerts     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IcoActive    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IcoAward     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IcoPlus      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoArrow     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcoSpin      = () => <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ label, value, icon, accentColor, bg, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
                 text-left overflow-hidden w-full focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: accentColor }} />

      <div className="pl-5 pr-5 pt-5 pb-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 flex-shrink-0"
          style={{ background: bg, color: accentColor }}>
          {icon}
        </div>
        {/* Value */}
        <div className="text-3xl font-extrabold text-slate-900 leading-none mb-1">
          {value === null
            ? <span className="inline-block w-14 h-8 rounded-lg bg-slate-100 animate-pulse" />
            : value}
        </div>
        {/* Label */}
        <div className="text-sm font-medium text-slate-500">{label}</div>
        {/* Sub */}
        {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
      </div>

      {/* Hover arrow */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300
                      group-hover:text-slate-500 group-hover:translate-x-0.5
                      transition-all duration-200">
        <IcoArrow />
      </div>
    </button>
  );
}

// ── Quick Action Tile ─────────────────────────────────────────
function ActionTile({ icon, label, desc, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-200 shadow-sm
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
                 text-left p-5 w-full focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: accent.bg, color: accent.color }}>
        {icon}
      </div>
      <p className="text-sm font-bold text-slate-800 mb-0.5">{label}</p>
      <p className="text-xs text-slate-400 leading-snug">{desc}</p>
    </button>
  );
}

// ── Student Row ───────────────────────────────────────────────
function StudentRow({ s }) {
  const name = [s.firstName, s.surname].filter(Boolean).join(' ');
  const courseLabel = Array.isArray(s.courses) && s.courses.length > 0
    ? s.courses.length === 1 ? s.courses[0] : `${s.courses[0]} +${s.courses.length - 1}`
    : s.course || '—';

  return (
    <div
      onClick={() => adminNavigate(`/admin/students/${s.id}`)}
      className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 cursor-pointer
                 transition-colors border-b border-slate-100 last:border-0 group"
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center
                      text-blue-700 font-bold text-xs flex-shrink-0">
        {initials(s.firstName, s.surname)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
        <p className="text-xs text-slate-400 truncate font-mono">{s.studentId} · {courseLabel}</p>
      </div>
      <div className="flex-shrink-0">
        <StatusBadge status={s.examForm} />
      </div>
      <IcoArrow />
    </div>
  );
}

// ── Certificate Row ───────────────────────────────────────────
function CertRow({ c }) {
  return (
    <div
      onClick={() => adminNavigate(`/admin/certificates/${c.id}`)}
      className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 cursor-pointer
                 transition-colors border-b border-slate-100 last:border-0 group"
    >
      {/* Icon */}
      <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center
                      text-purple-600 flex-shrink-0">
        <IcoCerts />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{c.studentName}</p>
        <p className="text-xs text-slate-400 truncate font-mono">{c.certificateNumber} · {fmtDate(c.issueDate)}</p>
      </div>
      <div className="flex-shrink-0">
        <StatusBadge status={c.status} />
      </div>
      <IcoArrow />
    </div>
  );
}

// ── Section Card wrapper ──────────────────────────────────────
function SectionCard({ title, onViewAll, viewAllLabel = 'View all →', loading, empty, emptyIcon, emptyTitle, emptySub, emptyAction, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700
                       transition-colors flex items-center gap-1"
          >
            {viewAllLabel}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-slate-400 text-sm">
          <IcoSpin /> Loading…
        </div>
      ) : empty ? (
        <div className="flex flex-col items-center py-12 px-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center
                          text-slate-400 mb-3">
            {emptyIcon}
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">{emptyTitle}</p>
          <p className="text-xs text-slate-400 mb-4">{emptySub}</p>
          {emptyAction}
        </div>
      ) : children}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────
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
          listCertificates({ page: 0, size: 6 }),
          listCertificates({ page: 0, size: 1, status: 'ACTIVE' }),
          listStudents({ page: 0, size: 6 }),
          listStudents({ page: 0, size: 1 }),
        ]);
        if (cancelled) return;

        if (allCerts.status    === 'fulfilled') { setRecentCerts(allCerts.value.content ?? []); setCertStats(p => ({ ...p, total: allCerts.value.totalElements })); }
        if (activeCerts.status === 'fulfilled') setCertStats(p => ({ ...p, active: activeCerts.value.totalElements }));
        if (allStus.status     === 'fulfilled') { setRecentStus(allStus.value.content ?? []); setStuStats(p => ({ ...p, total: allStus.value.totalElements })); }
        if (activeStus.status  === 'fulfilled') setStuStats(p => ({ ...p, active: activeStus.value.totalElements }));
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load dashboard data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const greeting = getGreeting();

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        {/* ── Hero greeting banner ── */}
        <div
          className="relative rounded-2xl overflow-hidden px-6 py-7 text-white"
          style={{ background: 'linear-gradient(135deg, #1e2f6e 0%, #2d4499 60%, #3b5ec6 100%)' }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" aria-hidden="true" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" aria-hidden="true" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">{todayLabel()}</p>
              <h2 className="text-2xl font-extrabold leading-tight">
                {greeting.emoji} {greeting.text}, {ADMIN_NAME}
              </h2>
              <p className="text-blue-200 text-sm mt-1">
                {stuStats.total !== null
                  ? `${stuStats.total} students · ${certStats.total ?? '—'} certificates in system`
                  : 'Loading academy stats…'}
              </p>
            </div>
            <div className="flex gap-2.5 flex-shrink-0">
              <button
                onClick={() => adminNavigate('/admin/students/new')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-primary-800
                           text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm"
              >
                <IcoPlus /> Add Student
              </button>
              <button
                onClick={() => adminNavigate('/admin/certificates/new')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white
                           text-sm font-bold hover:bg-white/25 transition-colors border border-white/20"
              >
                <IcoPlus /> Add Certificate
              </button>
            </div>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Students"
            value={stuStats.total}
            icon={<IcoStudents />}
            accentColor="#2563eb"
            bg="#dbeafe"
            sub="All enrolled students"
            onClick={() => adminNavigate('/admin/students')}
          />
          <StatCard
            label="Total Certificates"
            value={certStats.total}
            icon={<IcoCerts />}
            accentColor="#7c3aed"
            bg="#ede9fe"
            sub="Issued certificates"
            onClick={() => adminNavigate('/admin/certificates')}
          />
          <StatCard
            label="Active Certificates"
            value={certStats.active}
            icon={<IcoActive />}
            accentColor="#059669"
            bg="#d1fae5"
            sub="Currently valid"
            onClick={() => adminNavigate('/admin/certificates')}
          />
          <StatCard
            label="Certificates Issued"
            value={certStats.total}
            icon={<IcoAward />}
            accentColor="#d97706"
            bg="#fef3c7"
            sub="Total issued to date"
            onClick={() => adminNavigate('/admin/certificates')}
          />
        </div>

        {/* ── Quick actions ── */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ActionTile
              icon={<IcoPlus />}
              label="Add Student"
              desc="Enroll a new student"
              onClick={() => adminNavigate('/admin/students/new')}
              accent={{ bg: '#dbeafe', color: '#1d4ed8' }}
            />
            <ActionTile
              icon={<IcoStudents />}
              label="View Students"
              desc="Browse all students"
              onClick={() => adminNavigate('/admin/students')}
              accent={{ bg: '#e0f2fe', color: '#0369a1' }}
            />
            <ActionTile
              icon={<IcoPlus />}
              label="Add Certificate"
              desc="Issue a new certificate"
              onClick={() => adminNavigate('/admin/certificates/new')}
              accent={{ bg: '#ede9fe', color: '#6d28d9' }}
            />
            <ActionTile
              icon={<IcoCerts />}
              label="View Certificates"
              desc="Browse all certificates"
              onClick={() => adminNavigate('/admin/certificates')}
              accent={{ bg: '#fae8ff', color: '#a21caf' }}
            />
          </div>
        </div>

        {/* ── Recent activity ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* Recent Students */}
          <SectionCard
            title="Recent Students"
            onViewAll={() => adminNavigate('/admin/students')}
            loading={loading}
            empty={!loading && recentStus.length === 0}
            emptyIcon={<IcoStudents />}
            emptyTitle="No students yet"
            emptySub="Add your first student to get started."
            emptyAction={
              <button
                onClick={() => adminNavigate('/admin/students/new')}
                className="admin-btn-primary admin-btn-sm"
              >
                <IcoPlus /> Add Student
              </button>
            }
          >
            {recentStus.map(s => <StudentRow key={s.id} s={s} />)}
          </SectionCard>

          {/* Recent Certificates */}
          <SectionCard
            title="Recent Certificates"
            onViewAll={() => adminNavigate('/admin/certificates')}
            loading={loading}
            empty={!loading && recentCerts.length === 0}
            emptyIcon={<IcoCerts />}
            emptyTitle="No certificates yet"
            emptySub="Issue your first certificate to get started."
            emptyAction={
              <button
                onClick={() => adminNavigate('/admin/certificates/new')}
                className="admin-btn-primary admin-btn-sm"
              >
                <IcoPlus /> Add Certificate
              </button>
            }
          >
            {recentCerts.map(c => <CertRow key={c.id} c={c} />)}
          </SectionCard>

        </div>
      </div>
    </AdminLayout>
  );
}
