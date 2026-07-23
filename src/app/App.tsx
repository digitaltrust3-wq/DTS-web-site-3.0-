import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { About } from "./components/sections/About";
import { CTA } from "./components/sections/CTA";
import { Hero } from "./components/sections/Hero";
import { Portfolio } from "./components/sections/Portfolio";
import { Services } from "./components/sections/Services";
import { TechStack } from "./components/sections/TechStack";
import { Testimonials } from "./components/sections/Testimonials";
import { FixedVideoBackground } from "./components/shared/FixedVideoBackground";
import { useLanguage } from "./i18n/LanguageContext";
import { AdminPage } from "./admin/AdminPage";

const INTRO_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260514_135830_bb6491d1-9b66-4aec-9722-13b4dfe3fb46.mp4";

const INTRO_MOBILE_VIDEO_URL = `${import.meta.env.BASE_URL}assets/video/intro-mobile.mp4`;
const INTRO_MOBILE_1080_VIDEO_URL = `${import.meta.env.BASE_URL}assets/video/intro-mobile-1080.mp4`;
const INTRO_POSTER_URL = `${import.meta.env.BASE_URL}assets/video/intro-poster.jpg`;
const LOWER_POSTER_URL = `${import.meta.env.BASE_URL}assets/video/lower-poster.jpg`;

const LOWER_VIDEO_URL =
  "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";

export default function App() {
  const { copy } = useLanguage();
  const isAdminRoute = /\/admin\/?$/.test(window.location.pathname) || window.location.hash === "#/admin";

  if (isAdminRoute) return <AdminPage />;

  return (
    <div className="min-h-screen bg-[var(--dts-surface)] text-[var(--dts-text)]">
      <a className="skip-link" href="#main-content">
        {copy.common.skip}
      </a>
      <Navbar />
      <main id="main-content">
        <div className="page-video-region page-video-region--intro">
          <FixedVideoBackground
            src={INTRO_VIDEO_URL}
            mobileSrc={INTRO_MOBILE_VIDEO_URL}
            mobileHighSrc={INTRO_MOBILE_1080_VIDEO_URL}
            poster={INTRO_POSTER_URL}
            tone="intro"
            playbackRate={0.65}
            eager
          />
          <div className="page-video-region__content">
            <Hero />
            <Services />
            <Portfolio />
            <About />
          </div>
        </div>

        <div className="page-video-region page-video-region--lower">
          <FixedVideoBackground
            src={LOWER_VIDEO_URL}
            poster={LOWER_POSTER_URL}
            hls
            tone="lower"
            playbackRate={0.65}
          />
          <div className="page-video-region__content">
            <TechStack />
            <Testimonials />
            <CTA />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
