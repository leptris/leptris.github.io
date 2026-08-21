// leptris.github.io — reveals, count-ups, bar growth. No dependencies.
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Section reveals
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  // Benchmark bars: grow to their data-w percentage when visible
  var bio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll(".bar-fill").forEach(function (bar, i) {
        var w = bar.getAttribute("data-w") || "0";
        setTimeout(function () { bar.style.width = w + "%"; }, reduced ? 0 : i * 120);
      });
      bio.unobserve(e.target);
    });
  }, { threshold: 0.35 });
  document.querySelectorAll(".bench-block").forEach(function (el) { bio.observe(el); });

  // Stat count-ups (skip the literal "zero")
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var suffix = el.getAttribute("data-suffix") || "";
    var raw = el.getAttribute("data-raw");
    if (raw !== null) { el.textContent = raw; return; }
    if (reduced) {
      el.textContent = (target % 1 === 0 ? target.toFixed(0) : target.toFixed(1)) + suffix;
      return;
    }
    var t0 = null, dur = 1100;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      var v = target * ease;
      el.textContent = (target % 1 === 0 ? v.toFixed(0) : v.toFixed(1)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      countUp(e.target);
      cio.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach(function (el) { cio.observe(el); });
})();
