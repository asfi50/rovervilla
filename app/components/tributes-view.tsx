"use client";

import Image from "next/image";
import { useState } from "react";
import { type Hero, fmtDots, img, portrait } from "@/lib/heroes";
import { Waveform } from "@/app/components/waveform";
import TributeWall from "@/app/components/profile/tribute-wall";

/** The dark "last signal" screen: pick a hero, see their final waveform, leave a tribute. */
export default function TributesView({ heroes }: { heroes: Hero[] }) {
  const [slug, setSlug] = useState("opportunity");
  const hero = heroes.find((h) => h.slug === slug) ?? heroes[0];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8 lg:py-14">
      <h1 className="display text-6xl lg:text-[88px]">{hero.end.label}</h1>
      <ul className="no-scrollbar edge-fade -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2" aria-label="Choose a hero">
        {heroes.map((h) => (
          <li key={h.slug} className="shrink-0">
            <button
              onClick={() => setSlug(h.slug)}
              aria-pressed={h.slug === slug}
              className={`flex items-center gap-2 rounded-full py-1 pr-4 pl-1 text-sm transition-colors ${h.slug === slug ? "bg-brand" : "bg-white/10 hover:bg-white/20"}`}
            >
              <span className="relative h-7 w-7 overflow-hidden rounded-full">
                <Image src={img(portrait(h))} alt="" fill sizes="28px" className="object-cover" />
              </span>
              {h.name}
            </button>
          </li>
        ))}
      </ul>
      <Waveform seed={`${hero.slug}-last`} bars={40} fade={0.45} live className="mt-8 h-28 w-full max-w-3xl text-brand-bright" />
      <p className="mt-4 font-mono text-lg">
        {fmtDots(hero.end.date)} · {hero.name}
      </p>
      <p className="mt-3 max-w-2xl leading-relaxed text-white/75">{hero.end.story}</p>
      <div className="mt-10">
        <TributeWall slug={hero.slug} name={hero.name} dark />
      </div>
    </div>
  );
}
