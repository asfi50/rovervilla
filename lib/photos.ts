/**
 * Credited archive photos. Names starting with `nasa/` are real images from the NASA Image and
 * Video Library, downloaded by scripts/fetch-nasa-images.py (metadata in nasa-photos.json).
 * Every other image name is one of our own illustrations. It gets no credit line and no "AI" label
 * (the owner's call, 2026-11-13), but is never passed off as an archive photo.
 * Server-side only: the manifest is too large to ship to the browser.
 */
import data from "./nasa-photos.json";

type Raw = { title: string; credit: string; source: string; width: number; height: number; description: string; date: string; hero: string };
const DB = data as Record<string, Raw>;

/** Display captions for archive titles that are truncated or unclear in NASA's own metadata. */
const TITLE: Record<string, string> = {
  PIA01122: "The Sojourner rover on Mars, 1997",
  PIA09509: "Plains west of Viking Lander 2, seen from orbit",
  PIA16442: "Spirit's self-portrait in the McMurdo panorama, 2006",
  PIA23151: "The flight model of the Mars Helicopter in a JPL cleanroom",
  "KSC-96PC-1130": "JPL technicians close the Pathfinder lander's petals at Kennedy Space Center",
  PIA00567: "Sunset at the Viking Lander 1 site",
  PIA11720: "La Mancha trench dug by Phoenix",
  PIA02055: "Spirit says goodbye to Home Plate",
  PIA02349: "Mars Polar Lander: the search begins",
  "KSC-71PC-0685": "Apollo 15's Saturn V lifts off, 26 July 1971",
  "KSC-03pd1900": "Spirit's Delta II lifts off, 10 June 2003",
  "KSC-03pd2090": "Opportunity's Delta II Heavy lifts off, 7 July 2003",
  "KSC-99pc05": "Mars Polar Lander's Delta II clears the pad, 3 January 1999",
  "KSC-98pc1229": "Mars Polar Lander prepared for testing at Kennedy Space Center",
  "KSC-07PD-1085": "Phoenix during processing at Kennedy Space Center",
  "KSC-07pd2166": "Phoenix's Delta II on Pad 17A before launch",
  "KSC-2009-1754": "LCROSS arrives in Florida from Northrop Grumman",
  "KSC-2009-3298": "LRO and LCROSS lifted into the tower at Launch Complex 41",
  "KSC-2011-6923": "GRAIL lifts off on a Delta II, 10 September 2011",
  "KSC-2011-6352": "Technicians with GRAIL-A at Astrotech, Florida",
  "KSC-20200730-PH-FMX01_0042": "Perseverance and Ingenuity lift off on an Atlas V, 30 July 2020",
  "101-KSC-75P-12": "Viking Lander 1 in its aeroshell at Kennedy Space Center",
  "101-KSC-75P-110": "Technicians inspect Viking Lander 2",
  "101-KSC-75PC-167": "Viking A (later Viking 2) sealed inside its Centaur shroud",
  "9141929": "Viking 1 lifts off on a Titan III-Centaur, 20 August 1975",
  "9614653": "Mars Pathfinder lifts off on a Delta II, 4 December 1996",
  "200906180001HQ": "LRO and LCROSS lift off, 18 June 2009",
  NHQ201805050001: "InSight lifts off from Vandenberg, 5 May 2018",
  jsc2007e034221: "The Apollo 11 spacecraft atop its Saturn V during a countdown test",
  "S69-39961": "Apollo 11 lifts off, 16 July 1969",
  "as15-086-11601": "Falcon and the Lunar Roving Vehicle at Hadley-Apennine",
  "S71-41509": "The rover's TV camera shows Falcon lifting off, 2 August 1971",
};

export type Photo = { name: string; src: string; title: string; credit: string; source: string; alt: string; ai: boolean; width?: number; height?: number };

/** Real archive photo, or undefined for AI placeholders. */
export function photoMeta(name: string): Photo | undefined {
  if (!name.startsWith("nasa/")) return undefined;
  const id = name.slice(5);
  const r = DB[id];
  if (!r) return undefined;
  const title = TITLE[id] ?? r.title;
  const alt = (r.description.split(/(?<=\.)\s/)[0] || title).slice(0, 220);
  return { name, src: `/images/${name}.jpg`, title, credit: r.credit, source: r.source, alt, ai: false, width: r.width, height: r.height };
}

/** Any image name as a captioned photo: archive metadata for real photos, a clear label for AI placeholders. */
export function photo(name: string, fallbackAlt = ""): Photo {
  return (
    photoMeta(name) ?? {
      name,
      src: `/images/${name}.jpg`,
      title: "Illustration",
      credit: "Rover Villa",
      source: "",
      alt: fallbackAlt || "Illustration",
      ai: true,
    }
  );
}

export const isArchive = (name: string) => name.startsWith("nasa/") && !!DB[name.slice(5)];
