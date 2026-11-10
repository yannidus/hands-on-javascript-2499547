/* Frosti — flavour menu + "Build a cone" configurator. */
(() => {
  const money = window.formatMoney;
  const $ = (id) => document.getElementById(id);

  // ---- Flavours (used by both the menu and the builder) --------------------
  const FLAVOURS = [
    { id: "vanilla", name: "Madagascar Vanilla", color: "#fff4dc" },
    { id: "strawberry", name: "Strawberry Swirl", color: "#ffc7df" },
    { id: "chocolate", name: "Double Chocolate", color: "#6b3f22" },
    { id: "pistachio", name: "Pistachio", color: "#c6e3a1" },
    { id: "mango", name: "Mango Sorbet (vegan)", color: "#ffc04d" },
    { id: "cookies", name: "Cookies & Cream", color: "#e6e2dc" },
    { id: "bluesky", name: "Blue Sky Bubblegum", color: "#9fe3ff" },
    { id: "coffee", name: "Coffee Crunch", color: "#b88760" },
  ];
  const F = Object.fromEntries(FLAVOURS.map((f) => [f.id, f]));

  const TOPPINGS = [
    { id: "sprinkles", name: "Rainbow sprinkles", price: 0.5 },
    { id: "chips", name: "Choc chips", price: 0.5 },
    { id: "sauce", name: "Fudge sauce", price: 0.6 },
    { id: "cherry", name: "Cherry on top", price: 0.4 },
  ];

  // ---- Menu ---------------------------------------------------------------
  const MENU = [
    { name: "Classic Vanilla Cone", cat: "classic", price: 2.5, scoops: ["vanilla"], desc: "Creamy Madagascar vanilla in a crisp waffle cone.", tag: "Classic" },
    { name: "Choco Lover", cat: "classic", price: 3.7, scoops: ["chocolate", "chocolate"], desc: "Two scoops of double chocolate with choc chips." },
    { name: "Strawberry Dream", cat: "classic", price: 2.5, scoops: ["strawberry"], desc: "Real strawberry ripple, light and fruity." },
    { name: "Neapolitan Tower", cat: "signature", price: 4.9, scoops: ["strawberry", "vanilla", "chocolate"], desc: "Three scoops, three classics, one epic cone.", tag: "Best seller" },
    { name: "Blue Sky Sprinkle", cat: "signature", price: 3.4, scoops: ["bluesky"], desc: "Bubblegum scoop loaded with rainbow sprinkles.", tag: "Kids' pick" },
    { name: "Cookie Crumble", cat: "signature", price: 3.9, scoops: ["cookies", "coffee"], desc: "Cookies & cream with coffee crunch and fudge." },
    { name: "Mango Sunshine", cat: "vegan", price: 2.7, scoops: ["mango"], desc: "Dairy-free mango sorbet. Bright, tangy, refreshing.", tag: "Vegan" },
    { name: "Tropical Duo", cat: "vegan", price: 3.9, scoops: ["mango", "mango"], desc: "Double mango sorbet with a cherry on top.", tag: "Vegan" },
    { name: "Pistachio Royale", cat: "seasonal", price: 3.2, scoops: ["pistachio"], desc: "Roasted pistachio with a pinch of sea salt.", tag: "Limited" },
    { name: "Mocha Fudge", cat: "seasonal", price: 4.1, scoops: ["coffee", "chocolate"], desc: "Coffee crunch and chocolate under warm fudge.", tag: "New" },
  ];

  const coneSvg = (scoops) => {
    const ys = [62, 40, 22];
    const rs = [24, 20, 17];
    return `<svg viewBox="0 0 100 130" aria-hidden="true">
      <path d="M30 70h40l-20 56z" fill="#d9a35b"/><path d="M36 78l24 12M40 92l14 7M34 74l30-2" stroke="#a8742f" stroke-width="1.5"/>
      ${scoops
        .map((s, i) => `<circle cx="50" cy="${ys[i]}" r="${rs[i]}" fill="${F[s].color}"/><path d="M${50 - rs[i] + 3} ${ys[i] + 6}q${rs[i] - 3} 8 ${2 * rs[i] - 6} 0" stroke="rgba(0,0,0,.12)" stroke-width="2" fill="none"/>`)
        .join("")}
    </svg>`;
  };

  $("menu-grid").innerHTML = MENU.map(
    (d) => `<article class="card menu-item" data-cat="${d.cat}">
      <div class="thumb ${d.cat === "vegan" || d.cat === "seasonal" ? "pink-thumb" : "ice-thumb"}">${coneSvg(d.scoops)}</div>
      <div class="body">
        <h3>${d.name}</h3>
        <p>${d.desc}</p>
        <div class="meta"><span class="price">${money(d.price)}</span>${d.tag ? `<span class="tag">${d.tag}</span>` : ""}</div>
      </div>
    </article>`
  ).join("");

  // ---- Builder ------------------------------------------------------------
  const BASE_PRICE = 2.5; // includes the first scoop
  const EXTRA_SCOOP = 1.2;
  const MAX_SCOOPS = 3;
  const SCOOP_TOP = [94, 56, 26]; // y of the top edge of each scoop in the preview

  $("opt-flavours").innerHTML = FLAVOURS.map(
    (f, i) => `<label class="opt flavor-chip"><input type="checkbox" name="flavour" value="${f.id}" ${i === 0 ? "checked" : ""}/><span class="swatch" style="background:${f.color}"></span>${f.name}</label>`
  ).join("");
  $("opt-toppings").innerHTML = TOPPINGS.map(
    (t) => `<label class="opt"><input type="checkbox" name="topping" value="${t.id}"/>${t.name} <em>+${money(t.price)}</em></label>`
  ).join("");

  const form = $("builder");
  let order = ["vanilla"]; // keep selection order so scoops stack in the order picked

  form.addEventListener("change", (e) => {
    if (e.target.name === "flavour") {
      const v = e.target.value;
      if (e.target.checked) {
        if (order.length >= MAX_SCOOPS) {
          e.target.checked = false;
          flash(`Max ${MAX_SCOOPS} scoops — remove one to swap flavours.`, "err");
          return;
        }
        order.push(v);
      } else {
        order = order.filter((x) => x !== v);
      }
    }
    update();
  });

  function update() {
    const f = new FormData(form);
    const holder = f.get("holder");
    const tops = f.getAll("topping");
    const n = order.length;

    $("holder-cone").style.display = holder === "cone" ? "" : "none";
    $("holder-cup").style.display = holder === "cup" ? "" : "none";

    for (let i = 0; i < MAX_SCOOPS; i++) {
      const el = $(`scoop-${i}`);
      el.classList.toggle("off", i >= n);
      if (i < n) el.setAttribute("fill", F[order[i]].color);
    }

    // Sauce + cherry sit on the highest scoop.
    const dy = n ? SCOOP_TOP[n - 1] - SCOOP_TOP[2] : 120;
    ["top-sauce", "top-cherry", "top-cherry-stem"].forEach((id) => $(id).setAttribute("transform", `translate(0 ${dy})`));
    $("top-sauce").style.opacity = tops.includes("sauce") && n ? 1 : 0;
    $("top-cherry").style.opacity = $("top-cherry-stem").style.opacity = tops.includes("cherry") && n ? 1 : 0;

    // Sprinkles / chips only show on scoops that exist.
    ["top-sprinkles", "top-chips"].forEach((gid) => {
      const on = tops.includes(gid.replace("top-", ""));
      [...$(gid).children].forEach((c) => {
        const y = c.getBBox().y;
        const scoopIdx = y >= SCOOP_TOP[0] ? 0 : y >= SCOOP_TOP[1] ? 1 : 2;
        c.style.opacity = on && scoopIdx < n ? 1 : 0;
      });
    });

    const total = n ? BASE_PRICE + (n - 1) * EXTRA_SCOOP + TOPPINGS.filter((t) => tops.includes(t.id)).reduce((s, t) => s + t.price, 0) : 0;
    $("sum-name").textContent = n ? `${n} scoop${n > 1 ? "s" : ""} · ${holder === "cone" ? "Waffle cone" : "Cup"}` : "Pick a flavour";
    $("sum-desc").textContent = n
      ? [order.map((id) => F[id].name.replace(/ \(vegan\)/, "")).join(" + "), ...tops.map((t) => TOPPINGS.find((x) => x.id === t).name)].join(" · ")
      : "Choose at least one scoop";
    $("sum-total").textContent = money(total);
  }

  function flash(msg, kind = "ok") {
    const note = $("save-note");
    note.className = `form-note ${kind}`;
    note.textContent = msg;
  }

  $("save-cone").addEventListener("click", () => {
    if (!order.length) return flash("Add at least one scoop first.", "err");
    flash(`Saved! Scan the QR code on any Frosti to make your ${$("sum-name").textContent.toLowerCase()}.`);
  });

  update();
})();
