import Link from "next/link";
import { ROVERVILLA_JR, episodes } from "@/lib/videos";
import LoopVideo from "@/app/components/videos/loop-video";
import TitleArt from "@/app/components/videos/title-art";
import { EpisodeCard } from "@/app/components/videos/cards";
import { PlayButton } from "@/app/components/videos/play";
import { btnGlass, btnPrimary } from "@/app/components/videos/billboard";

/**
 * Rover Villa Jr on the home page: a dark screen set into the white page, the trailer looping
 * behind the title, and a few episodes standing beside it. No counts or running times here.
 */
export function JrSection() {
  const s = ROVERVILLA_JR;
  const picks = episodes(s).slice(0, 3);

  return (
    <section data-reveal className="mx-auto max-w-[1440px] px-4 pt-10 sm:px-8 sm:pt-20">
      <div className="relative isolate overflow-hidden rounded-[24px] bg-screen text-white sm:rounded-[36px]">
        <LoopVideo wide={s.art.loopWide} tall={s.art.loopTall} wideStill={s.art.wide} tallStill={s.art.tall} className="-z-10" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-screen via-screen/55 to-screen/0 lg:bg-linear-to-r lg:from-screen/90 lg:via-screen/40 lg:to-screen/10" />

        {/* Phones: a compact card (video peeking above, title, two buttons, a short rail).
            Larger screens: a tall screen with the posters stepped beside the title. */}
        <div className="grid items-end gap-5 p-5 pt-[46vw] sm:min-h-[min(88svh,760px)] sm:gap-8 sm:p-10 sm:pt-[38vh] lg:min-h-[640px] lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12 lg:p-14">
          <div>
            <TitleArt series={s} className="w-[min(46vw,190px)] sm:w-[260px] lg:w-[340px]" />
            <p className="mt-6 hidden max-w-sm text-lg leading-snug text-white/85 sm:block sm:text-xl">{s.tagline}</p>
            <div className="mt-4 flex gap-2.5 sm:mt-7 sm:flex-wrap sm:gap-3">
              <PlayButton series={s.slug} id={s.trailer.id} className={`${btnPrimary} max-sm:gap-2 max-sm:px-5 max-sm:py-3 max-sm:text-[14px]`}>
                <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" aria-hidden>
                  <path d="M7 4.8v14.4a1 1 0 0 0 1.53.85l11.4-7.2a1 1 0 0 0 0-1.7L8.53 3.95A1 1 0 0 0 7 4.8z" />
                </svg>
                Watch trailer
              </PlayButton>
              <Link href={`/series/${s.slug}`} className={`${btnGlass} max-sm:gap-1.5 max-sm:px-5 max-sm:py-3 max-sm:text-[14px]`}>
                View all
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Phones: a swipeable rail. Desktop: three posters stepped like a stage. */}
          <ul className="no-scrollbar -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-2.5 overflow-x-auto px-5 pb-1 sm:-mx-10 sm:scroll-px-10 sm:gap-3 sm:px-10 lg:mx-0 lg:gap-5 lg:overflow-visible lg:px-0">
            {picks.map((v, i) => (
              <li key={v.id} className={`w-[28vw] max-w-[150px] shrink-0 snap-start sm:w-[180px] sm:max-w-[190px] lg:w-[190px] xl:w-[210px] ${["lg:translate-y-6", "lg:-translate-y-6", "lg:translate-y-10"][i]}`}>
                <EpisodeCard series={s} v={v} meta={false} sizes="210px" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
