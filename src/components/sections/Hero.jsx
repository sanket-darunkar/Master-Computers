import React, { useEffect, useRef } from 'react';
import {
  ACADEMY_NAME, TAGLINE_MARATHI, TAGLINE_SUB,
  waLink, WA_MSG_ADMISSION, callLink,
} from '../../config/siteConfig';

const LocationPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const TRUST_ITEMS = [
  { icon: '🎓', text: 'MS-CIT Centre' },
  { icon: '💻', text: 'Practical Learning' },
  { icon: '🚩', text: 'Marathi Friendly', marathi: true },
  { icon: '🤝', text: 'Student Support' },
];

// Computer illustration SVG — lightweight, no external image needed
function ComputerIllustration() {
  return (
    <div className="relative flex items-center justify-center w-full max-w-sm mx-auto lg:max-w-none">
      {/* Glow background */}
      <div className="absolute inset-0 rounded-3xl bg-white/10 blur-3xl" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-xs lg:max-w-sm">
        <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Computer illustration" role="img" className="w-full drop-shadow-2xl">
          {/* Monitor body */}
          <rect x="60" y="30" width="280" height="185" rx="12" fill="#1e3a8a" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
          {/* Screen */}
          <rect x="74" y="44" width="252" height="158" rx="6" fill="#0f172a"/>
          {/* Screen glow */}
          <rect x="74" y="44" width="252" height="158" rx="6" fill="url(#screenGrad)" opacity="0.9"/>
          {/* Screen content lines */}
          <rect x="94" y="68" width="160" height="8" rx="4" fill="white" opacity="0.8"/>
          <rect x="94" y="84" width="100" height="6" rx="3" fill="#60a5fa" opacity="0.9"/>
          <rect x="94" y="104" width="212" height="5" rx="2.5" fill="white" opacity="0.3"/>
          <rect x="94" y="116" width="180" height="5" rx="2.5" fill="white" opacity="0.3"/>
          <rect x="94" y="128" width="200" height="5" rx="2.5" fill="white" opacity="0.3"/>
          {/* Code blocks */}
          <rect x="94" y="148" width="80" height="24" rx="6" fill="#f97316" opacity="0.85"/>
          <text x="134" y="164" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">MS-CIT</text>
          <rect x="184" y="148" width="70" height="24" rx="6" fill="#2563eb" opacity="0.85"/>
          <text x="219" y="164" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">Python</text>
          <rect x="264" y="148" width="42" height="24" rx="6" fill="#059669" opacity="0.85"/>
          <text x="285" y="164" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">Tally</text>
          {/* Gradient def */}
          <defs>
            <linearGradient id="screenGrad" x1="74" y1="44" x2="326" y2="202" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e40af" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {/* Stand neck */}
          <rect x="187" y="215" width="26" height="30" rx="4" fill="#1e3a8a" opacity="0.9"/>
          {/* Stand base */}
          <rect x="140" y="243" width="120" height="16" rx="8" fill="#1e3a8a" opacity="0.8"/>
          {/* Keyboard */}
          <rect x="80" y="268" width="240" height="20" rx="6" fill="#1e40af" opacity="0.8"/>
          <rect x="88" y="272" width="224" height="12" rx="3" fill="#2563eb" opacity="0.5"/>
          {/* Floating badges */}
          <g transform="translate(0, -10)">
            {/* Badge 1: MS-CIT */}
            <rect x="20" y="60" width="80" height="36" rx="10" fill="white" opacity="0.95"/>
            <text x="60" y="73" textAnchor="middle" fill="#1e3a8a" fontSize="9" fontWeight="700">🎓 MS-CIT</text>
            <text x="60" y="87" textAnchor="middle" fill="#64748b" fontSize="8">Admission Open</text>
          </g>
          <g transform="translate(0, -10)">
            {/* Badge 2: Wathoda */}
            <rect x="300" y="55" width="90" height="36" rx="10" fill="white" opacity="0.95"/>
            <text x="345" y="68" textAnchor="middle" fill="#1e3a8a" fontSize="9" fontWeight="700">📍 Wathoda</text>
            <text x="345" y="82" textAnchor="middle" fill="#64748b" fontSize="8">Nagpur</text>
          </g>
          {/* Badge 3: Practical */}
          <rect x="290" y="160" width="96" height="36" rx="10" fill="#f97316" opacity="0.95"/>
          <text x="338" y="173" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">💻 Practical</text>
          <text x="338" y="187" textAnchor="middle" fill="white" fontSize="8" opacity="0.9">Learning</text>
        </svg>
      </div>
    </div>
  );
}

export default function Hero() {
  const headingRef = useRef(null);

  useEffect(() => {
    // Trigger entrance animations after mount
    const el = headingRef.current;
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      requestAnimationFrame(() => {
        el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    }
  }, []);

  const scrollToCourses = (e) => {
    e.preventDefault();
    document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToContact = (e) => {
    e.preventDefault();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative bg-hero-gradient text-white overflow-hidden"
      aria-label="Hero – Master Computer Academy"
    >
      {/* Background decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" aria-hidden="true" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-primary-600/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />

      <div className="container-main relative z-10 py-14 md:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: Text content */}
          <div ref={headingRef} className="flex flex-col gap-6">

            {/* Admission badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 bg-accent-500 text-white text-sm font-bold
                               px-4 py-1.5 rounded-full shadow-md animate-pulse-soft">
                🎓
                <span className="font-devanagari">MS-CIT Admission Open</span>
              </span>
            </div>

            {/* Main headline */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight font-devanagari">
                {TAGLINE_MARATHI}
              </h1>
              <p className="mt-4 text-blue-100 text-base sm:text-lg font-devanagari leading-relaxed max-w-lg">
                {TAGLINE_SUB}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-blue-200 text-sm font-medium">
              <LocationPinIcon />
              <span>Wathoda, Nagpur</span>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={scrollToContact}
                className="btn-accent btn-lg font-devanagari"
                aria-label="MS-CIT Admission Enquiry"
              >
                MS-CIT साठी चौकशी करा
              </button>
              <a
                href={waLink(WA_MSG_ADMISSION)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp btn-lg font-devanagari"
                aria-label="WhatsApp Master Computer Academy about MS-CIT"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.852L0 24l6.335-1.496A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.795 9.795 0 01-5.032-1.392l-.36-.214-3.724.879.942-3.617-.235-.372A9.777 9.777 0 012.182 12C2.182 6.579 6.579 2.182 12 2.182S21.818 6.579 21.818 12 17.421 21.818 12 21.818z"/>
                </svg>
                WhatsApp करा
              </a>
            </div>

            {/* Secondary link */}
            <button
              onClick={scrollToCourses}
              className="self-start text-blue-200 hover:text-white text-sm underline underline-offset-2
                         transition-colors focus-visible:ring-2 focus-visible:ring-white rounded"
              aria-label="Explore all courses"
            >
              सर्व Courses पहा →
            </button>
          </div>

          {/* Right: Illustration */}
          <div className="hidden sm:flex items-center justify-center lg:justify-end">
            <ComputerIllustration />
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-12 pt-8 border-t border-white/15">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3
                           border border-white/15 hover:bg-white/15 transition-colors duration-200"
              >
                <span className="text-2xl flex-shrink-0" aria-hidden="true">{item.icon}</span>
                <span className={`text-sm font-semibold text-white leading-tight ${item.marathi ? 'font-devanagari' : ''}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
