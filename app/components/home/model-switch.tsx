"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ModelStudio, { type StudioPart, type StudioSource } from "@/app/components/profile/model-studio";
import { ArrowRight } from "@/app/components/icons";

export type ModelPick = {
  slug: string;
  /** Short name for the switch. */
  label: string;
  name: string;
  cutout: string;
  stats: { value: string; label: string }[];
  model: StudioSource;
  parts: StudioPart[];
  poster: string;
  posterAlt: string;
};

/**
 * Home: NASA's textured 3D models, one at a time behind a three-way switch. Only the chosen
 * model is downloaded; switching swaps in the next one.
 */
export default function ModelSwitch({ picks }: { picks: ModelPick[] }) {
  const [at, setAt] = useState(0);
  const p = picks[at];

  return (
    <div className="grid items-center gap-5 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-12">
      <div data-reveal>
        <span className="sticker bg-brand text-white max-sm:hidden">3D model</span>
        <h2 className="display text-3xl sm:mt-4 sm:text-5xl">Turn them in your hands.</h2>

        <div role="tablist" aria-label="Choose a model" className="mt-4 grid grid-cols-3 gap-1 rounded-[22px] bg-white p-1 shadow-[0_8px_24px_-14px_rgba(45,20,140,0.45)] ring-1 ring-line sm:mt-6 sm:max-w-md">
          {picks.map((x, i) => (
            <button
              key={x.slug}
              role="tab"
              aria-selected={i === at}
              onClick={() => setAt(i)}
              className={`flex flex-col items-center gap-1 rounded-[18px] px-2 pt-2 pb-1.5 text-[13px] font-semibold transition sm:flex-row sm:gap-2 sm:px-3 sm:py-2 ${
                i === at ? "bg-brand text-white shadow-[0_6px_16px_-6px_rgba(18,56,255,0.7)]" : "text-ink hover:bg-brand-soft"
              }`}
            >
              <span className="relative block h-8 w-10 shrink-0">
                <Image src={x.cutout} alt="" fill sizes="40px" className="object-contain" />
              </span>
              {x.label}
            </button>
          ))}
        </div>

        <dl key={p.slug} className="rv-pop mt-4 flex flex-wrap gap-2 sm:mt-6">
          {p.stats.slice(0, 2).map((s) => (
            <div key={s.label} className="rounded-full bg-white px-3.5 py-1.5 text-sm shadow-[0_6px_16px_-10px_rgba(45,20,140,0.4)]">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="font-semibold">{s.value}</span> <span className="text-ink-soft">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
        <Link href={`/heroes/${p.slug}`} className="group mt-4 inline-flex items-center gap-2 font-semibold text-brand sm:mt-8">
          Meet {p.name} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="min-w-0">
        <ModelStudio key={p.slug} name={p.name} model={p.model} parts={p.parts} poster={p.poster} posterAlt={p.posterAlt} stage="dark" compact />
      </div>
    </div>
  );
}
