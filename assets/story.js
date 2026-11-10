/* LusterLux — "The Bay" hero film (v5).
   One real video, cut from generated footage of their McLaren in their shop:
   arrive dirty → LuxFoam → rinse → LuxQuick on water spots → CeramicX beading
   → WheelAssassin → TireVenom → the finished car. The browser plays it
   natively (no canvas), so motion is as smooth as the footage. The script
   only follows the playhead: it sets the chapter (copy + product card), fills
   the chapter rail, pauses off screen, and handles pause / replay / jumps. */
(() => {
  const host = document.getElementById('bay');
  if (!host) return;
  const v = host.querySelector('.st-vid');
  if (!v) return;
  const small = matchMedia('(max-width: 760px)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const V = host.dataset.v || '';

  /* chapter start times in the cut (seconds), written by tools/film.py */
  const T0 = (host.dataset.chapters || '0').split(',').map(Number);
  const rail = [...host.querySelectorAll('.st-rail button')];
  const btn = host.querySelector('.st-play');
  let D = 0;
  const CH = () => T0.map((t, i) => ({ t0: t, t1: i < T0.length - 1 ? T0[i + 1] : (D || t + 5) }));

  v.muted = true; v.playsInline = true;
  v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
  v.src = `assets/story/film-${small ? 'm' : 'd'}.mp4${V}`;
  v.addEventListener('loadedmetadata', () => { D = v.duration; paint(); });

  let userPaused = false, wantPlay = false, raf = 0;
  /* the observer below keeps this current; seed it from the layout so a
     browser that delays the first observer callback still starts the film */
  const r0 = host.getBoundingClientRect();
  let onScreen = r0.bottom > innerHeight * .15 && r0.top < innerHeight * .85;

  function chAt(t) { let c = 0; T0.forEach((s, i) => { if (t >= s - .05) c = i; }); return c; }
  function paint() {
    const t = v.currentTime || 0, c = chAt(t), chs = CH();
    if (host.dataset.ch !== String(c)) host.dataset.ch = c;
    host.classList.toggle('st-end', v.ended || (D && t >= D - .15));
    rail.forEach((b, i) => {
      const r = chs[i]; if (!r) return;
      b.style.setProperty('--f', Math.min(1, Math.max(0, (t - r.t0) / (r.t1 - r.t0))).toFixed(3));
      b.classList.toggle('on', i === c);
    });
    setBtn();
  }
  function tick() { paint(); raf = !v.paused && !v.ended ? requestAnimationFrame(tick) : 0; }
  function setBtn() {
    if (!btn) return;
    const s = v.ended ? 'replay' : (v.paused ? 'play' : 'pause');
    if (btn.dataset.s === s) return;
    btn.dataset.s = s;
    btn.setAttribute('aria-label', s === 'replay' ? 'Replay the film' : s === 'pause' ? 'Pause the film' : 'Play the film');
  }
  function go() {
    if (!onScreen || userPaused || document.hidden) return;
    const p = v.play(); p && p.catch(() => {});
  }
  v.addEventListener('play', () => { if (!raf) raf = requestAnimationFrame(tick); });
  v.addEventListener('pause', paint);
  v.addEventListener('ended', paint);
  v.addEventListener('seeked', paint);

  btn && btn.addEventListener('click', () => {
    if (v.ended) { v.currentTime = 0; userPaused = false; wantPlay = true; go(); }
    else if (v.paused) { userPaused = false; wantPlay = true; go(); }
    else { userPaused = true; v.pause(); }
  });
  rail.forEach((b, i) => b.addEventListener('click', () => {
    v.currentTime = T0[i] + .02; wantPlay = true;
    if (!userPaused) go(); paint();
  }));

  new IntersectionObserver(es => {
    onScreen = es[0].isIntersecting;
    if (onScreen) { if (wantPlay) go(); } else if (!v.paused) v.pause();
  }, { threshold: .15 }).observe(host);
  document.addEventListener('visibilitychange', () => { if (document.hidden) v.pause(); else if (wantPlay && onScreen) go(); });

  /* reduced motion: show the finished car, no playback */
  if (reduce) {
    v.preload = 'metadata';
    v.addEventListener('loadedmetadata', () => { v.currentTime = Math.max(0, v.duration - .05); }, { once: true });
    host.classList.add('st-ready');
    return;
  }
  /* start once the intro badge has cleared */
  host.classList.add('st-ready');
  const intro = document.getElementById('intro');
  const wait = intro && !document.documentElement.classList.contains('no-intro') ? 2700 : 300;
  setTimeout(() => { wantPlay = true; go(); }, wait);
  paint();

  window.__story = (sec, run) => { v.currentTime = sec; if (run) { userPaused = false; wantPlay = true; go(); } else { userPaused = true; v.pause(); } setTimeout(paint, 80); return { D, ch: host.dataset.ch }; };
  window.__storyCH = T0;
})();
