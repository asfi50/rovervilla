"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Body } from "@/lib/heroes";

export type GlobeSite = { id: string; name: string; lat: number; lon: number };

type Props = {
  body: Body;
  sites: GlobeSite[];
  selected?: string;
  onSelect?: (id: string) => void;
  /** Drag to spin, click pins. Off for decorative globes. */
  interactive?: boolean;
  autoRotate?: boolean;
  labels?: "all" | "selected" | "none";
  pin?: "md" | "sm";
  /** Where the globe faces before anything is selected. */
  start?: { lat: number; lon: number };
  className?: string;
};

const DEG = Math.PI / 180;

/** Yaw/pitch that bring a lat/lon to the centre of the view (see the vector maths in `toVec`). */
const facing = (lat: number, lon: number) => ({ yaw: -Math.PI / 2 - lon * DEG, pitch: lat * DEG });

/**
 * A real Mars or Moon globe: USGS/NASA surface maps on a three.js sphere with HTML pins at
 * true landing coordinates. three.js and the texture load only when the globe nears the
 * viewport; until then (or without WebGL) the static planet image is shown.
 */
export default function Globe({
  body,
  sites,
  selected,
  onSelect,
  interactive = true,
  autoRotate = false,
  labels = "all",
  pin = "md",
  start,
  className = "",
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const pinRefs = useRef(new Map<string, HTMLElement>());
  const target = useRef<{ yaw: number; pitch: number } | null>(null);
  const sitesRef = useRef(sites);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    sitesRef.current = sites;
  }, [sites]);

  // Fly to the selected site.
  useEffect(() => {
    const s = sites.find((x) => x.id === selected);
    if (s) target.current = facing(s.lat, s.lon);
  }, [selected, sites]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    const boot = async () => {
      const THREE = await import("three");
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      } catch {
        return; // No WebGL: keep the static image.
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      const canvas = renderer.domElement;
      canvas.className = "absolute inset-0 h-full w-full";
      canvas.style.touchAction = interactive ? "pan-y" : "auto";
      el.prepend(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, 0, 1 / Math.sin(15 * DEG) * 1.04);

      const size = el.clientWidth < 520 ? 1024 : 2048;
      const texture = await new THREE.TextureLoader().loadAsync(`/textures/${body}-${size}.jpg`);
      if (disposed) {
        texture.dispose();
        renderer.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const geometry = new THREE.SphereGeometry(1, 96, 64);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 1,
        metalness: 0,
        // The Viking mosaic is muted; warm it slightly towards how Mars reads to the eye.
        color: body === "mars" ? new THREE.Color(1.12, 0.98, 0.88) : new THREE.Color(1, 1, 1),
      });
      const globe = new THREE.Mesh(geometry, material);
      globe.rotation.order = "XYZ";
      scene.add(globe);
      scene.add(new THREE.AmbientLight(0xffffff, body === "moon" ? 1.3 : 1.6));
      const sun = new THREE.DirectionalLight(0xffffff, 1.9);
      sun.position.set(-2.5, 1.8, 4);
      scene.add(sun);

      const first = sitesRef.current.find((s) => s.id === selected);
      const view = { ...(first ? facing(first.lat, first.lon) : facing(start?.lat ?? 10, start?.lon ?? 0)) };
      const vel = { yaw: 0, pitch: 0 };

      const resize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      // Drag to spin, with a little inertia.
      let drag: { x: number; y: number } | null = null;
      const down = (e: PointerEvent) => {
        if (!interactive) return;
        drag = { x: e.clientX, y: e.clientY };
        target.current = null;
        canvas.setPointerCapture(e.pointerId);
      };
      const move = (e: PointerEvent) => {
        if (!drag) return;
        const k = 3.2 / el.clientWidth;
        vel.yaw = (e.clientX - drag.x) * k;
        vel.pitch = (e.clientY - drag.y) * k;
        view.yaw += vel.yaw;
        view.pitch = Math.max(-1.3, Math.min(1.3, view.pitch + vel.pitch));
        drag = { x: e.clientX, y: e.clientY };
      };
      const up = () => (drag = null);
      canvas.addEventListener("pointerdown", down);
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);

      const v = new THREE.Vector3();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let raf = 0;
      let visible = true;

      const frame = () => {
        raf = 0;
        if (!visible || document.hidden) return;

        if (target.current) {
          // Shortest way round, eased.
          let dy = target.current.yaw - view.yaw;
          dy = Math.atan2(Math.sin(dy), Math.cos(dy));
          const dp = target.current.pitch - view.pitch;
          const ease = reduced ? 1 : 0.08;
          view.yaw += dy * ease;
          view.pitch += dp * ease;
          if (Math.abs(dy) < 1e-4 && Math.abs(dp) < 1e-4) target.current = null;
        } else if (!drag) {
          view.yaw += vel.yaw;
          view.pitch = Math.max(-1.3, Math.min(1.3, view.pitch + vel.pitch));
          vel.yaw *= 0.92;
          vel.pitch *= 0.92;
          if (autoRotate && !reduced) view.yaw += 0.0012;
        }
        globe.rotation.set(view.pitch, view.yaw, 0);
        globe.updateMatrixWorld();
        renderer.render(scene, camera);

        // Place pins: lat/lon on the unit sphere, rotated with the globe, projected to the canvas.
        const w = el.clientWidth;
        const h = el.clientHeight;
        for (const s of sitesRef.current) {
          const node = pinRefs.current.get(s.id);
          if (!node) continue;
          const lat = s.lat * DEG;
          const lon = s.lon * DEG;
          v.set(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon)).applyMatrix4(globe.matrixWorld);
          const front = v.z; // camera looks down -z from +z
          v.project(camera);
          const x = (v.x * 0.5 + 0.5) * w;
          const y = (-v.y * 0.5 + 0.5) * h;
          const alpha = Math.max(0, Math.min(1, (front - 0.05) / 0.25));
          node.style.transform = `translate(${x}px, ${y}px)`;
          node.style.opacity = String(alpha);
          node.style.pointerEvents = alpha > 0.5 ? "auto" : "none";
          node.style.zIndex = String(Math.round(front * 100) + 100);
        }
        raf = requestAnimationFrame(frame);
      };

      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(frame);
      });
      io.observe(el);
      const onVis = () => !document.hidden && !raf && (raf = requestAnimationFrame(frame));
      document.addEventListener("visibilitychange", onVis);

      raf = requestAnimationFrame(frame);
      setReady(true);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        canvas.removeEventListener("pointerdown", down);
        canvas.removeEventListener("pointermove", move);
        canvas.removeEventListener("pointerup", up);
        canvas.removeEventListener("pointercancel", up);
        geometry.dispose();
        material.dispose();
        texture.dispose();
        renderer.dispose();
        canvas.remove();
      };
    };

    // Only fetch three.js and the texture once the globe is close to the viewport.
    const lazy = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        lazy.disconnect();
        boot();
      },
      { rootMargin: "300px" },
    );
    lazy.observe(el);

    return () => {
      disposed = true;
      lazy.disconnect();
      cleanup();
      setReady(false);
    };
    // Rebuild only when the world changes; selection and sites flow through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body, interactive, autoRotate]);

  const dot = pin === "md" ? "h-6 w-6 sm:h-7 sm:w-7" : "h-3.5 w-3.5";

  return (
    <div ref={wrap} className={`relative aspect-square select-none ${interactive ? "cursor-grab active:cursor-grabbing" : ""} ${className}`}>
      {/* Static stand-in until the real globe is ready. */}
      <div className={`pointer-events-none absolute inset-[2%] overflow-hidden rounded-full transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`} aria-hidden>
        <Image src={`/images/${body}-globe.jpg`} alt="" fill sizes="(min-width:1024px) 640px, 90vw" className="scale-[1.05] object-cover mix-blend-multiply" />
      </div>

      <div className="pointer-events-none absolute inset-0" aria-label={`Landing sites on ${body === "mars" ? "Mars" : "the Moon"}`}>
        {sites.map((s) => {
          const on = s.id === selected;
          const showLabel = labels === "all" || (labels === "selected" && on);
          return (
            <div
              key={s.id}
              ref={(node) => {
                if (node) pinRefs.current.set(s.id, node);
                else pinRefs.current.delete(s.id);
              }}
              className="absolute top-0 left-0 opacity-0 will-change-transform"
            >
              {interactive ? (
                <button
                  onClick={() => onSelect?.(s.id)}
                  onFocus={() => onSelect?.(s.id)}
                  aria-pressed={on}
                  aria-label={s.name}
                  className="group relative block"
                >
                  {on && (
                    <span className="pointer-events-none absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2" aria-hidden>
                      <span className="pulse-ring absolute -inset-6 rounded-full bg-brand/40" />
                      <span className="pulse-ring absolute -inset-6 rounded-full bg-brand/30 [animation-delay:1.2s]" />
                    </span>
                  )}
                  <span className={`absolute top-0 left-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow-lg ${dot} ${on ? "bg-brand" : "bg-brand/90"}`}>
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </span>
                  {showLabel && (
                    <span
                      className={`absolute top-0 left-5 hidden -translate-y-1/2 rounded-md px-2.5 py-1 text-sm font-medium whitespace-nowrap text-white shadow sm:block ${
                        on ? "bg-brand" : "bg-night/80 group-hover:bg-brand"
                      }`}
                    >
                      {s.name}
                    </span>
                  )}
                </button>
              ) : (
                <span className={`absolute top-0 left-0 block -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-mars shadow ${dot}`} title={s.name} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
