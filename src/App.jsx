import React from 'react';

// Layout
import Navbar          from './components/layout/Navbar';
import Footer          from './components/layout/Footer';
import MobileBottomBar from './components/layout/MobileBottomBar';

// Sections
import Hero            from './components/sections/Hero';
import MsCit           from './components/sections/MsCit';
import WhyMsCit        from './components/sections/WhyMsCit';
import Courses         from './components/sections/Courses';
import WhyUs           from './components/sections/WhyUs';
import About           from './components/sections/About';
import LearningJourney from './components/sections/LearningJourney';
import Reviews         from './components/sections/Reviews';
import Gallery         from './components/sections/Gallery';
import Location        from './components/sections/Location';
import Contact         from './components/sections/Contact';
import FinalCta        from './components/sections/FinalCta';

export default function App() {
  return (
    <>
      {/* Skip to content for keyboard / screen reader users */}
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]
                   focus:bg-white focus:text-primary-700 focus:font-bold focus:px-4 focus:py-2
                   focus:rounded-xl focus:shadow-lg focus:ring-2 focus:ring-primary-600"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
        <Hero />
        <MsCit />
        <WhyMsCit />
        <Courses />
        <WhyUs />
        <About />
        <LearningJourney />
        <Reviews />
        <Gallery />
        <Location />
        <Contact />
        <FinalCta />
      </main>

      <Footer />
      <MobileBottomBar />
    </>
  );
}
