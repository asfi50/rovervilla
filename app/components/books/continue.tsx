"use client";

import Link from "next/link";
import BookCover, { type CoverData } from "@/app/components/books/cover";
import { useReading } from "@/lib/reading";

export type ShelfBook = { slug: string; cover: CoverData; chapters: { id: string; title: string }[] };

/** "Continue reading": the books this viewer has opened, most recent first. Hidden until there are some. */
export default function ContinueReading({ books }: { books: ShelfBook[] }) {
  const { books: progress } = useReading();
  const started = books
    .filter((b) => progress[b.slug])
    .sort((a, b) => progress[b.slug].at - progress[a.slug].at)
    .slice(0, 6);
  if (!started.length) return null;

  return (
    <section className="mx-auto max-w-[1440px] px-4 sm:px-8">
      <h2 className="text-lg font-semibold tracking-tight sm:text-[22px]">Continue reading</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {started.map((b) => {
          const p = progress[b.slug];
          const i = Math.max(0, b.chapters.findIndex((c) => c.id === p.ch));
          const done = p.done.filter((id) => b.chapters.some((c) => c.id === id)).length;
          return (
            <li key={b.slug}>
              <Link
                href={`/books/${b.slug}/${b.chapters[i].id}`}
                className="group flex items-center gap-4 rounded-2xl bg-mist p-3 pr-5 ring-1 ring-line transition hover:bg-brand-soft/60 hover:ring-brand/20"
              >
                <BookCover book={b.cover} sizes="64px" className="w-16 shrink-0 shadow-[0_8px_16px_-8px_rgba(13,11,38,0.5)]" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[11px] tracking-[0.12em] text-brand uppercase">
                    Chapter {i + 1} of {b.chapters.length}
                  </p>
                  <p className="mt-1 truncate font-semibold text-ink">{b.chapters[i].title}</p>
                  <p className="truncate text-[13px] text-ink-soft">{b.cover.title}</p>
                  <span className="mt-2.5 block h-1 overflow-hidden rounded-full bg-line">
                    <span className="block h-full rounded-full bg-brand" style={{ width: `${Math.max(4, (done / b.chapters.length) * 100)}%` }} />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
