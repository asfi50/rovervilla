"use client";

import { fraction, useProgress } from "@/lib/watch-progress";

/** A thin bar along the bottom of a poster showing how much of it this viewer has watched. */
export default function ProgressBar({ id, className = "" }: { id: string; className?: string }) {
  const f = fraction(useProgress()[id]);
  if (!f) return null;
  return (
    <span aria-label={f >= 1 ? "Watched" : `${Math.round(f * 100)}% watched`} className={`absolute inset-x-2 bottom-2 block h-1 overflow-hidden rounded-full bg-white/25 ${className}`}>
      <span className="block h-full origin-left rounded-full bg-brand-bright" style={{ transform: `scaleX(${f})` }} />
    </span>
  );
}
