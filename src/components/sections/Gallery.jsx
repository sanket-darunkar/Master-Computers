import React, { useState } from 'react';
import SectionWrapper from '../ui/SectionWrapper';
import SectionHeading from '../ui/SectionHeading';
import { GALLERY_ITEMS } from '../../config/siteConfig';

const CATEGORIES = ['all', 'classroom', 'students', 'activity'];

const CATEGORY_LABELS = {
  all:       'सर्व',
  classroom: 'Classroom',
  students:  'Students',
  activity:  'Activities',
};

// SVG placeholder for missing photos — shows category icon
function GalleryPlaceholder({ item }) {
  const icons = {
    classroom: '🖥️',
    students:  '👨‍💻',
    activity:  '🏆',
  };
  const icon = icons[item.category] || '📷';

  return (
    <div className="w-full h-full bg-gradient-to-br from-primary-800 to-primary-600
                    flex flex-col items-center justify-center gap-2 min-h-[200px]">
      <span className="text-5xl" aria-hidden="true">{icon}</span>
      <span className="text-white/70 text-xs font-medium text-center px-2">{item.alt}</span>
      <span className="text-white/40 text-xs mt-1">[Add real photo]</span>
    </div>
  );
}

function GalleryItem({ item }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = item.src && !imgError;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary-900 group
                    aspect-video shadow-card hover:shadow-card-hover transition-all duration-200">
      {hasImage ? (
        <img
          src={item.src}
          alt={item.alt}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      ) : (
        <GalleryPlaceholder item={item} />
      )}
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-primary-900/60 opacity-0 group-hover:opacity-100
                      transition-opacity duration-200 flex items-center justify-center">
        <p className="text-white text-sm font-medium px-4 text-center">{item.alt}</p>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = activeCategory === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(i => i.category === activeCategory);

  const noRealPhotos = GALLERY_ITEMS.every(i => !i.src);

  return (
    <SectionWrapper id="gallery" bg="alt">
      <SectionHeading
        label="Gallery"
        title="आमचे Academy"
        subtitle="Master Computer Academy — Wathoda, Nagpur मधील learning environment."
        center
      />

      {/* Owner notice */}
      {noRealPhotos && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
          <p className="text-blue-800 text-sm font-devanagari">
            <strong>Note for owner:</strong> खालील placeholders आहेत.
            Real photos <code className="text-xs">src/config/siteConfig.js</code> मधील
            <code className="text-xs"> GALLERY_ITEMS</code> array मध्ये <code className="text-xs">src</code> field update करा.
          </p>
        </div>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center" role="group" aria-label="Filter gallery by category">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150
                        focus-visible:ring-2 focus-visible:ring-primary-600 font-devanagari
              ${activeCategory === cat
                ? 'bg-primary-700 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            aria-pressed={activeCategory === cat}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => (
          <GalleryItem key={item.id} item={item} />
        ))}
      </div>

      {/* CTA to share photos */}
      <p className="text-center text-gray-500 text-sm font-devanagari mt-8">
        Academy च्या photos आणि events साठी आमच्याशी connected राहा. 📸
      </p>
    </SectionWrapper>
  );
}
