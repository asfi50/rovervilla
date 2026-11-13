"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { type Body, type Category, type Hero, bodyName, catNo, fmtDate, img, lifespan, portrait } from "@/lib/heroes";
import Globe from "@/app/components/globe";
import { Waveform } from "@/app/components/waveform";
import { ArrowRight, Pin } from "@/app/components/icons";
import RailDots from "@/app/components/rail-dots";

const FILTERS: { id: Category; label: string }[] = [
  { id: "lander", label: "Landers" },
  { id: "rover", label: "Rovers" },
  { id: "helicopter", label: "Helicopter" },
  { id: "impactor", label: "Impactors" },
  { id: "lost", label: "Lost on arrival" },
];

const BADGE: Record<Category, string> = {
  lander: "Lander",
  rover: "Rover",
  helicopter: "Helicopter",
  impactor: "Impactor",
  lost: "Lost on arrival",
};

export default function RestView({ heroes }: { heroes: Hero[] }) {
  const [body, setBody] = useState<Body>("mars");
  const [cats, setCats] = useState<Category[]>([]);
  const [selected, setSelected] = useState("insight");

  const onBody = heroes.filter((h) => h.body === body);
  const shown = onBody.filter((h) => cats.length === 0 || cats.includes(h.category));
  const available = FILTERS.filter((f) => onBody.some((h) => h.category === f.id));
  const sel = shown.find((h) => h.slug === selected) ?? shown[0] ?? onBody[0];

  const switchBody = (b: Body) => {
    setBody(b);
    setCats([]);
    setSelected(heroes.find((h) => h.body === b)!.slug);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,330px)_minmax(0,1fr)_minmax(0,400px)] lg:items-start">
        {/* Left: title, toggles, counts */}
        <div>
          <p className="font-mono text-sm tracking-[0.12em] text-brand uppercase">Where they rest</p>
          <h1 className="display mt-3 text-5xl lg:text-[72px]">Resting among the stars.</h1>
          <div className="mt-8 inline-flex rounded-full bg-mist p-1" role="group" aria-label="World">
            {(["mars", "moon"] as Body[]).map((b) => (
              <button
                key={b}
                onClick={() => switchBody(b)}
                aria-pressed={body === b}
                className={`rounded-full px-10 py-3 text-[15px] font-medium transition-colors ${body === b ? "bg-brand text-white" : "hover:text-brand"}`}
              >
                {bodyName(b)}
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by type">
            {available.map((f) => {
              const on = cats.includes(f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => setCats(on ? cats.filter((c) => c !== f.id) : [...cats, f.id])}
                  aria-pressed={on}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${on ? "border-brand bg-brand-soft text-brand" : "border-transparent bg-mist hover:border-line"}`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:mt-10 lg:block lg:divide-y lg:divide-line">
            {(["mars", "moon"] as Body[]).map((b) => (
              <button key={b} onClick={() => switchBody(b)} className="flex w-full flex-col items-start gap-1 rounded-2xl bg-mist p-4 text-left lg:flex-row lg:items-baseline lg:gap-4 lg:rounded-none lg:bg-transparent lg:p-0 lg:py-5">
                <span className={`display text-3xl lg:text-4xl ${body === b ? "" : "text-ink-soft"}`}>{bodyName(b)}</span>
                <span className="font-mono">· {heroes.filter((h) => h.body === b).length} machines</span>
              </button>
            ))}
          </div>
        </div>

        {/* Centre: the planet */}
        <div className="relative mx-auto w-full max-w-[640px]">
          <Globe
            body={body}
            sites={shown.map((h) => ({ id: h.slug, name: h.name, lat: h.coords.lat, lon: h.coords.lon }))}
            selected={sel?.slug}
            onSelect={setSelected}
            className="w-full"
          />
          <p className="mt-3 text-center font-mono text-[11px] text-ink-soft">
            Drag to turn. Pins at real landing coordinates
            {sel?.coords.approx ? " (Mars Polar Lander: presumed site)" : ""}.
            <br />
            {body === "mars" ? "Surface: USGS Astrogeology, Viking MDIM 2.1 colour mosaic." : "Surface: NASA/GSFC/Arizona State University, LROC WAC mosaic via NASA Moon Trek."}
          </p>
        </div>

        {/* Right: the selected machine */}
        {sel && (
          <article className="rounded-2xl border border-line bg-white p-6 shadow-[0_20px_50px_-30px_rgba(13,11,38,0.35)]">
            <div className="flex items-center justify-between">
              <p className="font-mono">{catNo(sel.no)}</p>
              <span className="rounded-md bg-brand-soft px-2.5 py-1 font-mono text-xs tracking-[0.1em] text-brand uppercase">{BADGE[sel.category]}</span>
            </div>
            <h2 className="display mt-3 text-5xl">{sel.name}</h2>
            <p className="mt-2 text-2xl">{lifespan(sel)}</p>
            <p className="mt-4 flex items-center gap-2 text-lg">
              <Pin className="h-5 w-5 text-brand" /> {sel.restingPlace.replace(/, (Mars|Moon).*$/, "")}
            </p>
            <div className="relative mt-5 aspect-[3/2] overflow-hidden rounded-xl">
              <Image src={img(portrait(sel))} alt={sel.name} fill sizes="400px" className="object-cover" />
            </div>
            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono">{sel.end.label}</p>
                <p className="display mt-1 text-3xl">{fmtDate(sel.end.date)}</p>
              </div>
              <Waveform seed={`${sel.slug}-rest`} bars={40} fade={0.1} className="h-10 w-44 text-brand" />
            </div>
            <Link
              href={`/heroes/${sel.slug}`}
              className="mt-6 flex items-center justify-between rounded-full bg-brand px-7 py-4 font-semibold text-white transition-colors hover:bg-brand-deep"
            >
              Read their story <ArrowRight className="h-5 w-5" />
            </Link>
          </article>
        )}
      </div>

      {/* Explorer strip */}
      <div className="mt-10 border-t border-line pt-6">
        <div className="flex justify-between font-mono text-sm tracking-[0.08em] uppercase">
          <span>All {bodyName(body)} explorers</span>
          <span className="normal-case">{onBody.length} machines</span>
        </div>
        <ul className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-2">
          {onBody.map((h) => {
            const on = h.slug === sel?.slug;
            return (
              <li key={h.slug} className="w-[150px] shrink-0">
                <button onClick={() => setSelected(h.slug)} className={`w-full rounded-lg p-1 text-left transition-colors ${on ? "ring-2 ring-brand" : "hover:bg-mist"}`} aria-pressed={on}>
                  <span className="relative block aspect-[4/3] overflow-hidden rounded-md">
                    <Image src={img(portrait(h))} alt="" fill sizes="150px" className="object-cover" />
                  </span>
                  <span className="mt-3 block font-mono text-sm">{catNo(h.no)}</span>
                  <span className="block text-sm leading-tight font-semibold">{h.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <RailDots count={onBody.length} />
      </div>
    </div>
  );
}
