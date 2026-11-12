/* LusterLux 3D bottle, shared by the hero carousel and the line theater.
   Silhouette and every label are measured/unwrapped from LusterLux's own studio photos (tools/bottle.py). */
import * as THREE from 'three';

export const DATA = await fetch('assets/bottle3d/bottles.json').then(r => r.json());

// profile, units: body radius = 1
export const PROFILE = [[0, 0], [.84, 0], [.94, .025], [.985, .1], [.998, .28], [1, 1.2], [.988, 4.0], [.976, 5.42], [.962, 5.53], [.9, 5.62],
  [.78, 5.69], [.64, 5.745], [.55, 5.78], [.535, 5.8], [.565, 5.815], [.565, 5.855], [.515, 5.87], [.505, 5.95]];
export const rAt = y => { const P = PROFILE; for (let i = 1; i < P.length; i++) if (y <= P[i][1]) { const [r0, y0] = P[i - 1], [r1, y1] = P[i]; return r0 + (r1 - r0) * (y - y0) / (y1 - y0 || 1); } return P[P.length - 1][0]; };
export const FILL = 5.55, CAPY = 5.9;

const glassGeo = new THREE.LatheGeometry(PROFILE.map(([r, y]) => new THREE.Vector2(r, y)), 128);
const liqPts = [new THREE.Vector2(0, .05)];
for (const [r, y] of PROFILE) if (y > .02 && y < FILL) liqPts.push(new THREE.Vector2(Math.max(.001, r * .955), Math.max(.05, y)));
liqPts.push(new THREE.Vector2(rAt(FILL) * .955, FILL), new THREE.Vector2(0, FILL));
const liqGeo = new THREE.LatheGeometry(liqPts, 96);
const capGeo = new THREE.LatheGeometry([[0, 0], [.515, 0], [.522, .02], [.522, .5], [.512, .56], [.47, .585], [0, .59]].map(([r, y]) => new THREE.Vector2(r, y)), 96);
const knurl = document.createElement('canvas'); knurl.width = 512; knurl.height = 8;
{ const x = knurl.getContext('2d'); for (let i = 0; i < 512; i += 4) { x.fillStyle = '#fff'; x.fillRect(i, 0, 2, 8); x.fillStyle = '#000'; x.fillRect(i + 2, 0, 2, 8); } }
const knurlTex = new THREE.CanvasTexture(knurl);

export const radial = (stops, size = 256) => {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d');
  const gr = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, col] of stops) gr.addColorStop(o, col); x.fillStyle = gr; x.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};

/* Label as a sleeve of tiles. Each tile flies in from a scattered position and locks into place, driven by uT (3 = locked). */
function labelGeometry(y0, y1, cols = 30, rows = 14) {
  const pos = [], uv = [], nor = [], ctr = [], off = [], axis = [], dly = [], idx = [];
  const sub = 3; let v = 0;
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    const p0 = -Math.PI + (c / cols) * Math.PI * 2, p1 = -Math.PI + ((c + 1) / cols) * Math.PI * 2;
    const ya = y0 + (y1 - y0) * r / rows, yb = y0 + (y1 - y0) * (r + 1) / rows;
    const pm = (p0 + p1) / 2, ym = (ya + yb) / 2, rm = rAt(ym) + .008;
    const center = [Math.sin(pm) * rm, ym, Math.cos(pm) * rm];
    const front = Math.cos(pm);
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
  m.userData.uT = { value: 3 };
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

/* studio environment: strip softboxes baked into a PMREM map; `accent` adds a coloured strip (the neon) */
export function studioEnv(renderer, { base = 0xcfcfcf, floor = 0x8a8984, accent = null } = {}) {
  const env = new THREE.Scene(); env.background = new THREE.Color(base);
  const strip = (w, h, x, y, z, col) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, y, 0); env.add(m);
  };
  const g = k => new THREE.Color(k, k, k);
  strip(1.6, 14, -7, 2, 3, g(7)); strip(1.2, 14, 7.5, 2, 1.5, g(4)); strip(.7, 12, 4, 2, -7, g(5)); strip(.7, 12, -4, 2, -7, g(3));
  if (accent) { const c = new THREE.Color(accent).multiplyScalar(4); strip(14, .6, 0, 7, -8, c); strip(.5, 12, -8, 2, -2, c); }
  const top = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ color: g(1.6) }));
  top.position.set(0, 9, 0); top.rotation.x = Math.PI / 2; env.add(top);
  const floorE = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ color: floor }));
  floorE.rotation.x = -Math.PI / 2; floorE.position.y = -1; env.add(floorE);
  return new THREE.PMREMGenerator(renderer).fromScene(env, .02).texture;
}

export function bottleFactory(renderer, { liquidGlow = .12, shadow = 'rgba(30,28,22,' } = {}) {
  const loader = new THREE.TextureLoader();
  const labelTex = k => loader.loadAsync(`assets/bottle3d/label-${k}.webp`).then(t => {
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t; });
  const shadowTex = radial([[0, shadow + '.55)'], [.35, shadow + '.28)'], [1, shadow + '0)']]);
  return function makeBottle(k, { forming = false } = {}) {
    const d = DATA[k];
    const g = new THREE.Group();
    const spin = new THREE.Group(); g.add(spin);
    const clipGlass = new THREE.Plane(new THREE.Vector3(0, -1, 0), forming ? 0 : 99);
    const clipLiq = new THREE.Plane(new THREE.Vector3(0, -1, 0), forming ? 0 : 99);
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .04, transmission: 1, thickness: .22, ior: 1.42,
      specularIntensity: 1, envMapIntensity: 1.5, clearcoat: 1, clearcoatRoughness: .03, clippingPlanes: [clipGlass] });
    const lc = new THREE.Color(d.liquid);
    const liqMat = new THREE.MeshPhysicalMaterial({ color: lc, roughness: .18, clearcoat: .7, envMapIntensity: .9,
      emissive: lc, emissiveIntensity: liquidGlow, clippingPlanes: [clipLiq] });
    const capMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(d.cap), roughness: .45, clearcoat: .4, clearcoatRoughness: .3,
      bumpMap: knurlTex, bumpScale: 2, envMapIntensity: 1.1 });
    const glass = new THREE.Mesh(glassGeo, glassMat), liq = new THREE.Mesh(liqGeo, liqMat), cap = new THREE.Mesh(capGeo, capMat);
    glass.renderOrder = 2; cap.position.y = CAPY;
    const label = new THREE.Mesh(labelGeometry(d.label[0] - .02, d.label[1] + .02), labelMaterial(null));
    spin.add(liq, label, glass, cap);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: forming ? 0 : .9 }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = .003; g.add(sh);
    labelTex(k).then(t => { label.material.map = t; label.material.needsUpdate = true; });
    for (const m of [glass, liq, label, cap]) m.userData.k = k;
    return { k, g, spin, glass, liq, label, cap, sh, clipGlass, clipLiq };
  };
}
