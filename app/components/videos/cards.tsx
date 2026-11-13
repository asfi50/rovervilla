import Image from "next/image";
import Link from "next/link";
import { runtime, type Resident, type Series, type Video } from "@/lib/videos";
import { PlayButton } from "@/app/components/videos/play";
import ProgressBar from "@/app/components/videos/progress-bar";
import TitleArt from "@/app/components/videos/title-art";

/* Poster cards used across /videos, series pages and the home page. Built from spans so
 * they can sit inside buttons. [data-poster] is where the player grows from and returns to. */

const PlayGlyph = () => (
  <span className="absolute top-1/2 left-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 scale-75 place-items-center rounded-full bg-white/90 text-black opacity-0 shadow-xl transition duration-300 group-hover/card:scale-100 group-hover/card:opacity-100 group-focus-visible/card:scale-100 group-focus-visible/card:opacity-100">
    <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6" fill="currentColor" aria-hidden>
      <path d="M7 4.8v14.4a1 1 0 0 0 1.53.85l11.4-7.2a1 1 0 0 0 0-1.7L8.53 3.95A1 1 0 0 0 7 4.8z" />
    </svg>
  </span>
);

const frame =
  "relative block overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 transition duration-500 ease-out group-hover/card:-translate-y-1 group-hover/card:ring-white/50 group-active/card:scale-[0.97] group-focus-visible/card:ring-2 group-focus-visible/card:ring-white";

/** A tall episode poster. `meta` adds its label and running time under the title. */
export function EpisodeCard({
  series,
  v,
  meta = true,
  summary = false,
  sizes = "(min-width:1024px) 220px, 42vw",
}: {
  series: Series;
  v: Video;
  meta?: boolean;
  summary?: boolean;
  sizes?: string;
}) {
  return (
    <PlayButton series={series.slug} id={v.id} label={`Play ${v.title}`} className="group/card block w-full text-left outline-none">
      <span data-poster={v.id} className={`${frame} aspect-9/16`}>
        <Image src={v.poster} alt="" fill sizes={sizes} className="object-cover transition duration-700 ease-out group-hover/card:scale-105" />
        <span className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        <PlayGlyph />
        <ProgressBar id={v.id} />
      </span>
      <span className="mt-2.5 line-clamp-2 block text-[14px] leading-snug font-semibold sm:text-[15px]">{v.title}</span>
      {meta && (
        <span className="mt-0.5 block text-xs text-white/50">
          {v.label} · {runtime(v.duration)}
        </span>
      )}
      {summary && v.summary && <span className="mt-2 line-clamp-3 block text-[13px] leading-snug text-white/55 sm:text-sm">{v.summary}</span>}
    </PlayButton>
  );
}

/** Phones: an episode as a list row, the way streaming apps list a season. */
export function EpisodeRow({ series, v }: { series: Series; v: Video }) {
  return (
    <PlayButton series={series.slug} id={v.id} label={`Play ${v.title}`} className="group/card flex w-full items-center gap-3.5 text-left outline-none">
      <span data-poster={v.id} className={`${frame} aspect-9/16 w-[74px] shrink-0 rounded-lg`}>
        <Image src={v.poster} alt="" fill sizes="80px" className="object-cover" />
        <span className="absolute inset-0 grid place-items-center bg-black/20">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-black">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M7 4.8v14.4a1 1 0 0 0 1.53.85l11.4-7.2a1 1 0 0 0 0-1.7L8.53 3.95A1 1 0 0 0 7 4.8z" />
            </svg>
          </span>
        </span>
        <ProgressBar id={v.id} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold tracking-[0.12em] text-white/45 uppercase">
          {v.label} · {runtime(v.duration)}
        </span>
        <span className="mt-1 block text-[16px] leading-snug font-semibold">{v.title}</span>
        {v.summary && <span className="mt-1 line-clamp-3 block text-[13px] leading-snug text-white/55">{v.summary}</span>}
      </span>
    </PlayButton>
  );
}

/** A wide 16:9 card for landscape videos such as trailers. */
export function WideCard({ series, v, meta = true }: { series: Series; v: Video; meta?: boolean }) {
  return (
    <PlayButton series={series.slug} id={v.id} label={`Play ${v.title}`} className="group/card block w-full text-left outline-none">
      <span data-poster={v.id} className={`${frame} aspect-video`}>
        <Image src={v.poster} alt="" fill sizes="(min-width:1024px) 480px, 80vw" className="object-cover transition duration-700 ease-out group-hover/card:scale-105" />
        <PlayGlyph />
        <ProgressBar id={v.id} />
      </span>
      <span className="mt-2.5 block text-[15px] font-semibold">{v.title}</span>
      {meta && (
        <span className="mt-0.5 block text-xs text-white/50">
          {v.label} · {runtime(v.duration)}
        </span>
      )}
    </PlayButton>
  );
}

/** A series' key art with its title lockup; opens the series page. */
export function SeriesTile({ series }: { series: Series }) {
  return (
    <Link href={`/series/${series.slug}`} className="group/card block outline-none">
      <span className={`${frame} aspect-video`}>
        <Image src={series.art.wide} alt="" fill sizes="(min-width:1024px) 640px, 86vw" className="object-cover transition duration-700 ease-out group-hover/card:scale-105" />
        <span className="absolute inset-0 bg-linear-to-tr from-black/75 via-black/10 to-transparent" />
        <span className="absolute bottom-[9%] left-[6%] text-white">
          <TitleArt series={series} className="w-[clamp(120px,32%,220px)]" />
        </span>
      </span>
      <span className="mt-2.5 block text-xs text-white/55">
        {series.audience} · {series.format}
      </span>
    </Link>
  );
}

/** A resident's round portrait and name; opens the series page at its residents. */
export function ResidentChip({ series, r }: { series: Series; r: Resident }) {
  return (
    <Link href={`/series/${series.slug}#residents`} className="group/card flex flex-col items-center gap-2.5 text-center outline-none">
      <span className="relative block aspect-square w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10 transition duration-500 group-hover/card:-translate-y-1 group-hover/card:ring-2 group-hover/card:ring-white group-active/card:scale-95">
        <Image src={r.image} alt={r.alt} fill sizes="140px" className="object-cover transition duration-700 group-hover/card:scale-110" />
      </span>
      <span className="line-clamp-2 text-[13px] leading-tight font-semibold sm:text-sm">{r.name}</span>
    </Link>
  );
}
