(() => {
  // Inline simplex-noise 3D implementation
  const F3 = 1/3, G3 = 1/6;
  const grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
  const perm = new Uint8Array(512);
  const permMod12 = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) { perm[i] = p[i & 255]; permMod12[i] = perm[i] % 12; }

  function noise3D(xin, yin, zin) {
    let n0, n1, n2, n3;
    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s), j = Math.floor(yin + s), k = Math.floor(zin + s);
    const t = (i + j + k) * G3;
    const X0 = i - t, Y0 = j - t, Z0 = k - t;
    const x0 = xin - X0, y0 = yin - Y0, z0 = zin - Z0;
    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) { if (y0 >= z0) { i1=1;j1=0;k1=0;i2=1;j2=1;k2=0; } else if (x0 >= z0) { i1=1;j1=0;k1=0;i2=1;j2=0;k2=1; } else { i1=0;j1=0;k1=1;i2=1;j2=0;k2=1; } }
    else { if (y0 < z0) { i1=0;j1=0;k1=1;i2=0;j2=1;k2=1; } else if (x0 < z0) { i1=0;j1=1;k1=0;i2=0;j2=1;k2=1; } else { i1=0;j1=1;k1=0;i2=1;j2=1;k2=0; } }
    const x1 = x0-i1+G3, y1 = y0-j1+G3, z1 = z0-k1+G3;
    const x2 = x0-i2+2*G3, y2 = y0-j2+2*G3, z2 = z0-k2+2*G3;
    const x3 = x0-1+3*G3, y3 = y0-1+3*G3, z3 = z0-1+3*G3;
    const ii = i & 255, jj = j & 255, kk = k & 255;
    let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
    if (t0 < 0) n0 = 0; else { t0 *= t0; const gi0 = permMod12[ii+perm[jj+perm[kk]]]; n0 = t0*t0*(grad3[gi0][0]*x0+grad3[gi0][1]*y0+grad3[gi0][2]*z0); }
    let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
    if (t1 < 0) n1 = 0; else { t1 *= t1; const gi1 = permMod12[ii+i1+perm[jj+j1+perm[kk+k1]]]; n1 = t1*t1*(grad3[gi1][0]*x1+grad3[gi1][1]*y1+grad3[gi1][2]*z1); }
    let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
    if (t2 < 0) n2 = 0; else { t2 *= t2; const gi2 = permMod12[ii+i2+perm[jj+j2+perm[kk+k2]]]; n2 = t2*t2*(grad3[gi2][0]*x2+grad3[gi2][1]*y2+grad3[gi2][2]*z2); }
    let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
    if (t3 < 0) n3 = 0; else { t3 *= t3; const gi3 = permMod12[ii+1+perm[jj+1+perm[kk+1]]]; n3 = t3*t3*(grad3[gi3][0]*x3+grad3[gi3][1]*y3+grad3[gi3][2]*z3); }
    return 32 * (n0 + n1 + n2 + n3);
  }

  const canvas = document.getElementById('vortexCanvas');
  const ctx = canvas.getContext('2d');

  const PARTICLE_COUNT = 250;
  const PROP_COUNT = 9;
  const PROPS_LEN = PARTICLE_COUNT * PROP_COUNT;
  const RANGE_Y = 300;
  const BASE_TTL = 50, RANGE_TTL = 150;
  const BASE_SPEED = 0.0, RANGE_SPEED = 1.2;
  const BASE_RADIUS = 1, RANGE_RADIUS = 2;
  const BASE_HUE = 220, RANGE_HUE = 100;
  const NOISE_STEPS = 3;
  const X_OFF = 0.00125, Y_OFF = 0.00125, Z_OFF = 0.0005;
  const TAU = 2 * Math.PI;
  const BG = '#0a0a1a';

  let tick = 0;
  let particles = new Float32Array(PROPS_LEN);
  let center = [0, 0];
  let animId;

  const rand = (n) => n * Math.random();
  const randRange = (n) => n - rand(2 * n);
  const fadeInOut = (t, m) => { const hm = 0.5 * m; return Math.abs(((t + hm) % m) - hm) / hm; };
  const lerp = (a, b, s) => (1 - s) * a + s * b;

  const VORTEX_SCALE = window.innerWidth <= 900 ? 0.5 : 0.75;
  function resize() {
    canvas.width = window.innerWidth * VORTEX_SCALE;
    canvas.height = window.innerHeight * VORTEX_SCALE;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    center[0] = 0.5 * canvas.width;
    center[1] = 0.5 * canvas.height;
  }

  function initParticle(i) {
    const x = rand(canvas.width);
    const y = center[1] + randRange(RANGE_Y);
    particles.set([x, y, 0, 0, 0, BASE_TTL + rand(RANGE_TTL), BASE_SPEED + rand(RANGE_SPEED), BASE_RADIUS + rand(RANGE_RADIUS), BASE_HUE + rand(RANGE_HUE)], i);
  }

  function initAll() {
    tick = 0;
    particles = new Float32Array(PROPS_LEN);
    for (let i = 0; i < PROPS_LEN; i += PROP_COUNT) initParticle(i);
  }

  function drawParticle(x, y, x2, y2, life, ttl, radius, hue) {
    ctx.lineCap = 'round';
    ctx.lineWidth = radius;
    ctx.strokeStyle = `hsla(${hue},100%,60%,${fadeInOut(life, ttl)})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function updateParticle(i) {
    let x = particles[i], y = particles[i+1];
    const n = noise3D(x * X_OFF, y * Y_OFF, tick * Z_OFF) * NOISE_STEPS * TAU;
    const vx = lerp(particles[i+2], Math.cos(n), 0.5);
    const vy = lerp(particles[i+3], Math.sin(n), 0.5);
    let life = particles[i+4];
    const ttl = particles[i+5], speed = particles[i+6], radius = particles[i+7], hue = particles[i+8];
    const x2 = x + vx * speed, y2 = y + vy * speed;

    drawParticle(x, y, x2, y2, life, ttl, radius, hue);
    life++;
    particles[i] = x2; particles[i+1] = y2;
    particles[i+2] = vx; particles[i+3] = vy;
    particles[i+4] = life;

    if (x2 > canvas.width || x2 < 0 || y2 > canvas.height || y2 < 0 || life > ttl) initParticle(i);
  }

  function frame() {
    tick++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < PROPS_LEN; i += PROP_COUNT) updateParticle(i);

    // Glow pass (single pass instead of 3)
    ctx.save();
    ctx.filter = 'blur(6px) brightness(180%)';
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();

    animId = requestAnimationFrame(frame);
  }

  resize();
  initAll();
  frame();
  window.addEventListener('resize', () => { resize(); });
})();
