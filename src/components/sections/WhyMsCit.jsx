import React from 'react';
import SectionWrapper from '../ui/SectionWrapper';
import SectionHeading from '../ui/SectionHeading';
import WhatsAppButton from '../ui/WhatsAppButton';
import CallButton from '../ui/CallButton';

const REASONS = [
  {
    icon: '🌟',
    title: 'Digital Confidence',
    titleMarathi: 'डिजिटल आत्मविश्वास',
    desc: 'Computer वापरण्याचा आत्मविश्वास वाढवा. रोजच्या Digital कामांसाठी तयार व्हा.',
    color: 'bg-blue-50 border-blue-100',
    iconBg: 'bg-blue-100',
  },
  {
    icon: '💼',
    title: 'Career Skills',
    titleMarathi: 'करिअर Skills',
    desc: 'शिक्षण आणि नोकरीसाठी उपयोगी Digital Skills विकसित करा. आजच्या job market साठी तयार व्हा.',
    color: 'bg-orange-50 border-orange-100',
    iconBg: 'bg-orange-100',
  },
  {
    icon: '🖐️',
    title: 'Practical Learning',
    titleMarathi: 'Practical शिक्षण',
    desc: 'फक्त theory नाही — computer वर स्वतः practice करा. प्रत्येक session मध्ये hands-on learning.',
    color: 'bg-green-50 border-green-100',
    iconBg: 'bg-green-100',
  },
  {
    icon: '📱',
    title: 'Everyday Technology',
    titleMarathi: 'रोजच्या Technology साठी',
    desc: 'Online payments, government portals, email, social media — दैनंदिन Digital कामांसाठी आवश्यक ज्ञान मिळवा.',
    color: 'bg-purple-50 border-purple-100',
    iconBg: 'bg-purple-100',
  },
];

export default function WhyMsCit() {
  return (
    <SectionWrapper id="why-mscit" bg="white">
      <SectionHeading
        label="आजच्या Digital युगात"
        title="Computer Skills का आवश्यक आहेत?"
        subtitle="MS-CIT शिकणे म्हणजे फक्त एक course नाही — ती तुमच्या Digital भविष्याची सुरुवात आहे."
        center
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        {REASONS.map((item) => (
          <div
            key={item.title}
            className={`rounded-2xl p-6 border flex flex-col gap-4 hover:-translate-y-1
                        transition-transform duration-200 ${item.color}`}
          >
            <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center text-2xl`}
              aria-hidden="true">
              {item.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
              <p className="text-sm text-primary-600 font-devanagari font-medium mb-2">{item.titleMarathi}</p>
              <p className="text-gray-600 text-sm font-devanagari leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Parent-focused block */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-700 rounded-3xl p-8 md:p-10
                      text-white flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 text-center md:text-left">
          <p className="text-accent-300 font-semibold text-sm mb-2 font-devanagari">पालकांसाठी</p>
          <h3 className="text-xl md:text-2xl font-extrabold font-devanagari mb-3">
            तुमच्या मुलाच्या Digital Future ची<br />सुरुवात आजच करा.
          </h3>
          <p className="text-blue-200 font-devanagari text-sm leading-relaxed max-w-lg">
            आजच्या युगात Computer Skills म्हणजे एक आवश्यक गोष्ट आहे.
            MS-CIT सारखे courses मुलांना digital world साठी तयार करतात.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <WhatsAppButton
            variant="admission"
            label="Admission Enquiry"
            size="md"
          />
          <CallButton
            label="Call Now"
            variant="outline-white"
            size="md"
          />
        </div>
      </div>
    </SectionWrapper>
  );
}
