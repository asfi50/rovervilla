"use client";

import { useEffect, useRef, useState } from "react";
import { Overlay, Stat, btn, clamp, stage, useCanvas, useFrame } from "@/app/components/games/kit";

/*
 * Trust the Signal: you are the landing computer. Below 40 m the radar stops and the engines'
 * dust hides the ground, so all you have are three touchdown sensors, one per leg. Shut the
 * engines off only when the lander is really down. Round three plays out the investigation's
 * most likely cause: a sensor jolt from the legs unfolding is still remembered later on.
 */

type Phase = "intro" | "play" | "result" | "done";
type Step = "chute" | "powered" | "blind" | "fall" | "landed" | "crashed" | "tipped";
type Round = { speed: number; blips: number[]; latch: boolean };

const G = 3.71; // Mars gravity, m/s²
const ROUNDS: Round[] = [
  { speed: 8, blips: [], latch: false },
  { speed: 7, blips: [0.9, 2.3, 3.6], latch: false },
  { speed: 7.6, blips: [2.0], latch: true },
];
const TIP_AFTER = 1.6; // seconds of engine on the ground before the lander tips

type Outcome = { kind: "landed" | "crashed" | "tipped"; points: number; detail: string };

export default function PolarGame() {
  const { ref: canvas, size, ctx } = useCanvas();
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [flag, setFlag] = useState(false);
  const s = useRef({ t: 0, step: "chute" as Step, alt: 8000, v: 80, lights: [false, false, false], blind: 0, down: 0, cutAlt: 0, latched: false, auto: 0, flash: 0, done: false });
  const lightEls = useRef<(HTMLSpanElement | null)[]>([]);
  const altEl = useRef<HTMLSpanElement>(null);
  const stepEl = useRef<HTMLSpanElement>(null);
  const cfg = useRef(ROUNDS[0]);

  const begin = (r: number) => {
    cfg.current = ROUNDS[r];
    s.current = { t: 0, step: "chute", alt: 8000, v: 80, lights: [false, false, false], blind: 0, down: 0, cutAlt: 0, latched: false, auto: 0, flash: 0, done: false };
    setRound(r);
    setFlag(false);
    setPhase("play");
  };

  const finish = (o: Outcome) => {
    if (s.current.done) return;
    s.current.done = true;
    setFlag(false);
    setOutcomes((list) => [...list, o]);
    window.setTimeout(() => setPhase("result"), 1300);
  };

  const cut = () => {
    const g = s.current;
    if (phase !== "play" || g.done) return;
    if (g.step === "powered" || g.step === "blind") {
      g.step = "fall";
      g.cutAlt = g.alt;
    } else if (g.step === "landed") {
      const late = g.t - g.down;
      finish({ kind: "landed", points: Math.round(100 - clamp(late / TIP_AFTER) * 40), detail: `Engines off ${late.toFixed(1)} s after touchdown.` });
    }
  };

  const resetFlag = () => {
    s.current.latched = false;
    s.current.lights = [false, false, false];
    setFlag(false);
  };

  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        cut();
      }
      if (e.code === "KeyR") resetFlag();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useFrame(
    (dt) => {
      const c = ctx();
      if (!c) return;
      const { w, h } = size.current;
      const g = s.current;
      const rc = cfg.current;
      g.t += dt;
      g.flash = Math.max(0, g.flash - dt * 2);

      if (g.step === "chute") {
        g.alt -= g.v * dt * 30;
        if (g.alt <= 1500) {
          // legs swing down: the jolt trips a sensor for a moment
          g.alt = 1500;
          g.step = "powered";
          g.v = 75;
          g.blind = g.t;
          g.lights = [false, true, false];
          window.setTimeout(() => {
            if (!s.current.latched) s.current.lights = [false, false, false];
          }, 220);
          if (rc.latch) g.latched = true;
        }
      } else if (g.step === "powered") {
        // braking from 1,500 m to 40 m in about four seconds
        const since = g.t - g.blind;
        g.alt = 40 + 1460 * Math.exp(-1.8 * since);
        g.v = Math.max(rc.speed, 1460 * 1.8 * Math.exp(-1.8 * since) * 0.02);
        if (g.alt <= 41) {
          g.alt = 40;
          g.step = "blind";
          g.blind = g.t;
          if (g.latched) {
            // the remembered jolt reads as "landed" the moment the check switches on
            g.lights = [false, true, false];
            g.auto = g.t + 2.2;
            setFlag(true);
          }
        }
      } else if (g.step === "blind") {
        g.v = rc.speed;
        g.alt -= g.v * dt;
        const since = g.t - g.blind;
        if (!g.latched) g.lights = [false, false, false];
        for (const b of rc.blips) if (since > b && since < b + 0.16) g.lights[Math.floor(b * 7) % 3] = true;
        if (g.latched && g.auto && g.t > g.auto) {
          g.step = "fall";
          g.cutAlt = g.alt;
          g.latched = false;
          setFlag(false);
        }
        if (g.alt <= 0) {
          g.alt = 0;
          g.step = "landed";
          g.down = g.t;
          g.lights = [true, true, true];
        }
      } else if (g.step === "fall") {
        g.v += G * dt;
        g.alt -= g.v * dt;
        if (g.alt <= 0) {
          g.alt = 0;
          g.step = "crashed";
          g.flash = 1;
          finish({ kind: "crashed", points: 0, detail: `Engines off ${Math.round(g.cutAlt)} m up. It hit the ground at ${Math.round(g.v)} m/s.` });
        }
      } else if (g.step === "landed") {
        if (g.t - g.down > TIP_AFTER) {
          g.step = "tipped";
          finish({ kind: "tipped", points: 20, detail: "The engines kept pushing on the ground and the lander tipped." });
        }
      }

      drawScene(c, w, h, g);

      const show = g.step === "blind" || g.step === "landed" || g.step === "fall" || g.step === "crashed" || g.step === "tipped";
      if (altEl.current) altEl.current.textContent = show ? "— — —" : `${Math.round(g.alt).toLocaleString()} m`;
      if (stepEl.current)
        stepEl.current.textContent =
          g.step === "chute" ? "PARACHUTE" : g.step === "powered" ? "ENGINES · RADAR" : g.step === "blind" ? "RADAR OFF · BLIND" : g.step === "landed" ? "?" : "—";
      g.lights.forEach((on, i) => {
        const el = lightEls.current[i];
        if (el) el.dataset.on = on ? "1" : "0";
      });
    },
    phase === "play",
  );

  const total = outcomes.reduce((a, o) => a + o.points, 0);
  const last = outcomes[outcomes.length - 1];

  return (
    <div className={`${stage} aspect-[3/4] sm:aspect-[16/10] lg:aspect-[16/9]`}>
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />

      {phase === "play" && (
        <>
          <div className="pointer-events-none absolute top-3 left-3 rounded-2xl bg-black/45 p-3 ring-1 ring-white/10 backdrop-blur-md sm:top-4 sm:left-4">
            <p className="font-mono text-[10px] tracking-[0.14em] text-white/55 uppercase">
              Round {round + 1}/3 · <span ref={stepEl}>PARACHUTE</span>
            </p>
            <p className="mt-1 font-mono text-[15px] tabular-nums">
              Radar <span ref={altEl}>8,000 m</span>
            </p>
            <p className="mt-2 font-mono text-[10px] tracking-[0.14em] text-white/55 uppercase">Leg sensors</p>
            <div className="mt-1.5 flex gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  ref={(el) => {
                    lightEls.current[i] = el;
                  }}
                  data-on="0"
                  className="h-5 w-5 rounded-full bg-white/10 ring-1 ring-white/20 transition-colors duration-75 data-[on=1]:bg-[#7dffb0] data-[on=1]:shadow-[0_0_14px_#7dffb0]"
                />
              ))}
            </div>
          </div>

          {flag && (
            <div className="absolute top-3 right-3 max-w-[56%] rounded-2xl bg-mars/90 p-3 text-[13px] leading-snug font-semibold ring-1 ring-white/20 sm:top-4 sm:right-4">
              Touchdown flag is set. The computer will cut the engines!
              <button className="mt-2 block w-full rounded-full bg-white px-3 py-2 text-[13px] text-ink" onClick={resetFlag}>
                Clear old signal (R)
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={cut}
            className="absolute right-4 bottom-4 rounded-full bg-[#ff4d3d] px-6 py-4 text-[15px] font-bold tracking-wide text-white shadow-[0_10px_30px_-8px_rgba(255,77,61,0.8)] ring-2 ring-white/30 active:scale-95 sm:right-6 sm:bottom-6"
          >
            ENGINES OFF
          </button>
        </>
      )}

      {phase === "result" && last && (
        <Overlay
          kicker={`Round ${round + 1} of 3`}
          title={last.kind === "landed" ? "Down safely" : last.kind === "crashed" ? "Too early" : "Too late"}
          actions={
            <button className={btn.primary} onClick={() => (round < 2 ? begin(round + 1) : setPhase("done"))}>
              {round < 2 ? "Next landing" : "See the verdict"}
            </button>
          }
        >
          <p>{last.detail}</p>
          {round === 0 && last.kind === "landed" && <p className="mt-2">Notice the blink when the legs unfolded? That was not the ground.</p>}
          {round === 1 && <p className="mt-2">Real touchdown: all three lights come on and stay on. A single blink is noise.</p>}
          {round === 2 && (
            <p className="mt-2">
              That flag was the jolt from the legs unfolding, remembered all the way down. Investigators think this is what happened to Mars Polar Lander.
            </p>
          )}
        </Overlay>
      )}

      {phase === "intro" && (
        <Overlay
          kicker="3 December 1999"
          title="Trust the Signal"
          actions={
            <button
              className={btn.primary}
              onClick={() => {
                setOutcomes([]);
                begin(0);
              }}
            >
              Start descent
            </button>
          }
        >
          You are the landing computer. Below 40 m the radar stops and dust hides the ground. Press <strong>Engines off</strong> (or Space) only when the lander
          is really down: all three leg lights on, and staying on.
        </Overlay>
      )}

      {phase === "done" && (
        <Overlay
          kicker="Your landings"
          title={total >= 240 ? "Safe hands" : total >= 120 ? "Shaky landings" : "Hard lessons"}
          actions={
            <button
              className={btn.primary}
              onClick={() => {
                setOutcomes([]);
                begin(0);
              }}
            >
              Land again
            </button>
          }
        >
          <div className="grid grid-cols-3 gap-2">
            {outcomes.map((o, i) => (
              <Stat key={i} value={String(o.points)} label={`round ${i + 1}`} />
            ))}
          </div>
          <p className="mt-4">
            Mars Polar Lander sent no data during its descent, so nobody saw its last moments. The review board&rsquo;s most likely cause: a false touchdown
            signal shut the engines off in the air.
          </p>
        </Overlay>
      )}
    </div>
  );
}

function drawScene(c: CanvasRenderingContext2D, w: number, h: number, g: { alt: number; step: Step; t: number; flash: number }) {
  const sky = c.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#2a1d2e");
  sky.addColorStop(0.6, "#c99a86");
  sky.addColorStop(1, "#e7c7b4");
  c.fillStyle = sky;
  c.fillRect(0, 0, w, h);

  const landerY = h * 0.42;
  const near = 70; // metres shown between the lander and the bottom of the screen
  const groundY = g.alt > near ? h + 40 : landerY + 34 + (g.alt / near) * (h - landerY - 34);
  // distant polar layered terrain, rising slowly as we fall
  const far = h * 0.78 + clamp(g.alt / 8000) * h * 0.2;
  c.fillStyle = "#d9cfc8";
  c.beginPath();
  c.moveTo(0, far);
  for (let x = 0; x <= w; x += 20) c.lineTo(x, far - Math.sin(x * 0.01) * 10 - Math.sin(x * 0.033) * 5);
  c.lineTo(w, h);
  c.lineTo(0, h);
  c.fill();
  c.strokeStyle = "rgba(150,120,110,0.35)";
  for (let k = 1; k < 5; k++) {
    c.beginPath();
    c.moveTo(0, far + k * 9);
    for (let x = 0; x <= w; x += 20) c.lineTo(x, far + k * 9 - Math.sin(x * 0.01 + k) * 6);
    c.stroke();
  }
  // the ground right below
  if (groundY < h + 40) {
    c.fillStyle = "#efe7e2";
    c.fillRect(0, groundY, w, h - groundY);
    c.fillStyle = "#cbbdb4";
    c.fillRect(0, groundY, w, 3);
  }

  const x = w / 2;
  let y = landerY;
  if (g.step === "landed" || g.step === "tipped" || g.step === "crashed") y = groundY - 34;
  const tilt = g.step === "tipped" ? 0.9 : 0;
  c.save();
  c.translate(x, y);
  c.rotate(tilt);
  if (g.step === "chute") {
    c.strokeStyle = "rgba(255,255,255,0.7)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(-14, -12);
    c.lineTo(-40, -110);
    c.moveTo(14, -12);
    c.lineTo(40, -110);
    c.stroke();
    c.fillStyle = "#f5f1ea";
    c.beginPath();
    c.ellipse(0, -112, 48, 24, 0, Math.PI, 0);
    c.fill();
    c.fillStyle = "#ff7b4a";
    c.fillRect(-48, -114, 96, 3);
  }
  const legs = g.step !== "chute";
  c.strokeStyle = "#3a3540";
  c.lineWidth = 3;
  c.beginPath();
  if (legs) {
    c.moveTo(-14, 6);
    c.lineTo(-26, 32);
    c.moveTo(14, 6);
    c.lineTo(26, 32);
    c.moveTo(0, 8);
    c.lineTo(0, 32);
  } else {
    c.moveTo(-14, 6);
    c.lineTo(-20, 12);
    c.moveTo(14, 6);
    c.lineTo(20, 12);
  }
  c.stroke();
  if (legs) {
    c.fillStyle = "#3a3540";
    for (const fx of [-26, 0, 26]) c.fillRect(fx - 5, 31, 10, 3);
  }
  c.fillStyle = "#d8d3c8";
  c.beginPath();
  c.moveTo(-22, -10);
  c.lineTo(22, -10);
  c.lineTo(18, 8);
  c.lineTo(-18, 8);
  c.closePath();
  c.fill();
  c.fillStyle = "#e3b54a";
  c.fillRect(-18, -16, 36, 6);
  c.fillStyle = "#3f5bd9";
  c.fillRect(-34, -14, 12, 3);
  c.fillRect(22, -14, 12, 3);
  // engine flames
  const firing = g.step === "powered" || g.step === "blind" || g.step === "landed";
  if (firing) {
    const f = 14 + Math.random() * 8;
    c.fillStyle = "rgba(255,190,120,0.9)";
    for (const fx of [-10, 10]) {
      c.beginPath();
      c.moveTo(fx - 4, 8);
      c.lineTo(fx, 8 + f);
      c.lineTo(fx + 4, 8);
      c.fill();
    }
  }
  c.restore();

  // dust kicked up by the engines hides the ground below 40 m
  if (g.step === "blind" || g.step === "landed" || g.step === "fall") {
    const k = 0.9 + 0.08 * clamp((40 - g.alt) / 10);
    const dust = c.createLinearGradient(0, landerY - 10, 0, h);
    dust.addColorStop(0, "rgba(214,190,175,0)");
    dust.addColorStop(0.25, `rgba(214,190,175,${k})`);
    dust.addColorStop(1, `rgba(200,176,160,${k})`);
    c.fillStyle = dust;
    c.fillRect(0, landerY - 10, w, h);
    c.font = "600 11px ui-monospace, monospace";
    c.fillStyle = `rgba(60,40,40,${k * 0.8})`;
    c.textAlign = "center";
    c.fillText("DUST · NO VIEW OF THE GROUND", w / 2, h * 0.86);
  }
  if (g.flash > 0) {
    c.fillStyle = `rgba(255,255,255,${g.flash})`;
    c.fillRect(0, 0, w, h);
  }
}
