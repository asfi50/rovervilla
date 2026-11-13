import type { ReactNode } from "react";
import Link from "next/link";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import { generateSEO } from "@/lib/seo";
import { BOOKS, coverOf, getBook } from "@/lib/books";
import BookCover from "@/app/components/books/cover";
import BookTile from "@/app/components/books/tile";
import ContinueReading, { type ShelfBook } from "@/app/components/books/continue";
import Shelf from "@/app/components/videos/shelf";
import Motion from "@/app/components/videos/motion";
import { ArrowRight } from "@/app/components/icons";

export const metadata = generateSEO({
  title: "Books | Rover Villa",
  description: "Illustrated true stories of the machines we left on Mars and the Moon, told in their own imagined voices. Read each chapter as a comic or a storybook.",
  path: "/books",
  keywords: ["space books for kids", "Mars rover comic", "Moon lander storybook", "Rover Villa Books"],
});

const FEATURED = getBook("opportunity")!;
const FAN = [getBook("spirit")!, getBook("apollo-11-lander")!];

const SHELVES = [
  { title: "Stories from the Moon", books: BOOKS.filter((b) => b.hero.body === "moon") },
  { title: "Stories from Mars", books: BOOKS.filter((b) => b.hero.body === "mars") },
];

export default function BooksPage() {
  const shelf: ShelfBook[] = BOOKS.map((b) => ({ slug: b.slug, cover: coverOf(b), chapters: b.chapters.map((c) => ({ id: c.id, title: c.title })) }));

  return (
    <>
      <Header />
      <main className="bg-white">
        <section className="relative isolate overflow-hidden bg-mist">
          <div className="absolute -top-40 right-[-10%] -z-10 h-[620px] w-[620px] rounded-full bg-brand/10 blur-3xl" />
          <div className="mx-auto grid max-w-[1440px] items-center gap-8 px-4 pt-7 pb-10 sm:gap-12 sm:px-8 sm:pt-10 sm:pb-16 lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:pt-16 lg:pb-24">
            <div>
              <p className="rise">
                <span className="sticker bg-[#ffd166] text-ink">Rover Villa Books</span>
              </p>
              <h1 className="display rise mt-4 max-w-[13ch] text-[38px] sm:mt-5 sm:text-6xl lg:text-[80px]" style={{ animationDelay: "60ms" }}>
                True stories, told by the machines.
              </h1>
              <p className="rise mt-3 max-w-lg text-[16px] leading-relaxed text-ink-soft sm:mt-5 sm:text-lg" style={{ animationDelay: "120ms" }}>
                Every machine we left behind has a story. Read it as a comic, or curl up with the storybook.
              </p>
              <div className="rise mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:flex sm:flex-wrap sm:gap-3 [&>*]:justify-center" style={{ animationDelay: "180ms" }}>
                <Link
                  href={`/books/${FEATURED.slug}/${FEATURED.chapters[0].id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-brand-deep active:scale-95"
                >
                  Start reading
                  <ArrowRight />
                </Link>
                <a href="#shelves" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-ink ring-1 ring-line transition hover:ring-ink/20 active:scale-95">
                  Browse the shelves
                </a>
              </div>
            </div>

            {/* Three books fanned out; the front one opens its book page. */}
            <div className="rise relative mx-auto aspect-[20/19] w-full max-w-[300px] sm:max-w-[440px] lg:max-w-[480px]" style={{ animationDelay: "120ms" }}>
              {FAN.map((b, i) => (
                <div
                  key={b.slug}
                  aria-hidden
                  className={`absolute top-[6%] w-[52%] transition-transform duration-700 ease-out ${i === 0 ? "left-[2%] -rotate-[9deg]" : "right-[2%] rotate-[9deg]"}`}
                >
                  <BookCover book={coverOf(b)} sizes="260px" className="shadow-[0_30px_50px_-24px_rgba(13,11,38,0.55)]" />
                </div>
              ))}
              <Link href={`/books/${FEATURED.slug}`} className="group absolute top-0 left-1/2 w-[60%] -translate-x-1/2" aria-label={`${FEATURED.title}, told by ${FEATURED.name}`}>
                <BookCover
                  book={coverOf(FEATURED)}
                  sizes="(min-width:1024px) 300px, 60vw"
                  priority
                  className="shadow-[0_44px_70px_-26px_rgba(13,11,38,0.7)] transition-transform duration-500 ease-out group-hover:-translate-y-2"
                />
              </Link>
            </div>
          </div>
        </section>

        <div className="space-y-12 py-10 sm:space-y-20 sm:py-14 lg:py-20">
          <ContinueReading books={shelf} />

          <div id="shelves" className="scroll-mt-24 space-y-10 sm:space-y-16">
            {SHELVES.map((s) => (
              <Shelf key={s.title} title={s.title} tone="light">
                {s.books.map((b) => (
                  <li key={b.slug} className="w-[36vw] max-w-[200px] shrink-0 snap-start sm:w-[180px] lg:w-[200px]">
                    <BookTile slug={b.slug} book={coverOf(b)} sizes="200px" />
                  </li>
                ))}
              </Shelf>
            ))}
          </div>

          <section data-rise className="mx-auto max-w-[1440px] px-4 sm:px-8">
            <div className="grid gap-4 md:grid-cols-2">
              <WayToRead
                title="Comic"
                text="Panels, speech bubbles and archive photos. Big moments, quick to read."
                art={
                  <div className="grid h-full grid-cols-3 grid-rows-2 gap-1.5">
                    <span className="col-span-2 rounded-md bg-brand" />
                    <span className="rounded-md bg-mars/80" />
                    <span className="rounded-md bg-ink/80" />
                    <span className="col-span-2 rounded-md bg-brand-bright/60" />
                  </div>
                }
              />
              <WayToRead
                title="Storybook"
                text="The same chapter as a story to read slowly, or to have read aloud."
                art={
                  <div className="flex h-full flex-col justify-center gap-2">
                    <span className="h-2.5 w-4/5 rounded-full bg-ink/80" />
                    <span className="h-2 w-full rounded-full bg-ink/20" />
                    <span className="h-2 w-11/12 rounded-full bg-ink/20" />
                    <span className="h-2 w-3/4 rounded-full bg-ink/20" />
                  </div>
                }
              />
            </div>
            <p className="mt-8 max-w-3xl text-[13px] leading-relaxed text-ink-soft">
              Each book is told in the machine&rsquo;s imagined voice. The events are real, and every chapter links the mission records it comes from. Photos come
              from the NASA Image and Video Library and are credited where they appear. Rover Villa is independent and not
              endorsed by NASA.
            </p>
          </section>
        </div>
      </main>
      <Footer />
      <Motion />
    </>
  );
}

function WayToRead({ title, text, art }: { title: string; text: string; art: ReactNode }) {
  return (
    <div className="flex items-center gap-5 rounded-3xl bg-mist p-5 ring-1 ring-line sm:p-6">
      <div className="h-24 w-24 shrink-0 rounded-2xl bg-white p-3 ring-1 ring-line">{art}</div>
      <div>
        <h3 className="display text-2xl">{title}</h3>
        <p className="mt-1.5 text-[15px] leading-snug text-ink-soft">{text}</p>
      </div>
    </div>
  );
}
