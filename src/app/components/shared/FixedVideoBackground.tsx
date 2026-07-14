import { useEffect, useRef } from "react";

type FixedVideoBackgroundProps = {
  src: string;
  hls?: boolean;
  tone?: "intro" | "lower";
};

export function FixedVideoBackground({
  src,
  hls = false,
  tone = "intro",
}: FixedVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hls) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }

    let isCancelled = false;
    let destroyPlayer: (() => void) | undefined;

    const loadVideoPlayer = async () => {
      const { default: Hls } = await import("hls.js");
      if (isCancelled || !Hls.isSupported()) return;

      const player = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      player.loadSource(src);
      player.attachMedia(video);
      destroyPlayer = () => player.destroy();
    };

    void loadVideoPlayer();

    return () => {
      isCancelled = true;
      destroyPlayer?.();
    };
  }, [hls, src]);

  return (
    <div className={`page-video-background page-video-background--${tone}`} aria-hidden="true">
      <video
        ref={videoRef}
        src={hls ? undefined : src}
        autoPlay
        muted
        loop
        playsInline
        tabIndex={-1}
      />
      <div className="page-video-background__scrim" />
    </div>
  );
}
