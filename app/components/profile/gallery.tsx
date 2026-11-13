"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Photo } from "@/lib/photos";
import { Close } from "@/app/components/icons";

/** Thumbnail grid with a keyboard-friendly lightbox. Real archive photos carry their title and credit. */
export default function Gallery({ items, name, columns = "grid-cols-2 sm:grid-cols-3" }: { items: Photo[]; name: string; columns?: string }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % items.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items.length]);

  const cur = open === null ? null : items[open];

  return (
    <>
      <div className={`grid gap-2 ${columns}`}>
        {items.map((p, i) => (
          <button key={p.name + i} onClick={() => setOpen(i)} className="group relative aspect-[3/2] overflow-hidden rounded-lg bg-mist" aria-label={`Open ${p.ai ? `${name}, image ${i + 1}` : p.title}`}>
            <Image src={p.src} alt={p.ai ? `${name}, image ${i + 1}` : p.alt} fill sizes="(min-width:1024px) 15vw, 45vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          </button>
        ))}
      </div>

      {cur && open !== null && (
        <div role="dialog" aria-modal="true" aria-label={`${name} gallery`} className="fixed inset-0 z-[60] flex items-center justify-center bg-night/90 p-4 backdrop-blur" onClick={() => setOpen(null)}>
          <button className="absolute top-4 right-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" aria-label="Close" autoFocus>
            <Close />
          </button>
          <figure className="relative h-[78vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={cur.src} alt={cur.ai ? "" : cur.alt} fill sizes="100vw" className="object-contain" />
            <figcaption className="absolute -bottom-12 left-0 right-0 font-mono text-xs leading-relaxed text-white/75">
              {open + 1} / {items.length} ·{" "}
              {cur.ai ? (
                `${name}, illustration`
              ) : (
                <>
                  {cur.title} · {cur.credit} ·{" "}
                  <a href={cur.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                    source
                  </a>
                </>
              )}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
