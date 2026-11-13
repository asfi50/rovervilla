/**
 * The player's craft: a small fictional lander ("Wren") and the rover it carries. Built from
 * primitives; nothing here is modelled on a real spacecraft.
 */
import type * as T from "three";
import { makeFlame } from "./fx";

type Three = typeof T;

/** Crinkled-foil bump texture for the gold blanket. */
function foilTexture(THREE: Three) {
  const S = 128;
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 260; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    const l = 4 + Math.random() * 18;
    const a = Math.random() * Math.PI;
    ctx.strokeStyle = Math.random() < 0.5 ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 1);
  return t;
}

/** Solar-cell texture: dark blue cells with thin silver lines. */
function cellTexture(THREE: Three) {
  const S = 128;
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = "#121a44";
  ctx.fillRect(0, 0, S, S);
  ctx.strokeStyle = "#7f8ab0";
  ctx.lineWidth = 1;
  for (let i = 0; i <= S; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i + 0.5, 0);
    ctx.lineTo(i + 0.5, S);
    ctx.moveTo(0, i + 0.5);
    ctx.lineTo(S, i + 0.5);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export type Lander = {
  root: T.Group;
  body: T.Group;
  flame: T.Mesh;
  flameMat: T.ShaderMaterial;
  engineLight: T.PointLight;
  spots: T.SpotLight[];
  nav: T.Mesh[];
  chute: T.Group;
  /** Local positions of the four RCS quads (for puffs). */
  rcs: T.Vector3[];
  /** Where the rover rides before it is lowered. */
  dock: T.Vector3;
};

export function buildLander(THREE: Three, dark: boolean): Lander {
  const foil = foilTexture(THREE);
  const M = {
    gold: new THREE.MeshStandardMaterial({ color: 0xd8a945, roughness: 0.28, metalness: 1, bumpMap: foil, bumpScale: 2 }),
    white: new THREE.MeshStandardMaterial({ color: 0xeceef3, roughness: 0.55, metalness: 0.05 }),
    alu: new THREE.MeshStandardMaterial({ color: 0xb4b8c2, roughness: 0.35, metalness: 0.85 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x22242b, roughness: 0.6, metalness: 0.6 }),
    bell: new THREE.MeshStandardMaterial({ color: 0x3a3330, roughness: 0.45, metalness: 0.9, side: THREE.DoubleSide }),
  };
  const mesh = (g: T.BufferGeometry, m: T.Material) => {
    const o = new THREE.Mesh(g, m);
    o.castShadow = true;
    o.receiveShadow = true;
    return o;
  };
  const strut = (a: T.Vector3, b: T.Vector3, r: number, m: T.Material) => {
    const o = mesh(new THREE.CylinderGeometry(r, r, a.distanceTo(b), 8), m);
    o.position.copy(a).add(b).multiplyScalar(0.5);
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    return o;
  };

  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  // Octagonal core in gold blanket, white deck on top.
  const core = mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.9, 8), M.gold);
  core.position.y = 1.45;
  core.rotation.y = Math.PI / 8;
  const deck = mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.12, 8), M.white);
  deck.position.y = 1.96;
  deck.rotation.y = Math.PI / 8;
  const under = mesh(new THREE.CylinderGeometry(0.9, 0.7, 0.18, 8), M.dark);
  under.position.y = 0.92;
  under.rotation.y = Math.PI / 8;
  body.add(core, deck, under);

  // Spherical tanks peeking out between the legs.
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const t = mesh(new THREE.SphereGeometry(0.32, 20, 14), M.alu);
    t.position.set(Math.cos(a) * 0.82, 1.35, Math.sin(a) * 0.82);
    body.add(t);
  }

  // Dish antenna and a small mast with a camera.
  const mast = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8), M.alu);
  mast.position.set(0.45, 2.35, 0.2);
  const dishGeo = new THREE.SphereGeometry(0.42, 24, 8, 0, Math.PI * 2, 0, 0.9);
  const dish = mesh(dishGeo, M.white);
  dish.position.set(0.45, 2.75, 0.2);
  dish.rotation.set(-0.5, 0, 0.4);
  const cam = mesh(new THREE.BoxGeometry(0.22, 0.14, 0.16), M.dark);
  cam.position.set(-0.5, 2.15, -0.35);
  body.add(mast, dish, cam);

  // Solar panel wings on the deck.
  const cells = new THREE.MeshStandardMaterial({ map: cellTexture(THREE), roughness: 0.25, metalness: 0.6, emissive: 0x060a20, emissiveIntensity: 0.4 });
  for (const s of [-1, 1]) {
    const p = mesh(new THREE.BoxGeometry(1.1, 0.04, 0.7), cells);
    p.position.set(s * 1.45, 2.0, -0.35);
    p.rotation.z = s * -0.18;
    body.add(p);
  }

  // Four legs with footpads; the lander's origin is at the bottom of the pads.
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const hip = new THREE.Vector3(c * 0.9, 1.25, s * 0.9);
    const foot = new THREE.Vector3(c * 1.75, 0.12, s * 1.75);
    const knee = new THREE.Vector3(c * 0.95, 0.85, s * 0.95);
    body.add(strut(hip, foot, 0.055, M.alu), strut(knee, foot, 0.035, M.alu));
    const pad = mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.1, 16), M.alu);
    pad.position.copy(foot).setY(0.05);
    body.add(pad);
  }

  // Engine bell.
  const bell = mesh(new THREE.CylinderGeometry(0.17, 0.38, 0.5, 24, 1, true), M.bell);
  bell.position.y = 0.6;
  body.add(bell);
  const flame = makeFlame(THREE);
  flame.position.y = 0.36;
  body.add(flame);
  const engineLight = new THREE.PointLight(0xffa25a, 0, 40, 1.6);
  engineLight.position.y = -0.5;
  body.add(engineLight);

  // RCS quads.
  const rcs: T.Vector3[] = [];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const p = new THREE.Vector3(Math.cos(a) * 1.08, 1.8, Math.sin(a) * 1.08);
    const q = mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), M.dark);
    q.position.copy(p);
    body.add(q);
    rcs.push(p);
  }

  // Navigation lights.
  const nav = [0xff3b30, 0x34d399].map((c, i) => {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: c }));
    l.position.set(i ? 1.02 : -1.02, 2.04, 0);
    body.add(l);
    return l;
  });

  // Landing lights, used where there is no sunlight.
  const spots: T.SpotLight[] = [];
  if (dark) {
    for (const s of [-1, 1]) {
      const sp = new THREE.SpotLight(0xdfe8ff, 5200, 220, 0.55, 0.5, 1.2);
      sp.position.set(s * 0.6, 0.9, 0.6);
      sp.target.position.set(s * 2, -20, 8);
      body.add(sp, sp.target);
      spots.push(sp);
    }
  }

  // Parachute for the start of a Mars descent.
  const chute = new THREE.Group();
  const canopyGeo = new THREE.SphereGeometry(5.5, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2.6);
  const cc = new Float32Array(canopyGeo.attributes.position.count * 3);
  const pa = canopyGeo.attributes.position as T.BufferAttribute;
  for (let i = 0; i < pa.count; i++) {
    const ang = Math.atan2(pa.getZ(i), pa.getX(i));
    const stripe = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 12) % 2;
    const col = stripe ? [0.95, 0.95, 0.95] : [0.85, 0.35, 0.12];
    cc.set(col, i * 3);
  }
  canopyGeo.setAttribute("color", new THREE.BufferAttribute(cc, 3));
  const canopy = new THREE.Mesh(canopyGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide }));
  canopy.position.y = 14;
  canopy.castShadow = true;
  const lines: number[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    lines.push(0, 2.4, 0, Math.cos(a) * 4.6, 14 + 1.4, Math.sin(a) * 4.6);
  }
  const lg = new THREE.BufferGeometry();
  lg.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3));
  chute.add(canopy, new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0.6 })));
  chute.visible = false;
  root.add(chute);

  return { root, body, flame, flameMat: flame.material as T.ShaderMaterial, engineLight, spots, nav, chute, rcs, dock: new THREE.Vector3(0, 0.95, 1.35) };
}

export type Rover = { root: T.Group; wheels: T.Mesh[]; head: T.Group; lamp: T.Mesh; lights: T.SpotLight[] };

export function buildRover(THREE: Three, dark: boolean): Rover {
  const M = {
    white: new THREE.MeshStandardMaterial({ color: 0xe9ebf0, roughness: 0.5, metalness: 0.05 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xcfa24a, roughness: 0.3, metalness: 1 }),
    alu: new THREE.MeshStandardMaterial({ color: 0xa9adb6, roughness: 0.4, metalness: 0.85 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x25272e, roughness: 0.75, metalness: 0.3 }),
    cells: new THREE.MeshStandardMaterial({ map: cellTexture(THREE), roughness: 0.25, metalness: 0.6 }),
  };
  const mesh = (g: T.BufferGeometry, m: T.Material) => {
    const o = new THREE.Mesh(g, m);
    o.castShadow = true;
    o.receiveShadow = true;
    return o;
  };
  const root = new THREE.Group();
  const box = mesh(new THREE.BoxGeometry(0.75, 0.3, 1.0), M.gold);
  box.position.y = 0.52;
  const panel = mesh(new THREE.BoxGeometry(1.05, 0.04, 1.2), M.cells);
  panel.position.y = 0.7;
  const rim = mesh(new THREE.BoxGeometry(1.09, 0.03, 1.24), M.white);
  rim.position.y = 0.68;
  root.add(box, panel, rim);

  // Rocker arms and six wheels.
  const wheels: T.Mesh[] = [];
  const wheelGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.13, 18);
  wheelGeo.rotateZ(Math.PI / 2);
  for (const s of [-1, 1]) {
    const arm = mesh(new THREE.BoxGeometry(0.04, 0.04, 1.05), M.alu);
    arm.position.set(s * 0.5, 0.36, 0);
    root.add(arm);
    for (const z of [-0.45, 0, 0.45]) {
      const w = mesh(wheelGeo, M.dark);
      w.position.set(s * 0.53, 0.17, z);
      root.add(w);
      wheels.push(w);
      const leg = mesh(new THREE.BoxGeometry(0.03, 0.2, 0.03), M.alu);
      leg.position.set(s * 0.5, 0.26, z);
      root.add(leg);
    }
  }

  // Mast and camera head.
  const mast = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 8), M.white);
  mast.position.set(0, 0.98, 0.36);
  const head = new THREE.Group();
  head.position.set(0, 1.27, 0.36);
  const hb = mesh(new THREE.BoxGeometry(0.26, 0.1, 0.1), M.white);
  const eyes = [-0.07, 0.07].map((x) => {
    const e = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 10), M.dark);
    e.rotation.x = Math.PI / 2;
    e.position.set(x, 0, 0.06);
    return e;
  });
  head.add(hb, ...eyes);
  const ant = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 6), M.alu);
  ant.position.set(-0.3, 0.98, -0.4);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: 0x7af0ff }));
  lamp.position.set(-0.3, 1.24, -0.4);
  root.add(mast, head, ant, lamp);

  const lights: T.SpotLight[] = [];
  if (dark) {
    const sp = new THREE.SpotLight(0xe6eeff, 900, 70, 0.62, 0.45, 1.2);
    sp.position.set(0, 1.25, 0.45);
    sp.target.position.set(0, 0, 8);
    root.add(sp, sp.target);
    lights.push(sp);
  }
  return { root, wheels, head, lamp, lights };
}

/** A small cairn with a warm light: what the player leaves at a site. */
export function buildLantern(THREE: Three) {
  const g = new THREE.Group();
  const stone = new THREE.MeshStandardMaterial({ color: 0x6b625a, roughness: 1, flatShading: true });
  [0.32, 0.24, 0.16].forEach((r, i) => {
    const s = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), stone);
    s.position.y = [0.2, 0.52, 0.76][i];
    s.scale.y = 0.7;
    s.rotation.y = i;
    s.castShadow = true;
    g.add(s);
  });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.75, 0.4).multiplyScalar(4) }));
  glow.position.y = 0.98;
  const light = new THREE.PointLight(0xffb36b, 6, 12, 1.5);
  light.position.y = 1.1;
  g.add(glow, light);
  return g;
}
