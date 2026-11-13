"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * The "there's more this way" hint under a sideways-scrolling row: one dot per card for short
 * rows, a small scroll track for long ones. It follows the row as you swipe, and hides itself
 * when everything already fits. Place it right after the row, or pass the row as `target`.
 * Use `className` to hide it where the row turns into a grid (e.g. `sm:hidden`).
 */
export default function RailDots({
  count,
  target,
  tone = "light",
  className = "",
}: {
  count: number;
  target?: RefObject<HTMLElement | null>;
  tone?: "light" | "dark";
  className?: string;
}) {
  const me = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ fits: true, at: 0, thumb: 1, left: 0 });

  useEffect(() => {
    const rail = target?.current ?? (me.current?.previousElementSibling as HTMLElement | null);
    if (!rail) return;
    const on = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      const p = max > 0 ? rail.scrollLeft / max : 0;
      setView({
        fits: max < 4,
        at: Math.round(p * (count - 1)),
        thumb: rail.clientWidth / rail.scrollWidth,
        left: (rail.scrollLeft / rail.scrollWidth) * 100,
      });
    };
    on();
    rail.addEventListener("scroll", on, { passive: true });
    const ro = new ResizeObserver(on);
    ro.observe(rail);
    return () => {
      rail.removeEventListener("scroll", on);
      ro.disconnect();
    };
  }, [count, target]);

  const dark = tone === "dark";
  const on = dark ? "bg-white" : "bg-brand";
  const off = dark ? "bg-white/25" : "bg-ink/15";

  return (
    <div ref={me} aria-hidden className={`mt-3 flex justify-center ${view.fits ? "invisible" : ""} ${className}`}>
      {count <= 8 ? (
        <span className="flex items-center gap-1.5">
          {Array.from({ length: count }, (_, i) => (
            <span key={i} className={`block h-1.5 rounded-full transition-all duration-300 ${i === view.at ? `w-5 ${on}` : `w-1.5 ${off}`}`} />
          ))}
        </span>
      ) : (
        <span className={`relative block h-1 w-16 overflow-hidden rounded-full ${off}`}>
          <span className={`absolute inset-y-0 rounded-full ${on}`} style={{ width: `${view.thumb * 100}%`, left: `${view.left}%` }} />
        </span>
      )}
    </div>
  );
}
