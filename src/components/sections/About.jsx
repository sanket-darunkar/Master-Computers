import React from 'react';
import SectionWrapper from '../ui/SectionWrapper';
import SectionHeading from '../ui/SectionHeading';
import WhatsAppButton from '../ui/WhatsAppButton';
import CallButton from '../ui/CallButton';
import { ACADEMY_NAME, ADDRESS_LINE1, ADDRESS_LINE2, GOOGLE_MAPS_URL } from '../../config/siteConfig';

const HIGHLIGHTS = [
  {
    icon: '🎯',
    title: 'Mission',
    titleMarathi: 'आमचे ध्येय',
    desc: 'Wathoda आणि आसपासच्या परिसरातील प्रत्येक विद्यार्थ्याला affordable आणि practical computer education मिळवून देणे.',
  },
  {
    icon: '📍',
    title: 'Location',
    titleMarathi: 'स्थान',
    desc: `${ADDRESS_LINE1}, ${ADDRESS_LINE2} — Wathoda Police Station जवळ, Dighori आणि आसपासच्या भागातून सहज येता येते.`,
  },
  {
    icon: '🌍',
    title: 'Community',
    titleMarathi: 'आमचा समाज',
    desc: 'Wathoda, Dighori आणि Nagpur च्या विद्यार्थ्यांसाठी — Marathi-friendly, beginner-friendly learning environment.',
  },
];

export default function About() {
  return (
    <SectionWrapper id="about" bg="white">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* Left: Text */}
        <div>
          <SectionHeading
            label="About Us"
            title={`${ACADEMY_NAME} बद्दल`}
            subtitle="Wathoda Layout, Nagpur मधील विश्वासाचे Computer Training Centre."
          />

          <div className="space-y-5 mb-8">
            <p className="text-gray-700 font-devanagari leading-relaxed">
              <strong className="text-primary-700">Master Computer Academy</strong> हे Wathoda Layout, Nagpur मध्ये स्थित
              एक local computer training centre आहे. आम्ही विद्यार्थी, नोकरी शोधणारे, गृहिणी आणि working professionals
              यांना practical computer education देतो.
            </p>
            <p className="text-gray-700 font-devanagari leading-relaxed">
              आमचा मुख्य focus <strong className="text-primary-700">MS-CIT</strong> आणि इतर computer courses
              मध्ये आहे. आम्ही Marathi मध्ये शिकवतो — जेणेकरून प्रत्येक विद्यार्थ्याला सहज समजेल.
            </p>
            <p className="text-gray-700 font-devanagari leading-relaxed">
              <strong>Wathoda Police Station जवळ</strong> असल्यामुळे Wathoda, Wathoda Layout,
              Dighori आणि आसपासच्या भागातून येणे सोयीचे आहे.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <WhatsAppButton variant="admission" label="संपर्क करा" size="md" />
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline btn-md"
              aria-label="Get directions to Master Computer Academy"
            >
              📍 Directions
            </a>
          </div>
        </div>

        {/* Right: Highlight cards */}
        <div className="space-y-4">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.title}
              className="card p-6 flex gap-5 items-start"
            >
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center
                              text-2xl flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <p className="text-primary-600 text-sm font-devanagari font-semibold mb-1">{item.titleMarathi}</p>
                <p className="text-gray-600 text-sm font-devanagari leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}

          {/* Local area callout */}
          <div className="bg-primary-50 rounded-2xl p-5 border border-primary-100">
            <p className="text-primary-800 font-devanagari font-semibold text-sm mb-1">
              📍 Wathoda आणि आसपासच्या विद्यार्थ्यांसाठी
            </p>
            <p className="text-gray-700 font-devanagari text-sm leading-relaxed">
              Wathoda, Wathoda Layout, Dighori आणि Nagpur मधील विद्यार्थ्यांसाठी
              MS-CIT आणि Computer Classes उपलब्ध आहेत.
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
