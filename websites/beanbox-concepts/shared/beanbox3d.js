/* Bean Box — procedural 3D model shared by all three concepts.
 *
 *   const bb = createBeanBox({ mode: "real" | "line" });
 *   scene.add(bb.group);
 *   bb.setBrew(p)          // 0..1 brew cycle: arm moves, pours, cup fills, returns
 *   bb.setDrink("latte")   // "espresso" | "latte" | "iced"
 *   bb.setExplode(t)       // 0..1 exploded view (components fly apart)
 *   bb.highlight("arm")    // line mode: colour one component
 *   bb.update(dt, time)    // per frame: stream, steam, light flicker
 *
 * Units are metres; origin is the floor centre, front faces +Z.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "../vendor/RoundedBoxGeometry.js";

const AMBER = 0xffb15c;

export const PARTS = {
  shell: { label: "Cabinet & glass", explode: [0, 0, -0.35] },
  header: { label: "Illuminated header", explode: [0, 0.34, 0.1] },
  hopper: { label: "Bean hopper & grinder", explode: [-0.65, 0.3, 0.35] },
  arm: { label: "6-axis robotic barista", explode: [0.1, 0.25, 1.05] },
  brew: { label: "Brew stage & cup", explode: [0.25, -0.05, 0.95] },
  milk: { label: "Refrigerated milk module", explode: [-0.55, -0.15, 0.85] },
  cups: { label: "Cup dispenser", explode: [0.75, 0.35, 0.45] },
  screen: { label: "Touchscreen & payment", explode: [0.8, -0.05, 0.75] },
};

export const DRINKS = {
  espresso: { name: "Espresso", cupH: 0.075, cupR: 0.038, fill: 0.55, color: 0x3a1d0c, foam: 0xc98a4b, ice: false },
  latte: { name: "Latte", cupH: 0.13, cupR: 0.046, fill: 0.86, color: 0xb57a48, foam: 0xf3e6d0, ice: false },
  iced: { name: "Iced Latte", cupH: 0.15, cupR: 0.05, fill: 0.82, color: 0xc49a6c, foam: 0xd9b88f, ice: true },
};

/* ---------- canvas textures ---------- */
function canvasTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function signTexture() {
  return canvasTex(1024, 256, (g, w, h) => {
    g.fillStyle = "#07070a"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#ffb15c"; g.lineWidth = 10; g.lineCap = "round"; g.lineJoin = "round";
    // cup icon
    g.beginPath(); g.moveTo(250, 105); g.lineTo(350, 105); g.lineTo(342, 175); g.quadraticCurveTo(300, 200, 258, 175); g.closePath(); g.stroke();
    g.beginPath(); g.arc(360, 135, 18, -Math.PI / 2, Math.PI / 2); g.stroke();
    g.beginPath(); g.moveTo(240, 205); g.lineTo(360, 205); g.stroke();
    [275, 300, 325].forEach((x) => { g.beginPath(); g.moveTo(x, 90); g.bezierCurveTo(x - 10, 75, x + 10, 65, x, 50); g.stroke(); });
    g.fillStyle = "#f6efe4"; g.font = "700 108px 'Inter Tight', Inter, Arial, sans-serif"; g.textBaseline = "middle";
    g.fillText("Bean Box", 400, 135);
  });
}
function screenTexture() {
  return canvasTex(256, 400, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, "#151a26"); grd.addColorStop(1, "#0a0d14");
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.fillStyle = "#ffb15c"; g.font = "700 22px Inter, Arial"; g.fillText("Choose your drink", 18, 38);
    const cols = ["#ffb15c", "#ff8a4c", "#48cfff", "#f3e6d0", "#c98a4b", "#3ee69a"];
    for (let i = 0; i < 6; i++) {
      const x = 18 + (i % 2) * 114, y = 60 + Math.floor(i / 2) * 100;
      g.fillStyle = "rgba(255,255,255,.06)"; g.fillRect(x, y, 104, 90);
      g.fillStyle = cols[i]; g.beginPath(); g.arc(x + 52, y + 38, 20, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#cfd6e4"; g.fillRect(x + 22, y + 68, 60, 6);
    }
    g.fillStyle = "#ffb15c"; g.fillRect(18, 362, 220, 26);
  });
}
function beanTexture() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#2a160a"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * w, y = Math.random() * h, r = 7 + Math.random() * 4, a = Math.random() * Math.PI;
      g.save(); g.translate(x, y); g.rotate(a);
      g.fillStyle = ["#5a3218", "#6b3c1d", "#4a2812", "#7a4622"][i % 4];
      g.beginPath(); g.ellipse(0, 0, r, r * 0.68, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "rgba(20,8,2,.8)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-r * 0.8, 0); g.quadraticCurveTo(0, r * 0.25, r * 0.8, 0); g.stroke();
      g.restore();
    }
  });
}
function woodTexture() {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#6a3f22"; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 2) {
      const v = Math.sin(x * 0.05) * 18 + Math.sin(x * 0.31) * 9 + (Math.random() - 0.5) * 16;
      g.fillStyle = `rgba(${v > 0 ? "255,190,130" : "30,12,4"},${Math.min(0.28, Math.abs(v) / 90)})`;
      g.fillRect(x, 0, 2, h);
    }
    for (let y = 0; y < h; y += 128) { g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(0, y, w, 2); }
  });
}

/* ---------- helpers ---------- */
const boxMesh = (w, h, d, mat, r = 0) =>
  new THREE.Mesh(r ? new RoundedBoxGeometry(w, h, d, 3, r) : new THREE.BoxGeometry(w, h, d), mat);
function at(mesh, x, y, z) { mesh.position.set(x, y, z); return mesh; }

/* ---------- model ---------- */
export function createBeanBox({ mode = "real", fill = 0xe8e4dd, ink = 0x15151a } = {}) {
  const line = mode === "line";
  // blueprint mode uses square edges so every outline is drawn
  const box = (w, h, d, mat, r = 0) => boxMesh(w, h, d, mat, line ? 0 : r);
  const group = new THREE.Group();
  const parts = {};
  for (const k of Object.keys(PARTS)) {
    const g = new THREE.Group();
    g.name = k;
    g.userData.home = new THREE.Vector3();
    parts[k] = g;
    group.add(g);
  }

  const M = {
    body: new THREE.MeshStandardMaterial({ color: 0x171a22, metalness: 0.75, roughness: 0.32 }),
    frame: new THREE.MeshStandardMaterial({ color: 0x121214, metalness: 0.3, roughness: 0.55 }),
    amber: new THREE.MeshStandardMaterial({ color: 0x000000, emissive: AMBER, emissiveIntensity: 1.25, toneMapped: false }),
    wood: new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.55, metalness: 0.05 }),
    sign: new THREE.MeshStandardMaterial({ color: 0x000000, emissiveMap: signTexture(), emissive: 0xffffff, emissiveIntensity: 1.3 }),
    screen: new THREE.MeshStandardMaterial({ color: 0x000000, emissiveMap: screenTexture(), emissive: 0xffffff, emissiveIntensity: 1.1 }),
    interior: new THREE.MeshStandardMaterial({ color: 0x3a2618, metalness: 0.2, roughness: 0.55, emissive: 0x4a2410, emissiveIntensity: 0.9 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xc9ced8, metalness: 0.9, roughness: 0.22 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf3f2ee, metalness: 0.05, roughness: 0.28 }),
    joint: new THREE.MeshStandardMaterial({ color: 0xb8bfcb, metalness: 0.6, roughness: 0.3 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, roughness: 0.02, metalness: 0, clearcoat: 1 }),
    cupGlass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.28, roughness: 0.05, clearcoat: 1, side: THREE.DoubleSide }),
    coffee: new THREE.MeshStandardMaterial({ color: 0xb57a48, roughness: 0.25 }),
    foam: new THREE.MeshStandardMaterial({ color: 0xf3e6d0, roughness: 0.6 }),
    stream: new THREE.MeshStandardMaterial({ color: 0x6b3a18, roughness: 0.2, emissive: 0x2a1205, emissiveIntensity: 0.4 }),
    beans: new THREE.MeshStandardMaterial({ map: beanTexture(), roughness: 0.55 }),
    hopperGlass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, roughness: 0.05 }),
    ice: new THREE.MeshPhysicalMaterial({ color: 0xe8f7ff, transparent: true, opacity: 0.55, roughness: 0.1 }),
    fridge: new THREE.MeshStandardMaterial({ color: 0xdfe5ee, metalness: 0.4, roughness: 0.4 }),
    milk: new THREE.MeshStandardMaterial({ color: 0xfaf7f0, roughness: 0.5 }),
  };

  /* ----- shell ----- */
  const S = parts.shell;
  S.add(at(box(0.07, 1.55, 0.76, M.body, 0.02), -0.465, 0.83, 0)); // left column
  S.add(at(box(0.33, 1.55, 0.76, M.body, 0.02), 0.335, 0.83, 0)); // right column
  S.add(at(box(0.62, 0.74, 0.76, M.body), -0.12, 0.43, 0)); // lower cabinet
  S.add(at(box(0.62, 0.72, 0.06, M.interior), -0.12, 1.2, -0.35)); // cavity back
  S.add(at(box(0.66, 0.04, 0.72, M.frame), -0.12, 0.82, 0)); // counter
  S.add(at(box(1.02, 0.06, 0.8, M.frame, 0.02), 0, 0.03, 0)); // plinth
  const wood = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.62), M.wood);
  S.add(at(wood, -0.12, 0.45, 0.381));
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.72), M.glass);
  glass.userData.noEdges = true;
  S.add(at(glass, -0.12, 1.2, 0.372));
  S.add(at(box(0.62, 0.008, 0.008, M.amber), -0.12, 0.795, 0.384)); // counter light
  S.add(at(box(0.008, 1.5, 0.008, M.amber), -0.432, 0.85, 0.384)); // vertical strips
  S.add(at(box(0.008, 1.5, 0.008, M.amber), 0.172, 0.85, 0.384));
  S.add(at(box(0.6, 0.012, 0.012, M.amber), -0.12, 1.54, 0.2)); // cavity ceiling light
  // pickup hatch on right column
  S.add(at(box(0.2, 0.16, 0.01, M.frame), 0.335, 0.62, 0.382));

  /* ----- header ----- */
  const H = parts.header;
  H.add(at(box(1.02, 0.36, 0.8, M.frame, 0.03), 0, 1.79, 0));
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.225), M.sign);
  H.add(at(sign, 0, 1.79, 0.402));
  H.add(at(box(1.0, 0.008, 0.008, M.amber), 0, 1.6, 0.398));

  /* ----- hopper & grinder ----- */
  const HP = parts.hopper;
  HP.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.05, 0.2, 32, 1, true), M.hopperGlass), -0.33, 1.38, -0.2));
  HP.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.05, 0.15, 32), M.beans), -0.33, 1.35, -0.2));
  HP.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.012, 32), M.steel), -0.33, 1.485, -0.2));
  HP.add(at(box(0.13, 0.17, 0.13, M.steel, 0.015), -0.33, 1.19, -0.2));
  HP.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 16), M.frame), -0.33, 1.08, -0.2));

  /* ----- robotic arm ----- */
  const A = parts.arm;
  const armBase = new THREE.Group();
  armBase.position.set(-0.22, 0.84, -0.02);
  A.add(armBase);
  armBase.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.05, 32), M.joint), 0, 0.025, 0));
  const yaw = new THREE.Group(); yaw.position.y = 0.05; armBase.add(yaw);
  yaw.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.12, 32), M.white), 0, 0.06, 0));
  const shoulder = new THREE.Group(); shoulder.position.y = 0.14; yaw.add(shoulder);
  shoulder.add(new THREE.Mesh(new THREE.SphereGeometry(0.052, 24, 16), M.joint));
  const L1 = 0.27, L2 = 0.23;
  const upper = new THREE.Group(); shoulder.add(upper);
  const uMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.038, L1, 8, 20), M.white);
  uMesh.rotation.z = -Math.PI / 2; uMesh.position.x = L1 / 2; upper.add(uMesh);
  const elbow = new THREE.Group(); elbow.position.x = L1; upper.add(elbow);
  elbow.add(new THREE.Mesh(new THREE.SphereGeometry(0.044, 24, 16), M.joint));
  const fMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, L2, 8, 20), M.white);
  fMesh.rotation.z = -Math.PI / 2; fMesh.position.x = L2 / 2; elbow.add(fMesh);
  const wrist = new THREE.Group(); wrist.position.x = L2; elbow.add(wrist);
  wrist.add(new THREE.Mesh(new THREE.SphereGeometry(0.034, 20, 14), M.joint));
  const head = box(0.09, 0.05, 0.05, M.white, 0.012); head.position.x = 0.05; wrist.add(head);
  const nozzleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.03, 16), M.steel);
  nozzleMesh.rotation.z = Math.PI / 2; nozzleMesh.position.x = 0.105; wrist.add(nozzleMesh);
  const tip = new THREE.Object3D(); tip.position.x = 0.12; wrist.add(tip);

  /* ----- brew stage & cup ----- */
  const B = parts.brew;
  const CUP = new THREE.Vector3(0.02, 0.84, 0.1);
  B.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 32), M.steel), CUP.x, CUP.y + 0.006, CUP.z));
  const cup = new THREE.Group(); cup.position.copy(CUP).add(new THREE.Vector3(0, 0.012, 0)); B.add(cup);
  const cupShell = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.8, 1, 40, 1, true), M.cupGlass);
  const cupBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.04, 40), M.cupGlass);
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.8, 1, 40), M.coffee);
  const foam = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.96, 0.08, 40), M.foam);
  const ice = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const c = box(0.42, 0.42, 0.42, M.ice, 0.06);
    c.position.set(Math.cos(i * 1.7) * 0.35, 0.3 + i * 0.16, Math.sin(i * 1.7) * 0.35);
    c.rotation.set(i, i * 0.7, i * 0.3);
    ice.add(c);
  }
  cup.add(cupShell, cupBottom, liquid, foam, ice);
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 1, 12), M.stream);
  stream.userData.noEdges = true;
  B.add(stream);
  const steam = new THREE.Group();
  const puff = canvasTex(64, 64, (g, w) => {
    const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    r.addColorStop(0, "rgba(255,255,255,.9)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, w, w);
  });
  for (let i = 0; i < 8; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puff, transparent: true, opacity: 0, depthWrite: false }));
    s.userData.seed = i / 8;
    steam.add(s);
  }
  B.add(steam);

  /* ----- milk module (inside lower cabinet) ----- */
  const MK = parts.milk;
  MK.add(at(box(0.36, 0.42, 0.42, M.fridge, 0.02), -0.2, 0.36, -0.05));
  [-0.27, -0.13].forEach((x) => MK.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.22, 24), M.milk), x, 0.36, 0.08)));
  MK.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.4, 8), M.steel), -0.05, 0.62, 0.0));

  /* ----- cup dispenser (inside right column) ----- */
  const CP = parts.cups;
  CP.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 24, 1, true), M.hopperGlass), 0.34, 1.0, -0.15));
  for (let i = 0; i < 9; i++) CP.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.04, 0.09, 24, 1, true), M.white), 0.34, 0.8 + i * 0.045, -0.15));
  CP.add(at(box(0.16, 0.05, 0.16, M.steel, 0.01), 0.34, 0.73, -0.15));

  /* ----- touchscreen & payment ----- */
  const SC = parts.screen;
  SC.add(at(box(0.23, 0.36, 0.02, M.frame, 0.01), 0.335, 1.3, 0.385));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.32), M.screen); SC.add(at(scr, 0.335, 1.3, 0.397));
  SC.add(at(box(0.16, 0.09, 0.015, M.frame, 0.01), 0.335, 1.03, 0.388));
  const nfc = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.004, 8, 32), M.amber); SC.add(at(nfc, 0.335, 1.03, 0.398));
  for (let i = 0; i < 3; i++) {
    const btn = at(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 16), M.amber), 0.28 + i * 0.055, 0.92, 0.39);
    btn.rotation.x = Math.PI / 2;
    SC.add(btn);
  }

  group.traverse((o) => { if (o.isMesh) { o.castShadow = !line; o.receiveShadow = !line; } });

  /* ----- line (blueprint) mode ----- */
  const lineMats = [];
  if (line) {
    const fillMat = new THREE.MeshBasicMaterial({ color: fill, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const meshes = [];
    group.traverse((o) => { if (o.isMesh) meshes.push(o); });
    for (const o of meshes) {
      const part = partOf(o);
      if (o.userData.noEdges) { o.visible = o === stream; o.material = new THREE.MeshBasicMaterial({ color: ink }); continue; }
      // crisp feature edges
      const lm = new THREE.LineBasicMaterial({ color: ink });
      lm.userData.part = part; lineMats.push(lm);
      o.add(new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 30), lm));
      // silhouette: back faces pushed out along their normals (inverted hull)
      const hull = new THREE.ShaderMaterial({
        uniforms: { color: { value: new THREE.Color(ink) }, width: { value: 0.0035 } },
        vertexShader: "uniform float width; void main(){ vec3 p = position + normal * width; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }",
        fragmentShader: "uniform vec3 color; void main(){ gl_FragColor = vec4(color, 1.0); }",
        side: THREE.BackSide,
      });
      hull.userData.part = part; lineMats.push(hull);
      const outline = new THREE.Mesh(o.geometry, hull);
      outline.userData.noEdges = true;
      o.add(outline);
      o.material = fillMat;
    }
  }
  function partOf(o) { let p = o; while (p && !PARTS[p.name]) p = p.parent; return p ? p.name : null; }

  /* ----- state ----- */
  let drink = DRINKS.latte;
  let brew = 0;
  const tmp = new THREE.Vector3();
  const REST = new THREE.Vector3(-0.3, 1.12, -0.12); // wrist position at the grinder

  function setDrink(key) {
    drink = DRINKS[key] || DRINKS.latte;
    M.coffee.color.setHex(drink.color);
    M.foam.color.setHex(drink.foam);
    applyCup();
  }
  function applyCup() {
    const r = drink.cupR, h = drink.cupH;
    cupShell.scale.set(r, h, r); cupShell.position.y = h / 2;
    cupBottom.scale.set(r, 1, r); cupBottom.position.y = 0.002;
    ice.visible = drink.ice && fillLevel() > 0.15;
    ice.scale.set(r, h * 0.6, r);
    const f = fillLevel();
    const lh = Math.max(0.0001, h * drink.fill * f);
    liquid.scale.set(r * 0.92, lh, r * 0.92); liquid.position.y = lh / 2 + 0.002;
    liquid.visible = f > 0.01;
    foam.scale.set(r * 0.93, 1, r * 0.93); foam.position.y = lh + 0.004;
    foam.visible = f > 0.75 && drink !== DRINKS.iced;
  }
  // brew phases
  const ease = (t) => t * t * (3 - 2 * t);
  const clamp01 = (t) => Math.min(1, Math.max(0, t));
  function fillLevel() { return clamp01((brew - 0.18) / 0.5); }
  function armTarget() {
    const over = new THREE.Vector3(CUP.x, CUP.y + drink.cupH + 0.2, CUP.z); // wrist above cup
    let k;
    if (brew < 0.15) k = ease(brew / 0.15);
    else if (brew < 0.78) k = 1;
    else if (brew < 0.95) k = 1 - ease((brew - 0.78) / 0.17);
    else k = 0;
    return REST.clone().lerp(over, k);
  }
  function solveIK(targetWorld) {
    group.updateMatrixWorld(true);
    const base = armBase.getWorldPosition(new THREE.Vector3());
    const local = armBase.worldToLocal(targetWorld.clone());
    yaw.rotation.y = Math.atan2(-local.z, local.x);
    const d = Math.hypot(local.x, local.z);
    const h = local.y - 0.19;
    const r = Math.min(Math.hypot(d, h), L1 + L2 - 1e-3);
    const c2 = (r * r - L1 * L1 - L2 * L2) / (2 * L1 * L2);
    const a2 = -Math.acos(Math.max(-1, Math.min(1, c2)));
    const a1 = Math.atan2(h, d) - Math.atan2(L2 * Math.sin(a2), L1 + L2 * Math.cos(a2));
    upper.rotation.z = a1; elbow.rotation.z = a2; wrist.rotation.z = -Math.PI / 2 - a1 - a2;
    return base;
  }
  function setBrew(p) { brew = clamp01(p); }

  // explode
  function setExplode(t) {
    const k = ease(clamp01(t));
    for (const [k2, g] of Object.entries(parts)) {
      const e = PARTS[k2].explode;
      g.position.set(e[0] * k, e[1] * k, e[2] * k);
    }
  }
  function highlight(name, color = 0xd0633a) {
    for (const lm of lineMats) {
      const c = name && lm.userData.part === name ? color : ink;
      if (lm.uniforms) lm.uniforms.color.value.setHex(c); else lm.color.setHex(c);
    }
  }

  function update(dt, time) {
    solveIK(armTarget());
    applyCup();
    group.updateMatrixWorld(true);
    // stream from nozzle tip to liquid surface while pouring
    const pouring = brew > 0.17 && brew < 0.7;
    const tipW = tip.getWorldPosition(tmp.set(0, 0, 0)).clone();
    const surfW = cup.localToWorld(new THREE.Vector3(0, liquid.scale.y + 0.004, 0));
    const tipL = B.worldToLocal(tipW.clone()), surfL = B.worldToLocal(surfW.clone());
    const len = Math.max(0.001, tipL.y - surfL.y);
    stream.visible = pouring && (line ? true : true);
    stream.scale.set(1 + Math.sin(time * 40) * 0.08, len, 1);
    stream.position.set(tipL.x, surfL.y + len / 2, tipL.z);
    // steam after pouring
    const steamOn = !drink.ice && brew > 0.45 && brew < 0.98 ? 1 : 0;
    steam.children.forEach((s) => {
      const ph = (time * 0.35 + s.userData.seed) % 1;
      s.position.set(CUP.x + Math.sin(ph * 8 + s.userData.seed * 9) * 0.02, CUP.y + drink.cupH + 0.03 + ph * 0.22, CUP.z + Math.cos(ph * 6) * 0.015);
      s.scale.setScalar(0.03 + ph * 0.07);
      s.material.opacity = steamOn * Math.sin(ph * Math.PI) * 0.35;
      s.visible = !line;
    });
    // gentle light flicker
    M.amber.emissiveIntensity = 1.15 + Math.sin(time * 2.1) * 0.08;
  }

  setDrink("latte");
  setExplode(0);
  update(0, 0);

  return { group, parts, materials: M, setBrew, setDrink, setExplode, highlight, update, get drink() { return drink; }, cupPosition: CUP, PARTS };
}

/* ---------- shared stage helpers ---------- */
export function makeRenderer(canvas, { alpha = true } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}
export function fitRenderer(renderer, camera, el) {
  const w = el.clientWidth, h = el.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
export function studioLights(scene, { warm = 1 } = {}) {
  scene.add(new THREE.HemisphereLight(0xd8d2ff, 0x1a0d06, 0.25));
  const key = new THREE.SpotLight(0xfff1dc, 38 * warm, 9, Math.PI / 6, 0.6, 1.4);
  key.position.set(2.2, 3.6, 2.8); key.target.position.set(0, 0.9, 0);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x6d8dff, 1.4); rim.position.set(-3, 2.5, -2.5); scene.add(rim);
  const inside = new THREE.PointLight(0xffa64d, 3.2, 1.6, 1.4); inside.position.set(-0.1, 1.48, 0.12); scene.add(inside);
  const fill = new THREE.PointLight(0xffb15c, 3, 4, 2); fill.position.set(0, 0.4, 1.6); scene.add(fill);
  return { key, rim, inside, fill };
}
