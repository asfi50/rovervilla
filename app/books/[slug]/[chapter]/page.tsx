import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import { generateSEO } from "@/lib/seo";
import { BOOKS, chapterIndex, coverOf, getBook } from "@/lib/books";
import { photo } from "@/lib/photos";
import Reader, { type Panel } from "@/app/components/books/reader";

export const dynamicParams = false;

export function generateStaticParams() {
  return BOOKS.flatMap((b) => b.chapters.map((c) => ({ slug: b.slug, chapter: c.id })));
}

type Params = Promise<{ slug: string; chapter: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, chapter } = await params;
  const b = getBook(slug);
  const c = b?.chapters.find((x) => x.id === chapter);
  if (!b || !c) return {};
  return generateSEO({
    title: `${c.title} | ${b.title} | Rover Villa Books`,
    description: `${c.event}. ${c.discovery}`,
    path: `/books/${b.slug}/${c.id}`,
    ogImage: `/images/${b.art}.webp`,
  });
}

/** Ways to frame a reused archive photo, so the same picture never looks like the same panel twice. */
const CROPS = [
  { pos: "50% 45%", zoom: 1 },
  { pos: "30% 40%", zoom: 1.25 },
  { pos: "68% 55%", zoom: 1.15 },
  { pos: "50% 70%", zoom: 1.35 },
];

export default async function ChapterPage({ params }: { params: Params }) {
  const { slug, chapter } = await params;
  const b = getBook(slug);
  if (!b) notFound();
  const i = chapterIndex(b, chapter);
  if (i < 0) notFound();
  const c = b.chapters[i];

  // Even beats show an archive photo, odd beats show the machine itself, speaking.
  // Photos are dealt out in order through the book, so each chapter gets new ones where it can.
  const panels: Panel[] = c.beats.map((_, j) => {
    if (j % 2 === 1 || !b.photos.length) return { kind: "art", flip: (i + j) % 4 === 1 };
    const n = i * 2 + j / 2;
    const p = photo(b.photos[n % b.photos.length]);
    const crop = CROPS[Math.floor(n / b.photos.length) % CROPS.length];
    return { kind: "photo", src: p.src, alt: p.alt, title: p.title, credit: p.credit, source: p.source, ...crop };
  });

  const order = BOOKS.indexOf(b);
  const nextBook = BOOKS[(order + 1) % BOOKS.length];
  const pick = (k: number) => (b.chapters[k] ? { id: b.chapters[k].id, title: b.chapters[k].title, event: b.chapters[k].event } : null);

  return (
    <>
      <Header sticky={false} />
      <main className="bg-white">
        <Reader
          book={{ slug: b.slug, cover: coverOf(b), total: b.chapters.length }}
          chapter={c}
          index={i}
          panels={panels}
          prev={pick(i - 1)}
          next={pick(i + 1)}
          nextBook={{ slug: nextBook.slug, cover: coverOf(nextBook) }}
        />
      </main>
      <Footer />
    </>
  );
}
