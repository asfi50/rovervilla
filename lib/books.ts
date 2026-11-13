/**
 * Rover Villa Books: one illustrated book per hero, told in the machine's imagined voice.
 *
 * The text in books.json comes word for word from the Rover Villa team's book drafts. The
 * machines' first-person lines are imagined retellings, not quotations; the events are real
 * and every chapter links the mission records it is based on.
 *
 * Server-side only: the text is large, so pages pass a single chapter down to the reader.
 */
import data from "./books.json";
import { HEROES, getHero, type Hero } from "./heroes";
import type { CoverData } from "@/app/components/books/cover";

export type Beat = { line: string; detail: string; sfx?: string };
export type Fact = { label: string; value: string; note?: string; source?: string };
export type BookChapter = {
  id: string;
  title: string;
  event: string;
  hardware: string;
  source: string;
  related: { label: string; url: string }[];
  facts: Fact[];
  beats: Beat[];
  discovery: string;
  question: string;
};
/** `name` is what the machine calls itself in its book (Eagle, not "Apollo 11 lander"). */
type RawBook = { slug: string; name: string; title: string; intro: string; chapters: BookChapter[] };

/** Cover colours: one per book, so a shelf reads like a printed series. `ink` is the title colour. */
const COVERS: Record<string, { bg: string; ink: string; accent: string }> = {
  "ranger-7": { bg: "#18204a", ink: "#ffffff", accent: "#9fb0ff" },
  "surveyor-1": { bg: "#c9ccd6", ink: "#0d0b26", accent: "#1238ff" },
  "apollo-11-lander": { bg: "#d8a630", ink: "#0d0b26", accent: "#ffffff" },
  "apollo-15-rover": { bg: "#2f5d50", ink: "#ffffff", accent: "#f2d38a" },
  "viking-1": { bg: "#b4472b", ink: "#ffffff", accent: "#ffd6b8" },
  "viking-2": { bg: "#e9d8c4", ink: "#3a160c", accent: "#b4472b" },
  "pathfinder-sojourner": { bg: "#ef8a3c", ink: "#1b0d05", accent: "#ffffff" },
  "mars-polar-lander": { bg: "#dce6f2", ink: "#0d1b3a", accent: "#1238ff" },
  spirit: { bg: "#7a2e1c", ink: "#ffffff", accent: "#ffb48a" },
  opportunity: { bg: "#1238ff", ink: "#ffffff", accent: "#ffd28a" },
  phoenix: { bg: "#f3efe6", ink: "#0d0b26", accent: "#e0602a" },
  lcross: { bg: "#101320", ink: "#ffffff", accent: "#7fe0ff" },
  grail: { bg: "#4a3f7a", ink: "#ffffff", accent: "#cfc6ff" },
  insight: { bg: "#c4633a", ink: "#ffffff", accent: "#1b0d05" },
  ingenuity: { bg: "#e3d2b8", ink: "#20130a", accent: "#1238ff" },
};

export type Book = RawBook & {
  hero: Hero;
  cover: { bg: string; ink: string; accent: string };
  /** The machine's studio cut-out (AI-made), used on covers and in comic panels. */
  art: string;
  /** Real archive photos for comic panels and the storybook. */
  photos: string[];
};

const RAW = data as RawBook[];

export const BOOKS: Book[] = RAW.map((b) => {
  const hero = getHero(b.slug);
  if (!hero) throw new Error(`No hero for book ${b.slug}`);
  return {
    ...b,
    hero,
    cover: COVERS[b.slug] ?? { bg: "#1238ff", ink: "#ffffff", accent: "#ffffff" },
    art: hero.card ?? hero.image,
    photos: hero.gallery.filter((g) => g.startsWith("nasa/")),
  };
}).sort((a, b) => HEROES.indexOf(a.hero) - HEROES.indexOf(b.hero));

export const getBook = (slug: string) => BOOKS.find((b) => b.slug === slug);

/** The bits of a book its cover needs: small enough to hand to client components. */
export const coverOf = (b: Book): CoverData => ({ title: b.title, name: b.name, art: b.art, chapters: b.chapters.length, cover: b.cover });

export const chapterIndex = (book: Book, id: string) => book.chapters.findIndex((c) => c.id === id);

/** Every source a book cites, deduplicated, for the book page's reference list. */
export function bookSources(book: Book) {
  const seen = new Map<string, string>();
  for (const c of book.chapters) {
    if (c.source && !seen.has(c.source)) seen.set(c.source, c.title);
    for (const r of c.related) if (!seen.has(r.url)) seen.set(r.url, r.label);
  }
  return [...seen].map(([url, label]) => ({ url, label }));
}

/** A link's readable host, e.g. "science.nasa.gov". */
export const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** Words in a chapter, for a "6 min read" style estimate. */
export const readMinutes = (c: BookChapter) =>
  Math.max(1, Math.round(c.beats.reduce((n, b) => n + `${b.line} ${b.detail}`.split(/\s+/).length, 0) / 120));
