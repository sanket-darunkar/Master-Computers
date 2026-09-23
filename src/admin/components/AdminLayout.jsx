/**
 * AdminLayout — Professional SaaS-style admin shell
 * Sidebar (240px, dark navy) + sticky top header + scrollable main content
 */
import React, { useState } from 'react';
import { useAdminAuth }  from '../AdminAuthContext';
import { adminNavigate } from '../AdminApp';

// ── Icons ─────────────────────────────────────────────────────
const IcoDashboard   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const IcoStudents    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoCerts       = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IcoAddStudent  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>;
const IcoAddCert     = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>;
const IcoLogout      = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcoHome        = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcoMenu        = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;

// ── Nav structure ─────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    items: [
      { label: 'Dashboard',       path: '/admin/dashboard',        icon: IcoDashboard,  match: p => p === '/admin/dashboard' || p === '/admin' },
    ],
  },
  {
    heading: 'Students',
    items: [
      { label: 'All Students',    path: '/admin/students',         icon: IcoStudents,   match: p => p.startsWith('/admin/students') && !p.endsWith('/new') },
      { label: 'Add Student',     path: '/admin/students/new',     icon: IcoAddStudent, match: p => p === '/admin/students/new' },
    ],
  },
  {
    heading: 'Certificates',
    items: [
      { label: 'All Certificates',path: '/admin/certificates',     icon: IcoCerts,      match: p => p.startsWith('/admin/certificates') && !p.endsWith('/new') },
      { label: 'Add Certificate', path: '/admin/certificates/new', icon: IcoAddCert,    match: p => p === '/admin/certificates/new' },
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
        admin-nav-item
        ${active ? 'admin-nav-item--active' : 'admin-nav-item--inactive'}
      `}
    >
      <span className="admin-nav-icon">
        <item.icon />
      </span>
      <span className="admin-nav-label">{item.label}</span>
      {active && <span className="admin-nav-indicator" aria-hidden="true" />}
    </button>
  );
}

// ── Main layout ───────────────────────────────────────────────
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
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
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
        {/* Brand */}
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo-wrap">
            <img
              src="/images/master-computer-academy-logo.svg"
              alt="Master Computer Academy"
              className="admin-sidebar-logo"
            />
          </div>
          <div className="admin-sidebar-brand-text">
            <span className="admin-sidebar-brand-name">Master Computer</span>
            <span className="admin-sidebar-brand-sub">Academy Admin</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="admin-sidebar-nav">
          {NAV_SECTIONS.map((section, si) => (
            <div key={si} className="admin-nav-section">
              {section.heading && (
                <p className="admin-nav-section-heading">{section.heading}</p>
              )}
              {section.items.map(item => (
                <NavItem key={item.path} item={item} current={current} go={go} />
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="admin-sidebar-footer">
          <button onClick={logout} className="admin-sidebar-logout">
            <IcoLogout />
            <span>Logout</span>
          </button>
          <a href="/" className="admin-sidebar-public-link">
            <IcoHome />
            <span>View Public Site</span>
          </a>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────── */}
      <div className="admin-main">

        {/* Top header */}
        <header className="admin-header">
          <button
            onClick={() => setSideOpen(s => !s)}
            className="admin-header-hamburger lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={sideOpen}
          >
            <IcoMenu />
          </button>

          <div className="admin-header-title-area">
            <h1 className="admin-header-title">{title}</h1>
            {subtitle && <p className="admin-header-subtitle">{subtitle}</p>}
          </div>

          <div className="admin-header-actions">
            <button
              onClick={logout}
              className="admin-header-logout-btn"
              aria-label="Sign out"
            >
              <IcoLogout />
              <span className="hidden sm:inline">Sign out</span>
            </button>
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
