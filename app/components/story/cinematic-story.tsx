"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Cam, Scene } from "@/lib/stories/types";
import type { Photo } from "@/lib/photos";
import { RoverMark } from "@/app/components/logo";
import { ArrowRight, Close } from "@/app/components/icons";

export type FilmScene = Scene & { photo?: Photo };

type Props = {
  slug: string;
  name: string;
  scenes: FilmScene[];
  sources: { label: string; url: string }[];
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const CENTER: Cam = { s: 1, x: 0.5, y: 0.5 };
/** Seconds autoplay takes for the whole film. */
const AUTOPLAY_SECONDS = 120;

/** Deterministic star field for the cruise scene. */
const STARS = Array.from({ length: 140 }, (_, i) => ({
  x: (i * 73.13) % 100,
  y: (i * 37.71 + (i % 7) * 11) % 100,
  r: 0.6 + ((i * 17) % 10) / 9,
  o: 0.35 + ((i * 29) % 10) / 16,
}));
const DUST = Array.from({ length: 70 }, (_, i) => ({
  x: (i * 41.3) % 100,
  y: (i * 23.9 + (i % 5) * 9) % 100,
  r: 1 + (i % 4),
  d: -((i * 1.37) % 9),
}));

/**
 * The film: a tall scroll track with one sticky stage. Every scene is a layer on the stage; the
 * scroll position drives which layers are visible, the camera over each photo (zoom and pan, with
 * the photo always covering the screen) and the parallax of the text. Everything per-frame is
 * written straight to the DOM in one rAF, so React only re-renders when the current scene changes.
 */
export default function CinematicStory({ slug, name, scenes, sources }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const cams = useRef<(HTMLDivElement | null)[]>([]);
  const texts = useRef<(HTMLDivElement | null)[]>([]);
  const counts = useRef<(HTMLSpanElement | null)[]>([]);
  const fxs = useRef<(HTMLDivElement | null)[]>([]);
  const bar = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const [cur, setCur] = useState(0);
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0, 1, 2]));
  const [playing, setPlaying] = useState(false);

  const { lens, starts, total } = useMemo(() => {
    const lens = scenes.map((s) => s.len ?? 1);
    const starts = lens.map((_, i) => lens.slice(0, i).reduce((a, b) => a + b, 0));
    return { lens, starts, total: lens.reduce((a, b) => a + b, 0) };
  }, [scenes]);

  // Scroll → scene float index → per-layer styles.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = -1;

    const frame = () => {
      raf = 0;
      const el = track.current;
      const st = stage.current;
      if (!el || !st) return;
      const vh = window.innerHeight;
      const range = el.offsetHeight - vh;
      const y = clamp(-el.getBoundingClientRect().top, 0, range);
      const p = range > 0 ? y / range : 0;
      const pos = p * total; // in screens
      // Scene float index: integer part = scene, fraction = progress through it.
      let i = 0;
      while (i < scenes.length - 1 && pos >= starts[i + 1]) i++;
      const f = i + clamp((pos - starts[i]) / lens[i]);
      const sw = st.clientWidth;
      const sh = st.clientHeight;

      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      if (hint.current) hint.current.style.opacity = String(1 - smooth(0.002, 0.02, p));

      scenes.forEach((sc, k) => {
        const layer = layers.current[k];
        if (!layer) return;
        const local = f - k; // <0 before, 0..1 during, >1 after
        const fadeIn = k === 0 ? 1 : smooth(-0.14, 0.06, local);
        const fadeOut = k === scenes.length - 1 ? 1 : 1 - smooth(0.94, 1.14, local);
        const vis = fadeIn * fadeOut;
        layer.style.opacity = vis.toFixed(3);
        layer.style.visibility = vis > 0.001 ? "visible" : "hidden";
        if (vis <= 0.001) return;

        const t = easeInOut(clamp((local + 0.14) / 1.28));
        // Camera: keep the chosen point centred, but never let the photo's edge into view.
        const cam = cams.current[k];
        if (cam && sc.photo && (sc.mode ?? "zoom") === "zoom") {
          const a = reduce ? CENTER : (sc.from ?? CENTER);
          const b = reduce ? CENTER : (sc.to ?? CENTER);
          const w0 = sc.photo.width ?? 1600;
          const h0 = sc.photo.height ?? 1000;
          const cover = Math.max(sw / w0, sh / h0);
          const bw = w0 * cover;
          const bh = h0 * cover;
          const s = lerp(a.s, b.s, t);
          const cx = lerp(a.x, b.x, t);
          const cy = lerp(a.y, b.y, t);
          const W = bw * s;
          const H = bh * s;
          const left = clamp(sw / 2 - cx * W, sw - W, 0);
          const top = clamp(sh / 2 - cy * H, sh - H, 0);
          cam.style.width = `${bw}px`;
          cam.style.height = `${bh}px`;
          cam.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
        } else if (cam) {
          // Framed prints and drawn scenes drift gently.
          cam.style.transform = reduce ? "none" : `scale(${lerp(1, 1.08, t).toFixed(4)})`;
        }

        const fx = fxs.current[k];
        if (fx) fx.style.setProperty("--t", t.toFixed(4));

        const tx = texts.current[k];
        if (tx) {
          const show = (k === 0 ? 1 : smooth(0.04, 0.2, local)) * (k === scenes.length - 1 ? 1 : 1 - smooth(0.8, 0.96, local));
          tx.style.opacity = show.toFixed(3);
          tx.style.transform = reduce ? "none" : `translate3d(0, ${((0.45 - local) * 70).toFixed(1)}px, 0)`;
        }

        const c = counts.current[k];
        if (c && sc.count) c.textContent = lerp(sc.count.from, sc.count.to, smooth(0.15, 0.7, local)).toFixed(sc.count.decimals);
      });

      if (i !== last) {
        last = i;
        setCur(i);
        // Load photos a few scenes ahead; keep what has loaded.
        setMounted((m) => {
          const want = [i - 1, i, i + 1, i + 2, i + 3].filter((x) => x >= 0 && x < scenes.length && !m.has(x));
          if (!want.length) return m;
          const n = new Set(m);
          want.forEach((x) => n.add(x));
          return n;
        });
      }
    };

    const request = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    frame();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, [scenes, starts, lens, total]);

  // Autoplay: scroll the film at a steady pace until the reader takes over.
  useEffect(() => {
    if (!playing) return;
    const el = track.current;
    if (!el) return;
    let raf = 0;
    let prev = performance.now();
    const speed = (el.offsetHeight - window.innerHeight) / AUTOPLAY_SECONDS;
    const stop = () => setPlaying(false);
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const end = el.offsetTop + el.offsetHeight - window.innerHeight;
      if (window.scrollY >= end - 1) return stop();
      window.scrollTo({ top: window.scrollY + speed * dt, behavior: "instant" });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const opts = { passive: true } as const;
    window.addEventListener("wheel", stop, opts);
    window.addEventListener("touchstart", stop, opts);
    window.addEventListener("keydown", stop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    };
  }, [playing]);

  const goTo = (k: number) => {
    const el = track.current;
    if (!el) return;
    const range = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + ((starts[k] + 0.3 * lens[k]) / total) * range, behavior: "smooth" });
  };

  // Year ticks on the progress rail; labels thinned so neighbours never overlap.
  const years = [...new Set(scenes.map((s) => s.year))].map((y) => {
    const k = scenes.findIndex((s) => s.year === y);
    return { y, k, at: (starts[k] / total) * 100 };
  });
  let lastLabel = -100;
  const ticks = years.map((t) => {
    const label = t.at - lastLabel >= 6;
    if (label) lastLabel = t.at;
    return { ...t, label };
  });
  const scene = scenes[cur];

  return (
    <div className="bg-black text-white">
      <h1 className="sr-only">{name}: the story</h1>
      {/* Screen readers get the whole story as text; the stage itself is decorative. */}
      <ol className="sr-only">
        {scenes.map((s) => (
          <li key={s.id}>
            <h2>{s.title}</h2>
            <p>{s.date}</p>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>

      <div ref={track} className="relative" style={{ height: `${(total + 1) * 100}svh` }}>
        <div ref={stage} className="sticky top-0 h-[100svh] overflow-hidden" aria-hidden>
          {scenes.map((sc, k) => {
            const mode = sc.mode ?? "zoom";
            const p = sc.photo;
            const wide = p?.width && p?.height ? p.width / p.height > 2.4 : false;
            const deep = Math.max(sc.from?.s ?? 1, sc.to?.s ?? 1) > 1.8;
            return (
              <div
                key={sc.id}
                ref={(el) => {
                  layers.current[k] = el;
                }}
                className="absolute inset-0 overflow-hidden"
                style={{ opacity: k === 0 ? 1 : 0, visibility: k === 0 ? "visible" : "hidden" }}
              >
                {/* Background */}
                {mode === "zoom" && p && (
                  <div
                    ref={(el) => {
                      cams.current[k] = el;
                    }}
                    className="absolute top-0 left-0 origin-top-left will-change-transform"
                  >
                    {mounted.has(k) && (
                      <Image src={p.src} alt="" fill priority={k < 2} unoptimized={wide || deep} sizes="100vw" className="object-cover" />
                    )}
                  </div>
                )}
                {mode === "frame" && p && (
                  <>
                    {mounted.has(k) && <Image src={p.src} alt="" fill sizes="50vw" className="scale-125 object-cover opacity-30 blur-2xl" />}
                    <div
                      ref={(el) => {
                        cams.current[k] = el;
                      }}
                      className="absolute inset-x-6 top-[12%] bottom-[40%] will-change-transform sm:inset-x-[12%] lg:top-[10%] lg:right-[8%] lg:bottom-[14%] lg:left-[46%]"
                    >
                      {mounted.has(k) && <Image src={p.src} alt="" fill sizes="(min-width:1024px) 46vw, 90vw" className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.7)]" />}
                    </div>
                  </>
                )}
                {mode === "space" && (
                  <div
                    ref={(el) => {
                      fxs.current[k] = el;
                    }}
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,#1a1030_0%,#000_70%)]"
                  >
                    <div className="absolute inset-0 origin-center" style={{ transform: "scale(calc(1 + var(--t, 0) * 1.4))" }}>
                      {STARS.map((s, n) => (
                        <span key={n} className="absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r, opacity: s.o }} />
                      ))}
                    </div>
                    <span
                      className="absolute top-[38%] left-[14%] h-3 w-3 rounded-full bg-[#5aa9ff] shadow-[0_0_14px_#5aa9ff]"
                      style={{ transform: "scale(calc(1 - var(--t, 0)))", opacity: "calc(1 - var(--t, 0))" }}
                    />
                    <span
                      className="absolute top-1/2 left-[72%] block aspect-square w-[46vmin] rounded-full bg-[radial-gradient(circle_at_35%_35%,#f0a070_0%,#c1532a_38%,#5a1d0c_72%,#140503_100%)] shadow-[0_0_80px_rgba(230,110,60,0.35)]"
                      style={{ transform: "translate(-50%, -50%) scale(calc(0.04 + var(--t, 0) * var(--t, 0) * 1.5))" }}
                    />
                  </div>
                )}
                {mode === "black" && <div className="absolute inset-0 bg-black" />}

                {/* Foreground effects */}
                {sc.fx && mode !== "space" && (
                  <div
                    ref={(el) => {
                      fxs.current[k] = el;
                    }}
                    className="pointer-events-none absolute inset-0"
                  >
                    {sc.fx === "bounce" && (
                      <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                        <path
                          d="M-20 120 Q 90 -40 200 300 Q 280 120 360 330 Q 420 200 480 350 Q 530 260 575 365 Q 610 300 645 372 Q 672 330 698 378 Q 716 352 734 382 Q 746 366 758 385 L 770 386"
                          fill="none"
                          stroke="#ffd18a"
                          strokeWidth="3"
                          strokeLinecap="round"
                          pathLength={1}
                          strokeDasharray="1"
                          style={{ strokeDashoffset: "calc(1 - min(1, var(--t, 0) * 1.6))", vectorEffect: "non-scaling-stroke" }}
                        />
                      </svg>
                    )}
                    {sc.fx === "dust" && (
                      <div className="absolute inset-0" style={{ opacity: "calc(0.25 + var(--t, 0) * 0.75)" }}>
                        <div className="absolute inset-0 bg-[#7a4a22]" style={{ opacity: "calc(var(--t, 0) * 0.35)" }} />
                        {DUST.map((d, n) => (
                          <span key={n} className="film-dust absolute rounded-full bg-[#e8b27a]" style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.r, height: d.r, animationDelay: `${d.d}s` }} />
                        ))}
                      </div>
                    )}
                    {sc.fx === "target" && (
                      <span className="absolute top-1/2 left-1/2 -mt-9 -ml-9 h-18 w-18 rounded-full border-2 border-brand-bright shadow-[0_0_0_4px_rgba(122,87,255,0.25)]" style={{ opacity: "calc((var(--t, 0) - 0.72) * 4)" }} />
                    )}
                    {sc.fx === "darken" && <div className="absolute inset-0 bg-black" style={{ opacity: "calc(var(--t, 0) * 0.5)" }} />}
                    {sc.fx === "rings" && (
                      <div className="absolute top-[26%] left-1/2 lg:top-1/2 lg:left-[18%]">
                        {[0, 1, 2, 3].map((n) => (
                          <span key={n} className="film-ring absolute -top-6 -left-6 h-12 w-12 rounded-full border-2 border-brand-bright" style={{ animationDelay: `${n * 0.9}s` }} />
                        ))}
                        <span className="absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full bg-[#5aa9ff]" />
                      </div>
                    )}
                  </div>
                )}

                {/* Scrim for legibility */}
                {mode !== "black" && <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.25)_45%,transparent_70%)] lg:bg-[linear-gradient(90deg,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.25)_45%,transparent_65%),linear-gradient(0deg,rgba(0,0,0,0.5)_0%,transparent_30%)]" />}

                {/* Text */}
                <div
                  ref={(el) => {
                    texts.current[k] = el;
                  }}
                  className={`absolute will-change-transform ${
                    k === 0
                      ? "inset-x-5 bottom-[30%] text-center sm:inset-x-[10%]"
                      : mode === "black"
                        ? "inset-x-5 top-1/2 -mt-20 text-center sm:inset-x-[18%]"
                        : "inset-x-5 bottom-28 sm:left-10 sm:right-auto sm:max-w-xl lg:bottom-auto lg:top-1/2 lg:left-[7%] lg:-mt-36 lg:max-w-[560px]"
                  }`}
                  style={{ opacity: k === 0 ? 1 : 0 }}
                >
                  <p className="font-mono text-xs tracking-[0.14em] text-white/75 uppercase sm:text-sm">{sc.date}</p>
                  <h2 className={`display mt-3 [text-shadow:0_2px_30px_rgba(0,0,0,0.5)] ${k === 0 ? "text-6xl sm:text-8xl lg:text-[150px]" : "text-[44px] leading-[0.95] sm:text-6xl lg:text-[76px]"}`}>{sc.title}</h2>
                  {sc.count && (
                    <p className="mt-4 flex items-baseline gap-2 font-mono" style={{ justifyContent: mode === "black" ? "center" : undefined }}>
                      <span
                        ref={(el) => {
                          counts.current[k] = el;
                        }}
                        className="display text-5xl text-brand-bright tabular-nums sm:text-6xl"
                      >
                        {sc.count.from.toFixed(sc.count.decimals)}
                      </span>
                      <span className="text-lg">{sc.count.unit}</span>
                      <span className="text-xs text-white/60 uppercase">{sc.count.label}</span>
                    </p>
                  )}
                  <p className={`mt-4 text-[17px] leading-relaxed text-white/90 sm:text-xl ${k === 0 ? "mx-auto max-w-2xl" : ""}`}>{sc.text}</p>
                </div>
              </div>
            );
          })}

          {/* Chrome */}
          <div className="pointer-events-none absolute inset-0 z-10">
            <div className="pointer-events-auto absolute inset-x-4 top-4 flex items-center justify-between gap-3 sm:inset-x-8 sm:top-6">
              <Link href={`/heroes/${slug}`} className="flex items-center gap-2.5 text-white/90 hover:text-white">
                <RoverMark className="h-7 w-auto" />
                <span className="font-mono text-xs tracking-[0.12em] uppercase">
                  Rover Villa <span className="text-white/50">/ {name}</span>
                </span>
              </Link>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPlaying(!playing)}
                  className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/25"
                  aria-pressed={playing}
                >
                  {playing ? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d="M7 5h3v14H7zM14 5h3v14h-3z" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></svg>
                  )}
                  {playing ? "Pause" : "Play"}
                </button>
                <Link href={`/heroes/${slug}`} aria-label="Close story" className="rounded-full bg-white/15 p-2 backdrop-blur hover:bg-white/25">
                  <Close />
                </Link>
              </div>
            </div>

            <div ref={hint} className="absolute inset-x-0 bottom-16 flex flex-col items-center gap-2 font-mono text-xs tracking-[0.14em] text-white/80 uppercase">
              Scroll, or press play
              <span className="film-hint block h-10 w-px bg-white/70" />
            </div>

            <div className="pointer-events-auto absolute inset-x-4 bottom-4 sm:inset-x-8 sm:bottom-6">
              <div className="mb-3 flex items-end justify-between gap-4 font-mono text-[11px] text-white/70">
                <span>
                  {String(cur + 1).padStart(2, "0")} / {scenes.length} · {scene.date}
                </span>
                {scene.photo && !scene.photo.ai && (
                  <a href={scene.photo.source} target="_blank" rel="noopener noreferrer" className="hidden max-w-[50%] truncate text-right hover:text-white sm:block">
                    {scene.note ? `${scene.note} · ` : ""}
                    {scene.photo.title} · {scene.photo.credit}
                  </a>
                )}
              </div>
              <div className="relative h-6">
                <div className="absolute inset-x-0 top-1/2 h-px bg-white/25" />
                <div ref={bar} className="absolute inset-x-0 top-1/2 h-0.5 origin-left -translate-y-px bg-brand-bright" style={{ transform: "scaleX(0)" }} />
                {ticks.map(({ y, k, at, label }) => (
                  <button
                    key={y}
                    onClick={() => goTo(k)}
                    aria-label={`Jump to ${y}`}
                    className={`absolute top-0 -translate-x-1/2 font-mono text-[10px] sm:text-[11px] ${scene.year === y ? "text-white" : "text-white/55 hover:text-white"}`}
                    style={{ left: `${at}%` }}
                  >
                    <span className="mx-auto mb-0.5 block h-1.5 w-1.5 rounded-full bg-current" />
                    <span className={label || scene.year === y ? "hidden sm:inline" : "hidden"}>{y}</span>
                  </button>
                ))}
              </div>
              {scene.photo && !scene.photo.ai && (
                <p className="mt-2 truncate font-mono text-[10px] text-white/55 sm:hidden">
                  {scene.note ? `${scene.note} · ` : ""}
                  {scene.photo.credit}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* After the credits */}
      <section className="bg-black px-5 pt-10 pb-28 sm:px-10 lg:pb-16">
        <div className="mx-auto max-w-4xl border-t border-white/15 pt-10">
          <p className="font-mono text-xs tracking-[0.14em] text-white/60 uppercase">The end</p>
          <h2 className="display mt-3 text-4xl sm:text-5xl">Thank you, {name}.</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/heroes/${slug}`} className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold hover:bg-brand-deep">
              Explore {name}&apos;s page <ArrowRight />
            </Link>
            <Link href="/story" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold hover:border-white">
              All stories
            </Link>
            <Link href={`/heroes/${slug}#tributes`} className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold hover:border-white">
              Leave a tribute
            </Link>
          </div>
          <h3 className="mt-12 font-mono text-xs tracking-[0.14em] text-white/60 uppercase">Sources</h3>
          <ul className="mt-3 space-y-1.5 text-sm">
            {sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-brand-bright hover:underline">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-2xl text-xs leading-relaxed text-white/55">
            Every photo is from NASA&apos;s public archive and credited on screen; the cruise and silence scenes are drawn, and the bouncing path is an illustration, not to scale. NASA does not endorse this site.
          </p>
        </div>
      </section>
    </div>
  );
}
