import { useEffect, useRef } from "react";
import { toEmbedUrl } from "@shared/domain";

/**
 * TrackedPlayer — the watch-proof player (features 1, 4, 5).
 *
 * Wraps the YouTube IFrame API (or a native <video> for mp4) so the page gets
 * a 1-second tick while the video plays. The page banks those seconds on the
 * server; the student never claims them. Pauses itself when the tab hides so
 * background time never counts.
 *
 * The YouTube branch loads the IFrame API once per page; if it never arrives
 * (offline demo, blocked CDN) the plain embed shows and tracking just stays
 * off — the lesson still plays.
 */

export interface PlayerHandle {
  seekTo: (sec: number) => void;
  pause: () => void;
  play: () => void;
  currentTime: () => number;
}

interface Props {
  videoUrl: string | null | undefined;
  title: string;
  /** Resume position (server-stored). */
  startSec?: number;
  /** Fires ~1/s with the current position and whether it is playing. */
  onTick?: (positionSec: number, playing: boolean) => void;
  onReady?: (h: PlayerHandle) => void;
  className?: string;
}

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
    __madarYTReady?: Promise<any>;
  }
}

function loadYT(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  window.__madarYTReady ??= new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT);
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.onerror = () => reject(new Error("yt api failed"));
    document.head.appendChild(tag);
    setTimeout(() => reject(new Error("yt api timeout")), 15000);
  });
  return window.__madarYTReady;
}

function ytId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? m[1] : null;
}

export function TrackedPlayer({ videoUrl, title, startSec = 0, onTick, onReady, className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const tickRef = useRef(onTick);
  tickRef.current = onTick;
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  const embed = toEmbedUrl(videoUrl);
  const yt = videoUrl ? ytId(videoUrl) : null;

  // ── YouTube branch ──
  useEffect(() => {
    if (!yt || !hostRef.current) return;
    let player: any = null;
    let poll: ReturnType<typeof setInterval> | null = null;
    let dead = false;

    const onVis = () => {
      if (document.hidden) player?.pauseVideo?.();
    };

    loadYT()
      .then((YT) => {
        if (dead || !hostRef.current) return;
        const mount = document.createElement("div");
        mount.className = "size-full";
        hostRef.current.appendChild(mount);
        player = new YT.Player(mount, {
          videoId: yt,
          width: "100%",
          height: "100%",
          playerVars: { rel: 0, modestbranding: 1, start: Math.max(0, Math.floor(startSec)) },
          events: {
            onReady: () => {
              if (dead) return;
              readyRef.current?.({
                seekTo: (s) => player?.seekTo?.(s, true),
                pause: () => player?.pauseVideo?.(),
                play: () => player?.playVideo?.(),
                currentTime: () => Number(player?.getCurrentTime?.() ?? 0),
              });
              poll = setInterval(() => {
                const state = player?.getPlayerState?.();
                tickRef.current?.(Number(player?.getCurrentTime?.() ?? 0), state === 1);
              }, 1000);
            },
          },
        });
        document.addEventListener("visibilitychange", onVis);
      })
      .catch(() => {
        /* API unreachable — the plain embed below stays as the fallback */
      });

    return () => {
      dead = true;
      document.removeEventListener("visibilitychange", onVis);
      if (poll) clearInterval(poll);
      try {
        player?.destroy?.();
      } catch {
        /* player already gone */
      }
      if (hostRef.current) hostRef.current.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yt]);

  // ── Native <video> branch ──
  useEffect(() => {
    if (yt || embed.kind !== "video" || !videoRef.current) return;
    const v = videoRef.current;
    if (startSec > 0) v.currentTime = startSec;
    const onVis = () => {
      if (document.hidden) v.pause();
    };
    const poll = setInterval(() => tickRef.current?.(v.currentTime, !v.paused), 1000);
    document.addEventListener("visibilitychange", onVis);
    readyRef.current?.({
      seekTo: (s) => {
        v.currentTime = s;
      },
      pause: () => v.pause(),
      play: () => void v.play(),
      currentTime: () => v.currentTime,
    });
    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yt, embed.kind, embed.src]);

  if (yt) {
    // The API mounts its iframe inside this host; the plain embed renders until then.
    return (
      <div className={className ?? "size-full"}>
        <div ref={hostRef} className="size-full" />
      </div>
    );
  }
  if (embed.kind === "video") {
    return <video ref={videoRef} src={embed.src} controls playsInline className={className ?? "size-full"} preload="metadata" />;
  }
  if (embed.kind === "iframe") {
    return (
      <iframe
        src={embed.src}
        title={title}
        className={className ?? "size-full"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }
  return null;
}
