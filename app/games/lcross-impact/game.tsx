"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Overlay, Stat, btn, clamp, rng, stage, useCanvas, useFrame } from "@/app/components/games/kit";

/*
 * Into the Plume. Part one: release the spent rocket stage so it lands in the crater's
 * permanently shadowed floor, where ice can last. Part two: follow it down. Steer the
 * shepherding spacecraft under the part of the plume that rises into sunlight, because
 * sunlit dust is what the instruments can read.
 */

type Phase = "intro" | "aim" | "fly" | "done";
type P = { x: number; y: number; vx: number; vy: number; s: number };

const AIM_TIME = 9;
const FLY_TIME = 15;
const GRAV = 0.09; // in heights per second², squeezed

export default function LcrossGame() {
  const { ref: canvas, size, ctx } = useCanvas();
  const [phase, setPhase] = useState<Phase>("intro");
  const [result, setResult] = useState({ ice: 0, data: 0 });
  const g = useRef({ t: 0, aimX: 0.5, aimY: 0.5, ice: 0, hitX: 0.5, craftX: 0.5, goal: 0.5, seen: 0, possible: 0, parts: [] as P[], flash: 0 });
  const keys = useRef(0);

  const begin = () => {
    g.current = { t: 0, aimX: 0.5, aimY: 0.5, ice: 0, hitX: 0.5, craftX: 0.5, goal: 0.5, seen: 0, possible: 0, parts: [], flash: 0 };
    setPhase("aim");
  };

  const release = () => {
    const s = g.current;
    s.ice = iceAt(s.aimX, s.aimY);
    s.hitX = 0.5 + (s.aimX - 0.5) * 0.9;
    s.craftX = 0.5;
    s.goal = 0.5;
    s.t = 0;
    s.flash = 1;
    // the plume: dust thrown up and out, more of it when the Centaur hit dark, icy ground
    const r = rng(Math.floor(Math.random() * 1e6));
    const lean = (r() - 0.5) * 0.12;
    s.parts = Array.from({ length: 900 }, () => {
      const a = (r() - 0.5) * 1.1 + lean;
      const v = 0.25 + r() * 0.42;
      return { x: s.hitX, y: 0, vx: Math.sin(a) * v * 0.55, vy: Math.cos(a) * v, s: 0.6 + r() * 1.6 };
    });
    setPhase("fly");
  };

  // Steer with arrow keys or A/D.
  useEffect(() => {
    if (phase !== "fly") return;
    const set = (e: KeyboardEvent, on: boolean) => {
      const k = e.key === "ArrowLeft" || e.key === "a" ? -1 : e.key === "ArrowRight" || e.key === "d" ? 1 : 0;
      if (!k) return;
      e.preventDefault();
      keys.current = on ? k : keys.current === k ? 0 : keys.current;
    };
    const down = (e: KeyboardEvent) => set(e, true);
    const up = (e: KeyboardEvent) => set(e, false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [phase]);

  const steer = (e: PointerEvent) => {
    if (phase !== "fly") return;
    const r = e.currentTarget.getBoundingClientRect();
    g.current.goal = clamp((e.clientX - r.left) / r.width, 0.04, 0.96);
  };

  useFrame(
    (dt) => {
      const c = ctx();
      if (!c) return;
      const { w, h } = size.current;
      const s = g.current;
      s.t += dt;
      s.flash = Math.max(0, s.flash - dt * 2.5);

      if (phase === "aim") {
        // the Centaur's aim point wanders; release it at the right moment
        const k = s.t * 0.9;
        s.aimX = 0.5 + Math.sin(k * 1.3) * 0.3 + Math.sin(k * 3.1) * 0.05;
        s.aimY = 0.5 + Math.sin(k * 1.7 + 1) * 0.22 + Math.cos(k * 2.3) * 0.04;
        drawAim(c, w, h, s.aimX, s.aimY, s.t);
        if (s.t > AIM_TIME) release();
        return;
      }

      // fly
      if (keys.current) s.goal = clamp(s.goal + keys.current * dt * 0.6, 0.04, 0.96);
      s.craftX += (s.goal - s.craftX) * Math.min(1, dt * 5);
      const sun = 0.36; // height of the sunlight above the crater floor, as a fraction of the climb
      let lit = 0;
      let inView = 0;
      for (const p of s.parts) {
        p.vy -= GRAV * dt;
        p.x += p.vx * dt * 0.6;
        p.y = Math.max(0, p.y + p.vy * dt * 0.6);
        if (p.y > sun) {
          lit++;
          if (Math.abs(p.x - s.craftX) < 0.07) inView++;
        }
      }
      s.seen += inView * dt;
      s.possible += Math.min(lit, 260) * dt;
      drawFly(c, w, h, s, sun);
      if (s.t > FLY_TIME) {
        const data = Math.round(clamp(s.seen / Math.max(1, s.possible * 0.55)) * 100);
        setResult({ ice: Math.round(s.ice * 100), data });
        setPhase("done");
      }
    },
    phase === "aim" || phase === "fly",
  );

  const score = Math.round((result.ice * result.data) / 100);

  return (
    <div className={`${stage} aspect-[3/4] sm:aspect-[16/10] lg:aspect-[16/9]`} onPointerDown={steer} onPointerMove={steer}>
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />

      {phase === "aim" && (
        <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-3 px-4 text-center">
          <p className="rounded-full bg-black/45 px-4 py-2 text-[14px] font-medium backdrop-blur-md">Release when the cross is over the darkest ground</p>
          <button className={btn.primary} onPointerDown={(e) => e.stopPropagation()} onClick={release}>
            Release the Centaur
          </button>
        </div>
      )}
      {phase === "fly" && (
        <p className="pointer-events-none absolute inset-x-0 top-4 mx-auto w-fit rounded-full bg-black/45 px-4 py-2 text-center text-[13px] font-medium backdrop-blur-md">
          Drag or use ← → to stay under the sunlit plume
        </p>
      )}

      {phase === "intro" && (
        <Overlay
          kicker="9 October 2009"
          title="Into the Plume"
          actions={
            <button className={btn.primary} onClick={begin}>
              Start
            </button>
          }
        >
          A spent rocket stage is heading for Cabeus crater near the Moon&rsquo;s south pole. First, release it over the floor that never sees the Sun. Then follow
          it down and fly under the dust that rises into sunlight, so your instruments can read it.
        </Overlay>
      )}

      {phase === "done" && (
        <Overlay
          kicker="Signal ends at impact"
          title={score >= 60 ? "Water in the plume" : score >= 30 ? "A faint signal" : "Mostly dust"}
          actions={
            <button className={btn.primary} onClick={begin}>
              Try again
            </button>
          }
        >
          <div className="grid grid-cols-3 gap-2">
            <Stat value={`${result.ice}%`} label="icy target" />
            <Stat value={`${result.data}%`} label="plume read" />
            <Stat value={String(score)} label="score" />
          </div>
          <p className="mt-4">
            The real LCROSS read the plume for about four minutes before it hit too. Scientists estimated about 5.6% of the soil at the impact site was water.
          </p>
        </Overlay>
      )}
    </div>
  );
}

/** How icy the ground is: the shadowed floor is best, the sunlit wall less, outside the crater barely. Same shapes as drawAim. */
function iceAt(x: number, y: number) {
  const crater = Math.hypot((x - 0.5) / 0.36, (y - 0.52) / 0.3);
  if (crater > 1) return 0.08;
  const shade = Math.hypot((x - 0.5 + 0.28 * 0.36) / (0.95 * 0.36), (y - 0.52) / (1.08 * 0.3));
  // full marks well inside the shadow, fading across its edge to the lit wall
  return 0.35 + 0.65 * clamp((1.04 - shade) / 0.12);
}

function drawAim(c: CanvasRenderingContext2D, w: number, h: number, ax: number, ay: number, t: number) {
  c.fillStyle = "#6f6c67";
  c.fillRect(0, 0, w, h);
  const r = rng(9);
  for (let i = 0; i < 70; i++) {
    const x = r() * w;
    const y = r() * h;
    const rr = (4 + r() * 22) * (w / 900);
    c.fillStyle = "rgba(40,38,36,0.35)";
    c.beginPath();
    c.arc(x, y, rr, 0, Math.PI * 2);
    c.fill();
  }
  const cx = w * 0.5;
  const cy = h * 0.52;
  const rx = w * 0.36;
  const ry = h * 0.3;
  // crater bowl
  c.fillStyle = "#4a4743";
  c.beginPath();
  c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  c.fill();
  // the shadow that never lifts: everything except a lit crescent on the right
  c.save();
  c.beginPath();
  c.ellipse(cx, cy, rx * 0.97, ry * 0.97, 0, 0, Math.PI * 2);
  c.clip();
  c.fillStyle = "#0b0b12";
  c.beginPath();
  c.ellipse(cx - rx * 0.28, cy, rx * 0.95, ry * 1.08, 0, 0, Math.PI * 2);
  c.fill();
  c.restore();
  c.strokeStyle = "rgba(220,215,205,0.5)";
  c.lineWidth = 3;
  c.beginPath();
  c.ellipse(cx, cy, rx, ry, 0, -Math.PI * 0.45, Math.PI * 0.45);
  c.stroke();
  c.font = "600 11px ui-monospace, monospace";
  c.fillStyle = "rgba(255,255,255,0.55)";
  c.textAlign = "center";
  c.fillText("CABEUS · PERMANENT SHADOW", cx - rx * 0.25, cy - ry * 0.2);
  c.fillText("SUNLIT WALL", cx + rx * 0.72, cy + 4);

  // the aim point
  const x = ax * w;
  const y = ay * h;
  const pulse = 1 + Math.sin(t * 8) * 0.08;
  c.strokeStyle = "#ffd28a";
  c.lineWidth = 2;
  c.beginPath();
  c.arc(x, y, 18 * pulse, 0, Math.PI * 2);
  c.moveTo(x - 30, y);
  c.lineTo(x - 8, y);
  c.moveTo(x + 8, y);
  c.lineTo(x + 30, y);
  c.moveTo(x, y - 30);
  c.lineTo(x, y - 8);
  c.moveTo(x, y + 8);
  c.lineTo(x, y + 30);
  c.stroke();
  c.fillStyle = "#ffd28a";
  c.fillText(`${Math.round(iceAt(ax, ay) * 100)}% icy`, x, y - 38);
  // countdown
  c.fillStyle = "rgba(255,255,255,0.75)";
  c.textAlign = "left";
  c.fillText(`IMPACT IN ${Math.max(0, AIM_TIME - t).toFixed(1)} s`, 16, 26);
}

function drawFly(c: CanvasRenderingContext2D, w: number, h: number, s: { t: number; craftX: number; parts: P[]; flash: number; hitX: number }, sun: number) {
  const floor = h * 0.9;
  const climb = h * 0.82; // pixels for a plume height of 1
  // space and the dark crater
  c.fillStyle = "#04050c";
  c.fillRect(0, 0, w, h);
  const sunY = floor - sun * climb;
  // sunlight sweeping across above the rim
  const lg = c.createLinearGradient(0, sunY - h * 0.25, 0, sunY);
  lg.addColorStop(0, "rgba(255,226,170,0.0)");
  lg.addColorStop(1, "rgba(255,226,170,0.10)");
  c.fillStyle = lg;
  c.fillRect(0, sunY - h * 0.25, w, h * 0.25);
  c.strokeStyle = "rgba(255,210,138,0.45)";
  c.setLineDash([6, 8]);
  c.beginPath();
  c.moveTo(0, sunY);
  c.lineTo(w, sunY);
  c.stroke();
  c.setLineDash([]);
  c.font = "600 10px ui-monospace, monospace";
  c.fillStyle = "rgba(255,210,138,0.7)";
  c.textAlign = "right";
  c.fillText("SUNLIGHT ABOVE THE RIM  →", w - 14, sunY - 8);
  // crater walls
  c.fillStyle = "#1a1917";
  c.beginPath();
  c.moveTo(0, sunY + 4);
  c.lineTo(w * 0.12, floor);
  c.lineTo(w * 0.88, floor);
  c.lineTo(w, sunY + 4);
  c.lineTo(w, h);
  c.lineTo(0, h);
  c.fill();

  // dust: dull in the dark, bright where the Sun catches it
  for (const p of s.parts) {
    const x = p.x * w;
    const y = floor - p.y * climb;
    if (y < -10 || x < -10 || x > w + 10) continue;
    const litP = p.y > sun;
    c.fillStyle = litP ? "rgba(255,236,200,0.85)" : "rgba(120,115,110,0.35)";
    c.fillRect(x, y, p.s * (litP ? 1.6 : 1.2), p.s * (litP ? 1.6 : 1.2));
  }

  // the shepherding spacecraft, sinking toward the crater
  const cy = h * 0.06 + (s.t / FLY_TIME) * (floor - h * 0.12);
  const cx = s.craftX * w;
  c.fillStyle = "rgba(127,224,255,0.10)";
  c.beginPath();
  c.moveTo(cx - 6, cy + 8);
  c.lineTo(cx - w * 0.07, floor);
  c.lineTo(cx + w * 0.07, floor);
  c.lineTo(cx + 6, cy + 8);
  c.fill();
  c.fillStyle = "#c9cdd6";
  c.fillRect(cx - 9, cy - 9, 18, 18);
  c.fillStyle = "#3f5bd9";
  c.fillRect(cx - 26, cy - 4, 15, 8);
  c.fillRect(cx + 11, cy - 4, 15, 8);
  c.fillStyle = "#7fe0ff";
  c.beginPath();
  c.arc(cx, cy + 10, 3, 0, Math.PI * 2);
  c.fill();

  if (s.flash > 0) {
    c.fillStyle = `rgba(255,240,210,${s.flash * 0.8})`;
    c.fillRect(0, 0, w, h);
  }
  c.fillStyle = "rgba(255,255,255,0.75)";
  c.textAlign = "left";
  c.font = "600 11px ui-monospace, monospace";
  c.fillText(`IMPACT IN ${Math.max(0, FLY_TIME - s.t).toFixed(1)} s`, 16, h - 16);
}
