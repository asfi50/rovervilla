import Link from "next/link";
import { BOOKS, coverOf } from "@/lib/books";
import BookStage, { type StageBook } from "@/app/components/home/book-stage";
import { ArrowRight } from "@/app/components/icons";

/** The first sentence of a line, so the speech bubble stays short. */
const firstSentence = (s: string) => s.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? s;

/**
 * Home: Rover Villa Books, after the two families. A night sky with the Moon and Mars, and
 * every book standing on a glass shelf you can flick through.
 */
export function BooksSection() {
  const books: StageBook[] = BOOKS.map((b) => ({
    slug: b.slug,
    cover: coverOf(b),
    first: b.chapters[0].id,
    line: firstSentence(b.chapters[0].beats[0].line),
    world: b.hero.body,
  }));
  const start = Math.max(0, BOOKS.findIndex((b) => b.slug === "opportunity"));

  return (
    <section id="books" aria-label="Rover Villa Books" className="mx-auto max-w-[1440px] scroll-mt-20 px-4 pt-4 pb-6 sm:px-8 sm:pt-6 sm:pb-10">
      <div
        className="relative isolate overflow-hidden rounded-[28px] text-white sm:rounded-[40px]"
        style={{ background: "radial-gradient(120% 80% at 50% 0%, #2a35b8 0%, #141a6e 38%, #0a0b33 75%, #07071f 100%)" }}
        data-reveal
      >
        {/* the sky: stars, a big Moon up in the corner and a small Mars low on the other side */}
        <div aria-hidden className="sky-stars absolute inset-0 -z-10" />
        <div
          aria-hidden
          className="planet absolute -top-[110px] -right-[90px] -z-10 aspect-square w-[240px] rounded-full bg-[url(/textures/moon-1024.jpg)] shadow-[inset_-30px_-18px_50px_rgba(0,0,0,0.65),0_0_90px_10px_rgba(190,205,255,0.25)] sm:-top-[180px] sm:-right-[120px] sm:w-[440px]"
        />
        <div
          aria-hidden
          className="planet absolute bottom-[90px] -left-[60px] -z-10 aspect-square w-[110px] rounded-full bg-[url(/textures/mars-1024.jpg)] opacity-90 shadow-[inset_-16px_-10px_30px_rgba(0,0,0,0.6),0_0_60px_rgba(255,120,60,0.25)] max-sm:hidden lg:w-[170px]"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-7 sm:px-12 sm:pt-12">
          <span className="sticker bg-[#ffd166] text-ink">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
              <path d="M12 2l2.6 6.3L21 9l-5 4.4L17.5 20 12 16.6 6.5 20 8 13.4 3 9l6.4-.7z" />
            </svg>
            Story time
          </span>
          <Link href="/books" className="group relative z-10 inline-flex items-center gap-2 rounded-full text-sm font-semibold text-white/85 hover:text-white max-sm:bg-white/10 max-sm:px-3.5 max-sm:py-1.5 max-sm:ring-1 max-sm:ring-white/20 max-sm:backdrop-blur">
            All books
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-4">
          <BookStage books={books} start={start} />
        </div>
      </div>
    </section>
  );
}
