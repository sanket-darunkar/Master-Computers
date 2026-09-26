import React, { useState } from 'react';

const StarIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill={filled ? '#f59e0b' : '#e5e7eb'} aria-hidden="true">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
  </svg>
);

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(i => (
        <StarIcon key={i} filled={i <= rating} />
      ))}
    </div>
  );
}

/**
 * ReviewCard — displays a student review with optional photo.
 * If `review.photo` is provided, shows the student's actual photo.
 * Falls back gracefully to the first-letter avatar on load error.
 */
export default function ReviewCard({ review }) {
  const { name, course, rating, review: text, photo } = review;
  const [imgError, setImgError] = useState(false);

  const showPhoto = photo && !imgError;

  return (
    <div className="card p-6 flex flex-col gap-3">
      <StarRating rating={rating} />
      <p className="text-gray-700 text-sm font-devanagari leading-relaxed italic flex-1">"{text}"</p>
      <div className="pt-2 border-t border-gray-100 flex items-center gap-3 mt-auto">
        {showPhoto ? (
          <img
            src={photo}
            alt={`Photo of ${name}`}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-primary-100"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center
                       text-primary-700 font-bold text-base flex-shrink-0"
            aria-hidden="true"
          >
            {name.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-semibold text-sm text-gray-900">{name}</p>
          {course && <p className="text-xs text-primary-600">{course}</p>}
        </div>
      </div>
    </div>
  );
}
