/**
 * AdminLayout — Modern professional admin shell
 * Dark sidebar (260px) + gradient top-bar + scrollable main content
 * Admin: Ravi Lande — Master Computer Academy
 */
import React, { useState } from 'react';
import { useAdminAuth }  from '../AdminAuthContext';
import { adminNavigate } from '../AdminApp';

const ADMIN_NAME   = 'Ravi Lande';
const ADMIN_ROLE   = 'Administrator';
const ACADEMY_NAME = 'Master Computer Academy';

// ── Icons ─────────────────────────────────────────────────────
const IcoDashboard  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
const IcoStudents   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoCerts      = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IcoAddStudent = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>;
const IcoAddCert    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>;
const IcoLogout     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcoHome       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcoMenu       = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IcoChevRight  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoBell       = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;

// ── Nav structure ─────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    items: [
      { label: 'Dashboard',        path: '/admin/dashboard',        icon: IcoDashboard,  match: p => p === '/admin/dashboard' || p === '/admin' },
    ],
  },
  {
    heading: 'Students',
    items: [
      { label: 'All Students',     path: '/admin/students',         icon: IcoStudents,   match: p => p.startsWith('/admin/students') && !p.endsWith('/new') },
      { label: 'Add Student',      path: '/admin/students/new',     icon: IcoAddStudent, match: p => p === '/admin/students/new' },
    ],
  },
  {
    heading: 'Certificates',
    items: [
      { label: 'All Certificates', path: '/admin/certificates',     icon: IcoCerts,      match: p => p.startsWith('/admin/certificates') && !p.endsWith('/new') },
      { label: 'Add Certificate',  path: '/admin/certificates/new', icon: IcoAddCert,    match: p => p === '/admin/certificates/new' },
    ],
  },
];

// ── NavItem ───────────────────────────────────────────────────
function NavItem({ item, current, go }) {
  const active = item.match(current);
  return (
    <button
      onClick={() => go(item.path)}
      aria-current={active ? 'page' : undefined}
      className={`
        relative w-full flex items-center gap-3 rounded-xl text-left
        transition-all duration-150 font-medium mb-0.5 group
        ${active
          ? 'bg-white/12 text-white shadow-sm'
          : 'text-slate-400 hover:text-white hover:bg-white/6'}
      `}
      style={{ padding: '9px 12px', fontSize: 13.5 }}
    >
      {/* Active indicator pill */}
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full bg-blue-400"
          style={{ width: 3, height: 22 }}
          aria-hidden="true"
        />
      )}
      <span className={`flex-shrink-0 transition-opacity ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
        <item.icon />
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      {active && (
        <span className="opacity-40"><IcoChevRight /></span>
      )}
    </button>
  );
}

// ── Admin avatar initials ─────────────────────────────────────
function AdminAvatar({ size = 'md' }) {
  const sz = size === 'sm' ? 'w-7 h-7 text-[11px]' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-bold flex-shrink-0`}
      style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff' }}>
      RL
    </div>
  );
}

// ── Main Layout ───────────────────────────────────────────────
export default function AdminLayout({ title, subtitle, children }) {
  const { logout }              = useAdminAuth();
  const [sideOpen, setSideOpen] = useState(false);
  const current                 = window.location.pathname;

  const go = (path) => {
    setSideOpen(false);
    adminNavigate(path);
  };

  return (
    <div className="admin-shell">

      {/* Mobile backdrop */}
      {sideOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-[2px]"
          onClick={() => setSideOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside
        role="navigation"
        aria-label="Admin navigation"
        className={`
          admin-sidebar
          ${sideOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 px-5 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white flex-shrink-0 p-1">
            <img
              src="/images/master-computer-academy-logo.svg"
              alt="MCA"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight truncate">Master Computer</p>
            <p className="text-blue-300 font-medium leading-tight truncate" style={{ fontSize: 11 }}>Academy Admin</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3" style={{ scrollbarWidth: 'none' }}>
          {NAV_SECTIONS.map((section, si) => (
            <div key={si} className="mb-5">
              {section.heading && (
                <p className="px-3 mb-2 font-bold text-slate-500 uppercase tracking-widest"
                  style={{ fontSize: 10 }}>
                  {section.heading}
                </p>
              )}
              {section.items.map(item => (
                <NavItem key={item.path} item={item} current={current} go={go} />
              ))}
            </div>
          ))}
        </nav>

        {/* Admin profile strip at bottom */}
        <div className="flex-shrink-0 px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Admin info */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl mb-2"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <AdminAvatar size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-white font-bold text-sm leading-tight truncate">{ADMIN_NAME}</p>
              <p className="text-slate-400 leading-tight truncate" style={{ fontSize: 11 }}>{ADMIN_ROLE}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 rounded-xl text-left text-slate-400
                       hover:text-red-400 transition-all font-medium"
            style={{ padding: '8px 12px', fontSize: 13, background: 'transparent' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <IcoLogout />
            <span>Sign out</span>
          </button>

          {/* Public site link */}
          <a
            href="/"
            className="w-full flex items-center gap-3 rounded-xl text-slate-500
                       hover:text-slate-300 transition-colors"
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            <IcoHome />
            <span>View Public Site</span>
          </a>
        </div>
      </aside>

      {/* ── MAIN AREA ───────────────────────────────────────── */}
      <div className="admin-main">

        {/* Top header */}
        <header className="admin-header">
          <div className="flex items-center gap-4 min-w-0">
            {/* Hamburger */}
            <button
              onClick={() => setSideOpen(s => !s)}
              className="lg:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center
                         rounded-xl border border-slate-200 text-slate-600
                         hover:bg-slate-50 transition-colors"
              aria-label="Toggle navigation"
              aria-expanded={sideOpen}
            >
              <IcoMenu />
            </button>

            {/* Breadcrumb-style title */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: 12 }}>
                <span>{ACADEMY_NAME}</span>
                <IcoChevRight />
                <span className="text-slate-700 font-semibold truncate">{title}</span>
              </div>
              {subtitle && (
                <p className="text-slate-400 truncate mt-0.5" style={{ fontSize: 12 }}>{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Notification bell (decorative) */}
            <button
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200
                         text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              aria-label="Notifications"
            >
              <IcoBell />
            </button>

            {/* Admin info chip */}
            <div className="hidden sm:flex items-center gap-2.5 pl-3"
              style={{ borderLeft: '1px solid #e2e8f0' }}>
              <AdminAvatar size="sm" />
              <div className="hidden md:block">
                <p className="font-bold text-slate-800 leading-tight" style={{ fontSize: 13 }}>{ADMIN_NAME}</p>
                <p className="text-slate-400 leading-tight" style={{ fontSize: 11 }}>{ADMIN_ROLE}</p>
              </div>
              <button
                onClick={logout}
                className="ml-1 flex items-center gap-1.5 rounded-lg text-slate-400
                           hover:text-red-600 hover:bg-red-50 transition-colors font-medium"
                style={{ padding: '5px 10px', fontSize: 12 }}
                aria-label="Sign out"
              >
                <IcoLogout />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-content" id="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
