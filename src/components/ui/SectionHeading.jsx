import React from 'react';

/**
 * SectionHeading
 * label: small pill text above
 * title: main heading
 * subtitle: supporting text
 * center: bool
 * light: bool (white text for dark bg)
 */
export default function SectionHeading({ label, title, subtitle, center = false, light = false }) {
  return (
    <div className={`mb-10 md:mb-14 ${center ? 'text-center' : ''}`}>
      {label && (
        <span className={`section-label ${light ? 'bg-white/20 text-white' : ''}`}>
          {label}
        </span>
      )}
      <h2 className={`section-title font-devanagari ${light ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`section-subtitle font-devanagari ${light ? 'text-blue-100' : 'text-gray-600'} ${center ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
