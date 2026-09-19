import React from 'react';
import SectionWrapper from '../ui/SectionWrapper';
import SectionHeading from '../ui/SectionHeading';
import WhatsAppButton from '../ui/WhatsAppButton';

const BENEFITS = [
  {
    icon: '🖐️',
    title: 'Practical Training',
    titleMarathi: 'Practical प्रशिक्षण',
    desc: 'प्रत्येक class मध्ये computer वर practical practice — फक्त theory नाही.',
  },
  {
    icon: '😊',
    title: 'Beginner Friendly',
    titleMarathi: 'Beginners साठी सोपे',
    desc: 'संगणकाबद्दल काहीच माहीत नाही? काळजी करू नका — आम्ही एकदम सुरुवातीपासून शिकवतो.',
  },
  {
    icon: '🤝',
    title: 'Personal Guidance',
    titleMarathi: 'वैयक्तिक मार्गदर्शन',
    desc: 'प्रत्येक विद्यार्थ्याकडे वैयक्तिक लक्ष — तुमच्या pace नुसार शिका.',
  },
  {
    icon: '📍',
    title: 'Local Training Centre',
    titleMarathi: 'स्थानिक Training Centre',
    desc: 'Wathoda Layout मध्ये सोयीस्करपणे स्थित — घराजवळच computer शिका.',
  },
  {
    icon: '💬',
    title: 'Marathi-Friendly Learning',
    titleMarathi: 'मराठीतून शिक्षण',
    desc: 'Marathi मध्ये समजावून सांगितले जाते — भाषेचा अडथळा नाही.',
  },
  {
    icon: '📞',
    title: 'Student Support',
    titleMarathi: 'विद्यार्थी Support',
    desc: 'Class नंतरही doubts असल्यास विचारा — आमचे trainers मदतीसाठी तयार असतात.',
  },
];

export default function WhyUs() {
  return (
    <SectionWrapper id="why-us" bg="navy">
      <SectionHeading
        label="Master Computer Academy का?"
        title="तुम्ही आम्हाला का निवडावे?"
        subtitle="Wathoda मधील विश्वासाचे Computer Training Centre — विद्यार्थी-friendly शिक्षण पद्धती."
        center
        light
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {BENEFITS.map((item) => (
          <div
            key={item.title}
            className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6
                       hover:bg-white/15 transition-all duration-200 hover:-translate-y-0.5 group"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center
                            text-2xl mb-4 group-hover:bg-white/30 transition-colors"
              aria-hidden="true">
              {item.icon}
            </div>
            <h3 className="font-bold text-white text-base mb-1">{item.title}</h3>
            <p className="text-accent-300 text-xs font-devanagari font-semibold mb-2">{item.titleMarathi}</p>
            <p className="text-blue-200 text-sm font-devanagari leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 text-center">
        <p className="text-blue-100 font-devanagari mb-4 text-base">
          आजच Master Computer Academy ला भेट द्या आणि तुमच्या Digital Journey ची सुरुवात करा.
        </p>
        <WhatsAppButton
          variant="admission"
          label="MS-CIT Enquiry करा"
          size="lg"
        />
      </div>
    </SectionWrapper>
  );
}
