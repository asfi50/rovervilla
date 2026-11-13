"use client";

import { useState } from "react";
import { Overlay, Stat, btn, clamp, stage } from "@/app/components/games/kit";

/*
 * Chasing Sunshine: a solar-powered rover, one Martian day (sol) at a time. Each sol, drive,
 * do science or rest. Dust settles on the panels, winters come round, storms darken the sky,
 * and now and then a gust of wind cleans the panels. Run the battery flat three times and the
 * rover goes quiet. The plan was 90 sols. How long can you last?
 */

type Rover = "Spirit" | "Opportunity";
type State = {
  sol: number;
  battery: number;
  dust: number;
  tau: number;
  storm: number; // sols of storm left
  km: number;
  finds: number;
  faults: number;
  log: string[];
  seed: number;
};

const NIGHT = 22; // heaters and the night, every sol
const COST = { drive: 30, science: 24, rest: 0 };
const LIMIT = 600;

function rnd(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const season = (sol: number) => 0.8 + 0.2 * Math.cos((sol / 170) * Math.PI * 2);
const power = (s: State) =>
  64 * (1 - s.dust) * Math.exp(-(s.tau - 0.5) * 0.42) * season(s.sol);

function step(s: State, action: keyof typeof COST): State {
  const r = (k: number) => rnd(s.seed + s.sol * 7.13 + k);
  const n: State = { ...s, sol: s.sol + 1, log: [] };
  const events: string[] = [];

  if (action === "drive") {
    const d = 0.04 + r(1) * 0.1;
    n.km += d;
    events.push(`Drove ${Math.round(d * 1000)} m.`);
  } else if (action === "science") {
    n.finds += 1;
    events.push(
      r(2) < 0.3
        ? "Ground into a rock and found something new."
        : "Studied a rock up close.",
    );
  } else events.push("Rested to save power.");

  // dust, wind and storms
  n.dust = clamp(
    n.dust + 0.004 + r(3) * 0.006 + (n.storm > 0 ? 0.012 : 0),
    0,
    0.9,
  );
  if (r(4) < 0.035) {
    const clean = 0.2 + r(5) * 0.35;
    n.dust = clamp(n.dust - clean, 0, 1);
    events.push("A gust of wind blew dust off the panels!");
  }
  const stormChance = n.sol < 30 ? 0 : 0.006 + Math.min(0.012, n.sol / 40000);
  if (n.storm <= 0 && r(6) < stormChance) {
    n.storm = 12 + Math.floor(r(7) * 22);
    events.push("A dust storm is rising. The sky is getting dark.");
  }
  if (n.storm > 0) {
    n.storm -= 1;
    n.tau = Math.min(1 + r(8) * 0.4 + 4.5, n.tau + 0.9);
    if (n.storm === 0) events.push("The storm is clearing.");
  } else n.tau = Math.max(0.5, n.tau - 0.35);

  n.battery = Math.min(100, n.battery + power(n) - NIGHT - COST[action]);
  if (n.battery < 0) {
    n.faults += 1;
    n.battery = 6;
    events.push(
      n.faults >= 3
        ? "Not enough power to wake up."
        : "Low-power fault! The rover shut itself down to survive the night.",
    );
  }
  if (n.sol === 90) events.push("Sol 90: primary mission complete!");
  n.log = [...events.reverse(), ...s.log].slice(0, 5);
  return n;
}

const fresh = (seed: number): State => ({
  sol: 1,
  battery: 80,
  dust: 0.05,
  tau: 0.5,
  storm: 0,
  km: 0,
  finds: 0,
  faults: 0,
  log: ["Landed. The panels are clean and the Sun is up."],
  seed,
});

export default function SunshineGame() {
  const [rover, setRover] = useState<Rover | null>(null);
  const [s, setS] = useState<State>(() => fresh(1));
  const over = s.faults >= 3 || s.sol >= LIMIT;
  const income = power(s);

  const act = (a: keyof typeof COST) => {
    if (over) return;
    setS((x) => step(x, a));
  };
  const restFive = () => {
    if (over) return;
    setS((x) => {
      let y = x;
      for (let i = 0; i < 5 && y.faults < 3; i++) y = step(y, "rest");
      return y;
    });
  };
  const start = (r: Rover) => {
    setRover(r);
    setS(fresh(Math.floor(Math.random() * 100000)));
  };

  const sky = clamp((s.tau - 0.5) / 5);
  const balance = Math.round(income - NIGHT);

  return (
    <div className={`${stage} flex min-h-[560px] flex-col`}>
      {/* the scene: sky darkens with dust in the air, the panels with dust on them */}
      <div className="relative h-[230px] shrink-0 sm:h-[300px] lg:h-[340px]">
        <svg
          viewBox="0 0 800 360"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={mix("#c9a184", "#3b2016", sky)} />
              <stop offset="1" stopColor={mix("#e6c3a4", "#6b3a26", sky)} />
            </linearGradient>
          </defs>
          <rect width="800" height="360" fill="url(#sky)" />
          <circle
            cx="620"
            cy="90"
            r="26"
            fill="#fff6e2"
            opacity={clamp(1 - sky * 1.1, 0.05, 1)}
          />
          <circle
            cx="620"
            cy="90"
            r="60"
            fill="#fff6e2"
            opacity={clamp(0.25 - sky * 0.3, 0, 1)}
          />
          <path
            d="M0 250 Q 160 215 330 240 T 800 232 V 360 H 0Z"
            fill={mix("#b06d4c", "#4a2518", sky)}
          />
          <path
            d="M0 290 Q 220 270 420 292 T 800 284 V 360 H 0Z"
            fill={mix("#8f4f35", "#3a1c12", sky)}
          />
          {/* rover */}
          <g transform={`translate(${310 + ((s.km * 900) % 120)} 238)`}>
            <rect
              x="-58"
              y="-34"
              width="116"
              height="10"
              rx="2"
              fill="#2f3a7a"
            />
            <rect
              x="-58"
              y="-34"
              width="116"
              height="10"
              rx="2"
              fill="#c8a07a"
              opacity={s.dust}
            />
            <rect
              x="-26"
              y="-24"
              width="52"
              height="16"
              rx="3"
              fill="#d9d4c9"
            />
            <rect x="-4" y="-70" width="5" height="40" fill="#2e2b33" />
            <rect x="-12" y="-78" width="22" height="9" rx="2" fill="#d9d4c9" />
            {[-34, 0, 34].map((wx) => (
              <circle key={wx} cx={wx} cy="2" r="9" fill="#2e2b33" />
            ))}
          </g>
          <rect width="800" height="360" fill="#7a4a30" opacity={sky * 0.35} />
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-night" />
      </div>

      <div className="relative -mt-6 flex flex-1 flex-col p-4 sm:p-6">
        <div className="mt-auto grid gap-4 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div>
            <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
              <div>
                <p className="font-mono text-[11px] tracking-[0.14em] text-white/60 uppercase">
                  {rover ?? "Rover"} · Sol
                </p>
                <p className="display text-[44px] leading-none tabular-nums sm:text-[56px]">
                  {s.sol}
                </p>
              </div>
              <Gauge
                label="Battery"
                value={s.battery / 100}
                tone={s.battery < 25 ? "#ff6b57" : "#7dffb0"}
                text={`${Math.round(s.battery)}%`}
              />
              <Gauge
                label="Panel dust"
                value={s.dust}
                tone="#e2b48a"
                text={`${Math.round(s.dust * 100)}%`}
              />
              <Gauge
                label="Sky haze"
                value={clamp((s.tau - 0.5) / 5)}
                tone="#c9a184"
                text={s.tau < 1 ? "clear" : s.tau < 3 ? "hazy" : "storm"}
              />
            </div>
            <p className="mt-2 font-mono text-[12px] text-white/60">
              Sun brings +{Math.round(income)} · night costs −{NIGHT} ·{" "}
              <span
                className={balance < 0 ? "text-[#ff8a7a]" : "text-[#7dffb0]"}
              >
                {balance >= 0 ? "+" : ""}
                {balance} before you act
              </span>{" "}
              · faults {s.faults}/3
            </p>
            <ul
              className="mt-2 space-y-0.5 text-[13px] leading-snug text-white/80"
              aria-live="polite"
            >
              {s.log.slice(0, 3).map((l, i) => (
                <li
                  key={`${s.sol}-${i}`}
                  className={
                    i === 0 ? "font-semibold text-white" : "text-white/55"
                  }
                >
                  {l}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
            <Action
              label="Drive"
              sub={`−${COST.drive} power`}
              disabled={over || s.battery < COST.drive * 0.6}
              onClick={() => act("drive")}
            />
            <Action
              label="Science"
              sub={`−${COST.science} power`}
              disabled={over || s.battery < COST.science * 0.6}
              onClick={() => act("science")}
            />
            <Action
              label="Rest"
              sub="save power"
              disabled={over}
              onClick={() => act("rest")}
            />
            <Action
              label="Rest 5 sols"
              sub="ride it out"
              disabled={over}
              onClick={restFive}
            />
          </div>
        </div>
      </div>

      {!rover && (
        <Overlay
          kicker="January 2004"
          title="Chasing Sunshine"
          actions={
            <>
              <button className={btn.primary} onClick={() => start("Spirit")}>
                Play as Spirit
              </button>
              <button
                className={btn.primary}
                onClick={() => start("Opportunity")}
              >
                Play as Opportunity
              </button>
            </>
          }
        >
          You run on sunlight. Every sol, choose: drive, do science, or rest.
          Dust piles up on your panels, winters and storms dim the Sun, and
          sometimes the wind cleans you off. The plan was 90 sols. How far can
          you go?
        </Overlay>
      )}

      {rover && over && (
        <Overlay
          kicker={s.sol >= LIMIT ? "Still going" : "The rover went quiet"}
          title={s.sol >= 90 ? `${s.sol} sols!` : `Sol ${s.sol}`}
          actions={
            <button className={btn.primary} onClick={() => start(rover)}>
              Land again
            </button>
          }
        >
          <div className="grid grid-cols-3 gap-2">
            <Stat value={String(s.sol)} label="sols" />
            <Stat value={`${s.km.toFixed(2)} km`} label="driven" />
            <Stat value={String(s.finds)} label="rocks studied" />
          </div>
          <p className="mt-4">
            {rover === "Opportunity"
              ? "The real Opportunity was planned for 90 sols and drove 45.16 km over more than 14 years, until a planet-wide dust storm in 2018."
              : "The real Spirit was planned for 90 sols and worked for more than six years, until it got stuck in soft sand and couldn't tilt its panels to the winter Sun."}
          </p>
        </Overlay>
      )}
    </div>
  );
}

function Gauge({
  label,
  value,
  tone,
  text,
}: {
  label: string;
  value: number;
  tone: string;
  text: string;
}) {
  return (
    <div className="min-w-[84px]">
      <p className="font-mono text-[10px] tracking-[0.14em] text-white/55 uppercase">
        {label}
      </p>
      <p className="font-mono text-[15px] tabular-nums">{text}</p>
      <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <span
          className="block h-full rounded-full transition-[width] duration-500"
          style={{ width: `${clamp(value) * 100}%`, background: tone }}
        />
      </span>
    </div>
  );
}

function Action({
  label,
  sub,
  onClick,
  disabled,
}: {
  label: string;
  sub: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-2xl bg-white/10 px-4 py-3 text-left ring-1 ring-white/15 backdrop-blur-md transition hover:bg-white/18 active:scale-[0.97] disabled:opacity-35"
    >
      <span className="block text-[15px] font-semibold">{label}</span>
      <span className="block text-[12px] text-white/60">{sub}</span>
    </button>
  );
}

/** Blend two hex colours. */
function mix(a: string, b: string, t: number) {
  const p = (h: string) =>
    [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * clamp(t))).join(",")})`;
}
