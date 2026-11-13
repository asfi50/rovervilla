/**
 * Simplified 3D models for the machines NASA has not published a model of (Ranger 7, Surveyor 1,
 * the Lunar Roving Vehicle, Pathfinder and Sojourner, Mars Polar Lander, Phoenix, LCROSS, GRAIL).
 * Built from primitives so every part is its own named group: the profile's parts explorer
 * highlights and explodes them, and the landing game reuses them on the surface.
 *
 * These are illustrations made for this site, not engineering replicas: overall shapes and the
 * parts they carry follow NASA descriptions and photos, and sizes are approximate (metres, y up,
 * ground at y = 0 for landers and rovers).
 */
import type * as T from "three";

type Three = typeof T;
export type BuiltPart = { id: string; label: string };
export type Built = { root: T.Group; parts: BuiltPart[] };

function kit(THREE: Three) {
  const std = (color: number, roughness: number, metalness: number, extra: Partial<T.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  const M = {
    white: std(0xe8e8ee, 0.55, 0.05),
    paint: std(0xd9dbe2, 0.6, 0.1),
    gold: std(0xc9a033, 0.32, 0.85),
    silver: std(0xb9bec8, 0.28, 0.9),
    alu: std(0x9aa0aa, 0.45, 0.7),
    dark: std(0x2a2c35, 0.7, 0.3),
    black: std(0x101116, 0.6, 0.2),
    solar: std(0x1d2a6e, 0.22, 0.55, { emissive: 0x0a1030, emissiveIntensity: 0.25 }),
    copper: std(0xb06a3b, 0.4, 0.8),
    glass: std(0x22344a, 0.1, 0.4),
    mesh: std(0x8f949c, 0.5, 0.8, { wireframe: true }),
    seat: std(0x6a7480, 0.8, 0.2),
    orange: std(0xd2691e, 0.6, 0.1),
  };
  const mesh = (geo: T.BufferGeometry, mat: T.Material) => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  };
  const at = <O extends T.Object3D>(o: O, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
    o.position.set(x, y, z);
    o.rotation.set(rx, ry, rz);
    return o;
  };
  const box = (w: number, h: number, d: number, mat: T.Material) => mesh(new THREE.BoxGeometry(w, h, d), mat);
  const cyl = (rt: number, rb: number, h: number, mat: T.Material, seg = 24) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  const sphere = (r: number, mat: T.Material) => mesh(new THREE.SphereGeometry(r, 24, 16), mat);
  /** A strut from a to b. */
  const strut = (a: [number, number, number], b: [number, number, number], r: number, mat: T.Material) => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const len = va.distanceTo(vb);
    const m = cyl(r, r, len, mat, 8);
    m.position.copy(va).add(vb).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
    return m;
  };
  /** Parabolic dish opening along +y. */
  const dish = (r: number, depth: number, mat: T.Material) => {
    const pts = Array.from({ length: 12 }, (_, i) => {
      const x = (i / 11) * r;
      return new THREE.Vector2(x, (x * x * depth) / (r * r));
    });
    const m = mesh(new THREE.LatheGeometry(pts, 32), mat);
    (m.material as T.MeshStandardMaterial).side = THREE.DoubleSide;
    return m;
  };
  /** Flat solar panel: cells on top of a thin frame. */
  const panel = (w: number, d: number) => {
    const g = new THREE.Group();
    g.add(box(w, 0.03, d, M.alu));
    g.add(at(box(w * 0.96, 0.012, d * 0.94, M.solar), 0, 0.02, 0));
    return g;
  };
  /** Regular n-gon solar array (Phoenix's UltraFlex wings are decagons). */
  const ngonPanel = (r: number, n: number) => {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(r, r, 0.03, n), M.alu));
    g.add(at(mesh(new THREE.CylinderGeometry(r * 0.95, r * 0.95, 0.012, n), M.solar), 0, 0.02, 0));
    for (let i = 0; i < n / 2; i++) g.add(at(box(r * 2 * 0.95, 0.03, 0.012, M.alu), 0, 0.03, 0, 0, (i * Math.PI * 2) / n, 0));
    return g;
  };
  const group = (id: string, ...children: T.Object3D[]) => {
    const g = new THREE.Group();
    g.name = id;
    children.forEach((c) => g.add(c));
    return g;
  };
  return { M, mesh, at, box, cyl, sphere, strut, dish, panel, ngonPanel, group };
}

type Kit = ReturnType<typeof kit>;

function assemble(THREE: Three, parts: [BuiltPart, T.Object3D][]): Built {
  const root = new THREE.Group();
  for (const [p, obj] of parts) {
    obj.name = p.id;
    obj.userData.part = p.id;
    root.add(obj);
  }
  return { root, parts: parts.map(([p]) => p) };
}

/* ---------------------------------------------------------------- Ranger 7 */
function ranger(THREE: Three, k: Kit): Built {
  const { M, at, box, cyl, dish, panel, group, strut } = k;
  const base = group("base", at(cyl(0.75, 0.75, 0.42, M.gold, 6), 0, 0.21, 0), at(cyl(0.77, 0.77, 0.05, M.alu, 6), 0, 0.44, 0));
  const tower = group("tower", at(cyl(0.28, 0.55, 1.5, M.paint, 24), 0, 1.2, 0), at(cyl(0.3, 0.3, 0.06, M.alu), 0, 1.97, 0));
  const cams = group(
    "cameras",
    at(box(0.36, 0.42, 0.06, M.black), 0, 1.25, 0.45, -0.17, 0, 0),
    ...[-0.1, 0, 0.1].map((x) => at(cyl(0.035, 0.035, 0.08, M.glass, 12), x, 1.3, 0.48, Math.PI / 2 - 0.17, 0, 0)),
  );
  const omni = group("omni", at(cyl(0.07, 0.07, 0.75, M.white, 16), 0, 2.37, 0), at(cyl(0.09, 0.09, 0.04, M.alu), 0, 2.76, 0));
  const solar = group("solar", at(panel(1.54, 0.74), -1.55, 0.3, 0), at(panel(1.54, 0.74), 1.55, 0.3, 0), at(box(0.4, 0.04, 0.06, M.alu), -0.85, 0.3, 0), at(box(0.4, 0.04, 0.06, M.alu), 0.85, 0.3, 0));
  const hga = group("hga", at(dish(0.45, 0.18, M.white), 0.2, -0.55, -0.8, Math.PI * 0.62, 0, 0), strut([0.2, 0, -0.6], [0.2, -0.4, -0.75], 0.025, M.alu));
  const motor = group("motor", at(cyl(0.1, 0.18, 0.3, M.dark), 0, -0.13, 0));
  return assemble(THREE, [
    [{ id: "tower", label: "Camera tower" }, tower],
    [{ id: "cameras", label: "Six TV cameras" }, cams],
    [{ id: "omni", label: "Omni antenna" }, omni],
    [{ id: "solar", label: "Solar panels" }, solar],
    [{ id: "base", label: "Hexagonal bus" }, base],
    [{ id: "hga", label: "High-gain dish" }, hga],
    [{ id: "motor", label: "Mid-course motor" }, motor],
  ]);
}

/* ---------------------------------------------------------------- Surveyor 1 */
function surveyor(THREE: Three, k: Kit): Built {
  const { M, at, box, cyl, strut, group, sphere } = k;
  const h = 0.9;
  const tri = [0, 1, 2].map((i) => [Math.cos((i * 2 * Math.PI) / 3 + Math.PI / 2) * 0.85, h, Math.sin((i * 2 * Math.PI) / 3 + Math.PI / 2) * 0.85] as [number, number, number]);
  const frame = group(
    "frame",
    ...tri.map((p, i) => strut(p, tri[(i + 1) % 3], 0.035, M.alu)),
    ...tri.map((p) => strut(p, [0, h + 0.9, 0], 0.025, M.alu)),
  );
  const legs = group(
    "legs",
    ...tri.flatMap((p) => {
      const foot: [number, number, number] = [p[0] * 1.9, 0.08, p[2] * 1.9];
      return [strut(p, foot, 0.04, M.alu), strut([p[0] * 0.6, h - 0.05, p[2] * 0.6], foot, 0.025, M.alu), at(cyl(0.16, 0.2, 0.1, M.paint, 16), foot[0], 0.05, foot[2])];
    }),
  );
  const mast = group("mast", strut([0, h + 0.9, 0], [0, 2.9, 0], 0.03, M.alu));
  const array = group("array", at(k.panel(0.85, 0.75), 0.15, 2.95, 0.1, -0.35, 0, 0.15), at(box(0.8, 0.04, 0.6, M.white), -0.2, 2.75, -0.35, 0.55, 0, -0.2));
  const camera = group("camera", at(cyl(0.09, 0.09, 0.55, M.paint, 16), 0.45, h + 0.35, 0.35), at(box(0.16, 0.12, 0.16, M.silver), 0.45, h + 0.66, 0.35, 0.3, 0, 0));
  const boxes = group("compartments", at(box(0.45, 0.3, 0.35, M.white), -0.35, h + 0.18, -0.15), at(box(0.4, 0.28, 0.3, M.white), 0.3, h + 0.17, -0.3));
  const verniers = group("verniers", ...tri.map((p) => at(cyl(0.04, 0.08, 0.18, M.dark, 12), p[0] * 0.75, h - 0.12, p[2] * 0.75)));
  const omni = group("omni", strut([0, h + 0.4, 0], [-0.9, h + 0.7, 0.4], 0.015, M.alu), at(sphere(0.04, M.white), -0.9, h + 0.7, 0.4), strut([0, h + 0.4, 0], [0.8, h + 0.75, -0.6], 0.015, M.alu), at(sphere(0.04, M.white), 0.8, h + 0.75, -0.6));
  return assemble(THREE, [
    [{ id: "array", label: "Solar panel and planar antenna" }, array],
    [{ id: "mast", label: "Antenna mast" }, mast],
    [{ id: "camera", label: "TV camera" }, camera],
    [{ id: "compartments", label: "Thermal compartments" }, boxes],
    [{ id: "frame", label: "Triangular frame" }, frame],
    [{ id: "verniers", label: "Vernier engines" }, verniers],
    [{ id: "legs", label: "Three landing legs" }, legs],
    [{ id: "omni", label: "Omni antennas" }, omni],
  ]);
}

/* ---------------------------------------------------------------- Lunar Roving Vehicle */
function lrv(THREE: Three, k: Kit): Built {
  const { M, at, box, cyl, strut, dish, group } = k;
  const wheel = (x: number, z: number) => {
    const g = new THREE.Group();
    g.add(at(cyl(0.41, 0.41, 0.23, M.mesh, 28), 0, 0, 0, Math.PI / 2, 0, 0));
    g.add(at(k.mesh(new THREE.TorusGeometry(0.38, 0.03, 8, 32), M.alu), 0, 0, 0.09));
    g.add(at(k.mesh(new THREE.TorusGeometry(0.38, 0.03, 8, 32), M.alu), 0, 0, -0.09));
    g.add(at(cyl(0.12, 0.12, 0.26, M.dark, 16), 0, 0, 0, Math.PI / 2, 0, 0));
    return at(g, x, 0.41, z);
  };
  const chassis = group("chassis", at(box(3.0, 0.08, 1.1, M.alu), 0, 0.62, 0), at(box(0.9, 0.18, 1.0, M.gold), 0.95, 0.72, 0));
  const wheels = group("wheels", wheel(1.15, 0.92), wheel(1.15, -0.92), wheel(-1.15, 0.92), wheel(-1.15, -0.92));
  const fenders = group("fenders", ...[1.15, -1.15].flatMap((x) => [0.92, -0.92].map((z) => at(cyl(0.48, 0.48, 0.3, M.paint, 20), x, 0.48, z, Math.PI / 2, 0, 0))));
  fenders.children.forEach((c) => {
    const m = c as T.Mesh;
    m.geometry = new THREE.CylinderGeometry(0.48, 0.48, 0.3, 20, 1, true, Math.PI * 0.05, Math.PI * 0.9);
    (m.material as T.MeshStandardMaterial).side = THREE.DoubleSide;
  });
  const seats = group(
    "seats",
    ...[0.32, -0.32].flatMap((z) => [at(box(0.5, 0.05, 0.48, M.seat), -0.15, 0.78, z), at(box(0.05, 0.5, 0.48, M.seat), -0.42, 1.0, z, 0, 0, 0.25)]),
  );
  const console_ = group("console", strut([0.3, 0.66, 0], [0.45, 1.25, 0], 0.03, M.alu), at(box(0.22, 0.3, 0.42, M.dark), 0.48, 1.3, 0, 0, 0, -0.35), at(cyl(0.02, 0.02, 0.2, M.black, 8), 0.25, 0.95, 0, 0, 0, 0));
  const hga = group("hga", strut([1.2, 0.7, 0.35], [1.25, 1.75, 0.35], 0.022, M.alu), at(dish(0.45, 0.25, M.silver), 1.32, 1.78, 0.35, 0, 0, -1.0));
  const lga = group("lga", strut([1.2, 0.7, -0.35], [1.2, 1.5, -0.35], 0.018, M.alu), at(cyl(0.035, 0.035, 0.5, M.white, 8), 1.2, 1.75, -0.35));
  const camera = group("camera", strut([1.35, 0.72, 0], [1.35, 1.15, 0], 0.025, M.alu), at(box(0.26, 0.16, 0.18, M.white), 1.42, 1.22, 0), at(cyl(0.05, 0.05, 0.12, M.black, 12), 1.58, 1.22, 0, 0, 0, Math.PI / 2));
  const lcru = group("lcru", at(box(0.36, 0.28, 0.5, M.white), 1.5, 0.85, 0));
  const pallet = group("pallet", at(box(0.6, 0.45, 1.0, M.alu), -1.35, 0.92, 0), at(box(0.12, 0.6, 0.12, M.dark), -1.45, 1.3, 0.35));
  return assemble(THREE, [
    [{ id: "hga", label: "High-gain antenna" }, hga],
    [{ id: "camera", label: "TV camera (GCTA)" }, camera],
    [{ id: "lcru", label: "Communications relay (LCRU)" }, lcru],
    [{ id: "lga", label: "Low-gain antenna" }, lga],
    [{ id: "console", label: "Control console and T-handle" }, console_],
    [{ id: "seats", label: "Two seats" }, seats],
    [{ id: "chassis", label: "Folding chassis and batteries" }, chassis],
    [{ id: "fenders", label: "Fenders" }, fenders],
    [{ id: "wheels", label: "Wire-mesh wheels" }, wheels],
    [{ id: "pallet", label: "Tool and sample pallet" }, pallet],
  ]);
}

/* ---------------------------------------------------------------- Pathfinder lander + Sojourner */
function pathfinder(THREE: Three, k: Kit): Built {
  const { M, at, box, cyl, strut, dish, group, sphere } = k;
  const petalShape = (r: number) => {
    const s = new THREE.Shape();
    // Drawn pointing to -y so that, laid flat, the petal opens outward from the base.
    s.moveTo(-r * 0.58, 0);
    s.lineTo(r * 0.58, 0);
    s.lineTo(0, -r);
    s.closePath();
    return s;
  };
  const petal = (angle: number, solar = true) => {
    const g = new THREE.Group();
    const base = k.mesh(new THREE.ExtrudeGeometry(petalShape(1.0), { depth: 0.04, bevelEnabled: false }), M.alu);
    base.rotation.x = -Math.PI / 2;
    g.add(base);
    if (solar) {
      const cells = k.mesh(new THREE.ExtrudeGeometry(petalShape(0.9), { depth: 0.01, bevelEnabled: false }), M.solar);
      cells.rotation.x = -Math.PI / 2;
      cells.position.set(0, 0.045, 0.05);
      g.add(cells);
    }
    g.rotation.y = angle;
    g.position.set(Math.sin(angle) * 0.5, 0.1, Math.cos(angle) * 0.5);
    return g;
  };
  const base = group("base", at(cyl(0.55, 0.62, 0.25, M.gold, 3), 0, 0.2, 0, 0, Math.PI / 6, 0), at(box(0.5, 0.18, 0.4, M.white), 0, 0.4, 0));
  const petals = group("petals", petal(0), petal((2 * Math.PI) / 3), petal((4 * Math.PI) / 3));
  const imp = group("imp", strut([0, 0.45, -0.1], [0, 1.25, -0.1], 0.025, M.alu), at(box(0.22, 0.12, 0.1, M.white), 0, 1.3, -0.1), ...[-0.06, 0.06].map((x) => at(cyl(0.025, 0.025, 0.06, M.glass, 12), x, 1.3, -0.04, Math.PI / 2, 0, 0)));
  const hga = group("hga", strut([0.2, 0.45, 0.1], [0.25, 0.85, 0.1], 0.02, M.alu), at(dish(0.14, 0.05, M.white), 0.28, 0.9, 0.1, 0.4, 0, -0.5));
  const met = group("met", strut([-0.3, 0.1, -0.9], [-0.3, 1.1, -0.9], 0.012, M.alu), ...[0.5, 0.8, 1.05].map((y) => at(cyl(0.025, 0.025, 0.05, M.white, 8), -0.3, y, -0.9)));
  const ramps = group("ramps", ...[-0.2, 0.2].map((x) => at(box(0.12, 0.02, 1.2, M.silver), x, 0.18, 1.1, 0.2, 0, 0)));
  const airbags = group("airbags", ...[0, 1, 2].map((i) => at(sphere(0.22, M.paint), Math.sin((i * 2 * Math.PI) / 3 + Math.PI / 3) * 0.75, 0.12, Math.cos((i * 2 * Math.PI) / 3 + Math.PI / 3) * 0.75)));
  airbags.children.forEach((c) => c.scale.set(1.3, 0.45, 1));
  // Sojourner, parked beside the lander as in the 1997 photos.
  const wheel = (x: number, z: number) => at(cyl(0.065, 0.065, 0.07, M.alu, 16), x, 0.065, z, Math.PI / 2, 0, 0);
  const rover = group(
    "sojourner",
    at(box(0.48, 0.12, 0.36, M.gold), 0, 0.2, 0),
    at(k.panel(0.62, 0.46), 0, 0.29, 0),
    wheel(-0.24, 0.24), wheel(0, 0.26), wheel(0.24, 0.24), wheel(-0.24, -0.24), wheel(0, -0.26), wheel(0.24, -0.24),
    strut([-0.24, 0.065, 0.24], [0.24, 0.065, 0.24], 0.012, M.alu),
    strut([-0.24, 0.065, -0.24], [0.24, 0.065, -0.24], 0.012, M.alu),
    strut([0, 0.15, 0.22], [0.12, 0.065, 0.24], 0.012, M.alu),
    strut([0, 0.15, -0.22], [0.12, 0.065, -0.24], 0.012, M.alu),
    strut([0.1, 0.3, -0.15], [0.1, 0.62, -0.15], 0.006, M.dark),
    at(box(0.06, 0.06, 0.08, M.dark), -0.29, 0.17, 0),
  );
  rover.position.set(1.7, 0, 1.6);
  rover.rotation.y = -0.6;
  return assemble(THREE, [
    [{ id: "imp", label: "Pop-up camera mast (IMP)" }, imp],
    [{ id: "hga", label: "High-gain antenna" }, hga],
    [{ id: "met", label: "Weather mast (ASI/MET)" }, met],
    [{ id: "base", label: "Base petal and electronics" }, base],
    [{ id: "petals", label: "Solar petals" }, petals],
    [{ id: "ramps", label: "Rover ramps" }, ramps],
    [{ id: "airbags", label: "Deflated airbags" }, airbags],
    [{ id: "sojourner", label: "Sojourner rover" }, rover],
  ]);
}

/* ---------------------------------------------------------------- Mars Surveyor 98 / 2001 lander family */
function deckLander(THREE: Three, k: Kit, phoenix: boolean): Built {
  const { M, at, box, cyl, strut, group } = k;
  const h = phoenix ? 1.0 : 0.95;
  const deck = group("deck", at(cyl(0.75, 0.75, 0.16, M.paint, phoenix ? 10 : 6), 0, h, 0), at(cyl(0.6, 0.55, 0.35, M.gold, phoenix ? 10 : 6), 0, h - 0.24, 0));
  const legAngles = [Math.PI / 2, Math.PI / 2 + (2 * Math.PI) / 3, Math.PI / 2 + (4 * Math.PI) / 3];
  const legs = group(
    "legs",
    ...legAngles.flatMap((a) => {
      const top: [number, number, number] = [Math.cos(a) * 0.62, h - 0.2, Math.sin(a) * 0.62];
      const foot: [number, number, number] = [Math.cos(a) * 1.0, 0.06, Math.sin(a) * 1.0];
      return [strut(top, foot, 0.035, M.alu), strut([top[0] * 0.6, h - 0.35, top[2] * 0.6], foot, 0.022, M.alu), at(cyl(0.13, 0.15, 0.08, M.white, 16), foot[0], 0.04, foot[2])];
    }),
  );
  const thrusters = group("thrusters", ...legAngles.map((a) => at(cyl(0.05, 0.09, 0.16, M.dark, 12), Math.cos(a + Math.PI / 3) * 0.45, h - 0.48, Math.sin(a + Math.PI / 3) * 0.45)));
  const arrays = phoenix
    ? group("arrays", at(k.ngonPanel(1.05, 10), -1.85, h + 0.02, 0), at(k.ngonPanel(1.05, 10), 1.85, h + 0.02, 0))
    : group("arrays", at(k.panel(1.4, 1.0), -1.45, h + 0.02, 0), at(k.panel(1.4, 1.0), 1.45, h + 0.02, 0), at(k.panel(0.6, 0.5), 0, h + 0.1, -0.75, -0.3, 0, 0));
  const arm = group(
    "arm",
    strut([0.35, h + 0.1, 0.45], [0.75, h + 0.75, 1.1], 0.04, M.white),
    strut([0.75, h + 0.75, 1.1], [0.9, 0.25, 2.0], 0.035, M.white),
    at(box(0.14, 0.1, 0.2, M.silver), 0.92, 0.18, 2.08, 0.5, 0, 0),
  );
  const camera = group("camera", strut([-0.3, h + 0.08, 0.3], [-0.3, h + (phoenix ? 1.0 : 0.85), 0.3], 0.03, M.alu), at(box(0.28, 0.14, 0.14, M.white), -0.3, h + (phoenix ? 1.08 : 0.93), 0.3), ...[-0.08, 0.08].map((x) => at(cyl(0.03, 0.03, 0.06, M.glass, 12), -0.3 + x, h + (phoenix ? 1.08 : 0.93), 0.39, Math.PI / 2, 0, 0)));
  const met = group("met", strut([0.4, h + 0.08, -0.35], [0.4, h + (phoenix ? 1.0 : 0.95), -0.35], 0.012, M.alu), at(cyl(0.02, 0.02, 0.12, M.white, 8), 0.4, h + (phoenix ? 1.06 : 1.0), -0.35), ...(phoenix ? [strut([0.4, h + 1.0, -0.35], [0.46, h + 0.9, -0.35], 0.004, M.dark)] : []));
  const lidar = group("lidar", at(box(0.16, 0.18, 0.16, M.white), 0.05, h + 0.17, -0.45));
  const lab = group("lab", ...(phoenix ? [at(box(0.42, 0.22, 0.28, M.white), -0.05, h + 0.19, 0.12), ...[0, 1, 2, 3].map((i) => at(box(0.08, 0.02, 0.06, M.silver), -0.2 + i * 0.1, h + 0.31, 0.12)), at(box(0.3, 0.16, 0.22, M.silver), 0.35, h + 0.16, 0.05)] : [at(box(0.35, 0.18, 0.25, M.white), -0.05, h + 0.17, 0.1)]));
  const parts: [BuiltPart, T.Object3D][] = [
    [{ id: "camera", label: phoenix ? "Stereo camera on a 2 m mast (SSI)" : "Stereo camera mast (SSI)" }, camera],
    [{ id: "met", label: phoenix ? "Weather station mast and telltale" : "Weather mast" }, met],
    [{ id: "arm", label: phoenix ? "Robotic arm (2.35 m) and scoop" : "Robotic arm and scoop" }, arm],
    [{ id: "arrays", label: phoenix ? "Two round UltraFlex solar arrays" : "Fixed solar arrays" }, arrays],
    [{ id: "lab", label: phoenix ? "Ovens and wet chemistry lab (TEGA, MECA)" : "Gas analyser (TEGA)" }, lab],
    [{ id: "lidar", label: "LIDAR" }, lidar],
    [{ id: "deck", label: "Instrument deck" }, deck],
    [{ id: "thrusters", label: "Descent thrusters" }, thrusters],
    [{ id: "legs", label: "Three landing legs" }, legs],
  ];
  return assemble(THREE, parts);
}

/* ---------------------------------------------------------------- LCROSS shepherding spacecraft */
function lcross(THREE: Three, k: Kit): Built {
  const { M, at, box, cyl, group, sphere } = k;
  const ring = k.mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.6, 32, 1, true), M.silver);
  (ring.material as T.MeshStandardMaterial).side = THREE.DoubleSide;
  const espa = group("ring", ring, at(k.mesh(new THREE.TorusGeometry(0.78, 0.03, 8, 40), M.alu), 0, 0.3, 0, Math.PI / 2, 0, 0), at(k.mesh(new THREE.TorusGeometry(0.78, 0.03, 8, 40), M.alu), 0, -0.3, 0, Math.PI / 2, 0, 0));
  const tank = group("tank", sphere(0.42, M.gold));
  const solar = group("solar", at(k.panel(1.3, 0.9), 0, 0.62, 0));
  const instruments = group("instruments", at(box(0.45, 0.3, 0.2, M.white), 0, -0.05, 0.86), ...[-0.12, 0, 0.12].map((x) => at(cyl(0.035, 0.035, 0.1, M.glass, 12), x, -0.05, 1.0, Math.PI / 2, 0, 0)));
  const avionics = group("avionics", ...[0, 1, 2, 3].map((i) => at(box(0.42, 0.42, 0.12, M.gold), Math.sin(Math.PI / 4 + (i * Math.PI) / 2) * 0.86, 0, Math.cos(Math.PI / 4 + (i * Math.PI) / 2) * 0.86, 0, Math.PI / 4 + (i * Math.PI) / 2, 0)));
  const antennas = group("antennas", at(cyl(0.05, 0.11, 0.25, M.white, 16), -0.86, -0.1, 0, 0, 0, Math.PI / 2), at(cyl(0.05, 0.11, 0.25, M.white, 16), 0.86, -0.1, 0, 0, 0, -Math.PI / 2));
  return assemble(THREE, [
    [{ id: "solar", label: "Solar array" }, solar],
    [{ id: "instruments", label: "Cameras and spectrometers" }, instruments],
    [{ id: "antennas", label: "Medium-gain antennas" }, antennas],
    [{ id: "avionics", label: "Avionics panels" }, avionics],
    [{ id: "tank", label: "Propellant tank" }, tank],
    [{ id: "ring", label: "ESPA ring structure" }, espa],
  ]);
}

/* ---------------------------------------------------------------- GRAIL (Ebb and Flow) */
function grail(THREE: Three, k: Kit): Built {
  const { M, at, box, cyl, group } = k;
  const craft = (x: number, face: number) => {
    const bus = at(box(0.76, 0.76, 1.09, M.gold), x, 0, 0);
    const wings = [at(k.panel(1.0, 0.7), x - 0.9, 0.05, 0, 0, 0, 0.1), at(k.panel(1.0, 0.7), x + 0.9, 0.05, 0, 0, 0, -0.1)];
    const horn = at(cyl(0.06, 0.14, 0.22, M.white, 16), x, 0, 0.66 * face, (Math.PI / 2) * face, 0, 0);
    const cam = at(box(0.12, 0.1, 0.1, M.dark), x + 0.25, -0.3, 0.5 * face);
    return { bus, wings, horn, cam };
  };
  const a = craft(0, 1);
  const b = craft(0, -1);
  const ebb = new THREE.Group();
  [a.bus, ...a.wings, a.horn, a.cam].forEach((o) => ebb.add(o));
  ebb.position.z = -1.6;
  const flow = new THREE.Group();
  [b.bus, ...b.wings, b.horn, b.cam].forEach((o) => flow.add(o));
  flow.position.z = 1.6;
  flow.rotation.y = Math.PI;
  const link = group("link", at(cyl(0.008, 0.008, 1.7, new THREE.MeshBasicMaterial({ color: 0x7a57ff }), 6), 0, 0, 0, Math.PI / 2, 0, 0));
  return assemble(THREE, [
    [{ id: "ebb", label: "Ebb (GRAIL-A)" }, group("ebb", ebb)],
    [{ id: "flow", label: "Flow (GRAIL-B)" }, group("flow", flow)],
    [{ id: "link", label: "Ka-band ranging link between the twins" }, link],
  ]);
}

const BUILDERS: Record<string, (THREE: Three, k: Kit) => Built> = {
  "ranger-7": ranger,
  "surveyor-1": surveyor,
  "apollo-15-rover": lrv,
  "pathfinder-sojourner": pathfinder,
  "mars-polar-lander": (THREE, k) => deckLander(THREE, k, false),
  phoenix: (THREE, k) => deckLander(THREE, k, true),
  lcross,
  grail,
};

export const hasBuiltModel = (slug: string) => slug in BUILDERS;

/** Build the simplified model for a hero; undefined when it has a NASA model instead. */
export function buildModel(THREE: Three, slug: string): Built | undefined {
  const b = BUILDERS[slug];
  return b ? b(THREE, kit(THREE)) : undefined;
}
