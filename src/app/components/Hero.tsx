import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { ArrowRight, Rocket } from "lucide-react";
import { ContactModal } from "./ContactModal";
import { Button } from "./ui/button";
import { useLanguage } from "../i18n/LanguageContext";

const HERO_VIDEO_URL =
  "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const { copy } = useLanguage();
  const hero = copy.hero;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(HERO_VIDEO_URL);
      hls.attachMedia(video);

      return () => hls.destroy();
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = HERO_VIDEO_URL;
    }
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.96)_0%,rgba(4,10,18,0.88)_38%,rgba(9,18,30,0.32)_72%,rgba(10,18,28,0.12)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-black via-black/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 pb-32 pt-40">
        <div className="max-w-3xl -translate-y-4 sm:-translate-y-6 lg:-translate-y-10">
          <h1 className="mb-6 text-white">
            <span className="mb-4 block bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-5xl text-transparent md:text-7xl">
              {hero.title}
            </span>
          </h1>

          <p className="mb-8 max-w-2xl text-lg text-slate-300">
            {hero.description}
          </p>

          <div className="mb-12 flex flex-wrap gap-4">
            <Button
              type="button"
              size="lg"
              onClick={() => setIsContactOpen(true)}
              className="group border border-slate-500/30 bg-gradient-to-r from-slate-700 to-slate-600 px-8 text-white shadow-lg shadow-slate-950/50 hover:from-slate-600 hover:to-slate-500"
            >
              {hero.startProject}
              <Rocket className="ml-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() =>
                document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" })
              }
              className="border-slate-500 bg-black/10 px-8 text-white backdrop-blur-xl hover:bg-slate-800/50"
            >
              {hero.viewCases}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="grid max-w-2xl grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-4 backdrop-blur-xl">
              <div className="mb-1 text-slate-300">250+</div>
              <div className="text-sm text-slate-400">{hero.projects}</div>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-4 backdrop-blur-xl">
              <div className="mb-1 text-slate-300">98%</div>
              <div className="text-sm text-slate-400">{hero.satisfaction}</div>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-4 backdrop-blur-xl">
              <div className="mb-1 text-slate-300">24/7</div>
              <div className="text-sm text-slate-400">{hero.support}</div>
            </div>
          </div>
        </div>
      </div>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </section>
  );
}
