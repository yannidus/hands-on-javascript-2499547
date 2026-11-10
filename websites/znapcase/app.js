/* ZnapCase — design collections + live case designer. */
(() => {
  const money = window.formatMoney;
  const $ = (id) => document.getElementById(id);

  // CSS backgrounds double as "designs" so the site ships with no image assets.
  const PATTERNS = {
    aurora: "linear-gradient(160deg, #ff5ec4, #a77bff 45%, #48cfff)",
    marble: "radial-gradient(circle at 30% 20%, #fff 0 8%, transparent 30%), linear-gradient(135deg, #e9e6f5, #b9b2d6 40%, #f5f3fb 60%, #a59bc9)",
    sunset: "linear-gradient(180deg, #ffcf6b, #ff7a59 45%, #a33f8f)",
    ocean: "radial-gradient(circle at 70% 80%, #48cfff, transparent 50%), linear-gradient(180deg, #0b2a4a, #0d5c8a)",
    forest: "repeating-linear-gradient(60deg, #1d4d2b 0 14px, #2f6b3c 14px 28px)",
    mono: "linear-gradient(135deg, #111 0 50%, #f5f8ff 50%)",
    dots: "radial-gradient(#0b0b13 22%, transparent 24%) 0 0 / 18px 18px, #ffd34b",
    checker: "repeating-conic-gradient(#ff5ec4 0 25%, #fff 0 50%) 0 0 / 28px 28px",
    neon: "repeating-linear-gradient(135deg, #0b0b13 0 10px, #a77bff 10px 12px, #0b0b13 12px 22px, #48cfff 22px 24px)",
    sand: "linear-gradient(180deg, #f3e3c9, #d9bb91)",
    blossom: "radial-gradient(circle at 25% 30%, #ffc7df 0 10%, transparent 11%), radial-gradient(circle at 70% 60%, #ffc7df 0 8%, transparent 9%), radial-gradient(circle at 40% 80%, #fff 0 6%, transparent 7%), linear-gradient(180deg, #ffe6f1, #ffd0e5)",
    retro: "linear-gradient(180deg, #ff7a59 0 20%, #ffd34b 20% 40%, #3ee69a 40% 60%, #48cfff 60% 80%, #a77bff 80%)",
  };

  const DESIGNS = [
    { name: "Aurora Flow", cat: "abstract", p: "aurora", price: 24, tag: "Trending" },
    { name: "Liquid Marble", cat: "abstract", p: "marble", price: 24 },
    { name: "Neon Lines", cat: "abstract", p: "neon", price: 24, tag: "New" },
    { name: "Split Mono", cat: "minimal", p: "mono", price: 22 },
    { name: "Desert Sand", cat: "minimal", p: "sand", price: 22 },
    { name: "Golden Sunset", cat: "nature", p: "sunset", price: 24 },
    { name: "Deep Ocean", cat: "nature", p: "ocean", price: 24 },
    { name: "Forest Stripe", cat: "nature", p: "forest", price: 24 },
    { name: "Cherry Blossom", cat: "nature", p: "blossom", price: 24, tag: "Seasonal" },
    { name: "Polka Pop", cat: "pop", p: "dots", price: 22 },
    { name: "Pink Checker", cat: "pop", p: "checker", price: 22, tag: "Best seller" },
    { name: "Retro Rainbow", cat: "pop", p: "retro", price: 24 },
  ];

  $("menu-grid").innerHTML = DESIGNS.map(
    (d) => `<article class="card menu-item" data-cat="${d.cat}">
      <div class="thumb z-thumb"><div class="case" style="background:${PATTERNS[d.p]}"><span class="gloss"></span></div></div>
      <div class="body">
        <h3>${d.name}</h3>
        <p>${d.cat[0].toUpperCase() + d.cat.slice(1)} collection · all models</p>
        <div class="meta"><span class="price">from ${money(d.price)}</span>${d.tag ? `<span class="tag">${d.tag}</span>` : ""}</div>
      </div>
    </article>`
  ).join("");

  // ---- Designer -----------------------------------------------------------
  const MODELS = {
    Apple: ["iPhone 17 Pro Max", "iPhone 17 Pro", "iPhone 17", "iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16", "iPhone 15", "iPhone 14", "iPhone 13"],
    Samsung: ["Galaxy S25 Ultra", "Galaxy S25+", "Galaxy S25", "Galaxy S24", "Galaxy A56", "Galaxy A36"],
    Google: ["Pixel 10 Pro", "Pixel 10", "Pixel 9 Pro", "Pixel 9", "Pixel 9a"],
  };
  const PRICE = { slim: 22, tough: 29, magsafe: 32 };
  const CLEAR_EXTRA = 0;
  const PHOTO_EXTRA = 3;
  const TEXT_EXTRA = 2;

  $("model").innerHTML = Object.entries(MODELS)
    .map(([brand, list]) => `<optgroup label="${brand}">${list.map((m) => `<option ${m === "iPhone 16 Pro" ? "selected" : ""}>${m}</option>`).join("")}</optgroup>`)
    .join("");

  const quick = ["aurora", "sunset", "ocean", "marble", "checker", "neon", "retro"];
  $("opt-patterns").innerHTML = quick
    .map((p, i) => `<label class="opt pattern-opt" title="${p}"><input type="radio" name="pattern" value="${p}" ${i === 0 ? "checked" : ""} aria-label="${p} pattern"/><span style="background:${PATTERNS[p]}"></span></label>`)
    .join("");

  const form = $("builder");
  const preview = $("preview-case");
  let photoUrl = null;

  function update() {
    const f = new FormData(form);
    const type = f.get("type");
    const finish = f.get("finish");
    const text = (f.get("text") || "").trim();

    preview.className = `case ${type} ${finish}`;
    preview.style.background = photoUrl ? `center / cover no-repeat url("${photoUrl}")` : PATTERNS[f.get("pattern")];
    if (finish === "clear") preview.style.opacity = 0.85;
    else preview.style.opacity = 1;
    $("case-text").textContent = text;

    const total = PRICE[type] + (finish === "clear" ? CLEAR_EXTRA : 0) + (photoUrl ? PHOTO_EXTRA : 0) + (text ? TEXT_EXTRA : 0);
    $("sum-name").textContent = f.get("model");
    $("sum-desc").textContent = [cap(type === "magsafe" ? "MagSafe" : type), cap(finish), photoUrl ? "Your photo" : "Pattern", text ? `“${text}”` : null]
      .filter(Boolean)
      .join(" · ");
    $("sum-total").textContent = money(total);
  }
  const cap = (s) => s[0].toUpperCase() + s.slice(1);

  function setPhoto(file) {
    if (!file || !file.type.startsWith("image/")) return;
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    photoUrl = URL.createObjectURL(file); // stays local to the browser
    form.querySelectorAll('input[name="pattern"]').forEach((r) => (r.checked = false));
    $("drop").querySelector("b").textContent = file.name.length > 28 ? file.name.slice(0, 25) + "…" : file.name;
    update();
  }

  $("photo").addEventListener("change", (e) => setPhoto(e.target.files[0]));
  const drop = $("drop");
  ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => (e.preventDefault(), drop.classList.add("drag"))));
  ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove("drag")));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    setPhoto(e.dataTransfer.files[0]);
  });

  form.addEventListener("change", (e) => {
    if (e.target.name === "pattern") {
      // Picking a pattern replaces the uploaded photo.
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      photoUrl = null;
      $("photo").value = "";
      $("drop").querySelector("b").textContent = "Upload a photo";
    }
    update();
  });
  form.addEventListener("input", update);

  $("save-case").addEventListener("click", () => {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const note = $("save-note");
    note.className = "form-note ok";
    note.textContent = `Your print code is ${code}. Enter it on any ZnapCase machine to print this design.`;
  });

  update();
})();
