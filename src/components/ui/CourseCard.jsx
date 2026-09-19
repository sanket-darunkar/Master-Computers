import React from 'react';
import { waLink, waCourseMsg } from '../../config/siteConfig';

const WhatsAppIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.852L0 24l6.335-1.496A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.795 9.795 0 01-5.032-1.392l-.36-.214-3.724.879.942-3.617-.235-.372A9.777 9.777 0 012.182 12C2.182 6.579 6.579 2.182 12 2.182S21.818 6.579 21.818 12 17.421 21.818 12 21.818z"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

/**
 * CourseCard
 * Compact card used inside tabbed course catalog.
 * variant: 'default' | 'combo' — combo cards get a highlighted treatment
 */
export default function CourseCard({ course, variant = 'default' }) {
  const { icon, name, nameMarathi, shortDesc, badge, duration, certificates, typingCombos } = course;

  const isCombo = variant === 'combo' || course.isCombo;

  const enquireHref = waLink(waCourseMsg(name));

  return (
    <article
      className={`flex flex-col gap-3 rounded-2xl p-5 border transition-all duration-200
        hover:-translate-y-0.5 group
        ${isCombo
          ? 'bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200 hover:shadow-card-hover'
          : 'bg-white border-gray-100 shadow-card hover:shadow-card-hover'
        }`}
      aria-label={`Course: ${name}`}
    >
      {/* Top row: icon + badges */}
      <div className="flex items-start justify-between gap-2">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0
                        transition-colors duration-200
                        ${isCombo ? 'bg-primary-100 group-hover:bg-primary-200' : 'bg-primary-50 group-hover:bg-primary-100'}`}
          aria-hidden="true">
          {icon}
        </div>
        <div className="flex flex-wrap gap-1.5 justify-end">
          {badge && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
              ${badge === 'Career Program'  ? 'bg-accent-100 text-accent-700' :
                badge === 'Board Exam'      ? 'bg-purple-100 text-purple-700' :
                badge === 'Govt. of India'  ? 'bg-green-100 text-green-700'  :
                badge === 'Featured'        ? 'bg-primary-100 text-primary-700' :
                'bg-gray-100 text-gray-600'}`}>
              {badge}
            </span>
          )}
          {certificates && (
            <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
              {certificates} Certificates
            </span>
          )}
        </div>
      </div>

      {/* Course name */}
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 text-sm leading-snug">{name}</h3>
        {nameMarathi && (
          <p className="text-xs text-primary-600 font-devanagari font-medium mt-0.5">{nameMarathi}</p>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-500 text-xs font-devanagari leading-relaxed">{shortDesc}</p>

      {/* Typing combos (for GCC-TBC) */}
      {typingCombos && (
        <div className="flex flex-col gap-1">
          {typingCombos.map(combo => (
            <span key={combo}
              className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md w-fit">
              {combo}
            </span>
          ))}
        </div>
      )}

      {/* Duration + CTA */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 mt-auto">
        {duration ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50
                           border border-gray-200 px-2 py-1 rounded-lg">
            <ClockIcon />
            {duration}
          </span>
        ) : (
          <span className="text-xs text-gray-400">Duration: Contact us</span>
        )}
        <a
          href={enquireHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5c] text-white
                     text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors duration-150
                     focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-1
                     whitespace-nowrap flex-shrink-0"
          aria-label={`Enquire about ${name} on WhatsApp`}
        >
          <WhatsAppIcon />
          Enquire Now
        </a>
      </div>
    </article>
  );
}
