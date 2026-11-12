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


  /* ---------- kit finder: three questions → a kit built only from their real kits and bottles ---------- */
  const fcard = $('#fcard'), fsteps = $$('#fsteps li');
  const Q = [
    { id: 'lvl', h: 'How much detailing have you done?', o: [
      ['new', 'Basically none', 'It goes through the automatic wash, if anything.'],
      ['some', 'I wash it myself', 'Weekends in the driveway, a bucket and a sponge.'],
      ['pro', 'I take it seriously', 'For fun, for the meets, or for money.'] ] },
    { id: 'job', h: 'What bugs you most about your car?', o: [
      ['paint', 'Dull, dusty paint', 'Water spots, fingerprints, no gloss.'],
      ['wheel', 'Wheels and tires', 'Brake dust on the rims, brown sidewalls.'],
      ['int', 'The inside', 'Grimy dash, sticky console, faded trim.'],
      ['all', 'All of it', 'Start to finish, inside and out.'] ] },
    { id: 'h2o', h: 'Where do you wash?', o: [
      ['none', 'No hose', 'Apartment, parking garage, HOA rules.'],
      ['hose', 'Driveway with a hose', 'Bucket, hose, the usual.'],
      ['pw', 'I own a pressure washer', 'Ready for a foam cannon.'] ] },
  ];
  // what's inside each kit (from their listings), so a kit never gets a duplicate single beside it
  const HAS = { platinum: P.map(p => p.k), essentials: ['luxpro', 'interiorx', 'tirevenom'], paint: ['luxpro', 'luxquick', 'ceramicx'], rimtire: ['wheelassassin', 'tirevenom'], foam: ['luxfoam'] };
  // the order you use them in, with one line each
  const HOW = [
    ['luxfoam', 'Foam the car top-down, then rinse.'],
    ['wheelassassin', 'Wheels first: spray, agitate with a brush, rinse.'],
    ['luxpro', 'Mist one panel, wipe in one direction, buff dry with a clean towel.'],
    ['ceramicx', 'On clean paint: spray, spread, buff for gloss and protection.'],
    ['luxquick', 'Between washes: mist and buff off dust and fingerprints.'],
    ['tirevenom', 'Last thing outside: dressing on an applicator pad, then the sidewall.'],
    ['interiorx', 'Inside: spray onto a towel, wipe dash, console and seats.'],
    ['restorx', 'Finish plastic and vinyl trim for a dark, dry look.'],
  ];
  const kitOf = k => KITS.find(x => x.k === k), prod = k => P.find(x => x.k === k);
  const pick = a => {
    const out = [];
    const add = (t, k, why) => { if (!out.some(i => i.k === k)) out.push({ t, k, why }); };
    if (a.lvl === 'pro' && a.job === 'all') add('kit', 'platinum', 'Every formula, brush and towel they make. Nothing to come back for.');
    else if (a.lvl === 'new') {
      add('kit', 'essentials', 'The three you’ll use most: wash, interior, tires. Works without a hose.');
      if (a.job === 'paint' || a.job === 'all') add('p', 'luxquick', 'Keeps the shine between washes.');
      if (a.job === 'wheel' || a.job === 'all') add('p', 'wheelassassin', 'Brake dust off the rims before the tires get dressed.');
      if (a.job === 'int') add('p', 'restorx', 'Brings faded plastic and vinyl trim back.');
    } else {
      if (a.job === 'paint' || a.job === 'all') add('kit', 'paint', 'Wash, quick detail and ceramic protection, with the towels to do it right.');
      if (a.job === 'wheel' || a.job === 'all') add('kit', 'rimtire', 'Cleaner, dressing, and the brushes and pads that go with them.');
      if (a.job === 'int') { add('p', 'interiorx', 'Cleans dash, seats and console without a greasy shine.'); add('p', 'restorx', 'Restores plastic and vinyl trim for up to 8 months.'); }
    }
    const inside = new Set(out.filter(i => i.t === 'kit').flatMap(i => HAS[i.k]));
    if (a.h2o === 'pw' && !out.some(i => i.k === 'platinum')) add('kit', 'foam', 'You have the pressure washer. This is the foam cannon for it, plus two bottles of LuxFoam.');
    else if (a.h2o === 'hose' && a.lvl !== 'new' && !inside.has('luxfoam')) add('p', 'luxfoam', 'Thick foam soap for the bucket. Good for 8–16 washes.');
    const hasPro = out.some(i => i.t === 'kit' ? HAS[i.k].includes('luxpro') : i.k === 'luxpro');
    if (a.h2o === 'none' && !hasPro) add('p', 'luxpro', 'Waterless wash: no hose, no bucket, no driveway.');
    return out;
  };
  const TITLE = { new: ['Your starter kit', 'Start here. Everything below works on day one.'], some: ['Your weekend setup', 'Built around the thing that bugs you most.'], pro: ['Your full setup', 'The pro-grade version of your routine.'] };
  let step = 0, ans = {};
  const renderQ = () => {
    fsteps.forEach((li, i) => { li.classList.toggle('on', i === step); li.classList.toggle('done', i < step); });
    const q = Q[step];
    fcard.innerHTML = `<p class="f-n">Question ${step + 1} of 3</p><h3>${q.h}</h3>
      <div class="f-opts">${q.o.map(([v, t, d]) => `<button type="button" class="f-opt${ans[q.id] === v ? ' sel' : ''}" data-v="${v}"><b>${t}</b><span>${d}</span><i aria-hidden="true">→</i></button>`).join('')}</div>
      ${step ? '<button type="button" class="f-back">← Back</button>' : ''}`;
  };
  const renderR = () => {
    fsteps.forEach(li => { li.classList.remove('on'); li.classList.add('done'); });
    const items = pick(ans), [h, sub] = TITLE[ans.lvl];
    const row = i => { const x = i.t === 'kit' ? kitOf(i.k) : prod(i.k);
      const name = i.t === 'kit' ? x.n.join(' ') : x.a + x.b, img = i.t === 'kit' ? `assets/img/kits/${i.k}.webp` : `assets/img/bottles/${i.k}-sm.webp`;
      return `<label class="f-item"><input type="checkbox" checked data-v="${x.v}" data-p="${x.price}" /><figure class="f-${i.t}"><img src="${img}" alt="" /></figure>
        <div><b>${name}</b><span>${i.why}</span></div><em>$${x.price % 1 ? x.price.toFixed(2) : x.price}</em></label>`; };
    const use = new Set(items.flatMap(i => i.t === 'kit' ? HAS[i.k] : [i.k]));
    const how = HOW.filter(([k]) => use.has(k));
    fcard.innerHTML = `<p class="f-n">${h}</p><h3>${sub}</h3>
      <div class="f-items">${items.map(row).join('')}</div>
      <div class="f-total"><div><span>Total</span><b id="ftot"></b><small id="fship"></small></div><a class="btn solid" id="fadd" href="#">Add all to cart</a></div>
      <details class="f-how"><summary>Your first detail, in order (${how.length} steps)</summary><ol>${how.map(([k, t]) => { const p = prod(k); return `<li><b>${p.a}${p.b}</b> ${t}</li>`; }).join('')}</ol></details>
      <button type="button" class="f-back f-redo">↺ Start over</button>`;
    sum();
  };
  const sum = () => {
    const on = $$('input:checked', fcard), tot = on.reduce((s, i) => s + +i.dataset.p, 0);
    $('#ftot').textContent = '$' + tot.toFixed(2);
    $('#fship').textContent = tot >= 35 ? 'Ships free' : tot ? `$${(35 - tot).toFixed(2)} from free shipping` : '';
    const btn = $('#fadd'); btn.href = on.length ? `${STORE}/cart/${on.map(i => i.dataset.v + ':1').join(',')}` : '#';
    btn.classList.toggle('off', !on.length);
  };
  fcard.addEventListener('click', e => {
    const o = e.target.closest('.f-opt');
    if (o) { ans[Q[step].id] = o.dataset.v; step++; step < Q.length ? renderQ() : renderR(); return; }
    if (e.target.closest('.f-redo')) { step = 0; ans = {}; renderQ(); return; }
    if (e.target.closest('.f-back')) { step--; renderQ(); return; }
    if (e.target.closest('#fadd.off')) e.preventDefault();
  });
  fcard.addEventListener('change', sum);
  renderQ();

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
