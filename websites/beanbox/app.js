/* Bean Box — menu data + "Build your cup" configurator. */
(() => {
  const money = window.formatMoney;

  // ---- Menu ---------------------------------------------------------------
  // color = drink colour in the thumbnail; foam / ice toggle details.
  const MENU = [
    { name: "Espresso", cat: "espresso", price: 2.2, desc: "A rich double shot with a hazelnut crema.", color: "#3b2414", tag: "Classic" },
    { name: "Americano", cat: "espresso", price: 2.6, desc: "Espresso lengthened with hot water. Clean and bold.", color: "#4a2c18" },
    { name: "Macchiato", cat: "espresso", price: 2.8, desc: "Espresso marked with a spoon of velvety foam.", color: "#5a361c", foam: true },
    { name: "Latte", cat: "milk", price: 3.6, desc: "Smooth espresso and steamed milk, light foam.", color: "#b07b4f", foam: true, tag: "Best seller" },
    { name: "Cappuccino", cat: "milk", price: 3.5, desc: "Equal parts espresso, milk and airy foam.", color: "#9a663d", foam: true },
    { name: "Flat White", cat: "milk", price: 3.7, desc: "Ristretto shots with silky microfoam.", color: "#8d5a33", foam: true },
    { name: "Mocha", cat: "milk", price: 3.9, desc: "Espresso, dark chocolate and steamed milk.", color: "#5e3420", foam: true },
    { name: "Iced Latte", cat: "iced", price: 3.8, desc: "Espresso over ice and cold milk.", color: "#c49a72", ice: true },
    { name: "Cold Brew", cat: "iced", price: 3.6, desc: "Steeped 18 hours for a smooth, low-acid kick.", color: "#3a2416", ice: true, tag: "New" },
    { name: "Iced Caramel Macchiato", cat: "iced", price: 4.2, desc: "Vanilla milk, espresso and caramel drizzle.", color: "#b78152", ice: true },
    { name: "Spanish Latte", cat: "special", price: 4.1, desc: "Sweetened condensed milk meets espresso.", color: "#c08f61", foam: true, tag: "Signature" },
    { name: "Hot Chocolate", cat: "special", price: 3.2, desc: "Creamy dark cocoa — no coffee, all comfort.", color: "#4a2516", foam: true },
  ];

  const cupSvg = (d) => `
    <svg viewBox="0 0 100 110" aria-hidden="true">
      <path d="M18 30h64l-7 66a8 8 0 0 1-8 7H33a8 8 0 0 1-8-7z" fill="${d.color}" opacity=".95"/>
      ${d.foam ? '<path d="M19 30h62l-1 10H20z" fill="#efe2cf"/>' : ""}
      ${d.ice ? '<rect x="34" y="46" width="14" height="14" rx="3" fill="#fff" opacity=".35" transform="rotate(12 41 53)"/><rect x="54" y="58" width="14" height="14" rx="3" fill="#fff" opacity=".3" transform="rotate(-14 61 65)"/>' : ""}
      <path d="M18 30h64l-7 66a8 8 0 0 1-8 7H33a8 8 0 0 1-8-7z" fill="none" stroke="#f5f8ff" stroke-opacity=".55" stroke-width="2"/>
      <rect x="14" y="24" width="72" height="8" rx="3" fill="#f5f8ff" opacity=".25"/>
      ${d.ice ? "" : '<g stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none" stroke-linecap="round"><path d="M40 18c-3-4 3-6 0-10"/><path d="M52 18c-3-4 3-6 0-10"/><path d="M64 18c-3-4 3-6 0-10"/></g>'}
    </svg>`;

  document.getElementById("menu-grid").innerHTML = MENU.map(
    (d) => `<article class="card menu-item" data-cat="${d.cat}">
      <div class="thumb ${d.ice ? "iced-thumb" : "bean-thumb"}">${cupSvg(d)}</div>
      <div class="body">
        <h3>${d.name}</h3>
        <p>${d.desc}</p>
        <div class="meta"><span class="price">${money(d.price)}</span>${d.tag ? `<span class="tag">${d.tag}</span>` : ""}</div>
      </div>
    </article>`
  ).join("");

  // ---- Builder ------------------------------------------------------------
  const BASES = [
    { name: "Latte", price: 3.6, color: "#b07b4f", foam: true, milk: true },
    { name: "Cappuccino", price: 3.5, color: "#9a663d", foam: true, milk: true },
    { name: "Flat White", price: 3.7, color: "#8d5a33", foam: true, milk: true },
    { name: "Americano", price: 2.6, color: "#4a2c18", foam: false, milk: false },
    { name: "Mocha", price: 3.9, color: "#5e3420", foam: true, milk: true },
  ];
  const SIZE = { S: { label: "Small", add: -0.4, fill: 0.62 }, M: { label: "Medium", add: 0, fill: 0.72 }, L: { label: "Large", add: 0.6, fill: 0.82 } };
  const EXTRA_SHOT = 0.5;
  const ALT_MILK = 0.4;
  const SYRUP = 0.4;

  const form = document.getElementById("builder");
  document.getElementById("opt-base").innerHTML = BASES.map(
    (b, i) => `<label class="opt"><input type="radio" name="base" value="${i}" ${i === 0 ? "checked" : ""}/>${b.name} <em>${money(b.price)}</em></label>`
  ).join("");

  const $ = (id) => document.getElementById(id);
  const liquid = $("cup-liquid");

  function update() {
    const f = new FormData(form);
    const base = BASES[+f.get("base")];
    const size = SIZE[f.get("size")];
    const shots = +f.get("shots");
    const milk = f.get("milk");
    const syrup = f.get("syrup");
    const iced = f.get("temp") === "iced";

    let total = base.price + size.add + Math.max(0, shots - 2) * EXTRA_SHOT;
    if (base.milk && milk !== "Whole milk" && milk !== "Skim milk") total += ALT_MILK;
    if (syrup) total += SYRUP;
    if (iced) total += 0.2;

    // Cup visuals: top of the cup is y=60, bottom y=222.
    const top = 222 - 162 * size.fill;
    liquid.setAttribute("y", top);
    liquid.setAttribute("height", 240 - top);
    // Darker for more shots / no milk.
    liquid.setAttribute("fill", shade(base.color, (shots - 2) * -0.12));
    $("cup-foam").setAttribute("y", top - 10);
    $("cup-foam").style.opacity = base.foam && !iced ? 1 : 0;
    $("cup-ice").style.opacity = iced ? 1 : 0;
    $("cup-syrup").style.opacity = syrup ? 0.55 : 0;

    $("shots-val").textContent = `${shots} shot${shots > 1 ? "s" : ""}`;
    $("sum-name").textContent = `${iced ? "Iced " : ""}${base.name}`;
    $("sum-desc").textContent = [size.label, base.milk ? milk : null, `${shots} shot${shots > 1 ? "s" : ""}`, syrup || null]
      .filter(Boolean)
      .join(" · ");
    $("sum-total").textContent = money(Math.max(total, 1));
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(Math.min(255, Math.max(0, v + v * amt))));
    return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  }

  form.addEventListener("input", update);
  form.addEventListener("change", update);
  update();

  $("save-cup").addEventListener("click", () => {
    const note = $("save-note");
    note.className = "form-note ok";
    note.textContent = `Saved “${$("sum-name").textContent}” — scan the QR code on any Bean Box to brew it.`;
  });
})();
