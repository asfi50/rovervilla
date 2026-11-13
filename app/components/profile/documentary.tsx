"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "@/app/components/icons";

/**
 * Poster for the first-person documentary. The film itself is not produced yet, so pressing
 * play says so instead of pretending to load a video.
 */
export default function Documentary({ name, image }: { name: string; image: string }) {
  const [asked, setAsked] = useState(false);
  return (
    <div className="relative isolate flex aspect-[16/11] flex-col overflow-hidden rounded-2xl bg-night p-6 text-white sm:aspect-[16/10]">
      <Image src={image} alt="" fill sizes="(min-width:1024px) 45vw, 100vw" className="-z-10 object-cover opacity-80" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(12,10,34,0.85)_0%,rgba(12,10,34,0.1)_45%,rgba(12,10,34,0.75)_100%)]" />
      <p className="font-mono text-xs tracking-[0.12em] uppercase">Documentary</p>
      <h2 className="display mt-2 max-w-[14ch] text-3xl sm:text-[42px]">{name}: in its own words</h2>

      <button
        onClick={() => setAsked(true)}
        className="absolute top-[60%] left-1/2 flex h-16 w-16 sm:top-1/2 sm:h-20 sm:w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand shadow-[0_0_0_10px_rgba(18,56,255,0.25)] transition-transform hover:scale-105"
        aria-label={`Play ${name}: in its own words`}
      >
        <Play className="ml-1 h-8 w-8" />
      </button>

      <div className="mt-auto">
        {asked ? (
          <p role="status" className="rounded-xl bg-black/50 px-4 py-3 text-sm backdrop-blur">
            This documentary is in production. It will be told in the first person, built only from real mission records.
          </p>
        ) : (
          <div className="flex items-center gap-4 font-mono text-xs">
            <span>Coming soon</span>
            <span className="h-1 flex-1 rounded bg-white/25">
              <span className="block h-1 w-2 rounded bg-brand" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
