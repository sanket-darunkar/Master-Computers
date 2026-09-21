import React, { useState, useEffect, useCallback } from 'react';
import { ACADEMY_NAME, waLink, WA_MSG_ADMISSION, callLink } from '../../config/siteConfig';

const LOGO_SRC = '/images/master-computer-academy-logo.svg';

const NAV_LINKS = [
  { label: 'Home',      href: '#home' },
  { label: 'MS-CIT',   href: '#mscit' },
  { label: 'Courses',  href: '#courses' },
  { label: 'About',    href: '#about' },
  { label: 'Why Us',   href: '#why-us' },
  { label: 'Reviews',  href: '#reviews' },
  { label: 'Gallery',  href: '#gallery' },
  { label: 'Contact',  href: '#contact' },
];

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="3" y1="6"  x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6"  x2="6"  y2="18" />
    <line x1="6"  y1="6"  x2="18" y2="18" />
  </svg>
);

const CertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

export default function Navbar({ currentPage = 'home' }) {
  const [menuOpen, setMenuOpen]    = useState(false);
  const [scrolled, setScrolled]    = useState(false);
  const [activeSection, setActive] = useState('home');

  const isCertPage = currentPage === 'certificate-verification';
  const closeMenu  = useCallback(() => setMenuOpen(false), []);

  // ── Scroll / active section tracking (home page only) ───────
  useEffect(() => {
    if (isCertPage) return;
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const sections = NAV_LINKS.map(l => l.href.replace('#', ''));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && window.scrollY >= el.offsetTop - 100) {
          setActive(sections[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isCertPage]);

  // Scroll shadow also applies on cert page
  useEffect(() => {
    if (!isCertPage) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isCertPage]);

  // Close menu on desktop resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) closeMenu(); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [closeMenu]);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // ── Navigation helpers ────────────────────────────────────
  const handleSectionClick = (e, href) => {
    e.preventDefault();
    closeMenu();
    if (isCertPage) {
      // Navigate back to home first, then let hash scroll happen
      window.__mcaNavigate?.('home');
      setTimeout(() => {
        const el = document.querySelector(href);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const goHome = (e) => {
    e.preventDefault();
    closeMenu();
    window.__mcaNavigate?.('home');
  };

  const goCertPage = (e) => {
    e.preventDefault();
    closeMenu();
    window.__mcaNavigate?.('certificate-verification');
  };

  return (
    <>
      <header
        role="banner"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 print:hidden
          ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white/90 backdrop-blur-sm shadow-sm'}`}
      >
        <div className="container-main">
          <div className="flex items-center justify-between h-16">

            {/* Logo — always goes home */}
            <a
              href="/"
              onClick={goHome}
              className="flex items-center flex-shrink-0 focus-visible:ring-2 focus-visible:ring-primary-600 rounded-lg p-1"
              aria-label={`${ACADEMY_NAME} – Home`}
            >
              <img
                src={LOGO_SRC}
                alt={`${ACADEMY_NAME} logo`}
                className="h-10 w-auto object-contain"
                width="266"
                height="100"
                loading="eager"
                decoding="async"
              />
            </a>

            {/* Desktop nav */}
            <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <a
                  key={link.href}
                  href={isCertPage ? '/' : link.href}
                  onClick={e => handleSectionClick(e, link.href)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                              focus-visible:ring-2 focus-visible:ring-primary-600
                    ${!isCertPage && activeSection === link.href.replace('#', '')
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-700 hover:bg-primary-50'
                    }`}
                  aria-current={!isCertPage && activeSection === link.href.replace('#', '') ? 'page' : undefined}
                >
                  {link.label}
                </a>
              ))}

              {/* Certificate Verification link */}
              <a
                href="/?page=certificate-verification"
                onClick={goCertPage}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                            focus-visible:ring-2 focus-visible:ring-primary-600 flex items-center gap-1.5
                  ${isCertPage
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-700 hover:bg-primary-50'
                  }`}
                aria-current={isCertPage ? 'page' : undefined}
              >
                <CertIcon />
                Verify Certificate
              </a>
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href={callLink()}
                className="btn-outline btn-sm"
                aria-label="Call Master Computer Academy"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8
                           19.79 19.79 0 01.03 2.18 2 2 0 012 0h3a2 2 0 012 1.72 12.05 12.05 0 00.7 2.81
                           2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45
                           12.05 12.05 0 002.81.7A2 2 0 0122 16.92z"/>
                </svg>
                Call Now
              </a>
              <a
                href={waLink(WA_MSG_ADMISSION)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary btn-sm font-devanagari"
                aria-label="Enquire about MS-CIT on WhatsApp"
              >
                Enquire Now
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100
                         focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile menu overlay ── */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 print:hidden
          ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeMenu} aria-hidden="true" />

        <div className={`absolute top-0 right-0 h-full w-72 bg-white shadow-2xl
          flex flex-col transition-transform duration-300
          ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <a href="/" onClick={goHome}
              className="focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
              aria-label={`${ACADEMY_NAME} – Home`}>
              <img src={LOGO_SRC} alt={`${ACADEMY_NAME} logo`}
                className="h-9 w-auto object-contain" width="239" height="90" loading="eager" />
            </a>
            <button onClick={closeMenu}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary-600"
              aria-label="Close menu">
              <CloseIcon />
            </button>
          </div>

          {/* Nav links */}
          <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto py-4 px-3">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.href}
                href={isCertPage ? '/' : link.href}
                onClick={e => handleSectionClick(e, link.href)}
                className={`flex items-center px-4 py-3 rounded-xl text-base font-medium
                  transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary-600 mb-1
                  ${!isCertPage && activeSection === link.href.replace('#', '')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {link.label}
              </a>
            ))}

            {/* Certificate Verification in mobile menu */}
            <a
              href="/?page=certificate-verification"
              onClick={goCertPage}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium
                transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary-600 mb-1
                ${isCertPage ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <CertIcon />
              Verify Certificate
            </a>
          </nav>

          {/* Mobile CTAs */}
          <div className="p-4 border-t border-gray-100 flex flex-col gap-3">
            <a
              href={waLink(WA_MSG_ADMISSION)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp btn-md w-full justify-center font-devanagari"
              onClick={closeMenu}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.852L0 24l6.335-1.496A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.795 9.795 0 01-5.032-1.392l-.36-.214-3.724.879.942-3.617-.235-.372A9.777 9.777 0 012.182 12C2.182 6.579 6.579 2.182 12 2.182S21.818 6.579 21.818 12 17.421 21.818 12 21.818z"/>
              </svg>
              MS-CIT Enquiry
            </a>
            <a href={callLink()} className="btn-outline btn-md w-full justify-center" onClick={closeMenu}>
              Call Now
            </a>
          </div>
        </div>
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-16 print:hidden" aria-hidden="true" />
    </>
  );
}
