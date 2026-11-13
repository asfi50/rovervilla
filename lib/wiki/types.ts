/**
 * The long-form "wiki" on each hero's page. Same rule as lib/heroes.ts: facts only, and every
 * statement must come from one of the entry's `sources` (NASA mission pages, NASA history articles,
 * NASA releases and photo captions). Where NASA sources disagree, say so instead of picking one.
 */
export type WikiEntry = {
  /** One-paragraph lead. */
  lead: string;
  sections: { id: string; title: string; paras: string[] }[];
  timeline: { date: string; text: string }[];
  /** Short facts for the infobox. */
  facts: { label: string; value: string }[];
  sources: { label: string; url: string }[];
};
