"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import RailDots from "@/app/components/rail-dots";

/**
 * A horizontal row of posters. Touch scrolls it natively with snapping; on desktop it scrolls
 * with the trackpad, or a page at a time with the arrows that appear on hover.
 */
export default function Shelf({ title, href, tone = "dark", children }: { title: string; href?: string; tone?: "dark" | "light"; children: ReactNode }) {
  const light = tone === "light";
  const list = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true });

  useEffect(() => {
    const el = list.current!;
    const update = () => setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const page = (dir: 1 | -1) => {
    const el = list.current!;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const arrow = (dir: 1 | -1) => (
    <button
      type="button"
      onClick={() => page(dir)}
      aria-label={dir > 0 ? `More ${title}` : `Back`}
      className={`absolute inset-y-0 z-10 hidden w-12 place-items-center opacity-0 transition-opacity duration-300 group-hover/shelf:opacity-100 disabled:hidden lg:grid ${
        dir > 0 ? "right-0 bg-linear-to-l" : "left-0 bg-linear-to-r"
      } ${light ? "from-white/95 text-ink" : "from-screen/95 text-white"} to-transparent`}
      disabled={dir > 0 ? edge.end : edge.start}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={dir > 0 ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} />
      </svg>
    </button>
  );

  return (
    <section data-rise className="group/shelf relative">
      <div className="flex items-baseline justify-between gap-4 px-4 sm:px-8 lg:px-12">
        <h2 className="text-lg font-semibold tracking-tight sm:text-[22px]">{title}</h2>
        {href && (
          <Link
            href={href}
            className={`group inline-flex items-center gap-1 text-sm font-semibold transition-colors ${light ? "text-ink-soft hover:text-brand" : "text-white/60 hover:text-white"}`}
          >
            View all
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        )}
      </div>
      <div className="relative">
        {arrow(-1)}
        <ul
          ref={list}
          className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pt-3 pb-3 sm:gap-4 sm:scroll-px-8 sm:px-8 lg:scroll-px-12 lg:px-12"
        >
          {children}
        </ul>
        {arrow(1)}
      </div>
      {/* touch screens get no arrows, so show where you are in the row */}
      <RailDots count={Children.count(children)} target={list} tone={light ? "light" : "dark"} className="-mt-1 lg:hidden" />
    </section>
  );
}
