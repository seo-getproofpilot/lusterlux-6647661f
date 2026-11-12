/* LusterLux hero, garage walk-in. Their own photo (LuxPro on the car, the Built Through Sacrifice mural) with a
   depth map (Depth Anything 3), so the camera can dolly in: near things (the bottle, the car) grow faster than the wall.
   Mouse parallax, a glint that sweeps the gloss, and dust in the light. Nothing here is generated imagery. */
(() => {
  const cv = document.getElementById('hgl'); if (!cv) return;
  const hero = cv.closest('.hero');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gl = cv.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) { hero.classList.add('nogl'); return; }
  const vs = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }';
  const fs = `precision highp float;
    uniform sampler2D uImg, uDep; uniform vec2 uRes, uMouse, uFocus, uAim; uniform float uImgAsp, uT, uTime, uMob;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec2 s = gl_FragCoord.xy / uRes; s.y = 1. - s.y;                 // y down, like the image
      float ra = uRes.x / uRes.y;
      vec2 sc = ra > uImgAsp ? vec2(1., uImgAsp / ra) : vec2(ra / uImgAsp, 1.);   // cover
      // the camera: drifts from a wide framing toward the bottle and dollies in
      float z = 1. + .16 * uT;
      vec2 C = mix(vec2(.5, .5), uFocus, .55 * uT);
      vec2 uv0 = C + (s - uAim) * sc / z;
      vec2 uv = uv0;
      for (int i = 0; i < 2; i++){
        float d = texture2D(uDep, uv).r;
        uv = C + (uv0 - C) / (1. + .2 * uT * (d - .35)) + uMouse * (d - .45) * .016;
      }
      float d = texture2D(uDep, uv).r;
      vec3 col = texture2D(uImg, uv).rgb;
      // a glint that sweeps across the glossy, near surfaces
      float band = dot(s, normalize(vec2(1., .55))) - (fract(uTime * .11) * 2.4 - .5);
      float lum = dot(col, vec3(.299, .587, .114));
      float glint = exp(-band * band / .0016) * smoothstep(.5, .85, d) * (.25 + lum);
      col += vec3(1., 1., .96) * glint * .38;
      // dust in the light
      float dust = 0.;
      for (int i = 0; i < 28; i++){
        float fi = float(i);
        vec2 p = vec2(h(vec2(fi, 1.)), h(vec2(fi, 7.)));
        p += vec2(sin(uTime * .07 + fi) * .05, -mod(uTime * (.008 + .012 * h(vec2(fi, 3.))) + p.y, 1.2) + .6);
        vec2 q = (s - fract(p)) * vec2(ra, 1.);
        float r = .0015 + .004 * h(vec2(fi, 9.));
        dust += exp(-dot(q, q) / (r * r)) * (.25 + .5 * h(vec2(fi, 5.)));
      }
      col += vec3(1., .98, .9) * dust * .5 * (1. - uMob * .5);
      // grade: keep it photographic, lift the shadows a touch, then vignette and grain
      col = pow(col, vec3(1.04));
      float vg = length((s - vec2(.5)) * vec2(1.1, 1.));
      col *= 1. - .45 * smoothstep(.45, 1.05, vg);
      col += (h(s * uRes + fract(uTime) * 91.) - .5) * .035;
      gl_FragColor = vec4(col, 1.);
    }`;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(o)); return o; };
  const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog); gl.useProgram(prog);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const L = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(L); gl.vertexAttribPointer(L, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(prog, n);
  const u = { res: U('uRes'), mouse: U('uMouse'), focus: U('uFocus'), aim: U('uAim'), asp: U('uImgAsp'), t: U('uT'), time: U('uTime'), mob: U('uMob') };
  const texFrom = (unit, img) => {
    const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };
  const load = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  let mob = false;
  const fit = () => {
    const r = cv.getBoundingClientRect(), k = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(r.width * k); cv.height = Math.round(r.height * k); gl.viewport(0, 0, cv.width, cv.height);
    mob = innerWidth <= 900;
  };
  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; });
  Promise.all([load('assets/hero/garage.webp'), load('assets/hero/garage-depth.webp')]).then(([img, dep]) => {
    // the depth map arrives far = dark; the shader wants near = bright
    const c = document.createElement('canvas'); c.width = dep.width; c.height = dep.height; const x = c.getContext('2d');
    x.filter = 'invert(1) blur(1.5px)'; x.drawImage(dep, 0, 0);
    gl.useProgram(prog);
    texFrom(0, img); texFrom(1, c);
    gl.uniform1i(U('uImg'), 0); gl.uniform1i(U('uDep'), 1);
    gl.uniform1f(u.asp, img.width / img.height);
    fit(); addEventListener('resize', fit);
    const t0 = performance.now();
    let onScreen = true;
    new IntersectionObserver(es => { onScreen = es[0].isIntersecting; if (onScreen) requestAnimationFrame(frame); }, { threshold: 0 }).observe(cv);
    function frame(now) {
      const T = (now - t0) / 1000;
      const k = reduce ? 1 : Math.min(1, T / 3.4), e = 1 - Math.pow(1 - k, 3);
      mx += (tx - mx) * .05; my += (ty - my) * .05;
      gl.uniform2f(u.res, cv.width, cv.height);
      gl.uniform1f(u.t, e + Math.sin(T * .35) * .02 * k);
      gl.uniform1f(u.time, T); gl.uniform1f(u.mob, mob ? 1 : 0);
      gl.uniform2f(u.mouse, mx, my);
      // the bottle sits ~ (0.5, 0.55) in the photo; on desktop it lands left of the copy, on phones in the middle
      gl.uniform2f(u.focus, .5, .53);
      gl.uniform2f(u.aim, mob ? .5 : .47, .5);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!hero.classList.contains('lit')) hero.classList.add('lit');
      if (T > 1.5 && !hero.classList.contains('arrived')) hero.classList.add('arrived');
      if (onScreen) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }).catch(() => hero.classList.add('nogl'));
})();
