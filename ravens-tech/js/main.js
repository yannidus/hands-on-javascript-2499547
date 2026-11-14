/* Ravens Tech: page behaviour. No dependencies. */
(function () {
  'use strict';

  var CFG = window.RAVENS_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mq = function (q) { return window.matchMedia && window.matchMedia(q).matches; };
  var reduceMotion = mq('(prefers-reduced-motion: reduce)');
  var conn = navigator.connection || {};
  var lite = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '') || (navigator.hardwareConcurrency || 8) <= 4;
  if (lite) document.documentElement.classList.add('lite');

  var store = {
    get: function (k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { } },
    del: function (k) { try { window.sessionStorage.removeItem(k); } catch (e) { } }
  };

  /* ---------------- config: contact details, product links ---------------- */
  (function applyConfig() {
    var c = CFG.contact || {};
    function setRow(id, val, href) {
      var dd = document.getElementById(id); if (!dd) return;
      if (!val) { dd.parentNode.hidden = true; return; }
      dd.textContent = '';
      if (href) { var a = document.createElement('a'); a.href = href; a.textContent = val; dd.appendChild(a); }
      else dd.textContent = val;
    }
    setRow('cEmail', c.email, c.email ? 'mailto:' + c.email : null);
    setRow('cPhone', c.phone, c.phone ? 'tel:' + c.phone.replace(/[^\d+]/g, '') : null);
    setRow('cLocation', c.location);
    var sites = CFG.productSites || {};
    $$('[data-site]').forEach(function (a) {
      var url = sites[a.getAttribute('data-site')];
      if (url) { a.href = url; a.hidden = false; }
    });
    if (CFG.privacyUrl) $$('a[href="privacy.html"]').forEach(function (a) { a.href = CFG.privacyUrl; });
    var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
  })();

  /* ---------------- header + mobile menu ---------------- */
  var header = $('#header'), toggle = $('#navToggle'), nav = $('#siteNav');
  var lastFocus = null;
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  function menuOpen() { return toggle.getAttribute('aria-expanded') === 'true'; }
  function setMenu(open) {
    if (open === menuOpen()) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    $('#main').inert = open;
    if (open) { lastFocus = document.activeElement; var f = $('a', nav); if (f) f.focus(); }
    else if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }
  toggle.addEventListener('click', function () { setMenu(!menuOpen()); });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a') || e.target === nav) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (!menuOpen()) return;
    if (e.key === 'Escape') { setMenu(false); toggle.focus(); return; }
    if (e.key === 'Tab') { // keep focus inside the header (toggle + menu links)
      var items = [toggle].concat($$('a', nav));
      var i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    }
  });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1024) setMenu(false); });

  /* ---------------- active section + reveal ---------------- */
  if ('IntersectionObserver' in window) {
    var links = $$('#siteNav li a');
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + en.target.id ? 'true' : 'false'); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['frosti', 'beanbox', 'znapcase', 'explore3d', 'contact'].forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });

    var rv = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); rv.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.rv').forEach(function (el) { rv.observe(el); });
  } else {
    $$('.rv').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------- galleries ---------------- */
  $$('[data-gallery]').forEach(function (g) {
    var track = $('.gallery__track', g), prev = $('[data-prev]', g), next = $('[data-next]', g);
    function step() { var li = $('li', track); return li ? li.getBoundingClientRect().width + 14 : track.clientWidth * .8; }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
      $('.gallery__btns', g).hidden = max <= 0;
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
    });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------------- 3D showroom ---------------- */
  var MACHINES = {
    frosti: { name: 'Frosti', src: 'viewers/frosti.html', poster: 'img/frosti-640.webp', color: '#7CE7FF', alt: 'Frosti robotic ice cream machine (preview)' },
    bean: { name: 'Bean Box', src: 'viewers/bean-box.html', poster: 'img/bean-640.webp', color: '#FFB347', alt: 'Bean Box robotic coffee machine (preview)' },
    znap: { name: 'ZnapCase', src: 'viewers/znapcase.html', poster: 'img/znap-640.webp', color: '#C6FF3D', alt: 'ZnapCase phone case printing machine (preview)' }
  };
  var viewer = $('#viewer'), poster = $('#viewerPoster'), shield = $('#viewerShield'), shieldLabel = $('#viewerShieldLabel'), shieldHint = $('#viewerShieldHint');
  var bar = $('#viewerBar'), doneBtn = $('#viewerDone'), status = $('#viewerStatus'), fullLink = $('#viewerFull');
  var tabs = $$('.tab');
  var current = 'frosti', frame = null, readyTimer = null;

  var webgl = (function () {
    try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
  })();

  function say(msg) { status.textContent = msg || ''; status.hidden = !msg; }
  function setState(s) { viewer.setAttribute('data-state', s); }

  function destroyFrame() {
    clearTimeout(readyTimer);
    if (frame) { frame.src = 'about:blank'; frame.remove(); frame = null; }
  }
  function post(msg) { try { if (frame && frame.contentWindow) frame.contentWindow.postMessage(msg, '*'); } catch (e) { } }

  function showShield(resume) {
    var m = MACHINES[current];
    shield.hidden = false; bar.hidden = true;
    shieldLabel.textContent = (resume ? 'Resume ' : 'Explore ') + m.name + ' in 3D';
    shieldHint.textContent = resume ? 'The page scrolls normally until you tap again.' : 'Loads an interactive 3D model.';
    setState(resume ? 'paused' : 'idle');
  }

  function activate() {
    if (!webgl) {
      shield.hidden = true;
      say('Interactive 3D isn’t supported on this device, so you’re seeing a photo instead.');
      return;
    }
    var m = MACHINES[current];
    if (!frame) {
      frame = document.createElement('iframe');
      frame.title = m.name + ' interactive 3D model';
      frame.setAttribute('allow', 'fullscreen');
      frame.allowFullscreen = true;
      frame.src = m.src;
      viewer.insertBefore(frame, shield);
      say('Loading the ' + m.name + ' 3D model…');
      readyTimer = setTimeout(function () {
        say('Still loading. This can take a moment on slower connections.');
        readyTimer = setTimeout(function () { destroyFrame(); showShield(false); say('The 3D model couldn\u2019t load. Check your connection and tap to try again.'); }, 30000);
      }, 12000);
    } else {
      post({ kiosk: 'play' });
    }
    shield.hidden = true; bar.hidden = false;
    setState('active');
    frame.focus();
  }

  function deactivate(focusShield) {
    if (viewer.getAttribute('data-state') !== 'active') return;
    post({ kiosk: 'pause' });
    showShield(true);
    if (focusShield) shield.focus();
  }

  function select(k, opts) {
    if (!MACHINES[k]) return;
    opts = opts || {};
    var wasActive = viewer.getAttribute('data-state') === 'active';
    current = k;
    var m = MACHINES[k];
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-k') === k;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on) viewer.setAttribute('aria-labelledby', t.id);
    });
    viewer.style.setProperty('--c', m.color);
    poster.src = m.poster; poster.alt = m.alt;
    fullLink.href = m.src;
    destroyFrame(); say('');
    if (wasActive && !opts.idle) activate(); else showShield(false);
  }

  showShield(false);
  shield.addEventListener('click', activate);
  doneBtn.addEventListener('click', function () { deactivate(true); });
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t.getAttribute('data-k')); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); select(n.getAttribute('data-k'));
    });
  });
  $$('[data-show3d]').forEach(function (a) {
    a.addEventListener('click', function () { select(a.getAttribute('data-show3d'), { idle: true }); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') deactivate(true); });

  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!frame || e.source !== frame.contentWindow || !d || !d.kioskViewer) return;
    if (d.ready) { clearTimeout(readyTimer); say(''); if (viewer.getAttribute('data-state') !== 'active') post({ kiosk: 'pause' }); }
    if (d.escape) deactivate(true);
    if (d.error) {
      destroyFrame(); showShield(false);
      say('The 3D view stopped because the device ran low on graphics memory. Tap to load it again.');
    }
  });

  // Pause when scrolled away; free the WebGL context entirely once it is far off-screen.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!frame) return;
        if (en.isIntersecting) return;
        if (viewer.getAttribute('data-state') === 'active') deactivate(false);
        else post({ kiosk: 'pause' });
      });
    }, { threshold: 0 }).observe(viewer);
    new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (!en.isIntersecting && frame) { destroyFrame(); say(''); showShield(false); } });
    }, { rootMargin: '150% 0px' }).observe(viewer);
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) post({ kiosk: 'pause' }); else if (viewer.getAttribute('data-state') === 'active') post({ kiosk: 'play' }); });

  /* ---------------- product films ---------------- */
  var FILM_KEY = { frosti: 'frosti', bean: 'bean', znap: 'znap' };
  $$('[data-film]').forEach(function (box) {
    var k = box.getAttribute('data-film'), btn = $('.film__play', box), note = $('.film__note', box);
    var film = (CFG.films || {})[k] || {};
    btn.addEventListener('click', function () {
      if (!film.src) {
        note.textContent = 'Film coming soon. Opening the 3D showroom instead…';
        select(FILM_KEY[k], { idle: true });
        var target = document.getElementById('explore3d');
        setTimeout(function () { target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); shield.focus({ preventScroll: true }); }, reduceMotion ? 0 : 500);
        return;
      }
      var v = document.createElement('video');
      v.src = film.src; v.controls = true; v.playsInline = true; v.preload = 'metadata';
      v.setAttribute('playsinline', '');
      if (film.captions) { var tr = document.createElement('track'); tr.kind = 'captions'; tr.srclang = 'en'; tr.label = 'English'; tr.src = film.captions; tr.default = true; v.appendChild(tr); }
      box.appendChild(v);
      v.focus();
      var p = v.play(); if (p && p.catch) p.catch(function () { });
    });
  });

  /* ---------------- inquiry form ---------------- */
  var form = $('#inquiry');
  if (form) {
    var DRAFT = 'ravens-inquiry-draft';
    var statusBox = $('#formStatus'), submitBtn = $('#submitBtn');
    var LABELS = { buy: 'Buy a machine', lease: 'Lease or rent', host: 'Host one at my venue', partner: 'Partner or distribute' };
    var SUBMIT = { buy: 'Request pricing', lease: 'Request lease options', host: 'Check if my venue qualifies', partner: 'Apply to partner' };

    function journey() { var r = $('input[name="journey"]:checked', form); return r ? r.value : 'buy'; }
    function syncJourney() {
      var j = journey();
      $$('[data-for]', form).forEach(function (f) {
        var show = f.getAttribute('data-for').split(' ').indexOf(j) > -1;
        f.hidden = !show;
        $$('input,select,textarea', f).forEach(function (el) { el.disabled = !show; });
      });
      submitBtn.textContent = SUBMIT[j];
    }
    function setJourney(j, machine) {
      var r = document.getElementById('j-' + j); if (r) r.checked = true;
      if (machine) form.machine.value = machine;
      syncJourney(); saveDraft();
    }
    $$('input[name="journey"]', form).forEach(function (r) { r.addEventListener('change', function () { syncJourney(); saveDraft(); }); });
    $$('[data-journey]').forEach(function (a) {
      a.addEventListener('click', function () { setJourney(a.getAttribute('data-journey'), a.getAttribute('data-machine')); });
    });

    function saveDraft() {
      var data = {};
      $$('input,select,textarea', form).forEach(function (el) {
        if (!el.name || el.name === 'website') return;
        if (el.type === 'radio') { if (el.checked) data[el.name] = el.value; }
        else if (el.type === 'checkbox') data[el.name] = el.checked;
        else data[el.name] = el.value;
      });
      store.set(DRAFT, JSON.stringify(data));
    }
    function restoreDraft() {
      var raw = store.get(DRAFT); if (!raw) return;
      try {
        var data = JSON.parse(raw);
        Object.keys(data).forEach(function (n) {
          var els = form.elements[n]; if (!els) return;
          if (n === 'journey') { var r = document.getElementById('j-' + data[n]); if (r) r.checked = true; }
          else if (els.type === 'checkbox') els.checked = !!data[n];
          else if (els.value !== undefined) els.value = data[n];
        });
      } catch (e) { }
    }
    form.addEventListener('input', saveDraft);
    form.addEventListener('change', saveDraft);

    var RULES = {
      name: function (v) { return v.trim() ? '' : 'Please enter your name.'; },
      email: function (v) { return !v.trim() ? 'Please enter your email address.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address, like name@company.com.'; },
      consent: function (v, el) { return el.checked ? '' : 'Please tick this box so we can reply to you.'; }
    };
    function check(name) {
      var el = form.elements[name], msg = RULES[name](el.value, el), err = document.getElementById('e-' + name);
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      err.textContent = msg;
      return !msg;
    }
    Object.keys(RULES).forEach(function (n) {
      var el = form.elements[n];
      el.addEventListener('blur', function () { if (el.value || el.getAttribute('aria-invalid') === 'true') check(n); });
      el.addEventListener('change', function () { if (el.getAttribute('aria-invalid') === 'true') check(n); });
    });

    function showStatus(kind, msg) { statusBox.setAttribute('data-kind', kind); statusBox.textContent = msg; statusBox.focus(); }

    function payload() {
      var j = journey(), d = { journey: LABELS[j] };
      $$('input,select,textarea', form).forEach(function (el) {
        if (!el.name || el.disabled || el.type === 'radio' || el.name === 'website') return;
        d[el.name] = el.type === 'checkbox' ? el.checked : el.value.trim();
      });
      d.machine = form.machine.options[form.machine.selectedIndex].text;
      d.page = location.href;
      return d;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      statusBox.textContent = '';
      var bad = Object.keys(RULES).filter(function (n) { return !check(n); });
      if (bad.length) {
        showStatus('err', bad.length === 1 ? 'Please fix the highlighted field.' : 'Please fix the ' + bad.length + ' highlighted fields.');
        form.elements[bad[0]].focus();
        return;
      }
      if (form.website.value) { showStatus('ok', 'Thanks! Your inquiry has been sent.'); return; } // bot
      var data = payload();
      var subject = 'Ravens Tech inquiry: ' + data.journey + ' (' + data.machine + ')';

      if (CFG.formEndpoint) {
        submitBtn.disabled = true; var label = submitBtn.textContent; submitBtn.textContent = 'Sending…';
        fetch(CFG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(Object.assign({ _subject: subject }, data)) })
          .then(function (r) { if (!r.ok) throw new Error(r.status); })
          .then(function () {
            store.del(DRAFT); form.reset(); syncJourney();
            showStatus('ok', 'Thanks, ' + data.name.split(' ')[0] + '! We’ve received your inquiry and will reply to ' + data.email + ' within one business day.');
          })
          .catch(function () {
            showStatus('err', 'Sorry, your inquiry couldn’t be sent. Please check your connection and try again. Your answers are still filled in.');
          })
          .then(function () { submitBtn.disabled = false; submitBtn.textContent = label; });
        return;
      }

      var to = (CFG.contact || {}).email;
      if (!to) { showStatus('err', 'Online inquiries aren’t set up yet. Please contact us using the details on this page.'); return; }
      var body = Object.keys(data).filter(function (k) { return k !== 'consent' && data[k] !== ''; })
        .map(function (k) { return k.charAt(0).toUpperCase() + k.slice(1) + ': ' + data[k]; }).join('\n');
      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      showStatus('ok', 'Your email app should open with the inquiry filled in. Press send there to reach us. Nothing opened? Email us at ' + to + '.');
    });

    restoreDraft();
    syncJourney();
  }
})();
