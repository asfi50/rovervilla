/**
 * Touchdown's 3D world: one scene for the whole visit. The lander comes down over the site, the
 * player flies the last few hundred metres, and the rover it carries drives to the machine.
 * Gravity is real (Mars 3.71 m/s², Moon 1.62 m/s²); engine, fuel and start height are tuned for play.
 */
import type * as T from "three";
import type { GameAudio } from "./audio";
import { buildRocks, buildTerrain, lookFor, makeGround, makeNoise, type Ground } from "./terrain";
import { MARS_DUSK, MARS_HORIZON, Particles, Tracks, glowTexture, hologramMaterial, makeBeam, makeEarth, makeRing, makeSky, makeStars } from "./fx";
import { buildLander, buildLantern, buildRover } from "./craft";

export type Quality = "high" | "medium" | "low";

export type WorldCfg = {
  slug: string;
  body: "mars" | "moon";
  lat: number;
  lon: number;
  glb?: string;
  size: number;
  mode: "machine" | "crater" | "lost";
  seed: number;
  quality: Quality;
  /** Expert pilot: raw physics, no flight computer. */
  pilot: boolean;
  shake: boolean;
  /** A light the player left here on an earlier visit. */
  light: boolean;
  /** Echo indices already collected on earlier visits. */
  echoesTaken: number[];
};

export type WorldPhase = "entry" | "descent" | "touchdown" | "crashed" | "deploy" | "drive" | "arrive";

export type DescentFrame = {
  kind: "descent";
  alt: number;
  vy: number;
  vh: number;
  fuel: number;
  dist: number;
  thrust: boolean;
  /** Positions relative to the zone centre in the camera's frame: x right, z forward (metres). */
  px: number;
  pz: number;
  vx: number;
  vz: number;
  ix: number;
  iz: number;
  mx: number;
  mz: number;
  wind: number;
  windAng: number;
  /** Suggested descent speed here (m/s, positive down). */
  target: number;
  pilot: boolean;
};
export type DriveFrame = {
  kind: "drive";
  speed: number;
  targets: { kind: "machine" | "echo"; i: number; bearing: number; dist: number; done: boolean }[];
};
export type Landing = { ok: true; vy: number; vh: number; offset: number; fuel: number; grade: "feather" | "smooth" | "firm" | "hard"; note?: string } | { ok: false; reason: string };
export type RadioKey = "control" | "chute" | "braking" | "fuel" | "fuelOut" | "fast" | "wind" | "far" | "dark";

export type WorldCb = {
  frame: (f: DescentFrame | DriveFrame) => void;
  phase: (p: WorldPhase) => void;
  callout: (text: string) => void;
  radio: (key: RadioKey) => void;
  landed: (r: Landing) => void;
  echo: (i: number) => void;
  arrive: () => void;
  progress?: (msg: string) => void;
};

export type WorldApi = {
  key: (code: string, down: boolean) => boolean;
  touch: (t: { x: number; y: number; thrust: number; brake: boolean }) => void;
  restart: () => void;
  deploy: () => void;
  resume: () => void;
  skip: () => void;
  placeLight: () => void;
  photo: () => string;
  setPaused: (p: boolean) => void;
  setOptions: (o: { pilot?: boolean; shake?: boolean }) => void;
  toggleCamera: () => void;
  /** Shift the picture right by this many pixels (a panel covers the left). */
  setInset: (px: number) => void;
  debug: (cmd: "land" | "arrive") => void;
  /** Debug and tests: simple autopilot for the descent and the drive. */
  autopilot: (on: boolean) => void;
  dispose: () => void;
};

const G = { mars: 3.71, moon: 1.62 };
const ENGINE = { mars: 9.2, moon: 4.6 };
/** Touchdown limits: a gentle landing, a hard one the legs can take, and beyond that a crash. */
export const GENTLE_VY = 2.5;
const HARD_VY = 10;
const GENTLE_VH = 1.5;
const HARD_VH = 6;
export const ZONE_R = 60;
const BURN = 2.4;
const RCS_BURN = 1.2;
/** The descent speed the flight computer suggests at a given height. */
export const targetRate = (alt: number) => clamp(1.6 + alt * 0.07, 1.6, 30);
const CALLOUTS = [500, 400, 300, 200, 100, 60, 40, 20, 10];

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export async function createWorld(host: HTMLElement, cfg: WorldCfg, cb: WorldCb, audio: GameAudio | null): Promise<WorldApi> {
  const THREE = await import("three");
  const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }, { ShaderPass }] = await Promise.all([
    import("three/examples/jsm/postprocessing/EffectComposer.js"),
    import("three/examples/jsm/postprocessing/RenderPass.js"),
    import("three/examples/jsm/postprocessing/UnrealBloomPass.js"),
    import("three/examples/jsm/postprocessing/OutputPass.js"),
    import("three/examples/jsm/postprocessing/ShaderPass.js"),
  ]);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const mars = cfg.body === "mars";
  const look = lookFor(cfg.slug, cfg.body);
  const dark = !!look.dark;
  const q = cfg.quality;
  let opts = { pilot: cfg.pilot, shake: cfg.shake };

  // ---------- layout of the site ----------
  const r0 = rng(cfg.seed);
  const approachAng = r0() * Math.PI * 2;
  const fwd = (h: number) => V(Math.sin(h), 0, Math.cos(h));
  const A = fwd(approachAng);
  const R = V(-A.z, 0, A.x);
  const mAng = approachAng + (r0() - 0.5) * 1.0;
  const mDist = 85 + r0() * 25;
  const machinePos = fwd(mAng).multiplyScalar(mDist);
  const mHat = machinePos.clone().normalize();
  const P = V(-mHat.z, 0, mHat.x);
  const echoXZ = [
    machinePos.clone().multiplyScalar(0.38).addScaledVector(P, 24),
    machinePos.clone().multiplyScalar(0.7).addScaledVector(P, -30),
    machinePos.clone().multiplyScalar(1.28).addScaledVector(P, 14),
  ];

  cb.progress?.("Shaping the ground");
  await new Promise((r) => setTimeout(r, 0));
  const ground: Ground = makeGround(cfg.seed, look, { x: machinePos.x, z: machinePos.z, mode: cfg.mode });
  const H = ground.heightAt;

  // ---------- renderer ----------
  const renderer = new THREE.WebGLRenderer({ antialias: q === "low", powerPreference: "high-performance" });
  const basePR = Math.min(window.devicePixelRatio, q === "high" ? 2 : q === "medium" ? 1.5 : 1);
  renderer.setPixelRatio(basePR);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = mars ? 1.0 : 1.05;
  renderer.shadowMap.enabled = q !== "low";
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = "absolute inset-0 h-full w-full touch-none";
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 9000);

  // ---------- light and sky ----------
  const el = (look.sun.elev * Math.PI) / 180;
  const az = (look.sun.az * Math.PI) / 180;
  const sunDir = V(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).normalize();
  const sun = new THREE.DirectionalLight(mars ? 0xfff0dc : 0xffffff, dark ? 0 : mars ? 2.6 : 3.1);
  sun.castShadow = q !== "low";
  sun.shadow.mapSize.set(q === "high" ? 2048 : 1024, q === "high" ? 2048 : 1024);
  const sc = sun.shadow.camera as T.OrthographicCamera;
  sc.left = sc.bottom = -36;
  sc.right = sc.top = 36;
  sc.near = 1;
  sc.far = 1400;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(mars ? 0xe8c5a2 : 0x2a3048, mars ? 0x5d321d : 0x2b2b2b, dark ? 0.35 : mars ? 0.85 : 0.22);
  scene.add(hemi);

  // An environment for reflections: sky above, the ground's colour below, a bright spot for the Sun.
  {
    const envScene = new THREE.Scene();
    const env = new THREE.Mesh(
      new THREE.SphereGeometry(50, 32, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {
          uSky: { value: mars ? new THREE.Color().setRGB(0.7, 0.45, 0.3) : new THREE.Color().setRGB(0.01, 0.01, 0.015) },
          uGround: { value: new THREE.Color(look.colors.base).multiplyScalar(dark ? 0.05 : mars ? 0.9 : 0.8) },
          uSun: { value: sunDir.clone() },
          uSunI: { value: dark ? 0 : 30 },
        },
        vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 uSky; uniform vec3 uGround; uniform vec3 uSun; uniform float uSunI; varying vec3 vD;
          void main(){ vec3 d = normalize(vD); vec3 c = mix(uGround, uSky, smoothstep(-0.08, 0.12, d.y)); c += vec3(1.0, 0.95, 0.85) * pow(max(dot(d, uSun), 0.00001), 600.0) * uSunI; gl_FragColor = vec4(c, 1.0); }`,
      }),
    );
    envScene.add(env);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(envScene, 0.02).texture;
    scene.environmentIntensity = mars ? 0.7 : 0.9;
    pmrem.dispose();
    env.geometry.dispose();
    (env.material as T.Material).dispose();
  }

  const sky = makeSky(THREE, cfg.body, sunDir);
  const skyU = (sky.material as T.ShaderMaterial).uniforms;
  scene.add(sky);
  const horizon = new THREE.Color().setRGB(...MARS_HORIZON);
  const horizonDusk = new THREE.Color().setRGB(...MARS_DUSK);
  scene.fog = mars ? new THREE.FogExp2(horizon.clone(), 0.0006) : new THREE.FogExp2(0x000000, 0.00022);
  const stars = makeStars(THREE, mars ? 900 : 2600, mars ? 0.8 : 1);
  const starMat = stars.material as T.PointsMaterial;
  if (mars) {
    starMat.transparent = true;
    starMat.opacity = 0;
  }
  scene.add(stars);
  let earth: T.Mesh | null = null;
  let earthDir: T.Vector3 | null = null;
  if (!mars) {
    // Where Earth hangs in the sky at this site: the sub-Earth point is near 0° N, 0° E.
    const la = (cfg.lat * Math.PI) / 180;
    const lo = (cfg.lon * Math.PI) / 180;
    const up = Math.cos(la) * Math.cos(lo);
    const east = -Math.sin(lo);
    const north = -Math.sin(la) * Math.cos(lo);
    // Local frame: north is +z rotated by the approach so Earth sits somewhere sensible on screen.
    const ang = Math.atan2(east, north) + approachAng + 0.5;
    const elev = Math.asin(clamp(up, -1, 1));
    earthDir = V(Math.cos(elev) * Math.sin(ang), Math.sin(elev), Math.cos(elev) * Math.cos(ang)).normalize();
    if (earthDir.y < 0.05) earthDir.y = 0.05;
    earthDir.normalize();
    earth = makeEarth(THREE, makeNoise(42));
    scene.add(earth);
  }

  // ---------- ground ----------
  cb.progress?.("Laying down rocks");
  await new Promise((r) => setTimeout(r, 0));
  const terrain = buildTerrain(THREE, ground, cfg.seed, q);
  const tMat = terrain.material as T.MeshStandardMaterial;
  const sunView = V();
  const sunU = { uSunView: { value: sunView }, uSunI: { value: dark ? 2.4 : 0 } };
  const prevCompile = tMat.onBeforeCompile;
  tMat.onBeforeCompile = (sh, r) => {
    prevCompile.call(tMat, sh, r);
    Object.assign(sh.uniforms, sunU);
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uSunView;\nuniform float uSunI;")
      .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\ntotalEmissiveRadiance += diffuseColor.rgb * vLit * max(dot(normal, uSunView), 0.0) * uSunI;");
  };
  scene.add(terrain);
  const avoid = [{ x: machinePos.x, z: machinePos.z, r: 7 + cfg.size }, ...echoXZ.map((e) => ({ x: e.x, z: e.z, r: 3 }))];
  const rocks = buildRocks(THREE, ground, cfg.seed, avoid, q);
  scene.add(...rocks);
  // Dust takes the ground's colour; in permanent shadow it is barely lit.
  const groundColor = new THREE.Color(look.colors.light).multiplyScalar(dark ? 0.12 : 1);

  // ---------- the machine ----------
  cb.progress?.("Finding the machine");
  const site = new THREE.Group();
  site.position.set(machinePos.x, H(machinePos.x, machinePos.z), machinePos.z);
  scene.add(site);
  let model: T.Object3D;
  if (cfg.glb) {
    const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
    const { DRACOLoader } = await import("three/examples/jsm/loaders/DRACOLoader.js");
    const draco = new DRACOLoader();
    draco.setDecoderPath("/draco/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    model = (await loader.loadAsync(cfg.glb)).scene;
    draco.dispose();
    let box = new THREE.Box3().setFromObject(model);
    if (cfg.slug === "apollo-11-lander") {
      // Only the descent stage stayed on the Moon: hide the parts of the ascent stage above it.
      const h = box.max.y - box.min.y;
      const split = box.min.y + h * 0.47;
      const mb = new THREE.Box3();
      model.traverse((o) => {
        const m = o as T.Mesh;
        if (!m.isMesh) return;
        mb.setFromObject(m);
        if ((mb.min.y + mb.max.y) / 2 > split) m.visible = false;
      });
      box = new THREE.Box3();
      model.traverse((o) => {
        const m = o as T.Mesh;
        if (m.isMesh && m.visible) box.expandByObject(m);
      });
    }
    const s = box.getSize(V());
    model.scale.setScalar(cfg.size / Math.max(s.x, s.y, s.z));
    model.traverse((o) => {
      const m = o as T.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
  } else {
    const { buildModel } = await import("@/lib/models/procedural");
    model = buildModel(THREE, cfg.slug)?.root ?? new THREE.Group();
  }
  const fit = () => {
    const b = new THREE.Box3();
    model.updateMatrixWorld(true);
    model.traverse((o) => {
      const m = o as T.Mesh;
      if (m.isMesh && m.visible) b.expandByObject(m);
    });
    return b;
  };
  {
    const b = fit();
    const c = b.getCenter(V());
    model.position.x -= c.x;
    model.position.z -= c.z;
    model.position.y -= b.min.y;
  }
  model.rotation.y = r0() * Math.PI * 2;
  const holo = hologramMaterial(THREE);
  if (cfg.mode !== "machine") {
    model.traverse((o) => {
      const m = o as T.Mesh;
      if (m.isMesh) {
        m.material = holo;
        m.castShadow = false;
      }
    });
    model.position.y += cfg.mode === "lost" ? 2.5 : 3.2;
  }
  site.add(model);
  const beam = makeBeam(THREE, 0x9d86ff, 300, 0.7, 0.9);
  site.add(beam);
  const pulse = makeRing(THREE, 3.3, 3.5, 0x9d86ff, 0.5);
  pulse.position.y = 0.15;
  site.add(pulse);
  if (cfg.mode === "lost") {
    const area = makeRing(THREE, 13.6, 14, 0x9d86ff, 0.6);
    area.position.y = 0.2;
    site.add(area);
  }
  const lantern = buildLantern(THREE);
  const lanternAt = machinePos.clone().addScaledVector(P, -(cfg.size * 0.8 + 2.6));
  lantern.position.set(lanternAt.x, H(lanternAt.x, lanternAt.z), lanternAt.z);
  lantern.visible = cfg.light;
  scene.add(lantern);

  // ---------- landing zone ----------
  const zone = new THREE.Group();
  const zoneRing = makeRing(THREE, ZONE_R - 0.8, ZONE_R, 0x7af0ff, 0.85);
  const zoneInner = makeRing(THREE, 7.4, 8, 0x7af0ff, 0.7);
  zone.add(zoneRing, zoneInner);
  for (let i = 0; i < 4; i++) {
    const tick = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 10), new THREE.MeshBasicMaterial({ color: 0x7af0ff, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }));
    tick.rotation.x = -Math.PI / 2;
    tick.rotation.z = (i * Math.PI) / 2;
    tick.position.set(Math.sin((i * Math.PI) / 2) * 20, 0, Math.cos((i * Math.PI) / 2) * 20);
    zone.add(tick);
  }
  zone.position.y = 0.06;
  scene.add(zone);

  // ---------- echoes ----------
  const glow = glowTexture(THREE);
  const echoes = echoXZ.map((p, i) => {
    const g = new THREE.Group();
    g.position.set(p.x, H(p.x, p.z), p.z);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 1.6, 1.8) }));
    core.position.y = 1.6;
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0x7af0ff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.setScalar(3);
    halo.position.y = 1.6;
    const b = makeBeam(THREE, 0x7af0ff, 26, 0.12, 0.6);
    const ring = makeRing(THREE, 1.4, 1.6, 0x7af0ff, 0.7);
    ring.position.y = 0.12;
    g.add(core, halo, b, ring);
    const taken = cfg.echoesTaken.includes(i);
    g.visible = !taken;
    scene.add(g);
    return { g, core, halo, ring, beam: b, taken, fade: taken ? 0 : 1, at: p };
  });

  // ---------- craft ----------
  const lander = buildLander(THREE, dark);
  lander.root.rotation.y = approachAng;
  scene.add(lander.root);
  const rover = buildRover(THREE, dark);
  scene.add(rover.root);
  const foot = makeRing(THREE, 1.5, 1.8, 0xffffff, 0.5);
  scene.add(foot);
  const dropGeo = new THREE.BufferGeometry().setFromPoints([V(), V(0, 1, 0)]);
  const drop = new THREE.Line(dropGeo, new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 2, gapSize: 2, transparent: true, opacity: 0.35 }));
  scene.add(drop);

  // ---------- particles ----------
  const soft = glowTexture(THREE, 1);
  const dust = new Particles(THREE, q === "low" ? 600 : 1500, false, soft, H);
  const fire = new Particles(THREE, 500, true, glow, H);
  scene.add(dust.points, fire.points);
  const debris: { m: T.Mesh; v: T.Vector3; w: T.Vector3 }[] = [];
  const tracks = new Tracks(THREE, 900, H, 0x000000);
  (tracks.mesh.material as T.MeshBasicMaterial).opacity = mars ? 0.3 : 0.38;
  scene.add(tracks.mesh);

  // ---------- post-processing ----------
  let composer: InstanceType<typeof EffectComposer> | null = null;
  let grade: InstanceType<typeof ShaderPass> | null = null;
  if (q !== "low") {
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: q === "high" ? 4 : 2 });
    composer = new EffectComposer(renderer, rt);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), mars ? 0.45 : 0.6, 0.55, 0.9));
    composer.addPass(new OutputPass());
    grade = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uFade: { value: 1 }, uVig: { value: 0.9 }, uGrain: { value: 0.035 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse; uniform float uTime; uniform float uFade; uniform float uVig; uniform float uGrain;
        varying vec2 vUv;
        void main() {
          vec4 c = texture2D(tDiffuse, vUv);
          vec2 d = vUv - 0.5;
          c.rgb *= 1.0 - dot(d, d) * uVig;
          float n = fract(sin(dot(vUv * 913.7 + uTime, vec2(12.9898, 78.233))) * 43758.5453);
          c.rgb += (n - 0.5) * uGrain;
          c.rgb *= 1.0 - uFade;
          gl_FragColor = c;
        }`,
    });
    composer.addPass(grade);
  }
  // Without post-processing, fades use a black overlay.
  const fadeEl = document.createElement("div");
  fadeEl.className = "pointer-events-none absolute inset-0 bg-black";
  fadeEl.style.opacity = "1";
  if (!composer) host.appendChild(fadeEl);
  let fade = 1;
  const fadeTo = 0;

  let inset = 0;
  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    renderer.setSize(w, h, false);
    if (inset) camera.setViewOffset(w, h, -inset / 2, 0, w, h);
    else camera.clearViewOffset();
    composer?.setSize(w, h);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 68 : 55;
    camera.updateProjectionMatrix();
    const scale = renderer.domElement.height / (2 * Math.tan((camera.fov * Math.PI) / 360));
    dust.mat.uniforms.uScale.value = scale;
    fire.mat.uniforms.uScale.value = scale;
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  // ---------- input ----------
  const kb = { up: false, down: false, left: false, right: false, space: false };
  const touch = { x: 0, y: 0, thrust: 0, brake: false };
  const input = { mx: 0, my: 0, thrust: 0, brake: false };
  let auto = false;
  let camMode: "chase" | "top" = "chase";
  const drag = { on: false, x: 0, y: 0, yaw: 0, pitch: 0, idle: 0 };
  const onDown = (e: PointerEvent) => {
    drag.on = true;
    drag.x = e.clientX;
    drag.y = e.clientY;
  };
  const onMove = (e: PointerEvent) => {
    if (!drag.on) return;
    drag.yaw -= (e.clientX - drag.x) * 0.006;
    drag.pitch = clamp(drag.pitch + (e.clientY - drag.y) * 0.004, -0.4, 0.8);
    drag.x = e.clientX;
    drag.y = e.clientY;
    drag.idle = 0;
  };
  const onUp = () => (drag.on = false);
  const onBlur = () => {
    for (const k of Object.keys(kb) as (keyof typeof kb)[]) kb[k] = false;
    Object.assign(touch, { x: 0, y: 0, thrust: 0, brake: false });
  };
  window.addEventListener("blur", onBlur);
  renderer.domElement.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);

  const pollPad = () => {
    const pads = navigator.getGamepads?.() ?? [];
    for (const p of pads) {
      if (!p) continue;
      const dz = (v: number) => (Math.abs(v) < 0.15 ? 0 : v);
      return { x: dz(p.axes[0] ?? 0), y: -dz(p.axes[1] ?? 0), thrust: Math.max(p.buttons[7]?.value ?? 0, p.buttons[0]?.pressed ? 1 : 0), brake: !!p.buttons[1]?.pressed };
    }
    return null;
  };

  // ---------- state ----------
  let phase: WorldPhase = "entry";
  let phaseT = 0;
  let attempt = 0;
  let paused = false;
  let time = 0;
  let timeScale = 1;
  let shake = 0;
  const pos = V();
  const vel = V();
  let fuel = 100;
  let thrust = 0;
  let rcsLevel = 0;
  let calloutIdx = 0;
  const flags = new Set<string>();
  let wind = V();
  let windMag = 0;
  const tilt = { x: 0, z: 0 };
  let landing: Landing | null = null;
  let landedSent = false;
  const rv = { x: 0, z: 0, h: approachAng, speed: 0, wheel: 0 };
  let arrived = false;
  let dusk = 0;
  let duskTo = 0;
  const camPos = V();
  const camLook = V();
  const camLookS = V();
  let camInit = false;

  const setPhase = (p: WorldPhase) => {
    phase = p;
    phaseT = 0;
    cb.phase(p);
  };

  const startAttempt = () => {
    const ra = rng(cfg.seed + attempt * 977 + 13);
    const startDist = 120 + ra() * 50;
    const lateral = (ra() - 0.5) * 60;
    pos.copy(A).multiplyScalar(-startDist).addScaledVector(R, lateral);
    pos.y = mars ? 620 : 560;
    vel.copy(A).multiplyScalar(4 + ra() * 3).addScaledVector(R, -lateral * 0.02);
    vel.y = mars ? -34 : -26;
    fuel = 100;
    thrust = 0;
    calloutIdx = 0;
    flags.clear();
    landing = null;
    landedSent = false;
    lander.root.visible = true;
    lander.chute.visible = mars;
    lander.chute.position.set(0, 0, 0);
    lander.chute.traverse((o) => {
      const m = (o as T.Mesh).material as T.Material | undefined;
      if (m) {
        m.transparent = true;
        m.opacity = 1;
      }
    });
    for (const d of debris) scene.remove(d.m);
    debris.length = 0;
    dust.clear();
    fire.clear();
    timeScale = 1;
    camInit = false;
    arrived = false;
    zone.visible = true;
    foot.visible = drop.visible = true;
    setPhase("entry");
    if (mars) audio?.play("entry");
  };

  // ---------- helpers ----------
  const spawnEngineDust = (dt: number, alt: number, strength: number) => {
    if (alt > 34 || strength <= 0) return;
    const k = (1 - alt / 34) * strength;
    const n = Math.floor(k * (q === "low" ? 60 : 160) * dt + Math.random());
    const gx = pos.x;
    const gz = pos.z;
    const gy = H(gx, gz);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (mars ? 7 : 12) + Math.random() * (mars ? 10 : 14);
      dust.spawn({
        x: gx + Math.cos(a) * 1.5,
        y: gy + 0.3,
        z: gz + Math.sin(a) * 1.5,
        vx: Math.cos(a) * sp * k,
        vy: mars ? 0.6 + Math.random() * 1.8 : 0.3 + Math.random() * 0.8,
        vz: Math.sin(a) * sp * k,
        life: mars ? 2.5 + Math.random() * 2 : 1 + Math.random() * 0.7,
        size: mars ? 1.6 + Math.random() * 2 : 0.5 + Math.random() * 0.7,
        grow: mars ? 2.2 : 0.4,
        color: groundColor,
        alpha: mars ? 0.35 : 0.5,
        drag: mars ? 1.1 : 0.05,
        gravity: mars ? 0.25 : G.moon,
      });
    }
  };

  const explode = () => {
    const p = pos.clone();
    for (let i = 0; i < 140; i++) {
      const d = V(Math.random() - 0.5, Math.random() * 0.9, Math.random() - 0.5).normalize();
      fire.spawn({ x: p.x, y: p.y + 1, z: p.z, vx: d.x * (8 + Math.random() * 20), vy: d.y * (8 + Math.random() * 18), vz: d.z * (8 + Math.random() * 20), life: 0.5 + Math.random() * 0.9, size: 1.2 + Math.random() * 2.5, grow: -0.6, color: Math.random() < 0.5 ? 0xffb35a : 0xff6a2a, alpha: 1, drag: 1.5, gravity: G[cfg.body] });
    }
    for (let i = 0; i < 90; i++) {
      const a = Math.random() * Math.PI * 2;
      dust.spawn({ x: p.x, y: p.y + 0.5, z: p.z, vx: Math.cos(a) * (3 + Math.random() * 10), vy: 2 + Math.random() * 7, vz: Math.sin(a) * (3 + Math.random() * 10), life: 3 + Math.random() * 3, size: 2 + Math.random() * 3, grow: 1.6, color: mars ? 0x5b4033 : 0x4a4a4a, alpha: 0.6, drag: mars ? 0.8 : 0.1, gravity: mars ? 0.3 : G.moon });
    }
    const mat = new THREE.MeshStandardMaterial({ color: 0xb08a40, roughness: 0.4, metalness: 0.8 });
    for (let i = 0; i < 16; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.15 + Math.random() * 0.4, 0.05 + Math.random() * 0.2, 0.15 + Math.random() * 0.5), i % 3 ? mat : new THREE.MeshStandardMaterial({ color: 0xd8dbe2, roughness: 0.5 }));
      m.position.copy(p).add(V(0, 0.8, 0));
      m.castShadow = true;
      scene.add(m);
      const d = V(Math.random() - 0.5, 0.5 + Math.random(), Math.random() - 0.5).normalize().multiplyScalar(5 + Math.random() * 12);
      debris.push({ m, v: d, w: V(Math.random() * 8, Math.random() * 8, Math.random() * 8) });
    }
    lander.root.visible = false;
    rover.root.visible = false;
    shake = 1.4;
    timeScale = 0.35;
  };

  const land = (ok: Landing) => {
    landing = ok;
    thrust = 0;
    rcsLevel = 0;
    if (ok.ok) {
      setPhase("touchdown");
      audio?.play("thud");
      shake = 0.2 + Math.min(0.8, ok.vy * 0.1);
      // A last puff of dust.
      for (let i = 0; i < (mars ? 70 : 40); i++) {
        const a = Math.random() * Math.PI * 2;
        dust.spawn({ x: pos.x, y: pos.y + 0.2, z: pos.z, vx: Math.cos(a) * (2 + Math.random() * 4), vy: 0.3 + Math.random(), vz: Math.sin(a) * (2 + Math.random() * 4), life: 2 + Math.random() * 2, size: mars ? 1.5 : 0.6, grow: mars ? 1.2 : 0.3, color: groundColor, alpha: 0.35, drag: mars ? 1 : 0.1, gravity: mars ? 0.2 : G.moon });
      }
    } else {
      setPhase("crashed");
      audio?.play("crash");
      explode();
    }
    audio?.setEngine(0);
    audio?.setRcs(0);
    audio?.setAlarm(false);
  };

  // ---------- update: descent ----------
  const g = G[cfg.body];
  const updateDescent = (dt: number) => {
    const entry = phase === "entry";
    const entryLen = mars ? 3.6 : 2.6;
    let th = 0;
    let ax = 0;
    let az = 0;
    if (entry) {
      if (mars) {
        // Under the parachute: drag holds the fall near 26 m/s.
        vel.y += (-26 - vel.y) * (1 - Math.exp(-dt * 0.9));
        lander.body.rotation.z = Math.sin(time * 1.6) * 0.05;
      } else {
        // Braking burn on autopilot.
        th = 1;
        vel.y += (-g + ENGINE.moon) * dt;
        vel.x *= Math.exp(-dt * 0.25);
        vel.z *= Math.exp(-dt * 0.25);
      }
      if (phaseT >= entryLen) {
        lander.body.rotation.z = 0;
        if (mars) {
          audio?.play("chute");
          cb.radio("chute");
          flags.add("chuteGone");
        } else cb.radio("braking");
        if (dark) setTimeout(() => cb.radio("dark"), 2600);
        setPhase("descent");
      }
    } else {
      let mx = input.mx;
      let my = input.my;
      const altNow = pos.y - H(pos.x, pos.z);
      th = fuel > 0 ? input.thrust : 0;
      if (!opts.pilot && th > 0) {
        // Space fires the engine; let go and it stops. Once you're well under the suggested speed
        // the engine idles instead of burning fuel to hover.
        if (-vel.y < Math.max(1, targetRate(Math.max(0, altNow)) * 0.6)) th = 0;
      }
      if (auto) {
        // A simple controller: aim for the zone centre and a safe descent profile.
        const alt = pos.y - H(pos.x, pos.z);
        const want = -Math.max(1.4, Math.min(38, alt * 0.22));
        th = vel.y < want ? 1 : 0;
        const tx = -pos.x * 0.05 - vel.x * 0.6;
        const tz = -pos.z * 0.05 - vel.z * 0.6;
        mx = clamp(tx * R.x + tz * R.z, -1, 1);
        my = clamp(tx * A.x + tz * A.z, -1, 1);
      }
      const rcs = opts.pilot ? 1.9 : 2.4;
      const m = Math.hypot(mx, my);
      if (fuel > 0 && m > 0.05) {
        ax = (R.x * mx + A.x * my) * rcs;
        az = (R.z * mx + A.z * my) * rcs;
        fuel -= RCS_BURN * Math.min(1, m) * dt;
      } else if (!opts.pilot && fuel > 0) {
        // Flight computer: the thrusters quietly null sideways drift.
        const vh = Math.hypot(vel.x, vel.z);
        if (vh > 0.05) {
          const k = Math.min(vh / dt, 0.8) / vh;
          ax = -vel.x * k;
          az = -vel.z * k;
          fuel -= RCS_BURN * 0.3 * dt;
        }
      }
      rcsLevel = Math.min(1, Math.hypot(ax, az) / 1.9);
      if (th > 0) fuel -= BURN * th * dt;
      fuel = Math.max(0, fuel);
      if (mars) {
        // Gusty wind, slowly turning.
        const wa = time * 0.05 + cfg.seed;
        windMag = 0.05 + 0.17 * (Math.sin(time * 0.7) * 0.5 + 0.5) * (Math.sin(time * 0.23 + 1) * 0.5 + 0.5);
        wind = V(Math.sin(wa), 0, Math.cos(wa)).multiplyScalar(windMag);
        ax += wind.x;
        az += wind.z;
        if (!flags.has("wind") && windMag > 0.17 && phaseT > 4) {
          flags.add("wind");
          cb.radio("wind");
        }
      }
      vel.y += (-g + ENGINE[cfg.body] * th) * dt;
      tilt.x += ((ax * A.x + az * A.z) * 0.05 - tilt.x) * Math.min(1, dt * 5);
      tilt.z += (-(ax * R.x + az * R.z) * 0.05 - tilt.z) * Math.min(1, dt * 5);
    }
    if (!entry) {
      vel.x += ax * dt;
      vel.z += az * dt;
    }
    pos.addScaledVector(vel, dt);
    thrust = th;

    // Chute drifts away after release.
    if (flags.has("chuteGone") && lander.chute.visible) {
      lander.chute.position.y += 22 * dt;
      lander.chute.position.addScaledVector(A, -6 * dt);
      lander.chute.traverse((o) => {
        const m = (o as T.Mesh).material as T.Material | undefined;
        if (m) m.opacity = Math.max(0, m.opacity - dt * 0.35);
      });
      if (lander.chute.position.y > 80) lander.chute.visible = false;
    }

    const gy = H(pos.x, pos.z);
    const alt = pos.y - gy;
    // Callouts.
    while (calloutIdx < CALLOUTS.length && alt < CALLOUTS[calloutIdx]) {
      if (phase === "descent") {
        cb.callout(`${CALLOUTS[calloutIdx]} m · ${(-vel.y).toFixed(1)} down`);
        audio?.play("callout");
      }
      calloutIdx++;
    }
    if (phase === "descent") {
      if (!flags.has("fuel") && fuel < 25) {
        flags.add("fuel");
        cb.radio("fuel");
      }
      if (!flags.has("fuelOut") && fuel <= 0) {
        flags.add("fuelOut");
        cb.radio("fuelOut");
      }
      if (!flags.has("fast") && alt < 120 && alt > 45 && -vel.y > targetRate(alt) + 8) {
        flags.add("fast");
        cb.radio("fast");
      }
    }
    spawnEngineDust(dt, alt, th);
    // RCS puffs.
    if (rcsLevel > 0.1 && Math.random() < 0.6) {
      const p = lander.rcs[Math.floor(Math.random() * 4)].clone().applyMatrix4(lander.body.matrixWorld);
      dust.spawn({ x: p.x, y: p.y, z: p.z, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 2, vz: (Math.random() - 0.5) * 3, life: 0.35, size: 0.35, grow: 1.5, color: 0xffffff, alpha: 0.5, drag: 2 });
    }

    // Touchdown?
    if (alt <= 0 && phase === "descent") {
      pos.y = gy;
      const vy = -vel.y;
      const vh = Math.hypot(vel.x, vel.z);
      const n = ground.normalAt(pos.x, pos.z);
      const slope = (Math.acos(clamp(n.y, -1, 1)) * 180) / Math.PI;
      const md = Math.hypot(pos.x - machinePos.x, pos.z - machinePos.z);
      const rock = ground.boulders.find((b) => b.r > 1 && Math.hypot(b.x - pos.x, b.z - pos.z) < b.r * 0.6);
      let reason = "";
      if (cfg.mode === "machine" && md < 1.6 + cfg.size * 0.5) reason = "You came down on top of it. Land in the ring next time and drive over.";
      else if (vy > HARD_VY) reason = `You hit the ground at ${vy.toFixed(1)} m/s. The legs can take up to ${HARD_VY}; under ${GENTLE_VY} is a gentle landing. Brake earlier: hold Space when the speed bar turns amber.`;
      else if (vh > HARD_VH) reason = `You were sliding sideways at ${vh.toFixed(1)} m/s and the lander rolled. Let go of the drift keys before touchdown; the computer stops the slide.`;
      else if (slope > 32) reason = `The ground there slopes ${slope.toFixed(0)}° and the lander tipped over. The ring is flat.`;
      else if (rock) reason = "You came down on a big boulder and the lander tipped over. The ring is clear of rocks.";
      if (reason) land({ ok: false, reason });
      else {
        const hard = vy > 4.5 || vh > 3 || slope > 18;
        const grade = hard ? "hard" : vy < 1.2 && vh < 0.6 ? "feather" : vy <= GENTLE_VY && vh <= GENTLE_VH ? "smooth" : "firm";
        const note = hard ? (slope > 18 ? "Uneven ground, but the legs held." : vh > 3 ? "You came in sliding, but the legs held." : "Hard, but the legs held.") : undefined;
        land({ ok: true, vy, vh, offset: Math.hypot(pos.x, pos.z), fuel, grade, note });
      }
      vel.set(0, 0, 0);
    }

    // Audio. Touchdown or a crash this frame has already silenced the engine; keep it that way.
    const flying = phase === "entry" || phase === "descent";
    audio?.setEngine(flying && th > 0 ? 0.55 + th * 0.45 : 0);
    audio?.setRcs(flying ? rcsLevel : 0);
    audio?.setAlarm(phase === "descent" && fuel > 0 && fuel < 20);
    audio?.setTension(1 - clamp(alt / 600, 0, 1));
    if (mars) audio?.setWind(0.35 + windMag * 2);

    // HUD.
    if (phase === "descent" || phase === "entry") {
      const tImp = (vel.y + Math.sqrt(Math.max(0, vel.y * vel.y + 2 * g * Math.max(0, alt)))) / g;
      const ix = pos.x + vel.x * tImp;
      const iz = pos.z + vel.z * tImp;
      cb.frame({
        kind: "descent",
        alt: Math.max(0, alt),
        vy: vel.y,
        vh: Math.hypot(vel.x, vel.z),
        fuel,
        dist: Math.hypot(pos.x, pos.z),
        thrust: th > 0,
        px: pos.x * R.x + pos.z * R.z,
        pz: pos.x * A.x + pos.z * A.z,
        vx: vel.x * R.x + vel.z * R.z,
        vz: vel.x * A.x + vel.z * A.z,
        ix: ix * R.x + iz * R.z,
        iz: ix * A.x + iz * A.z,
        mx: machinePos.x * R.x + machinePos.z * R.z,
        mz: machinePos.x * A.x + machinePos.z * A.z,
        wind: windMag / 0.22,
        windAng: Math.atan2(wind.x * R.x + wind.z * R.z, wind.x * A.x + wind.z * A.z),
        target: targetRate(Math.max(0, alt)),
        pilot: opts.pilot,
      });
    }
  };

  // ---------- update: drive ----------
  const ROVER_R = 0.8;
  const updateDrive = (dt: number) => {
    let mx = input.mx;
    let my = input.my;
    if (auto && phase === "drive") {
      const tgt = echoes.find((e) => !e.taken)?.at ?? machinePos;
      const want = Math.atan2(tgt.x - rv.x, tgt.z - rv.z);
      const d = wrap(want - rv.h);
      mx = clamp(-d * 2, -1, 1);
      my = Math.abs(d) < 1 ? 1 : 0.3;
    }
    if (phase === "drive") {
      rv.speed += my * 4.5 * dt;
      if (Math.abs(my) < 0.05 || input.brake) rv.speed *= Math.exp(-dt * (input.brake ? 6 : 1.6));
      // Slopes slow you down going up and speed you up going down.
      const f = fwd(rv.h);
      const slopeAlong = (H(rv.x + f.x, rv.z + f.z) - H(rv.x - f.x, rv.z - f.z)) / 2;
      rv.speed -= slopeAlong * g * 0.5 * dt;
      rv.speed = clamp(rv.speed, -3, 7);
      const turn = -mx * 1.7 * (Math.abs(rv.speed) > 0.25 ? Math.sign(rv.speed) : 1);
      rv.h += turn * dt;
    } else rv.speed *= Math.exp(-dt * 4);
    const f = fwd(rv.h);
    let nx = rv.x + f.x * rv.speed * dt;
    let nz = rv.z + f.z * rv.speed * dt;
    // Bump into boulders, the lander and the machine.
    const obstacles = [...ground.boulders, { x: pos.x, z: pos.z, r: 2 }, ...(cfg.mode === "machine" ? [{ x: machinePos.x, z: machinePos.z, r: cfg.size * 0.55 }] : [])];
    for (const b of obstacles) {
      const dx = nx - b.x;
      const dz = nz - b.z;
      const d = Math.hypot(dx, dz);
      const min = b.r + ROVER_R;
      if (d < min && d > 0.001) {
        nx = b.x + (dx / d) * min;
        nz = b.z + (dz / d) * min;
        rv.speed *= 0.6;
      }
    }
    const rad = Math.hypot(nx, nz);
    if (rad > 280) {
      nx *= 280 / rad;
      nz *= 280 / rad;
      rv.speed *= 0.5;
      if (!flags.has("far")) {
        flags.add("far");
        cb.radio("far");
      }
    } else if (rad < 240) flags.delete("far");
    rv.x = nx;
    rv.z = nz;
    rv.wheel += (rv.speed * dt) / 0.17;
    const y = H(rv.x, rv.z);
    const pitch = Math.atan2(H(rv.x + f.x * 0.6, rv.z + f.z * 0.6) - H(rv.x - f.x * 0.6, rv.z - f.z * 0.6), 1.2);
    const roll = Math.atan2(H(rv.x - f.z * 0.6, rv.z + f.x * 0.6) - H(rv.x + f.z * 0.6, rv.z - f.x * 0.6), 1.2);
    rover.root.position.set(rv.x, y + Math.abs(Math.sin(rv.wheel * 1.3)) * 0.015 * Math.min(1, Math.abs(rv.speed)), rv.z);
    rover.root.rotation.set(0, 0, 0);
    rover.root.rotateY(rv.h);
    rover.root.rotateX(-pitch);
    rover.root.rotateZ(roll);
    for (const w of rover.wheels) w.rotation.x = rv.wheel;
    rover.head.rotation.y = Math.sin(time * 0.4) * 0.3;
    if (Math.abs(rv.speed) > 0.3) tracks.step(rv.x - f.x * 0.3, rv.z - f.z * 0.3, rv.h, 1.06);
    // Dust from the wheels.
    if (Math.abs(rv.speed) > 1.2 && Math.random() < Math.abs(rv.speed) * (q === "low" ? 0.1 : 0.25)) {
      const side = Math.random() < 0.5 ? -1 : 1;
      dust.spawn({
        x: rv.x - f.x * 0.5 + f.z * side * 0.53,
        y: y + 0.1,
        z: rv.z - f.z * 0.5 - f.x * side * 0.53,
        vx: -f.x * rv.speed * 0.3 + (Math.random() - 0.5),
        vy: 0.6 + Math.random() * (mars ? 0.8 : 1.6),
        vz: -f.z * rv.speed * 0.3 + (Math.random() - 0.5),
        life: mars ? 1.6 : 0.9,
        size: mars ? 0.45 : 0.25,
        grow: mars ? 0.9 : 0.2,
        color: groundColor,
        alpha: mars ? 0.4 : 0.45,
        drag: mars ? 1.5 : 0.05,
        gravity: mars ? 0.4 : G.moon,
      });
    }
    audio?.setRover(Math.abs(rv.speed) / 7);

    // Echoes.
    echoes.forEach((e, i) => {
      if (e.taken) {
        e.fade = Math.max(0, e.fade - dt * 1.5);
        e.g.scale.setScalar(Math.max(0.001, e.fade));
        if (e.fade <= 0) e.g.visible = false;
        return;
      }
      if (Math.hypot(e.at.x - rv.x, e.at.z - rv.z) < 3.6 && phase === "drive") {
        e.taken = true;
        audio?.play("echo");
        for (let k = 0; k < 60; k++) {
          const d = V(Math.random() - 0.5, Math.random() - 0.2, Math.random() - 0.5).normalize().multiplyScalar(2 + Math.random() * 6);
          fire.spawn({ x: e.g.position.x, y: e.g.position.y + 1.6, z: e.g.position.z, vx: d.x, vy: d.y + 2, vz: d.z, life: 0.8 + Math.random() * 0.8, size: 0.25 + Math.random() * 0.4, color: 0x7af0ff, alpha: 1, drag: 1.4 });
        }
        cb.echo(i);
      }
    });

    // Arrival.
    const md = Math.hypot(machinePos.x - rv.x, machinePos.z - rv.z);
    const reach = cfg.mode === "lost" ? 14 : 6.5 + cfg.size * 0.6;
    if (!arrived && phase === "drive" && md < reach) {
      arrived = true;
      setPhase("arrive");
      audio?.setRover(0);
      audio?.setSonar(null);
      if (mars) duskTo = 0.75;
      drag.yaw = 0;
      setTimeout(() => cb.arrive(), 900);
    }

    // Sonar toward the nearest thing still to find.
    if (phase === "drive") {
      let best: { d: number; kind: "echo" | "machine" } = { d: arrived ? Infinity : md, kind: "machine" };
      for (const e of echoes) if (!e.taken) {
        const d = Math.hypot(e.at.x - rv.x, e.at.z - rv.z);
        if (d < best.d && d < 70) best = { d, kind: "echo" };
      }
      audio?.setSonar(best.d < 220 ? 1 - Math.min(1, best.d / 180) : null, best.kind);
    }

    // HUD.
    const camYaw = Math.atan2(camLookS.x - camera.position.x, camLookS.z - camera.position.z);
    const targets: DriveFrame["targets"] = [
      { kind: "machine", i: 0, bearing: wrap(Math.atan2(machinePos.x - rv.x, machinePos.z - rv.z) - camYaw), dist: md, done: arrived },
      ...echoes.map((e, i) => ({ kind: "echo" as const, i, bearing: wrap(Math.atan2(e.at.x - rv.x, e.at.z - rv.z) - camYaw), dist: Math.hypot(e.at.x - rv.x, e.at.z - rv.z), done: e.taken })),
    ];
    cb.frame({ kind: "drive", speed: rv.speed, targets });
  };

  // ---------- camera ----------
  const v1 = V();
  const v2 = V();
  const placeCamera = (dt: number) => {
    const up = V(0, 1, 0);
    let want: T.Vector3;
    let at: T.Vector3;
    let k = 4;
    camera.up.set(0, 1, 0);
    if (phase === "entry" || phase === "descent") {
      const alt = Math.max(0, pos.y - H(pos.x, pos.z));
      if (phase === "entry") {
        const t = clamp(phaseT / (mars ? 3.6 : 2.6), 0, 1);
        const e = t * t * (3 - 2 * t);
        const side = v1.copy(R).multiplyScalar(16 * (1 - e)).addScaledVector(A, -12 - 10 * e);
        want = pos.clone().add(side).addScaledVector(up, -4 + 12 * e);
        at = pos.clone().addScaledVector(up, mars ? 6 * (1 - e) + 1 : 1);
        k = 6;
      } else if (camMode === "top") {
        want = pos.clone().addScaledVector(up, 26 + alt * 0.35).addScaledVector(A, -3);
        at = V(pos.x, H(pos.x, pos.z), pos.z).addScaledVector(A, 1);
        camera.up.set(A.x, 0, A.z);
        k = 5;
      } else {
        const pitch = ((16 + 32 * clamp(alt / 420, 0, 1)) * Math.PI) / 180;
        const dir = v1.copy(A).multiplyScalar(Math.cos(pitch)).addScaledVector(up, -Math.sin(pitch));
        const dist = 15 + Math.min(alt, 500) * 0.03;
        want = pos.clone().addScaledVector(dir, -dist).addScaledVector(up, 2.2);
        at = pos.clone().addScaledVector(dir, 30);
      }
    } else if (phase === "touchdown" || phase === "crashed") {
      const a = approachAng + Math.PI + phaseT * 0.22 + drag.yaw;
      want = pos.clone().add(V(Math.sin(a) * 11, 3.6 + drag.pitch * 6, Math.cos(a) * 11));
      at = pos.clone().addScaledVector(up, phase === "crashed" ? 1.5 : 1.4);
      k = phase === "crashed" ? 1.5 : 2;
    } else if (phase === "arrive") {
      const a = Math.atan2(rv.x - machinePos.x, rv.z - machinePos.z) + 0.5 + phaseT * 0.12 + drag.yaw;
      const rad = Math.max(7, cfg.size * 2.4 + 4);
      const top = site.position.y + (cfg.mode === "machine" ? cfg.size * 0.35 : 3.5);
      want = V(machinePos.x + Math.sin(a) * rad, top + 1.8 + drag.pitch * 6, machinePos.z + Math.cos(a) * rad);
      at = V(machinePos.x, top, machinePos.z);
      k = 1.6;
    } else {
      // Deploy and drive: chase the rover.
      const h = rv.h + drag.yaw;
      if (camMode === "top") {
        want = V(rv.x, H(rv.x, rv.z) + 30, rv.z).addScaledVector(fwd(rv.h), -2);
        at = V(rv.x, H(rv.x, rv.z), rv.z);
        const f = fwd(rv.h);
        camera.up.set(f.x, 0, f.z);
      } else {
        const back = fwd(h);
        want = V(rv.x, H(rv.x, rv.z), rv.z).addScaledVector(back, -7.5).addScaledVector(up, 3 + drag.pitch * 5);
        at = V(rv.x, H(rv.x, rv.z) + 1, rv.z).addScaledVector(fwd(rv.h), 3);
      }
      if (phase === "deploy") k = 2;
    }
    want.y = Math.max(want.y, H(want.x, want.z) + 1.2);
    if (!camInit) {
      camPos.copy(want);
      camLook.copy(at);
      camLookS.copy(at);
      camInit = true;
    }
    const s = 1 - Math.exp(-dt * k);
    camPos.lerp(want, s);
    camLookS.lerp(at, 1 - Math.exp(-dt * k * 1.5));
    camera.position.copy(camPos);
    if (shake > 0 && opts.shake) camera.position.add(v2.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(shake));
    camera.lookAt(camLookS);
    shake = Math.max(0, shake - dt * 1.4);
  };

  // ---------- the loop ----------
  startAttempt();
  let last = performance.now();
  let raf = 0;
  let deployT = 0;
  const deployFrom = V();
  const frameTimes: number[] = [];
  let pr = basePR;

  const step = (dtReal: number) => {
    const dt = dtReal * timeScale;
    time += dt;
    phaseT += dt;
    // The last few metres play out a little slower: more time to finesse, and it feels weightier.
    const finalMetres = phase === "descent" && pos.y - H(pos.x, pos.z) < 8 && vel.y < -0.5;
    const want = finalMetres && !auto ? 0.6 : 1;
    timeScale += (want - timeScale) * Math.min(1, dtReal * (want < 1 ? 3 : 0.8));

    // Merge inputs.
    const pad = pollPad();
    const kx = (kb.right ? 1 : 0) - (kb.left ? 1 : 0);
    const ky = (kb.up ? 1 : 0) - (kb.down ? 1 : 0);
    input.mx = clamp(kx + touch.x + (pad?.x ?? 0), -1, 1);
    input.my = clamp(ky + touch.y + (pad?.y ?? 0), -1, 1);
    input.thrust = Math.max(kb.space ? 1 : 0, touch.thrust, pad?.thrust ?? 0);
    input.brake = (phase === "drive" && kb.space) || touch.brake || !!pad?.brake;
    if (!drag.on) {
      drag.idle += dtReal;
      if (phase === "drive" && drag.idle > 1.2) {
        drag.yaw *= Math.exp(-dtReal * 2);
        drag.pitch *= Math.exp(-dtReal * 2);
      }
    }

    if (phase === "entry" || phase === "descent") updateDescent(dt);
    else if (phase === "touchdown" || phase === "crashed") {
      if (!landedSent && phaseT > (phase === "crashed" ? 1.0 : 1.3)) {
        landedSent = true;
        cb.landed(landing!);
      }
      audio?.setTension(0);
      if (mars) audio?.setWind(0.3);
    } else if (phase === "deploy") {
      deployT += dt;
      // Lower the rover from the dock to the ground, then roll it clear.
      const t1 = clamp(deployT / 1.6, 0, 1);
      const t2 = clamp((deployT - 1.6) / 2.4, 0, 1);
      const e1 = t1 * t1 * (3 - 2 * t1);
      const gy = H(deployFrom.x, deployFrom.z);
      rover.root.position.set(deployFrom.x, deployFrom.y + (gy - deployFrom.y) * e1, deployFrom.z);
      rover.root.rotation.set(0, approachAng, 0);
      if (t2 > 0) {
        const e2 = t2 * (2 - t2);
        rv.x = deployFrom.x + A.x * e2 * 11;
        rv.z = deployFrom.z + A.z * e2 * 11;
        rv.h = approachAng;
        rv.speed = 9 * (1 - t2);
        rv.wheel += dt * 8 * (1 - t2);
        for (const w of rover.wheels) w.rotation.x = rv.wheel;
        rover.root.position.set(rv.x, H(rv.x, rv.z), rv.z);
      }
      if (deployT > 4.1) {
        rv.speed = 0;
        setPhase("drive");
      }
    } else updateDrive(dt);

    // Lander pose.
    if (phase === "entry" || phase === "descent" || phase === "touchdown") {
      lander.root.position.copy(pos);
      lander.body.rotation.x = phase === "descent" ? tilt.x : 0;
      if (phase === "descent") lander.body.rotation.z = tilt.z;
    }
    if (phase === "touchdown") {
      lander.body.rotation.x *= 0.9;
      lander.body.rotation.z *= 0.9;
    }
    // Rover rides on the lander until it is lowered.
    if (phase === "entry" || phase === "descent" || phase === "touchdown") {
      lander.root.updateMatrixWorld(true);
      const dock = lander.dock.clone().applyMatrix4(lander.body.matrixWorld);
      rover.root.position.copy(dock);
      rover.root.rotation.set(lander.body.rotation.x, approachAng, lander.body.rotation.z);
      rover.root.visible = lander.root.visible;
    }
    const burning = (phase === "entry" || phase === "descent") && thrust > 0;
    lander.flameMat.uniforms.uThrottle.value += ((burning ? 0.6 + thrust * 0.4 : 0) - lander.flameMat.uniforms.uThrottle.value) * Math.min(1, dtReal * 18);
    lander.flameMat.uniforms.uTime.value = time;
    lander.flame.visible = lander.flameMat.uniforms.uThrottle.value > 0.01;
    lander.engineLight.intensity = lander.flameMat.uniforms.uThrottle.value * (dark ? 300 : 60) * (0.85 + Math.random() * 0.3);
    lander.nav.forEach((n, i) => (n.visible = Math.sin(time * 3 + i * 1.5) > 0.6));
    rover.lamp.visible = Math.sin(time * 4) > 0;

    // Footprint and drop line under the lander.
    const showFoot = phase === "descent" || phase === "entry";
    foot.visible = drop.visible = showFoot;
    if (showFoot) {
      const gy = H(pos.x, pos.z);
      foot.position.set(pos.x, gy + 0.1, pos.z);
      dropGeo.attributes.position.setXYZ(0, pos.x, gy, pos.z);
      dropGeo.attributes.position.setXYZ(1, pos.x, pos.y, pos.z);
      dropGeo.attributes.position.needsUpdate = true;
      drop.computeLineDistances();
      const near = Math.hypot(pos.x, pos.z) <= ZONE_R;
      ((foot.material as T.MeshBasicMaterial).color as T.Color).setHex(near ? 0x7af0ff : 0xffffff);
    }
    zone.visible = phase !== "drive" && phase !== "arrive" && phase !== "deploy";

    // Debris.
    for (const d of debris) {
      d.v.y -= g * dt;
      d.m.position.addScaledVector(d.v, dt);
      d.m.rotation.x += d.w.x * dt;
      d.m.rotation.y += d.w.y * dt;
      const gy = H(d.m.position.x, d.m.position.z);
      if (d.m.position.y < gy + 0.05) {
        d.m.position.y = gy + 0.05;
        d.v.multiplyScalar(0.35);
        d.v.y = Math.abs(d.v.y) * 0.4;
        d.w.multiplyScalar(0.5);
      }
    }

    // Ambient drifting dust on Mars.
    if (mars && Math.random() < (q === "low" ? 0.3 : 0.9)) {
      const c = camera.position;
      dust.spawn({ x: c.x + (Math.random() - 0.5) * 60, y: H(c.x, c.z) + Math.random() * 12, z: c.z + (Math.random() - 0.5) * 60, vx: wind.x * 12 + 1.2, vy: (Math.random() - 0.5) * 0.3, vz: wind.z * 12 + 0.6, life: 5 + Math.random() * 4, size: 0.08 + Math.random() * 0.12, color: 0xf2c9a0, alpha: 0.35, drag: 0 });
    }
    dust.update(dt);
    fire.update(dt);

    // Echo, beacon and hologram animation.
    echoes.forEach((e, i) => {
      if (e.taken) return;
      e.core.position.y = 1.6 + Math.sin(time * 1.8 + i) * 0.25;
      e.halo.position.y = e.core.position.y;
      e.core.rotation.y = time * 0.9;
      e.ring.scale.setScalar(1 + ((time + i * 0.4) % 2) * 0.5);
      (e.ring.material as T.MeshBasicMaterial).opacity = 0.7 * (1 - ((time + i * 0.4) % 2) / 2);
      ((e.beam.material as T.ShaderMaterial).uniforms.uTime.value = time);
    });
    pulse.scale.setScalar(1 + (time % 2) * 0.8);
    (pulse.material as T.MeshBasicMaterial).opacity = 0.5 * (1 - (time % 2) / 2);
    const bu = (beam.material as T.ShaderMaterial).uniforms;
    bu.uTime.value = time;
    const near = phase === "drive" || phase === "arrive" ? Math.hypot(machinePos.x - rv.x, machinePos.z - rv.z) : 200;
    bu.uStrength.value += (clamp((near - 6) / 50, 0.12, 0.9) - bu.uStrength.value) * Math.min(1, dt * 2);
    holo.uniforms.uTime.value = time;
    if (cfg.mode !== "machine") {
      model.rotation.y += dt * 0.25;
      model.position.y = (cfg.mode === "lost" ? 2.5 : 3.2) + Math.sin(time * 0.8) * 0.2;
    }

    // Dusk at the end of a visit on Mars.
    dusk += (duskTo - dusk) * Math.min(1, dt * 0.25);
    if (mars) {
      skyU.uDusk.value = dusk;
      (scene.fog as T.FogExp2).color.copy(horizon).lerp(horizonDusk, dusk);
      sun.intensity = 2.6 * (1 - dusk * 0.45);
      hemi.intensity = 0.85 * (1 - dusk * 0.5);
      starMat.opacity = Math.max(0, dusk - 0.35) * 1.2;
    }

    // Shadow and sky follow the action.
    const focus = phase === "drive" || phase === "deploy" ? rover.root.position : phase === "arrive" ? site.position : pos;
    sun.target.position.copy(focus);
    sun.position.copy(focus).addScaledVector(sunDir, 600);
    if (phase === "entry" || phase === "descent") sc.far = 600 + Math.min(2600, Math.max(0, pos.y - H(pos.x, pos.z)) / Math.max(0.05, sunDir.y) + 60);
    else sc.far = 1400;
    sc.updateProjectionMatrix();
    placeCamera(dtReal);
    stars.position.copy(camera.position);
    if (earth && earthDir) {
      earth.position.copy(camera.position).addScaledVector(earthDir, 4000);
      earth.rotation.y = time * 0.01;
    }
    sunView.copy(sunDir).transformDirection(camera.matrixWorldInverse);

    // Fades.
    fade += (fadeTo - fade) * Math.min(1, dtReal * 3);
    if (grade) {
      grade.uniforms.uFade.value = fade;
      grade.uniforms.uTime.value = time % 10;
    } else fadeEl.style.opacity = String(fade);
  };

  const render = () => {
    if (composer) composer.render();
    else renderer.render(scene, camera);
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dtReal = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (paused) return;
    step(dtReal);
    render();
    // If frames are slow, drop the resolution once.
    frameTimes.push(dtReal);
    if (frameTimes.length > 120) {
      const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      frameTimes.length = 0;
      if (avg > 0.03 && pr > 1) {
        pr = 1;
        renderer.setPixelRatio(pr);
        resize();
      }
    }
  };
  raf = requestAnimationFrame(loop);
  cb.progress?.("");
  audio?.setHum(!mars);

  const keyMap: Record<string, keyof typeof kb> = {
    KeyW: "up",
    ArrowUp: "up",
    KeyS: "down",
    ArrowDown: "down",
    KeyA: "left",
    ArrowLeft: "left",
    KeyD: "right",
    ArrowRight: "right",
    Space: "space",
  };

  return {
    key(code, down) {
      const k = keyMap[code];
      if (k) {
        kb[k] = down;
        return true;
      }
      if (code === "KeyC" && down) {
        camMode = camMode === "chase" ? "top" : "chase";
        return true;
      }
      return false;
    },
    touch(t) {
      Object.assign(touch, t);
    },
    restart() {
      attempt++;
      fade = 1;
      startAttempt();
    },
    deploy() {
      if (phase !== "touchdown") return;
      lander.root.updateMatrixWorld(true);
      deployFrom.copy(lander.dock).applyMatrix4(lander.body.matrixWorld);
      deployT = 0;
      tracks.reset();
      audio?.play("deploy");
      setPhase("deploy");
    },
    resume() {
      if (phase === "arrive") setPhase("drive");
    },
    skip() {
      if (phase === "entry") phaseT = 99;
    },
    placeLight() {
      lantern.visible = true;
      for (let k = 0; k < 40; k++) {
        const d = V(Math.random() - 0.5, Math.random(), Math.random() - 0.5).normalize().multiplyScalar(1 + Math.random() * 2);
        fire.spawn({ x: lantern.position.x, y: lantern.position.y + 1, z: lantern.position.z, vx: d.x, vy: d.y, vz: d.z, life: 1 + Math.random(), size: 0.2 + Math.random() * 0.3, color: 0xffb36b, alpha: 1, drag: 1.2 });
      }
    },
    photo() {
      render();
      return renderer.domElement.toDataURL("image/jpeg", 0.92);
    },
    setPaused(p) {
      paused = p;
      if (p) {
        onBlur();
        audio?.quiet();
      }
      else {
        last = performance.now();
        audio?.setHum(!mars);
      }
    },
    setOptions(o) {
      opts = { ...opts, ...o };
    },
    setInset(px) {
      inset = px;
      resize();
    },
    debug(cmd) {
      // Test helpers: skip straight to a landing at the zone, or park the rover by the machine.
      if (cmd === "land" && (phase === "entry" || phase === "descent")) {
        pos.set(3, H(3, 4) + 0.5, 4);
        vel.set(0, -1, 0);
        phase = "descent";
      }
      if (cmd === "arrive" && phase === "drive") {
        const d = fwd(Math.atan2(machinePos.x, machinePos.z));
        const reach = cfg.mode === "lost" ? 14 : 6.5 + cfg.size * 0.6;
        rv.x = machinePos.x - d.x * (reach + 0.5);
        rv.z = machinePos.z - d.z * (reach + 0.5);
        rv.h = Math.atan2(d.x, d.z);
        rv.speed = 1.5;
        auto = false;
      }
    },
    toggleCamera() {
      camMode = camMode === "chase" ? "top" : "chase";
    },
    autopilot(on) {
      auto = on;
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onBlur);
      audio?.quiet();
      scene.traverse((o) => {
        const m = o as T.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        for (const mt of mats) {
          for (const v of Object.values(mt)) if (v && typeof v === "object" && "isTexture" in v) (v as T.Texture).dispose();
          mt.dispose();
        }
      });
      dust.dispose();
      fire.dispose();
      glow.dispose();
      soft.dispose();
      composer?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      fadeEl.remove();
    },
  };
}
