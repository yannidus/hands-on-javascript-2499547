/* Concept 1 · shared header, contact block, footer and page behaviour */
import { PRODUCTS, ORDER } from "../shared/products.js";

const LOGO = `<svg viewBox="0 0 44 34" aria-hidden="true"><defs><linearGradient id="lg" x1="0" x2="1"><stop offset="0" stop-color="#8a5fff"/><stop offset="1" stop-color="#48cfff"/></linearGradient></defs><path d="M4 32 14 2h14a9 9 0 0 1 0 18h-9l12 12" fill="none" stroke="url(#lg)" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M1 20h15" stroke="url(#lg)" stroke-width="5" stroke-linecap="round"/></svg>`;

export function mountShell(active) {
  const prodLinks = ORDER.map((k) => {
    const p = PRODUCTS[k];
    return `<li><a href="product.html?p=${k}"><i style="color:${p.accent};background:${p.accent}"></i><span>${p.name}<small>${p.kind}</small></span></a></li>`;
  }).join("");
  document.getElementById("hdr").innerHTML = `
    <nav class="wrap nav" aria-label="Main">
      <a class="brand" href="index.html">${LOGO}RAVENS TECH</a>
      <ul class="links">
        <li class="dd"><a href="index.html#products" class="${active ? "on" : ""}">Products</a><ul>${prodLinks}</ul></li>
        <li><a href="index.html#technology">Technology</a></li>
        <li><a href="index.html#locations">Solutions</a></li>
        <li><a href="#contact">Support</a></li>
        <li><a href="index.html#about">About</a></li>
      </ul>
      <div class="cta"><a class="btn btn-s" href="#contact">Contact Us</a><a class="btn btn-p" href="index.html#products">Explore Products →</a><button class="burger" aria-label="Menu" aria-expanded="false">☰</button></div>
    </nav>`;
  document.getElementById("contact").innerHTML = `
    <div class="wrap grid">
      <div class="reveal"><span class="eyebrow">Contact · Partnerships</span><h2>Bring the experience to <span class="grad">your venue.</span></h2>
        <p>Malls, hotels, campuses, airports and events. Tell us about your space and we'll recommend the right machines, placement and revenue model.</p></div>
      <form class="glass lead reveal" novalidate>
        <label>Full name<input name="name" autocomplete="name" required></label>
        <label>Work email<input name="email" type="email" autocomplete="email" required></label>
        <label>Company / venue<input name="company" autocomplete="organization"></label>
        <label>Interested in<select name="product"><option>All machines</option>${ORDER.map((k) => `<option ${k === active ? "selected" : ""}>${PRODUCTS[k].name}</option>`).join("")}</select></label>
        <label class="full">Message<textarea name="msg" rows="3" placeholder="Venue type, foot traffic, timing…"></textarea></label>
        <button class="btn btn-p" type="submit">Send inquiry →</button>
        <p class="note" role="status"></p>
      </form>
    </div>`;
  document.getElementById("foot").innerHTML = `
    <div class="wrap"><a class="brand" href="index.html">${LOGO}RAVENS TECH</a><span style="color:var(--muted)">Innovation in Automated Retail</span>
      <nav>${ORDER.map((k) => `<a href="product.html?p=${k}">${PRODUCTS[k].name}</a>`).join("")}<a href="index.html#technology">Technology</a><a href="#contact">Contact</a></nav>
      <div class="soc"><a href="#" aria-label="LinkedIn">in</a><a href="#" aria-label="YouTube">▶</a><a href="#" aria-label="Instagram">ig</a><a href="#" aria-label="Facebook">f</a></div></div>`;

  const hdr = document.getElementById("hdr");
  const onScroll = () => hdr.classList.toggle("solid", scrollY > 30);
  onScroll(); addEventListener("scroll", onScroll, { passive: true });
  hdr.querySelector(".burger").onclick = (e) => e.currentTarget.setAttribute("aria-expanded", hdr.classList.toggle("open"));

  const form = document.querySelector("form.lead");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const note = form.querySelector(".note");
    if (!d.name || !/^\S+@\S+\.\S+$/.test(d.email || "")) { note.style.color = "#ff6b81"; note.textContent = "Please add your name and a valid email."; return; }
    note.style.color = "#3ee69a"; note.textContent = `Thanks ${d.name.split(" ")[0]}! Our partnerships team will reply within 1 business day.`; form.reset();
  });

  const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))), { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

/** Render still images of a machine from preset cameras (used for feature/product cards). */
export function snapshots(THREE, renderer, scene, shots, { w = 960, h = 720, before } = {}) {
  renderer.setPixelRatio(1); renderer.setSize(w, h, false);
  const cam = new THREE.PerspectiveCamera(30, w / h, 0.05, 60);
  const out = {};
  for (const [k, s] of Object.entries(shots)) {
    before?.(s);
    cam.fov = s.fov || 30; cam.position.set(...s.pos); cam.lookAt(...s.target); cam.updateProjectionMatrix();
    renderer.render(scene, cam);
    out[k] = renderer.domElement.toDataURL("image/jpeg", 0.88);
  }
  return out;
}
