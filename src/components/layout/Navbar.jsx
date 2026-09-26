import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ACADEMY_NAME, waLink, WA_MSG_ADMISSION, callLink, PHONE_NUMBER } from '../../config/siteConfig';

const LOGO_SRC = '/images/master-computer-academy-logo.svg';

const NAV_LINKS = [
  { label: 'Home',     href: '#home' },
  { label: 'MS-CIT',  href: '#mscit' },
  { label: 'Courses', href: '#courses' },
  { label: 'About',   href: '#about' },
  { label: 'Why Us',  href: '#why-us' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Contact', href: '#contact' },
];

// ── Icons ─────────────────────────────────────────────────────
const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <line x1="3" y1="6"  x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const IconClose = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6"  y2="18" />
    <line x1="6"  y1="6" x2="18" y2="18" />
  </svg>
);
const IconChev = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconCert = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IconPortal = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 10.8 19.79 19.79 0 0 1 .03 2.18 2 2 0 0 1 2 0h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L6.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.05 12.05 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IconWA = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.852L0 24l6.335-1.496A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.795 9.795 0 0 1-5.032-1.392l-.36-.214-3.724.879.942-3.617-.235-.372A9.777 9.777 0 0 1 2.182 12C2.182 6.579 6.579 2.182 12 2.182S21.818 6.579 21.818 12 17.421 21.818 12 21.818z"/>
  </svg>
);

// ── Tools dropdown items ──────────────────────────────────────
const TOOLS = [
  {
    key   : 'certificate-verification',
    icon  : <IconCert />,
    label : 'Verify Certificate',
    sub   : 'Check your certificate status',
  },
  {
    key   : 'student-portal',
    icon  : <IconPortal />,
    label : 'Student Portal',
    sub   : 'View your details & fees',
  },
];

export default function Navbar({ currentPage = 'home' }) {
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [toolsOpen,    setToolsOpen]    = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [activeSection,setActive]       = useState('home');
  const toolsRef = useRef(null);

  const isCertPage    = currentPage === 'certificate-verification';
  const isPortalPage  = currentPage === 'student-portal';
  const isSpecialPage = isCertPage || isPortalPage;
  const isToolActive  = isSpecialPage;

  const closeMenu  = useCallback(() => setMenuOpen(false), []);
  const closeTools = useCallback(() => setToolsOpen(false), []);

  // ── Scroll tracking ──────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      if (!isSpecialPage) {
        const ids = NAV_LINKS.map(l => l.href.slice(1));
        for (let i = ids.length - 1; i >= 0; i--) {
          const el = document.getElementById(ids[i]);
          if (el && window.scrollY >= el.offsetTop - 110) {
            setActive(ids[i]);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isSpecialPage]);

  // Close mobile menu on desktop resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) closeMenu(); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [closeMenu]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close Tools dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target)) closeTools();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [closeTools]);

  // ── Navigation helpers ──────────────────────────────────
  const handleSectionClick = (e, href) => {
    e.preventDefault();
    closeMenu();
    closeTools();
    if (isSpecialPage) {
      window.__mcaNavigate?.('home');
      setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const goHome = (e) => { e.preventDefault(); closeMenu(); closeTools(); window.__mcaNavigate?.('home'); };

  const goTool = (e, key) => {
    e.preventDefault();
    closeMenu();
    closeTools();
    window.__mcaNavigate?.(key);
  };

  // ── Link class helpers ──────────────────────────────────
  const desktopLinkCls = (id) => {
    const isActive = !isSpecialPage && activeSection === id;
    return [
      'relative px-1 py-1 text-sm font-medium transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded',
      isActive
        ? 'text-primary-700'
        : 'text-gray-600 hover:text-primary-700',
    ].join(' ');
  };

  const mobileLinkCls = (id) => {
    const isActive = !isSpecialPage && activeSection === id;
    return [
      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150',
      isActive
        ? 'bg-primary-50 text-primary-700 font-semibold'
        : 'text-gray-700 hover:bg-gray-50',
    ].join(' ');
  };

  return (
    <>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header
        role="banner"
        className={`fixed top-0 left-0 right-0 z-50 print:hidden transition-all duration-300
          ${scrolled
            ? 'bg-white shadow-[0_1px_0_0_#e5e7eb] backdrop-blur-md'
            : 'bg-white/95 backdrop-blur-sm'
          }`}
      >
        {/* Top accent bar */}
        <div className="h-0.5 bg-gradient-to-r from-primary-700 via-primary-500 to-accent-500" aria-hidden="true" />

        <div className="container-main">
          <div className="flex items-center h-[66px] gap-6">

            {/* ── Logo ── */}
            <a
              href="/"
              onClick={goHome}
              className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-lg"
              aria-label={`${ACADEMY_NAME} – Home`}
            >
              <img
                src={LOGO_SRC}
                alt={`${ACADEMY_NAME} logo`}
                className="h-[42px] w-auto object-contain"
                width="266"
                height="100"
                loading="eager"
                decoding="async"
              />
            </a>

            {/* ── Desktop nav (center) ── */}
            <nav
              aria-label="Main navigation"
              className="hidden lg:flex flex-1 items-center justify-center gap-6"
            >
              {NAV_LINKS.map(link => {
                const id = link.href.slice(1);
                return (
                  <a
                    key={link.href}
                    href={isSpecialPage ? '/' : link.href}
                    onClick={e => handleSectionClick(e, link.href)}
                    className={desktopLinkCls(id)}
                    aria-current={!isSpecialPage && activeSection === id ? 'page' : undefined}
                  >
                    {link.label}
                    {/* Active underline */}
                    {!isSpecialPage && activeSection === id && (
                      <span
                        className="absolute -bottom-[22px] left-0 right-0 h-0.5 bg-primary-600 rounded-full"
                        aria-hidden="true"
                      />
                    )}
                  </a>
                );
              })}

              {/* Tools dropdown */}
              <div className="relative" ref={toolsRef}>
                <button
                  onClick={() => setToolsOpen(o => !o)}
                  className={`relative flex items-center gap-1.5 px-1 py-1 text-sm font-medium
                    transition-colors duration-150 focus-visible:outline-none
                    focus-visible:ring-2 focus-visible:ring-primary-500 rounded
                    ${isToolActive ? 'text-primary-700' : 'text-gray-600 hover:text-primary-700'}`}
                  aria-haspopup="true"
                  aria-expanded={toolsOpen}
                >
                  Tools
                  <span className={`transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`}>
                    <IconChev />
                  </span>
                  {isToolActive && (
                    <span
                      className="absolute -bottom-[22px] left-0 right-0 h-0.5 bg-primary-600 rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </button>

                {/* Dropdown panel */}
                {toolsOpen && (
                  <div className="absolute top-[calc(100%+14px)] left-1/2 -translate-x-1/2 w-64
                                  bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50">
                    {/* Arrow notch */}
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3
                                    bg-white border-l border-t border-gray-100 rotate-45" aria-hidden="true" />
                    <div className="py-1.5">
                      {TOOLS.map(tool => (
                        <a
                          key={tool.key}
                          href={`/?page=${tool.key}`}
                          onClick={e => goTool(e, tool.key)}
                          className={`flex items-start gap-3 px-4 py-3 transition-colors duration-150
                            ${currentPage === tool.key
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
                            ${currentPage === tool.key
                              ? 'bg-primary-100 text-primary-700'
                              : 'bg-gray-100 text-gray-500'}`}>
                            {tool.icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold leading-tight">{tool.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{tool.sub}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* ── Desktop CTAs (right) ── */}
            <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0">
              <a
                href={callLink()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200
                           text-gray-700 text-sm font-semibold hover:border-primary-300
                           hover:text-primary-700 hover:bg-primary-50 transition-all duration-150
                           focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label={`Call ${PHONE_NUMBER}`}
              >
                <IconPhone />
                {PHONE_NUMBER}
              </a>
              <a
                href={waLink(WA_MSG_ADMISSION)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-700 text-white
                           text-sm font-semibold hover:bg-primary-800 active:bg-primary-900
                           shadow-sm hover:shadow-md transition-all duration-150
                           focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Enquire about MS-CIT on WhatsApp"
              >
                <IconWA />
                Enquire Now
              </a>
            </div>

            {/* ── Mobile: phone + hamburger ── */}
            <div className="lg:hidden ml-auto flex items-center gap-2">
              <a
                href={callLink()}
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200
                           text-gray-600 hover:text-primary-700 hover:border-primary-300
                           transition-all duration-150"
                aria-label={`Call ${PHONE_NUMBER}`}
              >
                <IconPhone />
              </a>
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200
                           text-gray-700 hover:bg-gray-50 transition-colors
                           focus-visible:ring-2 focus-visible:ring-primary-600"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              >
                {menuOpen ? <IconClose /> : <IconMenu />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE MENU DRAWER ─────────────────────────────── */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`lg:hidden fixed inset-0 z-40 print:hidden transition-opacity duration-300
          ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          onClick={closeMenu}
          aria-hidden="true"
        />

        {/* Drawer panel */}
        <div
          className={`absolute top-0 right-0 h-full w-[300px] bg-white flex flex-col
            shadow-2xl transition-transform duration-300
            ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Drawer header — dark brand strip */}
          <div className="bg-primary-800 px-4 py-4 flex items-center justify-between flex-shrink-0">
            <a
              href="/"
              onClick={goHome}
              aria-label={`${ACADEMY_NAME} – Home`}
              className="focus-visible:ring-2 focus-visible:ring-white rounded"
            >
              <img
                src={LOGO_SRC}
                alt={`${ACADEMY_NAME} logo`}
                className="h-9 w-auto object-contain bg-white rounded-lg px-2 py-0.5"
                width="239"
                height="90"
                loading="eager"
              />
            </a>
            <button
              onClick={closeMenu}
              className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center
                         hover:bg-white/20 transition-colors"
              aria-label="Close menu"
            >
              <IconClose />
            </button>
          </div>

          {/* Scrollable nav body */}
          <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-3 pt-3 pb-4">

            {/* Main links */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-4 mb-1.5">
              Navigate
            </p>
            {NAV_LINKS.map(link => {
              const id = link.href.slice(1);
              return (
                <a
                  key={link.href}
                  href={isSpecialPage ? '/' : link.href}
                  onClick={e => handleSectionClick(e, link.href)}
                  className={mobileLinkCls(id)}
                >
                  {link.label}
                </a>
              );
            })}

            {/* Divider */}
            <div className="my-3 border-t border-gray-100" />

            {/* Tools section */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-4 mb-1.5">
              Tools
            </p>
            {TOOLS.map(tool => (
              <a
                key={tool.key}
                href={`/?page=${tool.key}`}
                onClick={e => goTool(e, tool.key)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-colors duration-150 mb-1
                  ${currentPage === tool.key
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                  ${currentPage === tool.key ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                  {tool.icon}
                </div>
                {tool.label}
              </a>
            ))}
          </nav>

          {/* Drawer footer CTAs */}
          <div className="px-4 pb-6 pt-3 border-t border-gray-100 flex flex-col gap-2.5 flex-shrink-0">
            <a
              href={waLink(WA_MSG_ADMISSION)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                         bg-primary-700 text-white text-sm font-bold
                         hover:bg-primary-800 transition-colors"
            >
              <IconWA />
              Enquire about MS-CIT
            </a>
            <a
              href={callLink()}
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                         border border-gray-200 text-gray-700 text-sm font-semibold
                         hover:bg-gray-50 transition-colors"
            >
              <IconPhone />
              {PHONE_NUMBER}
            </a>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-[68px] print:hidden" aria-hidden="true" />
    </>
  );
}
