"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Beat, BookChapter } from "@/lib/books";
import { markChapter, setReadMode, setTextSize, useReading, type ReadMode } from "@/lib/reading";
import BookCover, { type CoverData } from "@/app/components/books/cover";
import { ArrowLeft, ArrowRight } from "@/app/components/icons";
import Confetti from "@/app/components/confetti";

export type Panel =
  | { kind: "art"; flip: boolean }
  | { kind: "photo"; src: string; alt: string; title: string; credit: string; source: string; pos: string; zoom: number };

type Link2 = { id: string; title: string; event?: string } | null;

/* Text sizes, smallest to largest, for the four steps of the A− / A+ buttons. */
const BUBBLE = ["text-[14px]", "text-[15px] sm:text-[16px]", "text-[17px] sm:text-[18px]", "text-[19px] sm:text-[21px]"];
const CAPTION = ["text-[13.5px]", "text-[15px]", "text-[16.5px]", "text-[18.5px]"];
const STORY_LINE = ["text-[20px]", "text-[22px] sm:text-[25px]", "text-[25px] sm:text-[28px]", "text-[28px] sm:text-[32px]"];
const STORY_TEXT = ["text-[16px]", "text-[17px] sm:text-[18.5px]", "text-[19px] sm:text-[20.5px]", "text-[21px] sm:text-[23px]"];

/* Comic page layouts on a six-column grid, one per chapter in turn: [columns per panel]. */
const LAYOUTS = [
  [6, 3, 3, 6],
  [4, 2, 2, 4],
  [3, 3, 3, 3],
];
const SPAN: Record<number, string> = { 2: "lg:col-span-2", 3: "lg:col-span-3", 4: "lg:col-span-4", 6: "md:col-span-2 lg:col-span-6" };

const noop = () => () => {};
const useCanSpeak = () => useSyncExternalStore(noop, () => "speechSynthesis" in window, () => false);

/**
 * One chapter of a Rover Villa book. Comic mode lays the four beats out as a page of panels:
 * archive photos and the machine itself, speaking. Storybook mode sets the same beats as prose
 * that can be read aloud. The toolbar sticks under the site header; ← and → turn chapters.
 */
export default function Reader({
  book,
  chapter: c,
  index,
  panels,
  prev,
  next,
  nextBook,
}: {
  book: { slug: string; cover: CoverData; total: number };
  chapter: BookChapter;
  index: number;
  panels: Panel[];
  prev: Link2;
  next: Link2;
  nextBook: { slug: string; cover: CoverData };
}) {
  const router = useRouter();
  const { mode, size } = useReading();
  const canSpeak = useCanSpeak();
  const [speaking, setSpeaking] = useState<number | null>(null);
  const [party, setParty] = useState(0);
  const bar = useRef<HTMLSpanElement>(null);
  const barPhone = useRef<HTMLSpanElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const href = (id: string) => `/books/${book.slug}/${id}`;

  // Opening a chapter remembers it; reaching its end ticks it off.
  useEffect(() => {
    markChapter(book.slug, c.id);
    let cheered = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        markChapter(book.slug, c.id, true);
        // a little party, once per visit, for reaching the end
        if (!cheered) {
          cheered = true;
          setParty((n) => n + 1);
        }
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    if (end.current) io.observe(end.current);
    return () => io.disconnect();
  }, [book.slug, c.id]);

  // A hairline under the toolbar fills as you read down the chapter.
  useEffect(() => {
    const on = () => {
      const el = body.current;
      if (!el || !bar.current) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight * 0.6)));
      bar.current.style.transform = `scaleX(${p})`;
      if (barPhone.current) barPhone.current.style.transform = `scaleX(${p})`;
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [mode]);

  const stop = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(null);
  }, []);

  // Never keep talking over a different chapter or page.
  useEffect(() => stop, [c.id, stop]);

  // ← and → turn the page, unless you're typing somewhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement)?.closest("input,textarea,select,[contenteditable]")) return;
      if (e.key === "ArrowRight" && next) router.push(`/books/${book.slug}/${next.id}`);
      if (e.key === "ArrowLeft" && prev) router.push(`/books/${book.slug}/${prev.id}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, router, book.slug]);

  const listen = () => {
    if (speaking !== null) return stop();
    const synth = window.speechSynthesis;
    synth.cancel();
    const voice = synth.getVoices().find((v) => v.lang.startsWith("en") && v.localService) ?? synth.getVoices().find((v) => v.lang.startsWith("en"));
    const say = (text: string, beat: number, last = false) => {
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.rate = 0.95;
      u.onstart = () => {
        setSpeaking(beat);
        document.querySelector(`[data-beat="${beat}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      };
      if (last) u.onend = () => setSpeaking(null);
      synth.speak(u);
    };
    say(`Chapter ${index + 1}. ${c.title}.`, 0);
    c.beats.forEach((b, j) => say(`${b.line} ${b.detail}`, j, j === c.beats.length - 1));
  };

  const layout = LAYOUTS[index % LAYOUTS.length];

  return (
    <>
      <Confetti burst={party} />
      {/* Toolbar */}
      <div className="sticky top-0 z-40 border-b border-white/60 bg-white/65 shadow-[0_1px_0_rgba(13,11,38,0.06),0_8px_24px_-16px_rgba(13,11,38,0.25)] backdrop-blur-2xl backdrop-saturate-200">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-2 px-3 sm:gap-3 sm:px-8">
          <Link href={`/books/${book.slug}`} className="flex min-w-0 items-center gap-2.5 rounded-full py-1 pr-2 text-ink hover:text-brand" aria-label={`Back to ${book.cover.title}`}>
            <ArrowLeft className="h-5 w-5 shrink-0" />
            <BookCover book={book.cover} sizes="28px" className="hidden w-7 shrink-0 sm:block" />
            <span className="hidden min-w-0 truncate text-sm font-semibold md:block">{book.cover.title}</span>
          </Link>
          <span className="ml-auto" />
          <div role="radiogroup" aria-label="How to read" className="flex rounded-full bg-mist p-1 ring-1 ring-line">
            {(["comic", "story"] as ReadMode[]).map((m) => (
              <button
                key={m}
                role="radio"
                aria-checked={mode === m}
                onClick={() => {
                  stop();
                  setReadMode(m);
                }}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition sm:px-4 ${mode === m ? "bg-white text-ink shadow-sm ring-1 ring-line" : "text-ink-soft hover:text-ink"}`}
              >
                {m === "comic" ? "Comic" : "Storybook"}
              </button>
            ))}
          </div>
          <div className="flex items-center">
            <ToolButton label="Smaller text" disabled={size <= 0} onClick={() => setTextSize(size - 1)}>
              <span className="text-[13px] font-semibold">A</span>
              <span className="text-[10px]">−</span>
            </ToolButton>
            <ToolButton label="Larger text" disabled={size >= 3} onClick={() => setTextSize(size + 1)}>
              <span className="text-[17px] font-semibold">A</span>
              <span className="text-[10px]">+</span>
            </ToolButton>
            {canSpeak && (
              <ToolButton label={speaking !== null ? "Stop reading aloud" : "Read aloud"} pressed={speaking !== null} onClick={listen}>
                {speaking !== null ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                    <rect x="6" y="6" width="12" height="12" rx="2.5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor" />
                    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
                  </svg>
                )}
              </ToolButton>
            )}
          </div>
        </div>
        <span ref={bar} className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-brand" style={{ transform: "scaleX(0)" }} />
      </div>

      <div ref={body}>
        <header className={`mx-auto px-4 pt-10 sm:px-8 lg:pt-14 ${mode === "story" ? "max-w-[700px] px-5" : "max-w-[1200px]"}`}>
          <p className="font-mono text-[13px] tracking-[0.12em] text-brand uppercase">
            Chapter {index + 1} of {book.total}
          </p>
          <h1 className="display mt-3 max-w-[20ch] text-[38px] text-balance sm:text-6xl lg:text-[64px]">{c.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">{c.event}</p>
          <p className="mt-3 text-[13px] text-ink-soft">
            Told in {book.cover.name}&rsquo;s imagined voice · the events are real ·{" "}
            <a href={c.source} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline">
              source
            </a>
          </p>
        </header>

        {mode === "comic" ? (
          <div className="mx-auto max-w-[1200px] px-3 pt-8 sm:px-8 lg:pt-10">
            <div className="grid gap-3 rounded-[22px] bg-ink p-3 sm:gap-4 sm:p-4 md:grid-cols-2 lg:grid-cols-6">
              {c.beats.map((b, j) => (
                <ComicPanel
                  key={j}
                  n={j}
                  beat={b}
                  panel={panels[j]}
                  span={layout[j] ?? 3}
                  name={book.cover.name}
                  cover={book.cover}
                  size={size}
                  active={speaking === j}
                />
              ))}
            </div>
          </div>
        ) : (
          <article className="mx-auto max-w-[700px] px-5 pt-10 sm:px-8 lg:pt-12">
            {c.beats.map((b, j) => (
              <section
                key={j}
                data-beat={j}
                className={`-mx-4 rounded-2xl px-4 py-5 transition-colors duration-500 sm:-mx-6 sm:px-6 ${speaking === j ? "bg-brand-soft/70" : ""}`}
              >
                <p className={`display leading-[1.15] text-ink ${STORY_LINE[size]}`} style={{ letterSpacing: "-0.02em" }}>
                  {b.line}
                </p>
                <p className={`mt-4 leading-[1.7] text-ink/80 ${STORY_TEXT[size]}`}>{b.detail}</p>
                {j === 1 && panels.find((p) => p.kind === "photo") && <StoryFigure panel={panels.find((p) => p.kind === "photo")!} />}
              </section>
            ))}
          </article>
        )}

        {/* What it all means */}
        <div ref={end} className="mx-auto max-w-[1200px] px-4 pt-12 sm:px-8 lg:pt-16">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-brand p-6 text-white sm:p-8">
              <p className="font-mono text-[12px] tracking-[0.14em] text-white/70 uppercase">The big idea</p>
              <p className="mt-3 text-xl leading-snug font-semibold sm:text-2xl">{c.discovery}</p>
            </div>
            <div className="rounded-3xl bg-mist p-6 ring-1 ring-line sm:p-8">
              <p className="font-mono text-[12px] tracking-[0.14em] text-brand uppercase">Think about it</p>
              <p className="mt-3 text-xl leading-snug font-semibold text-ink sm:text-2xl">{c.question}</p>
            </div>
          </div>

          {c.facts.length > 0 && (
            <section className="mt-12">
              <h2 className="display text-[26px] sm:text-3xl">Fact file</h2>
              <dl className="mt-5 grid gap-x-8 gap-y-6 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-3">
                {c.facts.map((f) => (
                  <div key={f.label}>
                    <dt className="font-mono text-[11px] tracking-[0.14em] text-ink-soft uppercase">{f.label}</dt>
                    <dd className="mt-1.5 text-[17px] leading-snug font-semibold text-ink">{f.value}</dd>
                    {f.note && <dd className="mt-1 text-[13px] leading-snug text-ink-soft">{f.note}</dd>}
                    {f.source && (
                      <dd className="mt-1.5">
                        <a href={f.source} target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium text-brand hover:underline">
                          Source ↗
                        </a>
                      </dd>
                    )}
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section className="mt-12 border-t border-line pt-6 text-[13px] leading-relaxed text-ink-soft">
            {c.hardware && (
              <p>
                <span className="font-semibold text-ink">In this chapter: </span>
                {c.hardware}
              </p>
            )}
            <p className="mt-2">
              <span className="font-semibold text-ink">Sources: </span>
              {[{ label: "Main record", url: c.source }, ...c.related].map((s, k) => (
                <span key={s.url + k}>
                  {k > 0 && " · "}
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                    {s.label}
                  </a>
                </span>
              ))}
            </p>
            <p className="mt-2">Photos: NASA Image and Video Library, credited on each picture.</p>
          </section>
        </div>
      </div>

      {/* What's next: one big, readable card, then the smaller ways around */}
      <nav aria-label="Chapters" className="mx-auto max-w-[1200px] px-4 pt-12 pb-10 sm:px-8 lg:pb-28">
        {party > 0 && (
          <p role="status" className="rv-pop mb-4 flex justify-center">
            <span className="sticker bg-[#ffd166] text-ink">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                <path d="M12 2l2.6 6.3L21 9l-5 4.4L17.5 20 12 16.6 6.5 20 8 13.4 3 9l6.4-.7z" />
              </svg>
              Chapter {index + 1} done!
            </span>
          </p>
        )}
        {next ? (
          <Link
            href={href(next.id)}
            className="group grid items-center gap-5 rounded-[28px] bg-ink p-5 text-white transition hover:bg-night sm:grid-cols-[1fr_auto] sm:gap-8 sm:p-8"
          >
            <span className="min-w-0">
              <span className="block font-mono text-[11px] tracking-[0.16em] text-brand-glow uppercase">
                Up next · Chapter {index + 2} of {book.total}
              </span>
              <span className="display mt-2 block text-[26px] leading-[1.05] text-balance sm:text-4xl">{next.title}</span>
              {next.event && <span className="mt-2 line-clamp-2 block text-[15px] leading-snug text-white/60">{next.event}</span>}
            </span>
            <span className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-ink transition group-hover:bg-white/90">
              Next chapter
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ) : (
          <Link
            href={`/books/${nextBook.slug}`}
            className="group grid items-center gap-5 rounded-[28px] bg-ink p-5 text-white transition hover:bg-night sm:grid-cols-[auto_1fr_auto] sm:gap-8 sm:p-8"
          >
            <span className="flex items-center gap-4 sm:contents">
              <BookCover book={nextBook.cover} sizes="96px" className="w-[72px] shrink-0 sm:w-24" />
              <span className="min-w-0">
                <span className="block font-mono text-[11px] tracking-[0.16em] text-brand-glow uppercase">The end · next book</span>
                <span className="display mt-2 block text-[24px] leading-[1.05] text-balance sm:text-4xl">{nextBook.cover.title}</span>
                <span className="mt-1.5 block text-[14px] text-white/60">Told by {nextBook.cover.name}</span>
              </span>
            </span>
            <span className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-ink transition group-hover:bg-white/90">
              Start reading
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        )}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {prev ? (
            <Link href={href(prev.id)} className="group flex items-center gap-3 rounded-2xl bg-mist px-4 py-3.5 ring-1 ring-line transition hover:ring-brand/30">
              <ArrowLeft className="h-4 w-4 shrink-0 text-ink-soft transition-transform group-hover:-translate-x-0.5" />
              <span className="min-w-0">
                <span className="block font-mono text-[10px] tracking-[0.14em] text-ink-soft uppercase">Chapter {index}</span>
                <span className="block truncate text-[15px] font-semibold text-ink">{prev.title}</span>
              </span>
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}
          <Link
            href={`/books/${book.slug}`}
            className="group flex items-center gap-3 rounded-2xl bg-mist px-4 py-3.5 ring-1 ring-line transition hover:ring-brand/30 sm:justify-end sm:text-right"
          >
            <BookCover book={book.cover} sizes="32px" className="w-7 shrink-0 sm:order-2" />
            <span className="min-w-0">
              <span className="block font-mono text-[10px] tracking-[0.14em] text-ink-soft uppercase">All chapters</span>
              <span className="block truncate text-[15px] font-semibold text-ink">{book.cover.title}</span>
            </span>
          </Link>
        </div>
      </nav>

      {/* Phones: a floating bar to turn chapters with your thumb, with how far you've read */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(10px,env(safe-area-inset-bottom))] lg:hidden">
        <div className="glass pointer-events-auto mx-auto flex max-w-md items-center gap-2 rounded-[30px] p-1.5">
          {prev ? (
            <Link href={href(prev.id)} aria-label={`Previous chapter: ${prev.title}`} className="glass-lens grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink transition active:scale-90">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          ) : (
            <Link href={`/books/${book.slug}`} aria-label="All chapters" className="glass-lens grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink transition active:scale-90">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M5 7h14M5 12h14M5 17h9" />
              </svg>
            </Link>
          )}
          <div className="min-w-0 flex-1 px-1">
            <p className="truncate text-[12px] font-semibold text-ink">
              Chapter {index + 1} <span className="font-normal text-ink-soft">of {book.total}</span>
            </p>
            <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-ink/10">
              <span ref={barPhone} className="block h-full origin-left rounded-full bg-brand" style={{ transform: "scaleX(0)" }} />
            </span>
          </div>
          <Link
            href={next ? href(next.id) : `/books/${nextBook.slug}`}
            className="glass-tint inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full pr-4 pl-5 text-[14px] font-semibold text-white transition active:scale-95"
          >
            {next ? "Next" : "Next book"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}

function ToolButton({ label, onClick, disabled, pressed, children }: { label: string; onClick: () => void; disabled?: boolean; pressed?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={`grid h-10 w-10 place-items-center rounded-full transition disabled:opacity-30 ${pressed ? "bg-brand text-white" : "text-ink hover:bg-mist"}`}
    >
      <span className="flex items-baseline">{children}</span>
    </button>
  );
}

/**
 * One comic panel: the picture with the machine's words on it, and the narration underneath.
 * Wide panels put the narration beside the picture on large screens.
 */
function ComicPanel({
  n,
  beat,
  panel,
  span,
  name,
  cover,
  size,
  active,
}: {
  n: number;
  beat: Beat;
  panel: Panel;
  span: number;
  name: string;
  cover: CoverData;
  size: number;
  active: boolean;
}) {
  const wide = span === 6;
  const tall = span === 2;
  return (
    <figure
      data-beat={n}
      className={`relative flex flex-col overflow-hidden rounded-[14px] bg-[#fffdf8] transition-shadow duration-500 ${SPAN[span]} ${wide ? "lg:grid lg:grid-cols-[1.7fr_1fr]" : ""} ${
        active ? "ring-4 ring-brand-bright" : ""
      }`}
    >
      <div className={`relative overflow-hidden ${wide ? "aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto lg:min-h-[360px]" : tall ? "aspect-[4/3] lg:aspect-[3/4]" : "aspect-[4/3]"}`}>
        {panel.kind === "art" ? <ArtScene cover={cover} flip={panel.flip} beat={beat} size={size} /> : <PhotoScene panel={panel} beat={beat} name={name} size={size} />}
      </div>
      <figcaption className={`flex flex-1 items-start gap-3 p-4 sm:p-5 ${wide ? "lg:items-center lg:p-8" : ""}`}>
        <span className="display mt-0.5 shrink-0 text-[13px] text-brand tabular-nums">{String(n + 1).padStart(2, "0")}</span>
        <span className={`leading-relaxed text-ink/85 ${CAPTION[size]}`}>{beat.detail}</span>
      </figcaption>
    </figure>
  );
}

/** The machine on its own colour, halftone ground beneath it, saying its line in a bubble. */
function ArtScene({ cover, flip, beat, size }: { cover: CoverData; flip: boolean; beat: Beat; size: number }) {
  const { bg, ink, accent } = cover.cover;
  return (
    <div className="@container absolute inset-0" style={{ background: bg }}>
      <div className="absolute inset-0 bg-[radial-gradient(90%_80%_at_50%_100%,rgba(255,255,255,0.25),transparent_70%)]" />
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 opacity-25"
        style={{
          backgroundImage: `radial-gradient(${accent} 22%, transparent 24%)`,
          backgroundSize: "9px 9px",
          maskImage: "linear-gradient(to top, #000, transparent)",
          WebkitMaskImage: "linear-gradient(to top, #000, transparent)",
        }}
      />
      {/* speed lines from the machine, for a bit of energy */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-[0.12]" aria-hidden>
        {Array.from({ length: 14 }, (_, k) => {
          const a = (k / 14) * Math.PI * 2;
          const cx = flip ? 30 : 70;
          return <line key={k} x1={cx + Math.cos(a) * 18} y1={70 + Math.sin(a) * 18} x2={cx + Math.cos(a) * 140} y2={70 + Math.sin(a) * 140} stroke={ink} strokeWidth="0.6" />;
        })}
      </svg>
      <Image
        src={`/images/${cover.art}.webp`}
        alt=""
        width={1340}
        height={1100}
        sizes="(min-width:1024px) 520px, 90vw"
        className={`absolute bottom-[-4%] w-[62%] max-w-none drop-shadow-[0_16px_18px_rgba(0,0,0,0.35)] ${flip ? "left-[-4%] -scale-x-100" : "right-[-4%]"}`}
      />
      <Bubble side={flip ? "right" : "left"} size={size}>
        {beat.line}
      </Bubble>
      {beat.sfx && <Sfx text={beat.sfx} color={accent} ink={ink} style={flip ? { left: "6%", bottom: "8%" } : { right: "6%", bottom: "8%" }} />}
    </div>
  );
}

/** An archive photo, framed a little differently each time, with the machine's line as a caption box. */
function PhotoScene({ panel, beat, name, size }: { panel: Extract<Panel, { kind: "photo" }>; beat: Beat; name: string; size: number }) {
  return (
    <div className="absolute inset-0 bg-ink">
      <Image
        src={panel.src}
        alt={panel.alt}
        fill
        sizes="(min-width:1024px) 720px, 95vw"
        className="object-cover contrast-[1.05] saturate-[0.9]"
        style={{ objectPosition: panel.pos, transform: `scale(${panel.zoom})`, transformOrigin: panel.pos }}
      />
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-multiply"
        style={{ backgroundImage: "radial-gradient(#000 30%, transparent 32%)", backgroundSize: "5px 5px" }}
        aria-hidden
      />
      <div className="absolute inset-x-0 top-0 h-2/3 bg-linear-to-b from-black/35 to-transparent" aria-hidden />
      <div className="absolute top-3 left-3 max-w-[78%] sm:top-4 sm:left-4">
        <div className={`rounded-[10px] border-[2.5px] border-ink bg-white px-3.5 py-2.5 leading-snug font-semibold text-ink shadow-[4px_4px_0_rgba(13,11,38,0.85)] ${BUBBLE[size]}`}>
          <span className="mb-0.5 block font-mono text-[10px] font-medium tracking-[0.14em] text-brand uppercase">{name}</span>
          {beat.line}
        </div>
      </div>
      {beat.sfx && <Sfx text={beat.sfx} color="#ffffff" ink="#0d0b26" style={{ right: "5%", bottom: "14%" }} />}
      <a
        href={panel.source}
        target="_blank"
        rel="noopener noreferrer"
        title={panel.title}
        className="absolute right-2 bottom-2 max-w-[70%] truncate rounded-full bg-black/55 px-2.5 py-1 text-[10px] text-white/90 backdrop-blur-sm hover:bg-black/75"
      >
        {panel.credit}
      </a>
    </div>
  );
}

/** A speech bubble with a tail pointing down toward the machine. */
function Bubble({ side, size, children }: { side: "left" | "right"; size: number; children: ReactNode }) {
  return (
    <div className={`absolute top-[6%] max-w-[64%] ${side === "left" ? "left-[5%]" : "right-[5%]"}`}>
      <div className={`relative rounded-[22px] border-[2.5px] border-ink bg-white px-4 py-3 leading-snug font-semibold text-ink shadow-[4px_4px_0_rgba(13,11,38,0.85)] ${BUBBLE[size]}`}>
        {children}
        <svg
          viewBox="0 0 40 30"
          className={`absolute -bottom-[25px] h-[28px] w-[38px] ${side === "left" ? "right-[18%]" : "left-[18%] -scale-x-100"}`}
          aria-hidden
        >
          <path d="M2 0 L36 28 L20 0" fill="#fff" stroke="#0d0b26" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M3 -1 L21 -1" stroke="#fff" strokeWidth="4" />
        </svg>
      </div>
    </div>
  );
}

/** A sound effect, set big and tilted, like it was lettered onto the panel. */
function Sfx({ text, color, ink, style }: { text: string; color: string; ink: string; style: CSSProperties }) {
  return (
    <span
      aria-hidden
      className="display absolute -rotate-6 text-[clamp(18px,7cqw,40px)] italic"
      style={{ ...style, color, WebkitTextStroke: `1.5px ${ink}`, paintOrder: "stroke fill", textShadow: `3px 3px 0 ${ink}` }}
    >
      {text}
    </span>
  );
}

function StoryFigure({ panel }: { panel: Extract<Panel, { kind: "photo" }> }) {
  return (
    <figure className="my-8">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-mist">
        <Image src={panel.src} alt={panel.alt} fill sizes="(min-width:768px) 700px, 100vw" className="object-cover" style={{ objectPosition: panel.pos }} />
      </div>
      <figcaption className="mt-2.5 text-[13px] text-ink-soft">
        {panel.title} ·{" "}
        <a href={panel.source} target="_blank" rel="noopener noreferrer" className="hover:text-brand hover:underline">
          {panel.credit}
        </a>
      </figcaption>
    </figure>
  );
}
