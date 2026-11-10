/* LusterLux v2 — hero sequence, the shelf, cart (real Shopify cart permalinks), reveals. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const STORE = 'https://lusterluxauto.com';
  const money = n => '$' + n.toFixed(2);
  const KEY = 'll2_cart';
  let cart = {}; try { cart = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}

  /* ---------- catalog: titles, prices and variant ids from their live products.json ---------- */
  const P = {
    luxpro:   { n: 'LuxPro', em: 'Pro', fn: 'Waterless wash & surface protectant', price: 19.99, v: 59846340902993, liq: '#ec4fc6',
      txt: 'Nano-polymers wrap the dust so it lifts off the paint instead of dragging across it. No bucket, no hose, no driveway.',
      specs: ['16 oz', '15–30 vehicles per bottle', 'Safe on PPF, wraps & ceramic'], photo: 'luxpro-hand' },
    ceramicx: { n: 'CeramicX', em: 'X', fn: 'Ceramic detail spray', price: 27.99, v: 59846341853265, liq: '#35b9e6',
      txt: 'A ceramic layer in the time it takes to wipe a panel. Hard water beading, real gloss depth, and a surface that stays clean longer.',
      specs: ['16 oz', '10–20 vehicles per bottle', 'Up to 8 months of protection'] },
    luxfoam:  { n: 'LuxFoam', em: 'Foam', fn: 'Foam soap', price: 19.99, v: 59846347259985, liq: '#6a4cf0',
      txt: 'Thick, clinging foam that lifts the grit before your mitt ever touches the paint, the single biggest thing standing between a wash and a swirl.',
      specs: ['16 oz', '8–16 washes per bottle', 'Foam cannon or bucket'], photo: 'real-foam' },
    wheelassassin: { n: 'LuxWheelAssassin', em: 'WheelAssassin', fn: 'Wheel cleaner', price: 17.99, v: 59846363152465, liq: '#d9f21c',
      txt: 'Fast-acting on bonded brake dust, grease and road film, so the barrel comes clean with a fraction of the scrubbing.',
      specs: ['16 oz', '12–20 vehicles per bottle'] },
    tirevenom: { n: 'TireVenom', em: 'Venom', fn: 'Tire dressing', price: 22.99, v: 59846342475857, liq: '#e9ecef',
      txt: 'A no-sling dressing that dries to the touch. Even, dark sidewalls, and none of it flung down your paint on the first pull-out.',
      specs: ['16 oz', '30–50 tires per bottle', 'Up to 3 months'], photo: 'tirevenom-hand' },
    interiorx: { n: 'InteriorX', em: 'X', fn: 'Interior cleaner', price: 19.99, v: 59846363545681, liq: '#e9e59a',
      txt: 'Lifts fingerprints, spills and everyday grime off dash, console and door cards, then leaves, with no slick residue and nothing reflecting in your windshield.',
      specs: ['16 oz', '15–25 vehicles per bottle'], photo: 'interiorx-seat' },
    luxquick: { n: 'LuxQuick', em: 'Quick', fn: 'Detail spray', price: 17.99, v: 59846342246481, liq: '#2fd39a',
      txt: 'Pulls light dust, fingerprints and fresh water spots, then leaves a slick layer that keeps the next round from sticking.',
      specs: ['16 oz', '15–25 vehicles per bottle'] },
    restorx:  { n: 'RestorX', em: 'X', fn: 'RVP plastic dressing', price: 22.99, v: 59846342377553, liq: '#f1e4dc',
      txt: 'Rubber, vinyl and plastic brought back on trim, dash and engine bay, with an even finish that never feels oily or pulls dust.',
      specs: ['16 oz', '20–40 vehicles per bottle', 'Up to 8 months'] },
    birdielux: { n: 'BirdieLux', fn: 'Golf cart washless cleaner', price: 19.99, v: 59846406373457, liq: '#7fd3ff' },
    xfresh:   { n: 'XFresh', fn: 'Golf cart interior cleaner', price: 19.99, v: 59846406013009, liq: '#9be36a' },
    kit:      { n: 'Essentials Kit', fn: 'LuxPro + InteriorX + TireVenom', price: 39.99, v: 62697809150033, pic: 'assets/img/kits/essentials.webp' },
    foamsys:  { n: 'Foam Wash System', fn: 'LuxCannon + 2× LuxFoam', price: 79.99, v: 59835928772689, pic: 'assets/img/kits/foam.webp' },
    paintsys: { n: 'Paint Care System', fn: 'LuxPro, LuxQuick, CeramicX + towels', price: 72.99, v: 59835922219089, pic: 'assets/img/kits/paint.webp' },
    rimsys:   { n: 'Rim & Tire System', fn: 'WheelAssassin, TireVenom, brushes + pads', price: 85.99, v: 59835924316241, pic: 'assets/img/kits/rimtire.webp' },
    platinum: { n: 'The Platinum System', fn: 'Every formula, brush and towel', price: 500, v: 59889398513745, pic: 'assets/img/kits/platinum.webp' },
  };
  const imgOf = k => P[k].pic || 'assets/img/bottles/' + (P[k].img || k) + '-sm.webp';
  const nameHTML = p => p.em && p.n.endsWith(p.em) ? p.n.slice(0, -p.em.length).toUpperCase() + '<em>' + p.em.toUpperCase() + '</em>' : p.n.toUpperCase();

  /* ---------- intro: once per session, ?nointro skips ---------- */
  const intro = $('#intro');
  let seen = false; try { seen = sessionStorage.getItem('ll2_intro') === '1'; } catch (e) {}
  if (seen || /nointro/.test(location.search)) document.documentElement.classList.add('no-intro');
  else { try { sessionStorage.setItem('ll2_intro', '1'); } catch (e) {} setTimeout(() => intro && intro.remove(), 3400); }

  /* ---------- nav ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- THE COLLECTION: in the order you use them, steps from each label ---------- */
  const COL = [
    ['luxfoam', 'wash', ['Fill the LuxCannon', 'Foam the whole car', 'Rinse'], 0],
    ['luxpro', 'wash', ['Spray a panel', 'Wipe with a microfiber', 'Flip and buff'], null],
    ['luxquick', 'paint', ['Spray', 'Wipe', 'Buff'], 2],
    ['ceramicx', 'paint', ['Spray', 'Spread with an Edgeless Lux towel', 'Buff'], 3],
    ['wheelassassin', 'wheels', ['Spray', 'Let it work, agitate with a wheel brush', 'Rinse'], 4],
    ['tirevenom', 'wheels', ['Apply with an applicator pad', 'Wipe onto the sidewall', 'Let it dry'], 5],
    ['interiorx', 'interior', ['Spray', 'Wipe', 'Done'], null],
    ['restorx', 'interior', ['Apply with an applicator pad', 'Let it level', 'Done, no oily feel'], null],
  ];
  const colGrid = $('#colGrid');
  colGrid.innerHTML = COL.map(([k, g, how, ch], i) => { const p = P[k]; return `<article class="cc" data-g="${g}" style="--liq:${p.liq}">
      <div class="cc-stage"><span class="cc-no">${String(i + 1).padStart(2, '0')}</span>
        <img class="cc-b" src="assets/img/bottles/${k}.webp" alt="${p.n} ${p.fn}" loading="lazy" decoding="async" />
        <img class="cc-r" src="assets/img/bottles/${k}-sm.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" /></div>
      <div class="cc-body"><h3 class="cc-name">${p.n.replace(/^LuxWheel/, 'Wheel')}</h3><p class="cc-fn">${p.fn}</p>
        <ol class="cc-how">${how.map(h => `<li>${h}</li>`).join('')}</ol>
        <div class="cc-buy"><span class="cc-price">${money(p.price)}</span><button class="sx-add" type="button" data-add="${k}"><span>Add</span></button></div>
        ${ch !== null ? `<button class="cc-watch" type="button" data-watch="${ch}"><i></i>Watch it in the film</button>` : ''}</div></article>`; }).join('');
  const tabs = Array.from(document.querySelectorAll('.col-tabs button'));
  tabs.forEach(b => b.addEventListener('click', () => {
    tabs.forEach(x => x.setAttribute('aria-selected', x === b));
    const g = b.dataset.g;
    colGrid.querySelectorAll('.cc').forEach(c => { c.hidden = g !== 'all' && c.dataset.g !== g; });
  }));
  /* "watch it": jump the hero film to that chapter and play */
  document.addEventListener('click', e => {
    const w = e.target.closest('[data-watch]'); if (!w) return;
    const i = +w.dataset.watch;
    document.getElementById('bay').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => { if (window.__story && window.__storyCH) window.__story(window.__storyCH[i] + .05, true); }, 450);
  });

  /* ---------- reviews: verbatim from their Judge.me widget ---------- */
  const R = [
    ['Spencer Seaman', 'CeramicX', 'Great shine and water beading'],
    ['Dr. Handshoes', 'LusterLux', 'This sh*t works, like actually works. The assassin wheel cleaner melted old grime off my wife’s Yukon wheels and tires before I even scrubbed them.'],
    ['John M.', 'LusterLux', 'Amazing products. LuxPro and LuxFoam are my favorites. Great cleaning power, awesome scents, and professional results.'],
    ['Spencer Seaman', 'WheelAssassin', 'Got the brake dust off my wheels and they look amazing. Great shine and easy to use.'],
    ['Tammy C', 'LusterLux', 'I have been using LusterLux on my black vehicle for months now. It really protects it from water spotting.'],
    ['Hank H', 'RestorX', 'The results exceeded my expectations and the shine has maintained longer than the Armor All I had always used prior.'],
    ['Jeff C', 'LusterLux', 'The more products I try from this business the more I like them.'],
    ['Spencer Seaman', 'TireVenom', 'Great product with good shine. No sling'],
    ['Kay', 'LusterLux', 'Great products, easy to use. Looks like a professional detailed my car!'],
    ['Zay', 'LusterLux', 'I used the waterless wash and the wheel cleaner. Gave my car a deep shine and wheels looked new again.'],
  ];
  const card = r => `<article class="rv"><q>${r[2]}</q><p><span>★★★★★</span>${r[0]}<i>${r[1]}</i></p></article>`;
  $('#beltRun').innerHTML = R.map(card).join('') + R.map(card).join('');

  /* ---------- 0 gallons counter + reveals ---------- */
  const galN = $('#galN');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    if (e.target === galN) { let n = 40; const t = setInterval(() => { n = Math.max(0, n - 3); galN.textContent = n; if (!n) clearInterval(t); }, 35); }
    io.unobserve(e.target);
  }), { threshold: 0.25 });
  $$('.head, .vf, .lp-copy, .sx-flag, .story-copy, .story-photos, .close .wrap').forEach(el => { el.classList.add('rv-up'); io.observe(el); });
  io.observe(galN);

  /* ---------- CART: localStorage, checks out through a Shopify cart permalink ---------- */
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };
  const drawer = $('#drawer'), scrim = $('#scrim');
  function render() {
    const keys = Object.keys(cart).filter(k => P[k] && cart[k] > 0);
    const count = keys.reduce((a, k) => a + cart[k], 0);
    const total = keys.reduce((a, k) => a + cart[k] * P[k].price, 0);
    const n = $('#cartN'); n.hidden = !count; n.textContent = count;
    $('#drBody').innerHTML = keys.length ? keys.map(k => `<div class="dr-item"><img src="${imgOf(k)}" alt="" />
        <div><b>${P[k].n}</b><small>${P[k].fn}</small><div class="qty"><button type="button" data-q="${k}" data-d="-1" aria-label="Remove one">−</button>${cart[k]}<button type="button" data-q="${k}" data-d="1" aria-label="Add one">+</button></div></div>
        <span>${money(cart[k] * P[k].price)}</span></div>`).join('') : '<p class="dr-empty">Your cart is empty.</p>';
    $('#drTotal').textContent = money(total);
    $('#drShip').textContent = !count ? '' : total >= 35 ? 'Your order ships free.' : `${money(35 - total)} more for free shipping.`;
    $('#drCheckout').href = keys.length ? `${STORE}/cart/${keys.map(k => P[k].v + ':' + cart[k]).join(',')}` : `${STORE}/cart`;
    syncAdded();
  }
  function syncAdded() {
    $$('[data-add]').forEach(b => {
      const on = cart[b.dataset.add] > 0;
      b.classList.toggle('added', on);
      const s = b.querySelector('em') || b.querySelector('span');
      if (!s) return;
      if (!s.dataset.label) s.dataset.label = s.textContent;
      s.textContent = on ? (b.matches('.chip-add') ? 'Added ✓' : 'Added ✓') : s.dataset.label;
    });
  }
  const scrimOn = () => scrim.classList.add('on'), scrimOff = () => scrim.classList.remove('on');
  const open = () => { drawer.classList.add('open'); scrimOn(); drawer.setAttribute('aria-hidden', 'false'); };
  const close = () => { drawer.classList.remove('open'); scrimOff(); drawer.setAttribute('aria-hidden', 'true'); const k = document.getElementById('kitdr'); if (k) { k.classList.remove('open'); k.setAttribute('aria-hidden', 'true'); } };
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-add]');
    if (a) { const k = a.dataset.add; cart[k] = (cart[k] || 0) + 1; save(); render(); open(); return; }
    const q = e.target.closest('[data-q]');
    if (q) { const k = q.dataset.q; cart[k] = Math.max(0, (cart[k] || 0) + +q.dataset.d); if (!cart[k]) delete cart[k]; save(); render(); return; }
    if (e.target.closest('[data-cart-open]')) open();
    if (e.target.closest('[data-cart-close]')) close();
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  /* ---------- KIT BUILDER: the reference's booking drawer, for a product brand ---------- */
  const RIDES = [
    ['car', 'Car', '<path d="M3 15h18M5 15l1.8-4.2A2 2 0 0 1 8.6 9.5h6.8a2 2 0 0 1 1.8 1.3L19 15"/><circle cx="7.5" cy="16.5" r="1.6"/><circle cx="16.5" cy="16.5" r="1.6"/>'],
    ['truck', 'Truck', '<path d="M2 15h20M3 15V10h9V7h5l3 4v4"/><circle cx="7" cy="16.5" r="1.6"/><circle cx="17" cy="16.5" r="1.6"/>'],
    ['golf', 'Golf cart', '<path d="M5 6h14M7 6v9M17 6v9M4 15h16M6 12h12"/><circle cx="7.5" cy="16.8" r="1.4"/><circle cx="16.5" cy="16.8" r="1.4"/>'],
    ['utv', 'UTV', '<path d="M3 14h18M5 14l2-6h9l3 6M9 8v6"/><circle cx="6.5" cy="16" r="2"/><circle cx="17.5" cy="16" r="2"/>'],
  ];
  const JOBS = [
    ['wash', 'Wash', 'Foam or waterless, no swirls', { def: ['luxpro', 'luxfoam'], golf: ['birdielux'] }],
    ['wheels', 'Wheels & tires', 'Brake dust off, sidewalls dark', { def: ['wheelassassin', 'tirevenom'], golf: ['tirevenom'] }],
    ['interior', 'Interior', 'Dash, console, trim', { def: ['interiorx', 'restorx'], golf: ['xfresh'] }],
    ['protect', 'Protect', 'Ceramic layer, quick touch-ups', { def: ['ceramicx', 'luxquick'] }],
  ];
  let ride = 'car', jobs = new Set(['wash', 'protect']);
  const kitdr = $('#kitdr');
  function kitItems() {
    const out = [];
    JOBS.forEach(j => { if (!jobs.has(j[0])) return; (j[3][ride === 'golf' ? 'golf' : 'def'] || j[3].def).forEach(k => { if (!out.includes(k)) out.push(k); }); });
    return out;
  }
  function paintKit() {
    $('#kdRides').innerHTML = RIDES.map(r => `<button type="button" class="kd-ride" data-ride="${r[0]}" aria-pressed="${r[0] === ride}"><svg viewBox="0 0 24 24">${r[2]}</svg>${r[1]}</button>`).join('');
    $('#kdJobs').innerHTML = JOBS.map(j => `<button type="button" class="kd-job" data-job="${j[0]}" aria-pressed="${jobs.has(j[0])}"><span><b>${j[1]}</b>${j[2]}</span><i></i></button>`).join('');
    const items = kitItems();
    $('#kdShelf').innerHTML = items.length ? items.map(k => `<div class="kd-b"><img src="assets/img/bottles/${k}-sm.webp" alt="" /><b>${P[k].n}</b><small>${money(P[k].price)}</small></div>`).join('') : '<p class="kd-empty">Pick at least one job.</p>';
    const total = items.reduce((a, k) => a + P[k].price, 0);
    $('#kdCount').textContent = items.length + (items.length === 1 ? ' bottle' : ' bottles');
    $('#kdTotal').textContent = money(total);
    $('#kdShip').textContent = !items.length ? '' : total >= 35 ? 'Ships free.' : `${money(35 - total)} more for free shipping.`;
    $('#kdAdd').disabled = !items.length;
    const rn = RIDES.find(r => r[0] === ride)[1];
    $('#pillRide').textContent = rn;
    const jn = JOBS.filter(j => jobs.has(j[0])).map(j => j[1].split(' ')[0]);
    $('#pillJobs').textContent = jn.length ? (jn.length > 2 ? jn.length + ' jobs' : jn.join(' · ')) : 'Pick jobs';
  }
  const kitOpen = () => { kitdr.classList.add('open'); scrimOn(); kitdr.setAttribute('aria-hidden', 'false'); };
  const kitClose = () => { kitdr.classList.remove('open'); kitdr.setAttribute('aria-hidden', 'true'); };
  kitdr.addEventListener('click', e => {
    const r = e.target.closest('[data-ride]'); if (r) { ride = r.dataset.ride; paintKit(); }
    const j = e.target.closest('[data-job]'); if (j) { const k = j.dataset.job; jobs.has(k) ? jobs.delete(k) : jobs.add(k); paintKit(); }
    if (e.target.closest('[data-kit-close]')) { kitClose(); scrimOff(); }
  });
  $('#kdAdd').addEventListener('click', () => { kitItems().forEach(k => cart[k] = (cart[k] || 0) + 1); save(); render(); kitClose(); open(); });
  document.addEventListener('click', e => { if (e.target.closest('[data-kit-open]')) kitOpen(); });
  paintKit();
  render();
})();
