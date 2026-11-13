"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GlobeApi } from "./globe";
import type { Landing, WorldApi, WorldPhase, Quality as WorldQuality } from "./world";
import { GameAudio } from "./audio";
import { BRIEF, FINALE, MILESTONE, ORDER, PROLOGUE, RADIO, type Line } from "./story";
import { migrateLegacy, site as siteSave, stars, totals, useSave, writeSave, type Settings } from "./save";
import { Compass, DescentHud, HoldButton, Icon, IconButton, Joystick, Radio, Stars, type CompassHandle, type HudHandle, type RadioHandle } from "./ui";
import { Credits, Journal, SettingsSheet } from "./overlays";
import { ArrowRight } from "@/app/components/icons";

export type GameSite = {
  slug: string;
  name: string;
  body: "mars" | "moon";
  lat: number;
  lon: number;
  approx?: boolean;
  restingPlace: string;
  arrived: string;
  endLabel: string;
  endDate: string;
  story: string;
  photo: { src: string; alt: string; credit: string; source: string; ai: boolean };
  glb?: string;
  size: number;
  mode: "machine" | "crater" | "lost";
  echoes: { date: string; text: string }[];
};

type Screen = "title" | "prologue" | "orbit" | "brief" | "dive" | "play";
type Panel = null | "landed" | "crashed" | "found";
type Overlay = null | "journal" | "settings" | "pause" | "credits";

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const ZONE = 40;

/**
 * Touchdown: a short pilgrimage game. Choose a machine on Mars or the Moon, fly the landing
 * yourself, then drive a small rover to its real resting place and hear how it went quiet.
 */
export default function TouchdownGame({ sites }: { sites: GameSite[] }) {
  const save = useSave();
  const settings = save.settings;
  const [screen, setScreen] = useState<Screen>("title");
  const [body, setBody] = useState<"mars" | "moon">("mars");
  const [sel, setSel] = useState<string | null>(null);
  const [phase, setPhase] = useState<WorldPhase | null>(null);
  const [landing, setLanding] = useState<Landing | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [echoCard, setEchoCard] = useState<{ i: number; key: number } | null>(null);
  const [progress, setProgress] = useState("");
  const [callout, setCallout] = useState<{ text: string; key: number } | null>(null);
  const [coarse, setCoarse] = useState(false);
  const [fs, setFs] = useState(false);
  const [fade, setFade] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [finale, setFinale] = useState(false);
  const [worldKey, setWorldKey] = useState(0);
  const [newFind, setNewFind] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const worldHost = useRef<HTMLDivElement>(null);
  const globe = useRef<GlobeApi | null>(null);
  const world = useRef<WorldApi | null>(null);
  const audio = useRef<GameAudio | null>(null);
  const radio = useRef<RadioHandle>(null);
  const bigRadio = useRef<RadioHandle>(null);
  const hud = useRef<HudHandle>(null);
  const compass = useRef<CompassHandle>(null);
  const hint = useRef<HTMLParagraphElement>(null);
  const labels = useRef<Map<string, HTMLButtonElement>>(new Map());
  const touch = useRef({ x: 0, y: 0, thrust: 0, brake: false });
  const latest = useRef({ save, sel, screen, phase, panel, overlay, coarse });
  useEffect(() => {
    latest.current = { save, sel, screen, phase, panel, overlay, coarse };
  });

  const site = sites.find((s) => s.slug === sel) ?? null;
  const worldSites = sites.filter((s) => s.body === body);
  const t = totals(save);
  const next = ORDER.find((slug) => !save.sites[slug]?.found && slug !== sel) ?? null;
  const nextSite = sites.find((s) => s.slug === next) ?? null;
  const found = useMemo(() => Object.entries(save.sites).filter(([, v]) => v.found).map(([k]) => k), [save]);
  const lit = useMemo(() => Object.entries(save.sites).filter(([, v]) => v.light).map(([k]) => k), [save]);
  const quality: WorldQuality = settings.quality === "auto" ? (coarse ? "medium" : "high") : settings.quality;

  useEffect(() => {
    migrateLegacy();
    const mq = window.matchMedia("(pointer: coarse)");
    const on = () => setCoarse(mq.matches);
    on();
    mq.addEventListener("change", on);
    const fsOn = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", fsOn);
    // Leaving the tab pauses the game.
    const vis = () => {
      if (document.hidden && latest.current.screen === "play") setOverlay((o) => o ?? "pause");
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      mq.removeEventListener("change", on);
      document.removeEventListener("fullscreenchange", fsOn);
      document.removeEventListener("visibilitychange", vis);
      audio.current?.dispose();
      audio.current = null;
    };
  }, []);

  // ---------- audio ----------
  const ensureAudio = useCallback(() => {
    if (!audio.current) {
      try {
        audio.current = new GameAudio();
        const s = latest.current.save.settings;
        audio.current.setVolume(s.music, s.sfx);
        audio.current.setMuted(s.muted);
        setAudioOn(true);
      } catch {
        return null;
      }
    }
    audio.current.resume();
    return audio.current;
  }, []);
  const getAudio = useCallback(() => audio.current, []);
  const sfx = useCallback((n: Parameters<GameAudio["play"]>[0], k = 0) => audio.current?.play(n, k), []);

  useEffect(() => {
    audio.current?.setVolume(settings.music, settings.sfx);
    audio.current?.setMuted(settings.muted);
  }, [settings.music, settings.sfx, settings.muted, audioOn]);
  useEffect(() => {
    world.current?.setOptions({ pilot: settings.pilot, shake: settings.shake });
  }, [settings.pilot, settings.shake]);

  // Music follows the scene.
  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const w = screen === "play" && site ? site.body : body;
    if (finale || overlay === "credits") a.setMood("finale", w);
    else if (screen === "title" || screen === "prologue") a.setMood("title", w);
    else if (screen !== "play") a.setMood("orbit", w);
    else if (phase === "crashed") a.setMood("crash", w);
    else if (phase === "entry" || phase === "descent") a.setMood("descent", w);
    else if (phase === "arrive") a.setMood("found", w);
    else if (phase) a.setMood("surface", w);
  }, [screen, phase, body, site, audioOn, finale, overlay]);

  // ---------- globe ----------
  const globeOn = screen !== "play";
  const isTitle = screen === "title" || screen === "prologue";
  useEffect(() => {
    if (!globeOn) return;
    const el = stage.current;
    if (!el) return;
    let api: GlobeApi | null = null;
    let gone = false;
    import("./globe").then(async ({ createGlobe }) => {
      if (gone) return;
      api = await createGlobe(el, {
        body,
        sites: sites.filter((s) => s.body === body),
        title: latest.current.screen === "title" || latest.current.screen === "prologue",
        onPick: (slug) => {
          if (latest.current.screen !== "orbit" && latest.current.screen !== "brief") return;
          audio.current?.play("click");
          setSel(slug);
          setScreen("brief");
        },
        label: (slug, x, y, visible) => {
          const b = labels.current.get(slug);
          if (!b) return;
          b.style.transform = `translate(${x}px, ${y}px)`;
          b.style.opacity = visible ? "1" : "0";
          b.style.pointerEvents = visible ? "auto" : "none";
        },
      });
      if (gone) return api.dispose();
      globe.current = api;
      const s = latest.current.save;
      api.setFound(
        Object.keys(s.sites).filter((k) => s.sites[k].found),
        Object.keys(s.sites).filter((k) => s.sites[k].light),
      );
      if (latest.current.screen === "brief") api.focus(latest.current.sel);
    });
    return () => {
      gone = true;
      api?.dispose();
      globe.current = null;
    };
  }, [globeOn, body, sites]);
  useEffect(() => {
    globe.current?.setTitle(isTitle);
  }, [isTitle]);
  useEffect(() => {
    if (screen === "brief" || screen === "orbit") globe.current?.focus(screen === "brief" ? sel : null);
  }, [sel, screen]);
  useEffect(() => {
    globe.current?.setFound(found, lit);
  }, [found, lit]);

  // ---------- world ----------
  const playing = screen === "play";
  useEffect(() => {
    if (!playing || !site) return;
    const el = worldHost.current;
    if (!el) return;
    let api: WorldApi | null = null;
    let gone = false;
    let tutorial = latest.current.save.landings < 2;
    const ss = siteSave(latest.current.save, site.slug);
    const debug = new URLSearchParams(window.location.search).has("autopilot");
    import("./world").then(async ({ createWorld }) => {
      if (gone) return;
      api = await createWorld(
        el,
        {
          slug: site.slug,
          body: site.body,
          lat: site.lat,
          lon: site.lon,
          glb: site.glb,
          size: site.size,
          mode: site.mode,
          seed: hash(site.slug),
          quality,
          pilot: latest.current.save.settings.pilot,
          shake: latest.current.save.settings.shake && !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          light: !!ss.light,
          echoesTaken: ss.echoes,
        },
        {
          frame: (f) => {
            if (f.kind === "descent") {
              hud.current?.update(f);
              const h = hint.current;
              if (h) {
                // Coaching: what to do right now, in plain words.
                const touchUi = latest.current.coarse;
                const brake = touchUi ? "hold ENGINE" : "hold SPACE";
                const down = -f.vy;
                let text = "";
                let warn = false;
                if (down > f.target + 4) {
                  text = `Too fast: ${brake} to brake`;
                  warn = true;
                } else if (f.dist > ZONE && f.alt < 420 && f.alt > 12) text = touchUi ? "Steer to the blue ring with the stick" : "Steer to the blue ring with W A S D";
                else if (f.alt < 15) text = down > 2.5 ? `Gently… ${brake} a little` : "Gently… you're doing fine";
                else if (tutorial && down > 0.5) text = "Good speed. Keep the bar green";
                if (h.textContent !== text) h.textContent = text;
                h.style.opacity = text ? "1" : "0";
                h.style.color = warn ? "#fca5a5" : "#fcd34d";
              }
            } else compass.current?.update(f);
          },
          phase: (p) => {
            setPhase(p);
            if (p === "entry") {
              setPanel(null);
              setLanding(null);
            }
            if (p === "drive" && latest.current.phase === "deploy") radio.current?.say(RADIO.deploy);
          },
          callout: (text) => setCallout({ text, key: performance.now() }),
          radio: (k) => {
            radio.current?.say(RADIO[k]);
            if ((k === "chute" || k === "braking") && !latest.current.save.settings.pilot && latest.current.save.landings < 3) radio.current?.say(latest.current.coarse ? RADIO.howtoTouch : RADIO.howto);
          },
          landed: (r) => {
            setLanding(r);
            setPanel(r.ok ? "landed" : "crashed");
            if (r.ok) {
              tutorial = false;
              writeSave((s) => {
                const x = (s.sites[site.slug] ??= { echoes: [] });
                x.landed = true;
                x.soft = x.soft || r.grade === "feather" || r.grade === "smooth";
                x.zone = x.zone || r.offset <= ZONE;
                x.best = Math.min(x.best ?? 99, r.vy);
                s.landings++;
              });
              radio.current?.say(r.grade === "hard" ? RADIO.landedHard : r.offset <= ZONE ? RADIO.landed : RADIO.landedFar);
              const soft = r.grade === "feather" || r.grade === "smooth";
              [soft, r.offset <= ZONE].forEach((on, i) => on && setTimeout(() => audio.current?.play("star", i), 500 + i * 350));
              if (r.grade === "hard") navigator.vibrate?.(120);
            } else {
              let n = 0;
              writeSave((s) => {
                n = s.crashes[site.slug] = (s.crashes[site.slug] ?? 0) + 1;
              });
              radio.current?.say(RADIO.crashed);
              navigator.vibrate?.([80, 60, 200]);
              if (n >= 2 && latest.current.save.settings.pilot) setTimeout(() => radio.current?.say(RADIO.computer), 3500);
            }
          },
          echo: (i) => {
            setEchoCard({ i, key: performance.now() });
            let all = false;
            writeSave((s) => {
              const x = (s.sites[site.slug] ??= { echoes: [] });
              if (!x.echoes.includes(i)) x.echoes.push(i);
              all = x.echoes.length >= 3;
            });
            radio.current?.say(all ? RADIO.echoesAll : RADIO.echo);
            if (all) setTimeout(() => audio.current?.play("star", 2), 600);
          },
          arrive: () => {
            let first = false;
            let count = 0;
            writeSave((s) => {
              const x = (s.sites[site.slug] ??= { echoes: [] });
              first = !x.found;
              x.found = true;
              count = Object.values(s.sites).filter((v) => v.found).length;
            });
            setNewFind(first);
            setPanel("found");
            const line = site.mode === "crater" ? RADIO.arriveCrater : site.mode === "lost" ? RADIO.arriveLost : RADIO.arriveMachine;
            radio.current?.say(first && MILESTONE[count] ? [{ who: "ground", text: line }, { who: "ground", text: MILESTONE[count] }] : line);
          },
          progress: (m) => setProgress(m),
        },
        audio.current,
      );
      if (gone) return api.dispose();
      world.current = api;
      if (debug) api.autopilot(true);
    });
    return () => {
      gone = true;
      api?.dispose();
      world.current = null;
    };
    // Rebuild only when entering play for a site (or on an explicit rebuild).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, site?.slug, worldKey]);

  // Touch buttons can vanish mid-press when the phase changes; never leave an input held.
  useEffect(() => {
    touch.current = { x: 0, y: 0, thrust: 0, brake: false };
    world.current?.touch(touch.current);
  }, [phase]);

  // Keep the machine in view beside the found card on wide screens.
  useEffect(() => {
    const wide = typeof window !== "undefined" && window.innerWidth >= 900;
    world.current?.setInset(panel === "found" && wide ? 584 : 0);
  }, [panel]);

  // Pause the world under any overlay.
  useEffect(() => {
    world.current?.setPaused(playing && (overlay !== null || (fade && screen === "play")));
  }, [overlay, playing, fade, screen]);

  // ---------- keyboard ----------
  useEffect(() => {
    const on = (down: boolean) => (e: KeyboardEvent) => {
      const L = latest.current;
      if (e.target instanceof HTMLInputElement) return;
      if (down && (e.code === "KeyM" || e.key === "m")) {
        writeSave((s) => (s.settings.muted = !s.settings.muted));
        return;
      }
      if (L.screen !== "play") return;
      if (down && (e.code === "Escape" || e.code === "KeyP")) {
        setOverlay((o) => (o === "pause" ? null : o === null ? "pause" : o));
        return;
      }
      // Key releases always reach the world, so nothing stays held after a pause.
      if (L.overlay && down) return;
      if (down && e.code === "Enter" && L.phase === "entry") world.current?.skip();
      if (world.current?.key(e.code, down)) e.preventDefault();
    };
    const dn = on(true);
    const up = on(false);
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", dn);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // ---------- debug hooks for tests ----------
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("debug-game")) return;
    (window as unknown as Record<string, unknown>).__touchdown = {
      world: () => world.current,
      audio: () => audio.current,
      state: () => ({ ...latest.current, save: undefined }),
      start: (slug: string) => {
        ensureAudio();
        const s = sites.find((x) => x.slug === slug);
        if (!s) return;
        setBody(s.body);
        setSel(slug);
        setPanel(null);
        setScreen("play");
      },
    };
  }, [ensureAudio, sites]);

  // ---------- actions ----------
  const begin = () => {
    ensureAudio();
    sfx("confirm");
    if (!save.prologue) {
      setScreen("prologue");
      setTimeout(() => bigRadio.current?.say(PROLOGUE, { hold: 1500 }), 900);
    } else setScreen("orbit");
  };
  const endPrologue = () => {
    bigRadio.current?.clear();
    writeSave((s) => (s.prologue = true));
    setScreen("orbit");
    setTimeout(() => radio.current?.say(found.length ? "Welcome back. Pick a signal." : "Start anywhere. The beacons mark where they rest."), 600);
  };
  const endFinale = () => {
    bigRadio.current?.clear();
    writeSave((s) => (s.finale = true));
    setFinale(false);
    setOverlay("credits");
  };
  const pick = (slug: string) => {
    sfx("click");
    const s = sites.find((x) => x.slug === slug);
    if (s && s.body !== body) setBody(s.body);
    setSel(slug);
    setScreen("brief");
  };
  useEffect(() => {
    if (screen !== "brief" || !sel) return;
    const lines = BRIEF[sel] ?? [];
    const s = sites.find((x) => x.slug === sel);
    const cond = s?.body === "mars" ? "Gravity 3.71 metres per second squared. Expect gusts. Under 2.5 metres per second is a gentle landing." : "Gravity 1.62. No air, no wind. Under 2.5 metres per second is a gentle landing.";
    const id = setTimeout(() => radio.current?.say([...lines, cond].map((text): Line => ({ who: "ground", text })), { clear: true, hold: 1600 }), 500);
    return () => clearTimeout(id);
  }, [screen, sel, sites]);

  const descend = async () => {
    if (!sel) return;
    ensureAudio();
    sfx("confirm");
    radio.current?.clear();
    setScreen("dive");
    setProgress("");
    await globe.current?.dive(sel);
    setFade(true);
    setTimeout(() => {
      setPanel(null);
      setLanding(null);
      setPhase(null);
      setScreen("play");
      setTimeout(() => setFade(false), 400);
    }, 450);
  };
  const toOrbit = (slug: string | null = sel) => {
    sfx("back");
    radio.current?.clear();
    setOverlay(null);
    setPanel(null);
    setEchoCard(null);
    setPhase(null);
    if (save.sites && totals(latest.current.save).found >= sites.length && !latest.current.save.finale) {
      setScreen("orbit");
      setFinale(true);
      setTimeout(() => bigRadio.current?.say(FINALE, { hold: 1700 }), 1200);
      return;
    }
    if (slug) {
      const s = sites.find((x) => x.slug === slug);
      if (s) setBody(s.body);
      setSel(slug);
      setScreen("brief");
    } else setScreen("orbit");
  };
  const retry = (computer = false) => {
    sfx("confirm");
    if (computer) writeSave((s) => (s.settings.pilot = false));
    setPanel(null);
    setLanding(null);
    world.current?.setOptions({ pilot: computer ? false : settings.pilot });
    world.current?.restart();
  };
  const deploy = () => {
    sfx("confirm");
    setPanel(null);
    world.current?.deploy();
  };
  const lookAround = () => {
    sfx("click");
    setPanel(null);
    world.current?.resume();
  };
  const leaveLight = () => {
    if (!site) return;
    world.current?.placeLight();
    sfx("light");
    writeSave((s) => {
      (s.sites[site.slug] ??= { echoes: [] }).light = true;
    });
    radio.current?.say("We'll see it from orbit.");
  };
  const postcard = async () => {
    const w = world.current;
    if (!w || !site) return;
    sfx("shutter");
    const img = new window.Image();
    img.src = w.photo();
    await img.decode();
    const W = 1600;
    const H = Math.round((W * img.height) / img.width);
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d")!;
    ctx.drawImage(img, 0, 0, W, H);
    const g = ctx.createLinearGradient(0, H * 0.55, 0, H);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.75)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const probe = document.querySelector(".display");
    const display = probe ? getComputedStyle(probe).fontFamily : "system-ui, sans-serif";
    const mono = getComputedStyle(document.body).getPropertyValue("--font-plex-mono") || "monospace";
    ctx.fillStyle = "#fff";
    ctx.font = `500 ${Math.round(W / 22)}px ${display}`;
    ctx.fillText(site.name, 64, H - 128);
    ctx.font = `400 ${Math.round(W / 60)}px ${mono}, monospace`;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(`${site.restingPlace} · ${site.endLabel} ${site.endDate}`, 66, H - 78);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = `400 ${Math.round(W / 85)}px ${mono}, monospace`;
    ctx.fillText("Visited in Touchdown · Rover Villa · game render, not a photograph", 66, H - 44);
    cv.toBlob(
      (b) => {
        if (!b) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = `touchdown-${site.slug}.jpg`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      },
      "image/jpeg",
      0.92,
    );
  };
  const setSettings = (p: Partial<Settings>) => writeSave((s) => Object.assign(s.settings, p));
  const toggleFs = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else root.current?.requestFullscreen?.().catch(() => {});
  };
  const sendTouch = (p: Partial<typeof touch.current>) => {
    Object.assign(touch.current, p);
    world.current?.touch(touch.current);
  };

  const inOrbit = screen === "orbit" || screen === "brief";
  const descentUi = playing && (phase === "entry" || phase === "descent");
  const driveUi = playing && phase === "drive";
  const ss = site ? siteSave(save, site.slug) : null;
  const mars = (site?.body ?? body) === "mars";

  return (
    <div ref={root} className={`relative overflow-hidden bg-[#04030c] text-white select-none ${fs ? "h-screen" : "h-[calc(100svh-64px)] lg:h-[calc(100svh-76px)]"}`}>
      {/* Globe */}
      {globeOn && (
        <div ref={stage} className="absolute inset-0" key={`globe-${body}`}>
          {inOrbit &&
            worldSites.map((s) => (
              <button
                key={s.slug}
                ref={(b) => {
                  if (b) labels.current.set(s.slug, b);
                  else labels.current.delete(s.slug);
                }}
                onClick={() => pick(s.slug)}
                onMouseEnter={() => sfx("hover")}
                className={`absolute top-0 left-0 z-10 -mt-9 ml-3 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ring-1 backdrop-blur transition-opacity ${
                  sel === s.slug && screen === "brief" ? "bg-white text-black ring-white" : "bg-black/55 ring-white/10 hover:bg-brand"
                }`}
                style={{ opacity: 0 }}
              >
                {save.sites[s.slug]?.found && <span className={`mr-1 ${save.sites[s.slug]?.light ? "text-amber-300" : "text-emerald-300"}`}>●</span>}
                {s.name}
              </button>
            ))}
        </div>
      )}

      {/* World */}
      {playing && <div ref={worldHost} className="absolute inset-0" key={`world-${sel}-${worldKey}`} />}

      {/* Dive fade */}
      <div className={`pointer-events-none absolute inset-0 z-30 bg-black transition-opacity duration-500 ${fade || screen === "dive" ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: screen === "dive" && !fade ? "700ms" : "0ms" }} />
      {(screen === "dive" || (playing && !phase)) && (
        <p className="absolute inset-x-0 top-1/2 z-30 text-center font-mono text-xs tracking-[0.2em] text-white/70 uppercase">
          {site ? `Entering ${site.body === "mars" ? "Mars" : "lunar"} orbit` : ""}
          <span className="mt-2 block text-white/40 normal-case">{progress}</span>
        </p>
      )}

      {/* ---------- title ---------- */}
      {screen === "title" && (
        <div className="absolute inset-0 z-20 flex items-center bg-[linear-gradient(90deg,rgba(4,3,12,0.92)_0%,rgba(4,3,12,0.55)_50%,rgba(4,3,12,0.1)_100%)]">
          <div className="tls-fade-in max-w-xl px-6 sm:px-14">
            <Image src="/images/icon-touchdown.webp" alt="" width={96} height={96} priority className="mb-5 h-20 w-20 rounded-[22%] shadow-[0_10px_40px_rgba(18,56,255,0.5)] ring-1 ring-white/15 sm:h-24 sm:w-24" />
            <p className="font-mono text-xs tracking-[0.24em] text-white/60 uppercase">Rover Villa · a game</p>
            <h2 className="display mt-4 text-6xl leading-none sm:text-8xl">Touchdown</h2>
            <p className="mt-5 text-lg leading-relaxed text-white/80 sm:text-xl">A pilgrimage to the machines we left on Mars and the Moon. Fly each landing yourself, then drive to where they rest.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={begin} className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-4 text-base font-semibold shadow-[0_0_40px_rgba(18,56,255,0.5)] hover:bg-brand-deep">
                {t.found ? `Continue · ${t.found}/${sites.length}` : "Begin"} <ArrowRight />
              </button>
              {save.prologue && (
                <button
                  type="button"
                  onClick={() => {
                    ensureAudio();
                    sfx("click");
                    setScreen("prologue");
                    setTimeout(() => bigRadio.current?.say(PROLOGUE, { hold: 1500 }), 700);
                  }}
                  className="rounded-full bg-white/10 px-6 py-4 text-base font-semibold ring-1 ring-white/15 hover:bg-white/20"
                >
                  Prologue
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  ensureAudio();
                  sfx("click");
                  setOverlay("journal");
                }}
                className="rounded-full bg-white/10 px-6 py-4 text-base font-semibold ring-1 ring-white/15 hover:bg-white/20"
              >
                Journal
              </button>
            </div>
            <p className="mt-10 max-w-md font-mono text-[11px] leading-relaxed text-white/50">
              Best with headphones. Music and sound are made live in your browser. The places, dates and machines are real; the story around them is fiction.
            </p>
          </div>
        </div>
      )}

      {/* ---------- prologue / finale ---------- */}
      {(screen === "prologue" || finale) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/65 px-6">
          <div className="w-full max-w-2xl">
            <Radio
              ref={bigRadio}
              audio={getAudio}
              big
              onIdle={() => {
                if (finale) setTimeout(endFinale, 1800);
                else setTimeout(endPrologue, 1800);
              }}
            />
          </div>
          <button type="button" onClick={finale ? endFinale : endPrologue} className="absolute right-5 bottom-5 rounded-full bg-white/10 px-5 py-2.5 font-mono text-xs tracking-[0.14em] uppercase hover:bg-white/20">
            Skip
          </button>
        </div>
      )}

      {/* ---------- top bar ---------- */}
      {screen !== "title" && screen !== "prologue" && !finale && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3 sm:p-5">
          <div className="pointer-events-auto min-w-0">
            <p className="font-mono text-[11px] tracking-[0.18em] text-white/60 uppercase">
              Touchdown · {mars ? "Mars" : "Moon"}
            </p>
            <p className="display truncate text-2xl sm:text-3xl">
              {inOrbit || screen === "dive"
                ? screen === "brief" && site
                  ? site.name
                  : "Choose a signal"
                : phase === "entry" || phase === "descent"
                  ? `Landing at ${site?.restingPlace.split(",")[0]}`
                  : phase === "drive" || phase === "deploy"
                    ? `Find ${site?.name}`
                    : site?.name}
            </p>
            {inOrbit && (
              <p className="mt-1 font-mono text-[11px] text-white/65">
                {t.found}/{sites.length} heard <span className="ml-2 text-amber-200">★ {t.stars}/{sites.length * 3}</span>
              </p>
            )}
            {inOrbit && (
              <div className="mt-3 inline-flex rounded-full bg-black/40 p-1 ring-1 ring-white/10 backdrop-blur">
                {(["mars", "moon"] as const).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      sfx("click");
                      setBody(b);
                      setSel(null);
                      setScreen("orbit");
                    }}
                    aria-pressed={body === b}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold ${body === b ? "bg-brand" : "hover:bg-white/10"}`}
                  >
                    {b === "mars" ? "Mars" : "Moon"}
                  </button>
                ))}
              </div>
            )}
            {screen === "orbit" && nextSite && (
              <div>
                <button type="button" onClick={() => pick(nextSite.slug)} className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold shadow-[0_0_30px_rgba(18,56,255,0.45)] hover:bg-brand-deep">
                  {t.found ? "Next signal" : "Start with"}: {nextSite.name}
                  {nextSite.body !== body && <span className="font-mono text-[10px] text-white/70">({nextSite.body === "mars" ? "Mars" : "Moon"})</span>}
                  <ArrowRight />
                </button>
              </div>
            )}
          </div>
          <div className="pointer-events-auto flex shrink-0 gap-2">
            {playing && (phase === "descent" || phase === "drive") && (
              <IconButton label="Switch camera (C)" onClick={() => world.current?.toggleCamera()}>
                {Icon.view}
              </IconButton>
            )}
            {inOrbit && (
              <IconButton label="Journal" onClick={() => (sfx("click"), setOverlay("journal"))}>
                {Icon.book}
              </IconButton>
            )}
            <IconButton label={settings.muted ? "Sound on (M)" : "Mute (M)"} onClick={() => (ensureAudio(), setSettings({ muted: !settings.muted }))}>
              {Icon.sound(!settings.muted)}
            </IconButton>
            {playing ? (
              <IconButton label="Pause (P)" onClick={() => setOverlay("pause")}>
                {Icon.pause}
              </IconButton>
            ) : (
              <IconButton label="Settings" onClick={() => (sfx("click"), setOverlay("settings"))}>
                {Icon.gear}
              </IconButton>
            )}
            <span className="hidden sm:block">
              <IconButton label={fs ? "Exit full screen" : "Full screen"} onClick={toggleFs}>
                {Icon.full}
              </IconButton>
            </span>
          </div>
        </div>
      )}

      {/* ---------- orbit ---------- */}
      {screen === "orbit" && !finale && (
        <div className="absolute inset-x-0 bottom-0 z-20 p-3 sm:p-5">
          <ul className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {worldSites.map((s) => {
              const x = siteSave(save, s.slug);
              return (
                <li key={s.slug}>
                  <button type="button" onClick={() => pick(s.slug)} onMouseEnter={() => sfx("hover")} className="flex items-center gap-2 rounded-full bg-black/45 px-4 py-2 text-sm font-semibold whitespace-nowrap ring-1 ring-white/10 backdrop-blur hover:bg-brand">
                    {s.name}
                    {x.found ? <Stars have={stars(x)} size="sm" /> : <span className="h-1.5 w-1.5 rounded-full bg-brand-bright" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ---------- brief ---------- */}
      {screen === "brief" && site && ss && (
        <div className="absolute inset-x-0 bottom-0 z-20 p-3 sm:inset-y-0 sm:right-0 sm:left-auto sm:flex sm:w-110 sm:items-center sm:p-6">
          <div className="tls-fade-in w-full rounded-3xl bg-[#0b0a1d]/85 p-5 ring-1 ring-white/10 backdrop-blur-md sm:p-6">
            <div className="flex gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-black sm:h-24 sm:w-24">
                <Image src={site.photo.src} alt={site.photo.alt} fill sizes="96px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[11px] text-white/60">
                  {site.restingPlace}
                  {site.approx ? " (approximate)" : ""}
                </p>
                <h2 className="display mt-0.5 text-3xl leading-tight">{site.name}</h2>
                <p className="mt-1 font-mono text-[11px] text-white/60">
                  {site.lat.toFixed(2)}°, {site.lon.toFixed(2)}°
                </p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="rounded-xl bg-white/5 p-2.5">
                <dt className="text-white/50">{site.arrived.split(" ")[0]}</dt>
                <dd className="mt-0.5 text-white/90">{site.arrived.split(" ").slice(1).join(" ")}</dd>
              </div>
              <div className="rounded-xl bg-white/5 p-2.5">
                <dt className="text-white/50">{site.endLabel}</dt>
                <dd className="mt-0.5 text-white/90">{site.endDate}</dd>
              </div>
              <div className="rounded-xl bg-white/5 p-2.5">
                <dt className="text-white/50">Gravity</dt>
                <dd className="mt-0.5 text-white/90">{site.body === "mars" ? "3.71 m/s²" : "1.62 m/s²"}</dd>
              </div>
              <div className="rounded-xl bg-white/5 p-2.5">
                <dt className="text-white/50">Conditions</dt>
                <dd className="mt-0.5 text-white/90">{site.slug === "lcross" ? "No sunlight" : site.body === "mars" ? "Gusty wind" : "No air, no wind"}</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-center justify-between">
              <Stars have={stars(ss)} />
              <span className="font-mono text-[11px] text-white/55">{ss.found ? `${ss.echoes.length}/3 echoes · visited` : "Not visited yet"}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              {site.mode === "crater"
                ? "It was flown into the surface on purpose. You'll find its impact site, with a ghost of the spacecraft over it."
                : site.mode === "lost"
                  ? "It was never heard from after arrival. You'll reach the area where it was meant to land."
                  : "Land in the blue ring, then drive the rover to it."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={descend} className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold shadow-[0_0_30px_rgba(18,56,255,0.45)] hover:bg-brand-deep">
                Begin descent <ArrowRight />
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx("back");
                  radio.current?.clear();
                  setScreen("orbit");
                }}
                className="rounded-full bg-white/10 px-5 py-3.5 text-sm font-semibold hover:bg-white/20"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- radio ---------- */}
      <div
        className={`pointer-events-auto absolute z-30 ${
          screen === "brief"
            ? "top-24 right-3 left-3 sm:top-auto sm:right-auto sm:bottom-6 sm:left-6"
            : !playing
              ? "right-3 bottom-20 left-3 sm:right-auto sm:left-5"
              : coarse && descentUi
                ? "top-24 right-50 left-3"
                : coarse && driveUi
                  ? "right-3 bottom-44 left-3"
                : "right-3 bottom-28 left-3 sm:right-auto sm:bottom-6 sm:left-6"
        } ${screen === "title" || screen === "prologue" || finale ? "hidden" : ""}`}
      >
        <Radio ref={radio} audio={getAudio} />
      </div>

      {/* ---------- descent ---------- */}
      {descentUi && site && (
        <>
          <div className={`absolute z-20 ${coarse ? "top-20 right-3" : "top-24 right-5"}`}>
            <DescentHud ref={hud} mars={site.body === "mars"} compact={coarse} />
          </div>
          {phase === "entry" && (
            <button type="button" onClick={() => world.current?.skip()} className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 translate-y-24 rounded-full bg-black/40 px-5 py-2 font-mono text-xs tracking-[0.14em] uppercase ring-1 ring-white/15 backdrop-blur hover:bg-white/15">
              Skip ›
            </button>
          )}
          <p ref={hint} className="display pointer-events-none absolute bottom-[26%] left-1/2 z-20 w-[min(88vw,640px)] -translate-x-1/2 text-center text-2xl leading-tight font-bold tracking-wide text-amber-300 transition-opacity duration-300 sm:text-4xl" style={{ opacity: 0, textShadow: "0 4px 24px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,1)" }} />
          {coarse && phase === "descent" && (
            <>
              <div className="absolute bottom-6 left-5 z-20">
                <Joystick label="Drift" onChange={(x, y) => sendTouch({ x, y })} />
              </div>
              <div className="absolute right-5 bottom-6 z-20">
                <HoldButton onChange={(d) => sendTouch({ thrust: d ? 1 : 0 })} className="h-28 w-28">
                  Engine
                </HoldButton>
              </div>
            </>
          )}
          {!coarse && phase === "descent" && (
            <p className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 font-mono text-[11px] tracking-[0.12em] text-white/45 uppercase lg:block">
              Space engine · WASD drift · C camera · P pause
            </p>
          )}
        </>
      )}
      {callout && descentUi && (
        <p key={callout.key} className="tls-callout pointer-events-none absolute top-24 left-1/2 z-20 -translate-x-1/2 font-mono text-sm tracking-[0.18em] text-cyan-100 uppercase sm:top-28">
          {callout.text}
        </p>
      )}

      {/* ---------- drive ---------- */}
      {driveUi && site && (
        <>
          <div className="absolute top-20 left-1/2 z-20 -translate-x-1/2 sm:top-6">
            <Compass ref={compass} name={site.name} />
          </div>
          {coarse ? (
            <>
              <div className="absolute bottom-6 left-5 z-20">
                <Joystick label="Drive" onChange={(x, y) => sendTouch({ x, y })} />
              </div>
              <div className="absolute right-5 bottom-8 z-20">
                <HoldButton onChange={(d) => sendTouch({ brake: d })} className="h-20 w-20">
                  Brake
                </HoldButton>
              </div>
            </>
          ) : (
            <p className="pointer-events-none absolute right-6 bottom-6 z-10 font-mono text-[11px] tracking-[0.12em] text-white/45 uppercase">WASD drive · Space brake · drag to look · C camera</p>
          )}
        </>
      )}
      {echoCard && site && site.echoes[echoCard.i] && (
        <button
          type="button"
          key={echoCard.key}
          onClick={() => setEchoCard(null)}
          onAnimationEnd={(e) => e.animationName === "tls-card-life" && setEchoCard(null)}
          className="tls-card absolute top-40 right-3 left-3 z-30 rounded-2xl bg-[#071c24]/85 p-4 text-left ring-1 ring-cyan-300/30 backdrop-blur-md sm:top-28 sm:right-6 sm:left-auto sm:w-80"
        >
          <p className="font-mono text-[10px] tracking-[0.16em] text-cyan-200/80 uppercase">
            Echo {echoCard.i + 1} of 3 · from the mission record
          </p>
          <p className="mt-2 font-mono text-sm text-cyan-100">{site.echoes[echoCard.i].date}</p>
          <p className="mt-1 text-[15px] leading-relaxed">{site.echoes[echoCard.i].text}</p>
        </button>
      )}

      {/* ---------- landed / crashed ---------- */}
      {playing && landing && (panel === "landed" || panel === "crashed") && site && (
        <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center p-3 sm:bottom-6">
          <div className="tls-fade-in w-full max-w-lg rounded-3xl bg-[#0b0a1d]/90 p-6 ring-1 ring-white/10 backdrop-blur-md">
            {landing.ok ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`font-mono text-[11px] tracking-[0.18em] uppercase ${landing.grade === "hard" ? "text-amber-300" : "text-emerald-300"}`}>{landing.grade === "hard" ? "Hard landing" : "Touchdown"}</p>
                    <h2 className="display mt-1 text-3xl">{landing.grade === "feather" ? "Feather-light." : landing.grade === "smooth" ? "Gentle landing." : landing.grade === "firm" ? "Down, a bit firm." : "Down in one piece."}</h2>
                  </div>
                  <Stars have={[landing.grade === "feather" || landing.grade === "smooth", landing.offset <= ZONE, false]} size="lg" animate />
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2 font-mono text-[11px]">
                  <Stat k="Down" v={`${landing.vy.toFixed(1)} m/s`} />
                  <Stat k="From ring" v={`${landing.offset.toFixed(0)} m`} good={landing.offset <= ZONE} />
                  <Stat k="Fuel left" v={`${landing.fuel.toFixed(0)}`} />
                </dl>
                <p className="mt-3 text-sm text-white/65">
                  {landing.note ? `${landing.note} ` : ""}
                  {landing.grade === "feather" || landing.grade === "smooth" ? "Star for a gentle landing. " : `Under 2.5 m/s earns the gentle-landing star. `}
                  {landing.offset <= ZONE ? "Right in the ring." : "Outside the ring: a longer drive."} The third star is for all three echoes.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" onClick={deploy} className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold hover:bg-brand-deep">
                    Deploy the rover <ArrowRight />
                  </button>
                  <button type="button" onClick={() => retry()} className="rounded-full bg-white/10 px-5 py-3.5 text-sm font-semibold hover:bg-white/20">
                    Land again
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="font-mono text-[11px] tracking-[0.18em] text-rose-300 uppercase">Signal lost</p>
                <h2 className="display mt-1 text-3xl">That one didn&apos;t make it.</h2>
                <p className="mt-2 text-[15px] text-white/75">{landing.reason}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" onClick={() => retry()} className="rounded-full bg-brand px-6 py-3.5 text-sm font-semibold hover:bg-brand-deep">
                    Try again
                  </button>
                  {settings.pilot && (save.crashes[site.slug] ?? 0) >= 2 && (
                    <button type="button" onClick={() => retry(true)} className="rounded-full bg-amber-400 px-5 py-3.5 text-sm font-semibold text-black hover:bg-amber-300">
                      Turn the flight computer on
                    </button>
                  )}
                  <button type="button" onClick={() => toOrbit()} className="rounded-full bg-white/10 px-5 py-3.5 text-sm font-semibold hover:bg-white/20">
                    Back to orbit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ---------- found ---------- */}
      {playing && panel === "found" && site && ss && (
        <div className="absolute inset-x-0 bottom-0 z-30 p-3 sm:bottom-6 sm:left-6 sm:right-auto sm:w-140 sm:p-0">
          <div className="tls-fade-in max-h-[70svh] overflow-y-auto rounded-3xl bg-[#0b0a1d]/88 p-5 ring-1 ring-white/10 backdrop-blur-md sm:p-6">
            <div className="flex gap-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-black sm:h-32 sm:w-32">
                <Image src={site.photo.src} alt={site.photo.alt} fill sizes="128px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[11px] tracking-[0.16em] text-emerald-300 uppercase">
                  {site.mode === "machine" ? "You found it" : site.mode === "crater" ? "You found its impact site" : "You reached the search area"}
                  {newFind && <span className="ml-2 text-amber-200">· new</span>}
                </p>
                <h2 className="display mt-1 text-3xl leading-tight">{site.name}</h2>
                <p className="mt-1 font-mono text-[11px] text-white/60">{site.restingPlace}</p>
                <div className="mt-2">
                  <Stars have={stars(ss)} animate={newFind} />
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-white/4 p-4 ring-1 ring-white/10">
              <p className="font-mono text-[11px] tracking-[0.16em] text-rose-200/90 uppercase">
                {site.endLabel} · {site.endDate}
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-white/90">{site.story}</p>
            </div>
            {!site.photo.ai && (
              <a href={site.photo.source} target="_blank" rel="noopener noreferrer" className="mt-2 block font-mono text-[10px] text-white/45 hover:text-white">
                Photo: {site.photo.credit}
              </a>
            )}
            <p className="mt-3 font-mono text-[11px] text-white/55">{ss.echoes.length < 3 ? `${ss.echoes.length} of 3 echoes picked up. Look around to find the rest.` : "All three echoes picked up."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {nextSite ? (
                <button type="button" onClick={() => toOrbit(nextSite.slug)} className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold hover:bg-brand-deep">
                  Next: {nextSite.name} <ArrowRight />
                </button>
              ) : (
                <button type="button" onClick={() => toOrbit(null)} className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold hover:bg-brand-deep">
                  Back to orbit <ArrowRight />
                </button>
              )}
              {!ss.light && (
                <button type="button" onClick={leaveLight} className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-black hover:bg-amber-200">
                  Leave a light
                </button>
              )}
              <button type="button" onClick={lookAround} className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/20">
                Look around
              </button>
              <button type="button" onClick={postcard} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/20">
                {Icon.camera} Postcard
              </button>
              <Link href={`/heroes/${site.slug}`} className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/20">
                Its page
              </Link>
            </div>
          </div>
        </div>
      )}
      {playing && phase === "drive" && ss?.found && panel === null && (
        <button type="button" onClick={() => setPanel("found")} className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/50 px-5 py-2.5 text-sm font-semibold ring-1 ring-white/15 backdrop-blur hover:bg-white/15 max-sm:bottom-40">
          {site?.name} card
        </button>
      )}

      {/* ---------- overlays ---------- */}
      {overlay === "pause" && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="tls-fade-in w-full max-w-xs space-y-2 p-6 text-center">
            <p className="display mb-4 text-4xl">Paused</p>
            <MenuButton primary onClick={() => setOverlay(null)}>
              Resume
            </MenuButton>
            {(phase === "descent" || phase === "entry") && (
              <MenuButton
                onClick={() => {
                  setOverlay(null);
                  retry();
                }}
              >
                Restart landing
              </MenuButton>
            )}
            <MenuButton onClick={() => setOverlay("settings")}>Settings</MenuButton>
            <MenuButton onClick={() => toOrbit()}>Back to orbit</MenuButton>
            <MenuButton
              onClick={() => {
                toOrbit(null);
                setScreen("title");
              }}
            >
              Title screen
            </MenuButton>
          </div>
        </div>
      )}
      {overlay === "settings" && (
        <SettingsSheet
          settings={settings}
          onChange={(p) => {
            setSettings(p);
            if (p.quality && playing) setWorldKey((k) => k + 1);
          }}
          onClose={() => setOverlay(playing ? "pause" : null)}
        />
      )}
      {overlay === "journal" && (
        <Journal
          sites={sites}
          save={save}
          onClose={() => setOverlay(null)}
          onGo={(slug) => {
            setOverlay(null);
            if (screen === "title") ensureAudio();
            pick(slug);
          }}
        />
      )}
      {overlay === "credits" && <Credits sites={sites} save={save} onClose={() => setOverlay(null)} />}

      <p className="pointer-events-none absolute right-3 bottom-1 z-10 hidden font-mono text-[10px] text-white/35 sm:block">
        {inOrbit ? "Maps: NASA 3D Resources (Mars), USGS/LRO (Moon). " : ""}Places and dates are real; the lander, the flights and Ground are fiction.
      </p>
    </div>
  );
}

function Stat({ k, v, good }: { k: string; v: string; good?: boolean }) {
  return (
    <div className="rounded-xl bg-white/5 p-2.5">
      <dt className="text-white/50">{k}</dt>
      <dd className={`mt-0.5 text-sm ${good === undefined ? "text-white" : good ? "text-cyan-200" : "text-amber-200"}`}>{v}</dd>
    </div>
  );
}

function MenuButton({ children, onClick, primary = false }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`block w-full rounded-full px-6 py-3.5 text-sm font-semibold ${primary ? "bg-brand hover:bg-brand-deep" : "bg-white/10 hover:bg-white/20"}`}>
      {children}
    </button>
  );
}
