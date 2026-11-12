/* LusterLux v4: the line (pinned theater), kit builder, shop-all grid, kits, shoppable clips.
   Every Add is a real Shopify cart permalink; every price, spec and claim is from their own listings. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const STORE = 'https://lusterluxauto.com';
  const cartURL = v => `${STORE}/cart/${v}:1`;
  const money = n => '$' + (n % 1 ? n.toFixed(2) : n);
  const mobile = () => innerWidth <= 900;

  /* catalog: titles, prices, variant ids and coverage from their live products.json */
  const P = [
    { k: 'luxfoam', g: 'wash', a: 'Lux', b: 'Foam', fn: 'Foam soap', price: 19.99, v: 59846347259985, c: '#6a4cf0', per: '8–16 washes', s2: ['Use with', 'Foam cannon or bucket'], d: 'Thick, clinging foam that loosens the dirt before your mitt ever touches the paint.' },
    { k: 'luxpro', g: 'wash paint', a: 'Lux', b: 'Pro', fn: 'Waterless wash & protectant', price: 19.99, v: 59846340902993, c: '#ec4fc6', per: '15–30 vehicles', s2: ['Safe on', 'PPF, wraps & ceramic'], d: 'Nano-polymers wrap the dust so it lifts off the paint instead of dragging across it. No bucket, no hose, no driveway.' },
    { k: 'luxquick', g: 'paint', a: 'Lux', b: 'Quick', fn: 'Detail spray', price: 17.99, v: 59846342246481, c: '#2fd39a', per: '15–25 vehicles', s2: ['Takes off', 'Dust, prints & fresh spots'], d: 'The between-washes bottle. Mist, buff, and the gloss is back.' },
    { k: 'ceramicx', g: 'paint', a: 'Ceramic', b: 'X', fn: 'Ceramic detail spray', price: 27.99, v: 59846341853265, c: '#35b9e6', per: '10–20 vehicles', s2: ['Protection', 'Up to 8 months'], d: 'Ceramic gloss and protection out of a spray bottle. No coating appointment.' },
    { k: 'wheelassassin', g: 'wheel', a: 'Wheel', b: 'Assassin', fn: 'Wheel cleaner', price: 17.99, v: 59846363152465, c: '#c9e01c', per: '12–20 vehicles', s2: ['Cuts', 'Brake dust, grease & road film'], d: 'Built for the dirtiest part of the car. Brake dust and road film come off the barrel and the face.' },
    { k: 'tirevenom', g: 'wheel', a: 'Tire', b: 'Venom', fn: 'Tire dressing', price: 22.99, v: 59846342475857, c: '#9aa0a6', per: '30–50 tires', s2: ['Lasts', 'Up to 3 months'], d: 'Dries to the touch for even, dark sidewalls, and none of it flung down your paint on the first pull-out.' },
    { k: 'interiorx', g: 'int', a: 'Interior', b: 'X', fn: 'Interior cleaner', price: 19.99, v: 59846363545681, c: '#d0c64a', per: '15–25 vehicles', s2: ['Finish', 'No slick residue'], d: 'Dash, console, seats and door cards, clean without the greasy shine.' },
    { k: 'restorx', g: 'int', a: 'Restor', b: 'X', fn: 'RVP plastic dressing', price: 22.99, v: 59846342377553, c: '#c9a98f', per: '20–40 vehicles', s2: ['Lasts', 'Up to 8 months'], d: 'Brings faded rubber, vinyl and plastic trim back to a deep, dry finish.' },
    { k: 'birdielux', g: 'golf', a: 'Birdie', b: 'Lux', fn: 'Golf cart washless cleaner', price: 19.99, v: 59846406373457, c: '#7f86ff', per: 'Body, seats & roof', d: 'Washless clean for the body, seats and roof.' },
    { k: 'xfresh', g: 'golf', a: 'X', b: 'Fresh', fn: 'Golf cart interior cleaner', price: 19.99, v: 59846406013009, c: '#d9d27a', per: 'Seats, dash & floor', d: 'Seats, dash and floor, without the slick finish.' },
  ];
  const prod = k => P.find(x => x.k === k);

  /* ================= THE LINE: pinned theater ================= */
  const TH = P.filter(p => p.g !== 'golf');
  const th = $('#theater'), thInfo = $('#thInfo'), thBottle = $('#thBottle'), thRail = $('#thRail'), thGhost = $('#thGhost');
  th.style.setProperty('--n', TH.length);
  $('#thTot').textContent = String(TH.length).padStart(2, '0');
  thBottle.innerHTML = TH.map((p, i) => `<img src="assets/img/bottles/${p.k}.webp" alt="${p.a}${p.b} ${p.fn}" data-i="${i}" ${i > 1 ? 'loading="lazy"' : ''} />`).join('');
  thRail.innerHTML = TH.map((p, i) => `<li><button type="button" data-i="${i}" style="--c:${p.c}"><i></i><span>${p.a}${p.b}</span></button></li>`).join('');
  const info = p => `
    <p class="th-fn">${p.fn}</p>
    <h3 style="--len:${(p.a + p.b).length}">${p.a.toUpperCase()}<em>${p.b.toUpperCase()}</em></h3>
    <p class="th-d">${p.d}</p>
    <dl><div><dt>Per bottle</dt><dd>${p.per}</dd></div><div><dt>${p.s2[0]}</dt><dd>${p.s2[1]}</dd></div></dl>
    <div class="th-buy"><b>${money(p.price)}</b><a class="btn solid" href="${cartURL(p.v)}">Add to cart</a><a class="th-more" href="#p-${p.k}">Details</a></div>`;
  let thCur = -1;
  const thSet = i => {
    if (i === thCur) return;
    const dir = i > thCur ? 1 : -1; thCur = i;
    const p = TH[i];
    th.style.setProperty('--c', p.c);
    $('#thNum').textContent = String(i + 1).padStart(2, '0');
    $$('img', thBottle).forEach((im, j) => { im.className = j === i ? 'on' : j < i ? 'past' : 'next'; });
    $$('button', thRail).forEach((b, j) => b.classList.toggle('on', j === i));
    thInfo.classList.remove('in'); thInfo.style.setProperty('--dir', dir);
    void thInfo.offsetWidth; thInfo.innerHTML = info(p); thInfo.classList.add('in');
    thGhost.textContent = (p.a + p.b).toUpperCase();
    thGhost.classList.remove('in'); void thGhost.offsetWidth; thGhost.classList.add('in');
  };
  const thProg = () => {
    const r = th.getBoundingClientRect(), pin = $('.th-pin', th).offsetHeight;
    const p = Math.min(1, Math.max(0, -r.top / (r.height - pin)));
    const f = p * TH.length, i = Math.min(TH.length - 1, Math.floor(f)), t = f - i;
    thSet(i);
    $('#thBar').style.transform = `scaleX(${p})`;
    th.style.setProperty('--t', t.toFixed(3));
  };
  thRail.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const pin = $('.th-pin', th).offsetHeight, top = th.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + (th.offsetHeight - pin) * ((+b.dataset.i + .5) / TH.length), behavior: 'smooth' });
  });
  thSet(0);

  /* ================= shop all grid ================= */
  const grid = $('#grid');
  grid.innerHTML = P.map(p => `
    <article class="card" id="p-${p.k}" data-g="${p.g}" style="--c:${p.c}">
      <i class="dot"></i>
      <figure class="plinth"><span class="pl-lines"></span><img class="pl-mark" src="assets/img/brand/mark.webp" alt="" /><span class="pl-name">${(p.a + p.b).toUpperCase()}</span><img class="pl-btl" src="assets/img/bottles/${p.k}.webp" alt="${p.a}${p.b} ${p.fn}" loading="lazy" decoding="async" /></figure>
      <h3 class="nm">${p.a.toUpperCase()}<em>${p.b.toUpperCase()}</em></h3>
      <p class="fn">${p.fn}</p>
      <p class="sp">${p.per}${p.s2 ? ' · ' + p.s2[1] : ''}</p>
      <div class="buy"><span class="pr">${money(p.price)}</span><a class="btn solid sm" href="${cartURL(p.v)}">Add to cart</a></div>
    </article>`).join('');
  const tabs = $('#tabs');
  const filter = f => {
    for (const t of tabs.children) t.setAttribute('aria-selected', t.dataset.f === f);
    for (const c of grid.children) c.hidden = f !== 'all' && !c.dataset.g.split(' ').includes(f);
  };
  tabs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) filter(b.dataset.f); });

  /* ================= kits (their Shopify kit photos) ================= */
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
      <div class="buy"><span class="pr">${money(k.price)}</span><a class="btn solid sm" href="${cartURL(k.v)}">Add to cart</a></div>
    </article>`).join('');

  /* ================= KIT BUILDER ================= */
  const Q = [
    { id: 'lvl', h: 'How much detailing <em>have you done?</em>', o: [
      ['new', 'Basically none', 'It’s never had a real detail. Dust, film, the works.', 'assets/img/kb/new.webp'],
      ['some', 'I wash it myself', 'Weekends in the driveway with a bucket.', 'assets/img/kb/some.webp'],
      ['pro', 'I take it seriously', 'Garage setup, the right towels, for the meets or for money.', 'assets/img/kb/pro.webp'] ] },
    { id: 'job', h: 'What bugs you most <em>about your car?</em>', o: [
      ['paint', 'Dull, dusty paint', 'Water spots, fingerprints, no gloss.', 'assets/img/kb/paint.webp'],
      ['wheel', 'Wheels & tires', 'Brake dust on the rims, brown sidewalls.', 'assets/img/kb/wheel.webp'],
      ['int', 'The inside', 'Grimy dash, sticky console, faded trim.', 'assets/img/photo/interiorx-seat.webp'],
      ['all', 'All of it', 'Start to finish, inside and out.', 'assets/hero/studio-m.webp', 'wide'] ] },
    { id: 'h2o', h: 'Where do <em>you wash?</em>', o: [
      ['none', 'No hose', 'Apartment, parking garage, HOA rules.', 'assets/img/photo/towels-carbon.webp'],
      ['hose', 'Driveway & a hose', 'Bucket, hose, a pump sprayer.', 'assets/img/kb/hose.webp'],
      ['pw', 'Pressure washer', 'Ready for a foam cannon.', 'assets/img/kb/pw.webp'] ] },
  ];
  // what's inside each kit (from their listings): bottles, plus the hardware that comes with them
  const HAS = { platinum: P.filter(p => p.g !== 'golf').map(p => p.k), essentials: ['luxpro', 'interiorx', 'tirevenom'], paint: ['luxpro', 'luxquick', 'ceramicx'], rimtire: ['wheelassassin', 'tirevenom'], foam: ['luxfoam', 'luxfoam'] };
  const GEAR = { platinum: 'Brushes, towels & more', paint: '+ microfiber towels', rimtire: '+ brushes & pads', foam: '+ LuxCannon' };
  const HOW = [
    ['luxfoam', 'Foam', 'Foam the car top-down, then rinse.'],
    ['wheelassassin', 'Wheels', 'Spray, agitate with a brush, rinse.'],
    ['luxpro', 'Wash', 'Mist one panel, wipe one way, buff dry.'],
    ['ceramicx', 'Protect', 'On clean paint: spray, spread, buff.'],
    ['luxquick', 'Maintain', 'Between washes: mist and buff.'],
    ['tirevenom', 'Tires', 'Dressing on a pad, then the sidewall.'],
    ['interiorx', 'Interior', 'Spray onto a towel, wipe dash and seats.'],
    ['restorx', 'Trim', 'Plastic and vinyl trim, for a dark, dry look.'],
  ];
  const kitOf = k => KITS.find(x => x.k === k);
  const pick = a => {
    const out = [];
    const add = (t, k, why) => { if (!out.some(i => i.k === k)) out.push({ t, k, why }); };
    if (a.lvl === 'pro' && a.job === 'all') add('kit', 'platinum', 'Every formula, brush and towel they make. Nothing to come back for.');
    else if (a.lvl === 'new') {
      add('kit', 'essentials', 'The three you’ll use most: wash, interior, tires. Works without a hose.');
      if (a.job === 'paint' || a.job === 'all') add('p', 'luxquick', 'Keeps the shine between washes.');
      if (a.job === 'wheel' || a.job === 'all') add('p', 'wheelassassin', 'Brake dust off the rims before the tires get dressed.');
      if (a.job === 'int') add('p', 'restorx', 'Brings faded plastic and vinyl trim back.');
    } else if (a.job) {
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
  const item = i => { const x = i.t === 'kit' ? kitOf(i.k) : prod(i.k); return { ...i, x, name: i.t === 'kit' ? x.n.join(' ') : x.a + x.b, price: x.price, v: x.v }; };
  const TITLE = { new: ['Your starter kit', 'Everything here works on day one.'], some: ['Your weekend setup', 'Built around what bugs you most.'], pro: ['Your full setup', 'The pro-grade version of your routine.'] };

  const fq = $('#fq'), fsteps = $$('#fsteps li'), fbottles = $('#fbottles');
  let step = 0, ans = {}, shown = [];
  const shelf = items => {
    const keys = items.flatMap(i => i.t === 'kit' ? HAS[i.k] : [i.k]);
    const gear = items.filter(i => i.t === 'kit' && GEAR[i.k]).map(i => GEAR[i.k]);
    const prev = shown.slice(); shown = keys;
    const used = {};
    fbottles.innerHTML = keys.map((k, n) => {
      used[k] = (used[k] || 0) + 1;
      const isNew = prev.filter(x => x === k).length < used[k];
      return `<img src="assets/img/bottles/${k}-sm.webp" alt="${prod(k).a}${prod(k).b}" class="${isNew ? 'pop' : ''}" style="--d:${n * 70}ms;--z:${100 - Math.abs(n - (keys.length - 1) / 2) * 10}" />`;
    }).join('') + (gear.length ? `<span class="sh-gear">${gear.join(' · ')}</span>` : '');
    fbottles.dataset.n = keys.length;
    $('#fempty').hidden = keys.length > 0;
    const tot = items.reduce((s, i) => s + i.price, 0);
    $('#ftot').textContent = '$' + tot.toFixed(2);
    $('#fcount').textContent = `${items.length} item${items.length === 1 ? '' : 's'} · ${keys.length} bottle${keys.length === 1 ? '' : 's'}`;
    $('#fmeter').style.transform = `scaleX(${Math.min(1, tot / 35)})`;
    $('#fship').textContent = tot >= 35 ? 'Free shipping unlocked' : `$${(35 - tot).toFixed(2)} from free shipping`;
    $('#fshelf').classList.toggle('free', tot >= 35);
  };
  const renderQ = () => {
    fsteps.forEach((li, i) => { li.classList.toggle('on', i === step); li.classList.toggle('done', i < step); });
    const q = Q[step];
    fq.className = 'fb-q in';
    fq.innerHTML = `<p class="fb-n">Question ${step + 1} of 3</p><h3>${q.h}</h3>
      <div class="fb-tiles n${q.o.length}">${q.o.map(([v, t, d, img, cls], n) => `
        <button type="button" class="fb-tile${ans[q.id] === v ? ' sel' : ''}" data-v="${v}" style="--d:${n * 60}ms">
          <figure class="${cls || ''}"><img src="${img}" alt="" loading="lazy" /></figure>
          <span class="t-n">${String.fromCharCode(65 + n)}</span><span class="t-ck" aria-hidden="true"></span>
          <b>${t}</b><small>${d}</small>
        </button>`).join('')}</div>
      ${step ? '<button type="button" class="fb-back">← Back</button>' : ''}`;
    shelf(pick(ans).map(item));
  };
  const renderR = () => {
    fsteps.forEach(li => { li.classList.remove('on'); li.classList.add('done'); });
    const items = pick(ans).map(item), [h, sub] = TITLE[ans.lvl];
    const use = new Set(items.flatMap(i => i.t === 'kit' ? HAS[i.k] : [i.k]));
    const how = HOW.filter(([k]) => use.has(k));
    fq.className = 'fb-q fb-res in';
    fq.innerHTML = `<p class="fb-n">${h}</p><h3>${sub.replace(/(\S+\s\S+)\.$/, '<em>$1.</em>')}</h3>
      <div class="r-items">${items.map((i, n) => `
        <label class="r-item" style="--d:${n * 80}ms"><input type="checkbox" checked data-n="${n}" />
          <figure class="${i.t === 'kit' ? 'kit-ph' : ''}"><img src="${i.t === 'kit' ? `assets/img/kits/${i.k}.webp` : `assets/img/bottles/${i.k}-sm.webp`}" alt="" /></figure>
          <div><b>${i.name}</b><span>${i.why}</span></div><em>${money(i.price)}</em><i class="r-ck" aria-hidden="true"></i></label>`).join('')}</div>
      <div class="r-buy"><a class="btn solid big" id="fadd" href="#">Add all to cart <b id="fadd-t"></b></a><button type="button" class="fb-back fb-redo">↺ Start over</button></div>
      <div class="r-how"><p class="kick">Your first detail, in order</p><ol>${how.map(([k, s, t], n) => `<li style="--c:${prod(k).c}"><span>${String(n + 1).padStart(2, '0')}</span><img src="assets/img/bottles/${k}-sm.webp" alt="" /><b>${s}</b><small>${prod(k).a}${prod(k).b}</small><p>${t}</p></li>`).join('')}</ol></div>`;
    fq._items = items;
    sum();
  };
  const sum = () => {
    const items = fq._items, on = $$('input', fq).filter(i => i.checked).map(i => items[+i.dataset.n]);
    $$('.r-item', fq).forEach(l => l.classList.toggle('off', !$('input', l).checked));
    shelf(on);
    const tot = on.reduce((s, i) => s + i.price, 0);
    const a = $('#fadd'); a.href = on.length ? `${STORE}/cart/${on.map(i => i.v + ':1').join(',')}` : '#';
    a.classList.toggle('off', !on.length); $('#fadd-t').textContent = '$' + tot.toFixed(2);
    $('#fshelf').classList.add('done');
  };
  fq.addEventListener('click', e => {
    const o = e.target.closest('.fb-tile');
    if (o) {
      ans[Q[step].id] = o.dataset.v; o.classList.add('sel');
      shelf(pick(ans).map(item));
      setTimeout(() => { step++; step < Q.length ? renderQ() : renderR(); }, 360);
      return;
    }
    if (e.target.closest('.fb-redo')) { step = 0; ans = {}; $('#fshelf').classList.remove('done'); renderQ(); return; }
    if (e.target.closest('.fb-back')) { delete ans[Q[step - 1].id]; step--; renderQ(); return; }
    if (e.target.closest('#fadd.off')) e.preventDefault();
  });
  fq.addEventListener('change', sum);
  renderQ();

  /* ================= ON REAL CARS: shoppable clips, scroll-driven sideways ================= */
  const REELS = [
    ['foam', 'luxfoam', 'Foam wash at sunset'], ['chase', 'luxpro', 'Co-founder Chase'], ['wheel', 'wheelassassin', 'Filthy wheels, sorted'],
    ['shop', 'luxpro', 'Wipe-down in the shop'], ['tire', 'wheelassassin', 'Foamed & scrubbed'], ['meet', null, 'Pop-up meet, Arizona after dark'],
  ];
  const track = $('#reels');
  track.insertAdjacentHTML('beforeend', REELS.map(([v, k, s], n) => {
    const p = k && prod(k);
    return `<figure class="reel" style="--c:${p ? p.c : '#8CD20A'}"><video muted loop playsinline preload="none" poster="assets/wall/${v}.jpg" data-src="assets/wall/${v}.mp4"></video>
      <span class="rl-n">${String(n + 1).padStart(2, '0')}</span>
      <figcaption>${s}</figcaption>
      ${p ? `<a class="rl-shop" href="${cartURL(p.v)}"><img src="assets/img/bottles/${p.k}-sm.webp" alt="" /><span><b>${p.a}${p.b}</b>${p.fn} · ${money(p.price)}</span><i aria-label="Add to cart">+</i></a>`
          : `<a class="rl-shop" href="https://www.tiktok.com/@lusterluxcarcare"><span><b>@lusterluxcarcare</b>See the next pop-up</span><i>→</i></a>`}
    </figure>`;
  }).join(''));
  const rv = $$('video', track);
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
  }), { threshold: .35 });
  rv.forEach(v => vio.observe(v));
  const real = $('#real'), rlPin = $('.rl-pin', real);
  const rlSize = () => {
    if (mobile()) { real.style.height = ''; track.style.transform = ''; return; }
    const dist = track.scrollWidth - innerWidth;
    real.style.height = (rlPin.offsetHeight + Math.max(0, dist)) + 'px';
    real._dist = dist;
  };
  const rlProg = () => {
    if (mobile()) return;
    const r = real.getBoundingClientRect(), dist = real._dist || 0;
    const p = Math.min(1, Math.max(0, -r.top / (real.offsetHeight - rlPin.offsetHeight || 1)));
    track.style.transform = `translate3d(${-p * dist}px,0,0)`;
  };

  /* ================= scroll loop ================= */
  let ticking = false;
  const onScroll = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { thProg(); rlProg(); ticking = false; }); };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { rlSize(); onScroll(); });
  addEventListener('load', () => { rlSize(); onScroll(); });
  rlSize(); onScroll();

  /* reveal on scroll */
  const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('seen'); rio.unobserve(e.target); } }), { threshold: .15 });
  $$('.sec-head, .card, .kit, .story figure, .st-copy, .rv-row figure').forEach(el => { el.classList.add('rv'); rio.observe(el); });

  /* hero safety net: if WebGL is slow or unavailable, never leave the hero copy hidden */
  const stage = $('#stage');
  setTimeout(() => stage.classList.add('formed'), 6500);
  setTimeout(() => stage.classList.add('ready'), 9500);
})();
