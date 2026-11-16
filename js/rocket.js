// Empyrean Intelligence - destination band: a rocket climbing past one ceiling after another.
// Canvas 2D, zero dependencies. One static frame under prefers-reduced-motion; paused while off-screen.

(function () {
  'use strict';

  var canvas = document.querySelector('[data-rocket]');
  if (!canvas || !canvas.getContext) return;
  var band = canvas.parentElement;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // the same palette as the orbit in the hero
  var STAR = '233,230,223', TEAL = '79,179,172', VIOLET = '178,170,246', GOLD = '227,184,102', ROSE = '232,142,156';

  var W = 0, H = 0, dpr = 1, narrow = false;
  var stars = [], sparks = [], ceilings = [];
  var t = 0, last = 0, running = false, visible = true, spawnClock = 0.6;
  var rx = 0, ry = 0, scale = 1;
  var SPEED = 70;   // px per second the world falls past the rocket

  function resize() {
    var rect = band.getBoundingClientRect();
    W = Math.max(1, rect.width); H = Math.max(1, rect.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    narrow = W < 720;
    rx = narrow ? W * 0.5 : W * 0.7;
    ry = narrow ? H * 0.34 : H * 0.42;
    scale = Math.max(0.75, Math.min(1.5, Math.min(W, H) / 420));
    var n = Math.min(320, Math.round(W * H / 3600));
    stars = [];
    for (var i = 0; i < n; i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H, d: 0.2 + Math.random() * 0.8,
                   r: Math.random() < 0.1 ? 1.4 : 0.8, ph: Math.random() * 6.283 });
    }
    if (reduce) {
      // the still frame: the rocket just above a ceiling it has passed, the next one ahead of it
      ceilings = [{ y: ry + 90 * scale, crossed: true, glow: 0.35 }, { y: ry - 150 * scale, crossed: false, glow: 0 }];
    }
    if (reduce || !running) draw();
  }

  function update(dt) {
    t += dt;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.y += dt * SPEED * (0.25 + s.d * 1.1);
      if (s.y > H + 2) { s.y = -2; s.x = Math.random() * W; }
    }
    spawnClock -= dt;
    if (spawnClock <= 0) {
      spawnClock = 5.5;
      ceilings.push({ y: -10, crossed: false, glow: 0 });
    }
    for (var j = ceilings.length - 1; j >= 0; j--) {
      var c = ceilings[j];
      c.y += dt * SPEED * 1.2;
      if (!c.crossed && c.y > ry - 46 * scale) {
        c.crossed = true; c.glow = 1;
        for (var k = 0; k < 26; k++) {
          sparks.push({ x: rx + (Math.random() - 0.5) * 120 * scale, y: c.y, vx: (Math.random() - 0.5) * 60,
                        vy: 20 + Math.random() * 50, life: 1, rgb: Math.random() < 0.5 ? TEAL : VIOLET });
        }
      }
      c.glow = Math.max(0, c.glow - dt * 0.6);
      if (c.y > H + 20) ceilings.splice(j, 1);
    }
    // exhaust
    if (sparks.length < 260) {
      for (var e = 0; e < 3; e++) {
        sparks.push({ x: rx + (Math.random() - 0.5) * 8 * scale, y: ry + 36 * scale, vx: (Math.random() - 0.5) * 30,
                      vy: 90 + Math.random() * 80, life: 1, rgb: Math.random() < 0.6 ? GOLD : ROSE });
      }
    }
    for (var m = sparks.length - 1; m >= 0; m--) {
      var p = sparks[m];
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 1.3;
      if (p.life <= 0) sparks.splice(m, 1);
    }
  }

  function drawStars() {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var a = 0.2 + 0.6 * s.d * (0.7 + 0.3 * Math.sin(t * (0.5 + s.d) + s.ph));
      ctx.fillStyle = 'rgba(' + STAR + ',' + a.toFixed(3) + ')';
      ctx.fillRect(s.x, s.y, s.r, s.r * (reduce ? 1 : 1 + s.d * 2.2));   // a little streak: speed
    }
  }

  function drawCeilings() {
    ctx.save();
    ctx.font = '500 11px "JetBrains Mono", ui-monospace, monospace';
    ctx.textBaseline = 'bottom';
    for (var i = 0; i < ceilings.length; i++) {
      var c = ceilings[i];
      var a = c.crossed ? 0.22 + 0.5 * c.glow : 0.5;
      ctx.strokeStyle = 'rgba(' + (c.crossed ? TEAL : STAR) + ',' + a.toFixed(3) + ')';
      ctx.lineWidth = 1 + c.glow * 1.5;
      ctx.setLineDash([6, 7]);
      ctx.beginPath(); ctx.moveTo(0, c.y); ctx.lineTo(W, c.y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(' + STAR + ',' + (c.crossed ? 0.28 : 0.55).toFixed(2) + ')';
      // labels sit beside the rocket on wide screens, away from the statement on the left
      ctx.fillText(c.crossed ? 'ceiling, passed' : 'ceiling', narrow ? 16 : Math.max(W * 0.5, rx - 190 * scale), c.y - 6);
    }
    ctx.restore();
  }

  function drawSparks() {
    for (var i = 0; i < sparks.length; i++) {
      var p = sparks[i];
      ctx.fillStyle = 'rgba(' + p.rgb + ',' + Math.max(0, p.life * 0.9).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.6 * scale * (0.4 + p.life), 0, 6.283); ctx.fill();
    }
  }

  function drawRocket() {
    var sway = reduce ? 0 : Math.sin(t * 1.3) * 0.035;
    var bob = reduce ? 0 : Math.sin(t * 2.1) * 3;
    ctx.save();
    ctx.translate(rx, ry + bob);
    ctx.rotate(sway);
    ctx.scale(scale, scale);
    // flame
    var len = 34 + (reduce ? 6 : Math.sin(t * 23) * 5 + Math.sin(t * 37) * 3);
    var g = ctx.createLinearGradient(0, 34, 0, 34 + len);
    g.addColorStop(0, 'rgba(' + GOLD + ',0.95)'); g.addColorStop(0.5, 'rgba(' + ROSE + ',0.6)'); g.addColorStop(1, 'rgba(' + ROSE + ',0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-7, 34); ctx.quadraticCurveTo(0, 34 + len * 1.15, 7, 34); ctx.closePath(); ctx.fill();
    // fins
    ctx.fillStyle = 'rgba(' + TEAL + ',0.95)';
    ctx.beginPath(); ctx.moveTo(-11, 8); ctx.lineTo(-24, 32); ctx.lineTo(-11, 28); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(11, 8); ctx.lineTo(24, 32); ctx.lineTo(11, 28); ctx.closePath(); ctx.fill();
    // body and nose
    ctx.fillStyle = '#E9E6DF';
    ctx.beginPath();
    ctx.moveTo(-11, 28); ctx.lineTo(-11, -18);
    ctx.quadraticCurveTo(-11, -42, 0, -56); ctx.quadraticCurveTo(11, -42, 11, -18);
    ctx.lineTo(11, 28); ctx.closePath(); ctx.fill();
    // nozzle
    ctx.fillStyle = '#8F949B';
    ctx.fillRect(-7, 28, 14, 6);
    // window
    ctx.fillStyle = 'rgba(' + VIOLET + ',1)';
    ctx.beginPath(); ctx.arc(0, -10, 6, 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#07090C'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawStars();
    drawCeilings();
    drawSparks();
    drawRocket();
  }

  function frame(now) {
    if (!running) return;
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
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

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', function () { setRunning(!document.hidden && visible); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      setRunning(visible && !document.hidden);
    }, { threshold: 0.05 }).observe(band);
  }
  resize();
  if (reduce) draw(); else setRunning(true);
})();
