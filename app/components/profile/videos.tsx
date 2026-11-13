"use client";

import { useState } from "react";
import type { Video } from "@/lib/media";

/**
 * Official videos, embedded the light way: a thumbnail until someone presses play, then the
 * privacy-enhanced YouTube player. Nothing loads from YouTube until then except the thumbnail.
 */
export default function Videos({ items }: { items: Video[] }) {
  const [playing, setPlaying] = useState<string | null>(null);
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {items.map((v) => (
        <li key={v.id}>
          <div className="relative aspect-video overflow-hidden rounded-xl bg-night">
            {playing === v.id ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
                title={v.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <button onClick={() => setPlaying(v.id)} className="group absolute inset-0" aria-label={`Play video: ${v.title}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- YouTube's own thumbnail, loaded straight from YouTube */}
                <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover opacity-85 transition-opacity group-hover:opacity-100" />
                <span className="absolute top-1/2 left-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-white shadow-[0_0_0_8px_rgba(18,56,255,0.25)] transition-transform group-hover:scale-105">
                  <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6" fill="currentColor" aria-hidden>
                    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
                  </svg>
                </span>
              </button>
            )}
          </div>
          <p className="mt-2 text-[15px] leading-snug font-semibold">{v.title}</p>
          <p className="mt-0.5 font-mono text-xs text-ink-soft">
            {v.channel} ·{" "}
            <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand">
              watch on YouTube
            </a>
          </p>
        </li>
      ))}
    </ul>
  );
}
