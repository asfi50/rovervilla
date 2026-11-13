"use client";

import Link from "next/link";
import { setReadMode, useReading } from "@/lib/reading";
import { ArrowRight } from "@/app/components/icons";

type Ch = { id: string; title: string; event: string; minutes: number };

/** "Read the comic" / "Read as a storybook", or "Continue" once this viewer has started the book. */
export function BookActions({ slug, chapters }: { slug: string; chapters: Ch[] }) {
  const { books } = useReading();
  const p = books[slug];
  const at = p ? Math.max(0, chapters.findIndex((c) => c.id === p.ch)) : -1;
  const first = `/books/${slug}/${chapters[0].id}`;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-3 [&>a]:justify-center [&>a]:px-4 sm:[&>a]:px-6">
      {at >= 0 ? (
        <Link
          href={`/books/${slug}/${chapters[at].id}`}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-brand-deep active:scale-95"
        >
          <span className="sm:hidden">Chapter {at + 1}</span>
          <span className="max-sm:hidden">Continue · Chapter {at + 1}</span>
          <ArrowRight />
        </Link>
      ) : (
        <Link
          href={first}
          onClick={() => setReadMode("comic")}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-brand-deep active:scale-95"
        >
          <span className="sm:hidden">Read comic</span>
          <span className="max-sm:hidden">Read the comic</span>
          <ArrowRight />
        </Link>
      )}
      <Link
        href={first}
        onClick={() => setReadMode("story")}
        className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-ink ring-1 ring-line transition hover:ring-ink/20 active:scale-95"
      >
        {at >= 0 ? "Storybook" : <><span className="sm:hidden">Storybook</span><span className="max-sm:hidden">Read as a storybook</span></>}
      </Link>
    </div>
  );
}

/** The table of contents, with a tick on chapters this viewer has finished. */
export function ChapterList({ slug, chapters }: { slug: string; chapters: Ch[] }) {
  const { books } = useReading();
  const done = new Set(books[slug]?.done ?? []);
  const current = books[slug]?.ch;

  return (
    <ol className="divide-y divide-line border-y border-line">
      {chapters.map((c, i) => (
        <li key={c.id}>
          <Link href={`/books/${slug}/${c.id}`} className="group flex items-start gap-3.5 py-4 transition-colors active:bg-mist sm:gap-6 sm:py-6">
            <span className="display w-8 shrink-0 pt-0.5 text-[22px] text-brand/30 tabular-nums transition-colors group-hover:text-brand sm:w-14 sm:text-4xl">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="text-[16px] leading-snug font-semibold text-ink transition-colors group-hover:text-brand sm:text-xl">{c.title}</span>
                {current === c.id && !done.has(c.id) && (
                  <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">Reading</span>
                )}
              </span>
              <span className="mt-1 line-clamp-2 block text-[14px] leading-snug text-ink-soft sm:line-clamp-none sm:text-[15px]">{c.event}</span>
            </span>
            <span className="hidden shrink-0 pt-1 text-[13px] text-ink-soft sm:block">{c.minutes} min</span>
            <span
              aria-label={done.has(c.id) ? "Finished" : undefined}
              className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full transition ${done.has(c.id) ? "bg-brand text-white" : "text-ink-soft ring-1 ring-line group-hover:bg-brand group-hover:text-white group-hover:ring-brand"}`}
            >
              {done.has(c.id) ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 6l6 6-6 6" />
                </svg>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
