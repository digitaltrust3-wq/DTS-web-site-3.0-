import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Services } from "./components/Services";
import { Portfolio } from "./components/Portfolio";
import { About } from "./components/About";
import { TechStack } from "./components/TechStack";
import { Testimonials } from "./components/Testimonials";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";
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
