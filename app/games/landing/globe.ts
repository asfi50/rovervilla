/**
 * Orbit view for Touchdown: a textured Mars or Moon you can spin, with a marker at each
 * machine's real resting place. Maps: NASA 3D Resources (Mars) and USGS/LROC WAC (Moon),
 * both public domain, in public/game/.
 */
import type * as T from "three";

export type GlobeSite = { slug: string; lat: number; lon: number };

export type GlobeApi = {
  focus: (slug: string | null) => void;
  setFound: (slugs: string[], lights: string[]) => void;
  /** Title screen: far away, slowly turning, no labels. */
  setTitle: (on: boolean) => void;
  /** Dive toward a site before the descent starts. */
  dive: (slug: string) => Promise<void>;
  dispose: () => void;
};

/** Position on a unit sphere for an equirectangular map centred on 0° longitude. */
export const latLon = (THREE: typeof T, lat: number, lon: number, r = 1) => {
  const p = (lat * Math.PI) / 180;
  const l = (lon * Math.PI) / 180;
  return new THREE.Vector3(Math.cos(p) * Math.cos(l) * r, Math.sin(p) * r, -Math.cos(p) * Math.sin(l) * r);
};

export async function createGlobe(
  host: HTMLElement,
  opts: { body: "mars" | "moon"; sites: GlobeSite[]; title?: boolean; onPick: (slug: string) => void; label: (slug: string, x: number, y: number, visible: boolean) => void },
): Promise<GlobeApi> {
  const THREE = await import("three");
  const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
  const mars = opts.body === "mars";

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.domElement.className = "absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing";
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 200);
  let title = !!opts.title;
  // Start facing where most sites are: the Moon's near side, Mars' Chryse–Meridiani region.
  const home = latLon(THREE, 12, mars ? -30 : -10, 3.6);
  camera.position.copy(home).multiplyScalar(title ? 2.2 : 1.8);

  const tex = await new THREE.TextureLoader().loadAsync(mars ? "/game/mars-map.jpg" : "/game/moon-map.jpg");
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const globe = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96), new THREE.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: mars ? 2 : 3, roughness: 1, metalness: 0 }));
  scene.add(globe);

  // Atmosphere: a fresnel rim, thin and dusty for Mars, a faint cold edge for the airless Moon.
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(1.035, 96, 64),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      uniforms: { uColor: { value: new THREE.Color(mars ? 0xff9a66 : 0x8fa0ff) }, uPow: { value: mars ? 4.5 : 6.0 }, uK: { value: mars ? 0.8 : 0.35 } },
      vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `uniform vec3 uColor; uniform float uPow; uniform float uK; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(max(1.0 - abs(dot(vN, vV)), 0.00001), uPow); gl_FragColor = vec4(uColor * f * uK, f); }`,
    }),
  );
  scene.add(atmo);

  scene.add(new THREE.AmbientLight(0xffffff, 0.16));
  const sun = new THREE.DirectionalLight(0xffffff, 3.0);
  sun.position.set(4, 1.5, 5);
  scene.add(sun);

  // Stars, with a few brighter ones.
  const starGeo = new THREE.BufferGeometry();
  const N = 2400;
  const starPos = new Float32Array(N * 3);
  const starCol = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(60 + Math.random() * 40);
    starPos.set([v.x, v.y, v.z], i * 3);
    const b = 0.25 + Math.random() ** 4 * 1.4;
    starCol.set([b, b * 0.97, b * (1 + Math.random() * 0.1)], i * 3);
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute("color", new THREE.BufferAttribute(starCol, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 1.5, sizeAttenuation: false, vertexColors: true })));

  // Glow sprite texture for markers.
  const cv = document.createElement("canvas");
  cv.width = cv.height = 64;
  const cx = cv.getContext("2d")!;
  const gr = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.3, "rgba(255,255,255,0.6)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  cx.fillStyle = gr;
  cx.fillRect(0, 0, 64, 64);
  const glowTex = new THREE.CanvasTexture(cv);

  // Site markers: a glow, a ring and a beam for the selected one; all pickable.
  const markers = new Map<string, { group: T.Group; ring: T.Mesh; dot: T.Sprite; beam: T.Mesh }>();
  const pickables: T.Object3D[] = [];
  for (const s of opts.sites) {
    const pos = latLon(THREE, s.lat, s.lon, 1.002);
    const group = new THREE.Group();
    group.position.copy(pos);
    group.lookAt(pos.clone().multiplyScalar(2));
    const dot = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x9d86ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    dot.scale.setScalar(0.06);
    dot.position.z = 0.004;
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.026, 40), new THREE.MeshBasicMaterial({ color: 0x9d86ff, side: THREE.DoubleSide, transparent: true, depthWrite: false }));
    const beamGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.35, 8, 1, true);
    beamGeo.rotateX(Math.PI / 2);
    beamGeo.translate(0, 0, 0.175);
    const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: 0xc9bbff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
    hit.userData.slug = s.slug;
    group.add(dot, ring, beam, hit);
    globe.add(group);
    pickables.push(hit);
    markers.set(s.slug, { group, ring, dot, beam });
  }

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 1.5;
  controls.maxDistance = 9;
  controls.autoRotate = true;
  controls.autoRotateSpeed = title ? 0.25 : 0.45;
  controls.rotateSpeed = 0.6;
  controls.zoomSpeed = 0.6;

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Widen the view on tall, narrow screens so the whole globe fits.
    camera.fov = camera.aspect < 1 ? Math.min(70, (35 / Math.max(0.45, camera.aspect)) * 0.8) : 35;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  // Picking.
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let down: { x: number; y: number } | null = null;
  const onDown = (e: PointerEvent) => (down = { x: e.clientX, y: e.clientY });
  const onUp = (e: PointerEvent) => {
    if (title || !down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(pickables, false)[0];
    if (hit) opts.onPick(hit.object.userData.slug);
  };
  renderer.domElement.addEventListener("pointerdown", onDown);
  renderer.domElement.addEventListener("pointerup", onUp);

  // Camera flights.
  let fly: { from: T.Vector3; to: T.Vector3; t: number; speed: number; done?: () => void } | null = {
    from: camera.position.clone(),
    to: home.clone().multiplyScalar(title ? 1.25 : 1),
    t: 0,
    speed: 0.008,
  };
  let selected: string | null = null;
  let found = new Set<string>();
  let lights = new Set<string>();

  const v = new THREE.Vector3();
  const world = new THREE.Vector3();
  const toCam = new THREE.Vector3();
  let raf = 0;
  const t0 = performance.now();
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const t = (performance.now() - t0) / 1000;
    if (fly) {
      fly.t = Math.min(1, fly.t + fly.speed);
      const e = fly.t < 0.5 ? 4 * fly.t ** 3 : 1 - (-2 * fly.t + 2) ** 3 / 2;
      const len = fly.from.length() + (fly.to.length() - fly.from.length()) * e;
      camera.position.copy(fly.from).lerp(fly.to, e).setLength(len);
      if (fly.t >= 1) {
        const done = fly.done;
        fly = null;
        done?.();
      }
    }
    controls.update();
    markers.forEach((m, slug) => {
      const sel = slug === selected;
      const lit = lights.has(slug);
      const col = sel ? 0xffffff : lit ? 0xffb36b : found.has(slug) ? 0x34d399 : 0x9d86ff;
      m.ring.scale.setScalar(sel ? 1.5 + Math.sin(t * 4) * 0.25 : 1 + ((t * 0.6 + slug.length * 0.13) % 1) * 0.4);
      (m.ring.material as T.MeshBasicMaterial).color.setHex(col);
      (m.ring.material as T.MeshBasicMaterial).opacity = sel ? 1 : 0.8 - ((t * 0.6 + slug.length * 0.13) % 1) * 0.5;
      (m.dot.material as T.SpriteMaterial).color.setHex(col);
      m.dot.scale.setScalar((sel ? 0.09 : 0.055) * (lit ? 1.2 + Math.sin(t * 2 + slug.length) * 0.15 : 1));
      const bm = m.beam.material as T.MeshBasicMaterial;
      bm.opacity += ((sel ? 0.8 : 0) - bm.opacity) * 0.1;
      m.group.getWorldPosition(world);
      // Hidden when on the far side of the globe.
      const facing = world.clone().normalize().dot(toCam.copy(camera.position).sub(world).normalize()) > 0.08;
      v.copy(world).project(camera);
      opts.label(slug, ((v.x + 1) / 2) * host.clientWidth, ((1 - v.y) / 2) * host.clientHeight, facing && !title);
    });
    renderer.render(scene, camera);
  };
  loop();

  return {
    focus(slug) {
      selected = slug;
      controls.autoRotate = slug === null;
      if (!slug) return;
      const m = markers.get(slug);
      if (!m) return;
      m.group.getWorldPosition(world);
      fly = { from: camera.position.clone(), to: world.clone().normalize().multiplyScalar(2.6), t: 0, speed: 0.02 };
    },
    setFound(slugs, lit) {
      found = new Set(slugs);
      lights = new Set(lit);
    },
    setTitle(on) {
      title = on;
      controls.autoRotateSpeed = on ? 0.25 : 0.45;
      fly = { from: camera.position.clone(), to: camera.position.clone().setLength(on ? 4.5 : 3.6), t: 0, speed: 0.012 };
    },
    dive(slug) {
      const m = markers.get(slug);
      if (!m) return Promise.resolve();
      m.group.getWorldPosition(world);
      controls.autoRotate = false;
      controls.enabled = false;
      return new Promise((done) => {
        fly = { from: camera.position.clone(), to: world.clone().normalize().multiplyScalar(1.12), t: 0, speed: 0.018, done };
      });
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      scene.traverse((o) => {
        const m = o as T.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        for (const mt of mats) mt.dispose();
      });
      tex.dispose();
      glowTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
