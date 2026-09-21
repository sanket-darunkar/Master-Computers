import React from 'react';
import {
  ACADEMY_NAME, ADDRESS_LINE1, ADDRESS_LINE2, ADDRESS_STATE,
  PHONE_NUMBER, SOCIAL, waLink, WA_MSG_GENERAL, callLink, COURSES,
} from '../../config/siteConfig';

const QUICK_LINKS = [
  { label: 'Home',                  href: '#home',    page: null },
  { label: 'MS-CIT',               href: '#mscit',   page: null },
  { label: 'Courses',              href: '#courses', page: null },
  { label: 'About',                href: '#about',   page: null },
  { label: 'Why Us',               href: '#why-us',  page: null },
  { label: 'Reviews',              href: '#reviews', page: null },
  { label: 'Gallery',              href: '#gallery', page: null },
  { label: 'Contact',              href: '#contact', page: null },
  { label: '🔍 Verify Certificate', href: '/?page=certificate-verification', page: 'certificate-verification' },
];

function handleNavClick(e, link) {
  e.preventDefault();
  if (link.page) {
    window.__mcaNavigate?.(link.page);
  } else {
    // If already on home, scroll; otherwise navigate home first
    const el = document.querySelector(link.href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.__mcaNavigate?.('home');
    }
  }
}

export default function Footer() {
  const year = new Date().getFullYear();
  const featuredCourses = COURSES.slice(0, 6);

  return (
    <footer className="bg-gray-900 text-gray-300 print:hidden" role="contentinfo">
      <div className="container-main py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <a
              href="#home"
              onClick={e => handleNavClick(e, '#home')}
              className="inline-block mb-4 focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
              aria-label={`${ACADEMY_NAME} – Home`}
            >
              <img
                src="/images/master-computer-academy-logo.svg"
                alt={`${ACADEMY_NAME} logo`}
                className="h-12 w-auto object-contain bg-white rounded-lg px-2 py-1"
                width="320"
                height="120"
                loading="lazy"
              />
            </a>
            <p className="text-gray-400 text-sm font-devanagari leading-relaxed mb-5">
              Wathoda, Nagpur मधील विश्वासाचे MS-CIT आणि Computer Training Centre.
              Practical शिक्षण, Marathi-friendly environment.
            </p>

            {/* Social links */}
            <div className="flex gap-3 flex-wrap">
              {SOCIAL.facebook && (
                <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-xl flex items-center justify-center
                             text-gray-300 hover:text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary-500"
                  aria-label="Facebook">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </a>
              )}
              {SOCIAL.instagram && (
                <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-xl flex items-center justify-center
                             text-gray-300 hover:text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary-500"
                  aria-label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              )}
              {SOCIAL.youtube && (
                <a href={SOCIAL.youtube} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-red-600 rounded-xl flex items-center justify-center
                             text-gray-300 hover:text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary-500"
                  aria-label="YouTube">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/>
                    <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                  </svg>
                </a>
              )}
              {/* Placeholder icons if no social set */}
              {!SOCIAL.facebook && !SOCIAL.instagram && !SOCIAL.youtube && (
                <p className="text-gray-600 text-xs font-devanagari">
                  [UPDATE: Add social media links in siteConfig.js]
                </p>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={e => handleNavClick(e, link)}
                    className="text-gray-400 hover:text-white text-sm transition-colors duration-150
                               focus-visible:ring-1 focus-visible:ring-primary-500 rounded"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses column */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wide">Courses</h3>
            <ul className="space-y-2.5">
              {featuredCourses.map(course => (
                <li key={course.id}>
                  <a
                    href="#courses"
                    onClick={e => handleNavClick(e, '#courses')}
                    className="text-gray-400 hover:text-white text-sm transition-colors duration-150
                               focus-visible:ring-1 focus-visible:ring-primary-500 rounded"
                  >
                    {course.icon} {course.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wide">संपर्क</h3>
            <ul className="space-y-4">
              <li>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</p>
                <address className="not-italic text-gray-400 text-sm font-devanagari leading-relaxed">
                  {ADDRESS_LINE1},<br />
                  {ADDRESS_LINE2},<br />
                  {ADDRESS_STATE}
                </address>
              </li>
              <li>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                <a href={callLink()}
                  className="text-gray-300 hover:text-white text-sm font-semibold
                             transition-colors focus-visible:ring-1 focus-visible:ring-primary-500 rounded"
                  aria-label={`Call at ${PHONE_NUMBER}`}>
                  {PHONE_NUMBER}
                </a>
              </li>
              <li className="flex flex-col gap-2">
                <a
                  href={callLink()}
                  className="btn-primary btn-sm text-center justify-center"
                  aria-label="Call Master Computer Academy"
                >
                  📞 Call Now
                </a>
                <a
                  href={waLink(WA_MSG_GENERAL)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp btn-sm text-center justify-center font-devanagari"
                  aria-label="WhatsApp Master Computer Academy"
                >
                  💬 WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container-main py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p className="font-devanagari text-center sm:text-left">
            © {year} {ACADEMY_NAME}, Wathoda Layout, Nagpur. सर्व हक्क राखीव.
          </p>
          <p className="text-center sm:text-right">
            MS-CIT Classes · Computer Training · Wathoda · Nagpur
          </p>
        </div>
      </div>
    </footer>
  );
}
