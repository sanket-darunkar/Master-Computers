/**
 * AdminApp
 * ─────────
 * Root component for the entire /admin/* section.
 *
 * Owns:
 *  - AdminAuthProvider  (auth state + token storage)
 *  - ToastProvider      (global toast notifications)
 *  - Path-based sub-router for all admin pages
 *
 * Route table:
 *   /admin/login                    → AdminLogin       (public)
 *   /admin/dashboard                → AdminDashboard   (protected)
 *   /admin/certificates             → AdminCertList    (protected)
 *   /admin/certificates/new         → AdminCertNew     (protected)
 *   /admin/certificates/:id         → AdminCertDetail  (protected)
 *   /admin/certificates/:id/edit    → AdminCertEdit    (protected)
 *   /admin  (bare)                  → redirect to /admin/dashboard
 *   anything else under /admin      → redirect to /admin/dashboard
 */

import React, { useEffect, useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from './AdminAuthContext';
import { ToastProvider }                   from './components/Toast';

import AdminLogin          from './pages/AdminLogin';
import AdminDashboard      from './pages/AdminDashboard';
import AdminCertList       from './pages/AdminCertList';
import AdminCertNew        from './pages/AdminCertNew';
import AdminCertDetail     from './pages/AdminCertDetail';
import AdminCertEdit       from './pages/AdminCertEdit';
import AdminStudentList    from './pages/AdminStudentList';
import AdminStudentNew     from './pages/AdminStudentNew';
import AdminStudentDetail  from './pages/AdminStudentDetail';
import AdminStudentEdit    from './pages/AdminStudentEdit';

// ── Path parser ───────────────────────────────────────────────
// Returns a route descriptor from window.location.pathname.
// Supports:
//   /admin/login
//   /admin/dashboard
//   /admin/certificates
//   /admin/certificates/new
//   /admin/certificates/123
//   /admin/certificates/123/edit
function parseAdminPath(pathname) {
  const segments = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
  // []                    → dashboard (bare /admin)
  // ['login']             → login
  // ['dashboard']         → dashboard
  // ['certificates']      → cert-list
  // ['certificates','new']→ cert-new
  // ['certificates', id]  → cert-detail
  // ['certificates', id, 'edit'] → cert-edit
  if (segments.length === 0)                                return { route: 'dashboard' };
  if (segments[0] === 'login')                              return { route: 'login' };
  if (segments[0] === 'dashboard')                          return { route: 'dashboard' };
  if (segments[0] === 'certificates') {
    if (!segments[1])                                       return { route: 'cert-list' };
    if (segments[1] === 'new')                              return { route: 'cert-new' };
    if (segments[2] === 'edit')  return { route: 'cert-edit',   id: segments[1] };
    return { route: 'cert-detail', id: segments[1] };
  }
  if (segments[0] === 'students') {
    if (!segments[1])                                       return { route: 'stu-list' };
    if (segments[1] === 'new')                              return { route: 'stu-new' };
    if (segments[2] === 'edit')   return { route: 'stu-edit',   id: segments[1] };
    return { route: 'stu-detail', id: segments[1] };
  }
  return { route: 'dashboard' };
}

// ── Admin navigation helper (exposed globally like public nav) ─
export function adminNavigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

// ── Root ──────────────────────────────────────────────────────
export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <AdminRouter />
      </ToastProvider>
    </AdminAuthProvider>
  );
}

// ── Sub-router ────────────────────────────────────────────────
function AdminRouter() {
  const [location, setLocation] = useState(() => parseAdminPath(window.location.pathname));
  const { isAuthenticated }     = useAdminAuth();

  // Listen for popstate (back/forward + adminNavigate calls)
  useEffect(() => {
    const onPop = () => setLocation(parseAdminPath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // ── Auth guard ───────────────────────────────────────────
  // Login page is always accessible.
  // All other admin pages require authentication.
  if (location.route !== 'login' && !isAuthenticated) {
    // Redirect to login, preserving the intended destination in `next`
    const intended = window.location.pathname + window.location.search;
    const loginUrl = `/admin/login${intended !== '/admin/login' ? `?next=${encodeURIComponent(intended)}` : ''}`;
    window.history.replaceState({}, '', loginUrl);
    setLocation({ route: 'login' });
    return null;
  }

  // ── Render ───────────────────────────────────────────────
  switch (location.route) {
    case 'login':       return <AdminLogin />;
    case 'dashboard':   return <AdminDashboard />;
    case 'cert-list':   return <AdminCertList />;
    case 'cert-new':    return <AdminCertNew />;
    case 'cert-detail': return <AdminCertDetail id={location.id} />;
    case 'cert-edit':   return <AdminCertEdit   id={location.id} />;
    case 'stu-list':    return <AdminStudentList />;
    case 'stu-new':     return <AdminStudentNew />;
    case 'stu-detail':  return <AdminStudentDetail id={location.id} />;
    case 'stu-edit':    return <AdminStudentEdit   id={location.id} />;
    default:            return <AdminDashboard />;
  }
}
