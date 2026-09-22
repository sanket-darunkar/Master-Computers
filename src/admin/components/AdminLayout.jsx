/**
 * AdminLayout
 * ───────────
 * Sidebar navigation + top header wrapper for all protected admin pages.
 *
 * Props:
 *   title    — page title shown in the header
 *   children — page content
 */

import React, { useState } from 'react';
import { useAdminAuth }    from '../AdminAuthContext';
import { adminNavigate }   from '../AdminApp';

const NAV_ITEMS = [
  {
    label : 'Dashboard',
    path  : '/admin/dashboard',
    match : p => p === '/admin/dashboard',
    icon  : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
    ),
  },
  {
    label : 'Students',
    path  : '/admin/students',
    match : p => p.startsWith('/admin/students'),
    icon  : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
  },
  {
    label : 'Certificates',
    path  : '/admin/certificates',
    match : p => p.startsWith('/admin/certificates'),
    icon  : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
    ),
  },
];

export default function AdminLayout({ title, children }) {
  const { logout }       = useAdminAuth();
  const [sideOpen, setSideOpen] = useState(false);
  const current = window.location.pathname;

  const go = (path) => {
    setSideOpen(false);
    adminNavigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar ── */}
      {/* Mobile backdrop */}
      {sideOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSideOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-primary-900 text-white z-40
                    flex flex-col transition-transform duration-300
                    ${sideOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-primary-800 flex items-center gap-3">
          <img
            src="/images/master-computer-academy-logo.svg"
            alt="MCA"
            className="h-9 w-auto bg-white rounded-lg px-2 py-1 flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight truncate">Master Computer</p>
            <p className="text-blue-300 text-xs">Admin Panel</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const active = item.match(current);
            return (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                            transition-colors text-left
                            ${active
                              ? 'bg-white/15 text-white'
                              : 'text-blue-200 hover:bg-white/10 hover:text-white'}`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-primary-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                       text-blue-200 hover:bg-red-600/20 hover:text-red-300 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
          {/* Public site link */}
          <a
            href="/"
            className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs
                       text-blue-300 hover:text-blue-100 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            View Public Site
          </a>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">

        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-4 flex-shrink-0">
          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setSideOpen(s => !s)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Open navigation"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>

          <h1 className="text-base sm:text-lg font-extrabold text-gray-900 flex-1">{title}</h1>

          {/* Logout shortcut (desktop) */}
          <button
            onClick={logout}
            className="hidden sm:flex items-center gap-2 text-xs text-gray-500 hover:text-red-600
                       font-semibold transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
