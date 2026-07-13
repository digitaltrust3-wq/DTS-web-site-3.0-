import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { About } from "./components/sections/About";
import { CTA } from "./components/sections/CTA";
import { Hero } from "./components/sections/Hero";
import { Portfolio } from "./components/sections/Portfolio";
import { Services } from "./components/sections/Services";
import { TechStack } from "./components/sections/TechStack";
import { Testimonials } from "./components/sections/Testimonials";
import { useLanguage } from "./i18n/LanguageContext";

export default function App() {
  const { copy } = useLanguage();

  return (
    <div className="min-h-screen bg-[var(--dts-surface)] text-[var(--dts-text)]">
      <a className="skip-link" href="#main-content">
        {copy.common.skip}
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <Services />
        <Portfolio />
        <About />
        <TechStack />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
