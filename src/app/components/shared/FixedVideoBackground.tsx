import { useEffect, useRef } from "react";

type FixedVideoBackgroundProps = {
  src: string;
  mobileSrc?: string;
  mobileHighSrc?: string;
  poster?: string;
  tone?: "intro" | "lower";
  playbackRate?: number;
  eager?: boolean;
};

export function FixedVideoBackground({
  src,
  mobileSrc,
  mobileHighSrc,
  poster,
  tone = "intro",
  playbackRate = 0.65,
  eager = false,
}: FixedVideoBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const region = container.closest(".page-video-region") ?? container;
    const mobileQuery = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isMobile = mobileQuery.matches;
    const connection = (navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean };
    }).connection;
    const hasSlowConnection = connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g";
    const isMediumConnection = connection?.effectiveType === "3g";
    const useStaticBackground = reducedMotionQuery.matches || connection?.saveData || hasSlowConnection;

    if (useStaticBackground) {
      video.removeAttribute("src");
      video.load();
      return;
    }

    let isCancelled = false;
    let isNearViewport = eager;
    let sourceIsLoaded = false;
    const selectedSource = isMobile
      ? (!isMediumConnection && mobileHighSrc ? mobileHighSrc : mobileSrc ?? src)
      : src;

    const play = () => {
      video.defaultPlaybackRate = playbackRate;
      video.playbackRate = playbackRate;
      if (!document.hidden) void video.play().catch(() => undefined);
    };

    const loadSource = async () => {
      if (sourceIsLoaded || isCancelled) return;
      sourceIsLoaded = true;
      video.src = selectedSource;
      video.load();
      play();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isNearViewport = entry.isIntersecting;
        if (isNearViewport) void loadSource().then(play);
        else video.pause();
      },
      { rootMargin: isMobile ? "240px 0px" : "640px 0px" },
    );

    const handleVisibility = () => {
      if (document.hidden || !isNearViewport) video.pause();
      else play();
    };

    video.addEventListener("loadedmetadata", play);
    document.addEventListener("visibilitychange", handleVisibility);
    observer.observe(region);
    if (eager) void loadSource();

    return () => {
      isCancelled = true;
      observer.disconnect();
      video.removeEventListener("loadedmetadata", play);
      document.removeEventListener("visibilitychange", handleVisibility);
      video.pause();
    };
  }, [eager, mobileHighSrc, mobileSrc, playbackRate, src]);

  return (
    <div ref={containerRef} className={`page-video-background page-video-background--${tone}`} aria-hidden="true">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
        preload="metadata"
        tabIndex={-1}
      />
      <div className="page-video-background__scrim" />
    </div>
  );
}
