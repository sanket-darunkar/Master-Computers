import React from 'react';
import SectionWrapper from '../ui/SectionWrapper';
import SectionHeading from '../ui/SectionHeading';
import ReviewCard from '../ui/ReviewCard';
import { REVIEWS, SOCIAL } from '../../config/siteConfig';

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="#f59e0b" aria-hidden="true">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
  </svg>
);

export default function Reviews() {
  return (
    <SectionWrapper id="reviews" bg="white">
      <SectionHeading
        label="Student Reviews"
        title="विद्यार्थ्यांचे अनुभव"
        subtitle="आमच्या विद्यार्थ्यांनी सांगितलेले त्यांचे खरे अनुभव ⭐"
        center
      />

      {/* Reviews grid */}
      {REVIEWS.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {REVIEWS.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="mb-10 text-center text-gray-400 py-10 font-devanagari">
          Reviews लवकरच येतील…
        </div>
      )}

      {/* Google review CTA */}
      <div className="text-center bg-primary-50 rounded-3xl p-8 border border-primary-100">
        <div className="flex justify-center gap-1 mb-3" aria-hidden="true">
          {[1,2,3,4,5].map(i => <StarIcon key={i} />)}
        </div>
        <h3 className="font-bold text-gray-900 text-lg font-devanagari mb-2">
          तुमचा अनुभव share करा!
        </h3>
        <p className="text-gray-600 text-sm font-devanagari mb-5 max-w-md mx-auto">
          Master Computer Academy मध्ये शिकल्यावर तुमचा अनुभव इतरांना सांगा.
          तुमची review इतर विद्यार्थ्यांना मदत करते.
        </p>
        {SOCIAL.google ? (
          <a
            href={SOCIAL.google}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary btn-md inline-flex font-devanagari"
            aria-label="View or leave a review for Master Computer Academy"
          >
            ⭐ Review द्या
          </a>
        ) : (
          <button
            className="btn-primary btn-md font-devanagari"
            aria-label="Leave a review"
          >
            ⭐ Review द्या
          </button>
        )}
      </div>
    </SectionWrapper>
  );
}
