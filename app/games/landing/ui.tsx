"use client";

import { useEffect, useImperativeHandle, useRef, useState, type ReactNode, type Ref } from "react";
import type { GameAudio } from "./audio";
import type { Line } from "./story";
import type { DescentFrame, DriveFrame } from "./world";

// ---------- radio ----------

export type RadioHandle = { say: (lines: Line[] | string, opts?: { clear?: boolean; hold?: number }) => void; clear: () => void };

/**
 * Ground's voice: lines typed out one at a time, opened and closed with quindar tones.
 * Click to finish a line or skip to the next.
 */
export function Radio({ ref, audio: getAudio, big = false, onIdle }: { ref?: Ref<RadioHandle>; audio: () => GameAudio | null; big?: boolean; onIdle?: () => void }) {
  const queue = useRef<{ line: Line; hold: number }[]>([]);
  const [cur, setCur] = useState<{ line: Line; shown: number; hold: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const live = useRef(false);
  const active = useRef(false);
  const timer = useRef<number>(0);
  const hideTimer = useRef<number>(0);
  const onIdleRef = useRef(onIdle);
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const next = () => {
    const audio = getAudio();
    window.clearTimeout(timer.current);
    const n = queue.current.shift();
    if (!n) {
      active.current = false;
      if (live.current) {
        audio?.quindar(false);
        audio?.setRadio(false);
        live.current = false;
      }
      onIdleRef.current?.();
      if (!big) hideTimer.current = window.setTimeout(() => setVisible(false), 2600);
      return;
    }
    if (!live.current && n.line.who === "ground") {
      audio?.quindar(true);
      audio?.setRadio(true);
      live.current = true;
    }
    window.clearTimeout(hideTimer.current);
    active.current = true;
    setVisible(true);
    setCur({ line: n.line, shown: 0, hold: n.hold });
  };

  // Type the current line.
  useEffect(() => {
    if (!cur) return;
    const len = cur.line.text.length;
    if (cur.shown < len) {
      timer.current = window.setTimeout(() => {
        setCur((c) => (c ? { ...c, shown: Math.min(len, c.shown + 2) } : c));
        if (cur.shown % 10 === 0) getAudio()?.play("type");
      }, 26);
    } else {
      timer.current = window.setTimeout(next, cur.hold + len * 22);
    }
    return () => window.clearTimeout(timer.current);
    // `next` reads refs only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur]);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      window.clearTimeout(hideTimer.current);
      if (live.current) getAudio()?.setRadio(false);
    },
    [getAudio],
  );

  useImperativeHandle(ref, () => ({
    say(lines, opts) {
      const list = typeof lines === "string" ? [{ who: "ground" as const, text: lines }] : lines;
      if (opts?.clear) queue.current = [];
      queue.current.push(...list.map((line) => ({ line, hold: opts?.hold ?? 1400 })));
      if (!active.current || opts?.clear) next();
    },
    clear() {
      queue.current = [];
      active.current = false;
      window.clearTimeout(timer.current);
      setCur(null);
      setVisible(false);
      if (live.current) {
        getAudio()?.setRadio(false);
        live.current = false;
      }
    },
  }));

  if (!cur) return null;
  const note = cur.line.who === "note";
  return (
    <button
      type="button"
      onClick={() => {
        if (cur.shown < cur.line.text.length) setCur({ ...cur, shown: cur.line.text.length });
        else next();
      }}
      aria-live="polite"
      className={`block w-full text-left transition-opacity duration-500 ${visible ? "opacity-100" : "pointer-events-none opacity-0"} ${
        big ? "max-w-2xl" : "max-w-md rounded-2xl bg-black/55 p-3.5 ring-1 ring-white/10 backdrop-blur-md sm:p-4"
      }`}
    >
      <span className={`flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] uppercase ${note ? "text-amber-200/80" : "text-cyan-200/80"}`}>
        {!note && <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />}
        {note ? "Note" : "Ground"}
      </span>
      <span className={`mt-1.5 block ${big ? "display text-2xl leading-snug sm:text-[2rem] sm:leading-snug" : "text-[15px] leading-relaxed"} ${note ? "text-amber-50/90" : "text-white"}`}>
        {cur.line.text.slice(0, cur.shown)}
        <span className="opacity-0">{cur.line.text.slice(cur.shown)}</span>
      </span>
      <span className="sr-only">{cur.line.text}</span>
    </button>
  );
}

// ---------- descent HUD ----------

export type HudHandle = { update: (f: DescentFrame) => void };

/** Instruments for the landing, updated straight from the render loop (no React re-render). */
export function DescentHud({ ref, mars, compact }: { ref?: Ref<HudHandle>; mars: boolean; compact: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const cache = useRef<Record<string, HTMLElement | SVGElement | null>>({});
  useImperativeHandle(ref, () => ({
    update(f) {
      const root = box.current;
      if (!root) return;
      const e = new Proxy(cache.current, {
        get: (c, k: string) => (c[k] ??= root.querySelector<HTMLElement | SVGElement>(`[data-k="${k}"]`)),
      });
      const down = -f.vy;
      const near = f.alt < 150;
      // Green while at or under the suggested speed for this height, amber a bit over, red well over.
      const over = down - f.target;
      const col = down <= 0.2 ? "#fff" : over <= 1.5 ? "#6ee7b7" : over <= 5 ? "#fcd34d" : "#fda4af";
      if (e.alt) e.alt.textContent = f.alt >= 100 ? f.alt.toFixed(0) : f.alt.toFixed(1);
      if (e.vy) {
        e.vy.textContent = `${down >= 0 ? "↓" : "↑"} ${Math.abs(down).toFixed(1)}`;
        (e.vy as HTMLElement).style.color = col;
      }
      if (e.vh) {
        e.vh.textContent = f.vh.toFixed(1);
        (e.vh as HTMLElement).style.color = near && f.vh > 2 ? "#fda4af" : "#fff";
      }
      if (e.dist) {
        e.dist.textContent = f.dist.toFixed(0);
        (e.dist as HTMLElement).style.color = f.dist <= 40 ? "#67e8f9" : "#fff";
      }
      if (e.fuel) {
        (e.fuel as HTMLElement).style.width = `${Math.max(0, Math.min(100, f.fuel))}%`;
        (e.fuel as HTMLElement).style.background = f.fuel < 20 ? "#fb7185" : f.fuel < 40 ? "#fbbf24" : "#a78bfa";
      }
      if (e.fuelN) e.fuelN.textContent = `${Math.max(0, f.fuel).toFixed(0)}%`;
      if (e.vbar) {
        const h = Math.min(1, down / 32);
        (e.vbar as HTMLElement).style.transform = `scaleY(${Math.max(0, h)})`;
        (e.vbar as HTMLElement).style.background = col;
      }
      if (e.vtgt) (e.vtgt as HTMLElement).style.bottom = `${Math.min(1, f.target / 32) * 100}%`;
      if (e.tgt) e.tgt.textContent = f.target.toFixed(0);
      if (e.mode) {
        e.mode.textContent = f.pilot ? "Expert pilot" : "Drift hold on";
        (e.mode as HTMLElement).style.color = "rgba(255,255,255,0.5)";
      }
      if (e.thr) (e.thr as HTMLElement).style.opacity = f.thrust ? "1" : "0.15";
      // Radar: 250 m to the edge; forward is up.
      const k = 0.4;
      const c = (x: number, z: number) => {
        let px = x * k;
        let py = -z * k;
        const r = Math.hypot(px, py);
        if (r > 94) {
          px *= 94 / r;
          py *= 94 / r;
        }
        return [px, py];
      };
      const [lx, ly] = c(f.px, f.pz);
      e.dot?.setAttribute("transform", `translate(${lx} ${ly})`);
      const [ix, iy] = c(f.ix, f.iz);
      e.imp?.setAttribute("transform", `translate(${ix} ${iy})`);
      e.vel?.setAttribute("x1", String(lx));
      e.vel?.setAttribute("y1", String(ly));
      e.vel?.setAttribute("x2", String(lx + f.vx * 5 * k));
      e.vel?.setAttribute("y2", String(ly - f.vz * 5 * k));
      const [mx, my] = c(f.mx, f.mz);
      e.mach?.setAttribute("transform", `translate(${mx} ${my})`);
      if (e.wind) {
        (e.wind as HTMLElement).style.transform = `rotate(${(f.windAng * 180) / Math.PI}deg)`;
        (e.wind as HTMLElement).style.opacity = String(0.35 + Math.min(1, f.wind) * 0.65);
      }
    },
  }));

  return (
    <div ref={box} className={`pointer-events-none flex flex-col items-end gap-3 font-mono text-white ${compact ? "text-[11px]" : "text-xs"}`}>
      <div className={`rounded-2xl bg-black/50 ring-1 ring-white/10 backdrop-blur-md ${compact ? "w-44 p-3" : "w-60 p-4"}`}>
        <div className="flex items-end justify-between">
          <div>
            <p className="tracking-[0.14em] text-white/55 uppercase">Altitude</p>
            <p className={`${compact ? "text-3xl" : "text-5xl"} font-medium tabular-nums`}>
              <span data-k="alt">–</span>
              <span className="ml-1 text-base text-white/50">m</span>
            </p>
          </div>
          <div className="relative flex h-16 w-3 items-end rounded-full bg-white/10" aria-hidden title="Descent speed; the line is the suggested speed">
            <div data-k="vbar" className="h-full w-full origin-bottom rounded-full" style={{ transform: "scaleY(0)" }} />
            <div data-k="vtgt" className="absolute -inset-x-1.5 h-0.5 rounded-full bg-white" style={{ bottom: "0%" }} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
          <p className="text-white/55">
            Down m/s <span className="text-white/35">· aim <span data-k="tgt">–</span></span>
          </p>
          <p data-k="vy" className="text-right text-base tabular-nums">–</p>
          <p className="text-white/55">Side m/s</p>
          <p data-k="vh" className="text-right text-base tabular-nums">–</p>
          <p className="text-white/55">To zone m</p>
          <p data-k="dist" className="text-right text-base tabular-nums">–</p>
        </div>
        <p data-k="mode" className="mt-2 text-[10px] tracking-[0.12em] uppercase">–</p>
        <div className="mt-2">
          <div className="flex justify-between text-white/55">
            <span>
              Fuel <span data-k="thr" className="ml-1 text-amber-300" style={{ opacity: 0.15 }}>● burn</span>
            </span>
            <span data-k="fuelN" className="tabular-nums">100%</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-white/10">
            <div data-k="fuel" className="h-1.5 rounded-full" style={{ width: "100%", background: "#a78bfa" }} />
          </div>
        </div>
      </div>
      <div className={`relative rounded-full bg-black/45 ring-1 ring-white/10 backdrop-blur-md ${compact ? "h-32 w-32" : "h-44 w-44"}`}>
        <svg viewBox="-100 -100 200 200" className="h-full w-full" aria-label="Radar: you, the landing zone and the machine">
          <circle r="98" fill="none" stroke="rgba(255,255,255,0.12)" />
          <circle r="60" fill="none" stroke="rgba(255,255,255,0.07)" />
          <circle r="16" fill="rgba(103,232,249,0.12)" stroke="#67e8f9" strokeWidth="1.5" />
          <line x1="-98" y1="0" x2="98" y2="0" stroke="rgba(255,255,255,0.06)" />
          <line x1="0" y1="-98" x2="0" y2="98" stroke="rgba(255,255,255,0.06)" />
          <g data-k="mach">
            <rect x="-4" y="-4" width="8" height="8" transform="rotate(45)" fill="#a78bfa" />
          </g>
          <g data-k="imp">
            <path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke="#fcd34d" strokeWidth="2" />
          </g>
          <line data-k="vel" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeDasharray="3 3" />
          <g data-k="dot">
            <circle r="5" fill="#fff" />
          </g>
        </svg>
        <p className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.2em] text-white/40">AHEAD</p>
        {mars && (
          <div className="absolute right-1 bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/40" title="Wind">
            <svg data-k="wind" viewBox="0 0 24 24" className="h-5 w-5 text-amber-200" aria-hidden>
              <path d="M12 3l4 7h-3v11h-2V10H8z" fill="currentColor" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- drive HUD ----------

export type CompassHandle = { update: (f: DriveFrame) => void };

/** A compass strip across the top: the machine and the echoes, with distances. */
export function Compass({ ref, name }: { ref?: Ref<CompassHandle>; name: string }) {
  const marks = useRef<(HTMLDivElement | null)[]>([]);
  const dists = useRef<(HTMLSpanElement | null)[]>([]);
  const speed = useRef<HTMLSpanElement | null>(null);
  useImperativeHandle(ref, () => ({
    update(f) {
      const xs: { i: number; x: number }[] = [];
      f.targets.forEach((t, i) => {
        const m = marks.current[i];
        if (!m) return;
        const half = m.parentElement ? m.parentElement.clientWidth / 2 : 160;
        const b = Math.max(-1, Math.min(1, t.bearing / (Math.PI / 2)));
        const x = b * (half - 14);
        m.style.transform = `translateX(${x}px)`;
        m.style.opacity = t.done ? "0" : Math.abs(t.bearing) > Math.PI / 2 ? "0.55" : "1";
        const d = dists.current[i];
        if (d) d.textContent = `${t.dist.toFixed(0)} m`;
        if (!t.done) xs.push({ i, x });
      });
      // Labels that would overlap drop to a second row.
      xs.sort((a, b) => a.x - b.x);
      let lastTop = -1e9;
      let lastLow = -1e9;
      for (const { i, x } of xs) {
        const d = dists.current[i];
        if (!d) continue;
        const low = x - lastTop < 44 && x - lastLow >= 44;
        d.style.transform = low ? "translateY(11px)" : "";
        if (low) lastLow = x;
        else lastTop = x;
      }
      if (speed.current) speed.current.textContent = `${Math.abs(f.speed * 3.6).toFixed(0)} km/h`;
    },
  }));
  return (
    <div className="pointer-events-none w-[min(92vw,420px)]">
      <div className="relative h-14 overflow-hidden rounded-2xl bg-black/50 ring-1 ring-white/10 backdrop-blur-md">
        <div className="absolute top-0 left-1/2 h-2 w-px bg-white/50" />
        <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/50 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/50 to-transparent" />
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            ref={(n) => {
              marks.current[i] = n;
            }}
            className="absolute top-1.5 left-1/2 -ml-[14px] flex w-7 flex-col items-center"
            style={{ opacity: 0 }}
          >
            {i === 0 ? (
              <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
                <rect x="5" y="5" width="10" height="10" transform="rotate(45 10 10)" fill="#a78bfa" />
              </svg>
            ) : (
              <span className="mt-1 h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9]" />
            )}
            <span
              ref={(n) => {
                dists.current[i] = n;
              }}
              className="mt-0.5 font-mono text-[10px] whitespace-nowrap text-white/85"
            />
          </div>
        ))}
      </div>
      <p className="mt-1.5 flex justify-between px-1 font-mono text-[10px] tracking-[0.12em] text-white/60 uppercase">
        <span>
          <span className="text-blue-300">◆</span> {name} <span className="ml-2 text-cyan-300">●</span> echoes
        </span>
        <span ref={speed}>0 km/h</span>
      </p>
    </div>
  );
}

// ---------- touch controls ----------

export function Joystick({ onChange, label }: { onChange: (x: number, y: number) => void; label: string }) {
  const base = useRef<HTMLDivElement>(null);
  const [k, setK] = useState({ x: 0, y: 0 });
  const id = useRef<number | null>(null);
  const move = (e: React.PointerEvent) => {
    const r = base.current!.getBoundingClientRect();
    const R = r.width / 2;
    let x = (e.clientX - r.left - R) / R;
    let y = -(e.clientY - r.top - R) / R;
    const l = Math.hypot(x, y);
    if (l > 1) {
      x /= l;
      y /= l;
    }
    setK({ x, y });
    onChange(x, y);
  };
  const end = () => {
    id.current = null;
    setK({ x: 0, y: 0 });
    onChange(0, 0);
  };
  return (
    <div
      ref={base}
      role="slider"
      aria-label={label}
      aria-valuenow={0}
      className="relative h-32 w-32 touch-none rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur-md select-none"
      onPointerDown={(e) => {
        id.current = e.pointerId;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => id.current === e.pointerId && move(e)}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="absolute top-1/2 left-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30 ring-1 ring-white/40" style={{ marginLeft: k.x * 36, marginTop: -k.y * 36 }} />
    </div>
  );
}

export function HoldButton({ onChange, children, className = "" }: { onChange: (down: boolean) => void; children: ReactNode; className?: string }) {
  const [down, setDown] = useState(false);
  const set = (d: boolean) => {
    setDown(d);
    onChange(d);
  };
  return (
    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        set(true);
      }}
      onPointerUp={() => set(false)}
      onPointerCancel={() => set(false)}
      onContextMenu={(e) => e.preventDefault()}
      className={`touch-none rounded-full font-mono text-xs font-semibold tracking-[0.12em] uppercase select-none ${down ? "scale-95 bg-amber-400 text-black" : "bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-md"} ${className}`}
    >
      {children}
    </button>
  );
}

// ---------- bits ----------

export function Stars({ have, size = "md", animate = false }: { have: boolean[]; size?: "sm" | "md" | "lg"; animate?: boolean }) {
  const s = size === "lg" ? "h-9 w-9" : size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <span className="inline-flex gap-1" aria-label={`${have.filter(Boolean).length} of 3 stars`}>
      {have.map((h, i) => (
        <svg key={i} viewBox="0 0 24 24" className={`${s} ${animate && h ? "tls-star-pop" : ""}`} style={animate ? { animationDelay: `${0.25 + i * 0.35}s` } : undefined} aria-hidden>
          <path d="M12 2.5l2.9 6.2 6.8.8-5 4.6 1.3 6.7L12 17.5 6 20.8l1.3-6.7-5-4.6 6.8-.8z" fill={h ? "#fcd34d" : "none"} stroke={h ? "#fcd34d" : "rgba(255,255,255,0.35)"} strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}

export function IconButton({ label, onClick, children, active = false }: { label: string; onClick: () => void; children: ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-white/15 backdrop-blur-md transition-colors ${active ? "bg-white text-black" : "bg-black/40 text-white hover:bg-white/15"}`}
    >
      {children}
    </button>
  );
}

const ic = "h-[18px] w-[18px]";
export const Icon = {
  sound: (on: boolean) => (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" />
      {on ? <path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" /> : <path d="M17 9l5 6M22 9l-5 6" />}
    </svg>
  ),
  gear: (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
      <path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 5v16M8 7h7" />
    </svg>
  ),
  full: (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  ),
  pause: (
    <svg viewBox="0 0 24 24" className={ic} fill="currentColor" aria-hidden>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  ),
  camera: (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
      <path d="M3 8h4l2-3h6l2 3h4v11H3z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  ),
  view: (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
};
