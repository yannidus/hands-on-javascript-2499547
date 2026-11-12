/* ==========================================================================
   SHANANA COFFEE — 360° product viewer + product (size) selection
   --------------------------------------------------------------------------
   Two render modes:
     • "render" — CSS 3D bag built from the configured front artwork
                  (used until real 360° photography is supplied)
     • "frames" — real photo sequence (config.media.frames), angle → frame
   Input: mouse drag, touch swipe, keyboard arrows, view thumbnails,
          auto-rotate with pause/resume. Honors prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  var CONFIG = window.SHANANA_CONFIG || {};
  var MEDIA = CONFIG.media || {};
  var CATALOG = window.SHANANA_CATALOG || { products: [] };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var VIEWS = [
    { id: "front", label: "Front", angle: 0 },
    { id: "three-quarter", label: "Three-quarter", angle: 45 },
    { id: "profile", label: "Side", angle: 90 },
    { id: "rear", label: "Rear", angle: 180 }
  ];
  var LIGHT = -25; // degrees — key light from front-left
  var AUTO_SPEED = 16; // degrees per second

  function norm(a) { a = a % 360; return a < 0 ? a + 360 : a; }
  function shortest(from, to) { var d = norm(to - from); return d > 180 ? d - 360 : d; }
  function rad(d) { return d * Math.PI / 180; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ------------------------------------------------------------------ */
  function Viewer(root) {
    this.root = root;
    this.stage = root.querySelector(".viewer__stage");
    this.frames = Array.isArray(MEDIA.frames) ? MEDIA.frames.filter(Boolean) : [];
    this.mode = this.frames.length ? "frames" : "render";
    var start = parseFloat(root.getAttribute("data-start-angle"));
    this.angle = isNaN(start) ? -28 : start;
    this.velocity = 0;
    this.playing = root.getAttribute("data-autoplay") !== "false" && !reduceMotion;
    this.userPaused = !this.playing;
    this.visible = true;
    this.tween = null;
    this.last = 0;
    this.build();
    this.bind();
    this.render();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  Viewer.prototype.build = function () {
    var front = esc(MEDIA.frontImage || "assets/img/products/bag-front-placeholder.svg");
    if (this.mode === "frames") {
      this.stage.innerHTML =
        '<div class="viewer__frames"><img class="is-base" alt="Shanana Coffee bag" decoding="async" src="' + esc(this.frames[0]) + '"><img class="is-over" alt="" aria-hidden="true" decoding="async" src="' + esc(this.frames[1 % this.frames.length]) + '"></div>';
      this.frameBase = this.stage.querySelector(".is-base");
      this.frameOver = this.stage.querySelector(".is-over");
      // warm the cache so rotation is smooth
      this.frames.forEach(function (src) { var i = new Image(); i.decoding = "async"; i.src = src; });
    } else {
      this.stage.innerHTML =
        '<div class="bag" aria-hidden="true">' +
          '<div class="bag__face bag__front"><img src="' + front + '" alt="" width="600" height="840" decoding="async"><div class="bag__gloss"></div></div>' +
          '<div class="bag__face bag__right"><div class="bag__side-mark"><span>SHANANA</span></div></div>' +
          '<div class="bag__face bag__back"><div class="bag__back-note">' +
            (MEDIA.isPlaceholder ? "Rear panel<br>photography pending" : "") + '</div></div>' +
          '<div class="bag__face bag__left"><div class="bag__side-mark"><span>COFFEE</span></div></div>' +
          '<div class="bag__top"></div>' +
        '</div>' +
        '<div class="viewer__shadow" aria-hidden="true"></div>';
      this.bag = this.stage.querySelector(".bag");
      this.faces = {
        front: { el: this.stage.querySelector(".bag__front"), n: 0 },
        right: { el: this.stage.querySelector(".bag__right"), n: 90 },
        back: { el: this.stage.querySelector(".bag__back"), n: 180 },
        left: { el: this.stage.querySelector(".bag__left"), n: 270 }
      };
      this.shadow = this.stage.querySelector(".viewer__shadow");
    }

    var label = this.root.querySelector("[data-viewer-label]");
    if (label) label.hidden = !(MEDIA.isPlaceholder && this.mode === "render");

    // Thumbnails
    var thumbs = this.root.querySelector(".view-thumbs");
    var framesRef = this.frames;
    if (thumbs && this.mode === "frames") {
      thumbs.innerHTML = VIEWS.map(function (v) {
        var src = framesRef[Math.round(norm(v.angle) / 360 * framesRef.length) % framesRef.length];
        return '<button type="button" class="view-thumb view-thumb--photo" data-view="' + v.id + '" aria-pressed="false" aria-label="' + v.label + ' view">' +
          '<img src="' + esc(src) + '" alt="" loading="lazy" decoding="async"></button>';
      }).join("");
      this.thumbs = Array.prototype.slice.call(thumbs.querySelectorAll(".view-thumb"));
    } else if (thumbs) {
      thumbs.innerHTML = VIEWS.map(function (v) {
        var cls = "view-thumb__bag" + (v.id === "profile" ? " view-thumb__bag--narrow" : "") + (v.id === "rear" ? " view-thumb__bag--back" : "");
        var tilt = v.id === "three-quarter" ? ' style="transform:rotateY(-32deg)"' : "";
        return '<button type="button" class="view-thumb" data-view="' + v.id + '" aria-pressed="false" aria-label="' + v.label + ' view">' +
          '<span class="' + cls + '"' + tilt + '><img src="' + front + '" alt="" loading="lazy" decoding="async"></span></button>';
      }).join("");
      this.thumbs = Array.prototype.slice.call(thumbs.querySelectorAll(".view-thumb"));
    }
    this.toggle = this.root.querySelector("[data-viewer-toggle]");
    this.syncToggle();
  };

  Viewer.prototype.bind = function () {
    var self = this;
    var dragging = false, lastX = 0, lastT = 0, startX = 0, startY = 0, decided = false, horizontal = false;

    this.stage.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true; decided = e.pointerType === "mouse"; horizontal = decided;
      startX = lastX = e.clientX; startY = e.clientY; lastT = performance.now();
      self.velocity = 0; self.tween = null; self.interacting = true;
      if (decided) { self.stage.setPointerCapture(e.pointerId); self.stage.classList.add("is-dragging"); }
    });
    this.stage.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      if (!decided) {
        // On touch, decide whether the gesture is a rotate (horizontal) or a page scroll (vertical)
        var dx0 = Math.abs(e.clientX - startX), dy0 = Math.abs(e.clientY - startY);
        if (dx0 < 6 && dy0 < 6) return;
        decided = true; horizontal = dx0 > dy0;
        if (!horizontal) { dragging = false; self.interacting = false; return; }
        self.stage.setPointerCapture(e.pointerId); self.stage.classList.add("is-dragging");
      }
      var now = performance.now();
      var dx = e.clientX - lastX;
      self.angle += dx * 0.55;
      self.velocity = (dx * 0.55) / Math.max(16, now - lastT) * 16;
      lastX = e.clientX; lastT = now;
      self.render();
    });
    function end(e) {
      if (!dragging) return;
      dragging = false; self.interacting = false;
      self.stage.classList.remove("is-dragging");
      try { self.stage.releasePointerCapture(e.pointerId); } catch (_) {}
      if (reduceMotion) self.velocity = 0;
    }
    this.stage.addEventListener("pointerup", end);
    this.stage.addEventListener("pointercancel", end);
    this.stage.addEventListener("lostpointercapture", function () { dragging = false; self.interacting = false; self.stage.classList.remove("is-dragging"); });

    this.stage.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 45 : 15, handled = true;
      switch (e.key) {
        case "ArrowLeft": self.goTo(self.angle - step); break;
        case "ArrowRight": self.goTo(self.angle + step); break;
        case "Home": self.goTo(0); break;
        case "End": self.goTo(180); break;
        case " ": case "Enter": self.setPlaying(!self.playing, true); break;
        default: handled = false;
      }
      if (handled) e.preventDefault();
    });

    if (this.thumbs) this.thumbs.forEach(function (b) {
      b.addEventListener("click", function () {
        var v = VIEWS.filter(function (x) { return x.id === b.getAttribute("data-view"); })[0];
        self.setPlaying(false, true);
        self.goTo(v.angle);
      });
    });
    if (this.toggle) this.toggle.addEventListener("click", function () { self.setPlaying(!self.playing, true); });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) { self.visible = entries[0].isIntersecting; }, { threshold: 0.05 }).observe(this.root);
    }
    document.addEventListener("shanana:product", function () { self.swap(); });
  };

  Viewer.prototype.setPlaying = function (on, byUser) {
    this.playing = on;
    if (byUser) this.userPaused = !on;
    this.syncToggle();
  };
  Viewer.prototype.syncToggle = function () {
    if (!this.toggle) return;
    this.toggle.setAttribute("aria-pressed", String(this.playing));
    this.toggle.innerHTML = this.playing
      ? '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 2h2v8H3zM7 2h2v8H7z" fill="currentColor"/></svg>Pause rotation'
      : '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5l7 4.5-7 4.5z" fill="currentColor"/></svg>Auto-rotate';
  };

  Viewer.prototype.goTo = function (target) {
    var from = this.angle, delta = shortest(from, target);
    this.velocity = 0;
    if (reduceMotion) { this.angle = from + delta; this.tween = null; this.render(); return; }
    this.tween = { from: from, to: from + delta, start: performance.now(), dur: 650 + Math.abs(delta) * 2.2 };
  };

  Viewer.prototype.swap = function () {
    if (!this.bag || reduceMotion) return;
    var bag = this.bag;
    bag.classList.remove("is-swapping"); void bag.offsetWidth; bag.classList.add("is-swapping");
  };

  Viewer.prototype.loop = function (t) {
    var dt = this.last ? Math.min(64, t - this.last) : 16;
    this.last = t;
    var active = this.visible && !document.hidden;
    var changed = false;

    if (this.tween) {
      var p = Math.min(1, (t - this.tween.start) / this.tween.dur);
      var e = 1 - Math.pow(1 - p, 4);
      this.angle = this.tween.from + (this.tween.to - this.tween.from) * e;
      if (p >= 1) this.tween = null;
      changed = true;
    } else if (!this.interacting && Math.abs(this.velocity) > 0.02) {
      this.angle += this.velocity * (dt / 16);
      this.velocity *= Math.pow(0.94, dt / 16);
      changed = true;
    } else if (this.playing && active && !this.interacting) {
      this.angle += AUTO_SPEED * dt / 1000;
      changed = true;
    }
    if (!changed && this.mode === "frames" && !this.playing && !this.interacting && !this.tween && Math.abs(this.velocity) <= 0.02) {
      // idle: settle on the nearest real photograph instead of resting on a blend of two
      var step = 360 / this.frames.length, target = Math.round(this.angle / step) * step;
      if (Math.abs(target - this.angle) > 0.4) this.tween = { from: this.angle, to: target, start: t, dur: 280 };
    }
    if (changed) this.render();
    requestAnimationFrame(this.loop);
  };

  Viewer.prototype.render = function () {
    var a = this.angle;
    var n = norm(a);
    this.stage.setAttribute("aria-valuenow", String(Math.round(n)));
    this.stage.setAttribute("aria-valuetext", Math.round(n) + " degrees — " + this.closestView(n).label + " view");

    if (this.mode === "frames") {
      // show the nearest real photograph (blending two transparent angles reads as a double exposure)
      var N = this.frames.length, idx = Math.round(n / 360 * N) % N;
      if (idx !== this.i0) { this.i0 = idx; this.frameBase.src = this.frames[idx]; }
      this.frameOver.style.opacity = 0;
    } else {
      this.bag.style.setProperty("--ry", a.toFixed(2) + "deg");
      for (var k in this.faces) {
        var f = this.faces[k];
        var world = norm(a + f.n);
        var lit = Math.max(0, Math.cos(rad(world - LIGHT)));
        var shade = (k === "front" || k === "back") ? 0.5 * (1 - lit) : 0.22 + 0.5 * (1 - lit);
        f.el.style.setProperty("--shade", shade.toFixed(3));
      }
      // specular sweep follows the rotation of the front panel
      var fw = shortest(0, n);
      this.faces.front.el.querySelector(".bag__gloss").style.setProperty("--gloss", (50 - fw * 0.9).toFixed(1) + "%");
      var proj = Math.abs(Math.cos(rad(n))) + 0.3 * Math.abs(Math.sin(rad(n)));
      this.shadow.style.setProperty("--shadow-w", (0.5 + proj * 0.75).toFixed(3));
    }

    var cur = this.closestView(n);
    if (this.thumbs) this.thumbs.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-view") === cur.id && cur.exact));
    });
  };

  Viewer.prototype.closestView = function (n) {
    var best = VIEWS[0], bestD = 999;
    VIEWS.forEach(function (v) { var d = Math.abs(shortest(n, v.angle)); if (d < bestD) { bestD = d; best = v; } });
    return { id: best.id, label: best.label, exact: bestD < 6 };
  };

  /* ------------------------------------------------------------------
     Product (size) selection — shared state for every control on a page
     ------------------------------------------------------------------ */
  var Product = {
    list: CATALOG.products || [],
    current: null,
    get: function (id) { return this.list.filter(function (p) { return p.id === id; })[0]; },
    set: function (id, opts) {
      var p = this.get(id);
      if (!p || (this.current && this.current.id === id)) return;
      this.current = p;
      bindFields(p);
      syncControls(p.id);
      if (!(opts && opts.silent)) {
        document.dispatchEvent(new CustomEvent("shanana:product", { detail: p }));
        if (opts && opts.updateHash && history.replaceState) history.replaceState(null, "", "#size-" + p.id);
      }
    },
    step: function (dir) {
      var i = this.list.indexOf(this.current);
      var next = this.list[(i + dir + this.list.length) % this.list.length];
      this.set(next.id);
    }
  };

  function pending() { return '<span class="pill pill--pending">Pending confirmation</span>'; }
  function fieldValue(p, key) {
    switch (key) {
      case "buyers": return p.buyers.join(", ");
      case "buyersList": return '<ul class="tag-list">' + p.buyers.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>";
      case "fullName": return esc(p.label + " " + p.name);
      case "casePack": case "moq": return p[key] ? esc(p[key]) : pending();
      case "roast": return (CATALOG.options && CATALOG.options.roastLevels) ? esc(CATALOG.options.roastLevels.join(", ")) : pending();
      case "grind": return (CATALOG.options && CATALOG.options.grinds) ? esc(CATALOG.options.grinds.join(", ")) : pending();
      default: return p[key] != null ? esc(p[key]) : pending();
    }
  }
  function bindFields(p) {
    document.querySelectorAll("[data-product-field]").forEach(function (el) {
      el.innerHTML = fieldValue(p, el.getAttribute("data-product-field"));
    });
  }
  function syncControls(id) {
    document.querySelectorAll("[data-size-radio]").forEach(function (r) { r.checked = r.value === id; });
    document.querySelectorAll("[data-size-card]").forEach(function (c) {
      var on = c.getAttribute("data-size-card") === id;
      c.setAttribute("aria-checked", String(on));
      c.tabIndex = on ? 0 : -1;
    });
    document.querySelectorAll("[data-size-link]").forEach(function (a) {
      a.href = a.getAttribute("data-size-link") + "?size=" + encodeURIComponent(id);
    });
  }

  function renderSizeRadios() {
    document.querySelectorAll("[data-size-options]").forEach(function (wrap, wi) {
      wrap.innerHTML = Product.list.map(function (p) {
        var id = "size-" + wi + "-" + p.id;
        var thumb = wrap.getAttribute("data-thumb");
        return '<input type="radio" name="size-' + wi + '" id="' + id + '" value="' + p.id + '" data-size-radio>' +
          '<label for="' + id + '">' + (thumb ? '<img src="' + esc(thumb) + '" alt="" width="28" height="35" loading="lazy" decoding="async">' : "") + "<span>" + esc(p.label) + "</span></label>";
      }).join("");
      wrap.addEventListener("change", function (e) { if (e.target.matches("[data-size-radio]")) Product.set(e.target.value); });
    });
  }

  function renderSizeCards() {
    var wrap = document.querySelector("[data-size-cards]");
    if (!wrap) return;
    wrap.setAttribute("role", "radiogroup");
    wrap.innerHTML = Product.list.map(function (p) {
      return '<button type="button" role="radio" class="size-card" data-size-card="' + p.id + '" aria-checked="false">' +
        '<span class="size-card__size">' + esc(p.label) + '</span>' +
        '<span><span class="size-card__name">' + esc(p.name) + '</span><br><span class="size-card__for">' + esc(p.buyers.join(" · ")) + '</span></span>' +
        '<span class="size-card__dot" aria-hidden="true"></span></button>';
    }).join("");
    wrap.addEventListener("click", function (e) {
      var c = e.target.closest("[data-size-card]");
      if (c) Product.set(c.getAttribute("data-size-card"), { updateHash: true });
    });
    wrap.addEventListener("keydown", function (e) {
      var dir = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      Product.step(dir);
      var on = wrap.querySelector('[aria-checked="true"]');
      if (on) on.focus();
    });
  }

  function initialSize() {
    var q = new URLSearchParams(location.search).get("size");
    var h = (location.hash.match(/^#size-(\w+)/) || [])[1];
    var id = q || h;
    return Product.get(id) ? id : (Product.list[0] && Product.list[0].id);
  }

  function init() {
    renderSizeRadios();
    renderSizeCards();
    document.querySelectorAll("[data-size-prev]").forEach(function (b) { b.addEventListener("click", function () { Product.step(-1); }); });
    document.querySelectorAll("[data-size-next]").forEach(function (b) { b.addEventListener("click", function () { Product.step(1); }); });
    if (Product.list.length) Product.set(initialSize(), { silent: true });
    document.querySelectorAll("[data-viewer]:not([data-lazy])").forEach(function (el) { new Viewer(el); });
    initDialog();
  }

  /* ---- "View in 3D" dialog: the viewer is built only when someone asks for it ---- */
  function initDialog() {
    var dlg = document.getElementById("viewer3d");
    var openers = document.querySelectorAll("[data-open-3d]");
    if (!dlg || !openers.length) return;
    if (typeof dlg.showModal !== "function") { openers.forEach(function (b) { b.hidden = true; }); return; }
    var viewer = null;
    openers.forEach(function (b) {
      b.addEventListener("click", function () {
        dlg.showModal();
        document.documentElement.classList.add("dlg-open");
        if (!viewer) viewer = new Viewer(dlg.querySelector("[data-viewer]"));
        else { viewer.setPlaying(!reduceMotion, false); }
        var stage = dlg.querySelector(".viewer__stage"); if (stage) stage.focus({ preventScroll: true });
      });
    });
    function close() { if (dlg.open) dlg.close(); }
    dlg.querySelectorAll("[data-close-3d]").forEach(function (b) { b.addEventListener("click", close); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); }); // backdrop click
    dlg.addEventListener("close", function () {
      document.documentElement.classList.remove("dlg-open");
      if (viewer) viewer.setPlaying(false, false);
    });
  }

  window.ShananaProduct = Product;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
