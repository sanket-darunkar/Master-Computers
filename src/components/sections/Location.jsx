import React from 'react';
import SectionWrapper from '../ui/SectionWrapper';
import SectionHeading from '../ui/SectionHeading';
import WhatsAppButton from '../ui/WhatsAppButton';
import CallButton from '../ui/CallButton';
import {
  ACADEMY_NAME, ADDRESS_LINE1, ADDRESS_LINE2, ADDRESS_STATE, ADDRESS_PINCODE,
  GOOGLE_MAPS_URL, GOOGLE_MAPS_EMBED, HOURS,
} from '../../config/siteConfig';

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.03 2.18 2 2 0 012 0h3a2 2 0 012 1.72 12.05 12.05 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.05 12.05 0 002.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

export default function Location() {
  return (
    <SectionWrapper id="location" bg="white">
      <SectionHeading
        label="Find Us"
        title="आमचे ठिकाण"
        subtitle="Wathoda Police Station जवळ — सहज सापडेल."
        center
      />

      <div className="grid lg:grid-cols-2 gap-8 items-stretch">

        {/* Map embed */}
        <div className="rounded-3xl overflow-hidden shadow-card-hover border border-gray-100 min-h-[300px] lg:min-h-[400px]">
          {GOOGLE_MAPS_EMBED ? (
            <iframe
              src={GOOGLE_MAPS_EMBED}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '300px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map showing location of ${ACADEMY_NAME}`}
              className="w-full h-full min-h-[300px]"
            />
          ) : (
            /* Map placeholder until embed URL is added */
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-full min-h-[300px] bg-gradient-to-br from-primary-800 to-primary-600
                         flex flex-col items-center justify-center gap-4 text-white group hover:opacity-90
                         transition-opacity duration-200 cursor-pointer"
              aria-label={`Open ${ACADEMY_NAME} location in Google Maps`}
            >
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl
                              group-hover:scale-110 transition-transform duration-200">
                📍
              </div>
              <div className="text-center px-6">
                <p className="font-bold text-lg mb-1">{ACADEMY_NAME}</p>
                <p className="text-blue-200 text-sm font-devanagari">{ADDRESS_LINE1}</p>
                <p className="text-blue-200 text-sm font-devanagari">{ADDRESS_LINE2}</p>
                <p className="text-white/60 text-xs mt-3">Google Maps वर उघडण्यासाठी click करा</p>
              </div>
              <div className="mt-2 bg-white text-primary-700 font-semibold text-sm px-5 py-2 rounded-xl
                              group-hover:bg-blue-50 transition-colors">
                📍 View on Google Maps
              </div>
              <p className="text-white/40 text-xs">
                [UPDATE: Add Google Maps embed URL in siteConfig.js]
              </p>
            </a>
          )}
        </div>

        {/* Info panel */}
        <div className="flex flex-col gap-5">

          {/* Address card */}
          <div className="card p-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center
                              text-primary-700 flex-shrink-0">
                <MapPinIcon />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{ACADEMY_NAME}</h3>
                <address className="not-italic text-gray-600 text-sm font-devanagari leading-relaxed">
                  {ADDRESS_LINE1},<br />
                  {ADDRESS_LINE2},<br />
                  {ADDRESS_STATE} – {ADDRESS_PINCODE}
                </address>
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-primary-600 text-sm font-semibold
                             hover:text-primary-800 transition-colors focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
                  aria-label="Get directions to Master Computer Academy"
                >
                  🗺️ Get Directions →
                </a>
              </div>
            </div>
          </div>

          {/* Hours card */}
          <div className="card p-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center
                              text-green-600 flex-shrink-0">
                <ClockIcon />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-3">वेळापत्रक</h3>
                <div className="space-y-2">
                  {HOURS.map(h => (
                    <div key={h.days} className="flex justify-between text-sm gap-4">
                      <span className="text-gray-600 font-devanagari">{h.days}</span>
                      <span className="font-semibold text-gray-900 font-devanagari text-right">{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact actions */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4 font-devanagari">आमच्याशी संपर्क करा</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CallButton label="Call Now" size="md" variant="primary" fullWidth />
              <WhatsAppButton
                variant="general"
                label="WhatsApp करा"
                size="md"
                fullWidth
              />
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline btn-md w-full sm:col-span-2 justify-center font-devanagari"
                aria-label="Get directions to Master Computer Academy on Google Maps"
              >
                📍 Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Local SEO paragraph — naturally includes keywords */}
      <div className="mt-10 bg-primary-50 rounded-2xl p-6 border border-primary-100">
        <h3 className="font-bold text-primary-900 font-devanagari mb-2">
          Wathoda आणि आसपासच्या विद्यार्थ्यांसाठी Computer Classes
        </h3>
        <p className="text-gray-700 font-devanagari text-sm leading-relaxed">
          <strong>Master Computer Academy</strong> हे Wathoda, Wathoda Layout आणि Nagpur
          च्या विद्यार्थ्यांसाठी सर्वात जवळचे आणि विश्वासाचे Computer Training Centre आहे.
          आम्ही <strong>MS-CIT classes</strong>, Programming, MS Office आणि इतर computer courses
          Wathoda Police Station जवळ उपलब्ध करतो.
        </p>
      </div>
    </SectionWrapper>
  );
}
