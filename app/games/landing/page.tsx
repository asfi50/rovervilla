import { HEROES, fmtLong, portrait } from "@/lib/heroes";
import { photo } from "@/lib/photos";
import { WIKI } from "@/lib/wiki";
import { generateSEO } from "@/lib/seo";
import Header from "@/app/components/header";
import TouchdownGame, { type GameSite } from "./game";
import { ECHO_DATES } from "./story";

export const metadata = generateSEO({
  title: "Touchdown: a landing game on Mars and the Moon | Rover Villa",
  description: "Fly the landing yourself, then drive to the real resting places of fifteen machines on Mars and the Moon and hear how each one went quiet.",
  path: "/games/landing",
});

/** Real size in metres for NASA models, whose files use their own units. */
const SIZE: Record<string, number> = { "apollo-11-lander": 9, "viking-1": 2.2, "viking-2": 2.2, spirit: 1.6, opportunity: 1.6, insight: 6, ingenuity: 1.2 };
const MODE: Record<string, GameSite["mode"]> = { "ranger-7": "crater", lcross: "crater", grail: "crater", "mars-polar-lander": "lost" };

/** Three entries from the hero's wiki timeline, chosen in story.ts; falls back to the first three. */
function echoes(slug: string) {
  const tl = WIKI[slug]?.timeline ?? [];
  const picked = (ECHO_DATES[slug] ?? []).map((d) => tl.find((e) => e.date === d)).filter((e): e is (typeof tl)[number] => !!e);
  return (picked.length === 3 ? picked : tl.slice(0, 3)).map((e) => ({ date: e.date, text: e.text }));
}

export default function LandingGamePage() {
  const sites: GameSite[] = HEROES.map((h) => {
    const p = photo(portrait(h), h.name);
    return {
      slug: h.slug,
      name: h.name,
      body: h.body,
      lat: h.coords.lat,
      lon: h.coords.lon,
      approx: h.coords.approx,
      restingPlace: h.restingPlace,
      arrived: h.landing ? `Landed ${fmtLong(h.landing.date)}` : `Launched ${fmtLong(h.launch.date)}`,
      endLabel: h.end.label,
      endDate: fmtLong(h.end.date),
      story: h.end.story,
      photo: { src: p.src, alt: p.alt, credit: p.credit, source: p.source, ai: p.ai },
      glb: h.model?.src,
      size: SIZE[h.slug] ?? 2,
      mode: MODE[h.slug] ?? "machine",
      echoes: echoes(h.slug),
    };
  });
  return (
    <>
      <Header />
      <main>
        <h1 className="sr-only">Touchdown: land on Mars and the Moon and find the machines we left there</h1>
        <TouchdownGame sites={sites} />
      </main>
    </>
  );
}
