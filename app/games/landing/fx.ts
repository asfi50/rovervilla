/**
 * Touchdown's visual effects: sky, Earth, particles, engine flame, beacons and holograms.
 */
import type * as T from "three";

type Three = typeof T;

/** A soft round sprite, used for glows and dust. */
export function glowTexture(THREE: Three, soft = 2) {
  const S = 128;
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const ctx = cv.getContext("2d")!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25 / soft, "rgba(255,255,255,0.8)");
  g.addColorStop(0.6, "rgba(255,255,255,0.15)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- sky ----------

/** Linear RGB of the Martian horizon by day and at dusk (fog matches it). */
export const MARS_HORIZON: [number, number, number] = [0.74, 0.47, 0.29];
export const MARS_DUSK: [number, number, number] = [0.4, 0.22, 0.15];

/** A sky dome. Mars: butterscotch with a pale blue glow around the Sun. Moon: black. */
export function makeSky(THREE: Three, body: "mars" | "moon", sunDir: T.Vector3) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uSun: { value: sunDir.clone() },
      uMars: { value: body === "mars" ? 1 : 0 },
      uDusk: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize((modelMatrix * vec4(position, 0.0)).xyz);
        vec4 p = projectionMatrix * viewMatrix * vec4(position + cameraPosition, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uSun;
      uniform float uMars;
      uniform float uDusk;
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        float h = clamp(d.y, -0.2, 1.0);
        float mu = max(dot(d, normalize(uSun)), 0.0);
        vec3 col;
        if (uMars > 0.5) {
          vec3 zenith = mix(vec3(0.33, 0.19, 0.12), vec3(0.12, 0.07, 0.08), uDusk);
          vec3 horizon = mix(vec3(0.74, 0.47, 0.29), vec3(0.40, 0.22, 0.15), uDusk);
          col = mix(horizon, zenith, pow(max(h, 0.00001), 0.55));
          // Forward scattering by the dust: a cool halo around the Sun, stronger near dusk.
          vec3 halo = vec3(0.62, 0.74, 0.92);
          col = mix(col, halo, pow(max(mu, 0.00001), 18.0) * (0.45 + uDusk * 0.5));
          col += halo * pow(max(mu, 0.00001), 160.0) * 0.6;
          col += vec3(1.0, 0.98, 0.94) * smoothstep(0.99985, 0.99993, mu) * 6.0;
          col *= 1.0 - 0.25 * (1.0 - smoothstep(-0.2, 0.0, d.y));
        } else {
          col = vec3(0.0);
          col += vec3(1.0, 0.98, 0.95) * smoothstep(0.99990, 0.99996, mu) * 12.0;
          col += vec3(1.0, 0.95, 0.85) * pow(max(mu, 0.00001), 900.0) * 1.2;
        }
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(5000, 48, 24), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return mesh;
}

export function makeStars(THREE: Three, count: number, dim = 1) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(4500);
    pos.set([v.x, v.y, v.z], i * 3);
    const b = (0.3 + Math.random() ** 3 * 1.6) * dim;
    const warm = Math.random();
    col.set([b * (0.9 + warm * 0.1), b * 0.95, b * (1.05 - warm * 0.15)], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, fog: false, depthWrite: false }));
  pts.frustumCulled = false;
  return pts;
}

/** Earth as seen from the Moon: oceans, land and cloud from noise, lit by the Sun. */
export function makeEarth(THREE: Three, noise: (x: number, y: number) => number) {
  const W = 256;
  const H = 128;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const lon = (x / W) * Math.PI * 2;
      const lat = (y / H - 0.5) * Math.PI;
      const px = Math.cos(lat) * Math.cos(lon);
      const pz = Math.cos(lat) * Math.sin(lon);
      const py = Math.sin(lat);
      const land = noise(px * 2.2 + 5, pz * 2.2 + py * 1.7) + noise(px * 5 + 1, pz * 5 + py * 4) * 0.4;
      const cloud = noise(px * 4 + 30, pz * 4 + py * 6) + noise(px * 9, py * 9 + pz * 3) * 0.5;
      let r = 18, g = 52, b = 120;
      if (land > 0.12) [r, g, b] = Math.abs(py) > 0.82 ? [235, 240, 245] : land > 0.4 ? [140, 120, 80] : [70, 110, 60];
      if (Math.abs(py) > 0.9) [r, g, b] = [240, 244, 248];
      const cl = Math.max(0, Math.min(1, (cloud - 0.15) * 2.2));
      const i = (y * W + x) * 4;
      img.data[i] = r + (250 - r) * cl;
      img.data[i + 1] = g + (252 - g) * cl;
      img.data[i + 2] = b + (255 - b) * cl;
      img.data[i + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const earth = new THREE.Mesh(new THREE.SphereGeometry(85, 48, 32), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, metalness: 0, fog: false, emissive: 0x0a1428, emissiveIntensity: 0.4 }));
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(90, 48, 32),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      fog: false,
      vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `varying vec3 vN; varying vec3 vV; void main(){ float f = pow(max(1.0 - abs(dot(vN, vV)), 0.00001), 3.0); gl_FragColor = vec4(vec3(0.35,0.6,1.0)*f*0.9, 1.0); }`,
    }),
  );
  earth.add(halo);
  return earth;
}

// ---------- particles ----------

type PSpawn = {
  x: number;
  y: number;
  z: number;
  vx?: number;
  vy?: number;
  vz?: number;
  life: number;
  size: number;
  grow?: number;
  color: T.Color | number;
  alpha?: number;
  drag?: number;
  gravity?: number;
};

/** A pool of camera-facing soft particles updated on the CPU. */
export class Particles {
  points: T.Points;
  private geo: T.BufferGeometry;
  private pos: Float32Array;
  private col: Float32Array;
  private size: Float32Array;
  private alpha: Float32Array;
  private vel: Float32Array;
  private life: Float32Array;
  private max: Float32Array;
  private grow: Float32Array;
  private a0: Float32Array;
  private drag: Float32Array;
  private grav: Float32Array;
  private next = 0;
  private c: T.Color;
  mat: T.ShaderMaterial;

  constructor(
    THREE: Three,
    private n: number,
    additive: boolean,
    tex: T.Texture,
    private ground?: (x: number, z: number) => number,
  ) {
    this.c = new THREE.Color();
    this.pos = new Float32Array(n * 3);
    this.col = new Float32Array(n * 3);
    this.size = new Float32Array(n);
    this.alpha = new Float32Array(n);
    this.vel = new Float32Array(n * 3);
    this.life = new Float32Array(n);
    this.max = new Float32Array(n);
    this.grow = new Float32Array(n);
    this.a0 = new Float32Array(n);
    this.drag = new Float32Array(n);
    this.grav = new Float32Array(n);
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute("position", new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute("color", new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute("aSize", new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute("aAlpha", new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    this.mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: { uTex: { value: tex }, uScale: { value: 600 } },
      vertexShader: /* glsl */ `
        attribute float aSize; attribute float aAlpha; attribute vec3 color;
        varying float vA; varying vec3 vC;
        uniform float uScale;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = min(aSize * uScale / max(0.1, -mv.z), 320.0);
          vA = aAlpha; vC = color;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uTex; varying float vA; varying vec3 vC;
        void main() {
          float a = texture2D(uTex, gl_PointCoord).a * clamp(vA, 0.0, 1.0);
          if (!(a > 0.003)) discard;
          gl_FragColor = vec4(vC, a);
          #include <colorspace_fragment>
        }`,
    });
    this.points = new THREE.Points(this.geo, this.mat);
    this.points.frustumCulled = false;
  }

  spawn(p: PSpawn) {
    const i = this.next;
    this.next = (this.next + 1) % this.n;
    this.pos.set([p.x, p.y, p.z], i * 3);
    this.vel.set([p.vx ?? 0, p.vy ?? 0, p.vz ?? 0], i * 3);
    this.life[i] = p.life;
    this.max[i] = p.life;
    this.size[i] = p.size;
    this.grow[i] = p.grow ?? 0;
    this.a0[i] = p.alpha ?? 1;
    this.alpha[i] = 0;
    this.drag[i] = p.drag ?? 0;
    this.grav[i] = p.gravity ?? 0;
    if (typeof p.color === "number") this.c.setHex(p.color);
    else this.c.copy(p.color);
    this.col.set([this.c.r, this.c.g, this.c.b], i * 3);
  }

  update(dt: number) {
    for (let i = 0; i < this.n; i++) {
      if (this.life[i] <= 0) {
        this.alpha[i] = 0;
        continue;
      }
      this.life[i] -= dt;
      const k = i * 3;
      const d = Math.max(0, 1 - this.drag[i] * dt);
      this.vel[k] *= d;
      this.vel[k + 1] = this.vel[k + 1] * d - this.grav[i] * dt;
      this.vel[k + 2] *= d;
      this.pos[k] += this.vel[k] * dt;
      this.pos[k + 1] += this.vel[k + 1] * dt;
      this.pos[k + 2] += this.vel[k + 2] * dt;
      if (this.ground && this.grav[i] > 0) {
        const gy = this.ground(this.pos[k], this.pos[k + 2]);
        if (this.pos[k + 1] < gy) {
          this.pos[k + 1] = gy;
          this.vel[k] *= 0.4;
          this.vel[k + 2] *= 0.4;
          this.vel[k + 1] *= -0.25;
        }
      }
      this.size[i] = Math.max(0, this.size[i] + this.grow[i] * dt);
      const t = Math.min(1, Math.max(0, 1 - this.life[i] / this.max[i]));
      this.alpha[i] = this.life[i] > 0 ? this.a0[i] * Math.min(1, t * 8) * (1 - t) ** 1.2 : 0;
    }
    for (const n of ["position", "color", "aSize", "aAlpha"]) (this.geo.attributes[n] as T.BufferAttribute).needsUpdate = true;
  }

  clear() {
    this.life.fill(0);
    this.alpha.fill(0);
  }

  dispose() {
    this.geo.dispose();
    this.mat.dispose();
  }
}

// ---------- engine flame ----------

export function makeFlame(THREE: Three) {
  const geo = new THREE.ConeGeometry(0.42, 2.6, 24, 8, true);
  geo.translate(0, -1.3, 0);
  geo.rotateX(Math.PI);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uThrottle: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      uniform float uTime; uniform float uThrottle;
      void main() {
        vUv = uv;
        vec3 p = position;
        float along = clamp(-p.y / 2.6, 0.0, 1.0);
        p.xz *= 1.0 + along * 0.6 + sin(uTime * 40.0 + along * 9.0) * 0.06;
        p.y *= 0.55 + uThrottle * 0.45 + sin(uTime * 31.0) * 0.05;
        vN = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      uniform float uTime; uniform float uThrottle;
      void main() {
        float along = 1.0 - vUv.y;
        float edge = pow(max(abs(dot(vN, vV)), 0.00001), 1.6);
        float flick = 0.85 + 0.15 * sin(uTime * 53.0 + vUv.x * 30.0);
        vec3 core = vec3(1.0, 0.95, 0.85);
        vec3 outer = vec3(1.0, 0.55, 0.2);
        vec3 col = mix(core, outer, smoothstep(0.0, 0.7, along));
        float a = edge * (1.0 - smoothstep(0.1, 1.0, along)) * uThrottle * flick;
        gl_FragColor = vec4(col * 3.2 * a, a);
      }`,
  });
  return new THREE.Mesh(geo, mat);
}

// ---------- beacons and holograms ----------

/** A tall column of light that fades with height. */
export function makeBeam(THREE: Three, color: number, height: number, radius: number, strength = 1) {
  const geo = new THREE.CylinderGeometry(radius, radius * 1.6, height, 24, 1, true);
  geo.translate(0, height / 2, 0);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
    uniforms: { uColor: { value: new THREE.Color(color) }, uH: { value: height }, uTime: { value: 0 }, uStrength: { value: strength } },
    vertexShader: /* glsl */ `
      varying float vY; varying vec3 vN; varying vec3 vV;
      void main() {
        vY = position.y;
        vN = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uH; uniform float uTime; uniform float uStrength;
      varying float vY; varying vec3 vN; varying vec3 vV;
      void main() {
        float h = vY / uH;
        float edge = pow(max(abs(dot(vN, vV)), 0.00001), 2.0);
        float a = edge * pow(max(1.0 - h, 0.00001), 2.2) * (0.75 + 0.25 * sin(uTime * 2.0 - h * 30.0)) * uStrength;
        gl_FragColor = vec4(uColor * a * 1.8, a);
      }`,
  });
  return new THREE.Mesh(geo, mat);
}

/** Wireframe-and-glow material for spacecraft that are no longer there to see. */
export function hologramMaterial(THREE: Three, color = 0x9d86ff) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(color) }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vY;
      void main() {
        vN = normalize(normalMatrix * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vY = wp.y;
        vec4 mv = viewMatrix * wp;
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uTime;
      varying vec3 vN; varying vec3 vV; varying float vY;
      void main() {
        float f = pow(max(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.00001), 2.0);
        float scan = 0.6 + 0.4 * step(0.5, fract(vY * 6.0 - uTime * 1.5));
        float a = (0.12 + f * 0.9) * scan;
        gl_FragColor = vec4(uColor * a * 1.6, a);
      }`,
  });
}

/** A flat ring lying on the ground. */
export function makeRing(THREE: Three, inner: number, outer: number, color: number, opacity = 1) {
  const m = new THREE.Mesh(
    new THREE.RingGeometry(inner, outer, 96),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }),
  );
  m.rotation.x = -Math.PI / 2;
  return m;
}

/** Rover tracks: a ring buffer of dark quads pressed into the ground. */
export class Tracks {
  mesh: T.Mesh;
  private pos: Float32Array;
  private idx = 0;
  private last: { x: number; z: number } | null = null;
  constructor(
    THREE: Three,
    private max: number,
    private ground: (x: number, z: number) => number,
    color: number,
  ) {
    this.pos = new Float32Array(max * 4 * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    const index: number[] = [];
    for (let i = 0; i < max; i++) {
      const b = i * 4;
      index.push(b, b + 1, b + 2, b + 2, b + 1, b + 3);
    }
    geo.setIndex(index);
    this.mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.32, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 1;
  }

  /** Add a step for a pair of wheels at (x, z) heading h; width w apart. */
  step(x: number, z: number, h: number, w: number) {
    if (this.last && Math.hypot(x - this.last.x, z - this.last.z) < 0.3) return;
    const prev = this.last ?? { x: x - Math.sin(h) * 0.3, z: z - Math.cos(h) * 0.3 };
    this.last = { x, z };
    const rx = Math.cos(h);
    const rz = -Math.sin(h);
    for (const side of [-1, 1]) {
      const i = this.idx;
      this.idx = (this.idx + 1) % this.max;
      const cx = side * w * 0.5;
      const half = 0.13;
      const pts = [
        [prev.x + rx * (cx - half), prev.z + rz * (cx - half)],
        [prev.x + rx * (cx + half), prev.z + rz * (cx + half)],
        [x + rx * (cx - half), z + rz * (cx - half)],
        [x + rx * (cx + half), z + rz * (cx + half)],
      ];
      pts.forEach(([px, pz], j) => this.pos.set([px, this.ground(px, pz) + 0.03, pz], (i * 4 + j) * 3));
    }
    (this.mesh.geometry.attributes.position as T.BufferAttribute).needsUpdate = true;
  }

  reset() {
    this.last = null;
  }
}
