import Image from "next/image";
import type { ReactNode } from "react";
import type { Series, Video } from "@/lib/videos";
import LoopVideo from "@/app/components/videos/loop-video";
import TitleArt from "@/app/components/videos/title-art";
import { PlayButton } from "@/app/components/videos/play";

export const btnPrimary =
  "inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-black shadow-[0_10px_40px_-12px_rgba(255,255,255,0.5)] transition hover:bg-white/85 active:scale-95";
export const btnGlass =
  "inline-flex items-center gap-2.5 rounded-full bg-white/14 px-6 py-3.5 text-[15px] font-semibold text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-white/24 active:scale-95";

/** The full-bleed trailer loop at the top of /videos and of each series page. */
export function Billboard({ series, actions, line = series.tagline, tall = true }: { series: Series; actions: ReactNode; line?: string; tall?: boolean }) {
  return (
    // A minimum height, not a fixed one: on short screens (laptops, phones turned sideways) the
    // billboard grows to fit its text instead of pushing the title up under the fixed header.
    <section
      data-billboard
      className={`relative isolate flex flex-col justify-end overflow-hidden bg-screen text-white ${tall ? "min-h-[94svh] lg:min-h-[96vh]" : "min-h-[86svh] lg:min-h-[86vh]"}`}
    >
      <div data-billboard-media className="absolute inset-0 -z-10 will-change-transform">
        <LoopVideo wide={series.art.loopWide} tall={series.art.loopTall} wideStill={series.art.wide} tallStill={series.art.tall} />
        <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-screen/70 to-transparent" />
        <div className="absolute inset-0 hidden bg-linear-to-r from-screen/85 via-screen/25 to-transparent sm:block" />
        <div className="absolute inset-x-0 bottom-0 h-[62%] bg-linear-to-t from-screen via-screen/70 to-transparent" />
      </div>

      {/* Top padding always clears the header. The bottom leaves room for the rows that slide up
          over a catalogue billboard; a series page's tabs come straight after, so it needs less. */}
      <div
        data-billboard-content
        className={`px-5 pt-28 sm:px-8 lg:px-12 lg:pt-32 ${tall ? "pb-28 sm:pb-36 lg:pb-44" : "pb-14 sm:pb-16 lg:pb-20"}`}
      >
        <div className="max-w-xl">
          <div className="rise">
            {/* Sized by screen height too, so a short window gets a smaller title rather than a cramped one. */}
            <TitleArt series={series} className="w-[min(62vw,280px,40svh)] sm:w-[min(340px,44svh)] lg:w-[min(400px,46vh)]" />
          </div>
          <p className="rise mt-6 flex items-center gap-2 text-[13px] font-semibold text-white/75" style={{ animationDelay: "90ms" }}>
            <span className="rounded-md bg-white/15 px-2 py-1 text-[11px] tracking-[0.12em] text-white uppercase backdrop-blur-md">{series.audience}</span>
            {series.format}
          </p>
          <p className="rise mt-3 max-w-md text-[17px] leading-snug text-white/90 sm:text-xl" style={{ animationDelay: "160ms" }}>
            {line}
          </p>
          <div className="rise mt-7 flex flex-wrap items-center gap-3" style={{ animationDelay: "230ms" }}>
            {actions}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * One episode given the big screen: its poster blurred into a backdrop, the poster itself
 * standing up on the right, title and summary on the left.
 */
export function Spotlight({ series, v }: { series: Series; v: Video }) {
  return (
    <section data-rise className="px-4 sm:px-8 lg:px-12">
      <div className="relative isolate overflow-hidden rounded-[28px] ring-1 ring-white/10">
        <Image src={v.poster} alt="" fill sizes="100vw" className="-z-10 scale-125 object-cover opacity-70 blur-2xl saturate-150" />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-screen/90 via-screen/60 to-screen/20" />
        <div className="grid items-center gap-8 p-6 sm:grid-cols-[1fr_auto] sm:p-10 lg:gap-16 lg:p-16">
          <div className="max-w-lg">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-white/60 uppercase">{v.label}</p>
            <h2 className="display mt-3 text-[36px] leading-[0.98] sm:text-5xl lg:text-6xl">{v.title}</h2>
            {v.summary && <p className="mt-4 text-[17px] leading-snug text-white/80">{v.summary}</p>}
            <PlayButton series={series.slug} id={v.id} className={`${btnPrimary} mt-7`}>
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
                <path d="M7 4.8v14.4a1 1 0 0 0 1.53.85l11.4-7.2a1 1 0 0 0 0-1.7L8.53 3.95A1 1 0 0 0 7 4.8z" />
              </svg>
              Watch
            </PlayButton>
          </div>
          <PlayButton series={series.slug} id={v.id} label={`Play ${v.title}`} className="group/card mx-auto block w-[min(60vw,260px)] outline-none sm:w-[240px] lg:w-[300px]">
            <span data-poster={v.id} className="relative block aspect-9/16 rotate-[2.5deg] overflow-hidden rounded-2xl shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/20 transition duration-700 ease-out group-hover/card:rotate-0 group-hover/card:scale-[1.03]">
              <Image src={v.poster} alt="" fill sizes="300px" className="object-cover" />
            </span>
          </PlayButton>
        </div>
      </div>
    </section>
  );
}
