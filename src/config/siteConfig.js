/**
 * ============================================================
 * MASTER COMPUTER ACADEMY — CENTRALIZED BUSINESS CONFIGURATION
 * ============================================================
 * Update this single file to reflect verified business information.
 * All components read from here — no need to search across files.
 *
 * Fields marked [UPDATE] require real information from the academy owner.
 * ============================================================
 */

// ── Contact ────────────────────────────────────────────────
export const PHONE_NUMBER      = '9156348591';
export const WHATSAPP_NUMBER   = '919156348591';     // International format, no +
export const EMAIL             = '[UPDATE: academy@email.com]';    // [UPDATE] Email address (optional)

// ── WhatsApp message templates ─────────────────────────────
export const WA_MSG_GENERAL    = encodeURIComponent('नमस्कार Master Computer Academy, मला MS-CIT कोर्सबद्दल माहिती हवी आहे.');
export const WA_MSG_ADMISSION  = encodeURIComponent('नमस्कार Master Computer Academy, मला MS-CIT कोर्सबद्दल माहिती हवी आहे.');
export const WA_MSG_EN         = encodeURIComponent('Hello Master Computer Academy, I am interested in the MS-CIT course. Please share the course and batch details.');

export function waCourseMsg(courseName) {
  return encodeURIComponent(
    `नमस्कार Master Computer Academy, मला ${courseName} Course बद्दल माहिती हवी आहे. कृपया fees आणि batch details सांगाल का?`
  );
}

export function waLink(msg = WA_MSG_GENERAL) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

export function callLink() {
  return `tel:${PHONE_NUMBER}`;
}

// ── Academy info ───────────────────────────────────────────
export const ACADEMY_NAME      = 'Master Computer Academy';
export const ACADEMY_SHORT     = 'Master Computers';
export const TAGLINE_MARATHI   = 'MS-CIT शिका, Digital Skills वाढवा!';
export const TAGLINE_ENGLISH   = 'Computer Education Made Simple';
export const TAGLINE_SUB       = 'तुमच्या Digital भविष्यासाठी संगणक शिक्षणाची योग्य सुरुवात Master Computer Academy सोबत.';

// ── Address ────────────────────────────────────────────────
export const ADDRESS_LINE1     = 'Lok Kalyan Society, Anmol Nagar';
export const ADDRESS_LINE2     = 'Wathoda Layout, Dighori, Nagpur';
export const ADDRESS_STATE     = 'Maharashtra';
export const ADDRESS_PINCODE   = '440034';
export const ADDRESS_FULL      = `${ADDRESS_LINE1}, ${ADDRESS_LINE2}, ${ADDRESS_STATE} – ${ADDRESS_PINCODE}`;
export const GOOGLE_MAPS_URL   = 'https://maps.google.com/?q=Master+Computer+Academy+Wathoda+Layout+Dighori+Nagpur+440034'; // [UPDATE with exact verified Maps link]
export const GOOGLE_MAPS_EMBED = '';                               // [UPDATE: paste Google Maps embed src URL]

// ── Business hours ─────────────────────────────────────────
export const HOURS = [
  { days: 'सोमवार – शनिवार', time: 'सकाळी ८:०० – रात्री ९:००' },  // Monday–Saturday 8:00 AM – 9:00 PM
  { days: 'रविवार',           time: 'Not provided' },
];

// ── Social media ───────────────────────────────────────────
export const SOCIAL = {
  facebook:  '',   // [UPDATE]
  instagram: '',   // [UPDATE]
  youtube:   '',   // [UPDATE]
  google:    'https://www.justdial.com/Nagpur/Master-Computer-Academy-Near-Wathoda-Police-Station-Wathoda-Layout/0712PX712-X712-160812003119-P6B3_BZDET',
};

// ── Course Categories ───────────────────────────────────────
export const COURSE_CATEGORIES = [
  { id: 'mscit',      label: 'MS-CIT & Career Programs', icon: '⭐', labelMarathi: 'MS-CIT आणि Career Programs' },
  { id: 'accounting', label: 'Accounting & Office',       icon: '💼', labelMarathi: 'Accounting आणि Office' },
  { id: 'design',     label: 'Design & Creative',         icon: '🎨', labelMarathi: 'Design आणि Creative' },
  { id: 'computer',   label: 'Computer & Technology',     icon: '💻', labelMarathi: 'Computer आणि Technology' },
  { id: 'typing',     label: 'Typing Courses',            icon: '⌨️', labelMarathi: 'Typing Courses' },
];

// ── Courses — 25 VERIFIED courses ──────────────────────────
// Fees and batch timings not yet provided — do NOT add until verified.
export const COURSES = [

  // ── MS-CIT & Career Combo Programs ───────────────────────
  {
    id: 'mscit',
    category: 'mscit',
    icon: '🎓',
    name: 'MS-CIT',
    nameMarathi: 'एम-एस-सीआयटी',
    badge: 'Featured',
    isCombo: false,
    isMscit: true,
    duration: null,           // [UPDATE: duration to be provided]
    fees: null,               // [UPDATE: fees to be provided]
    shortDesc: 'Maharashtra State Certificate in Information Technology — संगणकाचे मूलभूत ज्ञान मिळवा.',
    longDesc: 'MS-CIT हा महाराष्ट्रातील अत्यंत लोकप्रिय Computer Literacy course आहे. हा course विद्यार्थी, नोकरी शोधणारे आणि गृहिणींसाठी उपयुक्त आहे.',
  },
  {
    id: 'mscit-combo-1',
    category: 'mscit',
    icon: '🏆',
    name: 'MS-CIT + ENG30 + ENG40 + Diploma',
    nameMarathi: 'MS-CIT + English Typing + Diploma',
    badge: 'Career Program',
    isCombo: true,
    isMscit: false,
    duration: '6 Months',
    fees: null,               // [UPDATE]
    certificates: 4,
    shortDesc: 'एकाच program मध्ये MS-CIT, English Typing (30 & 40 WPM) आणि Diploma — 4 Certificates मिळवा.',
    longDesc: 'MS-CIT + English Typing 30 WPM + English Typing 40 WPM + Diploma — एकाच 6-month learning journey मध्ये.',
  },
  {
    id: 'mscit-combo-2',
    category: 'mscit',
    icon: '🏆',
    name: 'MS-CIT + ENG30 + ENG40 + Tally Prime + Diploma',
    nameMarathi: 'MS-CIT + Typing + Tally + Diploma',
    badge: 'Career Program',
    isCombo: true,
    isMscit: false,
    duration: '8 Months',
    fees: null,               // [UPDATE]
    certificates: 4,
    shortDesc: 'MS-CIT, English Typing, Tally Prime आणि Diploma — सर्व एकत्र! 4 Certificates आणि comprehensive skills.',
    longDesc: 'MS-CIT + English Typing 30 WPM + English Typing 40 WPM + Tally Prime with GST + Diploma — 8-month comprehensive career program.',
  },
  {
    id: 'mscit-eng30',
    category: 'mscit',
    icon: '🎓',
    name: 'MS-CIT + ENG30',
    nameMarathi: 'MS-CIT + English Typing',
    badge: '',
    isCombo: true,
    isMscit: false,
    duration: '3 Months',
    fees: null,               // [UPDATE]
    certificates: null,
    shortDesc: 'MS-CIT सोबत English Typing 30 WPM — 3 months मध्ये दोन skills एकत्र शिका.',
    longDesc: 'MS-CIT आणि English Typing 30 WPM combo program — 3 months.',
  },

  // ── Accounting & Office ───────────────────────────────────
  {
    id: 'advanced-excel',
    category: 'accounting',
    icon: '📊',
    name: 'Advanced Excel',
    nameMarathi: 'अडवान्स्ड Excel',
    badge: '',
    isCombo: false,
    duration: '2 Months',
    fees: null,
    shortDesc: 'Excel मध्ये practical skills विकसित करा — formulas, charts, data analysis.',
  },
  {
    id: 'tally-prime-gst',
    category: 'accounting',
    icon: '💼',
    name: 'Tally Prime with GST',
    nameMarathi: 'Tally Prime with GST',
    badge: '',
    isCombo: false,
    duration: '2 Months',
    fees: null,
    shortDesc: 'Tally Prime आणि GST billing शिका — accountants आणि business owners साठी.',
  },
  {
    id: 'advanced-tally-prime-gst',
    category: 'accounting',
    icon: '💼',
    name: 'Advanced Tally Prime with GST',
    nameMarathi: 'अडवान्स्ड Tally Prime with GST',
    badge: '',
    isCombo: false,
    duration: '2 Months',
    fees: null,
    shortDesc: 'Tally Prime चे advanced features आणि GST accounting सखोलपणे शिका.',
  },
  {
    id: 'office-assistance',
    category: 'accounting',
    icon: '📄',
    name: 'Office Assistance',
    nameMarathi: 'Office Assistance',
    badge: '',
    isCombo: false,
    duration: '3 Months',
    fees: null,
    shortDesc: 'Office साठी आवश्यक computer skills — MS Office, email, documentation.',
  },
  {
    id: 'account-expert-tally',
    category: 'accounting',
    icon: '🧾',
    name: 'Certificate in Account Expert with Tally.ERP9',
    nameMarathi: 'Account Expert with Tally.ERP9',
    badge: '',
    isCombo: false,
    duration: '3 Months',
    fees: null,
    shortDesc: 'Tally.ERP9 सोबत accounting expertise — commerce students आणि accountants साठी.',
  },
  {
    id: 'tally-erp9-advanced',
    category: 'accounting',
    icon: '🧾',
    name: 'Certificate in Tally.ERP9 Advanced (GST) + Prime',
    nameMarathi: 'Tally.ERP9 Advanced (GST) + Prime',
    badge: '',
    isCombo: false,
    duration: '3 Months',
    fees: null,
    shortDesc: 'Tally.ERP9 Advanced GST आणि Tally Prime — comprehensive accounting course.',
  },

  // ── Design & Creative ─────────────────────────────────────
  {
    id: 'graphic-designing',
    category: 'design',
    icon: '🎨',
    name: 'Graphic Designing',
    nameMarathi: 'Graphic Designing',
    badge: '',
    isCombo: false,
    duration: '3 Months',
    fees: null,
    shortDesc: 'Professional graphic design skills — posters, logos, social media creatives.',
  },
  {
    id: 'klic-video-editing',
    category: 'design',
    icon: '🎬',
    name: 'KLiC Video Editing',
    nameMarathi: 'KLiC Video Editing',
    badge: '',
    isCombo: false,
    duration: '2 Months',
    fees: null,
    shortDesc: 'Video editing skills — reels, YouTube videos आणि professional content तयार करा.',
  },
  {
    id: 'klic-web-designing',
    category: 'design',
    icon: '🌐',
    name: 'KLiC Web Designing',
    nameMarathi: 'KLiC Web Designing',
    badge: '',
    isCombo: false,
    duration: '3 Months',
    fees: null,
    shortDesc: 'Professional websites design करायला शिका — HTML, CSS आणि web tools.',
  },
  {
    id: 'cert-dtp',
    category: 'design',
    icon: '🖨️',
    name: 'Certificate in Desktop Publishing',
    nameMarathi: 'Desktop Publishing Certificate',
    badge: '',
    isCombo: false,
    duration: '3 Months',
    fees: null,
    shortDesc: 'Desktop publishing skills — print design, layout आणि publishing software.',
  },
  {
    id: 'diploma-dtp',
    category: 'design',
    icon: '🖨️',
    name: 'Diploma in Desktop Publishing',
    nameMarathi: 'Desktop Publishing Diploma',
    badge: '',
    isCombo: false,
    duration: '3 Months',
    fees: null,
    shortDesc: 'Diploma level desktop publishing — advanced print design आणि layout skills.',
  },
  {
    id: 'cert-web-design',
    category: 'design',
    icon: '🌐',
    name: 'Certificate in Web Design',
    nameMarathi: 'Web Design Certificate',
    badge: '',
    isCombo: false,
    duration: '3 Months',
    fees: null,
    shortDesc: 'Web design certificate course — professional websites बनवायला शिका.',
  },

  // ── Computer & Technology ─────────────────────────────────
  {
    id: 'google-workspace',
    category: 'computer',
    icon: '☁️',
    name: 'Google Workspace Expert',
    nameMarathi: 'Google Workspace Expert',
    badge: '',
    isCombo: false,
    duration: '2 Months',
    fees: null,
    shortDesc: 'Gmail, Google Docs, Sheets, Drive — Google Workspace tools expert बना.',
  },
  {
    id: 'hardware-networking',
    category: 'computer',
    icon: '🔧',
    name: 'Certificate in Hardware and Networking',
    nameMarathi: 'Hardware आणि Networking',
    badge: '',
    isCombo: false,
    duration: '5 Months',
    fees: null,
    shortDesc: 'Computer hardware, assembly, troubleshooting आणि networking basics शिका.',
  },
  {
    id: 'ccc',
    category: 'computer',
    icon: '🏛️',
    name: 'Course on Computer Concepts (CCC)',
    nameMarathi: 'CCC — Government of India',
    badge: 'Govt. of India',
    isCombo: false,
    duration: '3 Months',
    fees: null,
    shortDesc: 'Government of India — NIELIT द्वारे Computer Concepts course. सरकारी jobs साठी उपयुक्त.',
  },

  // ── Typing Courses ────────────────────────────────────────
  {
    id: 'eng-typing-30',
    category: 'typing',
    icon: '⌨️',
    name: 'Certificate in Computer Based English Typing - 30 W.P.M.',
    nameMarathi: 'English Typing — 30 W.P.M.',
    badge: '',
    isCombo: false,
    isTyping: true,
    typingLang: 'English',
    typingSpeed: '30 W.P.M.',
    duration: '3 Months',
    fees: null,
    shortDesc: 'English Typing 30 Words Per Minute — typing certificate साठी ideal.',
  },
  {
    id: 'eng-typing-40',
    category: 'typing',
    icon: '⌨️',
    name: 'Certificate in Computer Based English Typing - 40 W.P.M.',
    nameMarathi: 'English Typing — 40 W.P.M.',
    badge: '',
    isCombo: false,
    isTyping: true,
    typingLang: 'English',
    typingSpeed: '40 W.P.M.',
    duration: '3 Months',
    fees: null,
    shortDesc: 'English Typing 40 Words Per Minute — faster speed certificate.',
  },
  {
    id: 'marathi-typing-30',
    category: 'typing',
    icon: '⌨️',
    name: 'Certificate in Computer Based Marathi Typing - 30 W.P.M.',
    nameMarathi: 'मराठी Typing — ३० W.P.M.',
    badge: '',
    isCombo: false,
    isTyping: true,
    typingLang: 'Marathi',
    typingSpeed: '30 W.P.M.',
    duration: '3 Months',
    fees: null,
    shortDesc: 'मराठी Typing 30 Words Per Minute — Marathi typing certificate.',
  },
  {
    id: 'marathi-typing-40',
    category: 'typing',
    icon: '⌨️',
    name: 'Certificate in Computer Based Marathi Typing - 40 W.P.M.',
    nameMarathi: 'मराठी Typing — ४० W.P.M.',
    badge: '',
    isCombo: false,
    isTyping: true,
    typingLang: 'Marathi',
    typingSpeed: '40 W.P.M.',
    duration: '3 Months',
    fees: null,
    shortDesc: 'मराठी Typing 40 Words Per Minute — advanced speed certificate.',
  },
  {
    id: 'hindi-typing-30',
    category: 'typing',
    icon: '⌨️',
    name: 'Certificate in Computer Based Hindi Typing - 30 W.P.M.',
    nameMarathi: 'हिंदी Typing — 30 W.P.M.',
    badge: '',
    isCombo: false,
    isTyping: true,
    typingLang: 'Hindi',
    typingSpeed: '30 W.P.M.',
    duration: '3 Months',
    fees: null,
    shortDesc: 'हिंदी Typing 30 Words Per Minute — Hindi typing certificate.',
  },
  {
    id: 'hindi-typing-40',
    category: 'typing',
    icon: '⌨️',
    name: 'Certificate in Computer Based Hindi Typing - 40 W.P.M.',
    nameMarathi: 'हिंदी Typing — 40 W.P.M.',
    badge: '',
    isCombo: false,
    isTyping: true,
    typingLang: 'Hindi',
    typingSpeed: '40 W.P.M.',
    duration: '3 Months',
    fees: null,
    shortDesc: 'हिंदी Typing 40 Words Per Minute — advanced speed certificate.',
  },
  {
    id: 'gcc-tbc',
    category: 'typing',
    icon: '🎯',
    name: 'GCC-TBC Pune Board Typing (Any One)',
    nameMarathi: 'GCC-TBC Pune Board Typing',
    badge: 'Board Exam',
    isCombo: false,
    isTyping: true,
    typingCombos: [
      'English 30 + English 40',
      'Marathi 30 + Marathi 40',
      'Hindi 30 + Hindi 40',
    ],
    typingSpeed: null,
    duration: '6 Months',
    fees: null,
    shortDesc: 'GCC-TBC Pune Board Typing — English, Marathi किंवा Hindi मधून एक combination निवडा.',
  },
];

// ── Reviews (add real reviews from verified students) ───────
// DO NOT use fake testimonials. Add only verified reviews.
export const REVIEWS = [
  // Example structure — replace with real verified reviews from the academy owner:
  // {
  //   id: 1,
  //   name: 'विद्यार्थी नाव',
  //   course: 'MS-CIT',
  //   rating: 5,
  //   review: 'खूप चांगले शिकवतात. Practical learning आहे.',
  //   avatar: '',
  // },
];

// ── Gallery images ─────────────────────────────────────────
// Replace src values with real academy photos.
export const GALLERY_ITEMS = [
  { id: 1, category: 'classroom', alt: 'Computer Lab – Master Computer Academy', src: '' },
  { id: 2, category: 'classroom', alt: 'Classroom at Master Computer Academy Wathoda', src: '' },
  { id: 3, category: 'students',  alt: 'Students learning MS-CIT', src: '' },
  { id: 4, category: 'students',  alt: 'Students in practical session', src: '' },
  { id: 5, category: 'activity',  alt: 'Academy activity / event', src: '' },
  { id: 6, category: 'activity',  alt: 'Certificate distribution ceremony', src: '' },
];
