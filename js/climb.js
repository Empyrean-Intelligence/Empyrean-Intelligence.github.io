// The self-taught climb on the homepage: press to run.
// Numbers: experience_frontier_free_t4_v1 (seed 0) -- 15 -> 44 of 280 unseen problems from its own exactly-checked
// attempts; the same training with a coin-flip reward ended at 0. Only measured endpoints are drawn (before, after).
// Without JS the final chart shows; with JS it starts at "before" and draws on press. Zero dependencies.
(function () {
  'use strict';

  var fig = document.querySelector('[data-climb]');
  if (!fig) return;
  var btn = fig.querySelector('[data-climb-run]');
  var line = fig.querySelector('[data-climb-line]');
  var paths = fig.querySelectorAll('.climb-path');
  var counters = fig.querySelectorAll('[data-count-from]');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DURATION = 1600;
  var raf = null;
  var timer = null;

  for (var i = 0; i < paths.length; i++) {
    paths[i].style.setProperty('--len', String(Math.ceil(paths[i].getTotalLength())));
  }

  function setCounters(t) {
    for (var j = 0; j < counters.length; j++) {
      var a = Number(counters[j].getAttribute('data-count-from'));
      var b = Number(counters[j].getAttribute('data-count-to'));
      counters[j].textContent = String(Math.round(a + (b - a) * t));
    }
  }

  function reset() {
    if (raf) cancelAnimationFrame(raf);
    if (timer) clearTimeout(timer);
    fig.classList.remove('climb--ran');
    line.classList.remove('is-on');
    setCounters(0);
  }

  function done() {
    line.classList.add('is-on');
    btn.textContent = btn.getAttribute('data-again') || 'Again';
  }

  function run() {
    reset();
    void fig.getBoundingClientRect();   // let the reset land before the transition starts
    fig.classList.add('climb--ran');
    if (reduce) {
      setCounters(1);
      done();
      return;
    }
    var t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var t = Math.min(1, (ts - t0) / DURATION);
      setCounters(1 - Math.pow(1 - t, 3));
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        timer = setTimeout(done, 250);
      }
    }
    raf = requestAnimationFrame(step);
  }

  fig.classList.add('climb--ready');
  setCounters(0);
  btn.hidden = false;
  btn.addEventListener('click', run);
})();
