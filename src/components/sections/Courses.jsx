import React, { useState, useMemo } from 'react';
import SectionWrapper from '../ui/SectionWrapper';
import SectionHeading from '../ui/SectionHeading';
import CourseCard from '../ui/CourseCard';
import WhatsAppButton from '../ui/WhatsAppButton';
import { COURSES, COURSE_CATEGORIES, waLink, waCourseMsg } from '../../config/siteConfig';

// ── Duration filter options derived from data ──────────────
const DURATION_OPTIONS = ['All', '2 Months', '3 Months', '5 Months', '6 Months', '8 Months'];

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.852L0 24l6.335-1.496A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.795 9.795 0 01-5.032-1.392l-.36-.214-3.724.879.942-3.617-.235-.372A9.777 9.777 0 012.182 12C2.182 6.579 6.579 2.182 12 2.182S21.818 6.579 21.818 12 17.421 21.818 12 21.818z"/>
  </svg>
);

// ── Combo Course Card (prominent visual treatment) ─────────
function ComboCourseCard({ course }) {
  const { icon, name, nameMarathi, shortDesc, duration, certificates, badge } = course;
  const enquireHref = waLink(waCourseMsg(name));

  return (
    <article
      className="bg-gradient-to-br from-primary-700 to-primary-900 text-white rounded-2xl p-6
                 flex flex-col gap-4 hover:-translate-y-0.5 transition-all duration-200 shadow-card-hover"
      aria-label={`Career Program: ${name}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          aria-hidden="true">
          {icon}
        </div>
        <div className="flex flex-wrap gap-1.5 justify-end">
          {badge && (
            <span className="text-xs font-bold bg-accent-500 text-white px-2.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
          {certificates && (
            <span className="text-xs font-bold bg-yellow-400 text-yellow-900 px-2.5 py-0.5 rounded-full">
              {certificates} Certificates
            </span>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-extrabold text-white text-base leading-snug">{name}</h3>
        {nameMarathi && (
          <p className="text-blue-300 text-xs font-devanagari mt-0.5">{nameMarathi}</p>
        )}
      </div>

      <p className="text-blue-200 text-sm font-devanagari leading-relaxed flex-1">{shortDesc}</p>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/20 mt-auto">
        {duration && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-200
                           bg-white/15 border border-white/20 px-2.5 py-1 rounded-lg">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {duration}
          </span>
        )}
        <a
          href={enquireHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5c] text-white
                     text-xs font-bold px-3 py-2 rounded-lg transition-colors duration-150
                     focus-visible:ring-2 focus-visible:ring-white whitespace-nowrap flex-shrink-0"
          aria-label={`Enquire about ${name} on WhatsApp`}
        >
          <WhatsAppIcon />
          Enquire Now
        </a>
      </div>
    </article>
  );
}

// ── Typing Language Block ──────────────────────────────────
function TypingBlock({ lang, courses }) {
  const langColors = {
    English: 'border-blue-200 bg-blue-50',
    Marathi: 'border-green-200 bg-green-50',
    Hindi:   'border-orange-200 bg-orange-50',
  };
  const speedColors = {
    English: 'bg-blue-100 text-blue-800',
    Marathi: 'bg-green-100 text-green-800',
    Hindi:   'bg-orange-100 text-orange-800',
  };

  return (
    <div className={`rounded-2xl border p-5 ${langColors[lang] || 'border-gray-200 bg-gray-50'}`}>
      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span aria-hidden="true">⌨️</span>
        {lang} Typing
        <span className="font-devanagari font-normal text-gray-500 text-sm">
          {lang === 'Marathi' ? '(मराठी)' : lang === 'Hindi' ? '(हिंदी)' : ''}
        </span>
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {courses.map(course => (
          <div key={course.id}
            className="bg-white rounded-xl p-4 border border-gray-100 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-sm font-extrabold px-2.5 py-1 rounded-lg ${speedColors[lang] || 'bg-gray-100 text-gray-700'}`}>
                {course.typingSpeed}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {course.duration}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-devanagari">{course.shortDesc}</p>
            <a
              href={waLink(waCourseMsg(course.name))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5c] text-white
                         text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors w-full justify-center
                         focus-visible:ring-2 focus-visible:ring-[#25D366]"
              aria-label={`Enquire about ${course.name}`}
            >
              <WhatsAppIcon />
              Enquire Now
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Courses Section ───────────────────────────────────
export default function Courses() {
  const [activeCategory, setActiveCategory] = useState('mscit');
  const [searchQuery, setSearchQuery]       = useState('');
  const [durationFilter, setDurationFilter] = useState('All');

  // All categories for tab nav including "All"
  const tabs = [
    { id: 'all', label: 'All Courses', icon: '📚', labelMarathi: 'सर्व Courses' },
    ...COURSE_CATEGORIES,
  ];

  // Filtered courses based on active tab + search + duration
  const filteredCourses = useMemo(() => {
    let list = COURSES;

    if (activeCategory !== 'all') {
      list = list.filter(c => c.category === activeCategory);
    }
    if (durationFilter !== 'All') {
      list = list.filter(c => c.duration === durationFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.nameMarathi && c.nameMarathi.toLowerCase().includes(q)) ||
        (c.shortDesc && c.shortDesc.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeCategory, searchQuery, durationFilter]);

  // Separate typing courses for the typing tab layout
  const typingCourses   = filteredCourses.filter(c => c.isTyping && c.typingLang);
  const gccCourse       = filteredCourses.find(c => c.id === 'gcc-tbc');
  const comboCourses    = filteredCourses.filter(c => c.isCombo);
  const mscitMainCourse = filteredCourses.find(c => c.isMscit);
  const regularCourses  = filteredCourses.filter(c => !c.isTyping && !c.isCombo && !c.isMscit);

  const showTypingLayout = activeCategory === 'typing' && !searchQuery.trim() && durationFilter === 'All';
  const showMscitLayout  = activeCategory === 'mscit'  && !searchQuery.trim() && durationFilter === 'All';
  const showAllLayout    = activeCategory === 'all'    && !searchQuery.trim() && durationFilter === 'All';

  const scrollToContact = (e) => {
    e.preventDefault();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <SectionWrapper id="courses" bg="alt">
      <SectionHeading
        label="25 Courses"
        title="तुमच्यासाठी योग्य Course निवडा"
        subtitle="MS-CIT, Accounting, Design, Typing आणि बरेच काही — सर्व levels साठी courses उपलब्ध."
      />

      {/* ── Search + Duration filter ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            placeholder="Course search करा..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setActiveCategory('all'); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       font-devanagari"
            aria-label="Search courses"
          />
        </div>
        <select
          value={durationFilter}
          onChange={e => setDurationFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     min-w-[150px]"
          aria-label="Filter by duration"
        >
          {DURATION_OPTIONS.map(d => (
            <option key={d} value={d}>{d === 'All' ? 'All Durations' : d}</option>
          ))}
        </select>
      </div>

      {/* ── Category tabs ── */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1"
        role="tablist" aria-label="Course categories">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeCategory === tab.id}
            onClick={() => { setActiveCategory(tab.id); setSearchQuery(''); setDurationFilter('All'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                        whitespace-nowrap transition-all duration-150 flex-shrink-0
                        focus-visible:ring-2 focus-visible:ring-primary-600
                        ${activeCategory === tab.id
                          ? 'bg-primary-700 text-white shadow-md'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
          >
            <span aria-hidden="true">{tab.icon}</span>
            <span className="font-devanagari">{tab.labelMarathi || tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── No results ── */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-2xl mb-3" aria-hidden="true">🔍</p>
          <p className="text-gray-500 font-devanagari">
            "{searchQuery}" साठी कोणताही course सापडला नाही.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('all'); setDurationFilter('All'); }}
            className="mt-4 text-primary-600 text-sm font-semibold underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* ── MS-CIT tab layout ── */}
      {showMscitLayout && (
        <div className="space-y-8">
          {/* MS-CIT main course */}
          {mscitMainCourse && (
            <div>
              <h3 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span>🎓</span>
                <span className="font-devanagari">MS-CIT Course</span>
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <CourseCard course={mscitMainCourse} />
              </div>
            </div>
          )}

          {/* Combo programs */}
          {comboCourses.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-base font-bold text-gray-700 font-devanagari">
                  एकाच Program मध्ये अनेक Skills!
                </h3>
                <span className="text-xs bg-accent-100 text-accent-700 font-semibold px-2.5 py-1 rounded-full">
                  Career Programs
                </span>
              </div>
              <p className="text-sm text-gray-500 font-devanagari mb-5">
                एकाच learning journey मध्ये विविध Computer आणि Professional Skills विकसित करा.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {comboCourses.map(course => (
                  <ComboCourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Typing tab layout ── */}
      {showTypingLayout && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-800 mb-1 font-devanagari">Typing Skills वाढवा</h3>
            <p className="text-sm text-gray-500 font-devanagari mb-6">
              English, Marathi आणि Hindi Typing certificates — 30 WPM आणि 40 WPM speed options.
            </p>
            <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-4">
              {['English', 'Marathi', 'Hindi'].map(lang => {
                const langCourses = typingCourses.filter(c => c.typingLang === lang);
                return langCourses.length > 0
                  ? <TypingBlock key={lang} lang={lang} courses={langCourses} />
                  : null;
              })}
            </div>
          </div>

          {/* GCC-TBC */}
          {gccCourse && (
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200
                            rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  aria-hidden="true">
                  🎯
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-extrabold text-gray-900">{gccCourse.name}</h4>
                    <span className="text-xs font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">
                      Board Exam
                    </span>
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      ⏱ {gccCourse.duration}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-devanagari mb-4">{gccCourse.shortDesc}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {gccCourse.typingCombos?.map(combo => (
                      <span key={combo}
                        className="text-xs bg-white border border-purple-200 text-purple-700
                                   font-semibold px-3 py-1 rounded-lg">
                        {combo}
                      </span>
                    ))}
                  </div>
                  <a
                    href={waLink(waCourseMsg(gccCourse.name))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5c] text-white
                               text-sm font-bold px-5 py-2.5 rounded-xl transition-colors duration-150
                               focus-visible:ring-2 focus-visible:ring-[#25D366]"
                    aria-label={`Enquire about ${gccCourse.name}`}
                  >
                    <WhatsAppIcon />
                    Enquire Now
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── "All courses" layout — grouped by category ── */}
      {showAllLayout && (
        <div className="space-y-10">
          {COURSE_CATEGORIES.map(cat => {
            const catCourses = COURSES.filter(c => c.category === cat.id);
            return (
              <div key={cat.id}>
                <h3 className="flex items-center gap-2 font-bold text-gray-800 text-base mb-4">
                  <span aria-hidden="true">{cat.icon}</span>
                  <span className="font-devanagari">{cat.labelMarathi}</span>
                  <span className="text-xs text-gray-400 font-normal ml-1">({catCourses.length})</span>
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catCourses.map(course =>
                    course.isCombo
                      ? <ComboCourseCard key={course.id} course={course} />
                      : <CourseCard key={course.id} course={course} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Default grid (filtered / search results or other tabs) ── */}
      {!showTypingLayout && !showMscitLayout && !showAllLayout && filteredCourses.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map(course =>
            course.isCombo
              ? <ComboCourseCard key={course.id} course={course} />
              : <CourseCard key={course.id} course={course} />
          )}
        </div>
      )}

      {/* ── Bottom CTA strip ── */}
      <div className="mt-12 bg-white rounded-3xl shadow-card p-6 md:p-8 flex flex-col md:flex-row
                      items-center justify-between gap-6 border border-gray-100">
        <div>
          <p className="font-bold text-gray-900 text-lg font-devanagari">
            कोणता Course योग्य आहे हे माहीत नाही?
          </p>
          <p className="text-gray-500 text-sm font-devanagari mt-1">
            Course, Fees आणि Batch Timing जाणून घेण्यासाठी आजच संपर्क करा.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <WhatsAppButton variant="general" label="WhatsApp वर विचारा" size="md" />
          <button
            onClick={scrollToContact}
            className="btn-outline btn-md font-devanagari"
            aria-label="Go to enquiry form"
          >
            📝 Enquiry Form
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}
