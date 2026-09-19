import React, { useState, useEffect } from 'react';
import { callLink, waLink, WA_MSG_ADMISSION } from '../../config/siteConfig';

export default function MobileBottomBar() {
  const [visible, setVisible] = useState(false);
  const [prevScrollY, setPrevScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // Show after scrolling past hero (~500px), hide if scrolled back to top
      setVisible(y > 400);
      setPrevScrollY(y);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [prevScrollY]);

  const scrollToContact = (e) => {
    e.preventDefault();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      role="region"
      aria-label="Quick contact actions"
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-all duration-300
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}
    >
      {/* Safe area inset for iPhone notch */}
      <div className="bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="grid grid-cols-3 divide-x divide-gray-200">

          {/* Call */}
          <a
            href={callLink()}
            className="flex flex-col items-center justify-center py-3 gap-1
                       text-gray-700 hover:bg-gray-50 active:bg-gray-100
                       transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600"
            aria-label="Call Master Computer Academy"
          >
            <span className="text-lg" aria-hidden="true">📞</span>
            <span className="text-xs font-semibold">Call</span>
          </a>

          {/* WhatsApp — most important CTA, highlighted */}
          <a
            href={waLink(WA_MSG_ADMISSION)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-3 gap-1
                       bg-[#25D366] text-white hover:bg-[#1ebe5c] active:bg-[#17a84f]
                       transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
            aria-label="WhatsApp Master Computer Academy about MS-CIT"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.852L0 24l6.335-1.496A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.795 9.795 0 01-5.032-1.392l-.36-.214-3.724.879.942-3.617-.235-.372A9.777 9.777 0 012.182 12C2.182 6.579 6.579 2.182 12 2.182S21.818 6.579 21.818 12 17.421 21.818 12 21.818z"/>
            </svg>
            <span className="text-xs font-bold font-devanagari">WhatsApp</span>
          </a>

          {/* Enquire */}
          <button
            onClick={scrollToContact}
            className="flex flex-col items-center justify-center py-3 gap-1
                       text-gray-700 hover:bg-gray-50 active:bg-gray-100
                       transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600"
            aria-label="Go to enquiry form"
          >
            <span className="text-lg" aria-hidden="true">📝</span>
            <span className="text-xs font-semibold">Enquire</span>
          </button>
        </div>
      </div>
    </div>
  );
}
