/**
 * A cinematic, scroll-driven story: one scene per screen, the camera moving over real archive
 * photos as you scroll. Facts only, same rule as lib/heroes.ts: every date and number in a
 * scene must come from one of the story's `sources`.
 */

/** Where the camera looks: `s` is zoom (1 = photo just covers the screen), `x`/`y` the point of the photo at screen centre (0–1). */
export type Cam = { s: number; x: number; y: number };

export type Scene = {
  id: string;
  /** Year on the progress rail. */
  year: number;
  /** Small line above the title: a date, a sol, a place. */
  date: string;
  title: string;
  text: string;
  /** Photo name (`nasa/<id>`); omitted for drawn scenes. */
  image?: string;
  /** zoom: camera moves from `from` to `to`. frame: photo shown as a framed print. space: drawn starfield. black: silence. */
  mode?: "zoom" | "frame" | "space" | "black";
  from?: Cam;
  to?: Cam;
  /** Foreground layer drawn over the photo. */
  fx?: "bounce" | "dust" | "darken" | "rings" | "target";
  /** A number that counts up while the scene plays (odometer, sols). */
  count?: { from: number; to: number; decimals: number; unit: string; label: string };
  /** Scroll length of the scene in screens (default 1). */
  len?: number;
  /** Shown on the photo credit, e.g. "Artist's concept". */
  note?: string;
};

export type Story = {
  slug: string;
  title: string;
  lede: string;
  scenes: Scene[];
  sources: { label: string; url: string }[];
};
