/* ==========================================================================
   SHANANA COFFEE — Global behaviour
   Navigation, header state, scroll reveals, tasting profile, config-driven
   content (contact details, social links, impact metrics).
   ========================================================================== */
(function () {
  "use strict";
  var CONFIG = window.SHANANA_CONFIG || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---- Header + mobile navigation ------------------------------------- */
  function initNav() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("primary-nav");
    if (header) {
      var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    if (!toggle || !nav) return;
    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      if (open) { var first = nav.querySelector("a"); if (first) first.focus(); }
    }
    toggle.addEventListener("click", function () { setOpen(toggle.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    window.matchMedia("(min-width: 1081px)").addEventListener("change", function (m) { if (m.matches) setOpen(false); });
  }

  /* ---- Scroll-triggered reveals --------------------------------------- */
  function initReveal() {
    var els = $all(".reveal, .reveal-group");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Tasting profile (tabs + rings) --------------------------------- */
  function initTasting() {
    $all("[data-tasting]").forEach(function (root) {
      var tabs = $all('[role="tab"]', root);
      function select(tab, focus) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute("aria-selected", String(on));
          t.tabIndex = on ? 0 : -1;
          var panel = document.getElementById(t.getAttribute("aria-controls"));
          if (panel) panel.hidden = !on;
        });
        var tier = tab.getAttribute("data-tier");
        $all("[data-ring]", root).forEach(function (r) { r.classList.toggle("is-active", r.getAttribute("data-ring") === tier); });
        if (focus) tab.focus();
      }
      tabs.forEach(function (t, i) {
        t.addEventListener("click", function () { select(t); });
        t.addEventListener("keydown", function (e) {
          var d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
          if (e.key === "Home") { e.preventDefault(); select(tabs[0], true); }
          else if (e.key === "End") { e.preventDefault(); select(tabs[tabs.length - 1], true); }
          else if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
        });
      });
      // rings are also clickable/hoverable
      $all("[data-ring-hit]", root).forEach(function (hit) {
        var tab = tabs.filter(function (t) { return t.getAttribute("data-tier") === hit.getAttribute("data-ring-hit"); })[0];
        hit.addEventListener("click", function () { select(tab); });
        hit.addEventListener("mouseenter", function () { if (window.matchMedia("(hover: hover)").matches) select(tab); });
      });
      if (tabs[0]) select(tabs[0]);
    });
  }

  /* ---- Config-driven contact details ---------------------------------- */
  function initContact() {
    var c = CONFIG.contact || {};
    $all("[data-contact]").forEach(function (el) {
      var key = el.getAttribute("data-contact"), v = c[key];
      if (!v) { el.innerHTML = '<span class="pill pill--pending">To be published</span>'; return; }
      if (/email/i.test(key)) el.innerHTML = '<a href="mailto:' + esc(v) + '">' + esc(v) + "</a>";
      else if (/phone/i.test(key)) el.innerHTML = '<a href="tel:' + esc(v.replace(/[^+\d]/g, "")) + '">' + esc(v) + "</a>";
      else el.textContent = v;
    });
    var s = CONFIG.social || {};
    var names = { instagram: "Instagram", linkedin: "LinkedIn", facebook: "Facebook", x: "X" };
    var links = Object.keys(names).filter(function (k) { return s[k]; }).map(function (k) {
      return '<li><a href="' + esc(s[k]) + '" rel="noopener" target="_blank">' + names[k] + "</a></li>";
    }).join("");
    $all("[data-social]").forEach(function (el) {
      el.innerHTML = links || '<li><span class="pill pill--pending">Profiles launching soon</span></li>';
    });
  }

  /* ---- Impact metrics (verified data only) ---------------------------- */
  function initMetrics() {
    var wrap = document.querySelector("[data-metrics]");
    if (!wrap) return;
    wrap.innerHTML = (CONFIG.impactMetrics || []).map(function (m) {
      var has = m.value !== null && m.value !== undefined && m.value !== "";
      return '<div class="metric">' +
        (has ? '<div class="metric__value">' + esc(m.value) + "</div>"
             : '<div class="metric__value metric__value--pending">Reporting in progress</div>') +
        '<div class="metric__label">' + esc(m.label) + "</div>" +
        (has && m.source ? '<div class="metric__source">Source: ' + esc(m.source) + "</div>" : "") +
        "</div>";
    }).join("");
  }

  /* ---- Hero orbit: tasting notes around the bag ---- */
  function initOrbit() {
    var nodes = $all("[data-orbit]");
    if (!nodes.length) return;
    var title = document.querySelector("[data-orbit-title]"), notes = document.querySelector("[data-orbit-notes]");
    function pick(n) {
      nodes.forEach(function (x) { x.setAttribute("aria-pressed", String(x === n)); });
      title.textContent = n.getAttribute("data-title");
      notes.textContent = n.getAttribute("data-notes");
    }
    nodes.forEach(function (n) { n.addEventListener("click", function () { pick(n); }); });
    pick(nodes[0]);
  }

  function initYear() { $all("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); }); }

  /* ---- Installable / offline: register the service worker (needs HTTPS or localhost) ---- */
  function initOffline() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }

  function init() {
    initOffline(); initNav(); initReveal(); initTasting(); initOrbit(); initContact(); initMetrics(); initYear();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
