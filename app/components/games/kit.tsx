"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Small toolkit shared by the mini-games: a crisp full-size canvas, an animation loop,
 * a seeded random generator, and the overlay cards for the start and end screens.
 */

/** Calls `cb(dt, t)` every frame while `running`, with dt in seconds (capped, so a hidden tab can't jump). */
export function useFrame(cb: (dt: number, t: number) => void, running: boolean) {
  const ref = useRef(cb);
  useLayoutEffect(() => {
    ref.current = cb;
  });
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ref.current(dt, now / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);
}

/** A canvas that fills its box at the screen's pixel density. `draw()` gets a context in CSS pixels. */
export function useCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const size = useRef({ w: 1, h: 1, dpr: 1 });
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const fit = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = Math.max(1, Math.round(r.width * dpr));
      c.height = Math.max(1, Math.round(r.height * dpr));
      size.current = { w: r.width, h: r.height, dpr };
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);
  const ctx = () => {
    const c = ref.current;
    const g = c?.getContext("2d");
    if (!g) return null;
    g.setTransform(size.current.dpr, 0, 0, size.current.dpr, 0, 0);
    return g;
  };
  return { ref, size, ctx };
}

/** Deterministic random numbers, so a level or a crater field is the same every time it's drawn. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stable pseudo-random number for a grid cell. */
export const hash2 = (x: number, y: number, s = 0) => {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The play area: a dark rounded screen that keeps its shape, takes touch, and never scrolls the page. */
export const stage = "relative isolate overflow-hidden rounded-[24px] bg-night text-white select-none touch-none sm:rounded-[28px]";

export const btn = {
  primary: "inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-ink transition hover:bg-white/85 active:scale-95",
  ghost: "inline-flex items-center justify-center gap-2 rounded-full bg-white/12 px-5 py-3 text-[15px] font-semibold text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/20 active:scale-95",
  brand: "inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-brand-deep active:scale-95",
};

/** The card over the stage at the start and the end of a game. */
export function Overlay({ kicker, title, children, actions }: { kicker?: string; title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center overflow-y-auto bg-night/70 p-5 backdrop-blur-[6px]">
      <div className="w-full max-w-md text-center">
        {kicker && <p className="font-mono text-[12px] tracking-[0.16em] text-brand-glow uppercase">{kicker}</p>}
        <h2 className="display mt-2 text-[32px] sm:text-[44px]">{title}</h2>
        {children && <div className="mt-3 text-[15px] leading-relaxed text-white/80 sm:text-base">{children}</div>}
        {actions && <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}

/** A big number in a result card. */
export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/8 px-3 py-3 ring-1 ring-white/10">
      <p className="display text-[26px] sm:text-3xl">{value}</p>
      <p className="mt-0.5 text-[12px] leading-tight text-white/60">{label}</p>
    </div>
  );
}

/** A small readout pinned to the stage. */
export function Readout({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-black/35 px-3 py-1.5 ring-1 ring-white/10 backdrop-blur-md ${className}`}>
      <p className="font-mono text-[10px] tracking-[0.14em] text-white/55 uppercase">{label}</p>
      <p className="font-mono text-[15px] font-medium tabular-nums">{children}</p>
    </div>
  );
}
