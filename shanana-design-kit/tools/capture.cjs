// Generates the design kit's raster assets.
//   1. renders/   — high-resolution product renderings (3 angles × studio/cutout) + flat artwork
//   2. previews/  — every page at desktop / tablet / mobile, 2× scale, sliced into tiles ≤ 4000 px
//                   (Figma's image limit is 4096 px per side)
// Usage (from repo root):
//   python3 -m http.server 8766 &   node shanana-design-kit/tools/capture.cjs
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.BASE || "http://localhost:8766";
const KIT = path.join(__dirname, "..");
const SCALE = 2;
const TILE = 2000; // CSS px per tile → 4000 px at 2×

const ANGLES = [
  { id: "01-front", angle: 0 },
  { id: "02-three-quarter", angle: -32 },
  { id: "03-three-quarter-right", angle: 32 },
];
const DEVICES = [
  { id: "desktop", width: 1440, height: 900 },
  { id: "tablet", width: 834, height: 1194 },
  { id: "mobile", width: 390, height: 844 },
];
const PAGES = [
  ["01-home", "index.html"], ["02-our-coffee", "coffee.html"], ["03-collection", "collection.html"],
  ["04-heritage", "heritage.html"], ["05-beyond-the-cup", "impact.html"], ["06-wholesale", "wholesale.html"],
  ["07-contact", "contact.html"],
];

async function renders(browser) {
  const out = path.join(KIT, "renders");
  fs.mkdirSync(out, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 1100 }, deviceScaleFactor: 3, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  for (const a of ANGLES) {
    for (const variant of ["studio", "cutout"]) {
      await page.goto(`${BASE}/shanana-design-kit/tools/render.html?angle=${a.angle}&variant=${variant === "cutout" ? "no-shadow" : "studio"}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      const box = await page.evaluate(() => {
        const r = [...document.querySelectorAll(".bag__face, .bag__top, .viewer__shadow")].filter((e) => e && getComputedStyle(e).display !== "none").map((e) => e.getBoundingClientRect());
        const x1 = Math.min(...r.map((b) => b.left)), y1 = Math.min(...r.map((b) => b.top));
        const x2 = Math.max(...r.map((b) => b.right)), y2 = Math.max(...r.map((b) => b.bottom));
        return { x1, y1, x2, y2 };
      });
      const pad = variant === "studio" ? 90 : 24;
      const clip = { x: Math.max(0, box.x1 - pad), y: Math.max(0, box.y1 - pad) };
      clip.width = Math.min(1200 - clip.x, box.x2 - box.x1 + pad * 2);
      clip.height = Math.min(1100 - clip.y, box.y2 - box.y1 + pad * 2);
      const file = path.join(out, `shanana-bag-${a.id}-${variant === "studio" ? "studio-white" : "transparent"}.png`);
      await page.screenshot({ path: file, clip, omitBackground: variant === "cutout" });
      console.log("render", path.basename(file));
    }
  }
  // Flat front artwork at 4× (2400 × 3360)
  await page.setViewportSize({ width: 600, height: 840 });
  await page.goto(`${BASE}/shanana-coffee/assets/img/products/bag-front-placeholder.svg`);
  const art = await browser.newContext({ viewport: { width: 600, height: 840 }, deviceScaleFactor: 4 });
  const ap = await art.newPage();
  await ap.setContent(`<style>html,body{margin:0}</style><img src="${BASE}/shanana-coffee/assets/img/products/bag-front-placeholder.svg" width="600" height="840" style="display:block">`);
  await ap.waitForTimeout(300);
  await ap.screenshot({ path: path.join(out, "shanana-bag-front-artwork-flat-2400x3360.png") });
  await art.close();
  await ctx.close();
}

async function previews(browser) {
  for (const d of DEVICES) {
    const ctx = await browser.newContext({
      viewport: { width: d.width, height: d.height }, deviceScaleFactor: SCALE, reducedMotion: "reduce",
      isMobile: d.id === "mobile", hasTouch: d.id !== "desktop",
    });
    for (const [id, file] of PAGES) {
      const page = await ctx.newPage();
      await page.goto(`${BASE}/shanana-coffee/${file}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      const dir = path.join(KIT, "previews", d.id, id);
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });
      let n = 0;
      for (let y = 0; y < height; y += TILE) {
        n++;
        await page.screenshot({
          path: path.join(dir, `tile-${String(n).padStart(2, "0")}.jpg`), type: "jpeg", quality: 90, fullPage: true,
          clip: { x: 0, y, width: d.width, height: Math.min(TILE, height - y) },
        });
      }
      fs.writeFileSync(path.join(dir, "frame.json"), JSON.stringify({ page: id, device: d.id, width: d.width, height, scale: SCALE, tileHeight: TILE, tiles: n }, null, 2));
      console.log("preview", d.id, id, `${d.width}×${height}`, `${n} tile(s)`);
      await page.close();
    }
    await ctx.close();
  }
}

(async () => {
  const browser = await chromium.launch();
  const only = process.argv[2];
  if (!only || only === "renders") await renders(browser);
  if (!only || only === "previews") await previews(browser);
  await browser.close();
})();
