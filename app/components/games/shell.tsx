import Link from "next/link";
import type { ReactNode } from "react";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import { getHero } from "@/lib/heroes";
import { getBook } from "@/lib/books";
import { ArrowLeft, ArrowRight } from "@/app/components/icons";

export type GameFact = { value: string; label: string; source: string };

/**
 * The page around a mini-game: a way back to Games, the title and the goal, the game itself,
 * then the real story behind it, every fact linked to its source.
 */
export default function GameShell({
  hero: slug,
  title,
  goal,
  facts,
  story,
  children,
}: {
  hero: string;
  title: string;
  goal: string;
  facts: GameFact[];
  story: string;
  children: ReactNode;
}) {
  const hero = getHero(slug)!;
  const book = getBook(slug);
  return (
    <>
      <Header />
      <main className="bg-white">
        <div className="mx-auto max-w-[1200px] px-4 pt-5 sm:px-8 lg:pt-8">
          <Link href="/games" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-brand">
            <ArrowLeft className="h-4 w-4" />
            Games
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-x-10 gap-y-2">
            <div>
              <p className="font-mono text-[12px] tracking-[0.14em] text-brand uppercase">{hero.name}</p>
              <h1 className="display mt-1.5 text-[38px] sm:text-5xl lg:text-[60px]">{title}</h1>
            </div>
            <p className="max-w-md pb-1 text-[15px] leading-snug text-ink-soft sm:text-base">{goal}</p>
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-[1200px] px-3 sm:px-8">{children}</div>

        <section className="mx-auto max-w-[1200px] px-4 pt-14 pb-20 sm:px-8 lg:pt-20 lg:pb-28">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
            <div>
              <p className="font-mono text-[12px] tracking-[0.14em] text-brand uppercase">The real story</p>
              <p className="mt-3 text-xl leading-snug font-semibold text-ink sm:text-2xl">{story}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {book && (
                  <Link
                    href={`/books/${book.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-deep"
                  >
                    Read {book.name}&rsquo;s book
                    <ArrowRight />
                  </Link>
                )}
                <Link
                  href={`/heroes/${hero.slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-mist px-5 py-3 text-sm font-semibold text-ink ring-1 ring-line transition hover:ring-ink/20"
                >
                  Meet {hero.name}
                </Link>
              </div>
            </div>
            <dl className="grid gap-x-8 gap-y-7 border-t border-line pt-6 sm:grid-cols-2">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="display text-[30px] text-ink">{f.value}</dt>
                  <dd className="mt-1 text-[15px] leading-snug text-ink-soft">{f.label}</dd>
                  <dd className="mt-1.5">
                    <a href={f.source} target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium text-brand hover:underline">
                      Source ↗
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-12 max-w-3xl text-[13px] leading-relaxed text-ink-soft">
            An illustrative game, not a simulation of real spacecraft data: speeds and timings are squeezed so the story fits in a few minutes. The facts on this
            page are real and linked to their sources.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
