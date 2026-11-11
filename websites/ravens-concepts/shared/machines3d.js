/* Ravens Tech — procedural 3D models of Frosti, Bean Box and ZnapCase.
 *
 *   const m = createMachine("frosti" | "beanbox" | "znapcase", { mode: "real" | "line", fill, ink, accentInk });
 *   scene.add(m.group);
 *   m.setProgress(p)      // 0..1 make cycle: arm moves in, dispenses / pours / prints, returns
 *   m.setVariant(key)     // product variant (drink, flavour set, print pattern)
 *   m.setExplode(t)       // 0..1 exploded view
 *   m.highlight(part)     // line mode: colour one part
 *   m.update(dt, time)
 *
 * Units are metres; origin at floor centre; the front faces +Z.
 * Part names (for explode/highlight): shell, header, source, arm, stage, module, dispenser, screen.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "../vendor/RoundedBoxGeometry.js";

export const EXPLODE = {
  shell: [0, 0, -0.35], header: [0, 0.34, 0.1], source: [-0.65, 0.3, 0.35], arm: [0.1, 0.25, 1.05],
  stage: [0.25, -0.05, 0.95], module: [-0.55, -0.15, 0.85], dispenser: [0.75, 0.35, 0.45], screen: [0.8, -0.05, 0.75],
};

const THEMES = {
  beanbox: { body: 0x171a22, bodyMetal: 0.75, bodyRough: 0.32, frame: 0x121214, accent: 0xffb15c, interior: 0x3a2618, interiorGlow: 0x4a2410, panel: "wood", insideLight: 0xffa64d, icon: "cup", label: "Bean Box", screen: ["#ffb15c", "#ff8a4c", "#48cfff", "#f3e6d0", "#c98a4b", "#3ee69a"] },
  frosti: { body: 0xe6ebf2, bodyMetal: 0.55, bodyRough: 0.25, frame: 0xc4ccd8, accent: 0x48cfff, interior: 0x1a3a55, interiorGlow: 0x0e3a5a, panel: "frost", insideLight: 0x9fe3ff, icon: "cone", label: "Frosti", screen: ["#48cfff", "#ff7ec8", "#fff4dc", "#ffc04d", "#9fe3ff", "#c6e3a1"] },
  znapcase: { body: 0x1a1426, bodyMetal: 0.7, bodyRough: 0.3, frame: 0x110d1a, accent: 0xa77bff, interior: 0x2a1a4a, interiorGlow: 0x2a1060, panel: "gloss", insideLight: 0xc9a6ff, icon: "phone", label: "ZnapCase", screen: ["#ff5ec4", "#48cfff", "#ffd34b", "#a77bff", "#3ee69a", "#ff7a59"] },
};

/* ---------- textures ---------- */
function canvasTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
const hex = (n) => "#" + n.toString(16).padStart(6, "0");
function signTexture(th) {
  const a = hex(th.accent);
  return canvasTex(1024, 256, (g, w, h) => {
    g.fillStyle = "#07070a"; g.fillRect(0, 0, w, h);
    g.strokeStyle = a; g.lineWidth = 10; g.lineCap = "round"; g.lineJoin = "round";
    if (th.icon === "cup") {
      g.beginPath(); g.moveTo(190, 105); g.lineTo(290, 105); g.lineTo(282, 175); g.quadraticCurveTo(240, 200, 198, 175); g.closePath(); g.stroke();
      g.beginPath(); g.arc(300, 135, 18, -Math.PI / 2, Math.PI / 2); g.stroke();
      [215, 240, 265].forEach((x) => { g.beginPath(); g.moveTo(x, 90); g.bezierCurveTo(x - 10, 75, x + 10, 65, x, 50); g.stroke(); });
    } else if (th.icon === "cone") {
      g.beginPath(); g.moveTo(195, 120); g.lineTo(285, 120); g.lineTo(240, 215); g.closePath(); g.stroke();
      g.beginPath(); g.arc(240, 112, 42, Math.PI, 0); g.stroke();
      g.beginPath(); g.moveTo(215, 140); g.lineTo(255, 160); g.moveTo(222, 160); g.lineTo(250, 175); g.stroke();
    } else {
      g.beginPath(); g.roundRect(205, 50, 76, 150, 16); g.stroke();
      g.beginPath(); g.moveTo(232, 180); g.lineTo(254, 180); g.stroke();
    }
    g.fillStyle = "#f6f2ea"; g.font = "700 104px 'Space Grotesk', 'Inter Tight', Arial, sans-serif"; g.textBaseline = "middle";
    g.fillText(th.label, 330, 135);
  });
}
function screenTexture(th) {
  return canvasTex(256, 400, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, "#151a26"); grd.addColorStop(1, "#0a0d14");
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.fillStyle = hex(th.accent); g.font = "700 22px Inter, Arial"; g.fillText(th.icon === "phone" ? "Design your case" : th.icon === "cone" ? "Build your cone" : "Choose your drink", 18, 38);
    for (let i = 0; i < 6; i++) {
      const x = 18 + (i % 2) * 114, y = 60 + Math.floor(i / 2) * 100;
      g.fillStyle = "rgba(255,255,255,.06)"; g.fillRect(x, y, 104, 90);
      g.fillStyle = th.screen[i];
      if (th.icon === "phone") { g.fillRect(x + 36, y + 10, 32, 56); } else { g.beginPath(); g.arc(x + 52, y + 38, 20, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = "#cfd6e4"; g.fillRect(x + 22, y + 72, 60, 6);
    }
    g.fillStyle = hex(th.accent); g.fillRect(18, 362, 220, 26);
  });
}
function panelTexture(kind) {
  return canvasTex(512, 512, (g, w, h) => {
    if (kind === "wood") {
      g.fillStyle = "#6a3f22"; g.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 2) {
        const v = Math.sin(x * 0.05) * 18 + Math.sin(x * 0.31) * 9 + (Math.random() - 0.5) * 16;
        g.fillStyle = `rgba(${v > 0 ? "255,190,130" : "30,12,4"},${Math.min(0.28, Math.abs(v) / 90)})`; g.fillRect(x, 0, 2, h);
      }
      for (let y = 0; y < h; y += 128) { g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(0, y, w, 2); }
    } else if (kind === "frost") {
      const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#f4f8fc"); gr.addColorStop(1, "#cfdbe8"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(72,207,255,.55)"; g.lineWidth = 3;
      for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(0, 60 + i * 52); g.bezierCurveTo(170, 20 + i * 52, 340, 100 + i * 52, 512, 60 + i * 52); g.stroke(); }
    } else {
      const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#2a1450"); gr.addColorStop(0.5, "#6b2a9c"); gr.addColorStop(1, "#ff5ec4"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = "rgba(255,255,255,.08)"; for (let i = 0; i < 14; i++) g.fillRect(0, i * 38, w, 1.5);
    }
  });
}
function beanTexture() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#2a160a"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * w, y = Math.random() * h, r = 7 + Math.random() * 4;
      g.save(); g.translate(x, y); g.rotate(Math.random() * Math.PI);
      g.fillStyle = ["#5a3218", "#6b3c1d", "#4a2812", "#7a4622"][i % 4];
      g.beginPath(); g.ellipse(0, 0, r, r * 0.68, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "rgba(20,8,2,.8)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-r * 0.8, 0); g.quadraticCurveTo(0, r * 0.25, r * 0.8, 0); g.stroke();
      g.restore();
    }
  });
}
function waffleTexture() {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = "#d9a35b"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#a8742f"; g.lineWidth = 4;
    for (let i = -w; i < w * 2; i += 22) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); g.beginPath(); g.moveTo(i, h); g.lineTo(i + h, 0); g.stroke(); }
  });
}
const PATTERNS = {
  aurora: ["#ff5ec4", "#a77bff", "#48cfff"],
  sunset: ["#ffcf6b", "#ff7a59", "#a33f8f"],
  ocean: ["#9fe3ff", "#2f7fc0", "#0b2a4a"],
};
function printTexture(key) {
  const c = PATTERNS[key] || PATTERNS.aurora;
  return canvasTex(128, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, c[0]); gr.addColorStop(0.5, c[1]); gr.addColorStop(1, c[2]);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.globalAlpha = 0.35; g.strokeStyle = "#fff"; g.lineWidth = 6;
    for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-20, 40 + i * 44); g.bezierCurveTo(40, 0 + i * 44, 90, 90 + i * 44, 150, 30 + i * 44); g.stroke(); }
  });
}
const FLAVOURS = {
  vanilla: [0xfff4dc, 0xfff4dc, 0xffe9b8],
  berry: [0xffc7df, 0xff9cc4, 0xfff4dc],
  choco: [0x6b3f22, 0x8a5634, 0x4a2814],
};
const DRINKS = {
  espresso: { cupH: 0.075, cupR: 0.038, fill: 0.55, color: 0x3a1d0c, foam: 0xc98a4b, ice: false, steam: true },
  latte: { cupH: 0.13, cupR: 0.046, fill: 0.86, color: 0xb57a48, foam: 0xf3e6d0, ice: false, steam: true },
  iced: { cupH: 0.15, cupR: 0.05, fill: 0.82, color: 0xc49a6c, foam: 0xd9b88f, ice: true, steam: false },
};

const boxMesh = (w, h, d, mat, r = 0) => new THREE.Mesh(r ? new RoundedBoxGeometry(w, h, d, 3, r) : new THREE.BoxGeometry(w, h, d), mat);
const at = (m, x, y, z) => { m.position.set(x, y, z); return m; };

export function createMachine(type = "beanbox", { mode = "real", fill = 0xe8e4dd, ink = 0x15151a } = {}) {
  const th = THEMES[type] || THEMES.beanbox;
  const line = mode === "line";
  const box = (w, h, d, mat, r = 0) => boxMesh(w, h, d, mat, line ? 0 : r);
  const group = new THREE.Group();
  const parts = {};
  for (const k of Object.keys(EXPLODE)) { const g = new THREE.Group(); g.name = k; parts[k] = g; group.add(g); }

  const M = {
    body: new THREE.MeshStandardMaterial({ color: th.body, metalness: th.bodyMetal, roughness: th.bodyRough }),
    frame: new THREE.MeshStandardMaterial({ color: th.frame, metalness: 0.3, roughness: 0.55 }),
    accent: new THREE.MeshStandardMaterial({ color: 0x000000, emissive: th.accent, emissiveIntensity: 1.25, toneMapped: false }),
    panel: new THREE.MeshStandardMaterial({ map: panelTexture(th.panel), roughness: th.panel === "wood" ? 0.55 : 0.25, metalness: th.panel === "gloss" ? 0.3 : 0.05 }),
    sign: new THREE.MeshStandardMaterial({ color: 0x000000, emissiveMap: signTexture(th), emissive: 0xffffff, emissiveIntensity: 1.3 }),
    screen: new THREE.MeshStandardMaterial({ color: 0x000000, emissiveMap: screenTexture(th), emissive: 0xffffff, emissiveIntensity: 1.1 }),
    interior: new THREE.MeshStandardMaterial({ color: th.interior, metalness: 0.2, roughness: 0.55, emissive: th.interiorGlow, emissiveIntensity: 0.9 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xc9ced8, metalness: 0.9, roughness: 0.22 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf3f2ee, metalness: 0.05, roughness: 0.28 }),
    joint: new THREE.MeshStandardMaterial({ color: 0xb8bfcb, metalness: 0.6, roughness: 0.3 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, roughness: 0.02, clearcoat: 1 }),
    clear: new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, roughness: 0.05, clearcoat: 1, side: THREE.DoubleSide }),
    fridge: new THREE.MeshStandardMaterial({ color: 0xdfe5ee, metalness: 0.4, roughness: 0.4 }),
    stream: new THREE.MeshStandardMaterial({ color: 0x6b3a18, roughness: 0.2 }),
  };

  /* ----- shell ----- */
  const S = parts.shell;
  S.add(at(box(0.07, 1.55, 0.76, M.body, 0.02), -0.465, 0.83, 0));
  S.add(at(box(0.33, 1.55, 0.76, M.body, 0.02), 0.335, 0.83, 0));
  S.add(at(box(0.62, 0.74, 0.76, M.body), -0.12, 0.43, 0));
  S.add(at(box(0.62, 0.72, 0.06, M.interior), -0.12, 1.2, -0.35));
  S.add(at(box(0.66, 0.04, 0.72, M.frame), -0.12, 0.82, 0));
  S.add(at(box(1.02, 0.06, 0.8, M.frame, 0.02), 0, 0.03, 0));
  S.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.62), M.panel), -0.12, 0.45, 0.381));
  const glass = at(new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.72), M.glass), -0.12, 1.2, 0.372); glass.userData.noEdges = true; S.add(glass);
  S.add(at(box(0.62, 0.008, 0.008, M.accent), -0.12, 0.795, 0.384));
  S.add(at(box(0.008, 1.5, 0.008, M.accent), -0.432, 0.85, 0.384));
  S.add(at(box(0.008, 1.5, 0.008, M.accent), 0.172, 0.85, 0.384));
  S.add(at(box(0.6, 0.012, 0.012, M.accent), -0.12, 1.54, 0.2));
  S.add(at(box(0.2, 0.16, 0.01, M.frame), 0.335, 0.62, 0.382));

  /* ----- header ----- */
  const H = parts.header;
  H.add(at(box(1.02, 0.36, 0.8, type === "frosti" ? M.body : M.frame, 0.03), 0, 1.79, 0));
  H.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.225), M.sign), 0, 1.79, 0.402));
  H.add(at(box(1.0, 0.008, 0.008, M.accent), 0, 1.6, 0.398));

  /* ----- source module (hopper / flavour tubs / ink) ----- */
  const SRC = parts.source;
  if (type === "beanbox") {
    SRC.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.05, 0.2, 32, 1, true), M.clear), -0.33, 1.38, -0.2));
    SRC.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.05, 0.15, 32), new THREE.MeshStandardMaterial({ map: beanTexture(), roughness: 0.55 })), -0.33, 1.35, -0.2));
    SRC.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.012, 32), M.steel), -0.33, 1.485, -0.2));
    SRC.add(at(box(0.13, 0.17, 0.13, M.steel, 0.015), -0.33, 1.19, -0.2));
    SRC.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 16), M.frame), -0.33, 1.08, -0.2));
  } else if (type === "frosti") {
    SRC.add(at(box(0.26, 0.02, 0.16, M.steel, 0.005), -0.29, 1.3, -0.22));
    const cols = [0xfff4dc, 0xffc7df, 0x6b3f22, 0xc6e3a1];
    cols.forEach((c, i) => {
      const x = -0.385 + (i % 2) * 0.085 + (i > 1 ? 0.0 : 0), z = -0.26 + Math.floor(i / 2) * 0.08;
      SRC.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.032, 0.07, 24), M.steel), x + 0.05, 1.345, z));
      SRC.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.031, 0.012, 24), new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 })), x + 0.05, 1.38, z));
    });
    SRC.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.16, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M.clear), -0.29, 1.31, -0.22));
  } else {
    const inks = [0x00b7eb, 0xff2d9a, 0xffe600, 0x111111, 0xf5f5f5];
    SRC.add(at(box(0.3, 0.2, 0.1, M.frame, 0.01), -0.29, 1.3, -0.25));
    inks.forEach((c, i) => SRC.add(at(box(0.045, 0.14, 0.05, new THREE.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0.1 }), 0.006), -0.39 + i * 0.05, 1.3, -0.19)));
  }

  /* ----- robotic arm ----- */
  const A = parts.arm;
  const armBase = new THREE.Group(); armBase.position.set(-0.22, 0.84, -0.02); A.add(armBase);
  armBase.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.05, 32), M.joint), 0, 0.025, 0));
  const yaw = new THREE.Group(); yaw.position.y = 0.05; armBase.add(yaw);
  yaw.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.12, 32), M.white), 0, 0.06, 0));
  const shoulder = new THREE.Group(); shoulder.position.y = 0.14; yaw.add(shoulder);
  shoulder.add(new THREE.Mesh(new THREE.SphereGeometry(0.052, 24, 16), M.joint));
  const L1 = 0.27, L2 = 0.23;
  const upper = new THREE.Group(); shoulder.add(upper);
  const uM = new THREE.Mesh(new THREE.CapsuleGeometry(0.038, L1, 8, 20), M.white); uM.rotation.z = -Math.PI / 2; uM.position.x = L1 / 2; upper.add(uM);
  const elbow = new THREE.Group(); elbow.position.x = L1; upper.add(elbow);
  elbow.add(new THREE.Mesh(new THREE.SphereGeometry(0.044, 24, 16), M.joint));
  const fM = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, L2, 8, 20), M.white); fM.rotation.z = -Math.PI / 2; fM.position.x = L2 / 2; elbow.add(fM);
  const wrist = new THREE.Group(); wrist.position.x = L2; elbow.add(wrist);
  wrist.add(new THREE.Mesh(new THREE.SphereGeometry(0.034, 20, 14), M.joint));
  wrist.add(at(box(0.09, 0.05, 0.05, type === "znapcase" ? M.frame : M.white, 0.012), 0.05, 0, 0));
  const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.03, 16), M.steel); noz.rotation.z = Math.PI / 2; noz.position.x = 0.105; wrist.add(noz);
  if (type === "znapcase") { const bar = box(0.012, 0.012, 0.08, M.accent); bar.position.set(0.112, 0, 0); wrist.add(bar); }
  const tip = new THREE.Object3D(); tip.position.x = 0.12; wrist.add(tip);

  /* ----- stage & product ----- */
  const B = parts.stage;
  const STAGE = new THREE.Vector3(0.02, 0.84, 0.1);
  B.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.012, 32), M.steel), STAGE.x, STAGE.y + 0.006, STAGE.z));
  const product = new THREE.Group(); product.position.copy(STAGE).add(new THREE.Vector3(0, 0.012, 0)); B.add(product);
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 1, 12), M.stream); stream.userData.noEdges = true; B.add(stream);
  const steam = new THREE.Group(); B.add(steam);
  const puff = canvasTex(64, 64, (g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, "rgba(255,255,255,.9)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  for (let i = 0; i < 8; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puff, transparent: true, opacity: 0, depthWrite: false })); s.userData.seed = i / 8; s.userData.noEdges = true; steam.add(s); }

  let topY = () => 0.13; // height of the product top above the stage
  let applyProduct = () => {};
  let variant;

  if (type === "beanbox") {
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.8, 1, 40, 1, true), M.clear);
    const bottom = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.04, 40), M.clear);
    const coffee = new THREE.MeshStandardMaterial({ color: 0xb57a48, roughness: 0.25 });
    const foamM = new THREE.MeshStandardMaterial({ color: 0xf3e6d0, roughness: 0.6 });
    const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.8, 1, 40), coffee);
    const foam = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.96, 0.08, 40), foamM);
    const ice = new THREE.Group();
    const iceM = new THREE.MeshPhysicalMaterial({ color: 0xe8f7ff, transparent: true, opacity: 0.55, roughness: 0.1 });
    for (let i = 0; i < 4; i++) { const c = box(0.42, 0.42, 0.42, iceM, 0.06); c.position.set(Math.cos(i * 1.7) * 0.35, 0.3 + i * 0.16, Math.sin(i * 1.7) * 0.35); c.rotation.set(i, i * 0.7, i * 0.3); ice.add(c); }
    product.add(shell, bottom, liquid, foam, ice);
    let d = DRINKS.latte;
    variant = (k) => { d = DRINKS[k] || DRINKS.latte; coffee.color.setHex(d.color); foamM.color.setHex(d.foam); };
    topY = () => d.cupH;
    applyProduct = (f) => {
      const r = d.cupR, hgt = d.cupH;
      shell.scale.set(r, hgt, r); shell.position.y = hgt / 2;
      bottom.scale.set(r, 1, r); bottom.position.y = 0.002;
      ice.visible = d.ice && f > 0.15; ice.scale.set(r, hgt * 0.6, r);
      const lh = Math.max(0.0001, hgt * d.fill * f);
      liquid.scale.set(r * 0.92, lh, r * 0.92); liquid.position.y = lh / 2 + 0.002; liquid.visible = f > 0.01;
      foam.scale.set(r * 0.93, 1, r * 0.93); foam.position.y = lh + 0.004; foam.visible = f > 0.75 && !d.ice;
      M.stream.color.setHex(0x6b3a18);
      return { surface: lh + 0.004, steam: d.steam };
    };
  } else if (type === "frosti") {
    const holder = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.006, 8, 32), M.steel); holder.rotation.x = Math.PI / 2; holder.position.y = 0.075;
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.075, 8), M.steel); stand.position.set(0.04, 0.037, 0);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.11, 32, 1, true), new THREE.MeshStandardMaterial({ map: waffleTexture(), roughness: 0.7, side: THREE.DoubleSide }));
    cone.rotation.x = Math.PI; cone.position.y = 0.055 + 0.03;
    const scoopM = [0, 1, 2].map(() => new THREE.MeshStandardMaterial({ color: 0xfff4dc, roughness: 0.65 }));
    const scoops = scoopM.map((m, i) => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.037 - i * 0.004, 28, 18), m); s.position.y = 0.145 + i * 0.05; return s; });
    product.add(holder, stand, cone, ...scoops);
    let cols = FLAVOURS.vanilla;
    variant = (k) => { cols = FLAVOURS[k] || FLAVOURS.vanilla; scoopM.forEach((m, i) => m.color.setHex(cols[i])); };
    topY = () => 0.26;
    applyProduct = (f) => {
      let current = 0;
      scoops.forEach((s, i) => { const k = Math.min(1, Math.max(0, f * 3 - i)); s.scale.setScalar(Math.max(0.0001, k)); s.visible = k > 0.01; if (k > 0 && k < 1) current = i; });
      M.stream.color.setHex(cols[current]);
      const surface = 0.145 + current * 0.05 + 0.03;
      return { surface, steam: false };
    };
  } else {
    const blank = box(0.075, 0.012, 0.155, M.white, 0.01);
    blank.position.y = 0.006;
    const prints = Object.fromEntries(Object.keys(PATTERNS).map((k) => [k, printTexture(k)]));
    const printM = new THREE.MeshStandardMaterial({ map: prints.aurora, roughness: 0.2, metalness: 0.1 });
    const printed = new THREE.Mesh(new THREE.PlaneGeometry(0.071, 0.151), printM);
    printed.rotation.x = -Math.PI / 2; printed.position.y = 0.0125;
    const cam = box(0.028, 0.004, 0.028, M.frame, 0.004); cam.position.set(-0.018, 0.015, -0.055);
    product.add(blank, printed, cam);
    product.rotation.y = 0.35;
    variant = (k) => { printM.map = prints[k] || prints.aurora; printM.needsUpdate = true; };
    topY = () => 0.012;
    applyProduct = (f) => {
      printed.visible = f > 0.005;
      printed.scale.y = Math.max(0.001, f);
      printed.position.z = -0.0755 * (1 - f); // reveals from the back edge forward
      M.stream.color.setHex(0xa77bff);
      return { surface: 0.013, steam: false, sweep: true };
    };
  }

  /* ----- hidden modules ----- */
  const MD = parts.module;
  if (type === "znapcase") {
    MD.add(at(box(0.36, 0.3, 0.42, M.frame, 0.02), -0.2, 0.36, -0.05));
    MD.add(at(box(0.3, 0.02, 0.36, M.accent), -0.2, 0.52, -0.05));
  } else {
    MD.add(at(box(0.36, 0.42, 0.42, M.fridge, 0.02), -0.2, 0.36, -0.05));
    [-0.27, -0.13].forEach((x) => MD.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.22, 24), type === "frosti" ? M.steel : M.white), x, 0.36, 0.08)));
  }
  MD.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.4, 8), M.steel), -0.05, 0.62, 0));
  const DP = parts.dispenser;
  DP.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 24, 1, true), M.clear), 0.34, 1.0, -0.15));
  for (let i = 0; i < 9; i++) {
    const item = type === "znapcase" ? box(0.075, 0.012, 0.11, M.white) : new THREE.Mesh(type === "frosti" ? new THREE.ConeGeometry(0.04, 0.09, 20, 1, true) : new THREE.CylinderGeometry(0.052, 0.04, 0.09, 24, 1, true), type === "frosti" ? new THREE.MeshStandardMaterial({ map: waffleTexture(), side: THREE.DoubleSide }) : M.white);
    if (type === "frosti") item.rotation.x = Math.PI;
    DP.add(at(item, 0.34, 0.8 + i * (type === "znapcase" ? 0.03 : 0.045), -0.15));
  }
  DP.add(at(box(0.16, 0.05, 0.16, M.steel, 0.01), 0.34, 0.73, -0.15));

  /* ----- screen & payment ----- */
  const SC = parts.screen;
  SC.add(at(box(0.23, 0.36, 0.02, M.frame, 0.01), 0.335, 1.3, 0.385));
  SC.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.32), M.screen), 0.335, 1.3, 0.397));
  SC.add(at(box(0.16, 0.09, 0.015, M.frame, 0.01), 0.335, 1.03, 0.388));
  SC.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.004, 8, 32), M.accent), 0.335, 1.03, 0.398));
  for (let i = 0; i < 3; i++) { const b = at(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 16), M.accent), 0.28 + i * 0.055, 0.92, 0.39); b.rotation.x = Math.PI / 2; SC.add(b); }

  group.traverse((o) => { if (o.isMesh) { o.castShadow = !line; o.receiveShadow = !line; } });

  /* ----- line mode ----- */
  const lineMats = [];
  function partOf(o) { let p = o; while (p && !EXPLODE[p.name]) p = p.parent; return p ? p.name : null; }
  if (line) {
    const fillMat = new THREE.MeshBasicMaterial({ color: fill, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const meshes = []; group.traverse((o) => { if (o.isMesh) meshes.push(o); });
    for (const o of meshes) {
      const part = partOf(o);
      if (o.userData.noEdges) { o.visible = o === stream; o.material = new THREE.MeshBasicMaterial({ color: ink }); continue; }
      const lm = new THREE.LineBasicMaterial({ color: ink }); lm.userData.part = part; lineMats.push(lm);
      o.add(new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 30), lm));
      const hull = new THREE.ShaderMaterial({
        uniforms: { color: { value: new THREE.Color(ink) }, width: { value: 0.0035 } },
        vertexShader: "uniform float width; void main(){ vec3 p = position + normal * width; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }",
        fragmentShader: "uniform vec3 color; void main(){ gl_FragColor = vec4(color, 1.0); }",
        side: THREE.BackSide,
      });
      hull.userData.part = part; lineMats.push(hull);
      const outline = new THREE.Mesh(o.geometry, hull); outline.userData.noEdges = true; o.add(outline);
      o.material = fillMat;
    }
    steam.visible = false;
  }

  /* ----- animation ----- */
  let prog = 0;
  const REST = new THREE.Vector3(-0.3, 1.12, -0.12);
  const ease = (t) => t * t * (3 - 2 * t);
  const cl = (t) => Math.min(1, Math.max(0, t));
  const fillLevel = () => cl((prog - 0.18) / 0.5);
  let sweepT = 0;
  function armTarget() {
    const over = new THREE.Vector3(STAGE.x, STAGE.y + topY() + 0.2, STAGE.z);
    if (type === "znapcase") { over.z += Math.sin(sweepT * 9) * 0.06 * (prog > 0.17 && prog < 0.7 ? 1 : 0); over.y = STAGE.y + 0.16; }
    if (type === "frosti") over.y = STAGE.y + 0.145 + Math.min(2, Math.floor(fillLevel() * 3)) * 0.05 + 0.2;
    let k;
    if (prog < 0.15) k = ease(prog / 0.15); else if (prog < 0.78) k = 1; else if (prog < 0.95) k = 1 - ease((prog - 0.78) / 0.17); else k = 0;
    return REST.clone().lerp(over, k);
  }
  function solveIK(target) {
    group.updateMatrixWorld(true);
    const local = armBase.worldToLocal(target.clone());
    yaw.rotation.y = Math.atan2(-local.z, local.x);
    const d = Math.hypot(local.x, local.z), h = local.y - 0.19;
    const r = Math.min(Math.hypot(d, h), L1 + L2 - 1e-3);
    const a2 = -Math.acos(Math.max(-1, Math.min(1, (r * r - L1 * L1 - L2 * L2) / (2 * L1 * L2))));
    const a1 = Math.atan2(h, d) - Math.atan2(L2 * Math.sin(a2), L1 + L2 * Math.cos(a2));
    upper.rotation.z = a1; elbow.rotation.z = a2; wrist.rotation.z = -Math.PI / 2 - a1 - a2;
  }
  // world <-> group conversions use the group's world matrix so machines can be placed anywhere
  const tmp = new THREE.Vector3();
  function update(dt, time) {
    sweepT = time;
    solveIK(armTarget().applyMatrix4(group.matrixWorld));
    const info = applyProduct(fillLevel());
    group.updateMatrixWorld(true);
    const pouring = prog > 0.17 && prog < 0.7;
    const tipL = B.worldToLocal(tip.getWorldPosition(tmp.set(0, 0, 0)).clone());
    const surfL = B.worldToLocal(product.localToWorld(new THREE.Vector3(0, info.surface, 0)));
    const len = Math.max(0.001, tipL.y - surfL.y);
    stream.visible = pouring;
    if (info.sweep) { stream.scale.set(3.5, len, 0.6); stream.material.emissive?.setHex(0x6a3cff); }
    else stream.scale.set(1 + Math.sin(time * 40) * 0.08, len, 1);
    stream.position.set(tipL.x, surfL.y + len / 2, tipL.z);
    const steamOn = info.steam && prog > 0.45 && prog < 0.98 ? 1 : 0;
    steam.children.forEach((s) => {
      const ph = (time * 0.35 + s.userData.seed) % 1;
      s.position.set(STAGE.x + Math.sin(ph * 8 + s.userData.seed * 9) * 0.02, STAGE.y + topY() + 0.03 + ph * 0.22, STAGE.z + Math.cos(ph * 6) * 0.015);
      s.scale.setScalar(0.03 + ph * 0.07);
      s.material.opacity = steamOn * Math.sin(ph * Math.PI) * 0.35;
    });
    M.accent.emissiveIntensity = 1.15 + Math.sin(time * 2.1) * 0.08;
  }
  function setExplode(t) { const k = ease(cl(t)); for (const [n, g] of Object.entries(parts)) { const e = EXPLODE[n]; g.position.set(e[0] * k, e[1] * k, e[2] * k); } }
  function highlight(name, color = 0xd0633a) {
    for (const lm of lineMats) { const c = name && lm.userData.part === name ? color : ink; if (lm.uniforms) lm.uniforms.color.value.setHex(c); else lm.color.setHex(c); }
  }

  const VARIANTS = { beanbox: "latte", frosti: "berry", znapcase: "aurora" };
  variant(VARIANTS[type]);
  setExplode(0);
  group.updateMatrixWorld(true);
  update(0, 0);
  return {
    type, group, parts, materials: M, stage: STAGE,
    setProgress: (p) => { prog = cl(p); },
    setVariant: (k) => variant(k),
    setExplode, highlight, update,
  };
}

/* ---------- stage helpers ---------- */
export function makeRenderer(canvas, { alpha = true } = {}) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha });
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  return r;
}
export function fitRenderer(renderer, camera, el) {
  const w = el.clientWidth, h = el.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
export function studioLights(scene, { tint = 0xffb15c, intensity = 1 } = {}) {
  scene.add(new THREE.HemisphereLight(0xd8d2ff, 0x10121c, 0.3));
  const key = new THREE.SpotLight(0xfff4e8, 40 * intensity, 14, Math.PI / 5, 0.6, 1.3);
  key.position.set(2.6, 4.2, 3.4); key.target.position.set(0, 0.9, 0);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x6d8dff, 1.4); rim.position.set(-3, 2.5, -2.5); scene.add(rim);
  const fill = new THREE.PointLight(tint, 1.4, 7, 2); fill.position.set(0.5, 1.6, 3.2); scene.add(fill);
  return { key, rim, fill };
}
/** a warm/cool light inside each machine's window, added per machine */
export function interiorLight(machine, color) {
  const l = new THREE.PointLight(color ?? 0xffa64d, 3.2, 1.6, 1.4);
  l.position.set(-0.1, 1.48, 0.12);
  machine.group.add(l);
  return l;
}
export const INTERIOR_LIGHT = { beanbox: 0xffa64d, frosti: 0x9fe3ff, znapcase: 0xc9a6ff };
