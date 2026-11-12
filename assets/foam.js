/* LusterLux hero, foam rinse. The hero loads buried in thick LuxFoam; a rinse wand sweeps it off, the thinned foam
   sheets and drips down, and a wet sheen dries off what's underneath. After the intro your cursor (or finger) is the wand.
   Density is simulated on a small grid in JS; a WebGL shader draws it as foam with real bubble structure. */
(() => {
  const hero = document.querySelector('.hero');
  if (!hero || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = document.createElement('canvas'); cv.className = 'foam-cv'; cv.setAttribute('aria-hidden', 'true');
  hero.appendChild(cv);
  const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) { cv.remove(); return; }

  /* ---------- simulation grid ---------- */
  let GW = 220, GH = 124, D, Wt, spd;
  const resizeGrid = () => {
    const r = hero.getBoundingClientRect();
    GW = r.width > 900 ? 240 : 150; GH = Math.max(60, Math.round(GW * r.height / r.width));
    D = new Float32Array(GW * GH); Wt = new Float32Array(GW * GH); spd = new Float32Array(GW);
    for (let x = 0; x < GW; x++) spd[x] = .35 + Math.random() * .9 + (Math.random() < .12 ? 1.2 : 0);   // some columns drip faster
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const n = Math.sin(x * .21 + Math.sin(y * .13) * 2) * .5 + Math.sin(y * .17 + x * .05) * .5;
      D[y * GW + x] = 1.05 + n * .12 + Math.random() * .06;
    }
  };
  resizeGrid();

  /* ---------- GL ---------- */
  const vs = 'attribute vec2 p; varying vec2 v; void main(){ v = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }';
  const fs = `precision highp float; varying vec2 v; uniform sampler2D uD; uniform vec2 uRes; uniform float uT; uniform vec4 uJet; uniform vec4 uJet2;
    vec2 h2(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
    float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
      float a = h2(i).x, b = h2(i + vec2(1, 0)).x, c = h2(i + vec2(0, 1)).x, d = h2(i + vec2(1, 1)).x; return mix(mix(a, b, f.x), mix(c, d, f.x), f.y); }
    float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * n2(p); p *= 2.03; a *= .5; } return s; }
    // bubbles: returns (rim, highlight, shade) for one voronoi scale
    vec3 bubbles(vec2 p, float jitter){
      vec2 i = floor(p), f = fract(p); float d1 = 9., d2 = 9.; vec2 c1 = vec2(0.), o1 = vec2(0.); float r1 = .5;
      for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
        vec2 g = vec2(float(x), float(y)), o = h2(i + g); o = .5 + (o - .5) * jitter;
        vec2 r = g + o - f; float d = dot(r, r);
        if (d < d1){ d2 = d1; d1 = d; c1 = r; o1 = o; } else if (d < d2) d2 = d;
      }
      float e = sqrt(d2) - sqrt(d1);                       // distance to the cell wall
      float rad = .5 + .25 * h2(i + o1).y;
      vec2 q = -c1 / rad; float z = sqrt(max(0., 1. - dot(q, q)));
      vec3 nrm = normalize(vec3(q, z + .2));
      float spec = pow(max(0., dot(reflect(vec3(0, 0, -1), nrm), normalize(vec3(-.45, .55, .7)))), 40.);
      float rim = 1. - smoothstep(.0, .09, e);
      return vec3(rim, spec, z);
    }
    void main(){
      vec2 uv = v; float asp = uRes.x / uRes.y;
      vec2 w = vec2(fbm(uv * 7. + uT * .05), fbm(uv * 7. + 9.1)) - .5;
      vec4 s = texture2D(uD, vec2(uv.x, 1. - uv.y) + w * .012);
      float d = s.r * 1.3, wet = s.g;
      float edge = fbm(uv * vec2(asp, 1.) * 9.) * .32;
      float a = smoothstep(.22, .46, d + edge - .16);
      vec2 P = uv * vec2(asp, 1.);
      float thick = clamp(d, 0., 1.4);
      // body: soft clumps of foam lit from the top left
      float m0 = fbm(P * 3.2 + vec2(0., uT * .015));
      float mx = fbm((P + vec2(.006, 0.)) * 3.2 + vec2(0., uT * .015)) - m0;
      float my = fbm((P + vec2(0., .006)) * 3.2 + vec2(0., uT * .015)) - m0;
      vec3 N = normalize(vec3(-mx * 44., -my * 44., 1.));
      float lit = clamp(dot(N, normalize(vec3(-.5, .62, .62))), 0., 1.);
      float occ = smoothstep(.15, .7, m0);
      vec3 base = mix(vec3(.62, .67, .74), vec3(1.), .15 + .7 * lit + .15 * occ);
      base = mix(base, vec3(.93, .91, 1.), .14 * smoothstep(.8, 1.3, thick));     // a breath of LuxFoam violet in the deep suds
      // bubbles: dense micro-foam everywhere, bigger bubbles only where it thins out near the edges
      float bigK = 1. - smoothstep(.35, .95, thick);
      vec3 b1 = bubbles(P * 20., .9), b2 = bubbles(P * 42. + 3.7, .95), b3 = bubbles(P * 105. + 9.2, 1.);
      vec3 col = base;
      col *= 1. - b3.x * .13;
      col *= 1. - b2.x * (.08 + .12 * bigK) - b1.x * .24 * bigK;
      col += vec3(1.) * (b3.y * .45 + b2.y * .45 * (.5 + bigK) + b1.y * .85 * bigK);
      col *= .9 + .1 * b3.z;
      col = mix(col, col * vec3(.92, .95, 1.), (1. - b1.z) * bigK * .35);           // bubble edges go slightly see-through grey
      // thin film at the edges: translucent with a little oil-slick colour
      float film = smoothstep(.0, .25, a) * (1. - smoothstep(.25, .75, a));
      col += film * .10 * vec3(.6 + .4 * sin(P.x * 40. + uT), .6 + .4 * sin(P.x * 40. + 2.1 + uT), .6 + .4 * sin(P.x * 40. + 4.2 + uT));
      float alpha = a * mix(.82, 1., smoothstep(.4, 1., thick));
      // rinse spray where the wand hits
      for (int k = 0; k < 2; k++){
        vec4 J = k == 0 ? uJet : uJet2;
        if (J.z > 0.){
          vec2 dj = (uv - J.xy) * vec2(asp, 1.); float r = length(dj);
          float mist = exp(-r * r / (J.z * J.z) * 1.6) * J.w;
          float spark = step(.985, h2(floor(P * 260. + uT * 30.)).x) * mist;
          col = mix(col, vec3(.94, .98, 1.), mist * .6); alpha = max(alpha, mist * .55 + spark);
        }
      }
      // wet sheen on what's been rinsed: vertical streaks catching the light
      float streak = smoothstep(.6, .95, fbm(vec2(P.x * 26., P.y * 2.2 + uT * .5)));
      float sheen = wet * wet * (1. - a) * (.05 + streak * .18);
      vec3 outc = col * alpha + vec3(.92, .97, 1.) * sheen;
      float outa = clamp(alpha + sheen * .9, 0., 1.);
      gl_FragColor = vec4(outc, outa);
    }`;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(o)); return o; };
  const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog); gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const U = n => gl.getUniformLocation(prog, n);
  const uRes = U('uRes'), uT = U('uT'), uJet = U('uJet'), uJet2 = U('uJet2');
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  let pix = new Uint8Array(GW * GH * 4);
  const fit = () => {
    const r = hero.getBoundingClientRect(), k = Math.min(devicePixelRatio || 1, 1.5);
    cv.width = Math.round(r.width * k); cv.height = Math.round(r.height * k); gl.viewport(0, 0, cv.width, cv.height);
  };
  fit();
  addEventListener('resize', () => { fit(); });

  /* ---------- the wand ---------- */
  const jets = [];                                   // {x,y,r,s} in 0..1 (y down)
  let ptr = null;
  const onPtr = e => { const r = hero.getBoundingClientRect(); ptr = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, t: performance.now() }; };
  hero.addEventListener('pointermove', onPtr); hero.addEventListener('pointerdown', onPtr);
  hero.addEventListener('pointerleave', () => { ptr = null; });

  const rinse = (jx, jy, rad, str, dt) => {
    const cx = jx * GW, cy = jy * GH, R = rad * GH, R2 = R * 1.55;
    const x0 = Math.max(0, Math.floor(cx - R2)), x1 = Math.min(GW - 1, Math.ceil(cx + R2));
    const y0 = Math.max(0, Math.floor(cy - R2)), y1 = Math.min(GH - 1, Math.ceil(cy + R2));
    let moved = 0;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const d = Math.hypot(x - cx, y - cy), i = y * GW + x;
      if (d < R) { const f = (1 - d / R); const take = Math.min(D[i], str * dt * (.4 + f * 1.6)); D[i] -= take; moved += take; Wt[i] = 1; }
    }
    // the foam the jet blasts away piles up in a ring around it, mostly below (water runs down)
    const ring = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const d = Math.hypot(x - cx, y - cy); if (d >= R && d < R2) ring.push(y * GW + x + (y > cy ? 0 : 0)); }
    if (ring.length) { const add = moved * .45 / ring.length; for (const i of ring) D[i] += add; }
  };

  let t0 = performance.now(), last = t0, done = false, rinsed = false;
  let total = 1;
  function sim(dt, T, now) {
    jets.length = 0;
    // intro: two passes of the wand, top left → right, then lower right → left
    if (T > .55 && T < 1.55) { const s = (T - .55) / 1; jets.push({ x: -.08 + s * 1.16, y: .32 + Math.sin(s * Math.PI * 2) * .05, r: .2, s: 7 }); }
    if (T > 1.45 && T < 2.5) { const s = (T - 1.45) / 1.05; jets.push({ x: 1.08 - s * 1.16, y: .7 + Math.sin(s * Math.PI * 2) * .05, r: .2, s: 7 }); }
    if (ptr && T > .55 && now - ptr.t < 600) jets.push({ x: ptr.x, y: ptr.y, r: innerWidth < 900 ? .16 : .12, s: 9 });
    for (const j of jets) rinse(j.x, j.y, j.r, j.s, dt);
    // gravity: thin foam sheets off fast, thick foam clings, then everything lets go after the rinse
    const letGo = T < 2.4 ? .04 : Math.min(1.6, .04 + (T - 2.4) * .55);
    for (let y = GH - 1; y >= 0; y--) for (let x = 0; x < GW; x++) {
      const i = y * GW + x, d = D[i]; if (d <= .001) continue;
      const thin = d < .85 ? 1.6 : 1;
      const flow = Math.min(d, d * spd[x] * letGo * thin * dt * 3.2);
      D[i] -= flow; if (y < GH - 1) D[i + GW] += flow * .985;
      Wt[i] = Math.max(Wt[i], Math.min(.8, flow * 10));
    }
    total = 0;
    for (let i = 0; i < D.length; i++) { Wt[i] = Math.max(0, Wt[i] - dt * .55); total += D[i]; }
  }
  function step(now) {
    const raw = Math.min(1.2, (now - last) / 1000), T = (now - t0) / 1000; last = now;
    // late frames (slow phones, background tabs) catch up in small sub-steps so the rinse keeps real time
    const n = Math.max(1, Math.min(24, Math.ceil(raw / .034))), dt = raw / n;
    for (let k = 0; k < n; k++) sim(dt, T - raw + dt * (k + 1), now);
    // upload: R = foam, G = wet
    if (pix.length !== GW * GH * 4) pix = new Uint8Array(GW * GH * 4);
    for (let i = 0; i < D.length; i++) { pix[i * 4] = Math.min(255, D[i] * 190); pix[i * 4 + 1] = Wt[i] * 255; }
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, GW, GH, 0, gl.RGBA, gl.UNSIGNED_BYTE, pix);
    gl.uniform2f(uRes, cv.width, cv.height); gl.uniform1f(uT, T);
    const J = (j, u) => j ? gl.uniform4f(u, j.x, 1 - j.y, j.r * .75, 1) : gl.uniform4f(u, 0, 0, 0, 0);
    J(jets[0], uJet); J(jets[1], uJet2);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!rinsed && T > 1.2) { rinsed = true; hero.classList.add('rinsed'); }
    if (total / D.length < .004 && T > 3) { done = true; cv.classList.add('gone'); setTimeout(() => cv.remove(), 900); return; }
    requestAnimationFrame(step);
  }
  hero.classList.add('foamed');
  requestAnimationFrame(step);
  window.__foam = { restart() { t0 = performance.now(); resizeGrid(); } };
})();
