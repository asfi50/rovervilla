import { useSyncExternalStore } from "react";

/**
 * How far this viewer got in each video, kept in their own browser only. It drives
 * "Continue watching", the progress bars on posters and resuming where they left off.
 */
export type Progress = { t: number; d: number; at: number };
type All = Record<string, Progress>;

const KEY = "rv:progress:v1";
const EMPTY: All = {};
let cache: All | null = null;
const listeners = new Set<() => void>();

function read(): All {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || "{}") as All;
  } catch {
    cache = {};
  }
  return cache;
}

export function saveProgress(id: string, t: number, d: number) {
  if (!Number.isFinite(t) || !Number.isFinite(d) || d <= 0) return;
  cache = { ...read(), [id]: { t, d, at: Date.now() } };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* private mode or full storage: progress just isn't remembered */
  }
  listeners.forEach((l) => l());
}

export const getProgress = (id: string): Progress | undefined => read()[id];

/** 0–1, or 0 when unseen. Anything within the last few seconds counts as finished. */
export const fraction = (p?: Progress) => (!p ? 0 : p.t >= p.d - 4 ? 1 : Math.min(1, p.t / p.d));

/** Where to start a video: its saved spot when the viewer is part-way through, else 0. */
export const resumeAt = (id: string) => {
  const p = read()[id];
  return p && p.t > 5 && p.t < p.d - 8 ? p.t : 0;
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cache = null;
    l();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
};

/** All saved progress. Empty during server render and the first client render. */
export const useProgress = () => useSyncExternalStore(subscribe, read, () => EMPTY);
