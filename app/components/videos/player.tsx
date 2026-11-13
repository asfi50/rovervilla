"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { clock, playlist, seriesName, type Series, type Video } from "@/lib/videos";
import { saveProgress } from "@/lib/watch-progress";

/*
 * Full-screen player. Episodes stack vertically: swipe (or wheel, or ↑ ↓) to move between
 * them, tap to pause, double-tap a side to skip 10 s, pull down on the first one to close.
 * One <video> element plays every episode: iOS keeps sound unlocked on an element once the
 * viewer has started it, so swapping its source keeps sound on from one episode to the next.
 */

export type PlayerProps = { series: Series; start: number; startAt: number; from: DOMRect | null; onClose: () => void };

type Flash = { kind: "play" | "pause" | "back" | "fwd"; key: number };

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const insetOf = (r: DOMRect) =>
  `inset(${r.top}px ${window.innerWidth - r.right}px ${window.innerHeight - r.bottom}px ${r.left}px round 14px)`;
const withWatch = (id: string | null) => {
  const u = new URL(window.location.href);
  if (id) u.searchParams.set("watch", id);
  else u.searchParams.delete("watch");
  return u.pathname + u.search + u.hash;
};

export default function Player({ series, start, startAt, from, onClose }: PlayerProps) {
  const list = useMemo(() => playlist(series), [series]);
  const [index, setIndex] = useState(start);
  const item = list[index];

  const [paused, setPaused] = useState(true);
  const [muted, setMuted] = useState(false);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [time, setTime] = useState(startAt);
  const [mediaDuration, setMediaDuration] = useState(0);
  const duration = mediaDuration || item.duration;
  const [scrubbing, setScrubbing] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [idle, setIdle] = useState(false);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [hint, setHint] = useState(() => {
    try {
      return matchMedia("(pointer: coarse)").matches && !localStorage.getItem("rv:swipe-hint");
    } catch {
      return false;
    }
  });
  const [canFullscreen] = useState(() => !!document.fullscreenEnabled);

  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const ambient = useRef<HTMLCanvasElement>(null);
  const seekOnLoad = useRef(startAt);
  const busy = useRef(false);
  const closing = useRef(false);
  const pushed = useRef(false);
  const lastSave = useRef(0);
  const wheelLock = useRef(0);
  const idleTimer = useRef(0);
  const lastTap = useRef<{ t: number; zone: number; timer?: number } | null>(null);
  const drag = useRef<{ x: number; y: number; id: number; on: boolean; samples: { y: number; t: number }[] } | null>(null);

  const save = (v = video.current, it = item) => {
    if (v && v.currentTime > 1) saveProgress(it.id, v.currentTime, v.duration || it.duration);
  };

  /* ── Moving between videos ─────────────────────────────────────────────────── */

  const settle = () => gsap.to(stage.current, { y: 0, scale: 1, duration: 0.4, ease: "power3.out" });

  const go = (to: number) => {
    if (busy.current) return;
    if (to < 0 || to >= list.length || to === index) return void settle();
    busy.current = true;
    save();
    const swap = () => {
      flushSync(() => {
        setReady(false);
        setFinished(false);
        setTime(0);
        setMediaDuration(0);
        setIndex(to);
      });
      gsap.set(stage.current, { y: 0, scale: 1, opacity: 1 });
      busy.current = false;
    };
    if (reduced()) return swap();
    if (Math.abs(to - index) === 1) {
      const h = stage.current!.clientHeight;
      gsap.to(stage.current, { y: to > index ? -h : h, scale: 1, duration: 0.5, ease: "power3.out", onComplete: swap });
    } else {
      gsap.to(stage.current, { opacity: 0, duration: 0.25, onComplete: () => (swap(), gsap.from(stage.current, { opacity: 0, duration: 0.35 })) });
    }
  };

  /* Load whatever is current into the one video element, before paint so no stale frame shows. */
  useLayoutEffect(() => {
    const v = video.current!;
    const at = seekOnLoad.current;
    seekOnLoad.current = 0;
    v.src = item.src;
    const onMeta = () => {
      if (at) v.currentTime = at;
    };
    v.addEventListener("loadedmetadata", onMeta, { once: true });
    v.play()
      .then(() => setSoundBlocked(false))
      .catch(() => {
        // No sound allowed without a fresh tap (some phones): play muted and offer sound.
        v.muted = true;
        setMuted(true);
        v.play()
          .then(() => setSoundBlocked(true))
          .catch(() => setPaused(true));
      });
    if (pushed.current) history.replaceState(history.state, "", withWatch(item.id));
    return () => v.removeEventListener("loadedmetadata", onMeta);
  }, [item]);

  /* ── Open, close, history ──────────────────────────────────────────────────── */

  const finish = () => {
    if (closing.current) return;
    closing.current = true;
    save();
    video.current?.pause();
    if (new URLSearchParams(location.search).has("watch")) history.replaceState(history.state, "", withWatch(null));
    const el = root.current!;
    // The same poster can exist twice (a phone layout and a desktop one); use the one on screen.
    const target = [...document.querySelectorAll(`[data-poster="${item.id}"]`)].map((el) => el.getBoundingClientRect()).find((r) => r.width > 0);
    if (reduced()) return onClose();
    if (target && target.width > 0 && target.bottom > 0 && target.top < innerHeight) {
      gsap.to(el, { clipPath: insetOf(target), duration: 0.55, ease: "expo.inOut", onComplete: onClose });
      gsap.to(stage.current, { scale: 1.06, duration: 0.55, ease: "expo.inOut" });
    } else {
      gsap.to(el, { opacity: 0, scale: 0.98, duration: 0.3, ease: "power2.in", onComplete: onClose });
    }
  };

  const requestClose = () => {
    if (history.state?.rvPlayer) history.back(); // popstate below finishes the close
    else finish();
  };

  const latest = useRef({ finish, index });
  useLayoutEffect(() => {
    latest.current = { finish, index };
  });

  useLayoutEffect(() => {
    const el = root.current!;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    el.focus({ preventScroll: true });
    const ctx = gsap.context(() => {
      if (reduced()) return;
      if (from && from.width > 0) {
        gsap.fromTo(el, { clipPath: insetOf(from) }, { clipPath: "inset(0px 0px 0px 0px round 0px)", duration: 0.7, ease: "expo.inOut", clearProps: "clipPath" });
        gsap.fromTo(stage.current, { scale: 1.12 }, { scale: 1, duration: 1, ease: "expo.out" });
      } else {
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
      }
      gsap.fromTo(
        el.querySelectorAll("[data-chrome]"),
        { opacity: 0, y: (i: number) => (i ? 16 : -16) },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.4, ease: "power3.out", clearProps: "opacity,transform" },
      );
    }, el);
    return () => {
      ctx.revert();
      html.style.overflow = prevOverflow;
    };
  }, [from]);

  useEffect(() => {
    if (!pushed.current) {
      pushed.current = true;
      history.pushState({ ...history.state, rvPlayer: true }, "", withWatch(list[start].id));
    }
    const onPop = () => latest.current.finish();
    window.addEventListener("popstate", onPop);
    try {
      localStorage.setItem("rv:swipe-hint", "1");
    } catch {
      /* storage blocked: the hint may show again next time */
    }
    const onHide = () => document.visibilityState === "hidden" && save(video.current, list[latest.current.index]);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("visibilitychange", onHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hint) return;
    const t = setTimeout(() => setHint(false), 3800);
    return () => clearTimeout(t);
  }, [hint]);

  /* ── Playback ──────────────────────────────────────────────────────────────── */

  const flashIt = (kind: Flash["kind"]) => setFlash((f) => ({ kind, key: (f?.key ?? 0) + 1 }));

  const toggle = () => {
    const v = video.current!;
    if (soundBlocked) return unmute();
    if (finished) return go(0);
    if (v.paused) {
      v.play().catch(() => {});
      flashIt("play");
    } else {
      v.pause();
      flashIt("pause");
    }
  };

  const unmute = () => {
    const v = video.current!;
    v.muted = false;
    setMuted(false);
    setSoundBlocked(false);
    if (v.paused) v.play().catch(() => {});
  };

  const toggleMute = () => {
    const v = video.current!;
    if (soundBlocked || v.muted) return unmute();
    v.muted = true;
    setMuted(true);
  };

  const seekBy = (s: number) => {
    const v = video.current!;
    v.currentTime = clamp(v.currentTime + s, 0, (v.duration || item.duration) - 0.2);
    flashIt(s < 0 ? "back" : "fwd");
  };

  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else root.current?.requestFullscreen().catch(() => {});
  };

  /* Progress bar and the ambient glow, drawn every frame without re-rendering. */
  useEffect(() => {
    let raf = 0;
    let lastDraw = 0;
    const wide = matchMedia("(min-width: 1024px)").matches;
    const ctx = wide ? ambient.current?.getContext("2d") : null;
    const tick = (now: number) => {
      const v = video.current;
      if (v && fill.current && scrubbing === null) {
        const d = v.duration || item.duration;
        fill.current.style.transform = `scaleX(${d ? clamp(v.currentTime / d, 0, 1) : 0})`;
      }
      if (ctx && v && !v.paused && v.readyState >= 2 && now - lastDraw > 140) {
        lastDraw = now;
        try {
          ctx.drawImage(v, 0, 0, 48, 27);
        } catch {
          /* frame not ready */
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [item, scrubbing]);

  /* Mouse users: chrome fades out while watching, back on any movement. Touch keeps it up. */
  const wake = () => {
    setIdle(false);
    window.clearTimeout(idleTimer.current);
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) idleTimer.current = window.setTimeout(() => setIdle(true), 2600);
  };
  useEffect(() => () => window.clearTimeout(idleTimer.current), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "escape") requestClose();
      else if (k === " " || k === "k") {
        e.preventDefault();
        toggle();
      }
      else if (k === "arrowright" || k === "l") seekBy(k === "l" ? 10 : 5);
      else if (k === "arrowleft" || k === "j") seekBy(k === "j" ? -10 : -5);
      else if (k === "arrowdown" || k === "pagedown" || k === "arrowup" || k === "pageup") {
        e.preventDefault();
        go(index + (k === "arrowdown" || k === "pagedown" ? 1 : -1));
      }
      else if (k === "m") toggleMute();
      else if (k === "f") fullscreen();
      else return;
      wake();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ── Gestures ──────────────────────────────────────────────────────────────── */

  const onTap = (x: number, touch: boolean) => {
    const w = window.innerWidth;
    const zone = x < w * 0.3 ? -1 : x > w * 0.7 ? 1 : 0;
    const now = performance.now();
    const prev = lastTap.current;
    if (touch && zone !== 0 && prev && prev.zone === zone && now - prev.t < 320) {
      window.clearTimeout(prev.timer);
      lastTap.current = { t: now, zone }; // keep tapping to keep skipping
      return seekBy(zone * 10);
    }
    if (!touch || zone === 0) {
      lastTap.current = null;
      return toggle();
    }
    lastTap.current = { t: now, zone, timer: window.setTimeout(() => ((lastTap.current = null), toggle()), 260) };
  };

  const isUI = (t: EventTarget) => !!(t as HTMLElement).closest?.("[data-ui]");

  const onPointerDown = (e: RPointerEvent) => {
    if (isUI(e.target) || (e.pointerType === "mouse" && e.button !== 0)) return;
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId, on: false, samples: [{ y: e.clientY, t: performance.now() }] };
  };

  const onPointerMove = (e: RPointerEvent) => {
    if (e.pointerType === "mouse") wake();
    const d = drag.current;
    if (!d || d.id !== e.pointerId || busy.current) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.on) {
      if (Math.abs(dy) < 10 || Math.abs(dy) < Math.abs(dx) * 1.2) return;
      d.on = true;
      root.current?.setPointerCapture(e.pointerId);
    }
    d.samples.push({ y: e.clientY, t: performance.now() });
    if (d.samples.length > 6) d.samples.shift();
    const first = index === 0 && dy > 0; // pulling down on the first video closes the player
    const last = index === list.length - 1 && dy < 0;
    gsap.set(stage.current, {
      y: first ? dy * 0.6 : last ? dy * 0.3 : dy,
      scale: first ? 1 - Math.min(0.14, dy / 1800) : 1,
    });
  };

  const onPointerUp = (e: RPointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId) return;
    const dy = e.clientY - d.y;
    if (!d.on) {
      if (Math.abs(e.clientX - d.x) < 12 && Math.abs(dy) < 12) onTap(e.clientX, e.pointerType !== "mouse");
      return;
    }
    const a = d.samples[0];
    const b = d.samples[d.samples.length - 1];
    const vel = (b.y - a.y) / Math.max(1, b.t - a.t);
    const h = stage.current!.clientHeight;
    if ((dy < -h * 0.16 || vel < -0.45) && index < list.length - 1) go(index + 1);
    else if ((dy > h * 0.16 || vel > 0.45) && index > 0) go(index - 1);
    else if (index === 0 && (dy > h * 0.2 || vel > 0.6)) requestClose();
    else settle();
  };

  const onWheel = (e: React.WheelEvent) => {
    if (isUI(e.target) || Math.abs(e.deltaY) < 18 || performance.now() < wheelLock.current) return;
    wheelLock.current = performance.now() + 750;
    go(index + (e.deltaY > 0 ? 1 : -1));
  };

  /* Scrubbing: a tall invisible hit area around a thin bar. */
  const scrubFrac = (x: number) => {
    const r = track.current!.getBoundingClientRect();
    return clamp((x - r.left) / r.width, 0, 1);
  };
  const scrubMove = (x: number) => {
    const f = scrubFrac(x);
    if (fill.current) fill.current.style.transform = `scaleX(${f})`;
    setScrubbing(f * duration);
  };

  /* ── Render ────────────────────────────────────────────────────────────────── */

  const label = `${seriesName(series)} · ${item.label}`;
  const chromeHidden = idle && !paused && !finished;
  const shown = scrubbing ?? time;

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title}, ${label}`}
      tabIndex={-1}
      className={`fixed inset-0 z-[100] touch-none overflow-hidden overscroll-none bg-black text-white outline-none select-none ${chromeHidden ? "cursor-none" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => ((drag.current = null), settle())}
      onWheel={onWheel}
    >
      {/* Ambient light: the poster, and on big screens the live picture, blurred into the edges. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.poster} alt="" className="absolute inset-0 h-full w-full scale-125 object-cover opacity-45 blur-3xl saturate-150" />
        <canvas ref={ambient} width={48} height={27} className="absolute inset-0 hidden h-full w-full scale-110 opacity-60 blur-2xl saturate-150 lg:block" />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div ref={stage} className="absolute inset-0 will-change-transform">
        {([-1, 0, 1] as const).map((p) => {
          const v = list[index + p];
          if (!v) return null;
          return (
            <div key={p} className="absolute inset-0" style={{ transform: `translateY(${p * 100}%)` }}>
              <Frame v={v}>
                {p === 0 && (
                  <video
                    ref={video}
                    playsInline
                    preload="auto"
                    poster={v.poster}
                    className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
                    onLoadedData={() => setReady(true)}
                    onPlaying={() => setReady(true)}
                    onPlay={() => (setPaused(false), wake())}
                    onPause={() => (setPaused(true), save(), setIdle(false))}
                    onDurationChange={(e) => setMediaDuration(e.currentTarget.duration || 0)}
                    onTimeUpdate={(e) => {
                      const el = e.currentTarget;
                      setTime(el.currentTime);
                      if (performance.now() - lastSave.current > 4000) {
                        lastSave.current = performance.now();
                        save(el);
                      }
                    }}
                    onEnded={(e) => {
                      saveProgress(v.id, e.currentTarget.duration, e.currentTarget.duration);
                      if (index < list.length - 1) go(index + 1);
                      else setFinished(true);
                    }}
                  />
                )}
              </Frame>
            </div>
          );
        })}
      </div>

      {/* Tap feedback */}
      {flash && (
        <div
          key={flash.key}
          aria-hidden
          className={`rv-flash pointer-events-none absolute top-1/2 grid h-20 w-20 -translate-y-1/2 place-items-center rounded-full bg-black/45 backdrop-blur-md ${
            flash.kind === "back" ? "left-[12%]" : flash.kind === "fwd" ? "right-[12%]" : "left-1/2 -translate-x-1/2"
          }`}
        >
          {flash.kind === "play" && <IPlay className="ml-1 h-8 w-8" />}
          {flash.kind === "pause" && <IPause className="h-8 w-8" />}
          {flash.kind === "back" && <ISkip back />}
          {flash.kind === "fwd" && <ISkip />}
        </div>
      )}

      {/* Top bar */}
      <div
        data-chrome
        className={`absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-linear-to-b from-black/55 to-transparent px-3 pt-[max(env(safe-area-inset-top),12px)] pb-12 transition-opacity duration-500 sm:px-5 ${chromeHidden ? "opacity-0" : ""}`}
      >
        <button data-ui onClick={requestClose} aria-label="Close player" className="grid h-11 w-11 place-items-center rounded-full bg-white/12 backdrop-blur-md transition hover:bg-white/20 active:scale-90">
          <IClose />
        </button>
        {soundBlocked ? (
          <button data-ui onClick={unmute} className="rv-pop mt-1 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black active:scale-95">
            <IMuted className="h-4 w-4" /> Tap for sound
          </button>
        ) : (
          <p className="mt-3 truncate text-xs font-semibold tracking-[0.16em] text-white/70 uppercase">{seriesName(series)}</p>
        )}
        <button data-ui onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className="grid h-11 w-11 place-items-center rounded-full bg-white/12 backdrop-blur-md transition hover:bg-white/20 active:scale-90">
          {muted ? <IMuted /> : <IVolume />}
        </button>
      </div>

      {/* Where you are in the playlist; on big screens, buttons to move. */}
      <div data-chrome className={`absolute top-1/2 right-2 flex -translate-y-1/2 flex-col items-center gap-3 transition-opacity duration-500 sm:right-5 ${chromeHidden ? "opacity-0" : ""}`}>
        <button data-ui onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous" className="hidden h-11 w-11 place-items-center rounded-full bg-white/12 backdrop-blur-md transition hover:bg-white/20 disabled:opacity-30 lg:grid">
          <IChevron up />
        </button>
        <ol aria-hidden className="flex flex-col items-center gap-1.5">
          {list.map((v, i) => (
            <li key={v.id} className={`w-1 rounded-full transition-all duration-500 ${i === index ? "h-5 bg-white" : "h-1 bg-white/35"}`} />
          ))}
        </ol>
        <button data-ui onClick={() => go(index + 1)} disabled={index === list.length - 1} aria-label="Next" className="hidden h-11 w-11 place-items-center rounded-full bg-white/12 backdrop-blur-md transition hover:bg-white/20 disabled:opacity-30 lg:grid">
          <IChevron />
        </button>
      </div>

      {hint && (
        <div aria-hidden className="rv-hint pointer-events-none absolute inset-x-0 bottom-[38%] flex flex-col items-center gap-1 text-sm font-semibold">
          <IChevron up className="h-7 w-7" />
          Swipe up
        </div>
      )}

      {finished && (
        <div data-ui className="absolute inset-0 grid place-items-center bg-black/55 backdrop-blur-sm">
          <div className="rv-pop flex flex-col items-center gap-3">
            <button onClick={() => go(0)} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-black active:scale-95">
              <IReplay /> Watch again
            </button>
            <button onClick={requestClose} className="rounded-full px-6 py-3 font-semibold text-white/80 hover:text-white">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Bottom: what's playing and the controls */}
      <div
        data-chrome
        className={`absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/45 to-transparent px-4 pt-28 pb-[max(env(safe-area-inset-bottom),14px)] transition-opacity duration-500 sm:px-6 lg:px-10 ${chromeHidden ? "opacity-0" : ""}`}
      >
        {/* Big screens: keep the words in the space beside a tall video rather than over it. */}
        <div className={`max-w-2xl pr-10 ${item.shape === "portrait" ? "lg:max-w-[calc(50vw-17.5rem)]" : ""}`}>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-white/60 uppercase">{item.label}</p>
          <h2 className="display mt-1.5 text-[26px] leading-[1.05] sm:text-[34px]">{item.title}</h2>
          {item.summary && <p className="mt-2 line-clamp-2 text-[15px] leading-snug text-white/75">{item.summary}</p>}
        </div>

        <div data-ui className="mt-3 flex items-center gap-2 sm:gap-3">
          <button onClick={toggle} aria-label={paused ? "Play" : "Pause"} className="grid h-11 w-11 shrink-0 place-items-center rounded-full transition hover:bg-white/10 active:scale-90">
            {paused ? <IPlay className="ml-0.5 h-6 w-6" /> : <IPause className="h-6 w-6" />}
          </button>
          <div
            className="group relative flex-1 cursor-pointer py-4"
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(shown)}
            aria-valuetext={`${clock(shown)} of ${clock(duration)}`}
            tabIndex={0}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              scrubMove(e.clientX);
            }}
            onPointerMove={(e) => scrubbing !== null && scrubMove(e.clientX)}
            onPointerUp={(e) => {
              if (scrubbing === null) return;
              const v = video.current!;
              v.currentTime = scrubFrac(e.clientX) * (v.duration || duration);
              setTime(v.currentTime);
              setScrubbing(null);
            }}
            onPointerCancel={() => setScrubbing(null)}
          >
            <div ref={track} className={`relative overflow-hidden rounded-full bg-white/25 transition-[height] duration-200 ${scrubbing !== null ? "h-1.5" : "h-[3px] group-hover:h-1.5"}`}>
              <div ref={fill} className="absolute inset-0 origin-left scale-x-0 rounded-full bg-brand-bright" />
            </div>
            {scrubbing !== null && (
              <span className="absolute -top-7 -translate-x-1/2 rounded-md bg-white px-2 py-1 text-xs font-semibold text-black tabular-nums" style={{ left: `${(scrubbing / duration) * 100}%` }}>
                {clock(scrubbing)}
              </span>
            )}
          </div>
          <span className="shrink-0 text-xs text-white/70 tabular-nums">
            {clock(shown)} <span className="text-white/40">/ {clock(duration)}</span>
          </span>
          {canFullscreen && (
            <button onClick={fullscreen} aria-label="Full screen" className="hidden h-11 w-11 shrink-0 place-items-center rounded-full transition hover:bg-white/10 sm:grid">
              <IExpand />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** One video's picture box: its poster, and the playing video on top for the current one. */
function Frame({ v, children }: { v: Video; children?: React.ReactNode }) {
  const tall = v.shape === "portrait";
  return (
    <div className="absolute inset-0 flex items-center justify-center lg:px-24 lg:py-6">
      <div
        className="relative max-h-full max-w-full overflow-hidden bg-black/40 lg:rounded-2xl lg:shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
        style={tall ? { aspectRatio: "9 / 16", height: "100%" } : { aspectRatio: "16 / 9", width: "100%" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={v.poster} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain" />
        {children}
      </div>
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────────────────────────────── */

type I = { className?: string };
const s = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const IPlay = ({ className = "h-6 w-6" }: I) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden><path d="M7 4.8v14.4a1 1 0 0 0 1.53.85l11.4-7.2a1 1 0 0 0 0-1.7L8.53 3.95A1 1 0 0 0 7 4.8z" /></svg>
);
const IPause = ({ className = "h-6 w-6" }: I) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden><rect x="6" y="4.5" width="4" height="15" rx="1.2" /><rect x="14" y="4.5" width="4" height="15" rx="1.2" /></svg>
);
const IClose = ({ className = "h-5 w-5" }: I) => (
  <svg viewBox="0 0 24 24" className={className} {...s} aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
);
const IVolume = ({ className = "h-5 w-5" }: I) => (
  <svg viewBox="0 0 24 24" className={className} {...s} aria-hidden><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11" /></svg>
);
const IMuted = ({ className = "h-5 w-5" }: I) => (
  <svg viewBox="0 0 24 24" className={className} {...s} aria-hidden><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="M16 9.5l5 5M21 9.5l-5 5" /></svg>
);
const IExpand = ({ className = "h-5 w-5" }: I) => (
  <svg viewBox="0 0 24 24" className={className} {...s} aria-hidden><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
);
const IChevron = ({ up = false, className = "h-5 w-5" }: I & { up?: boolean }) => (
  <svg viewBox="0 0 24 24" className={className} {...s} aria-hidden><path d={up ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"} /></svg>
);
const IReplay = ({ className = "h-5 w-5" }: I) => (
  <svg viewBox="0 0 24 24" className={className} {...s} aria-hidden><path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5M4 4v4.5h4.5" /></svg>
);
const ISkip = ({ back = false }: { back?: boolean }) => (
  <span className="flex flex-col items-center leading-none">
    <svg viewBox="0 0 24 24" className={`h-6 w-6 ${back ? "" : "-scale-x-100"}`} {...s} aria-hidden><path d="M11 6l-6 6 6 6M19 6l-6 6 6 6" /></svg>
    <span className="mt-1 text-[11px] font-bold">10s</span>
  </span>
);
