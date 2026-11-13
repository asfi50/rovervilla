import type { MetadataRoute } from "next";
import { HEROES } from "@/lib/heroes";
import { BASE_URL } from "@/lib/seo";
import { SERIES } from "@/lib/videos";
import { BOOKS } from "@/lib/books";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: "", priority: 1.0 },
    { path: "/videos", priority: 0.9 },
    { path: "/books", priority: 0.9 },
    { path: "/heroes", priority: 0.9 },
    { path: "/where-they-rest", priority: 0.8 },
    { path: "/story", priority: 0.8 },
    { path: "/timeline", priority: 0.8 },
    { path: "/games", priority: 0.5 },
    { path: "/games/landing", priority: 0.5 },
    { path: "/gallery", priority: 0.6 },
    { path: "/tributes", priority: 0.6 },
    { path: "/about", priority: 0.5 },
  ];
  const heroRoutes = HEROES.flatMap((h) => [
    { path: `/heroes/${h.slug}`, priority: 0.8 },
    { path: `/heroes/${h.slug}/story`, priority: 0.6 },
  ]);

  const seriesRoutes = SERIES.map((s) => ({ path: `/series/${s.slug}`, priority: 0.9 }));
  const bookRoutes = BOOKS.flatMap((b) => [
    { path: `/books/${b.slug}`, priority: 0.8 },
    ...b.chapters.map((c) => ({ path: `/books/${b.slug}/${c.id}`, priority: 0.6 })),
  ]);

  return [...staticRoutes, ...seriesRoutes, ...bookRoutes, ...heroRoutes].map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route.priority,
  }));
}
