/* LusterLux line theater: the same 3D bottles as the hero, one at a time, in a room that takes on each formula's
   liquid colour. The bottle drops in and its label assembles; rain falls faster the faster you scroll; every change
   throws a burst of spray in the new colour. */
import * as THREE from 'three';
import { studioEnv, bottleFactory, radial } from './bottlekit.js';

const canvas = document.getElementById('thgl');
const pin = canvas.parentElement;
const KEYS = window.__thKeys || [];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.localClippingEnabled = true;
const scene = new THREE.Scene();
scene.environment = studioEnv(renderer);
const key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(-5, 8, 7); scene.add(key);
scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d6cc, .5));
const camera = new THREE.PerspectiveCamera(24, 1, .05, 200);

/* ---------- the room ---------- */
const nameC = [document.createElement('canvas'), document.createElement('canvas')];
const nameT = nameC.map(c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; });
const U = { uA: { value: new THREE.Color() }, uB: { value: new THREE.Color() }, uMix: { value: 1 }, uNameA: { value: nameT[0] }, uNameB: { value: nameT[1] },
  uRes: { value: new THREE.Vector2(1, 1) }, uMob: { value: 0 }, uFocus: { value: new THREE.Vector2(.56, .5) }, uTime: { value: 0 }, uDrift: { value: 0 } };
const room = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
  uniforms: U, depthWrite: false, depthTest: false,
  vertexShader: 'void main(){ gl_Position = vec4(position.xy, 1.0, 1.0); }',
  fragmentShader: `uniform vec3 uA, uB; uniform float uMix, uMob, uTime, uDrift; uniform sampler2D uNameA, uNameB; uniform vec2 uRes, uFocus;
    void main(){
      vec2 s = gl_FragCoord.xy / uRes;
      vec3 col = mix(uB, uA, uMix);
      // the bottle side is saturated, the copy side fades to a pale tint of the same colour
      float sat = uMob > .5 ? smoothstep(.45, .8, s.y) : smoothstep(.3, .78, s.x);
      vec3 pale = mix(vec3(1.0), col, .12);
      vec3 deep = col * .78 + .04;
      vec3 c = mix(pale, deep, sat);
      // spotlight behind the bottle
      vec2 d = (s - uFocus) * vec2(uRes.x / uRes.y, 1.0);
      c += col * .35 * exp(-dot(d, d) * 5.0) * sat;
      // the name, huge, behind the bottle
      vec2 nuv = vec2((s.x - uFocus.x) * (uRes.x / uRes.y) * .58 + .5, (s.y - uFocus.y - (uMob > .5 ? .02 : .2)) * 1.05 + .5);
      vec4 na = texture2D(uNameA, nuv), nb = texture2D(uNameB, nuv);
      float n = mix(nb.a, na.a, uMix);
      c = mix(c, vec3(1.0), n * 0.0 * sat);
      // floor: a lit line and a darker floor under the bottle
      float fy = uMob > .5 ? .56 : .17;
      c *= 1.0 - .18 * smoothstep(fy + .02, fy - .06, s.y) * sat;
      c = mix(c, vec3(.75, 1.0, .35), smoothstep(.006, .0, abs(s.y - fy)) * .8 * sat);
      // vignette
      c *= 1.0 - .22 * pow(length((s - .5) * vec2(1.2, 1.0)), 2.0);
      gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
    }` }));
room.frustumCulled = false; room.renderOrder = -1000; scene.add(room);
let nameSlot = 0;
const drawName = (txt, sub) => {
  nameSlot ^= 1; const c = nameC[nameSlot], x = c.getContext('2d');
  c.width = 2048; c.height = 512; x.clearRect(0, 0, 2048, 512);
  x.font = 'italic 900 330px Archivo'; try { x.fontStretch = 'expanded'; } catch (e) {}
  const w = x.measureText(txt).width, f = Math.min(1, 1960 / w);
  x.save(); x.translate(1024, 256); x.scale(f, f); x.textAlign = 'center'; x.textBaseline = 'middle';
  x.globalAlpha = .9; x.fillStyle = '#fff'; x.fillText(txt, 0, -20); x.restore();
  if (sub) { x.save(); x.font = '800 54px Archivo'; try { x.fontStretch = 'expanded'; } catch (e) {} x.textAlign = 'center'; x.fillStyle = 'rgba(255,255,255,.85)';
    try { x.letterSpacing = '14px'; } catch (e) {} x.fillText(sub.toUpperCase(), 1024, 440); x.restore(); }
  nameT[nameSlot].needsUpdate = true;
  // uniforms: A = newest
  U.uNameB.value = U.uNameA.value; U.uNameA.value = nameT[nameSlot];
};

/* ---------- bottles ---------- */
const makeBottle = bottleFactory(renderer, { liquidGlow: .14 });
const stageG = new THREE.Group(); scene.add(stageG);
const B = {};
for (const { k } of KEYS) { const b = makeBottle(k); b.g.visible = false; stageG.add(b.g); B[k] = b; }

/* ---------- rain: water drops that fall faster as you scroll ---------- */
const NR = 0;
const dropGeo = new THREE.SphereGeometry(1, 10, 8);
const dropMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
const rain = new THREE.InstancedMesh(dropGeo, dropMat, Math.max(1, NR)); rain.frustumCulled = false; scene.add(rain);
rain.visible = NR > 0;
const drops = Array.from({ length: NR }, () => ({ x: -3.5 + Math.random() * 10, y: Math.random() * 14 - 2, z: -4 + Math.random() * 6, s: .012 + Math.random() * .022, v: .7 + Math.random() * .6 }));
/* ---------- spray burst ---------- */
const NS = reduce ? 0 : 160;
const sprayMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .85, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
const spray = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 10), sprayMat, Math.max(1, NS)); spray.frustumCulled = false; scene.add(spray);
{ const Z = new THREE.Matrix4().makeScale(0, 0, 0); for (let i = 0; i < Math.max(1, NS); i++) spray.setMatrixAt(i, Z); spray.visible = NS > 0; }
const sp = Array.from({ length: NS }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), life: 0, s: 0 }));
const burst = (col, y = 3.4) => {
  sprayMat.color.set(col).lerp(new THREE.Color(.8, .95, 1), .55);
  for (const q of sp) {
    // a ring of droplets thrown off the glass where the two bottles meet
    const a = Math.random() * Math.PI * 2, r = .9 + Math.random() * .2;
    q.p.set(Math.cos(a) * r, y + (Math.random() - .5) * 2.4, Math.sin(a) * r * .8);
    const out = 3 + Math.random() * 7, up = 1 + Math.random() * 4;
    q.v.set(Math.cos(a) * out, up, Math.sin(a) * out * .7 + 1.5);
    q.life = .6 + Math.random() * .8; q.s = .025 + Math.random() * .06;
  }
};

/* ---------- layout ---------- */
let W = 1, H = 1, mobile = false;
function layout() {
  W = pin.clientWidth; H = pin.clientHeight;
  renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
  mobile = innerWidth <= 900; U.uMob.value = mobile ? 1 : 0;
  renderer.getDrawingBufferSize(U.uRes.value);
  const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const frac = mobile ? .31 : .66, fx = mobile ? .5 : .56, floorY = mobile ? .56 : .17;
  const d = 6.4 / (2 * tanV * frac), viewH = 2 * d * tanV, viewW = viewH * camera.aspect;
  // the bottle stands on the floor line at fx across
  const cy = (.5 - floorY) * viewH;                 // world height at the centre of the frame
  camera.position.set(-(fx - .5) * viewW, cy, d); camera.lookAt(-(fx - .5) * viewW, cy, 0);
  U.uFocus.value.set(fx, floorY + frac * .5);
}
layout(); addEventListener('resize', layout);

/* ---------- swapping formulas ---------- */
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const outBack = t => { const c1 = 1.3, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
let pendingBurst = null, curK = null, tSwap = -9, clock = 0, tScroll = .5, tSm = .5, pLast = 0, vel = 0;
// every bottle on stage tracks its own move, so fast scrolling can never leave one stuck or stacked on another
const live = new Map();          // k -> { mode: 'in' | 'out', t0, dir }
function show(k, d = 1) {
  if (k === curK || !B[k]) return;
  const first = !curK; curK = k; tSwap = clock;
  for (const [kk, m] of live) if (kk !== k && m.mode === 'in') { m.mode = 'out'; m.t0 = clock; m.dir = d; }
  live.set(k, { mode: 'in', t0: clock, dir: d });
  const info = KEYS.find(x => x.k === k);
  U.uB.value.copy(U.uA.value); U.uA.value.set(info.c); if (first) U.uB.value.set(info.c); U.uMix.value = 0;
  const b = B[k]; b.g.visible = false; b.g.position.set(9 * d, 0, 0); b.label.material.userData.uT.value = 3; b.spin.rotation.y = -1.4 * d;
  pendingBurst = { c: info.c, at: clock + .9 };
}
addEventListener('lux:theater', e => show(e.detail.k, e.detail.dir));
window.__theater = { progress(p, t) { vel += Math.abs(p - pLast) * 60; pLast = p; tScroll = t; } };

let running = false, onScreen = false, last = performance.now();
function frame(now) {
  const raw = Math.min(1.5, (now - last) / 1000), dt = Math.min(.05, raw); last = now; clock += raw;
  const s = clock - tSwap;
  if (pendingBurst && clock >= pendingBurst.at) { burst(pendingBurst.c); pendingBurst = null; }
  U.uMix.value = Math.min(1, s / .7); U.uTime.value = clock;
  vel *= Math.exp(-dt * 3); U.uDrift.value += dt * (.15 + vel * .4);
  tSm += (tScroll - tSm) * (1 - Math.exp(-dt * 6));
  // incoming: drops in with a bounce while its label assembles; outgoing: drops away, tilts and fades its shadow
  for (const [k, m] of live) {
    const b = B[k], e = clock - m.t0;
    if (m.mode === 'in') {
      const q = Math.min(1, Math.max(0, (e - .22) / .75)), o = 1 - Math.pow(1 - q, 3);   // waits for the old one to clear
      b.g.visible = q > 0;
      b.g.position.set((1 - o) * 9 * m.dir, 0, 0); b.g.rotation.z = (1 - o) * -.08 * m.dir;
      b.label.material.userData.uT.value = 3;
      const turn = (tSm - .5) * 1.5 + Math.sin(clock * .5) * .15;
      b.spin.rotation.y += (turn - b.spin.rotation.y) * (1 - Math.exp(-dt * 5));
      b.sh.material.opacity = .9 * q;
    } else {
      const q = Math.min(1, e / .42), o = q * q;
      b.g.position.set(-o * 9 * m.dir, 0, 0); b.g.rotation.z = o * .08 * m.dir; b.sh.material.opacity = .9 * (1 - q);
      if (q >= 1) { b.g.visible = false; b.label.material.userData.uT.value = 3; live.delete(k); }
    }
  }
  // rain
  const fall = 6 + vel * 26;
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = new THREE.Vector3(), S = new THREE.Vector3();
  const cx = camera.position.x;
  for (let i = 0; i < NR; i++) {
    const q = drops[i]; q.y -= fall * q.v * dt;
    if (q.y < -1) { q.y = 13 + Math.random() * 2; q.x = -3.5 + Math.random() * 10; }
    P.set(q.x, q.y, q.z); S.set(q.s, q.s * (6 + Math.min(14, fall * .5)), q.s);
    M.compose(P, Q, S); rain.setMatrixAt(i, M);
  }
  rain.instanceMatrix.needsUpdate = true;
  // spray
  let alive = 0;
  for (let i = 0; i < NS; i++) {
    const q = sp[i];
    if (q.life > 0) { q.life -= raw; q.v.y -= 9 * raw; q.p.addScaledVector(q.v, raw); alive++; }
    const sc = q.life > 0 ? q.s * Math.min(1, q.life * 2) : 0;
    M.compose(q.p, Q, S.setScalar(sc)); spray.setMatrixAt(i, M);
  }
  spray.instanceMatrix.needsUpdate = true;
  renderer.render(scene, camera);
  if (onScreen) requestAnimationFrame(frame); else running = false;
}
new IntersectionObserver(es => { for (const e of es) onScreen = e.isIntersecting; if (onScreen && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }, { threshold: 0 }).observe(canvas);
// start on whichever formula the page says is up
const n0 = Math.max(0, (parseInt(document.getElementById('thNum')?.textContent, 10) || 1) - 1);
if (KEYS[n0]) show(KEYS[n0].k, 1);
