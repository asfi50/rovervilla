"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type * as T from "three";

export type StudioPart = {
  id: string;
  label: string;
  text?: string;
  /** NASA models: node names (or name prefixes) that make up this part. */
  nodes?: string[];
  /** NASA models without named parts: marker position as a fraction of the model's box (-0.5…0.5). */
  at?: [number, number, number];
};

export type StudioSource =
  | { kind: "glb"; src: string; title: string; credit: string; source: string; note?: string }
  | { kind: "built"; slug: string };

type Props = {
  name: string;
  model: StudioSource;
  parts: StudioPart[];
  poster: string;
  posterAlt: string;
  /** Extra files people can download (NASA 3D-print files and the like). */
  downloads?: { label: string; url: string }[];
  /** Backdrop behind the model: night sky (profiles) or a pale studio (home page). */
  stage?: "dark" | "light";
  /** Just the model and its controls, without the parts list and downloads (home page). */
  compact?: boolean;
};

type Live = {
  THREE: typeof T;
  camera: T.PerspectiveCamera;
  controls: { target: T.Vector3; update: () => void; autoRotate: boolean };
  root: T.Object3D;
  r: number;
  home: T.Vector3;
  groups: Map<string, { objs: T.Object3D[]; base: T.Vector3[]; center: T.Vector3 }>;
  markers: Map<string, T.Vector3>;
  meshes: { mesh: T.Mesh; part?: string; mats: T.Material[] }[];
};

/**
 * Interactive model with a parts explorer. NASA models load from /public/models (Draco glTF);
 * the rest are built in code (lib/models/procedural.ts). Pick a part to isolate it and fly to it,
 * pull the slider to explode the parts apart, and download the model as GLB or STL.
 */
export default function ModelStudio({ name, model, parts, poster, posterAlt, downloads = [], stage = "dark", compact = false }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const live = useRef<Live | null>(null);
  const markerEls = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [sel, setSel] = useState<string | null>(null);
  const [spin, setSpin] = useState(true);
  const [explode, setExplode] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const spinRef = useRef(true);
  const explodeRef = useRef(0);
  const selRef = useRef<string | null>(null);
  const canExplode = model.kind === "built" || parts.some((p) => p.nodes?.length);

  useEffect(() => {
    spinRef.current = spin;
  }, [spin]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};
    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setState("loading");
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          spinRef.current = false;
          setSpin(false);
        }
        try {
          const THREE = await import("three");
          const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
          const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
          if (disposed) return;

          const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false });
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          renderer.outputColorSpace = THREE.SRGBColorSpace;
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.domElement.className = "absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing";
          el.prepend(renderer.domElement);

          const scene = new THREE.Scene();
          const pmrem = new THREE.PMREMGenerator(renderer);
          scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
          const sun = new THREE.DirectionalLight(0xffffff, 1.5);
          sun.position.set(3, 5, 4);
          scene.add(sun, new THREE.HemisphereLight(0xffffff, 0x3a3358, 0.6));

          let root: T.Object3D;
          let builtIds: string[] = [];
          let draco: { dispose: () => void } | null = null;
          if (model.kind === "glb") {
            const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
            const { DRACOLoader } = await import("three/examples/jsm/loaders/DRACOLoader.js");
            const d = new DRACOLoader();
            d.setDecoderPath("/draco/");
            draco = d;
            const loader = new GLTFLoader();
            loader.setDRACOLoader(d);
            root = (await loader.loadAsync(model.src)).scene;
          } else {
            const { buildModel } = await import("@/lib/models/procedural");
            const built = buildModel(THREE, model.slug);
            if (!built) throw new Error("no model");
            root = built.root;
            builtIds = built.parts.map((p) => p.id);
          }
          if (disposed) {
            renderer.dispose();
            draco?.dispose();
            return;
          }

          // Centre and measure.
          const box = new THREE.Box3().setFromObject(root);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const pivot = new THREE.Group();
          root.position.sub(center);
          pivot.add(root);
          scene.add(pivot);
          pivot.updateMatrixWorld(true);
          const r = size.length() / 2 || 1;

          if (new URLSearchParams(window.location.search).has("debug-model")) {
            // Dev aid: where each mesh sits, as a fraction of the model's box.
            const rows: string[] = [];
            root.traverse((o) => {
              const m = o as T.Mesh;
              if (!m.isMesh) return;
              const b = new THREE.Box3().setFromObject(m);
              const c = b.getCenter(new THREE.Vector3());
              const sz = b.getSize(new THREE.Vector3());
              const mat = (Array.isArray(m.material) ? m.material : [m.material]).map((x) => x.name).join("+");
              rows.push(`${m.name}|${m.parent?.name}|${mat}|c=${(c.x / size.x).toFixed(2)},${(c.y / size.y).toFixed(2)},${(c.z / size.z).toFixed(2)}|s=${(sz.x / size.x).toFixed(2)},${(sz.y / size.y).toFixed(2)},${(sz.z / size.z).toFixed(2)}|v=${m.geometry.attributes.position.count}`);
            });
            console.log("MODEL-DEBUG size=" + size.toArray().map((x) => x.toFixed(2)).join(",") + "\n" + rows.join("\n"));
          }

          // Every mesh gets its own material copies so one part can be dimmed without touching the rest.
          const meshes: Live["meshes"] = [];
          root.traverse((o) => {
            const m = o as T.Mesh;
            if (!m.isMesh) return;
            const list = (Array.isArray(m.material) ? m.material : [m.material]).map((x) => x.clone());
            m.material = Array.isArray(m.material) ? list : list[0];
            meshes.push({ mesh: m, mats: list });
          });

          // Part groups: built models name their groups; NASA models list node names.
          const groups: Live["groups"] = new Map();
          const markers: Live["markers"] = new Map();
          for (const p of parts) {
            let objs: T.Object3D[] = [];
            if (model.kind === "built" && builtIds.includes(p.id)) {
              const g = root.getObjectByName(p.id);
              if (g) objs = [g];
            } else if (p.nodes?.length) {
              root.traverse((o) => {
                if (p.nodes!.some((n) => o.name === n || o.name.startsWith(n))) objs.push(o);
              });
              objs = objs.filter((o) => !objs.some((q) => q !== o && isAncestor(q, o)));
            }
            if (objs.length) {
              const pb = new THREE.Box3();
              objs.forEach((o) => pb.expandByObject(o));
              const c = pb.getCenter(new THREE.Vector3());
              groups.set(p.id, { objs, base: objs.map((o) => o.position.clone()), center: c });
              markers.set(p.id, c.clone());
              objs.forEach((o) =>
                o.traverse((x) => {
                  const hit = meshes.find((m) => m.mesh === x);
                  if (hit) hit.part = p.id;
                }),
              );
            } else if (p.at) {
              markers.set(p.id, new THREE.Vector3(p.at[0] * size.x, p.at[1] * size.y, p.at[2] * size.z));
            }
          }

          const camera = new THREE.PerspectiveCamera(35, 1, r / 100, r * 100);
          const home = new THREE.Vector3(r * 1.7, r * 0.9, r * 2.1);
          camera.position.copy(home);
          const controls = new OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
          controls.enablePan = false;
          controls.minDistance = r * 0.5;
          controls.maxDistance = r * 6;
          controls.autoRotateSpeed = 1.1;
          controls.update();

          const debugView = new URLSearchParams(window.location.search).get("debug-view");
          if (debugView) {
            // Dev aid: straight-on views with the bounding box drawn, for placing part markers.
            spinRef.current = false;
            const dirs: Record<string, [number, number, number]> = { front: [0, 0, 1], side: [1, 0, 0], top: [0, 1, 0.0001] };
            const d = dirs[debugView] ?? dirs.front;
            camera.position.set(d[0] * r * 40, d[1] * r * 40, d[2] * r * 40);
            camera.fov = (2 * Math.atan(1.15 / 40) * 180) / Math.PI;
            camera.near = r * 30;
            camera.far = r * 50;
            camera.updateProjectionMatrix();
            controls.maxDistance = r * 60;
            controls.update();
            scene.add(new THREE.Box3Helper(new THREE.Box3().setFromObject(pivot), new THREE.Color(0xffff00)));
            const grid = new THREE.Group();
            for (const f of [-0.25, 0, 0.25]) {
              const mk = (a: [number, number, number], b: [number, number, number]) => new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]), new THREE.LineBasicMaterial({ color: 0x00ffff }));
              if (debugView === "top") {
                grid.add(mk([f * size.x, size.y / 2, -size.z / 2], [f * size.x, size.y / 2, size.z / 2]), mk([-size.x / 2, size.y / 2, f * size.z], [size.x / 2, size.y / 2, f * size.z]));
              } else if (debugView === "side") {
                grid.add(mk([size.x / 2, f * size.y, -size.z / 2], [size.x / 2, f * size.y, size.z / 2]), mk([size.x / 2, -size.y / 2, f * size.z], [size.x / 2, size.y / 2, f * size.z]));
              } else {
                grid.add(mk([f * size.x, -size.y / 2, size.z / 2], [f * size.x, size.y / 2, size.z / 2]), mk([-size.x / 2, f * size.y, size.z / 2], [size.x / 2, f * size.y, size.z / 2]));
              }
            }
            scene.add(grid);
          }

          live.current = { THREE, camera, controls, root, r, home, groups, markers, meshes };

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

          // Camera flights when a part is picked.
          const fly = { from: new THREE.Vector3(), to: new THREE.Vector3(), tFrom: new THREE.Vector3(), tTo: new THREE.Vector3(), t: 1 };
          (live.current as Live & { fly?: typeof fly }).fly = fly;

          const v = new THREE.Vector3();
          const dir = new THREE.Vector3();
          let raf = 0;
          let lastExplode = -1;
          const loop = () => {
            controls.autoRotate = spinRef.current && selRef.current === null;
            if (fly.t < 1) {
              fly.t = Math.min(1, fly.t + 0.035);
              const e = 1 - (1 - fly.t) ** 3;
              camera.position.lerpVectors(fly.from, fly.to, e);
              controls.target.lerpVectors(fly.tFrom, fly.tTo, e);
            }
            controls.update();

            // Explode: push each part away from the model's centre.
            const ex = explodeRef.current;
            if (ex !== lastExplode) {
              lastExplode = ex;
              groups.forEach((g) => {
                dir.copy(g.center);
                if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
                dir.normalize().multiplyScalar(ex * r * 0.55);
                g.objs.forEach((o, i) => {
                  // Offsets are in world space; convert to the parent's space for nested NASA nodes.
                  const parent = o.parent;
                  const local = parent ? parent.worldToLocal(parent.localToWorld(g.base[i].clone()).add(dir)) : g.base[i].clone().add(dir);
                  o.position.copy(local);
                });
              });
            }

            renderer.render(scene, camera);

            // Markers follow their parts (and the explode offset).
            const w = el.clientWidth;
            const h = el.clientHeight;
            markers.forEach((p, id) => {
              const btn = markerEls.current.get(id);
              if (!btn) return;
              const g = groups.get(id);
              v.copy(p);
              if (g && ex > 0) {
                dir.copy(g.center);
                if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
                v.add(dir.normalize().multiplyScalar(ex * r * 0.55));
              }
              v.project(camera);
              const behind = v.z > 1;
              btn.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px) translate(-50%, -50%)`;
              btn.style.opacity = behind ? "0" : "1";
            });
            raf = requestAnimationFrame(loop);
          };
          loop();
          setState("ready");

          cleanup = () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            controls.dispose();
            draco?.dispose();
            pmrem.dispose();
            renderer.dispose();
            renderer.domElement.remove();
            live.current = null;
          };
        } catch (err) {
          console.error(err);
          if (!disposed) setState("error");
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => {
      disposed = true;
      io.disconnect();
      cleanup();
    };
  }, [model, parts]);

  const pick = (id: string | null) => focus(id === sel ? null : id);

  const focus = (next: string | null) => {
    setSel(next);
    selRef.current = next;
    const L = live.current as (Live & { fly?: { from: T.Vector3; to: T.Vector3; tFrom: T.Vector3; tTo: T.Vector3; t: number } }) | null;
    if (!L || !L.fly) return;
    // Dim everything that isn't the chosen part.
    L.meshes.forEach(({ part, mats }) =>
      mats.forEach((m) => {
        const mm = m as T.MeshStandardMaterial;
        const dim = next !== null && L.groups.has(next) && part !== next;
        mm.transparent = dim;
        mm.opacity = dim ? 0.12 : 1;
        mm.depthWrite = !dim;
        if ("emissive" in mm && mm.emissive) mm.emissive.setHex(next !== null && part === next ? 0x2a1680 : 0x000000);
      }),
    );
    const f = L.fly;
    f.from.copy(L.camera.position);
    f.tFrom.copy(L.controls.target);
    if (next && L.markers.has(next)) {
      const p = L.markers.get(next)!;
      f.tTo.copy(p);
      const d = L.camera.position.clone().sub(L.controls.target).normalize();
      f.to.copy(p).add(d.multiplyScalar(L.r * 1.25));
    } else {
      f.tTo.set(0, 0, 0);
      f.to.copy(L.home);
    }
    f.t = 0;
  };

  const reset = () => focus(null);

  const download = async (kind: "glb" | "stl") => {
    const L = live.current;
    if (!L) return;
    setBusy(kind);
    try {
      const file = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      let blob: Blob;
      if (kind === "glb") {
        const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
        const out = await new GLTFExporter().parseAsync(L.root, { binary: true });
        blob = new Blob([out as ArrayBuffer], { type: "model/gltf-binary" });
      } else {
        const { STLExporter } = await import("three/examples/jsm/exporters/STLExporter.js");
        const out = new STLExporter().parse(L.root, { binary: true }) as DataView;
        blob = new Blob([out.buffer as ArrayBuffer], { type: "model/stl" });
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${file}${model.kind === "built" ? "-simplified" : ""}.${kind}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } finally {
      setBusy(null);
    }
  };

  const current = parts.find((p) => p.id === sel);

  return (
    <div className={compact ? "" : "grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]"}>
      <div>
        <div
          ref={host}
          className={`relative aspect-[4/3] overflow-hidden rounded-xl sm:aspect-[16/10] ${
            stage === "light" ? "bg-[radial-gradient(ellipse_at_50%_40%,#ffffff_0%,#ebe6ff_75%)]" : "bg-[radial-gradient(ellipse_at_50%_35%,#2a2457_0%,#0c0a22_70%)]"
          }`}
          role="img"
          aria-label={`Interactive 3D model of ${name}`}
        >
          {state !== "ready" && <Image src={poster} alt={posterAlt} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover opacity-80" />}
          {state === "ready" &&
            parts.map((p, i) => (
              <button
                key={p.id}
                ref={(b) => {
                  if (b) markerEls.current.set(p.id, b);
                  else markerEls.current.delete(p.id);
                }}
                onClick={() => pick(p.id)}
                aria-label={p.label}
                title={p.label}
                className={`absolute top-0 left-0 flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[10px] font-semibold transition-colors ${
                  sel === p.id ? "z-10 border-white bg-brand text-white shadow-[0_0_0_5px_rgba(122,87,255,0.35)]" : "border-white/70 bg-black/45 text-white backdrop-blur hover:bg-brand"
                }`}
              >
                {i + 1}
              </button>
            ))}
          {state === "loading" && <span className="absolute inset-x-0 bottom-4 text-center font-mono text-xs text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">Loading 3D model…</span>}
          {state === "error" && <span className="absolute inset-x-0 bottom-4 text-center font-mono text-xs text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">3D needs WebGL. Showing the photo instead.</span>}
          {current?.text && (
            <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl bg-black/65 p-3 text-white backdrop-blur sm:right-auto sm:max-w-sm">
              <p className="text-sm font-semibold">{current.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/85">{current.text}</p>
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSpin(!spin)}
            aria-pressed={spin}
            disabled={state !== "ready"}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40 ${spin ? "bg-brand text-white" : "border border-line hover:border-brand"}`}
          >
            {spin ? "Pause" : "Rotate"}
          </button>
          <button onClick={reset} disabled={state !== "ready"} className="rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-brand disabled:opacity-40">
            Reset view
          </button>
          {canExplode && (
            <label className="flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-sm font-semibold">
              Explode
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={explode}
                disabled={state !== "ready"}
                onChange={(e) => {
                  const x = Number(e.target.value);
                  setExplode(x);
                  explodeRef.current = x;
                }}
                className="w-24 accent-[#1238ff]"
                aria-label="Pull the parts apart"
              />
            </label>
          )}
          <span className="font-mono text-xs text-ink-soft">Drag to turn · pinch or scroll to zoom</span>
          {compact && model.kind === "glb" && (
            <a href={model.source} target="_blank" rel="noopener noreferrer" className="ml-auto font-mono text-[11px] text-ink-soft hover:text-brand">
              Model: {model.credit} ↗
            </a>
          )}
        </div>
      </div>

      {!compact && (
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="font-mono text-xs tracking-[0.12em] text-ink-soft uppercase">Parts</h3>
          <ol className="mt-2 space-y-1">
            {parts.map((p, i) => (
              <li key={p.id}>
                <button
                  onClick={() => pick(p.id)}
                  disabled={state !== "ready"}
                  aria-pressed={sel === p.id}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors disabled:opacity-60 ${sel === p.id ? "bg-brand text-white" : "hover:bg-brand-soft"}`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] ${sel === p.id ? "bg-white text-brand" : "bg-ink text-white"}`}>{i + 1}</span>
                  {p.label}
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h3 className="font-mono text-xs tracking-[0.12em] text-ink-soft uppercase">Download</h3>
          <div className="mt-2 flex flex-col gap-1.5">
            {model.kind === "glb" ? (
              <a href={model.src} download className="rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:border-brand hover:text-brand">
                NASA model (.glb)
              </a>
            ) : (
              <button onClick={() => download("glb")} disabled={state !== "ready" || !!busy} className="rounded-lg border border-line px-3 py-2 text-left text-sm font-semibold hover:border-brand hover:text-brand disabled:opacity-50">
                {busy === "glb" ? "Preparing…" : "This model (.glb)"}
              </button>
            )}
            <button onClick={() => download("stl")} disabled={state !== "ready" || !!busy} className="rounded-lg border border-line px-3 py-2 text-left text-sm font-semibold hover:border-brand hover:text-brand disabled:opacity-50">
              {busy === "stl" ? "Preparing…" : "For 3D printing (.stl)"}
            </button>
            {downloads.map((d) => (
              <a key={d.url} href={d.url} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:border-brand hover:text-brand">
                {d.label} ↗
              </a>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">
            {model.kind === "glb" ? (
              <>
                {model.note && <>{model.note} </>}Model:{" "}
                <a href={model.source} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                  {model.title}
                </a>
                , {model.credit}. The STL is exported from it for printing; most printers will need supports.
              </>
            ) : (
              <>NASA has not published a 3D model of {name}, so this is a simplified model made for this site from NASA photos and descriptions. Shapes and parts follow the real machine; sizes are approximate.</>
            )}
          </p>
        </div>
      </div>
      )}
    </div>
  );
}

function isAncestor(a: T.Object3D, b: T.Object3D) {
  let p = b.parent;
  while (p) {
    if (p === a) return true;
    p = p.parent;
  }
  return false;
}
