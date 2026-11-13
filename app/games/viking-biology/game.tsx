"use client";

import { useState } from "react";
import { Overlay, btn, stage } from "@/app/components/games/kit";

/*
 * Is Anything Alive? Run three of Viking's soil tests in any order, watch what comes back,
 * then decide what it means. The careful answer scores best, just as it did in 1976.
 */

type TestId = "feed" | "heat" | "organics";
type Verdict = "life" | "chemistry" | "unsure";

const TESTS: { id: TestId; name: string; real: string; ask: string; result: string }[] = [
  {
    id: "feed",
    name: "Feed the soil",
    real: "Labeled Release",
    ask: "Drip a nutrient broth tagged with radioactive carbon onto fresh soil. If something eats it, radioactive gas should come out.",
    result: "Gas came out fast, then levelled off. Something in the soil reacted with the broth.",
  },
  {
    id: "heat",
    name: "Cook it first",
    real: "Heated control",
    ask: "Heat a sample hot enough to kill Earth microbes, then feed it the same way. Living things should stop.",
    result: "Almost nothing came out. Heat stopped the reaction.",
  },
  {
    id: "organics",
    name: "Look for carbon",
    real: "GCMS",
    ask: "Bake soil and sniff the vapour for organic molecules, the carbon chemistry all known life is made of.",
    result: "No organic molecules at the instrument's detection level.",
  },
];

const VERDICTS: { id: Verdict; label: string; points: number; reply: string }[] = [
  {
    id: "life",
    label: "It's alive!",
    points: 10,
    reply: "Tempting! But life is made of carbon chemistry, and the soil showed no organic molecules. A reactive chemical can also give off gas and be broken by heat.",
  },
  {
    id: "chemistry",
    label: "It's chemistry",
    points: 40,
    reply: "That's what most scientists concluded: something reactive in the soil, not something alive. Later missions found chemicals that could explain it.",
  },
  {
    id: "unsure",
    label: "Can't tell yet",
    points: 40,
    reply: "A careful answer. NASA called the results inconclusive, and a few scientists still argue the question is open. More evidence came decades later.",
  },
];

export default function VikingGame() {
  const [phase, setPhase] = useState<"intro" | "lab" | "done">("intro");
  const [ran, setRan] = useState<TestId[]>([]);
  const [running, setRunning] = useState<TestId | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  const run = (id: TestId) => {
    if (running || ran.includes(id)) return;
    setRunning(id);
    window.setTimeout(() => {
      setRan((r) => [...r, id]);
      setRunning(null);
    }, 2600);
  };

  const v = VERDICTS.find((x) => x.id === verdict);
  const score = ran.length * 20 + (v?.points ?? 0);

  return (
    <div className={`${stage} min-h-[560px] p-4 sm:p-6 lg:p-8`}>
      {/* soft Mars light behind the lab */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_80%_0%,rgba(255,122,74,0.22),transparent_70%)]" />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] tracking-[0.16em] text-brand-glow uppercase">Chryse Planitia · July 1976</p>
          <p className="display mt-1 text-2xl sm:text-3xl">Viking&rsquo;s soil lab</p>
        </div>
        <p className="font-mono text-[12px] text-white/60">
          Tests run {ran.length}/3 · Score {score}
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {TESTS.map((t) => {
          const done = ran.includes(t.id);
          const busy = running === t.id;
          return (
            <div key={t.id} className={`flex flex-col rounded-2xl p-4 ring-1 transition sm:p-5 ${done ? "bg-white/8 ring-white/15" : "bg-white/4 ring-white/10"}`}>
              <p className="font-mono text-[10px] tracking-[0.16em] text-white/50 uppercase">{t.real}</p>
              <h3 className="display mt-1 text-xl">{t.name}</h3>
              <p className="mt-2 text-[14px] leading-snug text-white/70">{t.ask}</p>
              <Chart id={t.id} state={done ? "done" : busy ? "run" : "idle"} />
              {done ? (
                <p className="mt-3 text-[14px] leading-snug font-semibold text-[#ffd28a]">{t.result}</p>
              ) : (
                <button className={`${btn.ghost} mt-3 disabled:opacity-40`} disabled={!!running || phase !== "lab"} onClick={() => run(t.id)}>
                  {busy ? "Running…" : "Run test"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl bg-white/4 p-4 ring-1 ring-white/10 sm:p-5">
        <p className="text-[15px] font-semibold">What do the results mean?</p>
        <p className="mt-1 text-[13px] text-white/60">Run as many tests as you like first. Scientists get points for checking.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {VERDICTS.map((x) => (
            <button
              key={x.id}
              disabled={ran.length === 0 || !!running || phase !== "lab"}
              onClick={() => {
                setVerdict(x.id);
                setPhase("done");
              }}
              className={`${btn.ghost} disabled:opacity-40`}
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-[12px] text-white/45">The curves are illustrative shapes, not Viking&rsquo;s recorded data.</p>

      {phase === "intro" && (
        <Overlay
          kicker="28 July 1976"
          title="Is Anything Alive?"
          actions={
            <button className={btn.primary} onClick={() => setPhase("lab")}>
              Open the lab
            </button>
          }
        >
          Viking 1 has scooped up Martian soil. You have its tiny onboard lab. Run the tests, look at what comes back, then make the call.
        </Overlay>
      )}

      {phase === "done" && v && (
        <Overlay
          kicker={`Score ${score} / 100`}
          title={v.points === 40 && ran.length === 3 ? "Careful scientist" : v.points === 40 ? "Good call" : "Not so fast"}
          actions={
            <button
              className={btn.primary}
              onClick={() => {
                setRan([]);
                setVerdict(null);
                setPhase("lab");
              }}
            >
              Run the lab again
            </button>
          }
        >
          <p>{v.reply}</p>
          {ran.length < 3 && <p className="mt-2 text-white/60">Tip: you skipped {3 - ran.length === 1 ? "a test" : `${3 - ran.length} tests`}. Each one you run is worth points.</p>}
          <p className="mt-2">In 2008, the Phoenix lander found perchlorate in Martian soil, a salt that can change organic molecules when heated.</p>
        </Overlay>
      )}
    </div>
  );
}

/** A small detector readout: radioactive gas over the days for the feeding tests, molecule peaks for the oven. */
function Chart({ id, state }: { id: TestId; state: "idle" | "run" | "done" }) {
  const shown = state !== "idle";
  const path =
    id === "feed"
      ? "M4 70 C 30 70, 34 26, 62 20 S 120 16, 196 15"
      : id === "heat"
        ? "M4 70 C 40 70, 80 68, 120 67 S 170 66, 196 66"
        : "";
  return (
    <div className="mt-3 rounded-xl bg-black/30 p-2 ring-1 ring-white/5">
      <svg viewBox="0 0 200 76" className="h-20 w-full" aria-hidden>
        {[18, 38, 58].map((y) => (
          <line key={y} x1="0" x2="200" y1={y} y2={y} stroke="rgba(255,255,255,0.06)" />
        ))}
        <line x1="0" x2="200" y1="70" y2="70" stroke="rgba(255,255,255,0.2)" />
        {id === "organics" ? (
          <>
            {[24, 52, 80, 108, 136, 164].map((x, i) => (
              <rect
                key={x}
                x={x}
                width="12"
                y={shown ? 68 : 70}
                height={shown ? 2 : 0}
                rx="1"
                fill="#8c9eff"
                style={{ transition: `all 400ms ${i * 300}ms` }}
              />
            ))}
            <line x1="0" x2="200" y1="52" y2="52" stroke="#ffd28a" strokeDasharray="3 4" opacity={shown ? 0.8 : 0} />
            <text x="198" y="48" textAnchor="end" fontSize="8" fill="#ffd28a" opacity={shown ? 0.8 : 0} fontFamily="ui-monospace, monospace">
              detection level
            </text>
          </>
        ) : (
          <path
            d={path}
            fill="none"
            stroke={id === "feed" ? "#ffd28a" : "#8c9eff"}
            strokeWidth="2.5"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={shown ? 0 : 1}
            style={{ transition: state === "run" ? "stroke-dashoffset 2.4s ease-out" : "none" }}
          />
        )}
      </svg>
      <p className="px-1 font-mono text-[9px] tracking-[0.14em] text-white/40 uppercase">{id === "organics" ? "organic molecules" : "radioactive gas · days"}</p>
    </div>
  );
}
