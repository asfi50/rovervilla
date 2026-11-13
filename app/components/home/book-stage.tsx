"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import BookCover, { type CoverData } from "@/app/components/books/cover";
import { setReadMode } from "@/lib/reading";
import { ArrowRight } from "@/app/components/icons";

export type StageBook = {
  slug: string;
  cover: CoverData;
  first: string;
  /** The first line of chapter 1, in the machine's imagined voice. */
  line: string;
  world: "mars" | "moon";
};

/**
 * The home page's book stage: a cover-flow you can swipe, scroll or click through. The middle
 * book stands up straight with a speech bubble; its neighbours turn toward it. The headline
 * follows the world of the book in front ("…on Mars" / "…on the Moon").
 */
export default function BookStage({ books, start }: { books: StageBook[]; start: number }) {
  const [active, setActive] = useState(start);
  const scroller = useRef<HTMLUListElement>(null);
  const activeRef = useRef(start);
  const frame = useRef(0);

  /** Turn and scale every cover by its distance from the middle. Runs on scroll, outside React. */
  const layout = useCallback(() => {
    const s = scroller.current;
    if (!s) return;
    const items = s.children as HTMLCollectionOf<HTMLElement>;
    if (items.length < 2) return;
    const step = items[1].offsetLeft - items[0].offsetLeft;
    const mid = s.scrollLeft + s.clientWidth / 2;
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < items.length; i++) {
      const li = items[i];
      const d = (li.offsetLeft + li.offsetWidth / 2 - mid) / step;
      const a = Math.abs(d);
      if (a < bestD) {
        bestD = a;
        best = i;
      }
      const turn = Math.max(-1, Math.min(1, d));
      const pull = Math.sign(d) * Math.max(0, a - 1) * li.offsetWidth * 0.2;
      const art = li.firstElementChild as HTMLElement;
      art.style.transform = `translateX(${-pull}px) perspective(1100px) rotateY(${-turn * 48}deg) scale(${1 - Math.min(a, 4) * 0.09})`;
      art.style.opacity = String(Math.max(0, Math.min(1, 4.6 - a)));
      li.style.zIndex = String(100 - Math.round(a * 10));
      (art.lastElementChild as HTMLElement).style.opacity = String(Math.min(a, 3) * 0.2);
    }
    if (best !== activeRef.current) {
      activeRef.current = best;
      setActive(best);
    }
  }, []);

  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(layout);
  };

  const centre = useCallback((i: number, smooth = true) => {
    const s = scroller.current;
    const li = s?.children[i] as HTMLElement | undefined;
    if (!s || !li) return;
    s.scrollTo({ left: li.offsetLeft + li.offsetWidth / 2 - s.clientWidth / 2, behavior: smooth ? "smooth" : "instant" });
  }, []);

  // Start on the chosen book, and keep the stage right when the window changes size.
  useEffect(() => {
    centre(start, false);
    layout();
    const onResize = () => {
      centre(activeRef.current, false);
      layout();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frame.current);
    };
  }, [centre, layout, start]);

  const go = (i: number) => centre(Math.max(0, Math.min(books.length - 1, i)));

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(activeRef.current + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(activeRef.current - 1);
    }
  };

  /** A side cover comes to the middle first; the middle one opens its book. */
  const onCover = (e: MouseEvent, i: number) => {
    if (i !== activeRef.current) {
      e.preventDefault();
      go(i);
    }
  };

  const b = books[active];
  const moon = b.world === "moon";

  return (
    <div className="relative">
      <div className="px-5 sm:px-12">
        <h2 className="display max-w-[15ch] text-[34px] leading-[0.98] sm:text-6xl lg:text-[76px]">
          Once upon a time, <br />
          <span key={b.world} className={`rv-pop inline-block ${moon ? "text-[#c9d3ff]" : "text-[#ff9b6b]"}`}>
            {moon ? "on the Moon…" : "on Mars…"}
          </span>
        </h2>
      </div>

      {/* the stage */}
      <div className="relative mt-4 sm:mt-2">
        {/* the speech bubble, from the book in front */}
        <div className="pointer-events-none absolute top-0 left-1/2 z-[200] w-[min(78vw,300px)] -translate-x-1/2 sm:top-[16%] sm:left-[calc(50%+var(--w)*0.42)] sm:w-[250px] sm:translate-x-0 lg:w-[280px]" style={{ "--w": "clamp(150px,40vw,250px)" } as React.CSSProperties}>
          <p
            key={active}
            className="bubble rv-pop px-4 pt-2.5 pb-3 font-hand text-[19px] leading-[1.15] sm:-rotate-2 sm:px-5 sm:pt-3 sm:pb-3.5 sm:text-[23px] [--tail-x:calc(50%-11px)] sm:[--tail-x:22px]"
          >
            {b.line}
          </p>
        </div>

        <ul
          ref={scroller}
          onScroll={onScroll}
          onKeyDown={onKey}
          tabIndex={0}
          aria-label="Books. Use the arrow keys to browse."
          className="no-scrollbar relative flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain pt-[92px] pb-[18%] outline-none [--w:clamp(150px,40vw,250px)] [padding-inline:calc(50%-var(--w)*0.31)] sm:pt-10 sm:pb-[110px] focus-visible:outline-2 focus-visible:-outline-offset-8 focus-visible:outline-white/40"
        >
          {books.map((x, i) => {
            const d = i - start;
            const a = Math.abs(d);
            return (
              <li
                key={x.slug}
                aria-current={i === active ? "true" : undefined}
                className="relative w-(--w) shrink-0 snap-center [margin-inline:calc(var(--w)*-0.19)]"
                style={{ zIndex: 100 - a * 10 }}
              >
                <div
                  className="relative will-change-transform"
                  style={{
                    transform: `translateX(${-Math.sign(d) * Math.max(0, a - 1) * 0.2 * 200}px) perspective(1100px) rotateY(${-Math.max(-1, Math.min(1, d)) * 48}deg) scale(${1 - Math.min(a, 4) * 0.09})`,
                    opacity: Math.max(0, Math.min(1, 4.6 - a)),
                  }}
                >
                  <Link
                    href={`/books/${x.slug}`}
                    onClick={(e) => onCover(e, i)}
                    tabIndex={-1}
                    aria-label={`${x.cover.title}, told by ${x.cover.name}`}
                    className={`block ${i === active ? "bob-slow" : ""}`}
                  >
                    <BookCover
                      book={x.cover}
                      sizes="250px"
                      className="cover-face shadow-[0_40px_60px_-28px_rgba(0,0,0,0.85)] [-webkit-box-reflect:below_6px_linear-gradient(transparent_72%,rgba(255,255,255,0.22))]"
                    />
                  </Link>
                  {/* shade for covers further back */}
                  <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[4px] bg-[#070a2c]" style={{ opacity: Math.min(a, 3) * 0.2 }} />
                </div>
              </li>
            );
          })}
        </ul>

        {/* the glass shelf the books stand on */}
        <div aria-hidden className="pointer-events-none absolute inset-x-[6%] bottom-[calc(18%-2px)] h-px bg-linear-to-r from-transparent via-white/45 to-transparent sm:bottom-[108px]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-[20%] bottom-[calc(18%-30px)] h-14 rounded-[50%] bg-[#6d82ff]/25 blur-2xl sm:bottom-[80px]" />
      </div>

      {/* the book in front */}
      <div className="relative z-[210] -mt-6 px-5 pb-8 text-center sm:-mt-16 sm:px-12 sm:pb-12">
        <div key={active} className="rv-pop">
          <Link href={`/books/${b.slug}`} className="display mx-auto block max-w-[22ch] text-[24px] leading-[1.05] text-balance hover:underline sm:text-[34px]">
            {b.cover.title}
          </Link>
          <p className="mt-2 text-[14px] text-white/70 sm:text-[15px]">
            told by <span className="font-semibold text-white">{b.cover.name}</span>
          </p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2.5 sm:gap-3">
          <button
            onClick={() => go(active - 1)}
            disabled={active === 0}
            aria-label="Previous book"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 transition hover:bg-white/20 active:scale-90 disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <Link
            href={`/books/${b.slug}/${b.first}`}
            onClick={() => setReadMode("comic")}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-[15px] font-bold text-ink shadow-[0_10px_30px_-10px_rgba(255,255,255,0.6)] transition hover:-translate-y-0.5 active:scale-95 sm:px-7"
          >
            Read the comic <ArrowRight />
          </Link>
          <Link
            href={`/books/${b.slug}/${b.first}`}
            onClick={() => setReadMode("story")}
            className="inline-flex h-12 items-center rounded-full bg-white/10 px-5 text-[15px] font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/20 active:scale-95 max-sm:hidden sm:px-6"
          >
            Storybook
          </Link>
          <button
            onClick={() => go(active + 1)}
            disabled={active === books.length - 1}
            aria-label="Next book"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 transition hover:bg-white/20 active:scale-90 disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        {/* one dot per book: Moon books pale blue, Mars books orange */}
        <ol aria-label="All books" className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
          {books.map((x, i) => (
            <li key={x.slug}>
              <button
                onClick={() => go(i)}
                aria-label={x.cover.title}
                aria-current={i === active ? "true" : undefined}
                className={`block h-2 rounded-full transition-all duration-300 ${i === active ? "w-6" : "w-2 opacity-45 hover:opacity-90"} ${x.world === "moon" ? "bg-[#c9d3ff]" : "bg-[#ff9b6b]"}`}
              />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
