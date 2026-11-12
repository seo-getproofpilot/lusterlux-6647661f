/* LusterLux v4: hero slides, shop-by-job, the line, kits, real footage. Every Add is a real Shopify cart permalink. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const STORE = 'https://lusterluxauto.com';
  const cartURL = v => `${STORE}/cart/${v}:1`;

  /* catalog: titles, prices, variant ids and coverage from their live products.json */
  const P = [
    { k: 'luxfoam', g: 'wash', a: 'Lux', b: 'Foam', fn: 'Foam soap', price: 19.99, v: 59846347259985, c: '#6a4cf0', sp: '8–16 washes per bottle. Foam cannon or bucket.' },
    { k: 'luxpro', g: 'wash paint', a: 'Lux', b: 'Pro', fn: 'Waterless wash & protectant', price: 19.99, v: 59846340902993, c: '#ec4fc6', sp: '15–30 vehicles per bottle. Safe on PPF, wraps & ceramic.' },
    { k: 'luxquick', g: 'paint', a: 'Lux', b: 'Quick', fn: 'Detail spray', price: 17.99, v: 59846342246481, c: '#2fd39a', sp: '15–25 vehicles per bottle. Dust, prints & fresh water spots.' },
    { k: 'ceramicx', g: 'paint', a: 'Ceramic', b: 'X', fn: 'Ceramic detail spray', price: 27.99, v: 59846341853265, c: '#35b9e6', sp: '10–20 vehicles per bottle. Up to 8 months of protection.' },
    { k: 'wheelassassin', g: 'wheel', a: 'Wheel', b: 'Assassin', fn: 'Wheel cleaner', price: 17.99, v: 59846363152465, c: '#c9e01c', sp: '12–20 vehicles per bottle. Brake dust, grease & road film.' },
    { k: 'tirevenom', g: 'wheel', a: 'Tire', b: 'Venom', fn: 'Tire dressing', price: 22.99, v: 59846342475857, c: '#b9bec4', sp: '30–50 tires per bottle. Up to 3 months, no sling.' },
    { k: 'interiorx', g: 'int', a: 'Interior', b: 'X', fn: 'Interior cleaner', price: 19.99, v: 59846363545681, c: '#d9d27a', sp: '15–25 vehicles per bottle. No slick residue.' },
    { k: 'restorx', g: 'int', a: 'Restor', b: 'X', fn: 'RVP plastic dressing', price: 22.99, v: 59846342377553, c: '#e3d3c6', sp: '20–40 vehicles per bottle. Up to 8 months.' },
    { k: 'birdielux', g: 'golf', a: 'Birdie', b: 'Lux', fn: 'Golf cart washless cleaner', price: 19.99, v: 59846406373457, c: '#7f86ff', sp: 'Washless clean for the body, seats and roof.' },
    { k: 'xfresh', g: 'golf', a: 'X', b: 'Fresh', fn: 'Golf cart interior cleaner', price: 19.99, v: 59846406013009, c: '#d9d27a', sp: 'Seats, dash and floor, without the slick finish.' },
  ];

  /* ---------- the line ---------- */
  const grid = $('#grid');
  grid.innerHTML = P.map(p => `
    <article class="card" id="p-${p.k}" data-g="${p.g}" style="--c:${p.c}">
      <i class="dot"></i>
      <figure><img src="assets/img/bottles/${p.k}.webp" alt="${p.a}${p.b} ${p.fn}" loading="lazy" decoding="async" /></figure>
      <h3 class="nm">${p.a.toUpperCase()}<em>${p.b.toUpperCase()}</em></h3>
      <p class="fn">${p.fn}</p>
      <p class="sp">${p.sp}</p>
      <div class="buy"><span class="pr">$${p.price.toFixed(2)}</span><a class="btn solid sm" href="${cartURL(p.v)}">Add to cart</a></div>
    </article>`).join('');
  const tabs = $('#tabs');
  const filter = f => {
    for (const t of tabs.children) t.setAttribute('aria-selected', t.dataset.f === f);
    for (const c of grid.children) c.hidden = f !== 'all' && !c.dataset.g.split(' ').includes(f);
  };
  tabs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) filter(b.dataset.f); });
  /* ---------- shop by job ---------- */
  const JOBS = [
    { f: 'wash', h: 'Wash', p: 'Foam it, rinse it, or skip the hose entirely.', b: ['luxpro', 'luxfoam'] },
    { f: 'paint', h: 'Paint', p: 'Gloss, protection and a slick finish that lasts.', b: ['luxquick', 'ceramicx', 'luxpro'] },
    { f: 'wheel', h: 'Wheels & tires', p: 'Brake dust off, dark sidewalls on.', b: ['wheelassassin', 'tirevenom'] },
    { f: 'int', h: 'Interior', p: 'Dash, seats and trim, without the greasy shine.', b: ['restorx', 'interiorx'] },
  ];
  $('#jobs').innerHTML = JOBS.map(j => {
    const n = P.filter(p => p.g.split(' ').includes(j.f)).length;
    return `<a class="job" href="#line" data-f="${j.f}"><div><h3>${j.h}</h3><p>${j.p}</p></div>
      <span class="go" aria-hidden="true">→</span>
      <div class="bots">${j.b.map(k => `<img src="assets/img/bottles/${k}-sm.webp" alt="" loading="lazy" />`).join('')}</div>
      <p class="kick" style="margin-top:14px">${n} formulas</p></a>`;
  }).join('');
  $('#jobs').addEventListener('click', e => { const a = e.target.closest('.job'); if (a) filter(a.dataset.f); });

  /* ---------- kits (their Shopify kit photos) ---------- */
  const KITS = [
    { k: 'platinum', n: ['The Platinum', 'System'], fn: 'Every formula, brush and towel we make.', price: 500, v: 59889398513745, big: 1, tag: 'Everything' },
    { k: 'essentials', n: ['Essentials', 'Kit'], fn: 'LuxPro + InteriorX + TireVenom', price: 39.99, v: 62697809150033, tag: 'Start here' },
    { k: 'foam', n: ['Foam Wash', 'System'], fn: 'LuxCannon + 2× LuxFoam', price: 79.99, v: 59835928772689 },
    { k: 'paint', n: ['Paint Care', 'System'], fn: 'LuxPro, LuxQuick, CeramicX + towels', price: 72.99, v: 59835922219089 },
    { k: 'rimtire', n: ['Rim & Tire', 'System'], fn: 'WheelAssassin, TireVenom, brushes + pads', price: 85.99, v: 59835924316241 },
  ];
  $('#kitgrid').innerHTML = KITS.map(k => `
    <article class="kit${k.big ? ' big' : ''}">${k.tag ? `<span class="tag">${k.tag}</span>` : ''}
      <figure><img src="assets/img/kits/${k.k}.webp" alt="${k.n.join(' ')}" loading="lazy" /></figure>
      <h3>${k.n[0]} <em>${k.n[1]}</em></h3><p>${k.fn}</p>
      <div class="buy"><span class="pr">$${k.price % 1 ? k.price.toFixed(2) : k.price}</span><a class="btn solid sm" href="${cartURL(k.v)}">Add to cart</a></div>
    </article>`).join('');

  /* ---------- real footage (TikTok @lusterluxcarcare); product tags from their own captions ---------- */
  const REELS = [
    ['foam', 'LuxFoam', 'Foam wash at sunset'], ['chase', 'LuxPro', 'Co-founder Chase'], ['wheel', 'WheelAssassin', 'Filthy wheels, sorted'],
    ['shop', 'LuxPro', 'Wipe-down in the shop'], ['tire', 'WheelAssassin', 'Foamed & scrubbed'], ['meet', 'Pop-up meet', 'Arizona, after dark'],
  ];
  const reels = $('#reels');
  reels.innerHTML = REELS.map(([v, t, s]) => `<figure class="reel"><video muted loop playsinline preload="none" poster="assets/wall/${v}.jpg" data-src="assets/wall/${v}.mp4"></video><figcaption><b>${t}</b>${s}</figcaption></figure>`).join('');
  const rv = $$('video', reels);
  new IntersectionObserver(es => es.forEach(e => {
    rv.forEach(v => { if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause(); });
  }), { threshold: .2 }).observe(reels);

  /* ---------- hero slides: the formula holds until the lineup lands, then the covers cycle ---------- */
  const slides = $$('.slide'), nav = $('#snav'), btns = $$('button', nav), stage = $('#stage');
  let cur = 0, timer = null, auto = true;
  const DUR = 7000;
  const go = i => {
    cur = i;
    slides.forEach(s => s.classList.toggle('is-on', +s.dataset.i === i));
    btns.forEach(b => b.setAttribute('aria-selected', +b.dataset.i === i));
    window.__hero && window.__hero.active(i === 0);
    schedule();
  };
  const schedule = () => {
    clearTimeout(timer);
    if (!auto) { nav.classList.add('hold'); return; }
    const wait = cur === 0 ? (stage.classList.contains('ready') ? DUR : 0) : DUR;
    nav.classList.toggle('hold', cur === 0 && !stage.classList.contains('ready'));
    if (wait) { nav.style.setProperty('--dur', wait + 'ms'); timer = setTimeout(() => go((cur + 1) % slides.length), wait); }
  };
  btns.forEach(b => b.addEventListener('click', () => { auto = false; go(+b.dataset.i); }));
  $('.hero').addEventListener('mouseenter', () => { clearTimeout(timer); });
  $('.hero').addEventListener('mouseleave', () => schedule());
  // when the 3D lineup has landed, give it a full slide of time before the first cover
  new MutationObserver(() => { if (stage.classList.contains('ready') && cur === 0) { nav.classList.remove('hold'); schedule(); } }).observe(stage, { attributes: true, attributeFilter: ['class'] });
  nav.classList.add('hold');
  // safety net: if WebGL is slow or unavailable, never leave the hero copy hidden
  setTimeout(() => { stage.classList.add('formed'); }, 6500);
  setTimeout(() => { if (!stage.classList.contains('ready')) stage.classList.add('ready'); }, 9500);
})();
