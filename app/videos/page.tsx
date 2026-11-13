import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import { generateSEO } from "@/lib/seo";
import { ROVERVILLA_JR, SERIES, episodes, seriesName } from "@/lib/videos";
import { Billboard, Spotlight, btnGlass, btnPrimary } from "@/app/components/videos/billboard";
import { EpisodeCard, ResidentChip, SeriesTile } from "@/app/components/videos/cards";
import { ContinueRow, SmartPlay } from "@/app/components/videos/watching";
import Shelf from "@/app/components/videos/shelf";
import Motion from "@/app/components/videos/motion";

export const metadata: Metadata = generateSEO({
  title: "Videos | Rover Villa",
  description: "Series and films from Rover Villa, starting with Rover Villa Jr: the town where Mars rovers go when the work is done.",
  path: "/videos",
  ogImage: ROVERVILLA_JR.art.og,
});

/** The catalogue: a featured series up top, then a row per series and the rest of the shelves. */
export default function VideosPage() {
  const featured = ROVERVILLA_JR;
  const spotlight = episodes(featured).find((v) => v.id === "spirits-lucky-wheel")!;

  return (
    <>
      <Header tone="dark" />
      <main className="bg-screen text-white">
        <Billboard
          series={featured}
          actions={
            <>
              <SmartPlay series={featured} className={btnPrimary} />
              <Link href={`/series/${featured.slug}`} className={btnGlass}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 11v5M12 8h.01" />
                </svg>
                More info
              </Link>
            </>
          }
        />

        <div className="relative z-10 -mt-20 space-y-10 pb-24 sm:-mt-28 sm:space-y-14 lg:-mt-36">
          <ContinueRow />

          {SERIES.map((s) => (
            <Shelf key={s.slug} title={seriesName(s)} href={`/series/${s.slug}`}>
              {episodes(s).map((v) => (
                <li key={v.id} className="w-[38vw] max-w-[200px] shrink-0 snap-start sm:w-[190px] lg:w-[216px]">
                  <EpisodeCard series={s} v={v} />
                </li>
              ))}
            </Shelf>
          ))}

          <Spotlight series={featured} v={spotlight} />

          <Shelf title="Meet the residents" href={`/series/${featured.slug}#residents`}>
            {featured.residents.map((r) => (
              <li key={r.name} className="w-[27vw] max-w-[150px] shrink-0 snap-start sm:w-[136px] lg:w-[150px]">
                <ResidentChip series={featured} r={r} />
              </li>
            ))}
          </Shelf>

          <section data-rise className="px-4 sm:px-8 lg:px-12">
            <h2 className="text-lg font-semibold tracking-tight sm:text-[22px]">All series</h2>
            <ul className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {SERIES.map((s) => (
                <li key={s.slug}>
                  <SeriesTile series={s} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <Footer tone="dark" />
      <Motion />
    </>
  );
}
