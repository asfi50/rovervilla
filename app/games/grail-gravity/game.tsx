"use client";

import { useRef, useState, type PointerEvent } from "react";
import { Overlay, Stat, btn, clamp, rng, stage, useCanvas, useFrame } from "@/app/components/games/kit";

/*
 * Ebb & Flow: two spacecraft fly over the Moon. Hidden masses under the surface tug the
 * leading twin ahead and then the trailing one, so the gap between them stretches and closes.
 * Watch the gap signal, then tap the surface where you think each mass is buried.
 */

type Phase = "intro" | "fly" | "guess" | "reveal" | "done";
type Mass = { x: number; a: number };

const ROUNDS = 3;
const PASS = 7.5; // seconds for one pass
const GAP = 0.07; // distance between the twins, as a fraction of the width
const DEPTH = 0.055;
const SAMPLES = 220;

/** Horizontal pull from a buried mass at horizontal offset u. */
const pull = (u: number) => u / Math.pow(u * u + DEPTH * DEPTH, 1.5);

function makeRound(n: number, seed: number) {
  const r = rng(seed);
  const masses: Mass[] = [];
  while (masses.length < n) {
    const x = 0.12 + r() * 0.76;
    if (masses.every((m) => Math.abs(m.x - x) > 0.17)) masses.push({ x, a: 0.75 + r() * 0.5 });
  }
  return { masses, noise: n === 3 ? 0.12 : n === 2 ? 0.05 : 0, seed };
}

/** How fast the gap between the twins is changing when the leader is at p. */
function rangeRate(masses: Mass[], p: number) {
  let v = 0;
  for (const m of masses) v += m.a * (pull(m.x - p) - pull(m.x - (p - GAP)));
  return v * 0.003;
}

export default function GrailGame() {
  const { ref: canvas, size, ctx } = useCanvas();
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const level = useRef(makeRound(1, 11));
  const t = useRef(0);
  const trace = useRef<number[]>([]);

  const begin = (r: number) => {
    level.current = makeRound(r + 1, 11 + r * 97 + Math.floor(Math.random() * 1000));
    trace.current = [];
    t.current = 0;
    setRound(r);
    setGuesses([]);
    setPhase("fly");
  };

  const roundScore = () => {
    const ms = level.current.masses;
    // match each mass to its nearest guess
    const left = [...guesses];
    let total = 0;
    for (const m of ms) {
      let bi = -1;
      let bd = 9;
      left.forEach((g, i) => {
        const d = Math.abs(g - m.x);
        if (d < bd) {
          bd = d;
          bi = i;
        }
      });
      if (bi >= 0) left.splice(bi, 1);
      total += clamp(1 - bd / 0.14);
    }
    return Math.round((total / ms.length) * 100);
  };

  const check = () => {
    setScores((s) => [...s, roundScore()]);
    setPhase("reveal");
  };

  const onTap = (e: PointerEvent) => {
    if (phase !== "guess") return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    if (y < 0.45) return;
    const n = level.current.masses.length;
    setGuesses((g) => {
      const near = g.findIndex((v) => Math.abs(v - x) < 0.035);
      if (near >= 0) return g.filter((_, i) => i !== near);
      return g.length >= n ? [...g.slice(1), x] : [...g, x];
    });
  };

  useFrame(
    (dt) => {
      const c = ctx();
      if (!c) return;
      const { w, h } = size.current;
      const lv = level.current;
      if (phase === "fly") {
        t.current += dt;
        const p = -0.04 + (t.current / PASS) * 1.12;
        const r = rng(Math.floor(t.current * 60) + lv.seed);
        const k = Math.floor(clamp((p - GAP / 2) * SAMPLES, 0, SAMPLES - 1));
        trace.current[k] = rangeRate(lv.masses, p) + (r() - 0.5) * lv.noise;
        if (t.current > PASS) setPhase("guess");
      }
      draw(c, w, h, phase, lv, t.current, trace.current, guesses);
    },
    phase !== "intro" && phase !== "done",
  );

  const total = scores.reduce((a, b) => a + b, 0);
  const n = round + 1; // pass 1 hides one mass, pass 2 two, pass 3 three

  return (
    <div className={`${stage} aspect-[3/4] sm:aspect-[16/10] lg:aspect-[16/9]`} onPointerDown={onTap}>
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />

      {phase !== "intro" && phase !== "done" && (
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between sm:inset-x-4 sm:top-4">
          <p className="rounded-full bg-black/40 px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] uppercase ring-1 ring-white/10 backdrop-blur-md">
            Pass {round + 1} of {ROUNDS} · {n} hidden {n > 1 ? "masses" : "mass"}
          </p>
          <p className="rounded-full bg-black/40 px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] uppercase ring-1 ring-white/10 backdrop-blur-md">Score {total}</p>
        </div>
      )}

      {phase === "guess" && (
        <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-3 px-4 text-center">
          <p className="rounded-full bg-black/45 px-4 py-2 text-[14px] font-medium backdrop-blur-md">
            Tap the ground above each hidden mass ({guesses.length}/{n})
          </p>
          <button
            className={`${btn.primary} disabled:opacity-40`}
            disabled={guesses.length !== n}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={check}
          >
            Check my map
          </button>
        </div>
      )}

      {phase === "reveal" && (
        <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-3 px-4 text-center">
          <p className="rounded-full bg-black/45 px-4 py-2 text-[14px] font-medium backdrop-blur-md">
            {scores[scores.length - 1] >= 80 ? "Spot on." : scores[scores.length - 1] >= 50 ? "Close." : "The signal fooled you this time."} +{scores[scores.length - 1]}
          </p>
          <button className={btn.primary} onPointerDown={(e) => e.stopPropagation()} onClick={() => (round + 1 < ROUNDS ? begin(round + 1) : setPhase("done"))}>
            {round + 1 < ROUNDS ? "Next pass" : "See my map score"}
          </button>
        </div>
      )}

      {phase === "intro" && (
        <Overlay
          kicker="2011 to 2012"
          title="Ebb & Flow"
          actions={
            <button
              className={btn.primary}
              onClick={() => {
                setScores([]);
                begin(0);
              }}
            >
              Fly the first pass
            </button>
          }
        >
          Two spacecraft chase each other around the Moon. When the leader flies over a heavy patch underground, it gets pulled ahead and the gap grows; then the
          follower catches up. Watch the gap signal, then tap where the masses are buried.
        </Overlay>
      )}

      {phase === "done" && (
        <Overlay
          kicker="Map complete"
          title={total >= 240 ? "Gravity mapper" : total >= 150 ? "Good map" : "Fuzzy map"}
          actions={
            <button
              className={btn.primary}
              onClick={() => {
                setScores([]);
                begin(0);
              }}
            >
              Map again
            </button>
          }
        >
          <div className="grid grid-cols-3 gap-2">
            {scores.map((s, i) => (
              <Stat key={i} value={String(s)} label={`pass ${i + 1}`} />
            ))}
          </div>
          <p className="mt-4">GRAIL did this for a whole year and made the most detailed gravity map of any world at the time, including the heavy patches called mascons.</p>
        </Overlay>
      )}
    </div>
  );
}

function draw(c: CanvasRenderingContext2D, w: number, h: number, phase: Phase, lv: { masses: Mass[]; seed: number }, t: number, trace: number[], guesses: number[]) {
  // space
  const sky = c.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#05071a");
  sky.addColorStop(1, "#141a3d");
  c.fillStyle = sky;
  c.fillRect(0, 0, w, h);
  const st = rng(5);
  c.fillStyle = "rgba(255,255,255,0.6)";
  for (let i = 0; i < 90; i++) c.fillRect(st() * w, st() * h * 0.62, st() < 0.1 ? 2 : 1, st() < 0.1 ? 2 : 1);

  // the signal graph across the top
  const gy = h * 0.13;
  const gh = h * 0.22;
  c.fillStyle = "rgba(255,255,255,0.04)";
  c.fillRect(0, gy, w, gh);
  c.strokeStyle = "rgba(255,255,255,0.15)";
  c.setLineDash([4, 6]);
  c.beginPath();
  c.moveTo(0, gy + gh / 2);
  c.lineTo(w, gy + gh / 2);
  c.stroke();
  c.setLineDash([]);
  c.font = "500 10px ui-monospace, monospace";
  c.fillStyle = "rgba(255,255,255,0.5)";
  c.textAlign = "left";
  c.fillText("GAP SIGNAL  ·  stretching ↑   closing ↓", 12, gy - 6);
  c.strokeStyle = "#8c9eff";
  c.lineWidth = 2;
  c.beginPath();
  let started = false;
  for (let i = 0; i < SAMPLES; i++) {
    const v = trace[i];
    if (v === undefined) continue;
    const x = (i / SAMPLES) * w;
    const y = gy + gh / 2 - clamp(v, -1.2, 1.2) * gh * 0.42;
    if (!started) c.moveTo(x, y);
    else c.lineTo(x, y);
    started = true;
  }
  c.stroke();

  // ground
  const gTop = h * 0.66;
  const ground = (x: number) => gTop + Math.sin(x * 9 + lv.seed) * h * 0.012 + Math.sin(x * 23 + lv.seed * 2) * h * 0.006;
  c.fillStyle = "#8f8c86";
  c.beginPath();
  c.moveTo(0, h);
  for (let x = 0; x <= w; x += 6) c.lineTo(x, ground(x / w));
  c.lineTo(w, h);
  c.fill();
  // the crust below, cut away
  const crust = c.createLinearGradient(0, gTop, 0, h);
  crust.addColorStop(0, "#5c5852");
  crust.addColorStop(1, "#2a2724");
  c.fillStyle = crust;
  c.beginPath();
  c.moveTo(0, h);
  for (let x = 0; x <= w; x += 6) c.lineTo(x, ground(x / w) + 7);
  c.lineTo(w, h);
  c.fill();

  // hidden masses, shown after you check
  if (phase === "reveal") {
    for (const m of lv.masses) {
      const x = m.x * w;
      const y = gTop + h * 0.17;
      const g = c.createRadialGradient(x, y, 2, x, y, h * 0.1 * m.a);
      g.addColorStop(0, "rgba(255,210,138,0.95)");
      g.addColorStop(1, "rgba(255,210,138,0)");
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(x, y, h * 0.13 * m.a, h * 0.07 * m.a, 0, 0, Math.PI * 2);
      c.fill();
    }
  }

  // your markers
  for (const gx of guesses) {
    const x = gx * w;
    const y = ground(gx);
    c.strokeStyle = "#ffffff";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x, y - 26);
    c.lineTo(x, y + h * 0.17);
    c.stroke();
    c.fillStyle = "#1238ff";
    c.beginPath();
    c.arc(x, y - 30, 8, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#fff";
    c.stroke();
  }

  // the twins
  if (phase === "fly") {
    const p = -0.04 + (t / PASS) * 1.12;
    const stretch = rangeRate(lv.masses, p) * 0.05;
    const y = h * 0.5;
    const lx = p * w;
    const tx = (p - GAP - stretch) * w;
    c.strokeStyle = "rgba(140,158,255,0.6)";
    c.setLineDash([3, 5]);
    c.beginPath();
    c.moveTo(tx, y);
    c.lineTo(lx, y);
    c.stroke();
    c.setLineDash([]);
    craft(c, lx, y, "EBB");
    craft(c, tx, y, "FLOW");
    // dotted line down to the ground
    c.strokeStyle = "rgba(255,255,255,0.12)";
    c.beginPath();
    c.moveTo((lx + tx) / 2, y + 10);
    c.lineTo((lx + tx) / 2, gTop);
    c.stroke();
  }
}

function craft(c: CanvasRenderingContext2D, x: number, y: number, label: string) {
  c.fillStyle = "#3f5bd9";
  c.fillRect(x - 17, y - 3, 10, 6);
  c.fillRect(x + 7, y - 3, 10, 6);
  c.fillStyle = "#e6b34a";
  c.fillRect(x - 6, y - 6, 12, 12);
  c.font = "600 10px ui-monospace, monospace";
  c.textAlign = "center";
  c.fillStyle = "rgba(255,255,255,0.8)";
  c.fillText(label, x, y - 13);
}
