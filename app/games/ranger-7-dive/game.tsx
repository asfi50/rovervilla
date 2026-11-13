"use client";

import { useEffect, useRef, useState } from "react";
import { Overlay, Readout, Stat, btn, clamp, hash2, stage, useCanvas, useFrame } from "@/app/components/games/kit";

/*
 * Last Pictures: fall toward the Moon with Ranger 7's cameras and keep taking pictures until
 * the end. Altitude falls from the real first-picture height (2,110 km) to the surface; the
 * clock shows the real time left at Ranger's 2.62 km/s, while the game squeezes it into ~40 s.
 * Craters are drawn on many scales, so there is always more detail as you get closer.
 */

const ALT0 = 2110; // km, first picture
const ALT_END = 0.12; // km, impact
const DURATION = 40; // seconds of play
const K = Math.log(ALT0 / ALT_END) / DURATION;
const SPEED = 2.62; // km/s at impact
const RECHARGE = 0.32;
const TARGET_EVERY = 4.2;
const LEVELS = 16;

type Phase = "intro" | "play" | "done";
type Target = { x: number; y: number; r: number; born: number; hit: boolean };

const fmtAlt = (km: number) => (km >= 10 ? `${Math.round(km).toLocaleString()} km` : km >= 1 ? `${km.toFixed(1)} km` : `${Math.round(km * 1000)} m`);

export default function RangerGame() {
  const { ref: canvas, size, ctx } = useCanvas();
  const [phase, setPhase] = useState<Phase>("intro");
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [result, setResult] = useState({ photos: 0, targets: 0, offered: 0, closest: 0 });
  const s = useRef({ t: 0, alt: ALT0, last: -9, flash: 0, photos: 0, targets: 0, offered: 0, closest: ALT0, target: null as Target | null, nextTarget: 3, dead: 0 });
  const altEl = useRef<HTMLSpanElement>(null);
  const clockEl = useRef<HTMLSpanElement>(null);
  const countEl = useRef<HTMLSpanElement>(null);
  const ringEl = useRef<SVGCircleElement>(null);
  const thumb = useRef<HTMLCanvasElement | null>(null);

  const start = () => {
    s.current = { t: 0, alt: ALT0, last: -9, flash: 0, photos: 0, targets: 0, offered: 0, closest: ALT0, target: null, nextTarget: 3, dead: 0 };
    setThumbs([]);
    setPhase("play");
  };

  const snap = () => {
    const g = s.current;
    if (phase !== "play" || g.dead || g.t - g.last < RECHARGE) return;
    g.last = g.t;
    g.flash = 1;
    g.photos++;
    g.closest = g.alt;
    const tg = g.target;
    if (tg && !tg.hit) {
      // A target counts when it is inside the middle of the frame.
      const { w, h } = size.current;
      const sc = w / 2 / (g.alt * 0.45);
      const dx = Math.abs(tg.x * sc);
      const dy = Math.abs(tg.y * sc);
      if (dx < w * 0.36 && dy < h * 0.36) {
        tg.hit = true;
        g.targets++;
      }
    }
    // Keep a little copy of the frame for the film strip.
    const c = canvas.current;
    if (c) {
      thumb.current ??= document.createElement("canvas");
      const tc = thumb.current;
      tc.width = 120;
      tc.height = 90;
      const tg2 = tc.getContext("2d");
      if (tg2) {
        tg2.filter = "grayscale(1) contrast(1.15)";
        tg2.drawImage(c, 0, 0, 120, 90);
        const url = tc.toDataURL("image/jpeg", 0.6);
        setThumbs((t) => [url, ...t].slice(0, 14));
      }
    }
  };

  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        snap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useFrame((dt) => {
    const g = s.current;
    const c = ctx();
    if (!c) return;
    const { w, h } = size.current;

    if (g.dead) {
      g.dead += dt;
      drawStatic(c, w, h);
      if (g.dead > 1.3) {
        setResult({ photos: g.photos, targets: g.targets, offered: g.offered, closest: g.closest });
        setPhase("done");
      }
      return;
    }

    g.t += dt;
    g.alt = Math.max(ALT_END, ALT0 * Math.exp(-K * g.t));
    g.flash = Math.max(0, g.flash - dt * 4);

    // A new target crater: a spot in view the team wants a picture of.
    if (g.t > g.nextTarget && g.alt > 0.6) {
      const hw = g.alt * 0.45;
      const a = hash2(Math.floor(g.t * 10), 7) * Math.PI * 2;
      const d = hw * (0.15 + 0.35 * hash2(Math.floor(g.t * 10), 9));
      g.target = { x: Math.cos(a) * d, y: Math.sin(a) * d * (h / w), r: hw * 0.09, born: g.t, hit: false };
      g.offered++;
      g.nextTarget = g.t + TARGET_EVERY;
    }

    drawMoon(c, w, h, g.alt, g.t);

    const tg = g.target;
    if (tg) {
      const age = g.t - tg.born;
      const sc = w / 2 / (g.alt * 0.45);
      const x = w / 2 + tg.x * sc;
      const y = h / 2 + tg.y * sc;
      const r = Math.max(14, tg.r * sc);
      const fade = tg.hit ? clamp(1 - age * 0.8) : clamp(Math.min(age * 4, (3.2 - age) * 2));
      if (fade <= 0 || r > w) g.target = null;
      else {
        c.save();
        c.globalAlpha = fade;
        c.strokeStyle = tg.hit ? "#8c9eff" : "#ffd28a";
        c.lineWidth = 2.5;
        c.setLineDash(tg.hit ? [] : [8, 6]);
        c.lineDashOffset = -g.t * 30;
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.stroke();
        c.setLineDash([]);
        c.font = "600 12px ui-monospace, monospace";
        c.fillStyle = c.strokeStyle;
        c.textAlign = "center";
        c.fillText(tg.hit ? "GOT IT" : "TARGET", x, y - r - 8);
        c.restore();
      }
    }

    // Camera frame corners and the white flash of a picture.
    c.strokeStyle = "rgba(255,255,255,0.55)";
    c.lineWidth = 2;
    const fx = w * 0.14;
    const fy = h * 0.14;
    const L = Math.min(w, h) * 0.06;
    for (const [px, py, sx, sy] of [
      [fx, fy, 1, 1],
      [w - fx, fy, -1, 1],
      [fx, h - fy, 1, -1],
      [w - fx, h - fy, -1, -1],
    ]) {
      c.beginPath();
      c.moveTo(px, py + sy * L);
      c.lineTo(px, py);
      c.lineTo(px + sx * L, py);
      c.stroke();
    }
    if (g.flash > 0) {
      c.fillStyle = `rgba(255,255,255,${g.flash * 0.55})`;
      c.fillRect(0, 0, w, h);
    }

    if (altEl.current) altEl.current.textContent = fmtAlt(g.alt);
    if (clockEl.current) clockEl.current.textContent = `T−${(g.alt / SPEED).toFixed(g.alt / SPEED < 60 ? 1 : 0)} s`;
    if (countEl.current) countEl.current.textContent = String(g.photos);
    if (ringEl.current) ringEl.current.style.strokeDashoffset = String(176 * (1 - clamp((g.t - g.last) / RECHARGE)));

    if (g.alt <= ALT_END) g.dead = 0.0001;
  }, phase === "play");

  return (
    <div>
      <div className={`${stage} aspect-[3/4] sm:aspect-[16/10] lg:aspect-[16/9]`} onPointerDown={(e) => e.target === e.currentTarget.firstChild && snap()}>
        <canvas ref={canvas} className="absolute inset-0 h-full w-full bg-[#77746f]" />

        {phase === "play" && (
          <>
            <div className="pointer-events-none absolute top-3 left-3 flex gap-2 sm:top-4 sm:left-4">
              <Readout label="Altitude">
                <span ref={altEl}>2,110 km</span>
              </Readout>
              <Readout label="Impact in" className="hidden sm:block">
                <span ref={clockEl}>T−805 s</span>
              </Readout>
            </div>
            <div className="pointer-events-none absolute top-3 right-3 sm:top-4 sm:right-4">
              <Readout label="Pictures">
                <span ref={countEl}>0</span>
              </Readout>
            </div>
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                snap();
              }}
              aria-label="Take a picture"
              className="absolute bottom-5 left-1/2 grid h-[76px] w-[76px] -translate-x-1/2 place-items-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur-md active:scale-95"
            >
              <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
                <circle ref={ringEl} cx="32" cy="32" r="28" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="176" strokeDashoffset="0" strokeLinecap="round" />
              </svg>
              <span className="h-12 w-12 rounded-full bg-white" />
            </button>
          </>
        )}

        {phase === "intro" && (
          <Overlay
            kicker="31 July 1964"
            title="Last Pictures"
            actions={
              <button className={btn.primary} onClick={start}>
                Start the dive
              </button>
            }
          >
            Ranger 7 had no way to land. It fell toward the Moon taking pictures all the way down. Tap the screen (or press Space) to take a picture. When a target
            ring appears, get it in the frame and snap it.
          </Overlay>
        )}

        {phase === "done" && (
          <Overlay
            kicker="Signal lost"
            title={result.photos >= 60 ? "What a dive!" : result.photos >= 25 ? "Pictures home" : "Keep shooting"}
            actions={
              <button className={btn.primary} onClick={start}>
                Dive again
              </button>
            }
          >
            <div className="grid grid-cols-3 gap-2">
              <Stat value={String(result.photos)} label="pictures" />
              <Stat value={`${result.targets}/${result.offered}`} label="targets" />
              <Stat value={fmtAlt(result.closest)} label="closest picture" />
            </div>
            <p className="mt-4">Ranger 7 sent 4,308 pictures in its last 17 minutes. Its last full frame came about 2.3 seconds before it hit.</p>
          </Overlay>
        )}
      </div>

      {/* film strip */}
      <div className="mt-3 flex h-[68px] gap-1.5 overflow-hidden rounded-2xl bg-ink p-1.5" aria-label="Your pictures">
        {thumbs.length === 0 ? (
          <p className="grid w-full place-items-center font-mono text-[11px] tracking-[0.14em] text-white/40 uppercase">Your pictures appear here</p>
        ) : (
          thumbs.map((u, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={thumbs.length - i} src={u} alt="" className="h-full w-auto shrink-0 rounded-md" />
          ))
        )}
      </div>
    </div>
  );
}

/** The Moon below: grey ground and craters on every scale, lit from the left. */
function drawMoon(c: CanvasRenderingContext2D, w: number, h: number, alt: number, t: number) {
  const hw = alt * 0.45; // half the view, in km
  const sc = w / 2 / hw; // px per km
  // the camera drifts a little as the spacecraft falls
  const ox = Math.sin(t * 0.21) * hw * 0.04;
  const oy = Math.cos(t * 0.17) * hw * 0.04;

  c.fillStyle = "#7b7873";
  c.fillRect(0, 0, w, h);

  for (let L = 0; L < LEVELS; L++) {
    const R = 70 * Math.pow(0.5, L); // typical crater radius at this level, km
    const rs = R * sc;
    if (rs < 6 || rs > w * 1.6) continue;
    const cell = R * 3.4;
    const x0 = Math.floor((ox - hw) / cell) - 1;
    const x1 = Math.ceil((ox + hw) / cell) + 1;
    const vh = hw * (h / w);
    const y0 = Math.floor((oy - vh) / cell) - 1;
    const y1 = Math.ceil((oy + vh) / cell) + 1;
    const alpha = clamp((rs - 6) / 18);
    // fewer big craters than small ones, like a real cratered plain
    const keep = 0.16 + 0.22 * clamp((L - 3) / 8);
    for (let i = x0; i <= x1; i++) {
      for (let j = y0; j <= y1; j++) {
        if (hash2(i, j, L) > keep) continue;
        const k = hash2(i, j, L + 40);
        const r = R * (0.35 + 1.4 * k * k);
        const cx = (i + hash2(i, j, L + 80)) * cell;
        const cy = (j + hash2(i, j, L + 120)) * cell;
        const x = w / 2 + (cx - ox) * sc;
        const y = h / 2 + (cy - oy) * sc;
        const pr = r * sc;
        if (x + pr < 0 || x - pr > w || y + pr < 0 || y - pr > h) continue;
        const tone = 0.9 + 0.2 * hash2(i, j, L + 160);
        const age = 0.45 + 0.55 * hash2(i, j, L + 200); // old craters are softer
        c.globalAlpha = alpha * age;
        c.fillStyle = `rgb(${62 * tone},${60 * tone},${57 * tone})`;
        c.beginPath();
        c.arc(x, y, pr, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = `rgb(${112 * tone},${109 * tone},${104 * tone})`;
        c.beginPath();
        c.arc(x + pr * 0.16, y + pr * 0.05, pr * 0.86, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = `rgba(206,202,194,${0.38 * tone})`;
        c.lineWidth = Math.max(1, pr * 0.06);
        c.beginPath();
        c.arc(x, y, pr * 0.96, -Math.PI * 0.38, Math.PI * 0.38);
        c.stroke();
      }
    }
  }
  c.globalAlpha = 1;

  // vidicon look: soft vignette and faint scan lines
  const v = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.55)");
  c.fillStyle = v;
  c.fillRect(0, 0, w, h);
  c.fillStyle = "rgba(0,0,0,0.08)";
  for (let y = 0; y < h; y += 3) c.fillRect(0, y, w, 1);
}

function drawStatic(c: CanvasRenderingContext2D, w: number, h: number) {
  const n = 1400;
  c.fillStyle = "#0c0a22";
  c.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) {
    const g = Math.random() * 255;
    c.fillStyle = `rgb(${g},${g},${g})`;
    c.fillRect(Math.random() * w, Math.random() * h, 3, 2);
  }
}
