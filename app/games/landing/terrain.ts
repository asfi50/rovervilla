/**
 * Touchdown's ground: procedural terrain for each resting place. The shapes are invented, but
 * each site gets the character NASA's photos show: Meridiani's ripples, Utopia's rocks, Phoenix's
 * patterned arctic ground, the permanently shadowed floor of Cabeus. Units are metres, y up; the
 * landing zone is centred on the origin.
 */
import type * as T from "three";

export type Look = {
  body: "mars" | "moon";
  /** Macro relief in metres. */
  rough: number;
  /** Crater density, 0..2. */
  craters: number;
  /** Rock density, 0..2. */
  rocks: number;
  ripples?: number;
  polygons?: number;
  ice?: number;
  /** Mountains on the horizon; `dir` in radians limits them to one side. */
  hills?: { amp: number; dir?: number; near?: number };
  /** A sinuous channel, depth in metres. */
  rille?: number;
  /** Permanently shadowed floor: no direct sunlight below the rim. */
  dark?: boolean;
  /** A big slope rising beyond the site, in metres. */
  ramp?: number;
  colors: { base: number; dark: number; light: number; rock: number };
  sun: { elev: number; az: number };
};

const LOOKS: Record<string, Look> = {
  "ranger-7": { body: "moon", rough: 2.2, craters: 1.5, rocks: 0.7, colors: { base: 0x75757a, dark: 0x58585d, light: 0x9a9a9e, rock: 0x4f4f54 }, sun: { elev: 14, az: 250 } },
  "surveyor-1": { body: "moon", rough: 2, craters: 1.3, rocks: 0.9, colors: { base: 0x77767a, dark: 0x5a595d, light: 0x9c9b9e, rock: 0x515055 }, sun: { elev: 16, az: 100 } },
  "apollo-11-lander": { body: "moon", rough: 1.8, craters: 1.4, rocks: 0.8, colors: { base: 0x7a797c, dark: 0x5c5b5f, light: 0x9e9da0, rock: 0x535257 }, sun: { elev: 12, az: 95 } },
  "apollo-15-rover": {
    body: "moon",
    rough: 3,
    craters: 1,
    rocks: 1,
    hills: { amp: 520, dir: 3.6, near: 900 },
    rille: 28,
    colors: { base: 0x858380, dark: 0x625f5c, light: 0xaaa7a2, rock: 0x5a5753 },
    sun: { elev: 18, az: 110 },
  },
  lcross: { body: "moon", rough: 3.5, craters: 1.2, rocks: 0.9, hills: { amp: 420, near: 1300 }, dark: true, colors: { base: 0x8a8884, dark: 0x66645f, light: 0xb2afa9, rock: 0x5d5b57 }, sun: { elev: 2.5, az: 30 } },
  grail: { body: "moon", rough: 4, craters: 1.1, rocks: 1, ramp: 160, hills: { amp: 300, near: 1000 }, colors: { base: 0x8b8985, dark: 0x67655f, light: 0xb4b1ab, rock: 0x5e5c58 }, sun: { elev: 8, az: 200 } },
  "viking-1": { body: "mars", rough: 2.5, craters: 0.6, rocks: 1.3, colors: { base: 0xb06a43, dark: 0x70402a, light: 0xd29a6c, rock: 0x4f2e22 }, sun: { elev: 38, az: 120 } },
  "viking-2": { body: "mars", rough: 1.6, craters: 0.3, rocks: 2, colors: { base: 0xa8694a, dark: 0x6a3f2c, light: 0xcf9d78, rock: 0x4a2c22 }, sun: { elev: 30, az: 210 } },
  "pathfinder-sojourner": {
    body: "mars",
    rough: 2.4,
    craters: 0.5,
    rocks: 1.6,
    hills: { amp: 90, dir: 4.2, near: 700 },
    colors: { base: 0xb36d45, dark: 0x6f412b, light: 0xd8a074, rock: 0x553124 },
    sun: { elev: 40, az: 140 },
  },
  "mars-polar-lander": { body: "mars", rough: 3, craters: 0.2, rocks: 0.3, ice: 1, colors: { base: 0xa27556, dark: 0x6d4a36, light: 0xc9a283, rock: 0x5a3f30 }, sun: { elev: 14, az: 300 } },
  spirit: { body: "mars", rough: 2.4, craters: 0.9, rocks: 1.4, hills: { amp: 160, dir: 1.2, near: 800 }, colors: { base: 0xa9673f, dark: 0x6b3e27, light: 0xcc9468, rock: 0x4c2d21 }, sun: { elev: 26, az: 330 } },
  opportunity: { body: "mars", rough: 1.6, craters: 0.6, rocks: 0.25, ripples: 1, hills: { amp: 70, dir: 5.2, near: 900 }, colors: { base: 0x94593a, dark: 0x5e3726, light: 0xbf8659, rock: 0x4d2d22 }, sun: { elev: 34, az: 60 } },
  phoenix: { body: "mars", rough: 1.2, craters: 0.2, rocks: 0.25, polygons: 1, colors: { base: 0xa47a5c, dark: 0x6f523f, light: 0xc8a789, rock: 0x5c4434 }, sun: { elev: 22, az: 160 } },
  insight: { body: "mars", rough: 1, craters: 0.5, rocks: 0.45, colors: { base: 0xb17049, dark: 0x74462f, light: 0xd5a079, rock: 0x553224 }, sun: { elev: 44, az: 80 } },
  ingenuity: { body: "mars", rough: 2.6, craters: 0.7, rocks: 1.1, hills: { amp: 140, dir: 0.4, near: 900 }, colors: { base: 0xad6b45, dark: 0x6f4029, light: 0xd09a6f, rock: 0x523025 }, sun: { elev: 32, az: 250 } },
};

export const lookFor = (slug: string, body: "mars" | "moon"): Look =>
  LOOKS[slug] ?? { body, rough: 2, craters: 1, rocks: 1, colors: LOOKS[body === "mars" ? "viking-1" : "ranger-7"].colors, sun: { elev: 30, az: 120 } };

// ---------- noise ----------

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** 2D gradient noise in roughly [-1, 1]. */
export function makeNoise(seed: number) {
  const r = rng(seed);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const gx = [1, -1, 1, -1, 1.41, -1.41, 0, 0];
  const gy = [1, 1, -1, -1, 0, 0, 1.41, -1.41];
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const X = xi & 255;
    const Y = yi & 255;
    const g = (i: number, j: number, dx: number, dy: number) => {
      const h = perm[perm[X + i] + Y + j] & 7;
      return gx[h] * dx + gy[h] * dy;
    };
    const u = fade(xf);
    const v = fade(yf);
    const a = g(0, 0, xf, yf);
    const b = g(1, 0, xf - 1, yf);
    const c = g(0, 1, xf, yf - 1);
    const d = g(1, 1, xf - 1, yf - 1);
    return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 0.9;
  };
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

type Crater = { x: number; z: number; r: number; d: number; rim: number };

export type Ground = {
  look: Look;
  heightAt: (x: number, z: number) => number;
  /** Surface normal (unnormalised components are fine for slope checks). */
  normalAt: (x: number, z: number) => { x: number; y: number; z: number };
  /** Big rocks the rover bumps into. */
  boulders: { x: number; z: number; r: number }[];
  /** Craters near the zone, for dust and for the minimap. */
  craters: Crater[];
};

/**
 * Build the height field. `zone` is flattened for landing; `site` is levelled for the machine
 * (or gets a fresh impact crater, for the machines that were flown into the ground).
 */
export function makeGround(seed: number, look: Look, site: { x: number; z: number; mode: "machine" | "crater" | "lost" }): Ground {
  const n1 = makeNoise(seed);
  const n2 = makeNoise(seed + 101);
  const n3 = makeNoise(seed + 202);
  const r = rng(seed + 7);
  const moon = look.body === "moon";

  // Craters at three scales, bucketed on a grid so lookups stay cheap.
  const craters: Crater[] = [];
  const add = (count: number, rMin: number, rMax: number, spread: number, pow: number) => {
    for (let i = 0; i < count; i++) {
      const a = r() * Math.PI * 2;
      const dist = Math.sqrt(r()) * spread;
      const x = Math.cos(a) * dist;
      const z = Math.sin(a) * dist;
      const rad = rMin + (rMax - rMin) * r() ** pow;
      const fresh = 0.35 + r() * 0.65;
      // Keep the landing zone and the site clear of craters.
      if (Math.hypot(x, z) < 50 + rad || Math.hypot(x - site.x, z - site.z) < 16 + rad) continue;
      craters.push({ x, z, r: rad, d: (moon ? 0.3 : 0.22) * fresh, rim: (moon ? 0.06 : 0.04) * fresh });
    }
  };
  const k = look.craters;
  add(Math.round(30 * k), 40, 220, 2400, 2);
  add(Math.round(260 * k), 8, 40, 1100, 2.2);
  add(Math.round(900 * k), 1.2, 8, 420, 2.5);
  if (site.mode === "crater") craters.push({ x: site.x, z: site.z, r: 7, d: 0.34, rim: 0.08 });
  const CELL = 48;
  const buckets = new Map<number, Crater[]>();
  const key = (i: number, j: number) => (i + 512) * 1024 + (j + 512);
  for (const c of craters) {
    const ext = c.r * 2.2;
    for (let i = Math.floor((c.x - ext) / CELL); i <= Math.floor((c.x + ext) / CELL); i++)
      for (let j = Math.floor((c.z - ext) / CELL); j <= Math.floor((c.z + ext) / CELL); j++) {
        const kk = key(i, j);
        const list = buckets.get(kk);
        if (list) list.push(c);
        else buckets.set(kk, [c]);
      }
  }

  const fbm = (x: number, z: number, oct: number) => {
    let h = 0;
    let amp = 1;
    let f = 1;
    for (let o = 0; o < oct; o++) {
      h += n1(x * f, z * f) * amp;
      amp *= 0.5;
      f *= 2.03;
    }
    return h;
  };
  const ridged = (x: number, z: number) => {
    let h = 0;
    let amp = 1;
    let f = 1;
    for (let o = 0; o < 5; o++) {
      h += (1 - Math.abs(n2(x * f, z * f))) ** 2 * amp;
      amp *= 0.5;
      f *= 2.1;
    }
    return h;
  };

  // Polygons for the Martian arctic: a jittered-grid Voronoi, with troughs along the cell edges.
  const POLY = 5.5;
  const cellPt = (i: number, j: number) => {
    const h = Math.sin(i * 127.1 + j * 311.7 + seed) * 43758.5453;
    const h2 = Math.sin(i * 269.5 + j * 183.3 + seed) * 43758.5453;
    return [(i + (h - Math.floor(h)) * 0.8 + 0.1) * POLY, (j + (h2 - Math.floor(h2)) * 0.8 + 0.1) * POLY];
  };
  const polyEdge = (x: number, z: number) => {
    const ci = Math.floor(x / POLY);
    const cj = Math.floor(z / POLY);
    let d1 = 1e9;
    let d2 = 1e9;
    for (let i = ci - 1; i <= ci + 1; i++)
      for (let j = cj - 1; j <= cj + 1; j++) {
        const [px, pz] = cellPt(i, j);
        const d = Math.hypot(x - px, z - pz);
        if (d < d1) {
          d2 = d1;
          d1 = d;
        } else if (d < d2) d2 = d;
      }
    return d2 - d1;
  };

  const rilleAng = 0.7;
  const raw = (x: number, z: number) => {
    const rad = Math.hypot(x, z);
    let h = fbm(x * 0.0035, z * 0.0035, 5) * look.rough * 3 + n3(x * 0.03, z * 0.03) * look.rough * 0.35;
    // Craters.
    const list = buckets.get(key(Math.floor(x / CELL), Math.floor(z / CELL)));
    if (list)
      for (const c of list) {
        const d = Math.hypot(x - c.x, z - c.z) / c.r;
        if (d < 1) h += c.r * (c.d * (Math.max(d, 0.25) ** 2 - 1) + c.rim);
        else if (d < 2.2) h += c.r * c.rim * Math.exp(-(((d - 1) / 0.38) ** 2));
      }
    if (look.ripples && rad < 420) {
      const u = x * 0.86 + z * 0.5;
      h += look.ripples * 0.16 * Math.sin((u / 3.2) * Math.PI * 2 + n2(x * 0.04, z * 0.04) * 3) * (1 - smooth(260, 420, rad));
    }
    if (look.polygons && rad < 500) {
      const e = polyEdge(x, z);
      h -= look.polygons * 0.3 * (1 - smooth(0, 0.9, e)) * (1 - smooth(350, 500, rad));
      h += look.polygons * 0.1 * smooth(0.9, 2.5, e);
    }
    if (look.ice) {
      // Layered, terraced ground near the polar cap.
      const t = fbm(x * 0.002 + 9, z * 0.002, 3) * 30;
      h += look.ice * (Math.floor(t / 4) * 4 + smooth(0.7, 1, (t / 4) % 1) * 4) * 0.5 * smooth(150, 500, rad);
    }
    if (look.rille) {
      const u = x * Math.cos(rilleAng) + z * Math.sin(rilleAng);
      const v = -x * Math.sin(rilleAng) + z * Math.cos(rilleAng);
      const c = 380 + Math.sin(u / 210) * 70 + Math.sin(u / 77) * 14;
      const d = Math.abs(v - c);
      h -= look.rille * (1 - smooth(10, 75, d)) ** 1.4;
    }
    if (look.ramp) {
      const along = (x * site.x + z * site.z) / Math.max(1, Math.hypot(site.x, site.z));
      h += look.ramp * smooth(Math.hypot(site.x, site.z) - 60, Math.hypot(site.x, site.z) + 520, along) * (0.8 + 0.2 * n2(x * 0.01, z * 0.01));
    }
    if (look.hills) {
      const near = look.hills.near ?? 900;
      let w = smooth(near, near + 1300, rad);
      if (look.hills.dir !== undefined) w *= Math.max(0, Math.cos(Math.atan2(z, x) - look.hills.dir)) ** 1.5;
      if (w > 0) h += look.hills.amp * w * (ridged(x * 0.0011, z * 0.0011) * 0.55 + 0.15);
    }
    return h;
  };

  const siteH = raw(site.x, site.z);
  const heightAt = (x: number, z: number) => {
    let h = raw(x, z);
    // Landing zone: level at y = 0.
    const dz = Math.hypot(x, z);
    h *= smooth(46, 120, dz);
    if (site.mode === "machine") {
      const ds = Math.hypot(x - site.x, z - site.z);
      const flat = siteH * smooth(46, 120, Math.hypot(site.x, site.z));
      const w = smooth(8, 24, ds);
      h = flat + (h - flat) * w;
    }
    return h;
  };

  const normalAt = (x: number, z: number) => {
    const e = 0.6;
    const hx = heightAt(x + e, z) - heightAt(x - e, z);
    const hz = heightAt(x, z + e) - heightAt(x, z - e);
    const l = Math.hypot(hx, 2 * e, hz);
    return { x: -hx / l, y: (2 * e) / l, z: -hz / l };
  };

  return { look, heightAt, normalAt, boulders: [], craters: craters.filter((c) => Math.hypot(c.x, c.z) < 500) };
}

// ---------- meshes ----------

/** A tileable grey grain texture: used as both the colour detail and the bump map. */
function detailTexture(THREE: typeof T, seed: number, moon: boolean) {
  const S = 256;
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const ctx = cv.getContext("2d")!;
  const img = ctx.createImageData(S, S);
  const r = rng(seed);
  // Periodic value noise at a few octaves.
  const lattice = (p: number) => {
    const g = new Float32Array(p * p);
    for (let i = 0; i < g.length; i++) g[i] = r();
    return (x: number, y: number) => {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const xf = x - xi;
      const yf = y - yi;
      const at = (i: number, j: number) => g[(((j % p) + p) % p) * p + (((i % p) + p) % p)];
      const u = xf * xf * (3 - 2 * xf);
      const v = yf * yf * (3 - 2 * yf);
      const a = at(xi, yi);
      const b = at(xi + 1, yi);
      const c = at(xi, yi + 1);
      const d = at(xi + 1, yi + 1);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };
  };
  const octs = [8, 16, 32, 64].map((p) => ({ p, f: lattice(p) }));
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      let v = 0;
      let amp = 0.5;
      for (const o of octs) {
        v += (o.f((x / S) * o.p, (y / S) * o.p) - 0.5) * amp;
        amp *= 0.6;
      }
      let g = 0.8 + v * 0.55;
      // Pebbles and grains.
      if (r() < (moon ? 0.03 : 0.02)) g -= 0.15 + r() * 0.2;
      else if (r() < 0.02) g += 0.12;
      const c = Math.max(0, Math.min(255, g * 255));
      const i = (y * S + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = c;
      img.data[i + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;

  // A tangent-space normal map from the same grain (mipmaps well, unlike a bump map at distance).
  const ncv = document.createElement("canvas");
  ncv.width = ncv.height = S;
  const nctx = ncv.getContext("2d")!;
  const nimg = nctx.createImageData(S, S);
  const h = (x: number, y: number) => img.data[((((y + S) % S) * S + ((x + S) % S)) * 4)] / 255;
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * 2.2;
      const dy = (h(x, y + 1) - h(x, y - 1)) * 2.2;
      const l = Math.hypot(dx, dy, 1);
      const i = (y * S + x) * 4;
      nimg.data[i] = (-dx / l) * 127.5 + 127.5;
      nimg.data[i + 1] = (dy / l) * 127.5 + 127.5;
      nimg.data[i + 2] = (1 / l) * 127.5 + 127.5;
      nimg.data[i + 3] = 255;
    }
  nctx.putImageData(nimg, 0, 0);
  const normal = new THREE.CanvasTexture(ncv);
  normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
  normal.anisotropy = 8;
  return { tex, normal };
}

/**
 * The terrain mesh: one grid whose spacing is fine around the landing zone (where you drive) and
 * grows geometrically toward the horizon.
 */
export function buildTerrain(THREE: typeof T, g: Ground, seed: number, quality: "high" | "medium" | "low") {
  const N = quality === "high" ? 448 : quality === "medium" ? 320 : 224;
  const S = 2600;
  const R1 = 230;
  const f = 0.62;
  const innerSeg = (N * f) / 2;
  const d0 = R1 / innerSeg;
  const outerSeg = (N * (1 - f)) / 2;
  // Growth ratio so the outer segments reach S.
  let lo = 1.0001;
  let hi = 1.5;
  for (let i = 0; i < 60; i++) {
    const m = (lo + hi) / 2;
    const reach = R1 + (d0 * (m ** outerSeg - 1)) / (m - 1);
    if (reach > S) hi = m;
    else lo = m;
  }
  const ratio = (lo + hi) / 2;
  const map = (u: number) => {
    const a = Math.abs(u);
    const s = Math.sign(u);
    if (a <= f) return (s * R1 * a) / f;
    const kk = ((a - f) / (1 - f)) * outerSeg;
    return s * (R1 + (d0 * (ratio ** kk - 1)) / (ratio - 1));
  };
  const coords = Array.from({ length: N + 1 }, (_, i) => map((i / N) * 2 - 1));

  const count = (N + 1) * (N + 1);
  const pos = new Float32Array(count * 3);
  const uv = new Float32Array(count * 2);
  for (let j = 0; j <= N; j++)
    for (let i = 0; i <= N; i++) {
      const x = coords[i];
      const z = coords[j];
      const k = j * (N + 1) + i;
      pos[k * 3] = x;
      pos[k * 3 + 1] = g.heightAt(x, z);
      pos[k * 3 + 2] = z;
      uv[k * 2] = x / 3.5;
      uv[k * 2 + 1] = z / 3.5;
    }
  const idx = new Uint32Array(N * N * 6);
  let p = 0;
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const a = j * (N + 1) + i;
      const b = a + 1;
      const c = a + N + 1;
      const d = c + 1;
      idx.set([a, c, b, b, c, d], p);
      p += 6;
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.computeVertexNormals();

  // Colour: light and dark patches, darker rock on steep slopes, frost or ice where it belongs.
  const L = g.look;
  const base = new THREE.Color(L.colors.base);
  const dark = new THREE.Color(L.colors.dark);
  const light = new THREE.Color(L.colors.light);
  const rock = new THREE.Color(L.colors.rock);
  const ice = new THREE.Color(0xe9e5e0);
  const nrm = geo.attributes.normal as T.BufferAttribute;
  const n1 = makeNoise(seed + 303);
  const n2 = makeNoise(seed + 404);
  const col = new Float32Array(count * 3);
  const lit = new Float32Array(count);
  const c = new THREE.Color();
  for (let k = 0; k < count; k++) {
    const x = pos[k * 3];
    const y = pos[k * 3 + 1];
    const z = pos[k * 3 + 2];
    const patch = n1(x * 0.0015 + 40, z * 0.0015) * 0.7 + n1(x * 0.006, z * 0.006) * 0.6 + n2(x * 0.04, z * 0.04) * 0.3;
    c.copy(base);
    if (patch > 0) c.lerp(light, Math.min(1, patch * 1.1));
    else c.lerp(dark, Math.min(1, -patch * 1.1));
    const slope = 1 - nrm.getY(k);
    c.lerp(rock, Math.min(0.75, slope * 3.2));
    if (L.ice) {
      const iceAmt = smooth(0.05, 0.35, n2(x * 0.01 + 3, z * 0.01) + slope * 0.6 - 0.1) * smooth(80, 300, Math.hypot(x, z));
      c.lerp(ice, iceAmt * 0.85);
    }
    if (L.body === "moon") c.multiplyScalar(0.95 + Math.min(0.15, Math.max(-0.1, y * 0.004)));
    col.set([c.r, c.g, c.b], k * 3);
    // Below the crater rim of a permanently shadowed site, direct sunlight never arrives.
    lit[k] = L.dark ? smooth(1350, 1900, Math.hypot(x, z)) * smooth(60, 220, y) : 1;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("aLit", new THREE.BufferAttribute(lit, 1));

  const detail = detailTexture(THREE, seed, L.body === "moon");
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, map: detail.tex, normalMap: detail.normal, normalScale: new THREE.Vector2(0.9, 0.9), roughness: 1, metalness: 0 });
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute float aLit;\nvarying float vLit;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvLit = aLit;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vLit;")
      .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\nreflectedLight.directDiffuse *= vLit;\nreflectedLight.directSpecular *= vLit;");
  };
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  return mesh;
}

/** Rocks: three jittered shapes, instanced, mostly pebbles with the odd boulder. */
export function buildRocks(THREE: typeof T, g: Ground, seed: number, avoid: { x: number; z: number; r: number }[], quality: "high" | "medium" | "low") {
  const r = rng(seed + 55);
  const L = g.look;
  const shapes = [0, 1, 2].map((v) => {
    const geo = new THREE.IcosahedronGeometry(1, v === 2 ? 0 : 1);
    const p = geo.attributes.position as T.BufferAttribute;
    const n = makeNoise(seed + v * 17);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const z = p.getZ(i);
      const k = 1 + n(x * 1.7 + v, z * 1.7 + y) * 0.35;
      p.setXYZ(i, x * k, y * k * 0.72, z * k);
    }
    geo.computeVertexNormals();
    return geo;
  });
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, metalness: 0, flatShading: true });
  const scale = quality === "high" ? 1 : quality === "medium" ? 0.7 : 0.45;
  const total = Math.round(2400 * L.rocks * scale) + 30;
  const per = Math.ceil(total / 3);
  const meshes = shapes.map((geo) => {
    const m = new THREE.InstancedMesh(geo, mat, per);
    m.castShadow = quality !== "low";
    m.receiveShadow = true;
    return m;
  });
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const v = new THREE.Vector3();
  const s3 = new THREE.Vector3();
  const tint = new THREE.Color();
  const base = new THREE.Color(L.colors.rock);
  const boulders: { x: number; z: number; r: number }[] = [];
  const counts = [0, 0, 0];
  for (let i = 0; i < total; i++) {
    const big = i < 30;
    const a = r() * Math.PI * 2;
    const dist = big ? 60 + r() * 420 : 480 * r() ** 1.6;
    const x = Math.cos(a) * dist;
    const z = Math.sin(a) * dist;
    const s = big ? 1.4 + r() * 1.8 : 0.07 + 1.5 * r() ** 5;
    const blocked = avoid.some((o) => Math.hypot(x - o.x, z - o.z) < o.r + s) || (Math.hypot(x, z) < 38 && s > 0.16);
    const which = i % 3;
    const mesh = meshes[which];
    if (counts[which] >= per) continue;
    if (blocked) {
      m4.makeScale(0, 0, 0);
    } else {
      e.set(r() * 6, r() * 6, r() * 6);
      q.setFromEuler(e);
      v.set(x, g.heightAt(x, z) - s * 0.22, z);
      s3.set(s * (0.8 + r() * 0.5), s * (0.7 + r() * 0.5), s * (0.8 + r() * 0.5));
      m4.compose(v, q, s3);
      if (s > 0.45) boulders.push({ x, z, r: s * 0.95 });
    }
    mesh.setMatrixAt(counts[which], m4);
    tint.copy(base).multiplyScalar(0.75 + r() * 0.5);
    mesh.setColorAt(counts[which], tint);
    counts[which]++;
  }
  meshes.forEach((m, i) => {
    m.count = counts[i];
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  g.boulders = boulders;
  return meshes;
}
