/* LusterLux hero: molecules → liquid → LuxPro forms → the range joins it on a turntable under a neon LUSTERLUX
   wordmark, then the carousel walks through every formula. Bottles and labels come from their studio photos
   (tools/bottle.py); the neon is drawn here as a design element, not a photo. */
import * as THREE from 'three';
import { DATA, rAt, FILL, CAPY, studioEnv, bottleFactory, radial } from './bottlekit.js';

// carousel order: LuxPro first (it forms out of the molecules), then the wash order
const RING = ['luxpro', 'luxquick', 'ceramicx', 'wheelassassin', 'tirevenom', 'interiorx', 'restorx', 'luxfoam'];
const HERO = 'luxpro', N = RING.length, STEP = Math.PI * 2 / N, R = 6.4, HOLD = 3.4;

const canvas = document.getElementById('gl');
const stage = document.getElementById('stage');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.localClippingEnabled = true;

const scene = new THREE.Scene();
scene.environment = studioEnv(renderer, { base: 0x2a2f2a, floor: 0x121612, accent: 0x8cd20a });
const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-5, 8, 7); scene.add(key);
const rim = new THREE.DirectionalLight(0x9be014, 1.6); rim.position.set(4, 6, -8); scene.add(rim);
scene.add(new THREE.HemisphereLight(0xdfffe0, 0x0a0f08, .45));
const camera = new THREE.PerspectiveCamera(26, 1, .05, 200);

/* ---------- backdrop: LusterLux's own pop-up meet footage (tools: assets/hero/meet-bg.mp4, cut from their TikTok,
   defocused like a lens behind product), with the neon wordmark added on top ---------- */
const vid = document.createElement('video');
Object.assign(vid, { src: 'assets/hero/meet-bg.mp4', muted: true, loop: true, playsInline: true, autoplay: true, preload: 'auto', crossOrigin: 'anonymous' });
vid.setAttribute('muted', ''); vid.setAttribute('playsinline', '');
vid.play().catch(() => {});
const vidT = new THREE.VideoTexture(vid); vidT.colorSpace = THREE.SRGBColorSpace;
const posterT = new THREE.TextureLoader().load('assets/hero/meet-bg.jpg'); posterT.colorSpace = THREE.SRGBColorSpace;
const neonC = document.createElement('canvas');
const neonT = new THREE.CanvasTexture(neonC); neonT.colorSpace = THREE.SRGBColorSpace;
const bgU = { uVid: { value: posterT }, uNeon: { value: neonT }, uOn: { value: 0 }, uFoot: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) },
  uAsp: { value: 16 / 9 }, uHz: { value: .4 }, uFocus: { value: new THREE.Vector2(.5, .5) } };
vid.addEventListener('playing', () => { bgU.uVid.value = vidT; }, { once: true });
const bgQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
  uniforms: bgU, depthWrite: false, depthTest: false,
  vertexShader: 'void main(){ gl_Position = vec4(position.xy, 1.0, 1.0); }',
  fragmentShader: `uniform sampler2D uVid, uNeon; uniform float uOn, uFoot, uAsp, uHz; uniform vec2 uRes, uFocus;
    void main(){
      vec2 s = gl_FragCoord.xy / uRes;
      float ra = uRes.x / uRes.y;
      vec2 sc = ra > uAsp ? vec2(1.0, uAsp / ra) : vec2(ra / uAsp, 1.0);
      vec3 v = texture2D(uVid, uFocus + (s - .5) * sc).rgb;
      // grade: pull the footage down so the neon and the bottles carry the frame; keep its own greens
      v = pow(v, vec3(1.2)) * .46;
      // the copy side and the ground in front of the bottles sit darker
      float dark = .62 * (1.0 - smoothstep(.05, .5, s.x)) * step(1.0, ra) + .4 * smoothstep(uHz, uHz - .3, s.y);
      v *= 1.0 - dark;
      float vg = length((s - vec2(.6, .55)) * vec2(1.1, 1.0));
      v *= 1.0 - .6 * smoothstep(.35, 1.0, vg);
      vec3 c = v * uFoot + texture2D(uNeon, s).rgb * uOn;
      gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
    }` }));
bgQuad.frustumCulled = false; bgQuad.renderOrder = -1000; scene.add(bgQuad);

let fontReady = false;
document.fonts.load('italic 900 120px Archivo').then(() => { fontReady = true; layout(); });
const paintState = {};
function paint() {
  const { w, h, hz, nx, ny, fs } = paintState; if (!w) return;
  neonC.width = w; neonC.height = h;
  const x = neonC.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
  if (fontReady) {
    x.font = `italic 900 ${fs}px Archivo`; try { x.fontStretch = 'expanded'; } catch (e) {}
    const wa = x.measureText('LUSTER').width, wb = x.measureText('LUX').width, lines = fs * .9;
    const total = wa + wb + lines, x0 = nx - total / 2;
    const glow = (col, draw, lw) => {
      x.lineJoin = 'round'; x.lineCap = 'round';
      for (const [blur, k, a] of [[fs * .55, 1.75, .45], [fs * .22, 1.4, .7], [fs * .06, 1, .95]]) {
        x.save(); x.shadowColor = col; x.shadowBlur = blur; x.globalAlpha = a; x.strokeStyle = col; x.lineWidth = lw * k; draw(); x.restore();
      }
    };
    const tube = (txt, tx, ty, col, core) => {
      glow(col, () => x.strokeText(txt, tx, ty), fs * .04);
      x.save(); x.strokeStyle = core; x.lineWidth = fs * .016; x.strokeText(txt, tx, ty); x.restore();
    };
    // two water lines under the word, like the splash under the LL on their badge
    const wave = (y0, amp, ph, col, core) => {
      const path = () => { x.beginPath(); for (let i = 0; i <= 80; i++) { const t = i / 80, px = x0 + fs * .05 + t * (wa + wb - fs * .1); const py = y0 + Math.sin(t * Math.PI * 4 + ph) * amp * (0.35 + 0.65 * Math.sin(t * Math.PI)); i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); };
      glow(col, path, fs * .03);
      x.save(); x.strokeStyle = core; x.lineWidth = fs * .011; x.lineCap = 'round'; path(); x.restore();
    };
    const sign = flip => {
      x.save();
      if (flip) { x.translate(0, hz * 2); x.scale(1, -1); x.globalAlpha = .2; x.filter = `blur(${Math.round(fs * .06)}px)`; }
      tube('LUSTER', x0, ny, '#d9ecff', '#ffffff');
      tube('LUX', x0 + wa, ny, '#8cd20a', '#eaffb8');
      const lx = x0 + wa + wb + fs * .12;
      for (let i = 0; i < 4; i++) {
        const yy = ny - fs * (.72 - i * .17), len = lines * (1 - i * .2);
        x.save(); x.shadowColor = '#8cd20a'; x.shadowBlur = fs * .25; x.strokeStyle = '#8cd20a'; x.lineWidth = fs * .045; x.lineCap = 'round';
        x.beginPath(); x.moveTo(lx + fs * .1 * i, yy); x.lineTo(lx + fs * .1 * i + len * .7, yy); x.stroke();
        x.strokeStyle = '#eaffb8'; x.lineWidth = fs * .014; x.shadowBlur = 0; x.stroke(); x.restore();
      }
      wave(ny + fs * .32, fs * .07, 0, '#1fb4e8', '#d6f6ff');
      wave(ny + fs * .5, fs * .05, 1.6, '#1fb4e8', '#bdefff');
      x.restore();
    };
    sign(false); sign(true);
  }
  neonT.needsUpdate = true;
}

/* ---------- the bottles ---------- */
const makeBottle = bottleFactory(renderer, { liquidGlow: .22, shadow: 'rgba(0,0,0,' });
const ringG = new THREE.Group(); scene.add(ringG);
const bottles = RING.map(k => makeBottle(k, { forming: k === HERO }));
const hero = bottles[0];
bottles.forEach((b, i) => { scene.add(b.g); b.i = i; b.pop = b === hero ? 1 : 0; b.g.visible = b === hero; b.spinA = (Math.random() - .5) * .6; });
hero.label.material.userData.uT.value = 0; hero.cap.visible = false;
const ring = new THREE.Mesh(new THREE.TorusGeometry(1, .012, 8, 128), new THREE.MeshBasicMaterial({ color: 0x9be014, transparent: true, opacity: 0 }));
ring.rotation.x = Math.PI / 2; hero.g.add(ring);
// a pool of green light on the floor under whichever bottle is up front
const pool = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 5.2), new THREE.MeshBasicMaterial({
  map: radial([[0, 'rgba(160,230,40,.85)'], [.3, 'rgba(140,210,10,.35)'], [1, 'rgba(140,210,10,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
pool.rotation.x = -Math.PI / 2; pool.position.set(0, .01, .9); scene.add(pool);
// the turntable rim
const deck = new THREE.Mesh(new THREE.RingGeometry(R - 1.25, R + 1.25, 128), new THREE.MeshBasicMaterial({ color: 0x8cd20a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
deck.rotation.x = -Math.PI / 2; deck.position.set(0, .005, -R); scene.add(deck);
const deckEdge = new THREE.Mesh(new THREE.TorusGeometry(R + 1.25, .02, 6, 160), new THREE.MeshBasicMaterial({ color: 0xb6f03a, transparent: true, opacity: 0 }));
deckEdge.rotation.x = Math.PI / 2; deckEdge.position.set(0, .02, -R); scene.add(deckEdge);

/* ---------- the formula: molecular models ---------- */
const NM = reduce ? 0 : 430;
const atoms = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshPhysicalMaterial({ roughness: .16, clearcoat: 1, clearcoatRoughness: .05, envMapIntensity: 1.3 }), Math.max(1, NM * 3));
const bondGeo = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true); bondGeo.translate(0, .5, 0);
const bonds = new THREE.InstancedMesh(bondGeo, new THREE.MeshPhysicalMaterial({ color: 0xe8e8e8, roughness: .3, envMapIntensity: 1 }), Math.max(1, NM * 2));
atoms.frustumCulled = bonds.frustumCulled = false;
hero.g.add(atoms, bonds);
const liqCol = new THREE.Color(DATA[HERO].liquid), white = new THREE.Color(0xf7f7f7);
const mol = [];
for (let i = 0; i < NM; i++) {
  const y = .15 + Math.pow(Math.random(), .85) * (FILL - .3), a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * rAt(y) * .85;
  const s = new THREE.Vector3().randomDirection().multiplyScalar(1.6 + Math.random() * 4.2); s.y = s.y * .75 + 3.1;
  const o1 = new THREE.Vector3().randomDirection(), o2 = o1.clone().applyAxisAngle(new THREE.Vector3().randomDirection(), 1.82);
  mol.push({ t: new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r), s, o1, o2, ax: new THREE.Vector3().randomDirection(), w: .6 + Math.random() * 1.6, ph: Math.random() * 6 });
}
mol.sort((p, q) => p.t.y - q.t.y);
mol.forEach((m, i) => { m.dly = 1.25 + (i / NM) * 1.35 + Math.random() * .2; });
for (let i = 0; i < NM; i++) { atoms.setColorAt(i * 3, liqCol); atoms.setColorAt(i * 3 + 1, white); atoms.setColorAt(i * 3 + 2, white); }
if (atoms.instanceColor) atoms.instanceColor.needsUpdate = true;

/* ---------- layout / camera rig ---------- */
let W = 1, H = 1, mobile = false;
const camRing = { pos: new THREE.Vector3(), tgt: new THREE.Vector3() };
const camSolo = { pos: new THREE.Vector3(), tgt: new THREE.Vector3() };
const camMacro = { pos: new THREE.Vector3(.4, 3.1, 3.4), tgt: new THREE.Vector3(0, 3.0, 0) };
const P3 = new THREE.Vector3();
const proj = (x, y, z, cam) => { camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld(); P3.set(x, y, z).project(camera); return [(P3.x * .5 + .5) * W, (1 - (P3.y * .5 + .5)) * H]; };
function layout() {
  const r = canvas.getBoundingClientRect(); W = r.width; H = r.height;
  renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
  mobile = innerWidth <= 900;
  const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  // front bottle fills ~46% of the frame height; the turntable sits right of the copy on desktop
  const d = 6.6 / (2 * tanV * (mobile ? .52 : .5));
  const viewW = 2 * d * tanV * camera.aspect;
  const cx = mobile ? 0 : -viewW * (.68 - .5);
  camRing.tgt.set(cx, mobile ? 3.4 : 3.7, -2); camRing.pos.set(cx, mobile ? 4.6 : 4.8, d);
  const ds = 6.4 / (2 * tanV * .72);
  camSolo.tgt.set(mobile ? 0 : -ds * tanV * camera.aspect * .3, 3.1, 0); camSolo.pos.set(camSolo.tgt.x, 3.9, ds);
  renderer.getDrawingBufferSize(bgU.uRes.value);
  // paint the room for this frame: seam behind the turntable, sign above the back bottles
  const [, hz] = proj(0, 0, -11, camRing);
  const [nx, backTop] = proj(0, 6.3, -6.5, camRing);
  const k = Math.min(1.5, devicePixelRatio || 1);
  // size the sign to fit its column: ~52% of the width on desktop, ~88% on phones
  const mc = document.createElement('canvas').getContext('2d'); mc.font = 'italic 900 100px Archivo'; try { mc.fontStretch = 'expanded'; } catch (e) {}
  const unit = (mc.measureText('LUSTERLUX').width + 90 + 12) / 100;
  const fs = Math.min(W * (mobile ? .88 : .5) / unit, H * .15);
  const ny = Math.max(fs * 1.15, Math.min(backTop - fs * .85, hz - fs * .75));
  Object.assign(paintState, { w: Math.round(W * k), h: Math.round(H * k), hz: hz * k, nx: nx * k, ny: ny * k, fs: fs * k });
  bgU.uHz.value = 1 - hz / H; bgU.uFocus.value.set(mobile ? .5 : .55, .52);
  paint();
}
layout(); addEventListener('resize', layout);

/* ---------- motion ---------- */
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const sm = (a, b, t) => { const x = Math.min(1, Math.max(0, (t - a) / (b - a))); return x * x * (3 - 2 * x); };
const outBack = t => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), V2 = new THREE.Vector3(), S = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
let T0 = null, last = 0, visible = true, running = false, done = false, px = 0, pxT = 0, py = 0, pyT = 0;
let cur = 0, target = 0, nextAt = 7.8 + HOLD, shown = -1, paused = false;
addEventListener('pointermove', e => { pxT = e.clientX / innerWidth - .5; pyT = e.clientY / innerHeight - .5; });
const lerpCam = (a, b, t) => { camera.position.lerpVectors(a.pos, b.pos, t); V.lerpVectors(a.tgt, b.tgt, t); camera.lookAt(V); };
const announce = () => {
  const i = ((Math.round(target) % N) + N) % N;
  if (i !== shown) { shown = i; dispatchEvent(new CustomEvent('lux:show', { detail: { k: RING[i], i, n: N, hold: HOLD } })); }
};
// neon flickers on, then hums
const flick = T => { if (T < 4.4) return 0; const t = T - 4.4; if (t > 1.2) return .94 + .06 * Math.sin(T * 7.3) * Math.sin(T * 2.1); return [0, 1, 0, 0, 1, .3, 1, 1, 0, 1, 1, 1][Math.floor(t * 10)] ?? 1; };

function placeMolecules(T) {
  for (let i = 0; i < NM; i++) {
    const m = mol[i];
    const k = Math.min(1, Math.max(0, (T - m.dly) / 1.1)), e = ease(k);
    const sw = (1 - e) * 2.2;
    V.copy(m.s); V.y += Math.sin(T * .9 + m.ph) * .12 * (1 - e);
    V.applyAxisAngle(UP, sw + T * .15 * (1 - e));
    V.lerp(m.t, e);
    const size = (.085 - .03 * e) * (1 - sm(.82, 1, k)) * sm(0, .25, T + .25);
    Q.setFromAxisAngle(m.ax, T * m.w + m.ph);
    M.compose(V, Q, S.setScalar(size)); atoms.setMatrixAt(i * 3, M);
    for (let j = 0; j < 2; j++) {
      const o = j ? m.o2 : m.o1;
      V2.copy(o).applyQuaternion(Q).multiplyScalar(size * 1.9).add(V);
      M.compose(V2, Q, S.setScalar(size * .62)); atoms.setMatrixAt(i * 3 + 1 + j, M);
      const dir = V2.clone().sub(V), len = dir.length();
      const bq = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize());
      M.compose(V, bq, S.set(size * .18, len, size * .18)); bonds.setMatrixAt(i * 2 + j, M);
    }
  }
  atoms.instanceMatrix.needsUpdate = bonds.instanceMatrix.needsUpdate = true;
}

function frame(now) {
  if (T0 === null) T0 = now;
  const T = reduce ? 20 : (now - T0) / 1000, dt = Math.min(.05, Math.max(0, T - last)); last = T;

  // 1. the formula builds LuxPro
  if (NM && T < 3.8) placeMolecules(T); else if (atoms.visible) { atoms.visible = bonds.visible = false; }
  hero.clipLiq.constant = .05 + (FILL + .1) * sm(1.5, 3.4, T);
  const g = sm(2.9, 3.9, T), gh = g * 6.0;
  hero.clipGlass.constant = gh;
  ring.position.y = Math.min(gh, 5.95); ring.scale.setScalar(rAt(Math.min(gh, 5.95)) + .03);
  ring.material.opacity = g > 0 && g < 1 ? .9 * Math.sin(g * Math.PI) : 0;
  hero.label.material.userData.uT.value = Math.min(3, Math.max(0, (T - 3.55) / 1.25) * 1.6);
  hero.label.visible = T > 3.5;
  const cT = Math.min(1, Math.max(0, (T - 4.75) / .7));
  hero.cap.visible = cT > 0; hero.cap.position.y = CAPY + (1 - outBack(cT)) * 1.3; hero.cap.rotation.y = (1 - cT) * -Math.PI * 3;
  hero.sh.material.opacity = .9 * sm(3.0, 4.2, T);
  bgU.uOn.value = flick(T); bgU.uFoot.value = sm(4.2, 6.2, T);

  // 2. camera: macro → the bottle → wide on the turntable
  const pull = ease(sm(.9, 3.3, T)), wide = ease(sm(5.4, 7.4, T));
  if (wide > 0) lerpCam(camSolo, camRing, wide); else lerpCam(camMacro, camSolo, pull);
  if (T < 1.2) camera.position.x += Math.sin(T * .8) * .12;

  // 3. the carousel
  if (T > nextAt && !paused && !reduce) { target += 1; nextAt = T + HOLD; }
  cur += (target - cur) * (1 - Math.exp(-dt * 4.2));
  const deckK = sm(5.6, 7.2, T);
  deck.material.opacity = 0; deckEdge.material.opacity = 0;
  pool.material.opacity = (.55 + .12 * Math.sin(T * 2.4)) * sm(4.2, 5.6, T);
  // cover-flow: the front bottle stands forward and turns to show its label; neighbours step back and angle in
  for (const b of bottles) {
    let o = b.i - cur; o = ((o % N) + N * 1.5) % N - N / 2;          // wrap to [-N/2, N/2)
    const a = Math.abs(o), sg = Math.sign(o);
    const x = sg * (a < 1 ? a * 3.3 : 3.3 + (a - 1) * 2.3);
    const z = a < 1 ? .9 - a * 4.2 : -3.3 - (a - 1) * 3.2;
    b.g.position.set(x, 0, z);
    const front = Math.max(0, 1 - a);
    let k = 1;
    if (b !== hero) k = sm(5.9 + a * .25, 6.7 + a * .25, T);
    const fade = 1 - sm(2.15, 2.75, a);                                // only the front five show
    b.g.visible = k * fade > .001; b.g.scale.setScalar(Math.max(.001, outBack(k) * fade));
    // when a bottle arrives at the front it makes one turn and lands label-forward, then sways
    if (front > .9) { if (!b.atFront) { b.atFront = true; b.turnT = T; } } else b.atFront = false;
    const tt = b.atFront ? Math.min(1, (T - b.turnT) / 1.3) : 1;
    const yaw = b.atFront ? -Math.PI * 2 * (1 - ease(tt)) + Math.sin(T * .9) * .28 * tt : -sg * .55 * Math.min(1, a);
    b.spinA += (yaw - b.spinA) * (1 - Math.exp(-dt * (b.atFront ? 30 : 5)));
    b.spin.rotation.y = b === hero && T < 7 ? Math.sin(T * .6) * .2 : b.spinA;
    b.g.position.y = front * .1 * Math.sin(T * 1.6);
  }
  if (T > 7.6) announce();
  if (!done && T > 7.3) { done = true; stage.classList.add('ready'); }
  if (T > 4.9 && !stage.classList.contains('formed')) stage.classList.add('formed');

  // pointer parallax once it's all on stage
  px += (pxT - px) * .05; py += (pyT - py) * .05;
  if (done) { camera.position.x += px * .7; camera.position.y -= py * .4; camera.lookAt(camRing.tgt); }

  renderer.render(scene, camera);
  if (visible) requestAnimationFrame(frame); else running = false;
}

// click a bottle to bring it to the front
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
canvas.addEventListener('pointermove', e => {
  if (!done) return;
  const r = canvas.getBoundingClientRect();
  ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  ray.setFromCamera(ptr, camera);
  canvas.style.cursor = ray.intersectObjects(bottles.map(b => b.glass), false).length ? 'pointer' : '';
});
const go = i => {
  const now = ((Math.round(target) % N) + N) % N; let d = i - now;
  if (d > N / 2) d -= N; if (d < -N / 2) d += N;
  target = Math.round(target) + d; nextAt = (performance.now() - T0) / 1000 + HOLD * 1.6; announce();
};
canvas.addEventListener('click', () => {
  if (!done) return;
  const hit = ray.intersectObjects(bottles.map(b => b.glass), false)[0];
  if (hit) go(bottles.find(b => b.glass === hit.object).i);
});

let onScreen = true;
const kick = () => { visible = onScreen; if (visible && !running) { running = true; requestAnimationFrame(frame); } };
new IntersectionObserver(es => { for (const e of es) onScreen = e.isIntersecting; kick(); }, { threshold: .02 }).observe(canvas);
window.__hero = {
  seek(t) { T0 = performance.now() - t * 1000; last = t; nextAt = Math.max(nextAt, t + HOLD); },
  go: i => go(i), next: () => go((((Math.round(target) % N) + N) % N + 1) % N), prev: () => go((((Math.round(target) % N) + N) % N + N - 1) % N),
  pause(on) { paused = on; if (!on) nextAt = (performance.now() - T0) / 1000 + HOLD; }, ring: RING,
};
kick();
