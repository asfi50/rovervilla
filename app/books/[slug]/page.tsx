import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import { generateSEO } from "@/lib/seo";
import { BOOKS, bookSources, coverOf, getBook, host, readMinutes } from "@/lib/books";
import { bodyName } from "@/lib/heroes";
import BookCover from "@/app/components/books/cover";
import BookTile from "@/app/components/books/tile";
import { BookActions, ChapterList } from "@/app/components/books/book-actions";
import Shelf from "@/app/components/videos/shelf";
import Motion from "@/app/components/videos/motion";

export const dynamicParams = false;

export function generateStaticParams() {
  return BOOKS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const b = getBook((await params).slug);
  if (!b) return {};
  return generateSEO({
    title: `${b.title} | ${b.name}'s book | Rover Villa`,
    description: b.intro,
    path: `/books/${b.slug}`,
    ogImage: `/images/${b.art}.webp`,
    keywords: [`${b.name} book`, `${b.name} comic`, "space books for kids", "Rover Villa Books"],
  });
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const b = getBook((await params).slug);
  if (!b) notFound();

  const chapters = b.chapters.map((c) => ({ id: c.id, title: c.title, event: c.event, minutes: readMinutes(c) }));
  const minutes = chapters.reduce((n, c) => n + c.minutes, 0);
  const sources = bookSources(b);
  const more = BOOKS.filter((x) => x.slug !== b.slug && x.hero.body === b.hero.body);
  const sourceList = (
    <ul className="grid gap-x-8 gap-y-2.5 text-[14px] sm:grid-cols-2">
      {sources.map((s) => (
        <li key={s.url} className="min-w-0">
          <a href={s.url} target="_blank" rel="noopener noreferrer" className="group block">
            <span className="block truncate font-medium text-ink group-hover:text-brand">{s.label}</span>
            <span className="block truncate text-[12px] text-ink-soft">{host(s.url)}</span>
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <Header />
      <main className="bg-white">
        <section className="relative isolate overflow-hidden">
          {/* the book's own colour, washed out behind the cover */}
          <div className="absolute inset-0 -z-10 opacity-[0.12]" style={{ background: `radial-gradient(90% 80% at 15% 30%, ${b.cover.bg}, transparent 70%)` }} />
          <div className="mx-auto grid max-w-[1200px] items-center gap-7 px-4 pt-6 pb-10 sm:px-8 md:grid-cols-[minmax(0,380px)_1fr] md:gap-14 md:pt-8 md:pb-14 lg:gap-20 lg:pt-14 lg:pb-20">
            <div className="rise mx-auto w-[min(48vw,210px)] md:w-full">
              <BookCover book={coverOf(b)} sizes="(min-width:768px) 380px, 64vw" priority className="shadow-[0_44px_70px_-28px_rgba(13,11,38,0.65)]" />
            </div>
            <div className="max-md:text-center">
              <nav aria-label="Breadcrumb" className="rise font-mono text-[12px] tracking-[0.12em] text-ink-soft uppercase sm:text-[13px]">
                <Link href="/books" className="text-brand hover:underline">
                  Books
                </Link>
                <span className="mx-2">/</span>
                {bodyName(b.hero.body)}
              </nav>
              <h1 className="display rise mt-2 text-[34px] text-balance sm:mt-3 sm:text-6xl lg:text-[68px]" style={{ animationDelay: "60ms" }}>
                {b.title}
              </h1>
              <p className="rise mt-2 text-base font-semibold text-ink sm:mt-3 sm:text-lg" style={{ animationDelay: "90ms" }}>
                <span className="font-normal text-ink-soft">Told by </span>
                {b.name}
              </p>
              {/* Phones: the facts as a three-up strip, like a store page */}
              <dl className="rise mx-auto mt-5 grid max-w-sm grid-cols-3 divide-x divide-line rounded-2xl bg-white/70 py-3 ring-1 ring-line md:hidden" style={{ animationDelay: "110ms" }}>
                <div>
                  <dt className="text-[11px] text-ink-soft">Chapters</dt>
                  <dd className="display mt-0.5 text-xl">{chapters.length}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-ink-soft">Reading</dt>
                  <dd className="display mt-0.5 text-xl">{minutes} min</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-ink-soft">Ways to read</dt>
                  <dd className="display mt-0.5 text-xl">2</dd>
                </div>
              </dl>
              <div className="rise mt-5 md:hidden" style={{ animationDelay: "150ms" }}>
                <BookActions slug={b.slug} chapters={chapters} />
              </div>
              <p className="rise mt-5 max-w-xl text-[16px] leading-relaxed text-ink-soft max-md:mx-auto max-md:text-left sm:text-lg" style={{ animationDelay: "120ms" }}>
                {b.intro}
              </p>
              <p className="rise mt-6 hidden flex-wrap gap-x-5 gap-y-1 text-[14px] text-ink-soft md:flex" style={{ animationDelay: "150ms" }}>
                <span>
                  <strong className="font-semibold text-ink">{chapters.length}</strong> chapters
                </span>
                <span>
                  About <strong className="font-semibold text-ink">{minutes}</strong> minutes
                </span>
                <span>Comic and storybook</span>
              </p>
              <div className="rise mt-8 hidden md:block" style={{ animationDelay: "180ms" }}>
                <BookActions slug={b.slug} chapters={chapters} />
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 pt-2 pb-14 sm:px-8 sm:pt-6 lg:pb-24">
          <section data-rise>
            <h2 className="display text-[26px] sm:text-4xl">Chapters</h2>
            <p className="mt-1.5 text-[15px] text-ink-soft sm:mt-2 sm:text-base">Each chapter is one true event. Start anywhere.</p>
            <div className="mt-4 sm:mt-6">
              <ChapterList slug={b.slug} chapters={chapters} />
            </div>
          </section>

          <section data-rise className="mt-12 grid gap-8 sm:mt-16 sm:gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <h2 className="display text-[26px] sm:text-4xl">About this book</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
                {b.name} tells its own story in an imagined voice. Those lines are retellings, not quotations. The events, dates and numbers come from the mission
                records listed here, and each chapter links its own sources as you read.
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                Photos are from the NASA Image and Video Library and are credited where they appear.
              </p>
              <Link href={`/heroes/${b.slug}`} className="mt-6 inline-flex items-center gap-2 font-semibold text-brand hover:underline">
                Meet {b.hero.name}
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
            <div>
              {/* Phones: folded away, since the list is long. Desktop: always open. */}
              <details className="group rounded-2xl bg-mist ring-1 ring-line lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 font-mono text-[12px] tracking-[0.14em] text-ink-soft uppercase [&::-webkit-details-marker]:hidden">
                  Sources · {sources.length}
                  <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="px-4 pb-4">{sourceList}</div>
              </details>
              <div className="hidden lg:block">
                <h3 className="font-mono text-[12px] tracking-[0.14em] text-ink-soft uppercase">Sources</h3>
                <div className="mt-4">{sourceList}</div>
              </div>
            </div>
          </section>
        </div>

        <div className="pb-20">
          <Shelf title={`More stories from ${b.hero.body === "mars" ? "Mars" : "the Moon"}`} href="/books" tone="light">
            {more.map((x) => (
              <li key={x.slug} className="w-[38vw] max-w-[180px] shrink-0 snap-start sm:w-[160px] lg:w-[180px]">
                <BookTile slug={x.slug} book={coverOf(x)} sizes="180px" />
              </li>
            ))}
          </Shelf>
        </div>
      </main>
      <Footer />
      <Motion />
    </>
  );
}
