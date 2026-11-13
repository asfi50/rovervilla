"use client";

import { SERIES, episodes, playlist, type Series, type Video } from "@/lib/videos";
import { fraction, useProgress, type Progress } from "@/lib/watch-progress";
import { PlayButton } from "@/app/components/videos/play";
import { EpisodeCard, WideCard } from "@/app/components/videos/cards";
import Shelf from "@/app/components/videos/shelf";

/** Videos this viewer started and hasn't finished, latest first. Hidden until there are any. */
export function ContinueRow() {
  const all = useProgress();
  const rows = SERIES.flatMap((s) => playlist(s).map((v) => ({ s, v, p: all[v.id] })))
    .filter((x): x is { s: Series; v: Video; p: Progress } => !!x.p && fraction(x.p) > 0.02 && fraction(x.p) < 1)
    .sort((a, b) => b.p.at - a.p.at);
  if (!rows.length) return null;
  return (
    <Shelf title="Continue watching">
      {rows.map(({ s, v }) => (
        <li key={v.id} className={`shrink-0 snap-start ${v.shape === "portrait" ? "w-[38vw] max-w-[200px] sm:w-[190px] lg:w-[210px]" : "w-[72vw] max-w-[420px] sm:w-[360px]"}`}>
          {v.shape === "portrait" ? <EpisodeCard series={s} v={v} /> : <WideCard series={s} v={v} />}
        </li>
      ))}
    </Shelf>
  );
}

/** Which episode "Play" should start: the one in progress, else the one after the last finished, else the first. */
function nextUp(series: Series, all: Record<string, Progress>) {
  const eps = episodes(series);
  const touched = eps.map((v, i) => ({ v, i, p: all[v.id] })).filter((x) => x.p).sort((a, b) => b.p!.at - a.p!.at)[0];
  if (!touched) return { v: eps[0], resume: false };
  if (fraction(touched.p) < 1) return { v: touched.v, resume: true };
  return { v: eps[(touched.i + 1) % eps.length], resume: false };
}

/** The main Play button for a series, aware of what this viewer has watched. */
export function SmartPlay({ series, className = "" }: { series: Series; className?: string }) {
  const all = useProgress();
  const { v, resume } = nextUp(series, all);
  const started = Object.keys(all).length > 0 && episodes(series).some((e) => all[e.id]);
  return (
    <PlayButton series={series.slug} id={v.id} label={`Play ${v.title}`} className={className}>
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
        <path d="M7 4.8v14.4a1 1 0 0 0 1.53.85l11.4-7.2a1 1 0 0 0 0-1.7L8.53 3.95A1 1 0 0 0 7 4.8z" />
      </svg>
      <span className="flex flex-col items-start leading-none">
        {resume ? "Resume" : "Play"}
        {started && <span className="mt-1 text-[11px] font-medium opacity-60">{v.label}</span>}
      </span>
    </PlayButton>
  );
}
