import React from 'react';
import WhatsAppButton from '../ui/WhatsAppButton';
import CallButton from '../ui/CallButton';

export default function FinalCta() {
  const scrollToContact = (e) => {
    e.preventDefault();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="relative bg-hero-gradient text-white py-16 md:py-20 overflow-hidden"
      aria-label="Call to action – Ready to start learning"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/5 rounded-full" />
      </div>

      <div className="container-main relative z-10 text-center">
        {/* Badge */}
        <span className="inline-block bg-accent-500 text-white text-sm font-bold
                         px-4 py-1.5 rounded-full mb-6 font-devanagari">
          🎓 MS-CIT Admission Open
        </span>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-devanagari leading-tight mb-4">
          शिकण्यास तयार आहात?
        </h2>
        <p className="text-blue-100 font-devanagari text-base sm:text-lg max-w-2xl mx-auto mb-3">
          Master Computer Academy सोबत तुमची Digital Learning Journey आजच सुरू करा.
        </p>
        <p className="text-blue-200 text-sm font-devanagari mb-8">
          तुमच्यासाठी योग्य computer course शोधा — MS-CIT, Programming, MS Office आणि बरेच काही.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <WhatsAppButton
            variant="admission"
            label="WhatsApp वर Enquiry करा"
            size="lg"
          />
          <CallButton
            label="Call Now"
            variant="outline-white"
            size="lg"
          />
          <button
            onClick={scrollToContact}
            className="btn-outline-white btn-lg font-devanagari"
            aria-label="Go to admission enquiry form"
          >
            📝 Admission Form
          </button>
        </div>

        {/* Location reminder */}
        <p className="text-blue-300 text-sm font-devanagari mt-8">
          📍 Lok Kalyan Society, Anmol Nagar, Wathoda Layout, Dighori, Nagpur – 440034
        </p>
      </div>
    </section>
  );
}
