import React from 'react';
import SectionWrapper from '../ui/SectionWrapper';
import SectionHeading from '../ui/SectionHeading';
import WhatsAppButton from '../ui/WhatsAppButton';
import { COURSES } from '../../config/siteConfig';

const MSCIT_BENEFITS = [
  { icon: '💻', title: 'Computer Basics', desc: 'संगणकाचे मूलभूत ज्ञान — keyboard, mouse, files, folders.' },
  { icon: '🌐', title: 'Internet & Email',   desc: 'Internet browsing, email, online forms आणि digital payments.' },
  { icon: '📄', title: 'MS Office',          desc: 'Word, Excel, PowerPoint — office आणि educational कामांसाठी.' },
  { icon: '🔐', title: 'Digital Awareness',  desc: 'Online safety, cyber awareness आणि digital literacy.' },
  { icon: '📚', title: 'Practical Learning', desc: 'फक्त theory नाही — प्रत्येक topic वर hands-on practice.' },
  { icon: '📜', title: 'Course Completion',  desc: 'Course पूर्ण केल्यावर completion मिळते.' },
];

const WHO_SHOULD_JOIN = [
  { icon: '🎓', label: 'Students' },
  { icon: '👩‍💼', label: 'Job Seekers' },
  { icon: '🏠', label: 'Homemakers' },
  { icon: '💼', label: 'Working Professionals' },
  { icon: '👨‍👩‍👧', label: 'Parents' },
  { icon: '🧑', label: 'Beginners' },
];

const mscitCourse = COURSES.find(c => c.id === 'mscit') || {};

export default function MsCit() {
  const scrollToContact = (e) => {
    e.preventDefault();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <SectionWrapper id="mscit" bg="alt">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

        {/* Left column */}
        <div>
          <SectionHeading
            label="Featured Course"
            title="MS-CIT म्हणजे काय?"
            subtitle="महाराष्ट्रातील अत्यंत लोकप्रिय Computer Literacy Course — विद्यार्थ्यांसाठी, नोकरदारांसाठी आणि गृहिणींसाठी."
          />

          {/* What is MS-CIT card */}
          <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-3xl p-7 text-white mb-8 shadow-card-hover">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                🎓
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-extrabold">MS-CIT</h3>
                  <span className="text-xs bg-accent-500 text-white px-2.5 py-0.5 rounded-full font-semibold">
                    Most Popular
                  </span>
                </div>
                <p className="text-blue-200 text-sm font-devanagari mt-1">
                  Maharashtra State Certificate in Information Technology
                </p>
              </div>
            </div>
            <p className="text-blue-100 font-devanagari leading-relaxed text-sm mb-4">
              {mscitCourse.longDesc || 'MS-CIT हा महाराष्ट्रातील अत्यंत लोकप्रिय Computer Literacy course आहे. हा course विद्यार्थी, नोकरी शोधणारे आणि गृहिणींसाठी उपयुक्त आहे.'}
            </p>

            {/* Key details */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-300 mb-1 font-devanagari">कालावधी</p>
                <p className="font-bold text-sm font-devanagari">
                  {mscitCourse.duration || 'चौकशी करा'}
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-300 mb-1 font-devanagari">Fees</p>
                <p className="font-bold text-sm font-devanagari">
                  {mscitCourse.fees || 'चौकशी करा'}
                </p>
              </div>
            </div>

            {/* Batch timing */}
            <div className="bg-white/10 rounded-xl p-3 mb-5">
              <p className="text-xs text-blue-300 font-devanagari mb-1">Batch Timings</p>
              <p className="font-semibold text-sm font-devanagari">
                {mscitCourse.batchTimings || 'चौकशी करा — सोमवार–शनिवार उपलब्ध'}
              </p>
            </div>

            <WhatsAppButton
              variant="admission"
              label="MS-CIT Admission Enquiry"
              size="md"
              fullWidth
            />
          </div>

          {/* Who should join */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3 font-devanagari">हा Course कोणासाठी आहे?</h3>
            <div className="flex flex-wrap gap-2">
              {WHO_SHOULD_JOIN.map(item => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800
                             text-sm font-medium px-3 py-1.5 rounded-full border border-primary-100"
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Benefits grid */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-6 font-devanagari">
            MS-CIT मध्ये काय शिकाल?
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {MSCIT_BENEFITS.map((item) => (
              <div
                key={item.title}
                className="card p-5 flex gap-4 items-start group"
              >
                <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center
                                text-xl flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                  {item.icon}
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{item.title}</p>
                  <p className="text-gray-600 text-xs font-devanagari mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA strip */}
          <div className="bg-accent-50 border border-accent-200 rounded-2xl p-5 flex flex-col sm:flex-row
                          items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-bold text-gray-900 font-devanagari">MS-CIT Admission सुरू आहे!</p>
              <p className="text-sm text-gray-600 font-devanagari mt-0.5">
                Batch आणि Fees बद्दल माहिती हवी आहे? आजच चौकशी करा.
              </p>
            </div>
            <button
              onClick={scrollToContact}
              className="btn-accent btn-sm flex-shrink-0 font-devanagari"
              aria-label="Enquire about MS-CIT course"
            >
              Enquiry करा
            </button>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
