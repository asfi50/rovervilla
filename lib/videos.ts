/*
 * The video catalogue: every series, documentary and one-off video on /videos.
 * Add a series here and it shows up on /videos, gets its own /series/<slug> page and joins
 * the sitemap. Titles, summaries and resident lines are the show's own copy, word for word
 * from the Season 1 site (rovervilla.pages.dev); facts in them are the show's, not new ones.
 *
 * Episode files are streamed from the show's media hosts; artwork is served from
 * public/videos/<slug>/.
 */

export type Video = {
  /** Stable id, used in ?watch= links and saved progress. */
  id: string;
  title: string;
  summary?: string;
  /** "Trailer", "Episode 3"… shown above the title in the player and on series pages. */
  label: string;
  src: string;
  poster: string;
  /** Seconds. */
  duration: number;
  shape: "portrait" | "landscape";
};

export type Resident = { name: string; badge: string; text: string; image: string; alt: string };

export type Series = {
  slug: string;
  title: string;
  /** Shown beside the title art, e.g. "Jr". */
  badge?: string;
  audience: string;
  format: string;
  tagline: string;
  synopsis: string;
  /** One extra line of world-building, shown in Details. */
  lore?: string;
  art: { wide: string; tall: string; loopWide: string; loopTall: string; og: string };
  trailer: Video;
  trailerNote?: string;
  seasons: { name: string; episodes: Video[] }[];
  residents: Resident[];
  createdBy: string;
  credits: string[];
};

const JR = "/videos/rovervilla-jr";
const host = (n: number, file: string) => `https://rovervilla-media-${n}.pages.dev/${file}.mp4`;

const jrEpisodes: Omit<Video, "label" | "shape" | "poster">[] = [
  {
    id: "oppys-tour",
    title: "Oppy’s tour of Rovervilla",
    summary: "Selfie stick out, nobody ready. Sojourner naps, Spirit photobombs, and Ingenuity reveals it all went out live.",
    src: host(4, "vlog-tour-v4"),
    duration: 86.2,
  },
  {
    id: "why-mars",
    title: "Why did you go to Mars?",
    summary: "Grandpa Sojourner remembers bouncing down on 4 July 1997.",
    src: host(4, "sojourner-story-v2"),
    duration: 65.7,
  },
  {
    id: "seven-minutes",
    title: "Seven minutes of terror",
    summary: "Spirit gives a rookie Beep-Bop its day-one briefing: seven minutes to land on Mars, and nobody on Earth can help.",
    src: host(4, "mars-mission-v2"),
    duration: 49.9,
  },
  {
    id: "oppys-last-signal",
    title: "Oppy’s last signal",
    summary: "Nearly 15 years of overtime on a 90-day contract. She earned that nap.",
    src: host(5, "oppy-funeral-v2"),
    duration: 64.0,
  },
  {
    id: "never-tell-buggy",
    title: "Never tell Buggy it was staged",
    summary: "An Apollo 17 veteran hears a Moon-landing doubt.",
    src: host(3, "moon-fake"),
    duration: 55.4,
  },
  {
    id: "the-leak",
    title: "The leak",
    summary: "Oppy finds out live on air that Percy broke her driving record. Then a rookie leaks Dragonfly.",
    src: host(5, "the-leak-v2"),
    duration: 62.9,
  },
  {
    id: "the-night-call",
    title: "The night call",
    summary: "Perseverance’s Earth twin calls after hours. Then a vacuum from Rome dials in.",
    src: host(3, "night-call"),
    duration: 49.3,
  },
  {
    id: "spirits-lucky-wheel",
    title: "Spirit’s lucky broken wheel",
    summary: "Dragging a dead wheel across Mars turned up a big discovery.",
    src: host(5, "spirit-mission-v2"),
    duration: 61.9,
  },
];

export const ROVERVILLA_JR: Series = {
  slug: "rovervilla-jr",
  title: "Rover Villa",
  badge: "Jr",
  audience: "Kids",
  format: "Animated series",
  tagline: "Their mission ended. Their story didn’t.",
  synopsis: "The town where Mars rovers go when the work is done.",
  lore: "Rovers still on a mission and the newest ones being built on Earth stay connected over Star-Fi, and the broadcast station sends every story out to you.",
  art: {
    wide: `${JR}/trailer-wide.webp`,
    tall: `${JR}/trailer-tall.webp`,
    loopWide: `${JR}/loop-wide.mp4`,
    loopTall: `${JR}/loop-tall.mp4`,
    og: `${JR}/og.jpg`,
  },
  trailer: {
    id: "holiday-in-rovervilla",
    title: "Holiday in Rovervilla",
    label: "Trailer",
    src: host(1, "holiday"),
    poster: `${JR}/ep/trailer.webp`,
    duration: 54.7,
    shape: "landscape",
  },
  trailerNote: "The trailer is the show’s song, Holiday in Rovervilla, played by the town band.",
  seasons: [
    {
      name: "Season 1",
      episodes: jrEpisodes.map((e, i) => ({ ...e, label: `Episode ${i + 1}`, poster: `${JR}/ep/${e.id}.webp`, shape: "portrait" })),
    },
  ],
  residents: [
    { name: "Sojourner", badge: "Since 1997", text: "Grandpa of the town. First rover to drive on Mars, landed 4 July 1997.", image: `${JR}/cast/sojourner.webp`, alt: "Sojourner" },
    { name: "Spirit", badge: "90 days, 6+ years", text: "A 90-day mission that lasted over six years, even on five working wheels.", image: `${JR}/cast/spirit.webp`, alt: "Spirit" },
    { name: "Oppy", badge: "Almost 15 years", text: "Built for 90 days, kept going for almost fifteen. Last signal: 10 June 2018.", image: `${JR}/cast/oppy.webp`, alt: "Opportunity" },
    { name: "Ingenuity", badge: "72 flights", text: "The little helicopter made seventy-two flights on Mars.", image: `${JR}/cast/ingenuity.webp`, alt: "Ingenuity" },
    { name: "Buggy", badge: "Moon, 1972", text: "The Apollo 17 Moon rover. He was there in December 1972.", image: `${JR}/cast/buggy.webp`, alt: "Buggy" },
    { name: "Curiosity and Perseverance", badge: "Still on Mars", text: "Still at work. They call home over Star-Fi.", image: `${JR}/cast/curiosity.webp`, alt: "A rover on Mars" },
    { name: "The Beep-Bop bots", badge: "Town crew", text: "They keep the town running, and play in the band.", image: `${JR}/cast/beepbop.webp`, alt: "Beep-Bop bots" },
  ],
  createdBy: "Team Galactic Poet",
  credits: [
    "“Trivial Call” by Blue Dot Sessions, CC BY 3.0",
    "“Bouncing” by HoliznaCC0, CC0",
    "“Crazy Glue” by Josh Woodward, CC BY 3.0",
    "“Wildflowers” by Scott Buckley (scottbuckley.com.au), CC BY 4.0",
    "“Daily Beetle”, “Sneaky Snitch”, “Marty Gots a Plan”, “Sneaky Adventure”, “Cheery Monday” and “Amazing Plan” by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0 License",
    "“Holiday in Rovervilla”: original Rovervilla song",
    "Real mission imagery: NASA, NASA/JPL, NASA/JPL-Caltech, NASA/JPL-Caltech/Cornell, NASA/JPL/Texas A&M/Cornell, NASA/Johns Hopkins APL, NASA/Daniel Rutter (public domain). Rovervilla is not affiliated with or endorsed by NASA.",
    "Characters, voices and animation: original Rovervilla work.",
  ],
};

export const SERIES: Series[] = [ROVERVILLA_JR];

export const getSeries = (slug: string) => SERIES.find((s) => s.slug === slug);

export const episodes = (s: Series) => s.seasons.flatMap((x) => x.episodes);

/** What the player runs through for a series: the trailer straight into episode 1, then on. */
export const playlist = (s: Series): Video[] => [s.trailer, ...episodes(s)];

export const seriesName = (s: Series) => (s.badge ? `${s.title} ${s.badge}` : s.title);

export const runtime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
};

export const clock = (sec: number) => {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
};
