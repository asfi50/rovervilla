"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { type Body, type Hero, catNo, img, lifespan, portrait } from "@/lib/heroes";
import { Waveform } from "@/app/components/waveform";
import MachinePhoto from "@/app/components/machine-photo";
import { ArrowRight } from "@/app/components/icons";

const MIN = 1960;
const MAX = 2030;
const TODAY = new Date().getFullYear();
/** Avatar + gap + mono name at ~8px a character. */
const labelPx = (h: Hero) => 70 + h.name.length * 8;

/** Fractional year, so a mission of a few months still gets a visible bar. */
const fy = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return y + (m - 1) / 12 + (d - 1) / 365;
};

const span = (h: Hero) => ({ a: fy(h.landing?.date ?? h.launch.date), b: fy(h.end.date) });

export function served(h: Hero) {
  const { a, b } = span(h);
  const years = b - a;
  if (years >= 1) return `${Math.floor(years)}${years % 1 > 0.05 ? "+" : ""} year${Math.floor(years) === 1 && years % 1 <= 0.05 ? "" : "s"}`;
  const months = Math.round(years * 12);
  if (months >= 1) return `${months} month${months === 1 ? "" : "s"}`;
  return `${Math.max(1, Math.round(years * 365))} days`;
}

/** Greedy row packing so labels in one lane never overlap. */
function pack(items: Hero[], x: (y: number) => number, width: number) {
  const rows: number[] = [];
  return items.map((h) => {
    const { a, b } = span(h);
    const left = x(a);
    const right = Math.max(x(b), left + (labelPx(h) / Math.max(width, 1)) * 100);
    let row = rows.findIndex((end) => end < left - 1);
    if (row === -1) row = rows.length;
    rows[row] = right;
    return { h, row, left, width: Math.max(x(b) - left, 0.8) };
  });
}

export default function TimelineView({ heroes }: { heroes: Hero[] }) {
  const [filter, setFilter] = useState<"all" | Body>("all");
  const [from, setFrom] = useState(MIN);
  const [to, setTo] = useState(MAX);
  const [selected, setSelected] = useState("opportunity");
  const chart = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    const el = chart.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width - 106));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const visible = useMemo(
    () =>
      heroes
        .filter((h) => filter === "all" || h.body === filter)
        .filter((h) => span(h).b >= from && span(h).a <= to)
        .sort((p, q) => span(p).a - span(q).a),
    [heroes, filter, from, to],
  );

  const x = (y: number) => ((y - from) / Math.max(to - from, 1)) * 100;
  const lanes = (["moon", "mars"] as Body[]).filter((b) => filter === "all" || filter === b);
  const ticks = Array.from({ length: Math.floor((to - from) / 10) + 1 }, (_, i) => Math.ceil(from / 10) * 10 + i * 10).filter((t) => t <= to);

  const sel = heroes.find((h) => h.slug === selected) ?? heroes[0];
  const longest = [...heroes].sort((p, q) => span(q).b - span(q).a - (span(p).b - span(p).a))[0];
  const latest = [...heroes].sort((p, q) => span(q).b - span(p).b)[0];
  const count = (b: Body) => heroes.filter((h) => h.body === b).length;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:py-10">
      {/* Header row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h1 className="display text-6xl lg:text-[88px]">Timeline</h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-5">
            <div className="flex gap-2" role="group" aria-label="Filter by world">
              {(["all", "mars", "moon"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={`rounded-full px-6 py-2.5 text-[15px] font-medium capitalize transition-colors ${
                    filter === f ? "bg-brand text-white" : "border border-line bg-white hover:border-brand"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex w-full items-center gap-4 font-mono sm:w-auto">
              <span>{from}</span>
              <div className="relative h-6 flex-1 sm:w-72 sm:flex-none">
                <div className="absolute top-1/2 right-0 left-0 h-1.5 -translate-y-1/2 rounded bg-line" />
                <div
                  className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded bg-brand"
                  style={{ left: `${((from - MIN) / (MAX - MIN)) * 100}%`, right: `${100 - ((to - MIN) / (MAX - MIN)) * 100}%` }}
                />
                <input type="range" className="dual" min={MIN} max={MAX} value={from} onChange={(e) => setFrom(Math.min(Number(e.target.value), to - 10))} aria-label="From year" />
                <input type="range" className="dual" min={MIN} max={MAX} value={to} onChange={(e) => setTo(Math.max(Number(e.target.value), from + 10))} aria-label="To year" />
              </div>
              <span>{to}</span>
            </div>
          </div>
        </div>
        <dl className="grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-white py-5 text-center lg:min-w-[520px]">
          {[
            ["Mars", count("mars")],
            ["Moon", count("moon")],
            ["Total", heroes.length],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-lg">{k}</dt>
              <dd className="display mt-1 text-5xl">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Chart: scrolls sideways on narrow screens rather than squashing the years. */}
      <div className="no-scrollbar mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <div ref={chart} className="min-w-[860px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-[90px_1fr] gap-4">
          {lanes.map((lane, li) => {
            const packed = pack(visible.filter((h) => h.body === lane), x, width);
            const rows = Math.max(1, ...packed.map((p) => p.row + 1));
            const above = lane === "moon" && lanes.length === 2;
            return (
              <div key={lane} className="contents">
                <div className="flex items-center gap-3 text-lg">
                  <span className={`h-5 w-5 rounded-full ${lane === "mars" ? "bg-brand" : "bg-sky-400"}`} />
                  <span className="capitalize">{lane}</span>
                </div>
                <div className="relative" style={{ height: rows * 72 + 8 }}>
                  {packed.map(({ h, row, left, width: w }) => {
                    const top = above ? (rows - 1 - row) * 72 : row * 72;
                    const on = h.slug === selected;
                    return (
                      <button
                        key={h.slug}
                        onClick={() => setSelected(h.slug)}
                        onMouseEnter={() => setSelected(h.slug)}
                        className={`absolute flex items-start gap-2.5 rounded-full text-left transition-all ${on ? "z-10" : ""}`}
                        style={{ left: `calc(${left}% - 26px)`, top }}
                        aria-pressed={on}
                      >
                        <span className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ${on ? "ring-brand ring-offset-2" : "ring-white"}`}>
                          <Image src={img(portrait(h))} alt="" fill sizes="48px" className="object-cover" />
                        </span>
                        <span className="pt-0.5">
                          <span className="block font-mono text-[13px] leading-tight font-medium whitespace-nowrap">{h.name}</span>
                          <span className="block font-mono text-[13px] leading-tight whitespace-nowrap text-ink-soft">{lifespan(h)}</span>
                        </span>
                        <span
                          className={`absolute top-[54px] left-[26px] h-1.5 rounded-full ${lane === "mars" ? "bg-brand" : "bg-sky-400"} ${on ? "shadow-[0_0_0_6px_rgba(18,56,255,0.15)]" : ""}`}
                          style={{ width: `max(8px, ${(w / 100) * width}px)` }}
                        />
                      </button>
                    );
                  })}
                </div>
                {li === 0 && (
                  <>
                    <div />
                    <div className="relative my-2 h-12">
                      <div className="absolute top-3 right-0 left-0 h-px bg-line" />
                      {ticks.map((t) => (
                        <span key={t} className="absolute top-0 -translate-x-1/2 text-center font-mono text-xs" style={{ left: `${x(t)}%` }}>
                          <span className="mx-auto block h-2.5 w-2.5 translate-y-[7px] rounded-full bg-ink-soft/50" />
                          <span className="mt-4 block">{t}</span>
                        </span>
                      ))}
                      {TODAY >= from && TODAY <= to && (
                        <span className="absolute -top-10 -translate-x-1/2 text-center font-mono text-xs text-brand" style={{ left: `${x(TODAY)}%` }}>
                          Today
                          <br />
                          {TODAY}
                          <span className="mx-auto mt-1 block h-3.5 w-3.5 rounded-full bg-brand" />
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        {visible.length === 0 && <p className="py-10 text-center text-ink-soft">No machines in this range.</p>}
        </div>
      </div>
      <p className="mt-2 font-mono text-xs text-ink-soft lg:hidden">Swipe the timeline sideways to see every year.</p>

      {/* Highlights */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: catNo(sel.no), h: sel, cta: true },
          { label: "Longest service", h: longest },
          { label: "Most recent", h: latest },
        ].map(({ label, h, cta }) => (
          <Link
            key={label}
            href={`/heroes/${h.slug}`}
            className="group grid min-h-[280px] grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] overflow-hidden rounded-2xl border border-line bg-white"
          >
            <div className="flex flex-col p-6">
              <p className={cta ? "font-mono text-sm" : "font-bold"}>{label}</p>
              <h2 className="display mt-1 text-3xl xl:text-4xl">{h.name}</h2>
              <p className="mt-2 font-mono">{lifespan(h)}</p>
              <Waveform seed={h.slug} bars={26} className="mt-5 h-8 w-32 text-brand" />
              <p className="mt-4 font-mono">{served(h)}</p>
              {cta && (
                <span className="mt-auto inline-flex w-fit items-center gap-3 rounded-full bg-brand px-5 py-3 text-sm font-semibold whitespace-nowrap text-white">
                  Read their story <ArrowRight />
                </span>
              )}
            </div>
            <div className="relative">
              {h.card ? (
                <Image src={`/images/${h.card}.webp`} alt="" fill sizes="(min-width:768px) 16vw, 50vw" className="object-contain object-bottom p-3 transition-transform duration-700 group-hover:-translate-y-1" />
              ) : (
                <MachinePhoto name={h.image} ratio={0.75} fill={0.92} anchor={{ x: 48, y: 55 }} sizes="(min-width:768px) 16vw, 50vw" className="inset-0" />
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
