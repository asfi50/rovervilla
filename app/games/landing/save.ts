/**
 * Touchdown progress and settings, kept in this browser only (localStorage), with an in-memory
 * fallback when storage is blocked so a session still works.
 */
import { useMemo, useSyncExternalStore } from "react";

export type SiteSave = { landed?: boolean; soft?: boolean; zone?: boolean; echoes: number[]; found?: boolean; light?: boolean; best?: number };
export type Quality = "auto" | "high" | "medium" | "low";
/** `pilot`: expert mode, raw physics without the flight computer. */
export type Settings = { music: number; sfx: number; quality: Quality; shake: boolean; pilot: boolean; muted: boolean };
export type Save = { v: 2; sites: Record<string, SiteSave>; prologue: boolean; finale: boolean; landings: number; crashes: Record<string, number>; settings: Settings };

const KEY = "tls:touchdown:v2";
const LEGACY = "tls:touchdown:found";
const EVENT = "tls:touchdown";

export const DEFAULT_SETTINGS: Settings = { music: 0.75, sfx: 0.9, quality: "auto", shake: true, pilot: false, muted: false };
const fresh = (): Save => ({ v: 2, sites: {}, prologue: false, finale: false, landings: 0, crashes: {}, settings: { ...DEFAULT_SETTINGS } });

let memory: string | null = null;

const read = () => {
  if (memory !== null) return memory;
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
};

export function parseSave(raw: string): Save {
  const s = fresh();
  if (raw) {
    try {
      const o = JSON.parse(raw) as Partial<Save>;
      Object.assign(s, o);
      s.settings = { ...DEFAULT_SETTINGS, ...(o.settings ?? {}) };
      s.crashes = o.crashes ?? {};
      for (const k of Object.keys(s.sites)) s.sites[k] = { ...s.sites[k], echoes: s.sites[k].echoes ?? [] };
      return s;
    } catch {
      return s;
    }
  }
  return s;
}

/** Carry over sites found in the first version of the game (run once, after hydration). */
export function migrateLegacy() {
  try {
    if (localStorage.getItem(KEY)) return;
    const old = JSON.parse(localStorage.getItem(LEGACY) ?? "[]") as string[];
    if (!old.length) return;
    writeSave((s) => {
      for (const slug of old) s.sites[slug] = { echoes: [], found: true, landed: true };
    });
  } catch {
    /* nothing to migrate */
  }
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};

export function useSave(): Save {
  const raw = useSyncExternalStore(subscribe, read, () => "");
  return useMemo(() => parseSave(raw), [raw]);
}

export function writeSave(fn: (s: Save) => void) {
  const s = parseSave(read());
  fn(s);
  const raw = JSON.stringify(s);
  try {
    localStorage.setItem(KEY, raw);
    memory = null;
  } catch {
    memory = raw;
  }
  window.dispatchEvent(new Event(EVENT));
}

export function site(s: Save, slug: string): SiteSave {
  return s.sites[slug] ?? { echoes: [] };
}

export function stars(x: SiteSave) {
  return [!!x.soft, !!x.zone, x.echoes.length >= 3];
}

export function totals(s: Save) {
  const all = Object.values(s.sites);
  return {
    found: all.filter((x) => x.found).length,
    stars: all.reduce((n, x) => n + stars(x).filter(Boolean).length, 0),
  };
}

export function resetSave() {
  writeSave((s) => {
    const settings = s.settings;
    Object.assign(s, fresh(), { settings });
  });
  try {
    localStorage.removeItem(LEGACY);
  } catch {
    /* ignore */
  }
}
