import React from 'react';
import { callLink, PHONE_NUMBER } from '../../config/siteConfig';

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.03 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

/**
 * CallButton
 * size: 'sm' | 'md' | 'lg'
 * variant: 'primary' | 'outline' | 'outline-white'
 */
export default function CallButton({
  label = 'Call Now',
  size = 'md',
  variant = 'primary',
  fullWidth = false,
  className = '',
}) {
  const variantClass = {
    primary:       'btn-primary',
    outline:       'btn-outline',
    'outline-white': 'btn-outline-white',
  }[variant] || 'btn-primary';

  return (
    <a
      href={callLink()}
      className={`${variantClass} btn-${size} ${fullWidth ? 'w-full' : ''} ${className}`}
      aria-label={`Call Master Computer Academy: ${PHONE_NUMBER}`}
    >
      <PhoneIcon />
      <span>{label}</span>
    </a>
  );
}
