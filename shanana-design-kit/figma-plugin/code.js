// Shanana Design Kit Importer — builds the kit as Figma pages.
// Pages: 01 Preview · 02 Product Renders · 03 Icons · 04 Illustrations
figma.showUI(__html__, { width: 360, height: 330 });

const files = {};
const say = (text, error) => figma.ui.postMessage({ text, error: !!error });
const GOLD = { r: 0.541, g: 0.42, b: 0.235 };
const INK = { r: 0.067, g: 0.067, b: 0.063 };

function sortKeys(o) { return Object.keys(o).sort(); }

async function label(parent, text, x, y, size, color) {
  const t = figma.createText();
  t.fontName = { family: "Inter", style: size > 20 ? "Medium" : "Regular" };
  t.fontSize = size;
  t.characters = text;
  t.fills = [{ type: "SOLID", color: color || INK }];
  t.x = x; t.y = y;
  parent.appendChild(t);
  return t;
}

function imageRect(bytes, w, h, name) {
  const img = figma.createImage(bytes);
  const r = figma.createRectangle();
  r.name = name;
  r.resize(w, h);
  r.fills = [{ type: "IMAGE", imageHash: img.hash, scaleMode: "FILL" }];
  return r;
}

async function buildPreview(page) {
  // Group tiles: previews/<device>/<page-id>/tile-NN.jpg + frame.json
  const frames = {};
  for (const p of sortKeys(files)) {
    const m = p.match(/^previews\/(desktop|tablet|mobile)\/([^/]+)\/(.+)$/);
    if (!m) continue;
    const key = m[2], dev = m[1];
    frames[key] = frames[key] || {};
    frames[key][dev] = frames[key][dev] || { tiles: [] };
    if (m[3] === "frame.json") frames[key][dev].meta = JSON.parse(files[p]);
    else frames[key][dev].tiles.push(p);
  }
  const order = ["desktop", "tablet", "mobile"];
  const GAP = 200;
  let y = 0;
  await label(page, "Shanana Coffee — Website preview", 0, y, 64);
  await label(page, "Desktop 1440 · Tablet 834 · Mobile 390 — rendered at 2×. Product imagery is an illustrative render.", 0, y + 90, 20, GOLD);
  y += 220;
  for (const key of sortKeys(frames)) {
    let x = 0, rowH = 0;
    const pretty = key.replace(/^\d+-/, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    await label(page, pretty, 0, y, 40);
    y += 80;
    for (const dev of order) {
      const f = frames[key][dev];
      if (!f || !f.meta) continue;
      const { width, height, tileHeight } = f.meta;
      await label(page, `${dev[0].toUpperCase() + dev.slice(1)} · ${width}px`, x, y, 18, GOLD);
      const frame = figma.createFrame();
      frame.name = `${pretty} / ${dev[0].toUpperCase() + dev.slice(1)}`;
      frame.resize(width, height);
      frame.x = x; frame.y = y + 40;
      frame.clipsContent = true;
      f.tiles.sort().forEach((p, i) => {
        const h = Math.min(tileHeight, height - i * tileHeight);
        const r = imageRect(files[p], width, h, `tile ${i + 1}`);
        r.y = i * tileHeight;
        frame.appendChild(r);
      });
      page.appendChild(frame);
      x += width + GAP;
      rowH = Math.max(rowH, height);
    }
    y += rowH + 40 + 300;
  }
}

async function buildRenders(page) {
  await label(page, "Product renders — illustrative (replace with real photography)", 0, 0, 40);
  let x = 0;
  const paths = sortKeys(files).filter((p) => p.startsWith("renders/"));
  for (const p of paths) {
    const img = figma.createImage(files[p]);
    const { width, height } = await img.getSizeAsync();
    const scale = 1 / 3; // renders were captured at 3×
    const r = figma.createRectangle();
    r.name = p.split("/").pop().replace(/\.png$/, "");
    r.resize(Math.round(width * scale), Math.round(height * scale));
    r.fills = [{ type: "IMAGE", imageHash: img.hash, scaleMode: "FILL" }];
    r.x = x; r.y = 100;
    page.appendChild(r);
    await label(page, r.name, x, 100 + r.height + 20, 14, GOLD);
    x += r.width + 120;
  }
}

function svgNode(text, name) {
  const node = figma.createNodeFromSvg(text.replace(/currentColor/g, "#111110"));
  node.name = name;
  return node;
}

async function buildIcons(page) {
  await label(page, "Icons — components (outline, 1.5 stroke)", 0, 0, 40);
  const groups = {};
  for (const p of sortKeys(files)) {
    const m = p.match(/^icons\/([^/]+)\/(.+)\.svg$/);
    if (m) (groups[m[1]] = groups[m[1]] || []).push([m[2], p]);
  }
  let y = 100;
  for (const g of ["ui", "process", "impact", "heritage", "brand"]) {
    if (!groups[g]) continue;
    await label(page, g.toUpperCase(), 0, y, 16, GOLD);
    y += 40;
    let x = 0, rowH = 0, col = 0;
    for (const [name, p] of groups[g]) {
      try {
        const comp = figma.createComponentFromNode(svgNode(files[p], name));
        comp.name = `icon/${g}/${name}`;
        comp.x = x; comp.y = y;
        page.appendChild(comp);
        rowH = Math.max(rowH, comp.height);
        x += Math.max(comp.width, 64) + 48;
        if (++col % 10 === 0) { x = 0; y += rowH + 48; rowH = 0; }
      } catch (e) { say(`Skipped icon ${p}: ${e.message}`, true); }
    }
    y += rowH + 96;
  }
}

async function buildIllustrations(page) {
  await label(page, "Illustrations — vector", 0, 0, 40);
  let x = 0;
  for (const p of sortKeys(files).filter((q) => /^illustrations\/.+\.svg$/.test(q))) {
    try {
      const node = svgNode(files[p], p.split("/").pop().replace(/\.svg$/, ""));
      node.x = x; node.y = 100;
      page.appendChild(node);
      await label(page, node.name, x, 100 + node.height + 20, 14, GOLD);
      x += node.width + 160;
    } catch (e) { say(`Skipped ${p}: ${e.message}`, true); }
  }
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === "file") { files[msg.path] = msg.data; return; }
  if (msg.type !== "done") return;
  try {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    const steps = [
      ["01 Preview", buildPreview], ["02 Product Renders", buildRenders],
      ["03 Icons", buildIcons], ["04 Illustrations", buildIllustrations],
    ];
    let first;
    for (const [name, fn] of steps) {
      say(`Building ${name}…`);
      const page = figma.createPage();
      page.name = name;
      await fn(page);
      first = first || page;
    }
    await figma.setCurrentPageAsync(first);
    figma.viewport.scrollAndZoomIntoView(first.children);
    say("Done ✓");
    figma.notify("Shanana design kit imported");
  } catch (e) {
    say(`Error: ${e.message}`, true);
  }
};
