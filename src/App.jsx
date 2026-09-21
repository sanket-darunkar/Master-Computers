import React, { useState, useEffect } from 'react';

// Layout
import Navbar                 from './components/layout/Navbar';
import Footer                 from './components/layout/Footer';
import MobileBottomBar        from './components/layout/MobileBottomBar';

// Home page sections
import Hero                   from './components/sections/Hero';
import MsCit                  from './components/sections/MsCit';
import WhyMsCit               from './components/sections/WhyMsCit';
import Courses                from './components/sections/Courses';
import WhyUs                  from './components/sections/WhyUs';
import About                  from './components/sections/About';
import LearningJourney        from './components/sections/LearningJourney';
import Reviews                from './components/sections/Reviews';
import Gallery                from './components/sections/Gallery';
import Location               from './components/sections/Location';
import Contact                from './components/sections/Contact';
import FinalCta               from './components/sections/FinalCta';

// Pages
import CertificateVerification from './pages/CertificateVerification';

// Admin section (lazy-loaded so it doesn't bloat the public bundle)
import AdminApp               from './admin/AdminApp';

// ─────────────────────────────────────────────────────────────
// Router
//
// Public routes  (query-param OR pathname):
//   /                                              → Home
//   /?page=certificate-verification                → Certificate Verification
//   /certificate-verification?certificate=X        → auto-verify
//
// Admin routes  (pathname-based, always):
//   /admin/login
//   /admin/dashboard
//   /admin/certificates
//   /admin/certificates/new
//   /admin/certificates/:id
//   /admin/certificates/:id/edit
//
// Admin routes are handled entirely by <AdminApp> which has its
// own auth context, layout, and sub-routing. The public Navbar /
// Footer are NOT rendered for admin pages.
// ─────────────────────────────────────────────────────────────

function isAdminPath() {
  return window.location.pathname.startsWith('/admin');
}

function getCurrentPage() {
  if (window.location.pathname === '/certificate-verification') {
    return 'certificate-verification';
  }
  const params = new URLSearchParams(window.location.search);
  return params.get('page') || 'home';
}

export default function App() {
  // If the current URL is an admin path, render AdminApp exclusively.
  // AdminApp handles all its own routing, auth, and layout.
  if (isAdminPath()) {
    return <AdminApp />;
  }

  // ── Public website ──────────────────────────────────────
  return <PublicApp />;
}

function PublicApp() {
  const [page, setPage] = useState(getCurrentPage);

  // React to browser back/forward navigation
  useEffect(() => {
    const onPop = () => setPage(getCurrentPage());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Expose a global navigate helper so Navbar/Footer can switch pages
  useEffect(() => {
    window.__mcaNavigate = (targetPage, extraParams = {}) => {
      const url = new URL(window.location.href);
      if (targetPage === 'home') {
        url.search = '';
      } else {
        url.searchParams.set('page', targetPage);
        Object.entries(extraParams).forEach(([k, v]) => url.searchParams.set(k, v));
      }
      window.history.pushState({}, '', url.toString());
      setPage(targetPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    return () => { delete window.__mcaNavigate; };
  }, []);

  const isCertPage = page === 'certificate-verification';

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]
                   focus:bg-white focus:text-primary-700 focus:font-bold focus:px-4 focus:py-2
                   focus:rounded-xl focus:shadow-lg focus:ring-2 focus:ring-primary-600"
      >
        Skip to main content
      </a>

      <Navbar currentPage={page} />

      <main id="main-content">
        {isCertPage ? (
          <CertificateVerification />
        ) : (
          <>
            <Hero />
            <MsCit />
            <WhyMsCit />
            <Courses />
            <WhyUs />
            <About />
            <LearningJourney />
            <Reviews />
            <Gallery />
            <Location />
            <Contact />
            <FinalCta />
          </>
        )}
      </main>

      <Footer currentPage={page} />
      {!isCertPage && <MobileBottomBar />}
    </>
  );
}
