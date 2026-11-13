import Image from "next/image";
import Link from "next/link";
import WorldSwitch from "@/app/components/home/world-switch";
import { HEROES, bodyName, fmtDate, getHero, lifespan, type Body, type Hero } from "@/lib/heroes";
import { photoMeta } from "@/lib/photos";
import { PARTS } from "@/lib/parts";
import ModelSwitch, { type ModelPick } from "@/app/components/home/model-switch";
import { ArrowRight } from "@/app/components/icons";
import RailDots from "@/app/components/rail-dots";

/*
 * Home page sections below the hero. Facts come from the archive in lib/heroes.ts; the few
 * short captions written here each restate one line of a hero's record (noted beside it).
 */

const hero = (slug: string): Hero => {
  const h = getHero(slug);
  if (!h) throw new Error(`home: unknown hero ${slug}`);
  return h;
};

const pic = (name: string) => {
  const p = photoMeta(name);
  if (!p) throw new Error(`home: ${name} is not an archive photo`);
  return p;
};

/** Transparent studio cut-out of a machine, or its portrait when there is none. */
const cutout = (h: Hero) => (h.card ? `/images/${h.card}.webp` : pic(h.photo!).src);

/** Names short enough to sit under a small circle. */
const SHORT: Record<string, string> = {
  "pathfinder-sojourner": "Pathfinder",
  "mars-polar-lander": "Polar Lander",
  "apollo-11-lander": "Apollo 11",
  "apollo-15-rover": "Moon rover",
};
const short = (h: Hero) => SHORT[h.slug] ?? h.name;

const Eyebrow = ({ children, className = "text-brand" }: { children: React.ReactNode; className?: string }) => (
  <p className={`font-mono text-sm tracking-[0.12em] uppercase ${className}`}>{children}</p>
);

/* ── The famous ones ────────────────────────────────────────────────────────── */

/** Well-known machines from both worlds, oldest first. Twins share one picture. `h` sets
 *  each picture's height relative to the others: small at the ends, biggest in the middle.
 *  `r` is its cut-out's width / height. On desktop each machine's share of the row is h × r,
 *  so the row always fills the width exactly and the heights keep these proportions. Phones
 *  show three in one row and tablets all five in a compact grid (`place`), the twins big in
 *  the middle. */
const FAMOUS: { slugs: string[]; h: number; r: number; place: string }[] = [
  { slugs: ["apollo-11-lander"], h: 170, r: 1.08, place: "px-[4%] sm:col-start-1 sm:row-start-1 sm:px-[8%]" },
  { slugs: ["apollo-15-rover"], h: 200, r: 1.52, place: "max-sm:hidden sm:col-start-1 sm:row-start-2" },
  { slugs: ["spirit", "opportunity"], h: 290, r: 1.14, place: "sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:justify-center lg:justify-end" },
  { slugs: ["insight"], h: 210, r: 1.59, place: "max-sm:hidden sm:col-start-3 sm:row-start-1" },
  { slugs: ["ingenuity"], h: 130, r: 1.34, place: "px-[10%] sm:col-start-3 sm:row-start-2" },
];

export function Famous() {
  return (
    <section id="famous" className="relative mx-auto max-w-[1440px] scroll-mt-20 px-4 pt-6 sm:px-8">
      {/* Wide screens: the heading floats over the row, in the sky above the smaller machines. */}
      <div className="flex flex-wrap items-end justify-between gap-3 xl:pointer-events-none xl:absolute xl:inset-x-8 xl:top-6 xl:z-10 xl:items-start">
        <div>
          <Eyebrow className="text-xs text-brand max-sm:hidden">The famous ones</Eyebrow>
          <h2 className="display text-[22px] [text-shadow:0_0_14px_#fff,0_0_4px_#fff] sm:mt-2 sm:text-3xl">
            Different worlds. <br className="max-sm:hidden" />
            Same curiosity.
          </h2>
        </div>
        <Link href="/heroes" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline max-sm:hidden xl:pointer-events-auto">
          All {HEROES.length} machines <ArrowRight />
        </Link>
      </div>

      <ul className="mt-3 grid grid-cols-[1fr_1.7fr_1fr] gap-x-2 sm:mt-4 sm:gap-x-3 sm:gap-y-4 lg:flex lg:gap-6 xl:mt-0 xl:pt-4">
        {FAMOUS.map(({ slugs, h: height, r, place }) => {
          const hs = slugs.map(hero);
          const last = hs[hs.length - 1];
          const years = hs.length > 1 ? `${lifespan(hs[0]).slice(0, 4)}–${lifespan(last).slice(-4)}` : lifespan(last);
          return (
            <li
              key={slugs.join("+")}
              className={`flex min-w-0 flex-col justify-end text-center lg:row-auto lg:px-0 lg:[flex:var(--g)_1_0%] ${place}`}
              style={{ "--g": Math.round(height * r) } as React.CSSProperties}
              data-reveal
            >
              <Link href={`/heroes/${last.slug}`} className="group block" aria-label={hs.map((h) => h.name).join(" and ")}>
                <span className="relative block w-full" style={{ aspectRatio: r }}>
                  <Image
                    src={cutout(last)}
                    alt=""
                    fill
                    sizes="(min-width:1024px) 30vw, 45vw"
                    className="object-contain object-bottom drop-shadow-[0_16px_16px_rgba(45,20,90,0.14)] transition-transform duration-500 group-hover:-translate-y-1.5 group-hover:scale-[1.04]"
                  />
                </span>
              </Link>
              <p className="display mt-1.5 text-[13px] leading-tight sm:text-base lg:mt-2 lg:text-sm lg:whitespace-nowrap xl:text-lg">
                {hs.map((h, i) => (
                  <span key={h.slug}>
                    {i > 0 && " & "}
                    <Link href={`/heroes/${h.slug}`} className="hover:text-brand">
                      {h.name}
                    </Link>
                  </span>
                ))}
              </p>
              <p className="font-mono text-[10px] text-ink-soft sm:text-xs">{years}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ── Mars and Moon ──────────────────────────────────────────────────────────── */

const WORLD: Record<Body, { title: string; lede: string; panel: string; accent: string; texture: string }> = {
  mars: {
    title: "The Martian family",
    lede: "Landers, rovers and a helicopter, from Viking 1 in 1976 to Ingenuity in 2024.",
    panel: "bg-[#fff1e8]",
    accent: "text-mars",
    texture: "bg-[url(/textures/mars-1024.jpg)]",
  },
  moon: {
    title: "The Lunar family",
    lede: "Probes that struck it on purpose, landers, and the first car driven on another world.",
    panel: "bg-[#eef2f7]",
    accent: "text-brand",
    texture: "bg-[url(/textures/moon-1024.jpg)]",
  },
};

function Orbit({ body }: { body: Body }) {
  const w = WORLD[body];
  const list = HEROES.filter((h) => h.body === body);
  return (
    <div className={`grid items-center gap-2 rounded-3xl px-4 pt-5 pb-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] sm:gap-8 sm:p-8 ${w.panel}`} data-reveal>
      {/* Phones: just the name and the link, so the orbit gets the room. */}
      <div className="max-sm:flex max-sm:items-baseline max-sm:justify-between max-sm:gap-3">
        <Eyebrow className={`max-sm:hidden ${w.accent}`}>
          <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-current align-middle" />
          {bodyName(body)}
        </Eyebrow>
        <h3 className="display text-2xl sm:mt-3 sm:text-5xl">{w.title}</h3>
        <p className="mt-3 max-w-sm text-ink-soft max-sm:hidden">{w.lede}</p>
        <Link href={`/heroes#h-${body}`} className={`inline-flex shrink-0 items-center gap-2 text-sm font-semibold hover:underline sm:mt-4 sm:text-base ${w.accent}`}>
          <span className="max-sm:hidden">All {bodyName(body)} machines</span>
          <span className="sm:hidden">See all</span> <ArrowRight />
        </Link>
      </div>

      <div className="relative mx-auto mb-4 aspect-square w-full max-w-[400px]">
        <div aria-hidden className="absolute inset-[11%] rounded-full border-2 border-dashed border-ink/10" />
        <div
          aria-hidden
          className={`planet absolute inset-[31%] rounded-full shadow-[inset_-18px_-10px_34px_rgba(0,0,0,0.5),0_20px_40px_-12px_rgba(0,0,0,0.3)] ${w.texture}`}
        />
        <ul>
          {list.map((h, i) => {
            const a = (i / list.length) * Math.PI * 2 - Math.PI / 2;
            return (
              <li
                key={h.slug}
                className="absolute w-[19%] -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(50 + 39 * Math.cos(a)).toFixed(2)}%`, top: `${(50 + 39 * Math.sin(a)).toFixed(2)}%` }}
              >
                <Link href={`/heroes/${h.slug}`} className="group block text-center" title={h.name} aria-label={h.name}>
                  <span className="relative block aspect-square overflow-hidden rounded-full bg-white shadow-[0_8px_20px_-8px_rgba(45,20,90,0.35)] ring-2 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:ring-brand">
                    <Image src={cutout(h)} alt="" fill sizes="80px" className="object-contain p-1.5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        {/* Names in a layer of their own, so no circle covers its neighbour's label. */}
        <ul aria-hidden className="pointer-events-none">
          {list.map((h, i) => {
            const a = (i / list.length) * Math.PI * 2 - Math.PI / 2;
            return (
              <li
                key={h.slug}
                className="absolute -translate-x-1/2 rounded-sm bg-white/70 px-1 font-mono text-[10px] whitespace-nowrap text-ink sm:text-[11px]"
                style={{ left: `${(50 + 39 * Math.cos(a)).toFixed(2)}%`, top: `calc(${(50 + 39 * Math.sin(a)).toFixed(2)}% + 9.5% + 4px)` }}
              >
                {short(h)}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function Worlds() {
  return (
    <section className="mx-auto grid max-w-[1440px] gap-3 px-4 py-8 sm:gap-4 sm:px-8 sm:py-14 lg:py-20 xl:grid-cols-2">
      <WorldSwitch mars={<Orbit body="mars" />} moon={<Orbit body="moon" />} />
    </section>
  );
}

/* ── Last signals ───────────────────────────────────────────────────────────── */

/** Scenes of machines where they stopped: one big picture and four smaller ones. */
const SCENES: { slug: string; image: string; pos?: string }[] = [
  { slug: "opportunity", image: "hero-opportunity", pos: "50% 70%" },
  { slug: "ingenuity", image: "ingenuity", pos: "50% 40%" },
  { slug: "phoenix", image: "phoenix" },
  { slug: "apollo-15-rover", image: "lrv" },
  { slug: "grail", image: "grail" },
];

export function LastSignals() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2" data-reveal>
        <h2 className="display max-w-[22ch] text-3xl sm:text-5xl">
          They had names, birthdays and last words, <span className="text-brand">just like us.</span>
        </h2>
        <Link href="/timeline" className="group inline-flex items-center gap-2 text-sm font-semibold text-brand sm:text-base">
          How each one went quiet <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      {/* Phones: a swipe row of tall cards. From tablets up: one big scene and four small ones.
          The row fades in as a whole: per-card reveals would leave off-screen cards blank mid-swipe. */}
      <ul
        data-reveal
        className="no-scrollbar -mx-4 mt-5 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 pb-4 sm:mx-0 sm:mt-8 sm:grid sm:grid-cols-4 sm:grid-rows-2 sm:gap-4 sm:overflow-visible sm:p-0 lg:mt-12 lg:gap-5"
      >
        {SCENES.map((x, i) => {
          const h = hero(x.slug);
          const big = i === 0;
          return (
            <li
              key={x.slug}
              className={`w-[72vw] max-w-[300px] shrink-0 snap-start sm:w-auto sm:max-w-none ${big ? "sm:col-span-2 sm:row-span-2" : ""}`}
            >
              <Link
                href={`/heroes/${h.slug}`}
                className="group relative isolate block aspect-[4/5] h-full overflow-hidden rounded-[24px] bg-night shadow-[0_24px_50px_-28px_rgba(13,11,38,0.6)] sm:aspect-[4/3] sm:rounded-[28px]"
              >
                <Image
                  src={`/images/${x.image}.jpg`}
                  alt={h.name}
                  fill
                  sizes={big ? "(min-width:640px) 50vw, 72vw" : "(min-width:640px) 25vw, 72vw"}
                  className="-z-10 object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
                  style={{ objectPosition: x.pos ?? "50% 50%" }}
                />
                <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/75 via-black/15 to-transparent" />
                <div className={`absolute inset-x-0 bottom-0 text-white ${big ? "p-5 sm:p-8" : "p-5"}`}>
                  <p className={`display ${big ? "text-[28px] sm:text-5xl" : "text-[28px] sm:text-2xl"}`}>{h.name}</p>
                  <p className="mt-1.5 text-[13px] text-white/75 sm:text-sm">
                    {h.end.label} · {fmtDate(h.end.date)}
                  </p>
                </div>
                <span className="absolute top-4 right-4 grid h-10 w-10 scale-75 place-items-center rounded-full bg-white/90 text-ink opacity-0 transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <RailDots count={SCENES.length} className="-mt-1 sm:hidden" />
    </section>
  );
}

/* ── NASA's 3D models ───────────────────────────────────────────────────────── */

/** The three NASA models with full textures, so they look like the real machines. */
const MODELS = [
  { slug: "apollo-11-lander", label: "Apollo 11" },
  { slug: "insight", label: "InSight" },
  { slug: "ingenuity", label: "Ingenuity" },
];

export function RoverModel() {
  const picks: ModelPick[] = MODELS.map(({ slug, label }) => {
    const h = hero(slug);
    const m = h.model!;
    const p = pic(h.photo!);
    return {
      slug,
      label,
      name: h.name,
      cutout: cutout(h),
      stats: h.stats.map((s) => ({ value: s.value, label: s.label })),
      model: { kind: "glb", src: m.src, title: m.title, credit: "NASA 3D Resources", source: m.source, note: m.note },
      parts: PARTS[slug] ?? [],
      poster: p.src,
      posterAlt: p.alt,
    };
  });
  return (
    <section className="bg-[#f3f0ff]">
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8 lg:py-20">
        <ModelSwitch picks={picks} />
      </div>
    </section>
  );
}
