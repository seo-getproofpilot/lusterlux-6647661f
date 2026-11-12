/* LusterLux v4 hero: molecules → liquid → bottle → label assembles → cap → the lineup.
   Bottle silhouette and every label are measured/unwrapped from LusterLux's own studio photos
   (tools/bottle.py). Nothing here is generated imagery. */
import * as THREE from 'three';

const DATA = await fetch('assets/bottle3d/bottles.json').then(r => r.json());
const PRODUCTS = {
  luxpro:        { name: 'LuxPro',        fn: 'Waterless wash & protectant', price: 19.99 },
  ceramicx:      { name: 'CeramicX',      fn: 'Ceramic detail spray',        price: 27.99 },
  wheelassassin: { name: 'WheelAssassin', fn: 'Wheel cleaner',               price: 17.99 },
  luxquick:      { name: 'LuxQuick',      fn: 'Detail spray',                price: 17.99 },
  tirevenom:     { name: 'TireVenom',     fn: 'Tire dressing',               price: 22.99 },
  luxfoam:       { name: 'LuxFoam',       fn: 'Foam soap',                   price: 19.99 },
  interiorx:     { name: 'InteriorX',     fn: 'Interior cleaner',            price: 19.99 },
};
// group shot, centre out: hero bottle front and centre, the rest in a shallow V behind it
const LINEUP = ['luxfoam', 'luxquick', 'ceramicx', 'luxpro', 'wheelassassin', 'tirevenom', 'interiorx'];
const HERO = 'luxpro';

const canvas = document.getElementById('gl');
const stage = document.getElementById('stage');
const tip = document.getElementById('tip');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.localClippingEnabled = true;

const scene = new THREE.Scene();
// light studio sweep (also what the clear bottles refract)
const bgC = document.createElement('canvas'); bgC.width = 16; bgC.height = 512;
{ const x = bgC.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#fbfaf7'); g.addColorStop(.55, '#f1f0eb'); g.addColorStop(1, '#e4e2db'); x.fillStyle = g; x.fillRect(0, 0, 16, 512); }
scene.background = new THREE.CanvasTexture(bgC); scene.background.colorSpace = THREE.SRGBColorSpace;
const camera = new THREE.PerspectiveCamera(26, 1, .05, 200);

// studio: strip softboxes baked into an environment map
{
  const env = new THREE.Scene(); env.background = new THREE.Color(0xcfcfcf);
  const strip = (w, h, x, y, z, k) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, y, 0); env.add(m);
  };
  strip(1.6, 14, -7, 2, 3, 7); strip(1.2, 14, 7.5, 2, 1.5, 4); strip(.7, 12, 4, 2, -7, 5); strip(.7, 12, -4, 2, -7, 3);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.6, 1.6) }));
  top.position.set(0, 9, 0); top.rotation.x = Math.PI / 2; env.add(top);
  const floorE = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ color: 0x8a8984 }));
  floorE.rotation.x = -Math.PI / 2; floorE.position.y = -1; env.add(floorE);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(env, .02).texture;
}
const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(-5, 8, 7); scene.add(key);
scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d6cc, .5));

// ---------- the bottle (units: body radius = 1), profile measured from the studio shots ----------
const P = [[0, 0], [.84, 0], [.94, .025], [.985, .1], [.998, .28], [1, 1.2], [.988, 4.0], [.976, 5.42], [.962, 5.53], [.9, 5.62],
           [.78, 5.69], [.64, 5.745], [.55, 5.78], [.535, 5.8], [.565, 5.815], [.565, 5.855], [.515, 5.87], [.505, 5.95]];
const rAt = y => { for (let i = 1; i < P.length; i++) if (y <= P[i][1]) { const [r0, y0] = P[i - 1], [r1, y1] = P[i]; return r0 + (r1 - r0) * (y - y0) / (y1 - y0 || 1); } return P[P.length - 1][0]; };
const FILL = 5.55, CAPY = 5.9;
const glassGeo = new THREE.LatheGeometry(P.map(([r, y]) => new THREE.Vector2(r, y)), 128);
const liqPts = [new THREE.Vector2(0, .05)];
for (const [r, y] of P) if (y > .02 && y < FILL) liqPts.push(new THREE.Vector2(Math.max(.001, r * .955), Math.max(.05, y)));
liqPts.push(new THREE.Vector2(rAt(FILL) * .955, FILL), new THREE.Vector2(0, FILL));
const liqGeo = new THREE.LatheGeometry(liqPts, 96);
const capGeo = new THREE.LatheGeometry([[0, 0], [.515, 0], [.522, .02], [.522, .5], [.512, .56], [.47, .585], [0, .59]].map(([r, y]) => new THREE.Vector2(r, y)), 96);
const knurl = document.createElement('canvas'); knurl.width = 512; knurl.height = 8;
{ const x = knurl.getContext('2d'); for (let i = 0; i < 512; i += 4) { x.fillStyle = '#fff'; x.fillRect(i, 0, 2, 8); x.fillStyle = '#000'; x.fillRect(i + 2, 0, 2, 8); } }
const knurlTex = new THREE.CanvasTexture(knurl);

const loader = new THREE.TextureLoader();
const labelTex = k => loader.loadAsync(`assets/bottle3d/label-${k}.webp`).then(t => {
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t; });

/* Label as a sleeve of tiles. Each tile can fly in from a scattered position and lock into place,
   driven by a uniform; the lineup bottles just use uT = 1. */
function labelGeometry(y0, y1, cols = 30, rows = 14) {
  const pos = [], uv = [], nor = [], ctr = [], off = [], axis = [], dly = [], idx = [];
  const sub = 3; let v = 0;
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    const p0 = -Math.PI + (c / cols) * Math.PI * 2, p1 = -Math.PI + ((c + 1) / cols) * Math.PI * 2;
    const ya = y0 + (y1 - y0) * r / rows, yb = y0 + (y1 - y0) * (r + 1) / rows;
    const pm = (p0 + p1) / 2, ym = (ya + yb) / 2, rm = rAt(ym) + .008;
    const center = [Math.sin(pm) * rm, ym, Math.cos(pm) * rm];
    const front = Math.cos(pm);                                 // front tiles arrive first
    const d = (1 - (front * .5 + .5)) * .55 + Math.random() * .35 + (r / rows) * .15;
    const dir = new THREE.Vector3(Math.sin(pm) * 2.2 + (Math.random() - .5) * 3, (Math.random() - .5) * 4, Math.cos(pm) * 2.2 + Math.random() * 2.5);
    const ax = new THREE.Vector3().randomDirection();
    for (let i = 0; i <= sub; i++) for (let j = 0; j <= sub; j++) {
      const ph = p0 + (p1 - p0) * i / sub, y = ya + (yb - ya) * j / sub, rr = rAt(y) + .008;
      pos.push(Math.sin(ph) * rr, y, Math.cos(ph) * rr); nor.push(Math.sin(ph), 0, Math.cos(ph));
      uv.push(.5 + ph / (Math.PI * 2), (y - y0) / (y1 - y0));
      ctr.push(...center); off.push(dir.x, dir.y, dir.z); axis.push(ax.x, ax.y, ax.z); dly.push(d);
    }
    for (let i = 0; i < sub; i++) for (let j = 0; j < sub; j++) {
      const a = v + i * (sub + 1) + j, b = a + sub + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    v += (sub + 1) * (sub + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('aCtr', new THREE.Float32BufferAttribute(ctr, 3));
  g.setAttribute('aOff', new THREE.Float32BufferAttribute(off, 3));
  g.setAttribute('aAxis', new THREE.Float32BufferAttribute(axis, 3));
  g.setAttribute('aDly', new THREE.Float32BufferAttribute(dly, 1));
  g.setIndex(idx);
  return g;
}
function labelMaterial(map) {
  const m = new THREE.MeshPhysicalMaterial({ map, roughness: .32, metalness: 0, clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: 1.1, side: THREE.DoubleSide });
  m.userData.uT = { value: 3 };   // fully locked (max tile delay ~1.05 + .6 flight)
  m.onBeforeCompile = sh => {
    sh.uniforms.uT = m.userData.uT;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        uniform float uT; attribute vec3 aCtr; attribute vec3 aOff; attribute vec3 aAxis; attribute float aDly;
        vec3 rodr(vec3 v, vec3 k, float a){ return v*cos(a) + cross(k,v)*sin(a) + k*dot(k,v)*(1.-cos(a)); }
        float kOf(){ float k = clamp((uT - aDly) / .6, 0., 1.); return 1. - pow(1. - k, 3.); }`)
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
        float kk = kOf(); objectNormal = rodr(objectNormal, aAxis, (1. - kk) * 4.5);`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vec3 lp = position - aCtr; lp = rodr(lp, aAxis, (1. - kk) * 4.5) * (.35 + .65 * kk);
        transformed = aCtr + lp + aOff * (1. - kk) * (1. - kk);`);
  };
  return m;
}

function makeBottle(k, { forming = false } = {}) {
  const d = DATA[k];
  const g = new THREE.Group();
  const spin = new THREE.Group(); g.add(spin);
  const clipGlass = new THREE.Plane(new THREE.Vector3(0, -1, 0), forming ? 0 : 99);
  const clipLiq = new THREE.Plane(new THREE.Vector3(0, -1, 0), forming ? 0 : 99);
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .04, transmission: 1, thickness: .22, ior: 1.42,
    specularIntensity: 1, envMapIntensity: 1.5, clearcoat: 1, clearcoatRoughness: .03, clippingPlanes: [clipGlass] });
  const lc = new THREE.Color(d.liquid);
  const liqMat = new THREE.MeshPhysicalMaterial({ color: lc, roughness: .18, clearcoat: .7, envMapIntensity: .9,
    emissive: lc, emissiveIntensity: .12, clippingPlanes: [clipLiq] });
  const capMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(d.cap), roughness: .45, clearcoat: .4, clearcoatRoughness: .3,
    bumpMap: knurlTex, bumpScale: 2, envMapIntensity: 1.1 });
  const glass = new THREE.Mesh(glassGeo, glassMat), liq = new THREE.Mesh(liqGeo, liqMat), cap = new THREE.Mesh(capGeo, capMat);
  glass.renderOrder = 2; cap.position.y = CAPY;
  const label = new THREE.Mesh(labelGeometry(d.label[0] - .02, d.label[1] + .02), labelMaterial(null));
  spin.add(liq, label, glass, cap);
  // contact shadow
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: forming ? 0 : .9 }));
  sh.rotation.x = -Math.PI / 2; sh.position.y = .003; g.add(sh);
  labelTex(k).then(t => { label.material.map = t; label.material.needsUpdate = true; });
  for (const m of [glass, liq, label, cap]) m.userData.k = k;
  return { k, g, spin, glass, liq, label, cap, sh, clipGlass, clipLiq };
}
const radial = (stops, size = 256) => {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d');
  const gr = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, col] of stops) gr.addColorStop(o, col); x.fillStyle = gr; x.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const shadowTex = radial([[0, 'rgba(30,28,22,.55)'], [.35, 'rgba(30,28,22,.28)'], [1, 'rgba(30,28,22,0)']]);

// floor: a faint glossy sweep so the bottles sit on something
// no floor plane (it drew a horizon line against the sweep): the bottles sit on contact shadows

// ---------- the hero bottle and the lineup ----------
const world = new THREE.Group(); scene.add(world);
const bottles = LINEUP.map(k => makeBottle(k, { forming: k === HERO }));
const hero = bottles.find(b => b.k === HERO);
const SLOT = (i, n) => { const c = (n - 1) / 2, o = i - c; return new THREE.Vector3(o * 2.35, 0, 1.3 - Math.abs(o) * .7); };
bottles.forEach((b, i) => {
  b.home = SLOT(i, bottles.length); world.add(b.g);
  b.side = Math.sign(b.home.x) || 0; b.dly = Math.abs(b.home.x) / 2.2 * .16;
  b.g.position.copy(b.home); b.g.visible = b === hero;
  b.yaw = (Math.random() - .5) * .5;
});
hero.label.material.userData.uT.value = 0;
hero.cap.visible = false;
const ring = new THREE.Mesh(new THREE.TorusGeometry(1, .01, 8, 128), new THREE.MeshBasicMaterial({ color: 0x9fbf0a, transparent: true, opacity: 0 }));
ring.rotation.x = Math.PI / 2; hero.g.add(ring);

// ---------- the formula: molecular models (a core atom in the liquid colour + two white atoms, bonded) ----------
const NM = reduce ? 0 : 430;
const atomGeo = new THREE.SphereGeometry(1, 20, 14);
const atomMat = new THREE.MeshPhysicalMaterial({ roughness: .16, clearcoat: 1, clearcoatRoughness: .05, envMapIntensity: 1.2 });
const atoms = new THREE.InstancedMesh(atomGeo, atomMat, Math.max(1, NM * 3));
const bondGeo = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true); bondGeo.translate(0, .5, 0);
const bonds = new THREE.InstancedMesh(bondGeo, new THREE.MeshPhysicalMaterial({ color: 0xe8e8e8, roughness: .3, envMapIntensity: 1 }), Math.max(1, NM * 2));
atoms.frustumCulled = bonds.frustumCulled = false;
hero.g.add(atoms, bonds);
const liqCol = new THREE.Color(DATA[HERO].liquid), white = new THREE.Color(0xf7f7f7);
const mol = [];
for (let i = 0; i < NM; i++) {
  // target inside the liquid volume, sorted bottom-up so the bottle fills from the bottom
  const y = .15 + Math.pow(Math.random(), .85) * (FILL - .3), a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * rAt(y) * .85;
  const s = new THREE.Vector3().randomDirection().multiplyScalar(1.6 + Math.random() * 4.2); s.y = s.y * .75 + 3.1;
  const o1 = new THREE.Vector3().randomDirection(), o2 = o1.clone().applyAxisAngle(new THREE.Vector3().randomDirection(), 1.82);
  mol.push({ t: new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r), s, o1, o2, ax: new THREE.Vector3().randomDirection(), w: .6 + Math.random() * 1.6, ph: Math.random() * 6 });
}
mol.sort((p, q) => p.t.y - q.t.y);
mol.forEach((m, i) => { m.dly = 1.25 + (i / NM) * 1.35 + Math.random() * .2; });
for (let i = 0; i < NM; i++) { atoms.setColorAt(i * 3, liqCol); atoms.setColorAt(i * 3 + 1, white); atoms.setColorAt(i * 3 + 2, white); }
if (atoms.instanceColor) atoms.instanceColor.needsUpdate = true;

// ---------- layout / camera rig ----------
let W = 1, H = 1, mobile = false;
const camEnd = { pos: new THREE.Vector3(), tgt: new THREE.Vector3() };   // the lineup shot
const camSolo = { pos: new THREE.Vector3(), tgt: new THREE.Vector3() };  // the single bottle shot
const camMacro = { pos: new THREE.Vector3(.4, 3.1, 3.4), tgt: new THREE.Vector3(0, 3.0, 0) };
function layout() {
  const r = canvas.getBoundingClientRect(); W = r.width; H = r.height;
  renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
  mobile = innerWidth <= 900;
  const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  // the lineup fills the right ~60% on desktop, the full width on phones
  const span = 17, share = mobile ? .98 : .56;
  const viewW = span / share, dW = viewW / 2 / (tanV * camera.aspect);
  const dH = 7.4 / (2 * tanV * (mobile ? .78 : .74));
  const d = Math.max(dW, dH);
  const shiftX = mobile ? 0 : viewW * (.695 - .5);                 // centre the group at ~71% across, clear of the copy
  camEnd.tgt.set(-shiftX, 2.7, .2); camEnd.pos.set(-shiftX, 4.2, d);
  const ds = 6.4 / (2 * tanV * .72);
  camSolo.tgt.set(mobile ? 0 : -ds * tanV * camera.aspect * .24, 3.1, 1.3); camSolo.pos.set(camSolo.tgt.x, 3.9, 1.3 + ds);
  world.position.x = 0;
}
layout(); addEventListener('resize', layout);

// ---------- motion ----------
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const sm = (a, b, t) => { const x = Math.min(1, Math.max(0, (t - a) / (b - a))); return x * x * (3 - 2 * x); };
const outBack = t => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), V2 = new THREE.Vector3(), S = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
let T0 = null, visible = true, running = false, done = false, px = 0, pxT = 0, py = 0, pyT = 0;
addEventListener('pointermove', e => { pxT = e.clientX / innerWidth - .5; pyT = e.clientY / innerHeight - .5; });
const lerpCam = (a, b, t) => { camera.position.lerpVectors(a.pos, b.pos, t); V.lerpVectors(a.tgt, b.tgt, t); camera.lookAt(V); };

function placeMolecules(T) {
  for (let i = 0; i < NM; i++) {
    const m = mol[i];
    const k = Math.min(1, Math.max(0, (T - m.dly) / 1.1)), e = ease(k);
    const sw = (1 - e) * 2.2;                                       // swirl around the bottle axis on the way in
    V.copy(m.s); V.y += Math.sin(T * .9 + m.ph) * .12 * (1 - e);
    V.applyAxisAngle(UP, sw + T * .15 * (1 - e));
    V.lerp(m.t, e);
    const size = (.085 - .03 * e) * (1 - sm(.82, 1, k)) * sm(0, .25, T + .25);
    Q.setFromAxisAngle(m.ax, T * m.w + m.ph);
    // core atom
    M.compose(V, Q, S.setScalar(size)); atoms.setMatrixAt(i * 3, M);
    for (let j = 0; j < 2; j++) {
      const o = j ? m.o2 : m.o1;
      V2.copy(o).applyQuaternion(Q).multiplyScalar(size * 1.9).add(V);
      M.compose(V2, Q, S.setScalar(size * .62)); atoms.setMatrixAt(i * 3 + 1 + j, M);
      // bond from the core to this atom
      const dir = V2.clone().sub(V), len = dir.length();
      const bq = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize());
      M.compose(V, bq, S.set(size * .18, len, size * .18)); bonds.setMatrixAt(i * 2 + j, M);
    }
  }
  atoms.instanceMatrix.needsUpdate = bonds.instanceMatrix.needsUpdate = true;
}

function frame(now) {
  if (T0 === null) T0 = now;
  const T = reduce ? 20 : (now - T0) / 1000;

  // 1. molecules: macro, then they swirl into the bottle and condense into the liquid
  if (NM && T < 3.8) placeMolecules(T); else if (atoms.visible) { atoms.visible = bonds.visible = false; }
  // arrivals fill the bottle from the bottom
  const fillK = sm(1.5, 3.4, T);
  hero.clipLiq.constant = .05 + (FILL + .1) * fillK;
  // 2. the bottle draws itself around the liquid
  const g = sm(2.9, 3.9, T), gh = g * 6.0;
  hero.clipGlass.constant = gh;
  ring.position.y = Math.min(gh, 5.95); ring.scale.setScalar(rAt(Math.min(gh, 5.95)) + .03);
  ring.material.opacity = g > 0 && g < 1 ? .9 * Math.sin(g * Math.PI) : 0;
  // 3. the label tiles fly in and lock
  hero.label.material.userData.uT.value = Math.min(3, Math.max(0, (T - 3.55) / 1.25) * 1.6);
  hero.label.visible = T > 3.5;
  // 4. the cap spins down
  const cT = Math.min(1, Math.max(0, (T - 4.75) / .7));
  hero.cap.visible = cT > 0; hero.cap.position.y = CAPY + (1 - outBack(cT)) * 1.3; hero.cap.rotation.y = (1 - cT) * -Math.PI * 3;
  hero.sh.material.opacity = .9 * sm(3.0, 4.2, T);

  // camera: macro → pull back to the single bottle → widen for the lineup
  const pull = ease(sm(.9, 3.3, T)), wide = ease(sm(5.6, 7.2, T));
  if (wide > 0) lerpCam(camSolo, camEnd, wide); else lerpCam(camMacro, camSolo, pull);
  if (T < 1.2) { camera.position.x += Math.sin(T * .8) * .12; }      // slow drift among the molecules

  // 5. the lineup slides in from both sides
  for (const b of bottles) {
    if (b === hero) continue;
    const k = ease(sm(5.7 + b.dly, 6.9 + b.dly, T));
    b.g.visible = k > 0;
    b.g.position.set(b.home.x + b.side * (1 - k) * 9, 0, b.home.z);
  }
  if (!done && T > 7.3) { done = true; stage.classList.add('ready'); }
  if (T > 5.2 && !stage.classList.contains('formed')) stage.classList.add('formed');

  // at rest: each bottle turns slowly, pointer parallax on the camera
  px += (pxT - px) * .05; py += (pyT - py) * .05;
  for (const b of bottles) {
    const hov = b === hovered ? 1 : 0;
    b.turn = (b.turn || 0) + ((hov ? .9 : .0) - (b.turn || 0)) * .08;
    b.spin.rotation.y = b.yaw * sm(6, 8, T) + Math.sin(T * .3 + b.home.x) * .25 * sm(6.5, 8, T) + b.turn * Math.sin(T * 1.4) * .6;
    b.g.position.y = hov * .12 * Math.min(1, b.lift = (b.lift || 0) + .1);
  }
  if (done) { camera.position.x += px * .9; camera.position.y -= py * .5; camera.lookAt(V.lerpVectors(camSolo.tgt, camEnd.tgt, 1)); }

  renderer.render(scene, camera);
  if (visible) requestAnimationFrame(frame); else running = false;
}

// hover a bottle: name, function, price; click jumps to it in the shop grid
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
let hovered = null;
canvas.addEventListener('pointermove', e => {
  if (!done) return;
  const r = canvas.getBoundingClientRect();
  ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  ray.setFromCamera(ptr, camera);
  const hit = ray.intersectObjects(bottles.map(b => b.glass), false)[0];
  hovered = hit ? bottles.find(b => b.glass === hit.object) : null;
  canvas.style.cursor = hovered ? 'pointer' : '';
  if (hovered) {
    const p = PRODUCTS[hovered.k];
    tip.innerHTML = `<b>${p.name}</b><span>${p.fn}</span><em>$${p.price.toFixed(2)}</em>`;
    tip.style.transform = `translate(${e.clientX - r.left + 18}px,${e.clientY - r.top - 20}px)`;
    tip.classList.add('on');
  } else tip.classList.remove('on');
});
canvas.addEventListener('pointerleave', () => { hovered = null; tip.classList.remove('on'); });
canvas.addEventListener('click', () => {
  if (!hovered) return;
  const el = document.getElementById('p-' + hovered.k); if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.remove('ping'); void el.offsetWidth; el.classList.add('ping');
});

// render only while the canvas is on screen and its slide is the active one
let onScreen = true, active = true;
const kick = () => { visible = onScreen && active; if (visible && !running) { running = true; requestAnimationFrame(frame); } };
new IntersectionObserver(es => { for (const e of es) onScreen = e.isIntersecting; kick(); }, { threshold: .02 }).observe(canvas);
window.__hero = { active(on) { active = on; kick(); }, seek(t) { T0 = performance.now() - t * 1000; } };
kick();
