"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { getSeries, playlist, SERIES, type Series } from "@/lib/videos";
import { resumeAt } from "@/lib/watch-progress";
import type { PlayerProps } from "@/app/components/videos/player";

/*
 * Anything can start playback by calling play(); the one PlayerHost in the root layout
 * opens the player. The player itself (and GSAP) only download on first use, and a
 * ?watch=<video id> link opens straight into that video.
 */

type PlayRequest = { series: string; id?: string; from?: DOMRect | null };
const EVENT = "rv:play";

let chunk: Promise<typeof import("@/app/components/videos/player")> | null = null;
export const preloadPlayer = () => (chunk ??= import("@/app/components/videos/player"));

export const play = (req: PlayRequest) => window.dispatchEvent(new CustomEvent<PlayRequest>(EVENT, { detail: req }));

type Open = { series: Series; start: number; startAt: number; from: DOMRect | null; key: number };

export default function PlayerHost() {
  const [open, setOpen] = useState<Open | null>(null);
  const [Player, setPlayer] = useState<ComponentType<PlayerProps> | null>(null);

  useEffect(() => {
    const start = async ({ series: slug, id, from = null }: PlayRequest) => {
      const series = getSeries(slug);
      if (!series) return;
      const list = playlist(series);
      const i = Math.max(0, id ? list.findIndex((v) => v.id === id) : 0);
      const m = await preloadPlayer();
      setPlayer(() => m.default);
      setOpen({ series, start: i, startAt: resumeAt(list[i].id), from, key: Date.now() });
    };
    const onPlay = (e: Event) => start((e as CustomEvent<PlayRequest>).detail);
    window.addEventListener(EVENT, onPlay);

    const watch = new URLSearchParams(location.search).get("watch");
    const owner = watch && SERIES.find((s) => playlist(s).some((v) => v.id === watch));
    if (owner) start({ series: owner.slug, id: watch });

    return () => window.removeEventListener(EVENT, onPlay);
  }, []);

  if (!open || !Player) return null;
  const { key, ...props } = open;
  return <Player key={key} {...props} onClose={() => setOpen(null)} />;
}

/** A button that opens the player at a video. Its [data-poster] child, if any, is where the player grows from. */
export function PlayButton({
  series,
  id,
  className = "",
  label,
  children,
}: {
  series: string;
  id?: string;
  className?: string;
  label?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={className}
      onPointerEnter={preloadPlayer}
      onPointerDown={preloadPlayer}
      onClick={(e) => {
        const el = e.currentTarget.querySelector("[data-poster]") ?? e.currentTarget;
        play({ series, id, from: el.getBoundingClientRect() });
      }}
    >
      {children}
    </button>
  );
}
