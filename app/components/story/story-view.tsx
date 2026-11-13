"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type Chapter, img } from "@/lib/heroes";
import { ArrowRight, ChevronDown, Close } from "@/app/components/icons";
import { Waveform } from "@/app/components/waveform";

type Props = {
  slug: string;
  name: string;
  no: string;
  body: string;
  coords: string;
  chapters: Chapter[];
  next: { slug: string; name: string; image: string };
};

/**
 * Scroll-driven chapters. Each chapter is one screen of scroll; the backdrop cross-fades
 * to that chapter's image and the rail on the right follows along.
 */
export default function StoryView({ slug, name, no, body, coords, chapters, next }: Props) {
  const [active, setActive] = useState(0);
  const [narration, setNarration] = useState(false);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (i: number) => refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <div className="relative bg-night text-white">
      {/* Backdrop: one layer per chapter, only the active one visible. */}
      <div className="sticky top-0 h-[100svh] overflow-hidden lg:top-[76px] lg:h-[calc(100svh-76px)]" aria-hidden>
        {chapters.map((c, i) => (
          <Image
            key={c.title}
            src={img(c.image)}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover transition-[opacity,transform] duration-[1200ms] ease-out ${
              i === active ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,10,34,0.6)_0%,rgba(12,10,34,0.1)_60%),linear-gradient(0deg,rgba(12,10,34,0.8)_0%,transparent_45%)]" />
      </div>

      {/* Fixed chrome laid over the backdrop. */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="sticky top-0 h-[100svh] lg:top-[76px] lg:h-[calc(100svh-76px)]">
          {/* Mobile progress + close */}
          <div className="pointer-events-auto absolute inset-x-4 top-4 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex flex-1 gap-1">
                {chapters.map((c, i) => (
                  <button key={c.title} onClick={() => go(i)} aria-label={`Chapter ${i + 1}: ${c.title}`} className={`h-1.5 flex-1 rounded-full ${i <= active ? "bg-brand-bright" : "bg-white/35"}`} />
                ))}
              </div>
              <Link href={`/heroes/${slug}`} aria-label="Close story" className="p-1">
                <Close />
              </Link>
            </div>
            <p className="mt-3 font-mono text-sm">
              Chapter {active + 1} of {chapters.length}
            </p>
          </div>

          {/* Chapter rail */}
          <nav aria-label="Chapters" className="pointer-events-auto absolute top-1/2 right-8 hidden -translate-y-1/2 lg:block">
            <ol className="relative space-y-10 before:absolute before:top-2 before:bottom-2 before:left-[9px] before:w-px before:bg-white/60">
              {chapters.map((c, i) => (
                <li key={c.title}>
                  <button onClick={() => go(i)} className="relative flex items-center gap-4 font-mono text-sm" aria-current={i === active ? "step" : undefined}>
                    <span className={`h-5 w-5 rounded-full border-2 transition-all ${i === active ? "border-white bg-white shadow-[0_0_0_5px_rgba(18,56,255,0.6)]" : "border-white bg-transparent"}`} />
                    <span className={i === active ? "font-medium" : "text-white/85"}>{c.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <p className="absolute bottom-8 left-4 hidden font-mono text-sm uppercase sm:left-8 lg:block">
            {body}
            <br />
            <span className="normal-case">{coords}</span>
          </p>
          <button onClick={() => go(Math.min(active + 1, chapters.length - 1))} className="pointer-events-auto absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-sm lg:flex">
            <span className="h-14 w-px bg-white/70" />
            Scroll
            <ChevronDown />
          </button>
          <div className="pointer-events-auto absolute right-8 bottom-8 hidden flex-col items-end gap-6 lg:flex">
            <Link href={`/heroes/${next.slug}/story`} className="flex items-center gap-4 rounded-2xl bg-white/90 p-2 pr-6 text-ink shadow-xl backdrop-blur transition-transform hover:-translate-y-0.5">
              <span className="relative h-20 w-32 overflow-hidden rounded-xl">
                <Image src={img(next.image)} alt="" fill sizes="128px" className="object-cover" />
              </span>
              <span>
                <span className="block font-mono text-sm text-ink-soft">Next:</span>
                <span className="display text-3xl">{next.name}</span>
              </span>
              <ArrowRight className="ml-4 h-5 w-5" />
            </Link>
            <p className="flex items-center gap-3 font-mono text-sm">
              {no} <span className="h-px w-10 bg-white" />
            </p>
          </div>
        </div>
      </div>

      {/* Scrolling text, one screen per chapter. */}
      <div className="relative -mt-[100svh] lg:-mt-[calc(100svh-76px)]">
        {chapters.map((c, i) => (
          <section
            key={c.title}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-index={i}
            className="flex min-h-[100svh] items-end px-4 pt-28 pb-24 sm:px-8 lg:min-h-[calc(100svh-76px)] lg:items-start lg:pt-20"
          >
            <div className={`max-w-xl transition-all duration-700 ${i === active ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
              <p className="hidden font-mono text-base lg:block">
                {name} · Chapter {i + 1} of {chapters.length}
              </p>
              <p className="font-mono text-sm text-white/80 lg:mt-1">{c.year}</p>
              <h2 className="display mt-3 text-6xl sm:text-7xl lg:text-[88px]">{c.title}</h2>
              <p className="mt-5 font-mono text-[15px] leading-relaxed sm:font-sans sm:text-xl">{c.text}</p>
              {i === 0 && <Waveform seed={slug} bars={36} className="mt-6 h-8 w-56 text-brand-bright" live />}
              <div className="mt-8 flex items-center gap-3">
                <button
                  onClick={() => setNarration(true)}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-brand hover:bg-brand-deep"
                  aria-label="Play narration"
                >
                  <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6" fill="currentColor" aria-hidden><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></svg>
                </button>
                <span className="rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">{narration ? "Narration in production" : "Narrated"}</span>
              </div>
            </div>
          </section>
        ))}

        <section className="flex min-h-[60svh] flex-col items-start justify-center gap-6 bg-night px-4 py-20 sm:px-8 lg:hidden">
          <p className="font-mono text-sm text-white/70">Up next</p>
          <Link href={`/heroes/${next.slug}/story`} className="display text-5xl">
            {next.name} →
          </Link>
          <Link href={`/heroes/${slug}`} className="font-mono text-sm underline">
            Back to {name}
          </Link>
        </section>
      </div>
    </div>
  );
}
