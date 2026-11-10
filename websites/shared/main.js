/* Ravens Tech — shared site behaviour.
 * Each product page defines `window.SITE = { currency, locations }` before loading this file,
 * plus its own product script (builder / customizer).
 */
(() => {
  const SITE = window.SITE || {};
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  // Money formatter shared with product scripts.
  const currency = SITE.currency || { code: "USD", locale: "en-US" };
  const fmt = new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    maximumFractionDigits: currency.code === "RWF" ? 0 : 2,
  });
  window.formatMoney = (n) => fmt.format(n);
  $$("[data-price]").forEach((el) => (el.textContent = fmt.format(+el.dataset.price)));

  // "Ideal for" venue tiles (override with SITE.venues).
  const venueEl = $("#venues");
  if (venueEl) {
    const venues = SITE.venues || [
      ["mall", "Malls & Retail", "#3a2c6b", "#14203a"],
      ["hotel", "Hotels & Resorts", "#5a3520", "#1a1420"],
      ["campus", "Campuses", "#1d4a6b", "#0f1a2c"],
      ["plane", "Airports & Transit", "#20406b", "#0b1220"],
      ["events", "Events & Venues", "#6b2050", "#1a0f22"],
    ];
    venueEl.innerHTML = venues
      .map(
        ([icon, label, c1, c2]) => `<div class="venue reveal">
          <div class="art" style="background:radial-gradient(circle at 70% 25%, rgba(var(--accent-rgb),.35), transparent 45%), linear-gradient(160deg, ${c1}, ${c2})">
            <svg style="position:absolute;right:-12%;top:8%;width:80%;height:auto;color:rgba(255,255,255,.12)"><use href="#i-${icon}"/></svg>
          </div>
          <span><svg><use href="#i-${icon}"/></svg>${label}</span>
        </div>`
      )
      .join("");
  }

  // Header: solid on scroll, mobile menu.
  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  const toggle = $(".menu-toggle");
  toggle?.addEventListener("click", () => {
    const open = header.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", open);
  });
  $$(".nav-links a").forEach((a) =>
    a.addEventListener("click", () => {
      header.classList.remove("menu-open");
      toggle?.setAttribute("aria-expanded", "false");
    })
  );

  // Reveal on scroll.
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    io.observe(el);
  });

  // Count-up stats.
  const counter = new IntersectionObserver((entries) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || "";
      const start = performance.now();
      const step = (t) => {
        const p = Math.min((t - start) / 1400, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      counter.unobserve(el);
    })
  );
  $$("[data-count]").forEach((el) => counter.observe(el));

  // Marquee: duplicate content for a seamless loop.
  $$(".marquee-track").forEach((t) => (t.innerHTML += t.innerHTML));

  // Menu / catalog tabs.
  $$("[data-tabs]").forEach((tabs) => {
    const grid = $(tabs.dataset.tabs);
    tabs.addEventListener("click", (e) => {
      const btn = e.target.closest(".tab");
      if (!btn) return;
      $$(".tab", tabs).forEach((t) => {
        t.classList.toggle("active", t === btn);
        t.setAttribute("aria-selected", t === btn);
      });
      const f = btn.dataset.filter;
      $$("[data-cat]", grid).forEach((item) =>
        item.classList.toggle("hide", f !== "all" && item.dataset.cat !== f)
      );
    });
  });

  // Location finder.
  const locs = SITE.locations || [];
  const list = $("#loc-list");
  const map = $("#map");
  if (list && map) {
    const card = $(".map-card", map);
    const select = (i) => {
      $$("li", list).forEach((li) => li.classList.toggle("active", +li.dataset.i === i));
      $$(".pin", map).forEach((p) => p.classList.toggle("active", +p.dataset.i === i));
      const l = locs[i];
      card.innerHTML = `<b>${l.name}</b><p>${l.address}<br>${l.hours} · <span class="status ${l.busy ? "busy" : ""}" style="float:none">${l.busy ? "Busy now" : "Open now"}</span></p>`;
    };
    locs.forEach((l, i) => {
      const pin = document.createElement("button");
      pin.className = "pin";
      pin.dataset.i = i;
      pin.style.left = l.x + "%";
      pin.style.top = l.y + "%";
      pin.setAttribute("aria-label", l.name);
      pin.addEventListener("click", () => select(i));
      map.appendChild(pin);
    });
    const render = (q = "") => {
      const term = q.trim().toLowerCase();
      const hits = locs
        .map((l, i) => ({ ...l, i }))
        .filter((l) => !term || `${l.name} ${l.address} ${l.type}`.toLowerCase().includes(term));
      list.innerHTML = hits.length
        ? hits
            .map(
              (l) => `<li data-i="${l.i}" tabindex="0"><span class="status ${l.busy ? "busy" : ""}">● ${l.busy ? "Busy" : "Open"}</span><b>${l.name}</b><small>${l.address} · ${l.type}</small></li>`
            )
            .join("")
        : `<p class="loc-empty">No machines match “${q}”. Want one here? <a href="#partner" class="grad-text">Host a machine →</a></p>`;
      $$(".pin", map).forEach((p) => (p.style.display = hits.some((h) => h.i === +p.dataset.i) ? "" : "none"));
    };
    list.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (li) select(+li.dataset.i);
    });
    list.addEventListener("keydown", (e) => {
      const li = e.target.closest("li");
      if (li && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        select(+li.dataset.i);
      }
    });
    $("#loc-search")?.addEventListener("input", (e) => render(e.target.value));
    render();
    if (locs.length) select(0);
  }

  // Partner / host-a-machine form (front-end only — wire `action` to your backend or form service).
  $$("form[data-partner]").forEach((form) => {
    const note = $(".form-note", form);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || "");
      if (!data.name || !emailOk || !data.venue) {
        note.className = "form-note err";
        note.textContent = "Please add your name, a valid email and the venue type.";
        return;
      }
      note.className = "form-note ok";
      note.textContent = `Thanks ${data.name.split(" ")[0]}! Our partnerships team will contact you within 1 business day.`;
      form.reset();
    });
  });

  // Video modal.
  const modal = $(".modal");
  $$("[data-video]").forEach((b) => b.addEventListener("click", () => modal?.classList.add("open")));
  modal?.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest(".modal-close")) modal.classList.remove("open");
  });
  document.addEventListener("keydown", (e) => e.key === "Escape" && modal?.classList.remove("open"));

  // Footer year.
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
