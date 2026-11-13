"use client";

import { useState, useSyncExternalStore } from "react";
import { ArrowRight } from "@/app/components/icons";

type Tribute = { name: string; message: string; at: string };

const KEY = (slug: string) => `tls:tributes:${slug}`;
const EVENT = "tls:tributes";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function read(slug: string) {
  try {
    return localStorage.getItem(KEY(slug)) ?? "[]";
  } catch {
    return "[]";
  }
}

function parse(raw: string): Tribute[] {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Visitors' messages. There is no shared backend yet, so tributes are kept on this device
 * only, and the wall says so.
 */
export default function TributeWall({ slug, name, dark = false }: { slug: string; name: string; dark?: boolean }) {
  const raw = useSyncExternalStore(subscribe, () => read(slug), () => "[]");
  const items = parse(raw);
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const next = [{ name: author.trim() || "Anonymous", message: message.trim(), at: new Date().toISOString() }, ...items];
    try {
      localStorage.setItem(KEY(slug), JSON.stringify(next));
      window.dispatchEvent(new Event(EVENT));
      setMessage("");
    } catch {
      /* storage blocked (private mode): keep the text so nothing typed is lost */
    }
  };

  const field = dark
    ? "bg-white/10 text-white placeholder:text-white/50 border-white/10 focus:border-brand-bright"
    : "bg-white border-line focus:border-brand";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <form onSubmit={submit} className="space-y-3">
        <label className="sr-only" htmlFor={`t-name-${slug}`}>Your name</label>
        <input
          id={`t-name-${slug}`}
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          maxLength={40}
          placeholder="Your name (optional)"
          className={`w-full rounded-xl border px-4 py-3 outline-none ${field}`}
        />
        <label className="sr-only" htmlFor={`t-msg-${slug}`}>Your tribute to {name}</label>
        <textarea
          id={`t-msg-${slug}`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={280}
          rows={3}
          required
          placeholder="Write a tribute…"
          className={`w-full resize-none rounded-xl border px-4 py-3 outline-none ${field}`}
        />
        <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-deep">
          Leave a tribute <ArrowRight />
        </button>
        <p className={`font-mono text-[11px] ${dark ? "text-white/50" : "text-ink-soft"}`}>Saved on this device for now. A shared wall is coming.</p>
      </form>

      <ul className="grid grid-cols-1 content-start gap-3 sm:grid-cols-2" aria-live="polite">
        {items.length === 0 && (
          <li className={`rounded-2xl border border-dashed p-6 text-sm sm:col-span-2 ${dark ? "border-white/20 text-white/60" : "border-line text-ink-soft"}`}>
            No tributes yet. Be the first to say goodbye to {name}.
          </li>
        )}
        {items.map((t) => (
          <li key={t.at} className={`rounded-2xl border p-5 ${dark ? "border-white/10 bg-white text-ink" : "border-line bg-white"}`}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#ff8a5c,#1238ff)] font-semibold text-white" aria-hidden>
                {t.name[0]?.toUpperCase()}
              </span>
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="font-mono text-xs text-ink-soft">{new Date(t.at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed break-words">{t.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
