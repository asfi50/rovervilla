import Image from "next/image";
import Link from "next/link";
import { GAMES, type Game } from "@/app/components/games/catalog";
import { ArrowRight } from "@/app/components/icons";
import RailDots from "@/app/components/rail-dots";

const WORLD = {
  mars: { label: "Mars", dot: "bg-mars" },
  moon: { label: "Moon", dot: "bg-brand" },
  both: { label: "Mars + Moon", dot: "bg-linear-to-r from-mars to-brand" },
} as const;

function World({ w, className = "" }: { w: Game["world"]; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.08em] uppercase ${className}`}>
      <span className={`h-2 w-2 rounded-full ${WORLD[w].dot}`} />
      {WORLD[w].label}
    </span>
  );
}

const playable = GAMES.filter((g) => g.href);
const soon = GAMES.filter((g) => !g.href);

/**
 * The arcade board: a lilac sheet of graph paper with Touchdown up front on its own little
 * planet, then every other game as a bright app tile that wiggles when you point at it.
 * `rail` makes the tiles a swipe row on phones (home); otherwise they form a 2-up grid.
 */
export function ArcadeBoard({ header, rail = true, withSoon = false }: { header?: React.ReactNode; rail?: boolean; withSoon?: boolean }) {
  const [first, ...rest] = playable;
  return (
    <div className="relative isolate overflow-hidden rounded-[28px] bg-[#f4f2ff] sm:rounded-[40px]" data-reveal>
      {/* graph-paper dots and a couple of soft colour clouds */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(#d6d9f7_1.3px,transparent_1.4px)] bg-size-[22px_22px] opacity-80" />
      <div aria-hidden className="absolute -top-24 -left-24 -z-10 h-80 w-80 rounded-full bg-[#ffb48a]/35 blur-3xl" />
      <div aria-hidden className="absolute -right-24 -bottom-32 -z-10 h-96 w-96 rounded-full bg-brand/15 blur-3xl" />
      {header}
      <ArcadeGrid first={first} rest={rest} rail={rail} bare={!header} />
      {withSoon && soon.length > 0 && (
        <div className="px-4 pb-6 sm:px-12 sm:pb-12">
          <p className="font-mono text-[11px] tracking-[0.14em] text-ink-soft uppercase">Coming soon</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {soon.map((g) => (
              <li key={g.title} className="flex items-center gap-4 rounded-[20px] border border-dashed border-ink/15 bg-white/60 p-3">
                <span className="relative block aspect-square w-14 shrink-0 opacity-75 grayscale-[35%]">{g.icon}</span>
                <span className="min-w-0">
                  <span className="block font-bold text-ink">{g.title}</span>
                  <span className="block text-[13px] leading-snug text-ink-soft">{g.text}</span>
                </span>
                <span className="ml-auto shrink-0 rounded-full bg-mist px-3 py-1 font-mono text-[10.5px] text-ink-soft uppercase ring-1 ring-line">Soon</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Home: the arcade, after the books. */
export function GamesSection() {
  return (
    <section id="play" aria-label="Rover Villa games" className="mx-auto max-w-[1440px] scroll-mt-20 px-4 py-6 sm:px-8 sm:py-10">
      <ArcadeBoard
        header={
          <div className="px-5 pt-7 sm:px-12 sm:pt-12">
            <div className="flex items-center justify-between gap-3">
              <span className="sticker bg-mars text-white">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                  <path d="M6 12h4M8 10v4M15 11h.01M18 13h.01" />
                  <rect x="2.5" y="6.5" width="19" height="11" rx="5.5" />
                </svg>
                Arcade
              </span>
              <Link
                href="/games"
                className="group inline-flex items-center gap-2 rounded-full text-sm font-semibold text-brand max-sm:bg-white max-sm:px-3.5 max-sm:py-1.5 max-sm:ring-1 max-sm:ring-line"
              >
                All games
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <h2 className="display mt-4 text-[34px] leading-[0.98] sm:text-6xl lg:text-[76px]">
              Play the{" "}
              <span className="relative inline-block text-brand">
                missions.
                <svg aria-hidden viewBox="0 0 300 24" preserveAspectRatio="none" className="absolute -bottom-[0.14em] left-0 h-[0.22em] w-full text-[#ffd166]">
                  <path d="M4 16c50-10 110-12 170-8s90 4 122-2" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </span>
            </h2>
          </div>
        }
      />
    </section>
  );
}

/** `rail` (home): short tiles, a swipe row on phones. Otherwise (/games): tiles with their one-line pitch. */
function ArcadeGrid({ first, rest, rail, bare }: { first: Game; rest: Game[]; rail: boolean; bare: boolean }) {
  const details = !rail;
  return (
    <div className={`grid gap-4 px-4 pb-6 sm:gap-5 sm:px-12 sm:pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)] ${bare ? "pt-4 sm:pt-12" : "pt-6 sm:pt-10"}`}>
      {/* Touchdown, on a little planet of its own */}
      <Link
        href={first.href!}
        className="group relative isolate flex min-h-[176px] flex-col overflow-hidden rounded-[24px] bg-night p-5 text-white shadow-[0_30px_60px_-30px_rgba(12,10,34,0.8)] transition-transform duration-500 hover:-translate-y-1 active:scale-[0.98] sm:min-h-[300px] sm:p-7 lg:min-h-0"
      >
        <div aria-hidden className="sky-stars absolute inset-0 -z-10" />
        <div
          aria-hidden
          className="planet absolute -right-[30%] -bottom-[62%] -z-10 aspect-square w-[95%] rounded-full bg-[url(/textures/mars-1024.jpg)] shadow-[inset_-30px_-20px_60px_rgba(0,0,0,0.6),0_0_80px_rgba(255,110,50,0.35)] sm:-bottom-[55%]"
        />
        <svg aria-hidden viewBox="0 0 100 100" className="absolute top-[14%] right-[14%] -z-10 h-[46%] w-[40%] text-white/30" fill="none">
          <path d="M10 6c30 4 60 22 72 70" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" strokeLinecap="round" />
        </svg>
        <div className="bob absolute right-[7%] bottom-[16%] w-[28%] max-w-[150px] sm:right-[12%] sm:bottom-[22%]">
          <Image
            src="/images/icon-touchdown.webp"
            alt=""
            width={256}
            height={256}
            className="aspect-square w-full rounded-[22%] shadow-[0_18px_40px_-10px_rgba(255,120,60,0.6)] ring-1 ring-white/20 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105"
          />
        </div>
        <h3 className="display text-[30px] sm:text-[44px]">{first.title}</h3>
        {details && (
          <>
            <p className="mt-2 max-w-[62%] text-[14.5px] leading-snug text-white/75 sm:max-w-[26ch] sm:text-[15px]">{first.text}</p>
            <World w={first.world} className="mt-3 text-white/70" />
          </>
        )}
        <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-brand px-5 py-3 text-[15px] font-bold shadow-[0_10px_30px_-8px_rgba(18,56,255,0.8)] transition group-hover:bg-brand-bright max-sm:mt-5 sm:mt-8">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
          </svg>
          Play now
        </span>
      </Link>

      {/* every other game: a swipe rail on phones, a grid from tablets up */}
      <div className="min-w-0">
        <ul
          className={
            rail
              ? "no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0"
              : "grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
          }
        >
          {rest.map((g) => (
            <li key={g.title} className={rail ? "w-[38vw] max-w-[180px] shrink-0 snap-start sm:w-auto sm:max-w-none" : ""}>
              <Link
                href={g.href!}
                style={{ "--glow": g.glow } as React.CSSProperties}
                className="group flex h-full flex-col rounded-[22px] bg-white p-3.5 ring-1 ring-line transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_40px_-20px_var(--glow)] hover:ring-transparent active:scale-[0.97] sm:p-4"
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="relative block aspect-square w-14 rounded-[22%] shadow-[0_12px_24px_-10px_var(--glow)] group-hover:animate-[wiggle_0.7s_cubic-bezier(0.3,1.4,0.5,1)] sm:w-[46%]">
                    {g.icon}
                  </span>
                  {!details && (
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
                      <svg viewBox="0 0 24 24" className="ml-0.5 h-3.5 w-3.5" fill="currentColor" aria-hidden>
                        <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
                      </svg>
                    </span>
                  )}
                </span>
                <span className="mt-3 block text-[15px] leading-tight font-bold text-ink sm:text-base">{g.title}</span>
                {details && (
                  <>
                    <span className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-ink-soft sm:text-[13px]">{g.text}</span>
                    <span className="mt-auto flex items-center justify-between pt-3">
                      <World w={g.world} className="text-ink-soft" />
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
                        <svg viewBox="0 0 24 24" className="ml-0.5 h-3.5 w-3.5" fill="currentColor" aria-hidden>
                          <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
                        </svg>
                      </span>
                    </span>
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
        {rail && <RailDots count={rest.length} className="sm:hidden" />}
      </div>
    </div>
  );
}
