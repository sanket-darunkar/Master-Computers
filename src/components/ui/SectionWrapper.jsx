import React from 'react';

/**
 * SectionWrapper — consistent section layout
 * bg: 'white' | 'alt' | 'navy' | 'navy-dark'
 */
export default function SectionWrapper({ id, bg = 'white', className = '', children }) {
  const bgMap = {
    white:     'bg-white',
    alt:       'bg-gray-50',
    navy:      'bg-hero-gradient text-white',
    'navy-dark': 'bg-navy-dark text-white',
  };

  return (
    <section
      id={id}
      className={`section-padding ${bgMap[bg] || 'bg-white'} ${className}`}
    >
      <div className="container-main">
        {children}
      </div>
    </section>
  );
}
