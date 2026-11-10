/* LusterLux — "The Bay" hero film.
   Plays on its own, no scrolling. One canvas: registered stills of their
   McLaren in their shop, four wipe sheets drawn in code (LuxFoam, rinse
   curtain, LuxQuick glint, WheelAssassin mist) and two real camera moves
   played from muted inline video (the push-in, and the car rolling out).
   A clock drives it; it waits on video that isn't ready, pauses off
   screen, and the chapter rail jumps or replays. */
(() => {
  const host = document.getElementById('bay');
  if (!host) return;
  const cv = document.getElementById('storyCv');
  const ctx = cv.getContext('2d', { alpha: false });
  const small = matchMedia('(max-width: 760px)').matches;
  const still_ = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tag = small ? 'm' : 'd';
  const BASE = 'assets/story/';
  const V = host.dataset.v || '';

  /* focal x per image, so phones crop around the subject */
  const STILLS = small
    ? { dirty: .64, foam: .64, clean: .64, spots: .42, glass: .42, bead: .5, wheel: .5, wheelclean: .5, gold: .56 }
    : { dirty: .56, foam: .56, clean: .56, spots: .42, glass: .42, bead: .27, wheel: .45, wheelclean: .45, gold: .55 };
  const ZOOM = small ? {} : { bead: 1.26 };
  const img = {};
  Object.keys(STILLS).forEach(k => { const i = new Image(); i.decoding = 'async'; i.src = `${BASE}s-${k}-${tag}.webp${V}`; img[k] = i; });

  /* the two camera moves */
  const VIDS = {
    A: { fx: small ? [.64, .42] : [.56, .42] },
    C: { fx: small ? [.56, .5] : [.55, .5] },
  };
  Object.keys(VIDS).forEach(c => {
    const v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.preload = 'auto';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.src = `${BASE}${c.toLowerCase()}-${tag}.mp4${V}`;
    VIDS[c].el = v;
  });

  /* ---- the cut: seconds ---- */
  const SEG = [
    { d: 3.0, k: 'hold', a: 'dirty', ch: 0 },
    { d: 2.2, k: 'wipe', a: 'dirty', b: 'foam', fx: 'foam', dir: -1, ch: 1 },
    { d: 1.0, k: 'hold', a: 'foam', ch: 1 },
    { d: 2.2, k: 'wipe', a: 'foam', b: 'clean', fx: 'water', dir: 1, ch: 1 },
    { d: .6, k: 'hold', a: 'clean', ch: 1 },
    { d: 4.2, k: 'vid', c: 'A', a: 'clean', b: 'spots', ch: 2 },
    { d: .9, k: 'hold', a: 'spots', ch: 2 },
    { d: .6, k: 'hold', a: 'spots', ch: 3 },
    { d: 2.0, k: 'wipe', a: 'spots', b: 'glass', fx: 'glint', dir: 1, ch: 3 },
    { d: 1.0, k: 'hold', a: 'glass', ch: 3 },
    { d: 1.1, k: 'fade', a: 'glass', b: 'bead', ch: 4 },
    { d: 2.6, k: 'hold', a: 'bead', ch: 4 },
    { d: 1.1, k: 'fade', a: 'bead', b: 'wheel', ch: 5 },
    { d: .8, k: 'hold', a: 'wheel', ch: 5 },
    { d: 2.0, k: 'wipe', a: 'wheel', b: 'wheelclean', fx: 'mist', dir: -1, ch: 5 },
    { d: 1.0, k: 'hold', a: 'wheelclean', ch: 5 },
    { d: 1.4, k: 'fade', a: 'wheelclean', b: 'gold', ch: 6 },
    { d: 5.0, k: 'vid', c: 'C', a: 'gold', b: 'gold', ch: 6 },
    { d: 0, k: 'end', ch: 6 },
  ];
  let T0 = 0; SEG.forEach(s => { s.t0 = T0; T0 += s.d; s.t1 = T0; });
  const TOTAL = T0;
  const CH = [];
  SEG.forEach(s => { if (!CH[s.ch]) CH[s.ch] = { t0: s.t0, t1: s.t1 }; CH[s.ch].t1 = Math.max(CH[s.ch].t1, s.t1); });

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
  /* fit: on phones the finished car is framed by height (top 64% of the
     screen) instead of filling it, so the whole car shows; the frame fades
     into black underneath where the copy sits */
  function cover(im, fx = .5, zoom = 1, alpha = 1, fit = false) {
    const iw = im && (im.naturalWidth || im.videoWidth), ih = im && (im.naturalHeight || im.videoHeight);
    if (!iw || (im.tagName === 'IMG' && !im.complete) || (im.tagName === 'VIDEO' && im.readyState < 2)) return false;
    const s = fit ? Math.max(W / iw, H * .58 / ih) : Math.max(W / iw, H / ih) * zoom;
    const dw = iw * s, dh = ih * s;
    const x = Math.min(0, Math.max(W - dw, W / 2 - dw * fx));
    const y = fit ? H * .06 : (H - dh) / 2;
    ctx.globalAlpha = alpha;
    if (fit) { ctx.fillStyle = '#030403'; ctx.fillRect(0, 0, W, H); }
    ctx.drawImage(im, x, y, dw, dh);
    if (fit) {
      const g = ctx.createLinearGradient(0, y + dh * .62, 0, y + dh);
      g.addColorStop(0, 'rgba(3,4,3,0)'); g.addColorStop(1, 'rgba(3,4,3,1)');
      ctx.fillStyle = g; ctx.fillRect(0, y + dh * .62, W, dh * .38 + 2);
      ctx.fillStyle = '#030403'; ctx.fillRect(0, y + dh, W, H);
      const t = ctx.createLinearGradient(0, 0, 0, y + 40); t.addColorStop(0, 'rgba(3,4,3,1)'); t.addColorStop(1, 'rgba(3,4,3,0)');
      ctx.fillStyle = t; ctx.fillRect(0, 0, W, y + 40);
    }
    ctx.globalAlpha = 1;
    return true;
  }
  const FIT = small ? { gold: 1, C: 1 } : {};
  const still = (k, z = 1, a = 1) => cover(img[k], STILLS[k], FIT[k] ? 1 : z * (ZOOM[k] || 1), a, !!FIT[k]);
  const ease = t => t * t * (3 - 2 * t);
  const cl = x => Math.min(1, Math.max(0, x));

  /* the wipe sheets */
  function sheet(fx, x, time) {
    const g = ctx;
    if (fx === 'water') {
      const gr = g.createLinearGradient(x - 70 * DPR, 0, x + 70 * DPR, 0);
      gr.addColorStop(0, 'rgba(180,230,255,0)'); gr.addColorStop(.42, 'rgba(200,240,255,.26)');
      gr.addColorStop(.5, 'rgba(255,255,255,.9)'); gr.addColorStop(.58, 'rgba(200,240,255,.26)'); gr.addColorStop(1, 'rgba(180,230,255,0)');
      g.fillStyle = gr; g.fillRect(x - 70 * DPR, 0, 140 * DPR, H);
      g.fillStyle = 'rgba(255,255,255,.85)';
      for (let i = 0; i < 140; i++) {
        const r = Math.sin(i * 91.7) * .5 + .5, q = Math.sin(i * 13.3) * .5 + .5;
        const yy = ((q + time * (.6 + r)) % 1) * H, xx = x + (r - .5) * 120 * DPR;
        g.globalAlpha = .25 + .6 * r; g.fillRect(xx, yy, 1.4 * DPR, (6 + r * 18) * DPR);
      }
      g.globalAlpha = 1;
    } else if (fx === 'foam') {
      const w = 110 * DPR;
      const gr = g.createLinearGradient(x - w, 0, x + w, 0);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.45, 'rgba(250,250,252,.85)');
      gr.addColorStop(.55, 'rgba(250,250,252,.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(x - w, 0, w * 2, H);
      g.fillStyle = 'rgba(255,255,255,.9)';
      for (let i = 0; i < 90; i++) {
        const r = Math.sin(i * 77.1) * .5 + .5, q = Math.sin(i * 31.9) * .5 + .5;
        g.beginPath(); g.arc(x + (r - .5) * w * 1.4, q * H + Math.sin(time * 2 + i) * 4 * DPR, (5 + r * 16) * DPR, 0, 6.283); g.fill();
      }
    } else if (fx === 'glint') {
      const gr = g.createLinearGradient(x - 50 * DPR, 0, x + 50 * DPR, 0);
      gr.addColorStop(0, 'rgba(255,250,235,0)'); gr.addColorStop(.46, 'rgba(255,248,230,.3)');
      gr.addColorStop(.5, 'rgba(255,255,255,.95)'); gr.addColorStop(.54, 'rgba(255,248,230,.3)'); gr.addColorStop(1, 'rgba(255,250,235,0)');
      g.fillStyle = gr; g.fillRect(x - 50 * DPR, 0, 100 * DPR, H);
    } else if (fx === 'mist') {
      const w = 150 * DPR;
      const gr = g.createLinearGradient(x - w, 0, x + w, 0);
      gr.addColorStop(0, 'rgba(235,240,220,0)'); gr.addColorStop(.5, 'rgba(240,244,225,.34)'); gr.addColorStop(1, 'rgba(235,240,220,0)');
      g.fillStyle = gr; g.fillRect(x - w, 0, w * 2, H);
      g.fillStyle = 'rgba(250,252,240,.75)';
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
    if (t > 0 && t < 1) sheet(s.fx, x, time);
  }

  /* video segments follow the clock: playbackRate stretches the clip to
     the segment, a drift over .3s re-seeks, and an unready video holds
     the clock (returns false) instead of skipping the shot */
  let active = null;
  function vid(s, t, playing) {
    const o = VIDS[s.c], v = o.el;
    if (active && active !== v) active.pause();
    active = v;
    const fx = o.fx[0] + (o.fx[1] - o.fx[0]) * t;
    if (v.readyState < 3 || !v.duration) { still(t < .5 ? s.a : s.b); try { v.load && v.readyState === 0 && v.load(); } catch (e) {} return false; }
    const want = t * v.duration;
    v.playbackRate = Math.min(4, Math.max(.25, v.duration / s.d));
    if (Math.abs(v.currentTime - want) > .3) v.currentTime = Math.min(want, v.duration - .04);
    if (playing && v.paused && t < 1) v.play().catch(() => {});
    if (!playing && !v.paused) v.pause();
    if (!cover(v, fx, 1, 1, !!FIT[s.c])) still(t < .5 ? s.a : s.b);
    return true;
  }
  function endFrame() {
    const v = VIDS.C.el;
    if (v.readyState >= 2 && v.duration) {
      if (!v.paused) v.pause();
      if (v.currentTime < v.duration - .1) v.currentTime = v.duration - .04;
      if (cover(v, VIDS.C.fx[1], 1, 1, !!FIT.C)) return;
    }
    still('gold');
  }

  const rail = [...host.querySelectorAll('.st-rail button')];
  function draw(T, time, playing) {
    size();
    const s = SEG.find(s => T < s.t1) || SEG[SEG.length - 1];
    const t = s.d ? cl((T - s.t0) / s.d) : 1;
    let ok = true;
    if (s.k !== 'vid' && active) { active.pause(); active = null; }
    if (s.k === 'hold') still(s.a, 1 + .025 * t);
    else if (s.k === 'fade') { still(s.a, 1 + .04 * t); still(s.b, 1.06 - .06 * ease(t), ease(t)); }
    else if (s.k === 'wipe') wipe(s, t, time);
    else if (s.k === 'vid') ok = vid(s, t, playing);
    else endFrame();
    if (host.dataset.ch !== String(s.ch)) host.dataset.ch = s.ch;
    host.classList.toggle('st-end', s.k === 'end');
    rail.forEach((b, i) => {
      const c = CH[i]; if (!c) return;
      b.style.setProperty('--f', cl((T - c.t0) / (c.t1 - c.t0)).toFixed(3));
      b.classList.toggle('on', i === s.ch);
    });
    return ok;
  }

  /* ---- clock ---- */
  let touched = false;
  let T = still_ ? TOTAL : 0, playing = false, onScreen = false, userPaused = false, last = 0, started = false;
  const btn = host.querySelector('.st-play');
  function setBtn() {
    if (!btn) return;
    const end = T >= TOTAL;
    btn.dataset.s = end ? 'replay' : (playing ? 'pause' : 'play');
    btn.setAttribute('aria-label', end ? 'Replay the film' : (playing ? 'Pause the film' : 'Play the film'));
  }
  function loop(now) {
    const dt = last ? Math.min(.1, (now - last) / 1000) : 0; last = now;
    const run = playing && onScreen && !document.hidden;
    const ok = draw(T, now / 1000, run);
    if (run && ok && T < TOTAL) T = Math.min(TOTAL, T + dt);
    if (T >= TOTAL && playing) { playing = false; setBtn(); }
    if (onScreen) requestAnimationFrame(loop); else { last = 0; if (active) active.pause(); }
  }
  function kick() { if (onScreen) { last = 0; requestAnimationFrame(loop); } }
  new IntersectionObserver(es => {
    const was = onScreen; onScreen = es[0].isIntersecting;
    if (onScreen && !was) kick();
  }, { threshold: .15 }).observe(host);

  function play() { if (T >= TOTAL) T = 0; playing = true; userPaused = false; setBtn(); }
  btn && btn.addEventListener('click', () => {
    if (playing) { playing = false; userPaused = true; if (active) active.pause(); }
    else play();
    setBtn();
  });
  rail.forEach((b, i) => b.addEventListener('click', () => {
    touched = true; T = CH[i].t0 + .001; if (active) { active.pause(); active = null; }
    if (!userPaused) playing = true; setBtn(); draw(T, 0, false);
  }));
  addEventListener('resize', () => draw(T, 0, false), { passive: true });

  /* start once the first frame is in and the intro has cleared */
  function start() {
    if (started) return; started = true;
    host.classList.add('st-ready');
    draw(T, 0, false);
    if (still_) { setBtn(); return; }
    const intro = document.getElementById('intro');
    const wait = intro && !document.documentElement.classList.contains('no-intro') ? 2900 : 400;
    setTimeout(() => { if (!playing && !userPaused && !touched && T < TOTAL) play(); }, wait);
  }
  if (img.dirty.complete && img.dirty.naturalWidth) start(); else img.dirty.onload = start;
  window.__story = (sec, run) => { touched = true; T = Math.max(0, Math.min(TOTAL, sec)); playing = !!run; setBtn(); draw(T, 1, false); return { T, TOTAL, ch: host.dataset.ch }; };
  window.__storyCH = CH;
})();
