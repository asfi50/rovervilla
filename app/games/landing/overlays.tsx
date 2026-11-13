"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { GameSite } from "./game";
import { ORDER } from "./story";
import { site as siteSave, stars, totals, resetSave, type Save, type Settings, type Quality } from "./save";
import { Stars } from "./ui";
import { ArrowRight } from "@/app/components/icons";

export function Sheet({ title, onClose, children, wide = false }: { title: ReactNode; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className={`flex max-h-[92%] w-full flex-col overflow-hidden rounded-t-3xl bg-[#0b0a1d]/95 ring-1 ring-white/10 sm:rounded-3xl ${wide ? "max-w-5xl" : "max-w-lg"}`}>
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7">
          <div className="min-w-0">{title}</div>
          <button type="button" onClick={onClose} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20">
            Close
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">{children}</div>
      </div>
    </div>
  );
}

/** Every site, what you have found there, and the echoes you picked up. */
export function Journal({ sites, save, onGo, onClose }: { sites: GameSite[]; save: Save; onGo: (slug: string) => void; onClose: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const t = totals(save);
  const bySlug = new Map(sites.map((s) => [s.slug, s]));
  const ordered = ORDER.map((s) => bySlug.get(s)).filter((s): s is GameSite => !!s);
  const sel = open ? bySlug.get(open) : null;
  const ss = sel ? siteSave(save, sel.slug) : null;
  return (
    <Sheet
      wide
      onClose={onClose}
      title={
        <>
          <p className="font-mono text-[11px] tracking-[0.16em] text-white/55 uppercase">Journal</p>
          <p className="display text-2xl">
            {t.found} of {sites.length} signals heard <span className="ml-2 font-mono text-sm text-amber-200">★ {t.stars}/{sites.length * 3}</span>
          </p>
        </>
      }
    >
      {sel && ss ? (
        <div>
          <button type="button" onClick={() => setOpen(null)} className="mb-4 font-mono text-xs text-white/60 hover:text-white">
            ← All sites
          </button>
          <div className="grid gap-6 md:grid-cols-[260px_1fr]">
            <div>
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-black">
                <Image src={sel.photo.src} alt={sel.photo.alt} fill sizes="260px" className={`object-cover ${ss.found ? "" : "opacity-30 grayscale"}`} />
              </div>
              {!sel.photo.ai && (
                <a href={sel.photo.source} target="_blank" rel="noopener noreferrer" className="mt-2 block font-mono text-[10px] text-white/45 hover:text-white">
                  Photo: {sel.photo.credit}
                </a>
              )}
            </div>
            <div>
              <p className="font-mono text-xs text-white/55">{sel.restingPlace}</p>
              <h3 className="display mt-1 text-3xl">{sel.name}</h3>
              <div className="mt-2 flex items-center gap-3">
                <Stars have={stars(ss)} />
                <span className="font-mono text-[11px] text-white/55">Gentle landing · In the ring · All echoes</span>
              </div>
              {ss.found ? (
                <div className="mt-4 rounded-2xl bg-white/4 p-4 ring-1 ring-white/10">
                  <p className="font-mono text-[11px] tracking-[0.14em] text-rose-200/80 uppercase">
                    {sel.endLabel} · {sel.endDate}
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/85">{sel.story}</p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-white/60">Not visited yet. Land there to hear how it went quiet.</p>
              )}
              <p className="mt-5 font-mono text-[11px] tracking-[0.14em] text-white/55 uppercase">Echoes from the record</p>
              <ol className="mt-2 space-y-2">
                {sel.echoes.map((e, i) => (
                  <li key={i} className="rounded-xl bg-white/4 p-3 ring-1 ring-white/10">
                    {ss.echoes.includes(i) ? (
                      <>
                        <p className="font-mono text-[11px] text-cyan-200">{e.date}</p>
                        <p className="mt-0.5 text-sm text-white/85">{e.text}</p>
                      </>
                    ) : (
                      <p className="font-mono text-xs text-white/40">Echo {i + 1}: not picked up yet</p>
                    )}
                  </li>
                ))}
              </ol>
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" onClick={() => onGo(sel.slug)} className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold hover:bg-brand-deep">
                  {ss.found ? "Visit again" : "Go there"} <ArrowRight />
                </button>
                <Link href={`/heroes/${sel.slug}`} className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/20">
                  Its page in the archive
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        (["moon", "mars"] as const).map((b) => (
          <section key={b} className="mb-6 last:mb-0">
            <h3 className="font-mono text-[11px] tracking-[0.16em] text-white/55 uppercase">{b === "moon" ? "The Moon" : "Mars"}</h3>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {ordered
                .filter((s) => s.body === b)
                .map((s) => {
                  const x = siteSave(save, s.slug);
                  return (
                    <li key={s.slug}>
                      <button type="button" onClick={() => setOpen(s.slug)} className="group block w-full overflow-hidden rounded-2xl bg-white/4 text-left ring-1 ring-white/10 hover:ring-brand-bright">
                        <div className="relative aspect-[4/3] bg-black">
                          <Image src={s.photo.src} alt="" fill sizes="200px" className={`object-cover transition-transform duration-500 group-hover:scale-105 ${x.found ? "" : "opacity-25 grayscale"}`} />
                          {x.light && <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_10px_#fcd34d]" title="You left a light here" />}
                        </div>
                        <div className="p-3">
                          <p className="truncate text-sm font-semibold">{s.name}</p>
                          <div className="mt-1 flex items-center justify-between">
                            <Stars have={stars(x)} size="sm" />
                            <span className="font-mono text-[10px] text-white/50">{x.found ? `${x.echoes.length}/3 echoes` : "unvisited"}</span>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </section>
        ))
      )}
    </Sheet>
  );
}

export function SettingsSheet({ settings, onChange, onClose }: { settings: Settings; onChange: (s: Partial<Settings>) => void; onClose: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const row = "flex items-center justify-between gap-4 py-3";
  return (
    <Sheet onClose={onClose} title={<p className="display text-2xl">Settings</p>}>
      <div className="divide-y divide-white/10">
        <label className={row}>
          <span>Music</span>
          <input type="range" min={0} max={1} step={0.05} value={settings.music} onChange={(e) => onChange({ music: Number(e.target.value) })} className="w-40 accent-brand-bright" />
        </label>
        <label className={row}>
          <span>Sound effects</span>
          <input type="range" min={0} max={1} step={0.05} value={settings.sfx} onChange={(e) => onChange({ sfx: Number(e.target.value) })} className="w-40 accent-brand-bright" />
        </label>
        <div className={row}>
          <span>Graphics</span>
          <div className="flex rounded-full bg-white/10 p-1">
            {(["auto", "high", "medium", "low"] as Quality[]).map((q) => (
              <button key={q} type="button" onClick={() => onChange({ quality: q })} aria-pressed={settings.quality === q} className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${settings.quality === q ? "bg-brand" : "hover:bg-white/10"}`}>
                {q}
              </button>
            ))}
          </div>
        </div>
        <label className={row}>
          <span>
            Expert pilot
            <span className="block text-xs text-white/55">Turns off the flight computer: no speed hold, no drift hold, no safety brake near the ground. Real gravity, all yours.</span>
          </span>
          <input type="checkbox" checked={settings.pilot} onChange={(e) => onChange({ pilot: e.target.checked })} className="h-5 w-5 accent-brand-bright" />
        </label>
        <label className={row}>
          <span>Camera shake</span>
          <input type="checkbox" checked={settings.shake} onChange={(e) => onChange({ shake: e.target.checked })} className="h-5 w-5 accent-brand-bright" />
        </label>
        <div className={row}>
          <span>
            Progress
            <span className="block text-xs text-white/55">Saved in this browser only.</span>
          </span>
          {confirm ? (
            <button
              type="button"
              onClick={() => {
                resetSave();
                setConfirm(false);
              }}
              className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold"
            >
              Erase everything
            </button>
          ) : (
            <button type="button" onClick={() => setConfirm(true)} className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/20">
              Reset…
            </button>
          )}
        </div>
      </div>
      <div className="mt-5 rounded-2xl bg-white/4 p-4 font-mono text-[11px] leading-relaxed text-white/60">
        <p className="text-white/80">Controls</p>
        <p className="mt-1">Landing: hold Space to brake; let go and the flight computer holds your speed. W A S D or arrows steer. C switches camera.</p>
        <p>Driving: W A S D or arrows, Space to brake. Drag to look around.</p>
        <p>P or Esc pauses, M mutes. Gamepads work too.</p>
      </div>
    </Sheet>
  );
}

/** After the fifteenth signal: the list, and what was real. */
export function Credits({ sites, save, onClose }: { sites: GameSite[]; save: Save; onClose: () => void }) {
  const bySlug = new Map(sites.map((s) => [s.slug, s]));
  const t = totals(save);
  return (
    <div className="absolute inset-0 z-40 overflow-y-auto bg-black/80 backdrop-blur-sm">
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-white/55 uppercase">Touchdown</p>
        <h2 className="display mt-3 text-5xl sm:text-6xl">Every signal heard.</h2>
        <p className="mt-3 font-mono text-sm text-amber-200">★ {t.stars} of {sites.length * 3}</p>
        <ol className="mt-10 space-y-3 text-left">
          {ORDER.map((slug) => bySlug.get(slug))
            .filter((s): s is GameSite => !!s)
            .map((s) => (
              <li key={s.slug} className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                <span className="text-lg">{s.name}</span>
                <span className="text-right font-mono text-xs text-white/60">
                  {s.endLabel} · {s.endDate}
                </span>
              </li>
            ))}
        </ol>
        <div className="mt-10 space-y-2 text-sm leading-relaxed text-white/65">
          <p>The places, dates and machines are real, from NASA mission pages, history articles and releases. Ground, your lander and its flights are made up.</p>
          <p>Maps: NASA 3D Resources (Mars), USGS/LRO (Moon). Models: NASA 3D Resources, and simplified models made for this site. Music and sound are generated live in your browser.</p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={onClose} className="rounded-full bg-brand px-6 py-3 text-sm font-semibold hover:bg-brand-deep">
            Keep exploring
          </button>
          <Link href="/story" className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold hover:bg-white/20">
            Read their stories
          </Link>
        </div>
      </div>
    </div>
  );
}
