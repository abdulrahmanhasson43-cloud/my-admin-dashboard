import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { toEmbedUrl } from "@shared/domain";
import { cn } from "@/lib/utils";

/**
 * MadarPlayer — the platform's own player chrome (teacher ask, Nov 26).
 *
 * One consistent Madar-branded player whether the lesson is a YouTube link, a
 * direct upload (mp4/webm/ogg) or any other embeddable link. YouTube and
 * direct files get the full custom control bar (play, seek, speed, volume,
 * fullscreen). Third-party embeds (Vimeo etc.) render in a plain iframe —
 * their players don't expose cross-origin controls.
 *
 * YouTube's own logo/title still shows on hover: hiding it violates YouTube's
 * terms, so the chrome is as clean as the embed API allows (controls=0,
 * modestbranding, rel=0). Full branding control needs direct uploads.
 *
 * Tracking contract matches TrackedPlayer: ~1/s onTick(positionSec, playing),
 * PlayerHandle onReady, auto-pause when the tab hides.
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
  startSec?: number;
  onTick?: (positionSec: number, playing: boolean) => void;
  onReady?: (h: PlayerHandle) => void;
  className?: string;
  /** Extra buttons injected into the control bar (notes, subtitles, study mode). */
  extraControls?: ReactNode;
  /** WebVTT subtitle track — only possible on direct uploads, never on YouTube embeds. */
  vttUrl?: string | null;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

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

function fmt(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

/** Shared engine behind both branches: one adapter interface. */
interface Adapter {
  play(): void;
  pause(): void;
  seekTo(sec: number): void;
  getTime(): number;
  getDuration(): number;
  setRate(r: number): void;
  setMuted(m: boolean): void;
  isPlaying(): boolean;
  destroy(): void;
}

const ctlBtn = "grid size-9 place-items-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-white";

export function MadarPlayer({ videoUrl, title, startSec = 0, onTick, onReady, className, extraControls, vttUrl }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const adapterRef = useRef<Adapter | null>(null);
  const tickRef = useRef(onTick);
  tickRef.current = onTick;
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(startSec);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [muted, setMuted] = useState(false);
  const [customOk, setCustomOk] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);
  // Madar-branded cover (teacher ask, Nov 26): until the student presses OUR
  // play button, neither YouTube's red button nor the bare video is what shows.
  const [started, setStarted] = useState(false);
  const pendingPlayRef = useRef(false);

  const embed = toEmbedUrl(videoUrl);
  const yt = videoUrl ? ytId(videoUrl) : null;
  const nativeVideo = !yt && embed.kind === "video";
  const customControls = Boolean(yt || nativeVideo) && customOk;

  // A new video means the cover comes back.
  useEffect(() => {
    setStarted(false);
    pendingPlayRef.current = false;
  }, [embed.src]);

  const startPlay = useCallback(() => {
    pendingPlayRef.current = true;
    adapterRef.current?.play();
    // Hide the cover right away; where nothing can be driven (third-party
    // iframe fallback) the site's own player is underneath it.
    setStarted(true);
  }, []);

  // ── YouTube branch: API player with its own controls hidden ──
  useEffect(() => {
    if (!yt || !hostRef.current) return;
    let dead = false;
    let player: any = null;
    let poll: ReturnType<typeof setInterval> | null = null;
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
          playerVars: {
            rel: 0,
            modestbranding: 1,
            controls: 0,
            disablekb: 1,
            iv_load_policy: 3,
            playsinline: 1,
            start: Math.max(0, Math.floor(startSec)),
          },
          events: {
            onReady: () => {
              if (dead) return;
              adapterRef.current = {
                play: () => player?.playVideo?.(),
                pause: () => player?.pauseVideo?.(),
                seekTo: (s) => player?.seekTo?.(s, true),
                getTime: () => Number(player?.getCurrentTime?.() ?? 0),
                getDuration: () => Number(player?.getDuration?.() ?? 0),
                setRate: (r) => player?.setPlaybackRate?.(r),
                setMuted: (m) => (m ? player?.mute?.() : player?.unMute?.()),
                isPlaying: () => player?.getPlayerState?.() === 1,
                destroy: () => {
                  try {
                    player?.destroy?.();
                  } catch {
                    /* already gone */
                  }
                },
              };
              setDuration(adapterRef.current.getDuration());
              setCustomOk(true);
              if (pendingPlayRef.current) adapterRef.current.play();
              readyRef.current?.({
                seekTo: (s) => adapterRef.current?.seekTo(s),
                pause: () => adapterRef.current?.pause(),
                play: () => adapterRef.current?.play(),
                currentTime: () => adapterRef.current?.getTime() ?? 0,
              });
              poll = setInterval(() => {
                const a = adapterRef.current;
                if (!a) return;
                setTime(a.getTime());
                setDuration(a.getDuration());
                setPlaying(a.isPlaying());
                if (a.isPlaying()) setStarted(true);
                tickRef.current?.(a.getTime(), a.isPlaying());
              }, 1000);
            },
          },
        });
        document.addEventListener("visibilitychange", onVis);
      })
      .catch(() => {
        /* API unreachable — the plain embed fallback below stays */
      });
    return () => {
      dead = true;
      document.removeEventListener("visibilitychange", onVis);
      if (poll) clearInterval(poll);
      adapterRef.current?.destroy();
      adapterRef.current = null;
      if (hostRef.current) hostRef.current.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yt]);

  // ── Native <video> branch ──
  useEffect(() => {
    if (!nativeVideo || !videoRef.current) return;
    const v = videoRef.current;
    if (startSec > 0) v.currentTime = startSec;
    adapterRef.current = {
      play: () => void v.play(),
      pause: () => v.pause(),
      seekTo: (s) => {
        v.currentTime = s;
      },
      getTime: () => v.currentTime,
      getDuration: () => (Number.isFinite(v.duration) ? v.duration : 0),
      setRate: (r) => {
        v.playbackRate = r;
      },
      setMuted: (m) => {
        v.muted = m;
      },
      isPlaying: () => !v.paused,
      destroy: () => v.pause(),
    };
    setCustomOk(true);
    readyRef.current?.({
      seekTo: (s) => adapterRef.current?.seekTo(s),
      pause: () => adapterRef.current?.pause(),
      play: () => adapterRef.current?.play(),
      currentTime: () => adapterRef.current?.getTime() ?? 0,
    });
    const onVis = () => {
      if (document.hidden) v.pause();
    };
    const poll = setInterval(() => {
      const a = adapterRef.current;
      if (!a) return;
      setTime(a.getTime());
      setDuration(a.getDuration());
      setPlaying(a.isPlaying());
      if (a.isPlaying()) setStarted(true);
      tickRef.current?.(a.getTime(), a.isPlaying());
    }, 1000);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVis);
      adapterRef.current?.destroy();
      adapterRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nativeVideo, embed.src]);

  const togglePlay = useCallback(() => {
    const a = adapterRef.current;
    if (!a) return;
    if (a.isPlaying()) a.pause();
    else a.play();
    setPlaying(a.isPlaying());
  }, []);

  const changeRate = useCallback((r: number) => {
    adapterRef.current?.setRate(r);
    setRate(r);
    setSpeedOpen(false);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      adapterRef.current?.setMuted(!m);
      return !m;
    });
  }, []);

  const fullscreen = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  }, []);

  // ── Render ──
  const bar = customControls ? (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-2 pt-10" dir="ltr">
      <input
        type="range"
        min={0}
        max={Math.max(1, Math.floor(duration))}
        value={Math.floor(time)}
        onChange={(e) => {
          const sec = Number(e.target.value);
          adapterRef.current?.seekTo(sec);
          setTime(sec);
        }}
        className="pointer-events-auto h-1 w-full cursor-pointer accent-[var(--accent)]"
        aria-label="seek"
      />
      <div className="pointer-events-auto mt-1 flex items-center gap-1.5">
        <button type="button" className={ctlBtn} onClick={togglePlay} aria-label={playing ? "pause" : "play"}>
          {playing ? <Pause className="size-4.5" /> : <Play className="size-4.5" />}
        </button>
        <span className="min-w-24 text-center text-[11.5px] tabular text-white/70">
          {fmt(time)} / {fmt(duration)}
        </span>
        <div className="relative">
          <button type="button" className={cn(ctlBtn, "w-auto px-2 text-[12px] font-semibold tabular")} onClick={() => setSpeedOpen((o) => !o)} aria-label="speed">
            {rate}x
          </button>
          {speedOpen && (
            <div className="absolute bottom-10 left-0 z-30 overflow-hidden rounded-lg border border-white/10 bg-[#111]/95 shadow-xl">
              {SPEEDS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => changeRate(r)}
                  className={cn("block w-full px-4 py-1.5 text-left text-[12.5px] tabular hover:bg-white/10", r === rate ? "text-[var(--accent)]" : "text-white/75")}
                >
                  {r}x
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1" />
        <span dir="rtl" className="flex items-center gap-1.5">
          {extraControls}
        </span>
        <button type="button" className={ctlBtn} onClick={toggleMute} aria-label="mute">
          {muted ? <VolumeX className="size-4.5" /> : <Volume2 className="size-4.5" />}
        </button>
        <button type="button" className={ctlBtn} onClick={fullscreen} aria-label="fullscreen">
          <Maximize className="size-4.5" />
        </button>
      </div>
    </div>
  ) : null;

  const brand = (
    <span className="pointer-events-none absolute left-3 top-3 z-20 select-none rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-bold text-white/75 backdrop-blur-sm">
      مدار
    </span>
  );

  // The Madar cover: our own play button over everything, before first play.
  const cover = !started && (yt || nativeVideo || embed.kind === "iframe") ? (
    <button
      type="button"
      onClick={startPlay}
      aria-label="تشغيل الدرس"
      className="absolute inset-0 z-30 grid cursor-pointer place-items-center bg-[#050505]/90"
    >
      <span className="grid place-items-center gap-5">
        <span className="grid size-20 place-items-center rounded-full bg-[var(--accent)] shadow-[0_0_60px_rgba(0,0,0,0.6)] ring-4 ring-white/15 transition-transform duration-200 hover:scale-105 sm:size-24">
          <Play className="size-9 text-black sm:size-10" fill="currentColor" strokeWidth={0} />
        </span>
        <span className="max-w-[48ch] px-5 text-center text-[14.5px] font-semibold leading-relaxed text-white/90">{title}</span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/70">مدار</span>
      </span>
    </button>
  ) : null;

  // After a pause the centered button is ours too, not the site's own.
  const pausePlay = started && !playing && customControls ? (
    <button type="button" onClick={togglePlay} aria-label="play" className="absolute inset-0 z-10 grid cursor-pointer place-items-center">
      <span className="grid size-16 place-items-center rounded-full bg-[var(--accent)]/90 shadow-[0_0_40px_rgba(0,0,0,0.55)] transition-transform duration-150 hover:scale-105">
        <Play className="size-7 text-black" fill="currentColor" strokeWidth={0} />
      </span>
    </button>
  ) : null;

  return (
    <div ref={wrapRef} className={cn("group relative size-full bg-black", className)}>
      {yt ? (
        <>
          <div ref={hostRef} className="size-full" />
          {!customOk && (
            <iframe
              src={embed.src}
              title={title}
              className="absolute inset-0 size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}
          {customOk && (
            <>
              {/* Block YouTube's own title row; our chrome sits below */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-14" />
            </>
          )}
          {brand}
          {bar}
          {pausePlay}
          {cover}
        </>
      ) : nativeVideo ? (
        <>
          <video ref={videoRef} src={embed.src} playsInline className="size-full" preload="metadata" onClick={togglePlay}>
            {vttUrl ? <track kind="subtitles" src={vttUrl} srcLang="ar" label="العربية" default /> : null}
          </video>
          {brand}
          {bar}
          {pausePlay}
          {cover}
        </>
      ) : embed.kind === "iframe" ? (
        <>
          <iframe
            src={embed.src}
            title={title}
            className="size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
          {brand}
          {cover}
        </>
      ) : null}
    </div>
  );
}
