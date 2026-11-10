/* LusterLux — "The Bay" scroll story.
   One canvas. Registered stills of their McLaren in their shop, two Kling
   camera moves cut to frame sequences, and four wipe sheets drawn in code
   (LuxFoam, rinse curtain, LuxQuick glint, WheelAssassin mist). Everything
   is driven by an eased playhead, so it scrubs forward and back. rAF runs
   only while the section is on screen. */
(() => {
  const host = document.getElementById('bay');
  if (!host) return;
  const cv = document.getElementById('storyCv');
  const ctx = cv.getContext('2d', { alpha: false });
  const small = matchMedia('(max-width: 760px)').matches;
  const tag = small ? 'm' : 'd';
  const BASE = 'assets/story/';
  const V = host.dataset.v || '';

  /* focal x per image, so phones crop around the subject */
  const STILLS = {
    dirty: .56, foam: .56, clean: .56, spots: .42, glass: .42, bead: .27, wheel: .45, wheelclean: .45, gold: .55
  };
  const img = {};
  Object.keys(STILLS).forEach(k => { const i = new Image(); i.decoding = 'async'; i.src = `${BASE}s-${k}-${tag}.webp${V}`; img[k] = i; });

  const CLIPS = { A: { n: +host.dataset.na || 0, fx: small ? [.64, .42] : [.56, .42] }, B: { n: +host.dataset.nb || 0, fx: small ? [.5, .62] : [.45, .55] } };
  const frames = { A: [], B: [] };
  function loadClips() {
    ['A', 'B'].forEach(c => {
      for (let i = 0; i < CLIPS[c].n; i++) {
        const f = new Image(); f.decoding = 'async';
        f.src = `${BASE}${c.toLowerCase()}/${tag}-${String(i).padStart(3, '0')}.webp${V}`;
        frames[c][i] = f;
      }
    });
  }

  /* ---- timeline: weights are relative scroll distance ---- */
  const SEG = [
    { w: .7, k: 'hold', a: 'dirty', ch: 0 },
    { w: 1.1, k: 'wipe', a: 'dirty', b: 'foam', fx: 'foam', dir: -1, ch: 1 },
    { w: 1.1, k: 'wipe', a: 'foam', b: 'clean', fx: 'water', dir: 1, ch: 1 },
    { w: .35, k: 'hold', a: 'clean', ch: 1 },
    { w: 1.3, k: 'clip', c: 'A', a: 'clean', b: 'spots', ch: 2 },
    { w: .35, k: 'hold', a: 'spots', ch: 2 },
    { w: 1.0, k: 'wipe', a: 'spots', b: 'glass', fx: 'glint', dir: 1, ch: 3 },
    { w: .6, k: 'fade', a: 'glass', b: 'bead', ch: 4 },
    { w: .5, k: 'hold', a: 'bead', ch: 4 },
    { w: .6, k: 'fade', a: 'bead', b: 'wheel', ch: 5 },
    { w: 1.0, k: 'wipe', a: 'wheel', b: 'wheelclean', fx: 'mist', dir: -1, ch: 5 },
    { w: 1.8, k: 'clip', c: 'B', a: 'wheelclean', b: 'gold', ch: 6 },
    { w: .8, k: 'hold', a: 'gold', ch: 6 },
  ];
  const TOTAL = SEG.reduce((a, s) => a + s.w, 0);
  let acc = 0; SEG.forEach(s => { s.p0 = acc / TOTAL; acc += s.w; s.p1 = acc / TOTAL; });

  /* ---- drawing ---- */
  let W = 0, H = 0, DPR = 1;
  function size() {
    DPR = Math.min(devicePixelRatio || 1, small ? 2 : 1.5);
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    if (cv.width !== Math.round(w * DPR) || cv.height !== Math.round(h * DPR)) {
      cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR);
    }
    W = cv.width; H = cv.height;
  }
  function cover(im, fx = .5, zoom = 1, alpha = 1) {
    if (!im || !im.complete || !im.naturalWidth) return false;
    const s = Math.max(W / im.naturalWidth, H / im.naturalHeight) * zoom;
    const dw = im.naturalWidth * s, dh = im.naturalHeight * s;
    const x = Math.min(0, Math.max(W - dw, W / 2 - dw * fx));
    const y = (H - dh) / 2;
    ctx.globalAlpha = alpha;
    ctx.drawImage(im, x, y, dw, dh);
    ctx.globalAlpha = 1;
    return true;
  }
  /* the bead sits dead centre in its plate; push it right of the headline */
  const ZOOM = small ? {} : { bead: 1.26 };
  if (small) Object.assign(STILLS, { dirty: .64, foam: .64, clean: .64, bead: .5, wheel: .5, wheelclean: .5, gold: .62 });
  const still = (k, z = 1, a = 1) => cover(img[k], STILLS[k], z * (ZOOM[k] || 1), a);
  const ease = t => t * t * (3 - 2 * t);
  const cl = x => Math.min(1, Math.max(0, x));

  /* the wipe sheets */
  function sheet(fx, x, t, time) {
    const g = ctx;
    if (fx === 'water') {
      /* a bright curtain of water: hot core, soft spray both sides, droplets */
      let gr = g.createLinearGradient(x - 70 * DPR, 0, x + 70 * DPR, 0);
      gr.addColorStop(0, 'rgba(180,230,255,0)'); gr.addColorStop(.42, 'rgba(200,240,255,.28)');
      gr.addColorStop(.5, 'rgba(255,255,255,.95)'); gr.addColorStop(.58, 'rgba(200,240,255,.28)'); gr.addColorStop(1, 'rgba(180,230,255,0)');
      g.fillStyle = gr; g.fillRect(x - 70 * DPR, 0, 140 * DPR, H);
      g.fillStyle = 'rgba(255,255,255,.85)';
      for (let i = 0; i < 140; i++) {
        const r = (Math.sin(i * 91.7) * .5 + .5), q = (Math.sin(i * 13.3) * .5 + .5);
        const yy = ((q + time * (.6 + r)) % 1) * H;
        const xx = x + (r - .5) * 120 * DPR;
        g.globalAlpha = .25 + .6 * r; g.fillRect(xx, yy, 1.4 * DPR, (6 + r * 18) * DPR);
      }
      g.globalAlpha = 1;
    } else if (fx === 'foam') {
      /* a fat, lumpy band of white foam riding the edge */
      const w = 110 * DPR;
      let gr = g.createLinearGradient(x - w, 0, x + w, 0);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.45, 'rgba(250,250,252,.85)');
      gr.addColorStop(.55, 'rgba(250,250,252,.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(x - w, 0, w * 2, H);
      g.fillStyle = 'rgba(255,255,255,.9)';
      for (let i = 0; i < 90; i++) {
        const r = Math.sin(i * 77.1) * .5 + .5, q = Math.sin(i * 31.9) * .5 + .5;
        g.beginPath(); g.arc(x + (r - .5) * w * 1.4, q * H + Math.sin(time * 2 + i) * 4 * DPR, (5 + r * 16) * DPR, 0, 6.283); g.fill();
      }
    } else if (fx === 'glint') {
      /* LuxQuick: a hard light streak with a lime edge */
      let gr = g.createLinearGradient(x - 50 * DPR, 0, x + 50 * DPR, 0);
      gr.addColorStop(0, 'rgba(132,208,25,0)'); gr.addColorStop(.46, 'rgba(160,236,60,.35)');
      gr.addColorStop(.5, 'rgba(255,255,255,.95)'); gr.addColorStop(.54, 'rgba(160,236,60,.35)'); gr.addColorStop(1, 'rgba(132,208,25,0)');
      g.fillStyle = gr; g.fillRect(x - 50 * DPR, 0, 100 * DPR, H);
    } else if (fx === 'mist') {
      /* WheelAssassin: a yellow-lime mist that eats the dust */
      const w = 150 * DPR;
      let gr = g.createLinearGradient(x - w, 0, x + w, 0);
      gr.addColorStop(0, 'rgba(217,242,28,0)'); gr.addColorStop(.5, 'rgba(225,248,90,.42)'); gr.addColorStop(1, 'rgba(217,242,28,0)');
      g.fillStyle = gr; g.fillRect(x - w, 0, w * 2, H);
      g.fillStyle = 'rgba(240,255,170,.75)';
      for (let i = 0; i < 160; i++) {
        const r = Math.sin(i * 51.3) * .5 + .5, q = Math.sin(i * 17.7) * .5 + .5;
        g.globalAlpha = .2 + .5 * r;
        g.beginPath(); g.arc(x + (r - .5) * w * 1.6 + Math.sin(time * 3 + i) * 6 * DPR, q * H, (1 + r * 2.4) * DPR, 0, 6.283); g.fill();
      }
      g.globalAlpha = 1;
    }
  }

  function wipe(s, t, time) {
    const e = ease(t);
    const x = s.dir > 0 ? e * (W + 240 * DPR) - 120 * DPR : W + 120 * DPR - e * (W + 240 * DPR);
    still(s.a);
    ctx.save(); ctx.beginPath();
    if (s.dir > 0) ctx.rect(0, 0, Math.max(0, x), H); else ctx.rect(Math.max(0, x), 0, W, H);
    ctx.clip(); still(s.b); ctx.restore();
    if (t > 0 && t < 1) sheet(s.fx, x, t, time);
  }

  function clip(s, t) {
    const n = CLIPS[s.c].n, fr = frames[s.c];
    if (!n) { still(t < .5 ? s.a : s.b); return; }
    const f = t * (n - 1), i = Math.floor(f), j = Math.min(n - 1, i + 1), k = f - i;
    const fx = CLIPS[s.c].fx[0] + (CLIPS[s.c].fx[1] - CLIPS[s.c].fx[0]) * t;
    if (!cover(fr[i], fx)) { still(t < .5 ? s.a : s.b); return; }
    if (k > .02 && fr[j]) cover(fr[j], fx, 1, k);
  }

  function draw(p, time) {
    size();
    const s = SEG.find(s => p <= s.p1) || SEG[SEG.length - 1];
    const t = cl((p - s.p0) / (s.p1 - s.p0));
    if (s.k === 'hold') still(s.a, 1 + .02 * t);
    else if (s.k === 'fade') { still(s.a, 1 + .04 * t); still(s.b, 1.06 - .06 * ease(t), ease(t)); }
    else if (s.k === 'wipe') wipe(s, t, time);
    else clip(s, t);
    if (host.dataset.ch !== String(s.ch)) host.dataset.ch = s.ch;
    host.classList.toggle('st-end', p > .965);
    const bar = document.getElementById('storyBar');
    if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
  }

  /* ---- playhead ---- */
  function prog() {
    const r = host.getBoundingClientRect(), span = host.offsetHeight - innerHeight;
    return span > 0 ? cl(-r.top / span) : 0;
  }
  let cur = prog(), run = false;
  const t0 = performance.now();
  function tick() {
    if (!run) return;
    const target = prog();
    cur += (target - cur) * 0.16;
    if (Math.abs(target - cur) < .0004) cur = target;
    draw(cur, (performance.now() - t0) / 1000);
    requestAnimationFrame(tick);
  }
  new IntersectionObserver(es => { run = es[0].isIntersecting; if (run) requestAnimationFrame(tick); }, { rootMargin: '15% 0px' }).observe(host);
  addEventListener('resize', () => draw(cur, 0), { passive: true });
  img.dirty.onload = () => { draw(cur, 0); host.classList.add('st-ready'); };
  if (document.readyState === 'complete') loadClips(); else addEventListener('load', loadClips);
  window.__story = p => { cur = p; draw(p, 1); };
})();
