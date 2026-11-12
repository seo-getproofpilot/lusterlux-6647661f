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
  /* their own product copy, verbatim from lusterluxauto.com product pages (tagline, first line, how-to, why you’ll love it) */
  const COPY = {
    "luxfoam": {
      "tag": "Thick foam. Brilliant shine. Every wash.",
      "desc": "LuxFoam is a foam soap engineered to produce rich, clinging foam that safely lifts dirt, road grime, and contaminants from your vehicle's surface while helping reduce the risk of swirl marks and scratches.",
      "how": "Foam, wash, rinse, and reveal a clean, glossy finish that's ready for your next adventure",
      "love": [
        "Produces thick, rich foam for maximum cleaning power",
        "Formula that's safe for regular maintenance washes",
        "High-lubricity formula helps minimize swirl marks and scratches"
      ]
    },
    "luxpro": {
      "tag": "Skip the Hose. Keep the Showroom Shine.",
      "desc": "LuxPro is a premium NanoFusion Surface Coating engineered to safely remove light dust, fingerprints, pollen, and road film while enhancing gloss and leaving behind a slick, protective finish.",
      "how": "Spray, wipe, and reveal a deep, streak-free shine anywhere",
      "love": [
        "Encapsulates light dirt before wiping",
        "Enhances gloss and color depth",
        "Leaves behind an ultra-slick protective layer"
      ]
    },
    "luxquick": {
      "tag": "Refresh your shine in seconds.",
      "desc": "LuxQuick is a premium quick detail spray engineered to safely remove light dust, fingerprints, smudges, and fresh water spots while enhancing gloss and restoring that just-detailed finish.",
      "how": "Spray, wipe, and buff to reveal a clean, smooth surface that looks freshly detailed",
      "love": [
        "Safely removes light dust, fingerprints, and smudges",
        "Eliminates fresh water spots and light surface contaminants",
        "Instantly boosts gloss and paint depth"
      ]
    },
    "ceramicx": {
      "tag": "Instant protection. Lasting shine.",
      "desc": "CeramicX is a premium ceramic spray engineered to deliver long-lasting protection, incredible gloss, and extreme hydrophobic performance in just minutes.",
      "how": "Spray, spread evenly with a Edgeless Lux microfiber towel, and buff to reveal a smooth, protected surface with outstanding water beading",
      "love": [
        "Creates a durable layer of ceramic protection",
        "Produces intense gloss and enhanced paint depth",
        "Hydrophobic formula repels water, dirt, and road grime"
      ]
    },
    "wheelassassin": {
      "tag": "Attack brake dust. Leave behind brilliance.",
      "desc": "LuxWheelAssassin is a premium wheel cleaner engineered to break down stubborn brake dust, road grime, grease, and everyday buildup without damaging your wheels.",
      "how": "Spray, allow the formula to work, agitate with a wheel brush if needed, and rinse away years of built-up grime to reveal brilliantly clean wheels",
      "love": [
        "Powerful formula removes stubborn brake dust and road grime",
        "Cuts through grease, dirt, and built-up contaminants with ease",
        "Fast-acting formula helps reduce scrubbing time"
      ]
    },
    "tirevenom": {
      "tag": "Deep, rich tires. Long-lasting protection.",
      "desc": "TireVenom is a premium tire dressing engineered to restore faded tires with a deep, rich finish while providing long-lasting protection against fading, cracking, and harmful UV exposure.",
      "how": "Apply with a premium applicator pad and enjoy tires that look cleaner, darker, and protected mile after mile",
      "love": [
        "Restores faded tires with a deep, rich finish",
        "No greasy residue or messy application",
        "No-sling formula helps keep product off your paint"
      ]
    },
    "interiorx": {
      "tag": "A cleaner interior starts here.",
      "desc": "InteriorX is a premium interior cleaner engineered to safely remove dirt, dust, fingerprints, spills, and everyday grime from your vehicle's interior while leaving behind a clean, factory-fresh finish.",
      "how": "Spray, wipe, and enjoy a clean, refreshed interior that looks and feels like new",
      "love": [
        "Safely removes dirt, dust, fingerprints, spills, and everyday grime",
        "Leaves behind a clean, natural factory finish with no greasy residue",
        "Helps restore the appearance of interior plastics, vinyl, and trim"
      ]
    },
    "restorx": {
      "tag": "Restore the finish. Protect it for longer.",
      "desc": "RestorX is a premium rubber, vinyl, and plastic dressing engineered to restore faded surfaces while leaving behind a rich, factory-new finish without the greasy residue.",
      "how": "Apply with a premium applicator pad, allow the product to level, and enjoy a deep, even finish that won't leave your surfaces feeling oily or attract excessive dust",
      "love": [
        "Restores faded rubber, vinyl, and plastic surfaces",
        "Leaves a rich, factory-new finish without a greasy feel",
        "Helps protect against UV rays, fading, cracking, and discoloration"
      ]
    }
  };


  /* ================= HERO: full-width slideshow (Shine Supply pattern), their photos and their taglines ================= */
  // each slide passes the brief: the owners, a car, or the product being used on one
  const SS = [
    { img: 'luxpro-mclaren', side: 'r', kick: 'Waterless wash', h: 'Skip the hose. Keep the showroom shine.', cta: 'Shop LuxPro', k: 'luxpro' },
    { img: 'foam-driveway', side: 'l', kick: 'Foam wash', h: 'Thick foam. Brilliant shine. Every wash.', cta: 'Shop LuxFoam', k: 'luxfoam' },
    { img: 'founders', side: 'r', kick: 'Chase & Brandon', h: 'Two friends from 7th grade. One line of formulas.', cta: 'Our story', href: '#story' },
    { img: 'tirevenom-hand', side: 'r', kick: 'Tire dressing', h: 'Deep, rich tires. Long-lasting protection.', cta: 'Shop TireVenom', k: 'tirevenom' },
    { img: 'luxpro-mural', side: 'r', kick: 'Built in Arizona', h: 'Built through sacrifice.', cta: 'Shop the line', href: '#theater' },
    { img: 'dry', side: 'r', kick: 'The final dry', h: 'Soft, streak-free, every panel.', cta: 'Shop kits', href: '#kits' },
  ];
  const ssBox = $('#ssSlides'), ssDots = $('#ssDots');
  if (ssBox) {
    ssBox.innerHTML = SS.map((s, i) => `
      <section class="ss-slide side-${s.side}" aria-roledescription="slide" aria-label="${i + 1} of ${SS.length}">
        <picture><source media="(max-width: 900px)" srcset="assets/hero/slides/${s.img}.webp" />
          <img src="assets/hero/wide/${s.img}.webp" alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} /></picture>
        <div class="ss-copy"><p class="ss-kick">${s.kick}</p><h${i ? 2 : 1} class="ss-h">${s.h}</h${i ? 2 : 1}>
          <a class="btn solid" href="${s.k ? cartURL(prod(s.k).v) : s.href}">${s.cta}</a></div>
      </section>`).join('');
    ssDots.innerHTML = SS.map((_, i) => `<button type="button" role="tab" aria-label="Slide ${i + 1}" aria-selected="${!i}"><i></i></button>`).join('');
    const slides = $$('.ss-slide', ssBox), dots = $$('button', ssDots), wipe = $('#ssWipe');
    let cur = 0, t = null, held = false, busy = false;
    const DUR = 5600;
    ssBox.parentElement.style.setProperty('--dur', DUR + 'ms');
    // the squeegee: the next photo is wiped on under a glossy streak; the old one stays underneath until it's covered
    const show = (i, first) => {
      const next = (i + SS.length) % SS.length;
      if (!first && (next === cur || busy)) { clearTimeout(t); if (!held) t = setTimeout(() => show(cur + 1), DUR); return; }
      const prev = slides[cur];
      cur = next;
      slides.forEach(s => s.classList.remove('top'));
      if (!first) {
        busy = true;
        prev.classList.add('under');
        slides[cur].classList.add('on', 'top', 'wiping');
        wipe.classList.remove('go'); void wipe.offsetWidth; wipe.classList.add('go');
        setTimeout(() => { prev.classList.remove('on', 'under'); slides[cur].classList.remove('wiping'); busy = false; }, 1050);
      } else slides[cur].classList.add('on', 'top');
      dots.forEach((d, j) => { d.setAttribute('aria-selected', j === cur); const bar = d.querySelector('i'); bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; });
      clearTimeout(t); if (!held) t = setTimeout(() => show(cur + 1), DUR);
    };
    dots.forEach((d, j) => d.addEventListener('click', () => show(j)));
    const hero = $('.ss');
    hero.addEventListener('mouseenter', () => { held = true; clearTimeout(t); hero.classList.add('held'); });
    hero.addEventListener('mouseleave', () => { held = false; hero.classList.remove('held'); clearTimeout(t); t = setTimeout(() => show(cur + 1), DUR); });
    let sx = null;
    hero.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); sx = null; });
    show(0, true);
  }

  /* ================= THE LINE: pinned theater ================= */
  const TH = P.filter(p => p.g !== 'golf');
  const th = $('#theater'), thInfo = $('#thInfo'), thRail = $('#thRail');
  th.style.setProperty('--n', TH.length);
  $('#thTot').textContent = String(TH.length).padStart(2, '0');
  thRail.innerHTML = TH.map((p, i) => `<li><button type="button" data-i="${i}" style="--c:${p.c}"><i></i><span>${p.a}${p.b}</span></button></li>`).join('');
  const info = p => { const c = COPY[p.k] || {}; return `
    <p class="th-fn">${p.fn}</p>
    <h3 style="--len:${(p.a + p.b).length}">${p.a.toUpperCase()}<em>${p.b.toUpperCase()}</em></h3>
    ${c.tag ? `<p class="th-tag">${c.tag}</p>` : ''}
    <p class="th-d">${c.desc || p.d}</p>
    ${c.love ? `<ul class="th-love">${c.love.map(l => `<li>${l}</li>`).join('')}</ul>` : ''}
    <dl><div><dt>Per bottle</dt><dd>${p.per}</dd></div><div><dt>${p.s2[0]}</dt><dd>${p.s2[1]}</dd></div>${c.how ? `<div class="th-how"><dt>How to use</dt><dd>${c.how}.</dd></div>` : ''}</dl>
    <div class="th-buy"><b>${money(p.price)}</b><a class="btn solid" href="${cartURL(p.v)}">Add to cart</a><a class="th-more" href="#p-${p.k}">Details</a></div>`; };
  let thCur = -1;
  const thSet = i => {
    if (i === thCur) return;
    const dir = i > thCur ? 1 : -1; thCur = i;
    const p = TH[i];
    th.style.setProperty('--c', p.c);
    $('#thNum').textContent = String(i + 1).padStart(2, '0');
    $$('button', thRail).forEach((b, j) => b.classList.toggle('on', j === i));
    dispatchEvent(new CustomEvent('lux:theater', { detail: { k: p.k, i, dir, c: p.c, name: (p.a + p.b).toUpperCase() } }));
    thInfo.classList.remove('in'); thInfo.style.setProperty('--dir', dir);
    void thInfo.offsetWidth; thInfo.innerHTML = info(p); thInfo.classList.add('in');
  };
  const thProg = () => {
    const r = th.getBoundingClientRect(), pin = $('.th-pin', th).offsetHeight;
    const p = Math.min(1, Math.max(0, -r.top / (r.height - pin)));
    const f = p * TH.length, i = Math.min(TH.length - 1, Math.floor(f)), t = f - i;
    thSet(i);
    $('#thBar').style.transform = `scaleX(${p})`;
    th.style.setProperty('--t', t.toFixed(3));
    window.__theater && window.__theater.progress(p, t);
  };
  thRail.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const pin = $('.th-pin', th).offsetHeight, top = th.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + (th.offsetHeight - pin) * ((+b.dataset.i + .5) / TH.length), behavior: 'smooth' });
  });
  window.__thKeys = TH.map(p => ({ k: p.k, c: p.c, name: (p.a + p.b).toUpperCase(), fn: p.fn }));
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
  /* kit builder icons: drawn for this page, ink line + badge green fill */
  const ICON = {
    new: '<svg viewBox="0 0 64 64"><rect x="10" y="12" width="44" height="40" rx="6" class="f"/><rect x="10" y="12" width="44" height="40" rx="6"/><path d="M25 21v22h15" stroke-width="6" stroke-linecap="square"/><path d="M50 6l1.6 3.4L55 11l-3.4 1.6L50 16l-1.6-3.4L45 11l3.4-1.6z" class="k"/></svg>',
    some: '<svg viewBox="0 0 64 64"><path d="M16 26h32l-4 28H20z" class="f"/><path d="M16 26h32l-4 28H20zM14 26h36"/><path d="M20 26c0-10 24-10 24 0"/><rect x="30" y="34" width="16" height="9" rx="3" class="k"/><circle cx="22" cy="14" r="3"/><circle cx="31" cy="9" r="2"/><circle cx="40" cy="15" r="2.5"/></svg>',
    pro: '<svg viewBox="0 0 64 64"><circle cx="22" cy="42" r="13" class="f"/><circle cx="22" cy="42" r="13"/><circle cx="22" cy="42" r="5"/><path d="M28 31l14-14 8 8-14 14M42 17l4-4 8 8-4 4"/><path d="M50 37l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z" class="k"/></svg>',
    paint: '<svg viewBox="0 0 64 64"><path d="M6 40l5-10c2-4 5-6 10-6h20c4 0 7 2 10 6l7 4v8H6z" class="f"/><path d="M6 40l5-10c2-4 5-6 10-6h20c4 0 7 2 10 6l7 4v8H6zM16 24l4-8h18l6 8"/><circle cx="17" cy="44" r="5" class="w"/><circle cx="47" cy="44" r="5" class="w"/><circle cx="24" cy="31" r="1.2" class="k"/><circle cx="31" cy="34" r="1.2" class="k"/><circle cx="37" cy="30" r="1.2" class="k"/><path d="M52 10l1.6 3.4L57 15l-3.4 1.6L52 20l-1.6-3.4L47 15l3.4-1.6z" class="k"/></svg>',
    wheel: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" class="f"/><circle cx="32" cy="32" r="24"/><circle cx="32" cy="32" r="16"/><circle cx="32" cy="32" r="4"/><path d="M32 16v12M32 36v12M16 32h12M36 32h12M21 21l8 8M35 35l8 8M43 21l-8 8M29 35l-8 8"/><circle cx="14" cy="16" r="1.6" class="k"/><circle cx="50" cy="12" r="1.6" class="k"/><circle cx="54" cy="50" r="1.6" class="k"/></svg>',
    int: '<svg viewBox="0 0 64 64"><path d="M22 8h12c3 0 5 2 5 5l-3 25H22l-4-25c0-3 2-5 4-5z" class="f"/><path d="M22 8h12c3 0 5 2 5 5l-3 25H22l-4-25c0-3 2-5 4-5zM16 38h30c3 0 5 2 5 5v3H14v-3c0-3 1-5 2-5zM22 46l-3 10M42 46l3 10"/><path d="M50 14l1.6 3.4L55 19l-3.4 1.6L50 24l-1.6-3.4L45 19l3.4-1.6z" class="k"/></svg>',
    all: '<svg viewBox="0 0 64 64"><path d="M12 38l4-8c2-3 4-5 8-5h16c3 0 6 2 8 5l5 3v6H12z" class="f"/><path d="M12 38l4-8c2-3 4-5 8-5h16c3 0 6 2 8 5l5 3v6H12z"/><circle cx="21" cy="40" r="4" class="w"/><circle cx="44" cy="40" r="4" class="w"/><path d="M8 26a26 26 0 0 1 46-10M56 38a26 26 0 0 1-46 10"/><path d="M54 8v8h-8M10 56v-8h8" class="k-s"/></svg>',
    none: '<svg viewBox="0 0 64 64"><path d="M32 8c8 12 14 20 14 28a14 14 0 0 1-28 0c0-8 6-16 14-28z" class="f"/><path d="M32 8c8 12 14 20 14 28a14 14 0 0 1-28 0c0-8 6-16 14-28z"/><path d="M10 10l44 44" stroke-width="5" class="x"/></svg>',
    hose: '<svg viewBox="0 0 64 64"><path d="M8 48c0-10 8-14 16-14h10" /><path d="M8 54c0-14 10-22 22-22h4"/><rect x="33" y="27" width="12" height="12" rx="2" class="f"/><rect x="33" y="27" width="12" height="12" rx="2"/><path d="M45 31h6"/><path d="M53 22c4 4 4 16 0 20M58 18c6 7 6 21 0 28" class="k-s"/></svg>',
    pw: '<svg viewBox="0 0 64 64"><path d="M6 40h20l4-6h10v8H30l-6 14h-8l4-12H6z" class="f"/><path d="M6 40h20l4-6h10v8H30l-6 14h-8l4-12H6zM40 37h8"/><circle cx="54" cy="30" r="6" class="w"/><circle cx="54" cy="30" r="6"/><circle cx="56" cy="19" r="4.5" class="w"/><circle cx="56" cy="19" r="4.5"/><circle cx="47" cy="23" r="3.5" class="w"/><circle cx="47" cy="23" r="3.5"/></svg>',
  };
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
          <span class="t-ck" aria-hidden="true"></span>
          <span class="t-ic" aria-hidden="true">${ICON[v]}</span>
          ${q.id === 'lvl' ? `<span class="t-lvl" aria-label="Level ${n + 1} of 3">${[0, 1, 2].map(j => `<i class="${j <= n ? 'on' : ''}"></i>`).join('')}</span>` : ''}
          <b>${t}</b><small>${d}</small>
          <figure class="t-ph"><img src="${img}" alt="" loading="lazy" /></figure>
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
})();
