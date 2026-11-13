import { useSyncExternalStore } from "react";

/**
 * Reading state for Rover Villa Books, kept in this viewer's browser only: the last chapter
 * opened in each book (for "Continue reading"), the chapters finished, and how they like to read.
 */
export type BookProgress = { ch: string; at: number; done: string[] };
export type ReadMode = "comic" | "story";
type State = { books: Record<string, BookProgress>; mode: ReadMode; size: number };

const KEY = "rv:reading:v1";
const EMPTY: State = { books: {}, mode: "comic", size: 1 };
let cache: State | null = null;
const listeners = new Set<() => void>();

function read(): State {
  if (cache) return cache;
  try {
    cache = { ...EMPTY, ...(JSON.parse(localStorage.getItem(KEY) || "{}") as Partial<State>) };
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: State) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode or full storage: nothing is remembered, reading still works */
  }
  listeners.forEach((l) => l());
}

/** Marks a chapter as opened; `finished` also ticks it off. */
export function markChapter(book: string, ch: string, finished = false) {
  const s = read();
  const prev = s.books[book];
  const done = new Set(prev?.done ?? []);
  if (finished) done.add(ch);
  write({ ...s, books: { ...s.books, [book]: { ch, at: Date.now(), done: [...done] } } });
}

export const setReadMode = (mode: ReadMode) => write({ ...read(), mode });
export const setTextSize = (size: number) => write({ ...read(), size: Math.max(0, Math.min(3, size)) });

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

/** The whole reading state. Defaults during server render and the first client render. */
export const useReading = () => useSyncExternalStore(subscribe, read, () => EMPTY);
