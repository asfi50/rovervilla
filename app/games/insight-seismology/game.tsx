"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Overlay, Stat, btn, clamp, rng, stage, useCanvas, useFrame } from "@/app/components/games/kit";

/*
 * Marsquake Hunter: a quake sends two kinds of waves. The fast P wave arrives first, the
 * slower S wave later, and the gap between them tells you how far away the quake was.
 * Mark both arrivals on the seismogram; wind and instrument glitches try to fool you.
 */

const SPAN = 420; // seconds shown
const KM_PER_S = 9; // km of distance per second of P–S gap (illustrative)
const MARS_R = 3390; // km
const QUAKES = 5;

type Quake = { tp: number; ts: number; noise: number; glitches: number[]; seed: number };
type Phase = "intro" | "mark" | "reveal" | "done";

function makeQuake(i: number, seed: number): Quake {
  const r = rng(seed);
  const tp = 25 + r() * 60;
  const gap = 60 + r() * 220;
  const glitches = Array.from({ length: i }, () => 20 + r() * (SPAN - 40));
  return { tp, ts: tp + gap, noise: 0.05 + i * 0.035, glitches, seed };
}

/** The ground motion at time t: noise, a sharp P arrival, a bigger slower S arrival, and glitches. */
function signal(q: Quake, t: number, n: () => number) {
  let v = (n() - 0.5) * q.noise * 2 + Math.sin(t * 0.7 + q.seed) * q.noise * 0.6;
  if (t > q.tp) {
    const k = t - q.tp;
    v += Math.sin(k * 5.2) * 0.32 * Math.exp(-k / 26) * (0.7 + n() * 0.6);
  }
  if (t > q.ts) {
    const k = t - q.ts;
    v += Math.sin(k * 2.1) * 0.95 * Math.exp(-k / 55) * (0.75 + n() * 0.5);
  }
  for (const gt of q.glitches) {
    const k = t - gt;
    if (k > 0 && k < 6) v += Math.exp(-k * 1.4) * 0.9 * (k < 0.8 ? 1 : -0.4);
  }
  return v;
}

export default function InsightGame() {
  const { ref: canvas, size, ctx } = useCanvas();
  const [phase, setPhase] = useState<Phase>("intro");
  const [i, setI] = useState(0);
  const [marks, setMarks] = useState<{ p: number | null; s: number | null }>({ p: null, s: null });
  const [scores, setScores] = useState<number[]>([]);
  const [truthKm, setTruthKm] = useState(0);
  const quake = useRef<Quake>(makeQuake(0, 1));
  const trace = useRef<number[]>([]);
  const drag = useRef<"p" | "s" | null>(null);
  const reveal = useRef(0);

  const load = (n: number) => {
    const q = makeQuake(n, 100 + n * 31 + Math.floor(Math.random() * 1000));
    quake.current = q;
    const r = rng(q.seed + 5);
    trace.current = Array.from({ length: 1400 }, (_, k) => signal(q, (k / 1400) * SPAN, r));
    reveal.current = 0;
    setI(n);
    setMarks({ p: null, s: null });
    setPhase("mark");
  };

  const tAt = (e: PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    return clamp((e.clientX - r.left) / r.width) * SPAN;
  };

  const down = (e: PointerEvent) => {
    if (phase !== "mark") return;
    const t = tAt(e);
    const near = (m: number | null) => m !== null && Math.abs(m - t) < SPAN * 0.04;
    if (near(marks.p)) drag.current = "p";
    else if (near(marks.s)) drag.current = "s";
    else if (marks.p === null) {
      setMarks((m) => ({ ...m, p: t }));
      drag.current = "p";
    } else if (marks.s === null) {
      setMarks((m) => ({ ...m, s: Math.max(t, (m.p ?? 0) + 2) }));
      drag.current = "s";
    } else drag.current = Math.abs(marks.p - t) < Math.abs(marks.s - t) ? "p" : "s";
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent) => {
    const d = drag.current;
    if (!d || phase !== "mark") return;
    const t = tAt(e);
    setMarks((m) => ({ ...m, [d]: t }));
  };
  const up = () => {
    drag.current = null;
  };

  const locate = () => {
    const q = quake.current;
    const gap = Math.abs((marks.s ?? 0) - (marks.p ?? 0));
    const truth = q.ts - q.tp;
    const err = Math.abs(gap - truth) / truth;
    setScores((s) => [...s, Math.round(clamp(1 - err / 0.35) * 100)]);
    setTruthKm(Math.round(truth * KM_PER_S));
    setPhase("reveal");
  };

  // Keyboard: nudge the last-placed marker.
  useEffect(() => {
    if (phase !== "mark") return;
    const onKey = (e: KeyboardEvent) => {
      const key = marks.s !== null ? "s" : marks.p !== null ? "p" : null;
      if (!key || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
      e.preventDefault();
      setMarks((m) => ({ ...m, [key]: clamp((m[key] ?? 0) + (e.key === "ArrowLeft" ? -2 : 2), 0, SPAN) }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, marks]);

  useFrame(
    (dt) => {
      const c = ctx();
      if (!c) return;
      const { w, h } = size.current;
      if (phase === "reveal") reveal.current = Math.min(1, reveal.current + dt * 1.5);
      draw(c, w, h, trace.current, marks, phase === "reveal" ? quake.current : null, reveal.current);
    },
    phase === "mark" || phase === "reveal",
  );

  const gap = marks.p !== null && marks.s !== null ? Math.abs(marks.s - marks.p) : null;
  const total = scores.reduce((a, b) => a + b, 0);
  const last = scores[scores.length - 1] ?? 0;

  return (
    <div>
      <div className={`${stage} aspect-[3/4] sm:aspect-[16/9]`}>
        <canvas ref={canvas} className="absolute inset-0 h-full w-full cursor-crosshair" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />

        {(phase === "mark" || phase === "reveal") && (
          <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
            <p className="rounded-full bg-black/40 px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] uppercase ring-1 ring-white/10 backdrop-blur-md">
              Quake {i + 1} of {QUAKES} · score {total}
            </p>
            <p className="rounded-full bg-black/40 px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] uppercase ring-1 ring-white/10 backdrop-blur-md">
              {gap === null ? (marks.p === null ? "Tap where the P wave starts" : "Now tap where the S wave starts") : `Gap ${Math.round(gap)} s → ${Math.round(gap * KM_PER_S).toLocaleString()} km`}
            </p>
          </div>
        )}

        {phase === "mark" && gap !== null && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center">
            <button className={btn.primary} onClick={locate}>
              Locate the quake
            </button>
          </div>
        )}
        {phase === "reveal" && (
          <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2 px-4 text-center">
            <p className="rounded-full bg-black/50 px-4 py-2 text-[14px] font-medium backdrop-blur-md">
              {last >= 85 ? "Nailed it." : last >= 50 ? "Close." : "Fooled by the noise."} The quake was {truthKm.toLocaleString()} km away. +{last}
            </p>
            <button className={btn.primary} onClick={() => (i + 1 < QUAKES ? load(i + 1) : setPhase("done"))}>
              {i + 1 < QUAKES ? "Next quake" : "See my score"}
            </button>
          </div>
        )}

        {phase === "intro" && (
          <Overlay
            kicker="Elysium Planitia · 2019 to 2022"
            title="Marsquake Hunter"
            actions={
              <button
                className={btn.primary}
                onClick={() => {
                  setScores([]);
                  load(0);
                }}
              >
                Start listening
              </button>
            }
          >
            InSight&rsquo;s seismometer felt Mars shake. Every quake sends a fast, small P wave and a slower, bigger S wave. Tap where each one starts. The longer
            the gap, the farther away the quake.
          </Overlay>
        )}
        {phase === "done" && (
          <Overlay
            kicker={`${QUAKES} quakes located`}
            title={total >= 400 ? "Seismologist" : total >= 250 ? "Good ears" : "Noisy planet"}
            actions={
              <button
                className={btn.primary}
                onClick={() => {
                  setScores([]);
                  load(0);
                }}
              >
                Listen again
              </button>
            }
          >
            <div className="grid grid-cols-5 gap-1.5">
              {scores.map((s, k) => (
                <Stat key={k} value={String(s)} label={`#${k + 1}`} />
              ))}
            </div>
            <p className="mt-4">InSight recorded 1,319 marsquakes. Scientists used them to measure Mars&rsquo;s crust, mantle and core.</p>
          </Overlay>
        )}
      </div>
      <p className="mt-2 px-1 text-[12px] text-ink-soft">Illustrative signals and wave speeds. Real marsquakes were far fainter and needed careful filtering.</p>
    </div>
  );
}

function draw(c: CanvasRenderingContext2D, w: number, h: number, trace: number[], marks: { p: number | null; s: number | null }, truth: Quake | null, rev: number) {
  c.fillStyle = "#0c0a22";
  c.fillRect(0, 0, w, h);
  const narrow = w < 640;
  const top = h * (narrow ? 0.25 : 0.16);
  const bot = h * (narrow ? 0.58 : 0.78);
  const mid = (top + bot) / 2;
  const amp = (bot - top) * 0.45;

  // time grid
  c.font = "500 10px ui-monospace, monospace";
  c.textAlign = "center";
  for (let s = 0; s <= SPAN; s += 50) {
    const x = (s / SPAN) * w;
    c.strokeStyle = "rgba(255,255,255,0.06)";
    c.beginPath();
    c.moveTo(x, top);
    c.lineTo(x, bot);
    c.stroke();
    c.fillStyle = "rgba(255,255,255,0.35)";
    if (s > 0 && s < SPAN) c.fillText(`${s}s`, x, bot + 16);
  }
  c.strokeStyle = "rgba(255,255,255,0.12)";
  c.beginPath();
  c.moveTo(0, mid);
  c.lineTo(w, mid);
  c.stroke();

  // the seismogram
  c.strokeStyle = "#e9ecff";
  c.lineWidth = 1.2;
  c.beginPath();
  trace.forEach((v, k) => {
    const x = (k / trace.length) * w;
    const y = mid - clamp(v, -1.4, 1.4) * amp;
    if (k === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  });
  c.stroke();

  const marker = (t: number, color: string, label: string, dashed = false) => {
    const x = (t / SPAN) * w;
    c.strokeStyle = color;
    c.lineWidth = 2;
    c.setLineDash(dashed ? [5, 5] : []);
    c.beginPath();
    c.moveTo(x, top - 8);
    c.lineTo(x, bot + 4);
    c.stroke();
    c.setLineDash([]);
    c.fillStyle = color;
    c.beginPath();
    c.roundRect(x - 13, top - 30, 26, 20, 6);
    c.fill();
    c.fillStyle = "#0c0a22";
    c.font = "700 12px ui-monospace, monospace";
    c.textAlign = "center";
    c.fillText(label, x, top - 16);
  };
  if (truth && rev > 0) {
    c.globalAlpha = rev;
    marker(truth.tp, "rgba(125,255,176,0.9)", "P", true);
    marker(truth.ts, "rgba(125,255,176,0.9)", "S", true);
    c.globalAlpha = 1;
  }
  if (marks.p !== null) marker(marks.p, "#8c9eff", "P");
  if (marks.s !== null) marker(marks.s, "#ffd28a", "S");
  if (marks.p !== null && marks.s !== null) {
    const x1 = (Math.min(marks.p, marks.s) / SPAN) * w;
    const x2 = (Math.max(marks.p, marks.s) / SPAN) * w;
    c.fillStyle = "rgba(140,158,255,0.08)";
    c.fillRect(x1, top, x2 - x1, bot - top);
  }

  // Mars, with InSight and the distance rings
  const R = Math.min(w, h) * (narrow ? 0.12 : 0.11);
  const cx = narrow ? w / 2 : w - R - 22;
  const cy = narrow ? h - R - 78 : h - R - 18;
  const g = c.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
  g.addColorStop(0, "#e8885a");
  g.addColorStop(1, "#7a2e1c");
  c.fillStyle = g;
  c.beginPath();
  c.arc(cx, cy, R, 0, Math.PI * 2);
  c.fill();
  const ring = (km: number, color: string, dashed = false) => {
    const ang = km / MARS_R; // radians around the planet
    const r = Math.sin(Math.min(ang, Math.PI / 2)) * R;
    c.strokeStyle = color;
    c.lineWidth = 2;
    c.setLineDash(dashed ? [4, 4] : []);
    c.beginPath();
    c.arc(cx, cy, Math.max(3, r), 0, Math.PI * 2);
    c.stroke();
    c.setLineDash([]);
  };
  if (marks.p !== null && marks.s !== null) ring(Math.abs(marks.s - marks.p) * KM_PER_S, "#ffd28a");
  if (truth && rev > 0) ring((truth.ts - truth.tp) * KM_PER_S, `rgba(125,255,176,${rev})`, true);
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.arc(cx, cy, 3.5, 0, Math.PI * 2);
  c.fill();
  c.font = "600 10px ui-monospace, monospace";
  c.textAlign = "center";
  c.fillStyle = "rgba(255,255,255,0.7)";
  c.fillText("INSIGHT", cx, cy - R - 8);
}
