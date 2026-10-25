// Empyrean Intelligence - hero orbit: the five problems circling the destination.
// Canvas 2D, zero dependencies. One static frame under prefers-reduced-motion.

(function () {
  'use strict';

  var canvas = document.querySelector('[data-orbit]');
  if (!canvas || !canvas.getContext) return;
  var hero = canvas.parentElement;
  var tip = hero.querySelector('.orbit-tip');
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var RGB = { sun: '255,232,190', teal: '79,179,172', sky: '122,176,236', gold: '227,184,102',
              violet: '178,170,246', rose: '232,142,156', star: '233,230,223' };
  var TILT = 0.4;         // vertical squash of every orbit: the plane is seen from above (set per width in resize)
  var narrow = false;
  var FRONTIER = 0.69;    // dashed ring: the limit of human checking
  var SPIN = 0.05;        // the whole system turns together, so the bodies keep their spacing

  // inner to outer. `slot` spreads them around the circle: neighbouring orbits sit 144 degrees apart
  var bodies = [
    { key: 'verify', name: 'Verification', short: 'Verification', role: 'the engine',
      status: 'The engine: checks that cannot be fooled. Shipped tools and audits.',
      rgb: RGB.teal, orbit: 0.22, size: 6, slot: 0 },
    { key: 'sample', name: 'Sample efficiency', short: 'Efficiency', role: 'more from every attempt',
      status: 'More learned from each verified attempt: research',
      rgb: RGB.sky, orbit: 0.40, size: 7, slot: 2 },
    { key: 'continual', name: 'Continual learning', short: 'Continual', role: 'keeps what it learns',
      status: 'Keeps every verified gain: research, three null results so far',
      rgb: RGB.gold, orbit: 0.57, size: 8.5, slot: 4 },
    { key: 'experience', name: 'Experiential learning', short: 'Experience', role: 'teaches itself',
      status: 'Teaches itself past the human frontier: built, first run pending',
      rgb: RGB.violet, orbit: 0.79, size: 10, slot: 1 },
    { key: 'rsi', name: 'Recursive self-improvement', short: 'RSI', role: 'improves the learner',
      status: 'The loop improves the learner itself: research',
      rgb: RGB.rose, orbit: 1.0, size: 11, slot: 3 }
  ];
  bodies.forEach(function (b, i) {
    b.phase = b.slot * 6.2832 / 5 + 0.5; b.wob = i * 1.7;
    b.flash = 0; b.acc = 0; b.x = 0; b.y = 0; b.z = 0; b.s = b.size; b.la = 0; b.ang = 0;
  });

  var W = 0, H = 0, cx = 0, cy = 0, R = 0, dpr = 1, lastDt = 0;
  var stars = [], particles = [], pulses = [];
  var t = 0, last = 0, pulseClock = 1.5, running = false, visible = true;
  var mx = -1, my = -1, px = 0.5, py = 0.5, hovered = null;

  function resize() {
    var rect = hero.getBoundingClientRect();
    W = Math.max(1, rect.width); H = Math.max(1, rect.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    narrow = W < 560;
    TILT = narrow ? 0.62 : 0.4;
    // the system fills the hero; the bottom band is left for the legend the stylesheet places there
    cx = W * 0.5;
    cy = H * (narrow ? 0.42 : 0.44);
    R = Math.min(W * (narrow ? 0.56 : 0.43), H * 0.34 / TILT);
    var n = Math.min(420, Math.round(W * H / 3200));
    stars = [];
    for (var i = 0; i < n; i++) {
      stars.push({ x: Math.random(), y: Math.random(), d: 0.2 + Math.random() * 0.8,
                   r: Math.random() < 0.08 ? 1.3 : 0.7, ph: Math.random() * 6.283 });
    }
    if (reduce || !running) draw();
  }

  function project(orbitFrac, angle) {
    return { x: cx + Math.cos(angle) * orbitFrac * R, y: cy + Math.sin(angle) * orbitFrac * R * TILT, z: Math.sin(angle) };
  }

  function update(dt) {
    t += dt; lastDt = dt;
    bodies.forEach(function (b) {
      // shared spin plus a small sway of its own: alive, but never bunched
      b.ang = b.phase + t * SPIN + 0.14 * Math.sin(t * 0.23 + b.wob);
      var p = project(b.orbit, b.ang);
      b.x = p.x; b.y = p.y; b.z = p.z; b.s = b.size * Math.max(0.8, R / 420) * (1 + 0.2 * p.z);
      b.flash = Math.max(0, b.flash - dt * 0.9);
      b.acc += dt * 3.2;
      while (b.acc >= 1 && particles.length < 420) {
        b.acc -= 1;
        particles.push({ a: b.ang + (Math.random() - 0.5) * 0.1,
                         r: b.orbit + (Math.random() - 0.5) * 0.06, rgb: b.rgb, w: 0.35 + Math.random() * 0.7,
                         v: 0.6 + Math.random() * 0.8 });
      }
    });
    for (var i = particles.length - 1; i >= 0; i--) {
      var q = particles[i];
      q.r -= dt * 0.045 * q.v * (0.35 + q.r);
      q.a += dt * (SPIN + 0.05 / Math.max(q.r, 0.1));
      if (q.r < 0.05) particles.splice(i, 1);
    }
    pulseClock -= dt;
    if (pulseClock <= 0) {
      pulseClock = 4.2;
      pulses.push({ x: bodies[0].x, y: bodies[0].y, rad: 0, hit: {} });
    }
    for (var j = pulses.length - 1; j >= 0; j--) {
      var pu = pulses[j];
      pu.rad += dt * R * 0.55;
      for (var k = 1; k < bodies.length; k++) {
        var b2 = bodies[k];
        if (!pu.hit[b2.key] && Math.hypot(b2.x - pu.x, b2.y - pu.y) < pu.rad) { pu.hit[b2.key] = true; b2.flash = 1; }
      }
      if (pu.rad > R * 2.2) pulses.splice(j, 1);
    }
  }

  function drawStars() {
    var ox = (px - 0.5) * 26, oy = (py - 0.5) * 18;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var a = 0.25 + 0.55 * s.d * (0.65 + 0.35 * Math.sin(t * (0.6 + s.d) + s.ph));
      ctx.fillStyle = 'rgba(' + RGB.star + ',' + a.toFixed(3) + ')';
      ctx.fillRect(s.x * W + ox * s.d, s.y * H + oy * s.d, s.r, s.r);
    }
  }

  function drawOrbits() {
    ctx.lineWidth = 1;
    bodies.forEach(function (b) {
      ctx.strokeStyle = 'rgba(' + RGB.star + ',' + (hovered === b ? 0.34 : 0.09) + ')';
      ctx.beginPath(); ctx.ellipse(cx, cy, b.orbit * R, b.orbit * R * TILT, 0, 0, 6.2832); ctx.stroke();
    });
    ctx.save();
    ctx.setLineDash([3, 7]);
    ctx.strokeStyle = 'rgba(' + RGB.star + ',0.2)';
    ctx.beginPath(); ctx.ellipse(cx, cy, FRONTIER * R, FRONTIER * R * TILT, 0, 0, 6.2832); ctx.stroke();
    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < particles.length; i++) {
      // each mote is a short streak along its inward spiral, brightening as it nears the centre
      var q = particles[i], p = project(q.r, q.a), back = project(q.r + 0.025, q.a - 0.04 / Math.max(q.r, 0.1));
      var a = Math.min(1, q.r * 4) * (0.16 + 0.26 * (1 - q.r));
      ctx.strokeStyle = 'rgba(' + q.rgb + ',' + a.toFixed(3) + ')';
      ctx.lineWidth = q.w * (R / 320) + 0.4;
      ctx.beginPath(); ctx.moveTo(back.x, back.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    }
    ctx.restore();
  }

  function drawPulses() {
    pulses.forEach(function (pu) {
      var a = Math.max(0, 0.32 * (1 - pu.rad / (R * 2.2)));
      ctx.strokeStyle = 'rgba(' + RGB.teal + ',' + a.toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(pu.x, pu.y, pu.rad, pu.rad * TILT * 1.4, 0, 0, 6.2832); ctx.stroke();
    });
  }

  function drawSun() {
    var breathe = 1 + 0.06 * Math.sin(t * 0.9);
    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.3 * breathe);
    g.addColorStop(0, 'rgba(' + RGB.sun + ',0.95)');
    g.addColorStop(0.13, 'rgba(' + RGB.sun + ',0.5)');
    g.addColorStop(0.38, 'rgba(240,190,120,0.13)');
    g.addColorStop(1, 'rgba(240,190,120,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.3 * breathe, 0, 6.2832); ctx.fill();
    ctx.fillStyle = 'rgba(255,248,232,1)';
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.036, 0, 6.2832); ctx.fill();
  }

  function drawBody(b) {
    // trail along the orbit
    for (var k = 1; k <= 14; k++) {
      var p = project(b.orbit, b.ang - k * 0.012);
      ctx.fillStyle = 'rgba(' + b.rgb + ',' + (0.24 * (1 - k / 15)).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, b.s * 0.3 * (1 - k / 18), 0, 6.2832); ctx.fill();
    }
    var halo = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.s * (3.2 + b.flash * 2));
    halo.addColorStop(0, 'rgba(' + b.rgb + ',' + (0.3 + b.flash * 0.35).toFixed(3) + ')');
    halo.addColorStop(1, 'rgba(' + b.rgb + ',0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.s * (3.2 + b.flash * 2), 0, 6.2832); ctx.fill();
    if (b.key === 'continual') {
      var rings = reduce ? 3 : Math.min(4, 1 + Math.floor(t / 6));
      ctx.lineWidth = 1;
      for (var i = 0; i < rings; i++) {
        ctx.strokeStyle = 'rgba(' + b.rgb + ',' + (0.42 - i * 0.07).toFixed(3) + ')';
        ctx.beginPath(); ctx.ellipse(b.x, b.y, b.s * (1.7 + i * 0.5), b.s * (1.7 + i * 0.5) * 0.3, -0.25, 0, 6.2832); ctx.stroke();
      }
    }
    var dx = cx - b.x, dy = cy - b.y, dl = Math.hypot(dx, dy) || 1;
    var lx = b.x + dx / dl * b.s * 0.45, ly = b.y + dy / dl * b.s * 0.45;
    var g = ctx.createRadialGradient(lx, ly, b.s * 0.1, b.x, b.y, b.s);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.35, 'rgba(' + b.rgb + ',1)');
    g.addColorStop(1, 'rgba(12,14,20,1)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.s, 0, 6.2832); ctx.fill();
    if (b.flash > 0) {
      var c = b.s * 0.9, x0 = b.x + b.s * 1.4, y0 = b.y - b.s * 1.6;
      ctx.strokeStyle = 'rgba(' + RGB.teal + ',' + b.flash.toFixed(3) + ')';
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + c * 0.4, y0 + c * 0.4); ctx.lineTo(x0 + c * 1.1, y0 - c * 0.5); ctx.stroke();
    }
  }

  function label(text, x, y, alpha, align, size) {
    ctx.font = '500 ' + size + 'px "JetBrains Mono", ui-monospace, monospace';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0.16em';
    ctx.textAlign = align;
    ctx.fillStyle = 'rgba(' + RGB.star + ',' + alpha + ')';
    ctx.fillText(text, x, y);
  }

  // second line under a name: what the body is for, in the page's serif
  function subLabel(text, x, y, alpha, size) {
    ctx.font = 'italic 400 ' + size + 'px "Newsreader", Georgia, serif';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(' + RGB.star + ',' + alpha + ')';
    ctx.fillText(text, x, y);
  }

  function labelBox(text, x, y, size, sub) {
    ctx.font = '500 ' + size + 'px "JetBrains Mono", ui-monospace, monospace';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0.16em';
    var w = ctx.measureText(text).width;
    if (sub) {
      ctx.font = 'italic 400 ' + (size + 3) + 'px "Newsreader", Georgia, serif';
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      w = Math.max(w, ctx.measureText(sub).width);
    }
    return { l: x - w / 2 - 14, r: x + w / 2 + 14, t: y - size - 10, b: y + (sub ? size + 12 : 0) + 10 };
  }

  function clashes(box, boxes) {
    for (var i = 0; i < boxes.length; i++) {
      var o = boxes[i];
      if (box.l < o.r && box.r > o.l && box.t < o.b && box.b > o.t) return true;
    }
    return false;
  }

  // Labels are placed last. The sun's name always shows; a planet's name fades out while it would touch
  // another label or the screen edge, and fades back once the orbits carry them apart. Nothing is ever stacked.
  function drawLabels() {
    var boxes = [];
    var sunSize = narrow ? 11 : 13, sunY = cy + R * 0.036 + 28, sunSub = 'where all five point';
    boxes.push(labelBox('SUPERINTELLIGENCE', cx, sunY, sunSize, sunSub));
    label('SUPERINTELLIGENCE', cx, sunY, hovered === 'sun' ? 1 : 0.92, 'center', sunSize);
    subLabel(sunSub, cx, sunY + sunSize + 8, 0.55, sunSize + 2);
    var front = bodies.slice().sort(function (a, b) { return (hovered === b) - (hovered === a) || b.z - a.z; });
    front.forEach(function (b) {
      var text = (narrow ? b.short : b.name).toUpperCase(), size = narrow ? 9 : 10;
      var sub = narrow ? '' : b.role;
      var ly = b.y + b.s + 22, box = labelBox(text, b.x, ly, size, sub);
      var blocked = clashes(box, boxes) || box.l < 8 || box.r > W - 8 || box.b > H - 8;
      var target = hovered === b ? 1 : (blocked ? 0 : 0.75);
      b.la = reduce ? target : b.la + (target - b.la) * Math.min(1, lastDt * 4);
      if (target > 0) boxes.push(box);
      if (b.la > 0.02) {
        label(text, b.x, ly, b.la.toFixed(3), 'center', size);
        if (sub) subLabel(sub, b.x, ly + size + 7, (b.la * 0.7).toFixed(3), size + 3);
      }
    });
    if (!narrow) {
      var fx = cx + FRONTIER * R, fy = cy + 4;
      var fb = labelBox('LIMIT OF HUMAN CHECKING', fx, fy, 9);
      if (!clashes(fb, boxes) && fb.r < W - 8) label('LIMIT OF HUMAN CHECKING', fx, fy, 0.4, 'center', 9);
    }
  }

  function draw() {
    if (reduce) update(0);
    ctx.clearRect(0, 0, W, H);
    drawStars();
    drawOrbits();
    drawParticles();
    drawPulses();
    var order = bodies.slice().sort(function (a, b) { return a.z - b.z; });
    order.forEach(function (b) { if (b.z < 0) drawBody(b); });
    drawSun();
    order.forEach(function (b) { if (b.z >= 0) drawBody(b); });
    drawLabels();
  }

  function frame(now) {
    if (!running) return;
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  function setRunning(on) {
    if (reduce) return;
    if (on && !running) { running = true; last = 0; requestAnimationFrame(frame); }
    if (!on) running = false;
  }

  function hitTest() {
    if (mx < 0) return null;
    for (var i = bodies.length - 1; i >= 0; i--) {
      var b = bodies[i];
      if (Math.hypot(mx - b.x, my - b.y) < b.s + 16) return b;
    }
    if (Math.hypot(mx - cx, my - cy) < R * 0.07 + 12) return 'sun';
    return null;
  }

  hero.addEventListener('pointermove', function (e) {
    var rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left; my = e.clientY - rect.top;
    px = mx / W; py = my / H;
    hovered = hitTest();
    hero.style.cursor = hovered ? 'pointer' : '';
    if (tip) {
      if (hovered) {
        var name = hovered === 'sun' ? 'Superintelligence' : hovered.name;
        var status = hovered === 'sun' ? 'Where all five point' : hovered.status;
        tip.innerHTML = '<strong></strong><span></span>';
        tip.firstChild.textContent = name; tip.lastChild.textContent = status;
        tip.style.left = Math.min(W - 260, mx + 18) + 'px';
        tip.style.top = Math.max(8, my - 12) + 'px';
        tip.hidden = false;
      } else {
        tip.hidden = true;
      }
    }
    if (reduce) draw();
  });
  hero.addEventListener('pointerleave', function () {
    mx = my = -1; hovered = null; hero.style.cursor = '';
    if (tip) tip.hidden = true;
    if (reduce) draw();
  });
  hero.addEventListener('click', function (e) {
    if (!hovered || e.target.closest('a, button')) return;
    var target = document.getElementById('work');
    if (target) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      setRunning(visible && !document.hidden);
    }).observe(hero);
  }
  document.addEventListener('visibilitychange', function () { setRunning(visible && !document.hidden); });
  window.addEventListener('resize', resize);

  resize();
  // pre-run 12 simulated seconds so the inward streams are already flowing on first paint
  for (var w = 0; w < 360; w++) update(1 / 30);
  setRunning(true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!running) draw(); });
})();
