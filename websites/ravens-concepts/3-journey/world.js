/* Concept 3 · shared world: neon showroom floor, scroll-driven camera rig, header + contact */
import * as THREE from "three";
import { RoomEnvironment } from "../vendor/RoomEnvironment.js";
import { makeRenderer, studioLights } from "../shared/machines3d.js";
import { PRODUCTS, ORDER } from "../shared/products.js";

const LOGO = `<svg viewBox="0 0 44 34" aria-hidden="true"><defs><linearGradient id="lg" x1="0" x2="1"><stop offset="0" stop-color="#8a5fff"/><stop offset="1" stop-color="#48cfff"/></linearGradient></defs><path d="M4 32 14 2h14a9 9 0 0 1 0 18h-9l12 12" fill="none" stroke="url(#lg)" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M1 20h15" stroke="url(#lg)" stroke-width="5" stroke-linecap="round"/></svg>`;

export function mountShell(active) {
  document.getElementById("hdr").innerHTML = `<a class="brand" href="index.html">${LOGO}RAVENS TECH</a>
    <nav aria-label="Products"><a href="index.html" class="${active ? "" : "on"}">Home</a>${ORDER.map((k) => `<a href="product.html?p=${k}" class="${k === active ? "on" : ""}" style="--k:${PRODUCTS[k].accent}">${PRODUCTS[k].name}</a>`).join("")}</nav>
    <a class="btn btn-p" href="#contact" style="padding:10px 18px">Contact</a>`;
  document.getElementById("contact").innerHTML = `<h2>Bring the<br>experience home</h2><div class="cols">
    <div><h4>Visit us</h4><p>Showroom address</p><p>City, Country</p></div>
    <div><h4>Get in touch</h4><a class="l" href="#">+000 000 000</a><a class="l" href="#">hello@ravenstech.example</a></div>
    <form onsubmit="event.preventDefault(); this.querySelector('button').textContent='Thanks, we\\'ll be in touch ✓'"><h4>Host a machine</h4>
      <input placeholder="Full name*" required aria-label="Full name"><input type="email" placeholder="Work email*" required aria-label="Work email">
      <select aria-label="Product">${["All machines", ...ORDER.map((k) => PRODUCTS[k].name)].map((n) => `<option ${active && PRODUCTS[active].name === n ? "selected" : ""}>${n}</option>`).join("")}</select>
      <button class="btn btn-p" style="justify-self:start">Send →</button></form></div>
    <div class="bar"><span>© Ravens Tech · Innovation in Automated Retail</span><span>Concept 3 · Journey</span></div>`;
}

export function createWorld(canvas) {
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x070812, 14, 34);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.3;
  studioLights(scene, { tint: 0x8a5fff });
  // glossy floor with neon grid lines
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x0a0d1c, metalness: 0.8, roughness: 0.35 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const grid = new THREE.GridHelper(60, 60, 0x2a3a6a, 0x16203c); grid.position.y = 0.002; scene.add(grid);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.5 })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.003; shadow.receiveShadow = true; scene.add(shadow);
  // floating particles
  const N = 260, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 24; pos[i * 3 + 1] = Math.random() * 6; pos[i * 3 + 2] = (Math.random() - 0.5) * 18; }
  const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0x9fd8ff, size: 0.025, transparent: true, opacity: 0.6 })); scene.add(dust);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 80);
  function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
  resize(); addEventListener("resize", resize);

  /** keyframes: [{ p:[x,y,z], t:[x,y,z] }] per chapter section; returns current chapter info each frame */
  function rig(sections, keys, keysMobile) {
    const vA = new THREE.Vector3(), vB = new THREE.Vector3(), tA = new THREE.Vector3(), tB = new THREE.Vector3(), look = new THREE.Vector3();
    let init = false;
    return (dt, t) => {
      const mid = innerHeight * 0.5;
      let i = 0;
      for (let j = 0; j < sections.length; j++) if (sections[j].getBoundingClientRect().top <= mid) i = j;
      const r = sections[i].getBoundingClientRect();
      const local = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      const K = innerWidth < 960 && keysMobile ? keysMobile : keys;
      const tall = sections[i].classList.contains("tall");
      const s = Math.min(1, Math.max(0, (local - (tall ? 0.78 : 0.6)) / (tall ? 0.22 : 0.4)));
      const m = s * s * (3 - 2 * s);
      const a = K[i], b = K[Math.min(i + 1, K.length - 1)];
      vA.fromArray(a.p).lerp(vB.fromArray(b.p), m); tA.fromArray(a.t).lerp(tB.fromArray(b.t), m);
      vA.x += Math.sin(t * 0.3) * 0.04; vA.y += Math.sin(t * 0.21) * 0.03;
      const k = init ? 1 - Math.exp(-Math.min(dt, 0.25) * 5) : 1; init = true;
      camera.position.lerp(vA, k); look.lerp(tA, k); camera.lookAt(look);
      dust.rotation.y = t * 0.01;
      return { i, local };
    };
  }
  return { THREE, renderer, scene, camera, rig };
}
