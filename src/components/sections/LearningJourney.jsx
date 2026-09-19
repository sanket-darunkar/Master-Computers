import React from 'react';
import SectionWrapper from '../ui/SectionWrapper';
import SectionHeading from '../ui/SectionHeading';
import WhatsAppButton from '../ui/WhatsAppButton';

const STEPS = [
  {
    number: '01',
    icon: '🔍',
    title: 'Course निवडा',
    titleEn: 'Choose Your Course',
    desc: 'MS-CIT, Programming, MS Office किंवा इतर courses मधून तुमच्यासाठी योग्य course निवडा. गरज असल्यास आमच्याशी बोलून guidance घ्या.',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50 border-blue-100',
  },
  {
    number: '02',
    icon: '💻',
    title: 'Practical Training',
    titleEn: 'Attend Practical Training',
    desc: 'प्रत्येक session मध्ये computer वर hands-on practice करा. Theory आणि practical यांचे योग्य balance.',
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50 border-orange-100',
  },
  {
    number: '03',
    icon: '📈',
    title: 'Skills वाढवा',
    titleEn: 'Build Your Skills',
    desc: 'नवीन skills practice करत राहा, doubts विचारा आणि आत्मविश्वास वाढवा. आम्ही प्रत्येक टप्प्यावर मदत करतो.',
    color: 'bg-green-500',
    lightColor: 'bg-green-50 border-green-100',
  },
  {
    number: '04',
    icon: '🚀',
    title: 'पुढे चला',
    titleEn: 'Start Your Next Step',
    desc: 'Course पूर्ण केल्यावर तुमच्या नवीन digital skills घेऊन शिक्षण, नोकरी किंवा business मध्ये पुढे जा.',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50 border-purple-100',
  },
];

export default function LearningJourney() {
  return (
    <SectionWrapper id="journey" bg="alt">
      <SectionHeading
        label="How It Works"
        title="तुमची Learning Journey"
        subtitle="Master Computer Academy सोबत शिकण्याची प्रक्रिया अगदी सोपी आहे."
        center
      />

      {/* Steps */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {STEPS.map((step, index) => (
          <div key={step.number} className="relative flex flex-col">
            {/* Connector line (desktop) */}
            {index < STEPS.length - 1 && (
              <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gray-200 -translate-x-6 z-0"
                aria-hidden="true" />
            )}

            <div className={`card p-6 flex flex-col gap-4 border relative z-10 ${step.lightColor}`}>
              {/* Number badge */}
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 ${step.color} rounded-xl flex items-center justify-center
                                text-white font-extrabold text-sm`}>
                  {step.number}
                </div>
                <span className="text-3xl" aria-hidden="true">{step.icon}</span>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-base font-devanagari">{step.title}</h3>
                <p className="text-gray-500 text-xs mb-2">{step.titleEn}</p>
                <p className="text-gray-600 text-sm font-devanagari leading-relaxed">{step.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-gray-600 font-devanagari mb-4">
          तुमची Digital Learning Journey आजच सुरू करा!
        </p>
        <WhatsAppButton variant="admission" label="MS-CIT साठी Enquiry करा" size="lg" />
      </div>
    </SectionWrapper>
  );
}
