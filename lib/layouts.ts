/**
 * Each hero's page is its own home: the sections are the same building blocks, but their order
 * follows the machine's life. An impactor leads with its fall, a lost lander with the search,
 * a record-setter with its numbers.
 */
export type SectionId = "model" | "film" | "signature" | "life" | "journey" | "lost" | "wiki" | "videos" | "news" | "eyes" | "gallery" | "twin" | "tributes" | "explore" | "documentary";

const TAIL: SectionId[] = ["videos", "news", "gallery", "twin", "tributes", "explore", "documentary"];

export const LAYOUTS: Record<string, SectionId[]> = {
  "ranger-7": ["model", "signature", "lost", "journey", "wiki", "life", ...TAIL],
  "surveyor-1": ["model", "signature", "journey", "life", "lost", "wiki", ...TAIL],
  "apollo-11-lander": ["model", "signature", "life", "lost", "journey", "wiki", ...TAIL],
  "apollo-15-rover": ["model", "signature", "life", "lost", "journey", "wiki", ...TAIL],
  "viking-1": ["model", "life", "signature", "journey", "lost", "wiki", "eyes", ...TAIL],
  "viking-2": ["model", "signature", "life", "journey", "lost", "wiki", "eyes", ...TAIL],
  "pathfinder-sojourner": ["model", "signature", "journey", "life", "lost", "wiki", "eyes", ...TAIL],
  "mars-polar-lander": ["model", "lost", "signature", "life", "journey", "wiki", "eyes", ...TAIL],
  spirit: ["model", "life", "signature", "journey", "lost", "wiki", "eyes", ...TAIL],
  opportunity: ["model", "film", "signature", "life", "journey", "lost", "wiki", "eyes", ...TAIL],
  phoenix: ["model", "signature", "journey", "life", "lost", "wiki", "eyes", ...TAIL],
  lcross: ["model", "signature", "eyes", "life", "lost", "journey", "wiki", ...TAIL],
  grail: ["model", "signature", "eyes", "life", "lost", "journey", "wiki", ...TAIL],
  insight: ["model", "signature", "life", "journey", "lost", "wiki", "eyes", ...TAIL],
  ingenuity: ["model", "signature", "life", "journey", "lost", "wiki", ...TAIL],
};

export const SECTION_LABEL: Record<SectionId, string> = {
  model: "3D model",
  film: "The film",
  signature: "Highlights",
  life: "Life's work",
  journey: "Launch and landing",
  lost: "Last signal",
  wiki: "Full story",
  videos: "Videos",
  news: "In the news",
  eyes: "Fly along",
  gallery: "Gallery",
  twin: "Twin",
  tributes: "Tributes",
  explore: "Explore further",
  documentary: "Documentary",
};
