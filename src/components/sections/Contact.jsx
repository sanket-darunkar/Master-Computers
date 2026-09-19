import React, { useState } from 'react';
import SectionWrapper from '../ui/SectionWrapper';
import SectionHeading from '../ui/SectionHeading';
import WhatsAppButton from '../ui/WhatsAppButton';
import CallButton from '../ui/CallButton';
import { COURSES, waLink, WA_MSG_ADMISSION, callLink, PHONE_NUMBER, WHATSAPP_NUMBER } from '../../config/siteConfig';

const BATCH_OPTIONS = [
  'सकाळ (Morning)',
  'दुपार (Afternoon)',
  'संध्याकाळ (Evening)',
  'Weekend',
  'कधीही (Flexible)',
];

const initialForm = {
  name: '',
  mobile: '',
  course: 'MS-CIT',
  batch: '',
  message: '',
};

const initialErrors = {
  name: '',
  mobile: '',
  course: '',
  batch: '',
};

function validateForm(values) {
  const errors = {};
  if (!values.name.trim()) {
    errors.name = 'नाव आवश्यक आहे';
  }
  if (!values.mobile.trim()) {
    errors.mobile = 'Mobile number आवश्यक आहे';
  } else if (!/^[6-9]\d{9}$/.test(values.mobile.replace(/\s/g, ''))) {
    errors.mobile = 'Valid 10-digit mobile number टाका';
  }
  if (!values.course) {
    errors.course = 'Course निवडा';
  }
  return errors;
}

export default function Contact() {
  const [form, setForm]         = useState(initialForm);
  const [errors, setErrors]     = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched]   = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const newErrors = validateForm({ ...form, [name]: value });
      setErrors(prev => ({ ...prev, [name]: newErrors[name] || '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const newErrors = validateForm(form);
    setErrors(prev => ({ ...prev, [name]: newErrors[name] || '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);
    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // ── Connect real backend / FormSpree / EmailJS here ──
      // For now, open WhatsApp with pre-filled enquiry message
      const msg = encodeURIComponent(
        `नमस्कार Master Computer Academy,\n\nनाव: ${form.name}\nMobile: ${form.mobile}\nCourse: ${form.course}${form.batch ? `\nBatch: ${form.batch}` : ''}${form.message ? `\nMessage: ${form.message}` : ''}\n\nकृपया course details सांगा.`
      );
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank', 'noopener,noreferrer');
      setSubmitted(true);
      setForm(initialForm);
      setTouched({});
    }
  };

  if (submitted) {
    return (
      <SectionWrapper id="contact" bg="alt">
        <div className="max-w-md mx-auto text-center py-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center
                          text-3xl mx-auto mb-5">
            ✅
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 font-devanagari mb-3">
            Enquiry पाठवली गेली!
          </h2>
          <p className="text-gray-600 font-devanagari mb-6">
            आम्ही लवकरच तुमच्याशी WhatsApp वर संपर्क करू.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="btn-outline btn-md font-devanagari"
          >
            आणखी Enquiry करा
          </button>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper id="contact" bg="alt">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

        {/* Left: Info */}
        <div>
          <SectionHeading
            label="Contact Us"
            title="MS-CIT Admission Enquiry"
            subtitle="Batch timings, fees आणि course details जाणून घेण्यासाठी आमच्याशी संपर्क करा."
          />

          <div className="space-y-4 mb-8">
            <a
              href={callLink()}
              className="flex items-center gap-4 card p-5 hover:bg-primary-50 transition-colors group"
              aria-label={`Call Master Computer Academy at ${PHONE_NUMBER}`}
            >
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center
                              text-primary-700 group-hover:bg-primary-200 transition-colors flex-shrink-0">
                📞
              </div>
              <div>
                <p className="font-bold text-gray-900">Call Now</p>
                <p className="text-primary-600 font-semibold text-sm">{PHONE_NUMBER}</p>
              </div>
            </a>

            <a
              href={waLink(WA_MSG_ADMISSION)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 card p-5 hover:bg-green-50 transition-colors group"
              aria-label="WhatsApp Master Computer Academy for MS-CIT enquiry"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center
                              text-green-700 group-hover:bg-green-200 transition-colors flex-shrink-0">
                💬
              </div>
              <div>
                <p className="font-bold text-gray-900">WhatsApp करा</p>
                <p className="text-green-600 text-sm font-devanagari">MS-CIT Admission Enquiry</p>
              </div>
            </a>
          </div>

          {/* Quick WhatsApp CTA */}
          <div className="bg-primary-50 rounded-2xl p-5 border border-primary-100">
            <p className="font-bold text-primary-900 font-devanagari mb-1">
              MS-CIT Admission सुरू आहे!
            </p>
            <p className="text-gray-600 text-sm font-devanagari mb-4">
              Batch आणि Fees बद्दल माहिती हवी आहे? आजच चौकशी करा.
            </p>
            <WhatsAppButton variant="admission" label="MS-CIT Enquiry" size="md" fullWidth />
          </div>
        </div>

        {/* Right: Form */}
        <div className="card p-7">
          <h3 className="font-bold text-gray-900 text-xl font-devanagari mb-6">
            Enquiry Form भरा
          </h3>
          <form onSubmit={handleSubmit} noValidate aria-label="MS-CIT Admission Enquiry Form">
            <div className="space-y-5">

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5 font-devanagari">
                  तुमचे नाव <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Your Full Name"
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className={`w-full px-4 py-3 rounded-xl border text-gray-900 bg-gray-50
                              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white
                              transition-all duration-150 text-sm
                              ${errors.name ? 'border-red-400 focus:ring-red-400' : 'border-gray-200'}`}
                />
                {errors.name && (
                  <p id="name-error" className="text-red-500 text-xs mt-1 font-devanagari" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Mobile */}
              <div>
                <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700 mb-1.5 font-devanagari">
                  Mobile Number <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  autoComplete="tel"
                  inputMode="numeric"
                  value={form.mobile}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="10-digit Mobile Number"
                  aria-required="true"
                  aria-invalid={!!errors.mobile}
                  aria-describedby={errors.mobile ? 'mobile-error' : undefined}
                  className={`w-full px-4 py-3 rounded-xl border text-gray-900 bg-gray-50
                              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white
                              transition-all duration-150 text-sm
                              ${errors.mobile ? 'border-red-400 focus:ring-red-400' : 'border-gray-200'}`}
                />
                {errors.mobile && (
                  <p id="mobile-error" className="text-red-500 text-xs mt-1 font-devanagari" role="alert">
                    {errors.mobile}
                  </p>
                )}
              </div>

              {/* Course */}
              <div>
                <label htmlFor="course" className="block text-sm font-semibold text-gray-700 mb-1.5 font-devanagari">
                  Course <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <select
                  id="course"
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-required="true"
                  aria-invalid={!!errors.course}
                  aria-describedby={errors.course ? 'course-error' : undefined}
                  className={`w-full px-4 py-3 rounded-xl border text-gray-900 bg-gray-50
                              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white
                              transition-all duration-150 text-sm
                              ${errors.course ? 'border-red-400 focus:ring-red-400' : 'border-gray-200'}`}
                >
                  <option value="">-- Course निवडा --</option>
                  {COURSES.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                {errors.course && (
                  <p id="course-error" className="text-red-500 text-xs mt-1 font-devanagari" role="alert">
                    {errors.course}
                  </p>
                )}
              </div>

              {/* Preferred batch */}
              <div>
                <label htmlFor="batch" className="block text-sm font-semibold text-gray-700 mb-1.5 font-devanagari">
                  Preferred Batch
                </label>
                <select
                  id="batch"
                  name="batch"
                  value={form.batch}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 bg-gray-50
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white
                             transition-all duration-150 text-sm"
                >
                  <option value="">-- Batch वेळ निवडा --</option>
                  {BATCH_OPTIONS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1.5 font-devanagari">
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                  placeholder="तुमचा प्रश्न किंवा message लिहा..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 bg-gray-50
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white
                             transition-all duration-150 text-sm resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn-accent btn-lg w-full font-devanagari"
                aria-label="Submit MS-CIT admission enquiry form"
              >
                📩 Enquiry पाठवा
              </button>

              <p className="text-gray-400 text-xs text-center font-devanagari">
                Form submit केल्यावर WhatsApp उघडेल — आम्ही लवकरच reply करू.
              </p>
            </div>
          </form>
        </div>
      </div>
    </SectionWrapper>
  );
}
