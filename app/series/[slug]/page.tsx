import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import { generateSEO } from "@/lib/seo";
import { SERIES, getSeries, seriesName } from "@/lib/videos";
import { Billboard, btnGlass, btnPrimary } from "@/app/components/videos/billboard";
import { EpisodeCard, EpisodeRow } from "@/app/components/videos/cards";
import { PlayButton } from "@/app/components/videos/play";
import { SmartPlay } from "@/app/components/videos/watching";
import SeriesTabs from "@/app/components/videos/series-tabs";
import Motion from "@/app/components/videos/motion";
import RailDots from "@/app/components/rail-dots";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = getSeries((await params).slug);
  if (!s) return {};
  return generateSEO({
    title: `${seriesName(s)} | ${s.format} | Rover Villa`,
    description: `${s.tagline} ${s.synopsis}`,
    path: `/series/${s.slug}`,
    ogImage: s.art.og,
    keywords: [seriesName(s), s.format, "kids animated series", "Mars rovers cartoon"],
  });
}

export default async function SeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const s = getSeries((await params).slug);
  if (!s) notFound();

  return (
    <>
      <Header tone="dark" />
      <main className="bg-screen text-white">
        <Billboard
          series={s}
          tall={false}
          line={s.synopsis}
          actions={
            <>
              <SmartPlay series={s} className={btnPrimary} />
              <PlayButton series={s.slug} id={s.trailer.id} className={btnGlass}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden>
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <path d="M10.5 9.5v5l4-2.5z" fill="currentColor" />
                </svg>
                Trailer
              </PlayButton>
            </>
          }
        />

        <SeriesTabs />

        <div className="space-y-14 px-4 pt-6 pb-16 sm:space-y-28 sm:px-8 sm:pt-14 sm:pb-24 lg:px-12">
          {s.seasons.map((season) => (
            <section key={season.name} id="episodes" className="max-w-[1320px] scroll-mt-36">
              <h2 className="display text-[28px] sm:text-4xl">{season.name}</h2>
              {/* Phones: a list, like a streaming app's season view. Larger screens: a poster grid. */}
              <ul className="mt-4 divide-y divide-white/8 sm:hidden">
                {season.episodes.map((v) => (
                  <li key={v.id} className="py-3">
                    <EpisodeRow series={s} v={v} />
                  </li>
                ))}
              </ul>
              <ul className="mt-6 hidden gap-x-5 gap-y-10 sm:grid sm:grid-cols-3 lg:grid-cols-4">
                {season.episodes.map((v) => (
                  <li key={v.id} data-rise>
                    <EpisodeCard series={s} v={v} summary sizes="(min-width:1024px) 320px, 30vw" />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section id="residents" className="max-w-[1320px] scroll-mt-36">
            <h2 className="display text-[28px] sm:text-4xl">Meet the residents</h2>
            {/* Phones: swipe through the residents. Larger screens: a grid. */}
            <ul className="no-scrollbar -mx-4 mt-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:mx-0 sm:mt-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:p-0 lg:grid-cols-4">
              {s.residents.map((r) => (
                <li
                  key={r.name}
                  data-rise
                  className="group w-[62vw] max-w-[260px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10 transition hover:bg-white/[0.07] sm:w-auto sm:max-w-none"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image src={r.image} alt={r.alt} fill sizes="(min-width:1024px) 320px, 46vw" className="object-cover transition duration-700 ease-out group-hover:scale-105" />
                  </div>
                  <div className="p-4 sm:p-5">
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-brand-glow uppercase">{r.badge}</p>
                    <h3 className="display mt-1.5 text-xl leading-tight sm:text-2xl">{r.name}</h3>
                    <p className="mt-2 text-[13px] leading-snug text-white/60 sm:text-sm">{r.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <RailDots count={s.residents.length} tone="dark" className="sm:hidden" />
          </section>

          <section id="details" data-rise className="grid max-w-[1320px] scroll-mt-36 gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
            <div>
              <h2 className="display text-[28px] sm:text-4xl">Details</h2>
              {s.lore && <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">{s.lore}</p>}
              {s.trailerNote && <p className="mt-4 max-w-xl text-white/55">{s.trailerNote}</p>}
              <dl className="mt-8 grid max-w-md grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-[15px]">
                <dt className="text-white/45">Created by</dt>
                <dd className="font-semibold">{s.createdBy}</dd>
                <dt className="text-white/45">For</dt>
                <dd>{s.audience}</dd>
                <dt className="text-white/45">Format</dt>
                <dd>{s.format}</dd>
              </dl>
            </div>
            <div>
              <h3 className="text-[11px] font-semibold tracking-[0.16em] text-white/50 uppercase">Music and image credits</h3>
              <ul className="mt-4 space-y-2.5 text-[13px] leading-relaxed text-white/55">
                {s.credits.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
      <Footer tone="dark" />
      <Motion />
    </>
  );
}
