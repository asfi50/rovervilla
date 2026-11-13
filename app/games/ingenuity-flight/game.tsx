"use client";

import { useEffect, useRef, useState } from "react";
import { Overlay, Stat, btn, clamp, rng, stage, useCanvas, useFrame } from "@/app/components/games/kit";

/*
 * Thin Air: hold to spin the rotors up, let go to spin them down. The blades take a moment to
 * respond and Mars's air gives little to push on, so you have to fly ahead of the helicopter.
 * Climb into the band, hold a hover, then set it down gently. Three flights, each a bit harder.
 */

const G = 3.71; // m/s² on Mars
const MASS = 1.8; // kg
type Flight = { name: string; band: [number, number]; hover: number; air: number; gusts: number };
const FLIGHTS: Flight[] = [
  { name: "Flight 1", band: [2.5, 3.5], hover: 8, air: 1, gusts: 0 },
  { name: "Higher", band: [4.5, 5.5], hover: 8, air: 0.9, gusts: 0 },
  { name: "Gusty", band: [3.5, 4.5], hover: 8, air: 0.9, gusts: 1 },
];
type Phase = "intro" | "fly" | "result" | "done";
type Step = "climb" | "hover" | "land";
type Result = { ok: boolean; points: number; text: string };

export default function IngenuityGame() {
  const { ref: canvas, size, ctx } = useCanvas();
  const [phase, setPhase] = useState<Phase>("intro");
  const [n, setN] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const s = useRef({ y: 0, v: 0, rpm: 0, held: false, t: 0, step: "climb" as Step, hovered: 0, gust: 0, over: false });
  const cfg = useRef(FLIGHTS[0]);
  const altEl = useRef<HTMLSpanElement>(null);
  const vsEl = useRef<HTMLSpanElement>(null);
  const rpmEl = useRef<HTMLSpanElement>(null);
  const taskEl = useRef<HTMLSpanElement>(null);
  const barEl = useRef<HTMLSpanElement>(null);

  const begin = (k: number) => {
    cfg.current = FLIGHTS[k];
    s.current = { y: 0, v: 0, rpm: 0, held: false, t: 0, step: "climb", hovered: 0, gust: 0, over: false };
    setN(k);
    setPhase("fly");
  };

  const end = (r: Result) => {
    if (s.current.over) return;
    s.current.over = true;
    setResults((list) => [...list, r]);
    window.setTimeout(() => setPhase("result"), 900);
  };

  useEffect(() => {
    if (phase !== "fly") return;
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        s.current.held = true;
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") s.current.held = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [phase]);

  useFrame(
    (dt, now) => {
      const c = ctx();
      if (!c) return;
      const { w, h } = size.current;
      const g = s.current;
      const f = cfg.current;
      g.t += dt;
      if (!g.over) {
        // the rotors spin up and down with a lag
        g.rpm += ((g.held ? 1 : 0) - g.rpm) * Math.min(1, dt * 2.6);
        const lift = g.rpm * g.rpm * 1.45 * f.air * MASS * G;
        if (f.gusts) {
          const r = rng(Math.floor(g.t * 1.3) + 9);
          g.gust += ((r() - 0.5) * 1.6 - g.gust) * Math.min(1, dt * 1.5);
        }
        const a = (lift - MASS * G) / MASS + g.gust - g.v * 0.35;
        g.v += a * dt;
        g.y += g.v * dt;
        if (g.y <= 0) {
          const impact = -g.v;
          g.y = 0;
          if (g.step === "land" && impact >= 0) {
            if (impact > 2) end({ ok: false, points: 10, text: `Hard landing at ${impact.toFixed(1)} m/s. The legs took a beating.` });
            else if (impact > 0.05 || g.rpm < 0.75)
              end({ ok: true, points: Math.round(60 + 40 * clamp(1 - impact / 1.5)), text: `Touched down at ${impact.toFixed(1)} m/s.` });
          } else if (g.step !== "climb" && impact > 2) {
            end({ ok: false, points: 0, text: `Dropped out of the sky at ${impact.toFixed(1)} m/s.` });
          }
          g.v = Math.max(0, g.v);
        }
        if (g.y > 12) end({ ok: false, points: 0, text: "Flew too high and the team lost track of it." });
        const inBand = g.y >= f.band[0] && g.y <= f.band[1];
        if (g.step === "climb" && inBand) g.step = "hover";
        if (g.step === "hover") {
          if (inBand) g.hovered += dt;
          if (g.hovered >= f.hover) g.step = "land";
        }
        if (g.t > 60) end({ ok: false, points: 0, text: "The battery ran low before the flight was done." });
      }

      draw(c, w, h, g, f, now);
      if (altEl.current) altEl.current.textContent = `${g.y.toFixed(1)} m`;
      if (vsEl.current) vsEl.current.textContent = `${g.v >= 0 ? "+" : ""}${g.v.toFixed(1)} m/s`;
      if (rpmEl.current) rpmEl.current.style.transform = `scaleX(${g.rpm})`;
      if (taskEl.current)
        taskEl.current.textContent =
          g.step === "climb" ? `Climb to ${f.band[0]}–${f.band[1]} m` : g.step === "hover" ? `Hold the hover` : "Now land gently";
      if (barEl.current) barEl.current.style.transform = `scaleX(${clamp(g.hovered / f.hover)})`;
    },
    phase === "fly" || phase === "result",
  );

  const hold = (on: boolean) => {
    s.current.held = on;
  };
  const total = results.reduce((a, r) => a + r.points, 0);
  const last = results[results.length - 1];

  return (
    <div
      className={`${stage} aspect-[3/4] sm:aspect-[16/10] lg:aspect-[16/9]`}
      onPointerDown={() => hold(true)}
      onPointerUp={() => hold(false)}
      onPointerCancel={() => hold(false)}
      onPointerLeave={() => hold(false)}
    >
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />

      {(phase === "fly" || phase === "result") && (
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
          <div className="rounded-2xl bg-black/35 px-3 py-2 ring-1 ring-white/10 backdrop-blur-md">
            <p className="font-mono text-[10px] tracking-[0.14em] text-white/55 uppercase">
              {FLIGHTS[n].name} · <span ref={taskEl} />
            </p>
            <p className="mt-0.5 font-mono text-[15px] tabular-nums">
              <span ref={altEl}>0.0 m</span> <span className="text-white/50">·</span> <span ref={vsEl}>+0.0 m/s</span>
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="font-mono text-[10px] text-white/50">ROTOR</span>
              <span className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                <span ref={rpmEl} className="block h-full origin-left rounded-full bg-[#ffd28a]" style={{ transform: "scaleX(0)" }} />
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-[10px] text-white/50">HOVER</span>
              <span className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                <span ref={barEl} className="block h-full origin-left rounded-full bg-brand-bright" style={{ transform: "scaleX(0)" }} />
              </span>
            </div>
          </div>
          <p className="hidden rounded-full bg-black/35 px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] uppercase ring-1 ring-white/10 backdrop-blur-md sm:block">
            Hold to lift
          </p>
        </div>
      )}

      {phase === "result" && last && (
        <Overlay
          kicker={`${FLIGHTS[n].name} · +${last.points}`}
          title={last.ok ? "Wheels… er, feet down" : "Not this time"}
          actions={
            <button className={btn.primary} onPointerDown={(e) => e.stopPropagation()} onClick={() => (n < FLIGHTS.length - 1 ? begin(n + 1) : setPhase("done"))}>
              {n < FLIGHTS.length - 1 ? "Next flight" : "See my flights"}
            </button>
          }
        >
          {last.text}
        </Overlay>
      )}

      {phase === "intro" && (
        <Overlay
          kicker="19 April 2021"
          title="Thin Air"
          actions={
            <button
              className={btn.primary}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                setResults([]);
                begin(0);
              }}
            >
              Spin up
            </button>
          }
        >
          Mars&rsquo;s air is very thin, so a helicopter&rsquo;s blades must spin fast just to lift off, and they take a moment to speed up and slow down. Hold
          anywhere (or Space) to lift. Climb into the band, hover, then land gently.
        </Overlay>
      )}

      {phase === "done" && (
        <Overlay
          kicker="Flight log"
          title={total >= 240 ? "Ace pilot" : total >= 150 ? "Test pilot" : "Grounded"}
          actions={
            <button
              className={btn.primary}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                setResults([]);
                begin(0);
              }}
            >
              Fly again
            </button>
          }
        >
          <div className="grid grid-cols-3 gap-2">
            {results.map((r, i) => (
              <Stat key={i} value={String(r.points)} label={FLIGHTS[i].name} />
            ))}
          </div>
          <p className="mt-4">Ingenuity&rsquo;s first flight climbed to 3 m and lasted 39.1 seconds. It was planned for five flights and flew 72.</p>
        </Overlay>
      )}
    </div>
  );
}

function draw(
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  g: { y: number; rpm: number; step: Step; t: number },
  f: Flight,
  now: number,
) {
  const sky = c.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#c69a76");
  sky.addColorStop(1, "#ead0b5");
  c.fillStyle = sky;
  c.fillRect(0, 0, w, h);

  const groundY = h * 0.82;
  const pxPerM = (groundY - h * 0.12) / 7; // 7 m fits on screen
  // distant rim of Jezero crater
  c.fillStyle = "#b98463";
  c.beginPath();
  c.moveTo(0, groundY - h * 0.08);
  for (let x = 0; x <= w; x += 24) c.lineTo(x, groundY - h * 0.08 - Math.sin(x * 0.006) * h * 0.03 - Math.sin(x * 0.021) * h * 0.012);
  c.lineTo(w, groundY);
  c.lineTo(0, groundY);
  c.fill();
  c.fillStyle = "#a8664a";
  c.fillRect(0, groundY, w, h - groundY);
  const r = rng(3);
  for (let i = 0; i < 26; i++) {
    const x = r() * w;
    const rw = 6 + r() * 20;
    c.fillStyle = "rgba(70,35,24,0.55)";
    c.beginPath();
    c.ellipse(x, groundY + 6 + r() * (h - groundY - 10), rw, rw * 0.4, 0, 0, Math.PI * 2);
    c.fill();
  }

  // the target band and the height scale
  const b0 = groundY - f.band[0] * pxPerM;
  const b1 = groundY - f.band[1] * pxPerM;
  c.fillStyle = g.step === "land" ? "rgba(18,56,255,0.06)" : "rgba(18,56,255,0.16)";
  c.fillRect(0, b1, w, b0 - b1);
  c.strokeStyle = "rgba(18,56,255,0.5)";
  c.setLineDash([6, 6]);
  c.beginPath();
  c.moveTo(0, b0);
  c.lineTo(w, b0);
  c.moveTo(0, b1);
  c.lineTo(w, b1);
  c.stroke();
  c.setLineDash([]);
  c.font = "600 10px ui-monospace, monospace";
  c.fillStyle = "rgba(30,20,40,0.6)";
  c.textAlign = "right";
  for (let m = 1; m <= 6; m++) {
    const y = groundY - m * pxPerM;
    c.fillRect(w - 14, y, 10, 1);
    c.fillText(`${m} m`, w - 18, y + 3);
  }

  const x = w / 2;
  const y = groundY - g.y * pxPerM;
  // shadow on the ground
  const sh = clamp(1 - g.y / 8);
  c.fillStyle = `rgba(40,18,10,${0.35 * sh})`;
  c.beginPath();
  c.ellipse(x, groundY + 2, 34 * (0.6 + sh * 0.4), 5, 0, 0, Math.PI * 2);
  c.fill();
  // dust from the downwash near the ground
  if (g.rpm > 0.4 && g.y < 2.2) {
    const k = (g.rpm - 0.4) * clamp(1 - g.y / 2.2);
    for (let i = 0; i < 18; i++) {
      const a = ((i / 18) * 2 - 1) * (40 + ((now * 90 + i * 37) % 80));
      c.fillStyle = `rgba(214,170,140,${0.25 * k})`;
      c.beginPath();
      c.arc(x + a, groundY - 4 - ((now * 30 + i * 13) % 14), 6 + (i % 4) * 3, 0, Math.PI * 2);
      c.fill();
    }
  }

  // the helicopter: legs, body, mast, two rotors and the solar panel on top
  c.save();
  c.translate(x, y);
  c.scale(1.7, 1.7);
  c.strokeStyle = "#2e2b33";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(-8, -8);
  c.lineTo(-22, 0);
  c.moveTo(8, -8);
  c.lineTo(22, 0);
  c.moveTo(-4, -8);
  c.lineTo(-10, 0);
  c.moveTo(4, -8);
  c.lineTo(10, 0);
  c.stroke();
  c.fillStyle = "#d9d4c9";
  c.fillRect(-10, -20, 20, 13);
  c.fillStyle = "#e3b54a";
  c.fillRect(-10, -20, 20, 3);
  c.fillStyle = "#2e2b33";
  c.fillRect(-1.5, -46, 3, 26);
  const blur = clamp(g.rpm);
  for (const ry of [-30, -38]) {
    c.fillStyle = `rgba(40,36,48,${0.25 + 0.35 * (1 - blur)})`;
    c.beginPath();
    c.ellipse(0, ry, 36, 2.6, 0, 0, Math.PI * 2);
    c.fill();
    if (blur < 0.6) {
      const a = now * (2 + blur * 30);
      c.strokeStyle = "#2e2b33";
      c.lineWidth = 2.4;
      c.beginPath();
      c.moveTo(-Math.cos(a) * 36, ry);
      c.lineTo(Math.cos(a) * 36, ry);
      c.stroke();
    }
  }
  c.fillStyle = "#3f5bd9";
  c.fillRect(-12, -50, 24, 4);
  c.restore();
}
