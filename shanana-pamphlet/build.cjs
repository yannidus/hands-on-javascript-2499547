/* Builds the buyer pamphlet: pamphlet.html → Shanana-Coffee-Wholesale-Pamphlet.pdf (+ PNG page previews)
   Contact details and the catalog are read from the website's own files, so editing
   shanana-coffee/assets/js/config.js and catalog.js and re-running this script updates the pamphlet.
   Run from the repo root:  node shanana-pamphlet/build.cjs            */
const fs = require("fs"), path = require("path"), vm = require("vm");
const { chromium } = require("playwright");
const ROOT = path.resolve(__dirname, "..");
const SITE = path.join(ROOT, "shanana-coffee");
const load = (f) => { const w = {}; vm.runInNewContext(fs.readFileSync(path.join(SITE, "assets/js", f), "utf8"), { window: w }); return w; };
const CONFIG = load("config.js").SHANANA_CONFIG, CATALOG = load("catalog.js").SHANANA_CATALOG;
const img = (p) => "file://" + path.join(SITE, "assets/img", p);

const c = CONFIG.contact || {};
const site = CONFIG.website || null;
const field = (v, label) => v ? `<span class="v">${v}</span>` : `<span class="ph">[ add ${label} ]</span>`;
const sizes = CATALOG.products.map((p) => `
  <li><span class="sz">${p.label}</span>
    <span class="meta"><b>${p.name}</b><i>${p.netWeight}</i><em>${p.buyers.join(" · ")}</em></span></li>`).join("");
const social = Object.entries(CONFIG.social || {}).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("  ·  ");

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Shanana Coffee — Wholesale Overview</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Manrope:wght@400;500;600&display=swap">
<style>
@page { size: 8.5in 11in; margin: 0; }
:root { --ink:#111110; --forest:#131914; --gold:#8a6b3c; --brand:#f4b928; --ivory:#faf7f2; --line:#e6e0d6; --muted:#6d6860; }
* { box-sizing: border-box; } html, body { margin: 0; }
body { font-family: Manrope, Helvetica, Arial, sans-serif; color: var(--ink); font-size: 10pt; line-height: 1.55; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 8.5in; height: 11in; position: relative; overflow: hidden; page-break-after: always; break-after: page; background: #fff; }
h1, h2, h3, .serif { font-family: "Cormorant Garamond", Georgia, serif; font-weight: 400; margin: 0; letter-spacing: -.01em; line-height: 1.02; }
h2 { font-size: 34pt; } h2 em, h1 em { font-style: italic; color: var(--gold); }
p { margin: 0 0 .7em; }
.eyebrow { font-size: 7.5pt; font-weight: 600; letter-spacing: .26em; text-transform: uppercase; color: var(--gold); margin: 0 0 .9em; }
.lead { font-size: 11.5pt; line-height: 1.6; color: #2b2926; }
.foot { position: absolute; left: .6in; right: .6in; bottom: .35in; display: flex; justify-content: space-between; font-size: 7pt; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); border-top: 1px solid var(--line); padding-top: .12in; }
.ph { display: inline-block; padding: 1px 8px; border: 1px dashed var(--brand); color: var(--brand); font-size: 9pt; }
.dark .ph { color: var(--brand); }

/* 1 · cover */
.cover { background: var(--forest); color: #f4efe6; }
.cover .bg { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(14,17,14,.62) 0%, rgba(14,17,14,.78) 45%, rgba(14,17,14,.97) 100%), url("${img("nyaruguru/hills-clouds.webp")}") 38% 30% / cover; }
.cover .in { position: absolute; inset: .7in .7in .6in; display: flex; flex-direction: column; }
.wm { display: flex; flex-direction: column; line-height: 1; }
.wm b { font-family: "Cormorant Garamond", serif; font-weight: 500; font-size: 22pt; letter-spacing: .32em; }
.wm i { font-style: normal; font-size: 7pt; font-weight: 600; letter-spacing: .62em; color: var(--brand); margin-top: 6px; }
.cover h1 { font-size: 62pt; font-weight: 300; text-transform: uppercase; margin-top: .75in; line-height: .98; }
.cover h1 em { color: var(--brand); text-transform: uppercase; }
.stage { position: absolute; left: 50%; top: 3.95in; width: 4.9in; height: 4.9in; transform: translateX(-50%); }
.stage svg { position: absolute; inset: 0; width: 100%; height: 100%; color: #d9b56a; }
.stage .glow { position: absolute; inset: -8%; background: radial-gradient(closest-side, rgba(255,255,255,.16), rgba(255,255,255,.04) 58%, transparent 74%); }
.stage img { position: absolute; left: 50%; top: 50%; height: 4.2in; transform: translate(-50%, -50%); }
.cover .bottom { margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end; gap: .4in; border-top: 1px solid rgba(255,255,255,.2); padding-top: .2in; }
.cover .bottom p { margin: 0; } .cover .tag { font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 15pt; max-width: 3.9in; line-height: 1.25; }
.cover .doc { font-size: 7.5pt; font-weight: 600; letter-spacing: .24em; text-transform: uppercase; color: var(--brand); text-align: right; }

/* 2 · origin */
.pano { height: 4.05in; background: url("${img("nyaruguru/hills-clouds.webp")}") 50% 38% / cover; position: relative; }
.pano span { position: absolute; left: .6in; bottom: .14in; font-size: 7pt; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: #fff; }
.pano::after { content: ""; position: absolute; inset: auto 0 0; height: 1in; background: linear-gradient(transparent, rgba(10,12,10,.6)); }
.p2 { padding: .45in .6in 0; display: grid; grid-template-columns: 1fr 2.35in; gap: .4in; }
.p2 .portrait { height: 3.3in; margin-top: -1.15in; border: 5px solid #fff; box-shadow: 0 18px 30px -18px rgba(0,0,0,.5); background: url("${img("nyaruguru/drying-beds.webp")}") 52% 62% / cover; position: relative; z-index: 2; }
.facts { display: grid; grid-template-columns: repeat(5, 1fr); border-top: 1px solid var(--line); margin: .22in .6in 0; }
.facts div { padding: .13in .08in .1in 0; border-bottom: 1px solid var(--line); }
.facts dt { font-size: 6.5pt; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: var(--muted); }
.facts dd { margin: .03in 0 0; font-family: "Cormorant Garamond", serif; font-size: 14pt; line-height: 1.1; }
.taste { display: grid; grid-template-columns: repeat(3, 1fr); gap: .3in; margin: .26in .6in 0; }
.taste h3 { font-size: 15pt; margin: 0 0 .06in; } .taste .eyebrow { margin-bottom: .35em; }
.taste p { font-size: 8.8pt; color: var(--muted); margin: 0 0 .05in; } .taste em { font-family: "Cormorant Garamond", serif; font-size: 12.5pt; color: var(--ink); }

/* 3 · collection */
.p3 { padding: .65in .6in 0; }
.p3 .grid { display: grid; grid-template-columns: 3.15in 1fr; gap: .4in; margin-top: .3in; }
.bagpanel { background: radial-gradient(closest-side, #fff, var(--ivory)); height: 5.05in; position: relative; border: 1px solid var(--line); }
.bagpanel img { position: absolute; left: 50%; top: 50%; height: 4.6in; transform: translate(-50%, -50%); }
.sizes { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line); }
.sizes li { display: grid; grid-template-columns: .95in 1fr; align-items: center; gap: .15in; padding: .2in 0; border-bottom: 1px solid var(--line); }
.sizes .sz { font-family: "Cormorant Garamond", serif; font-size: 30pt; line-height: 1; }
.sizes .meta { display: flex; flex-direction: column; gap: 1px; } .sizes b { font-size: 10pt; } .sizes i { font-style: normal; font-size: 8.5pt; color: var(--gold); font-weight: 600; letter-spacing: .04em; } .sizes em { font-style: normal; font-size: 8.6pt; color: var(--muted); }
.specs { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0 .4in; margin-top: .3in; border-top: 1px solid var(--line); }
.specs div { display: grid; grid-template-columns: 1.15in 1fr; padding: .09in 0; border-bottom: 1px solid var(--line); font-size: 8.8pt; }
.specs dt { font-size: 6.8pt; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: var(--muted); padding-top: 2px; } .specs dd { margin: 0; }
.note { margin-top: .25in; padding: .12in .16in; border: 1px solid #d9c08c; background: #fffcf6; font-size: 8.8pt; }

/* 4 · impact + partner */
.p4a { padding: .65in .6in 0; }
.commit { display: grid; grid-template-columns: repeat(2, 1fr); gap: .22in .4in; margin-top: .25in; }
.commit article { border-top: 1px solid var(--line); padding-top: .12in; } .commit h3 { font-size: 15pt; margin-bottom: .04in; } .commit p { font-size: 8.8pt; color: var(--muted); margin: 0; }
.commit .n { font-family: "Cormorant Garamond", serif; font-style: italic; color: var(--gold); font-size: 11pt; }
.p4b { position: absolute; left: 0; right: 0; bottom: 0; height: 5.2in; background: var(--forest); color: #f4efe6; padding: .42in .6in 0; }
.p4b h2 { font-size: 30pt; color: #fff; } .p4b h2 em { color: var(--brand); } .p4b .eyebrow { color: var(--brand); }
.cols { display: grid; grid-template-columns: 1.1fr 1fr; gap: .45in; margin-top: .2in; }
.who { list-style: none; padding: 0; margin: 0 0 .15in; display: flex; flex-wrap: wrap; gap: .06in; } .who li { font-size: 8pt; padding: .035in .1in; border: 1px solid rgba(255,255,255,.28); border-radius: 99px; color: rgba(255,255,255,.85); }
.steps { counter-reset: s; list-style: none; padding: 0; margin: 0; } .steps li { counter-increment: s; display: grid; grid-template-columns: .3in 1fr; font-size: 9pt; padding: .06in 0; border-bottom: 1px solid rgba(255,255,255,.14); color: rgba(255,255,255,.85); }
.steps li::before { content: counter(s); font-family: "Cormorant Garamond", serif; font-style: italic; color: var(--brand); font-size: 13pt; line-height: 1; }
.small { font-size: 7.8pt; color: rgba(255,255,255,.62); line-height: 1.5; }
.contact { border: 1px solid rgba(244,185,40,.55); padding: .16in .2in; } .contact h3 { font-size: 17pt; color: #fff; margin-bottom: .08in; }
.contact dl { margin: 0; display: grid; grid-template-columns: .85in 1fr; row-gap: .06in; font-size: 9pt; } .contact dt { font-size: 6.8pt; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: var(--brand); padding-top: 3px; } .contact dd { margin: 0; color: #fff; word-break: break-word; }
.p4b .foot { color: rgba(255,255,255,.5); border-top-color: rgba(255,255,255,.16); }
</style></head><body>

<section class="page cover dark">
  <div class="bg"></div>
  <div class="in">
    <div class="wm"><b>SHANANA</b><i>COFFEE</i></div>
    <h1>Every sip<br>tells a <em>story.</em></h1>
    <div class="stage">
      <div class="glow"></div>
      <svg viewBox="0 0 600 600" fill="none" aria-hidden="true"><circle cx="300" cy="300" r="290" stroke="currentColor" stroke-opacity=".3"/><circle cx="300" cy="300" r="276" stroke="currentColor" stroke-opacity=".14" stroke-dasharray="2 7"/><path d="M 95 95 A 290 290 0 0 1 505 95" stroke="currentColor" stroke-width="2" stroke-opacity=".9"/></svg>
      <img src="${img("products/360/bag-01.webp")}" alt="">
    </div>
    <div class="bottom">
      <p class="tag">Born in the mountains of Rwanda. Crafted with care. Shared with the world.</p>
      <p class="doc">Wholesale partner overview<br><span style="color:rgba(255,255,255,.6)">100% Arabica · Nyaruguru, Rwanda</span></p>
    </div>
  </div>
</section>

<section class="page">
  <div class="pano"><span>Nyaruguru, Southern Province, Rwanda</span></div>
  <div class="p2">
    <div>
      <p class="eyebrow">Origin</p>
      <h2>Grown where the <em>mountains</em> meet the clouds.</h2>
      <p class="lead" style="margin-top:.16in">In the highlands of Rwanda’s Southern Province, our coffee grows slowly: at 1,800 to 1,900 meters, in a cool climate, on mountainous terrain and volcanic soils. Cherries are harvested, depulped, fermented, washed and dried with hands-on care from local workers, then produced and packaged in Rwanda.</p>
    </div>
    <div class="portrait" role="img" aria-label="Workers tending drying beds above terraced hills"></div>
  </div>
  <dl class="facts">
    <div><dt>Country</dt><dd>Rwanda</dd></div>
    <div><dt>Region</dt><dd>Nyaruguru</dd></div>
    <div><dt>Variety</dt><dd>100% Arabica</dd></div>
    <div><dt>Altitude</dt><dd>1,800–1,900 m</dd></div>
    <div><dt>Process</dt><dd>Washed</dd></div>
  </dl>
  <div class="taste">
    <div><p class="eyebrow">Top notes</p><h3>A bright opening</h3><p>Lively and clean, lifted by vibrant acidity.</p><em>Citrus · Green apple</em></div>
    <div><p class="eyebrow">Heart</p><h3>Sweet at the center</h3><p>Rounded, gentle and inviting as the cup opens.</p><em>Honey · Floral sweetness</em></div>
    <div><p class="eyebrow">Base</p><h3>A lingering finish</h3><p>Smooth and balanced, with flavors that stay.</p><em>Subtly nutty</em></div>
  </div>
  <div class="foot"><span>Shanana Coffee · Wholesale overview</span><span>2 / 4</span></div>
</section>

<section class="page">
  <div class="p3">
    <p class="eyebrow">The collection</p>
    <h2>One origin. <em>Four formats.</em></h2>
    <div class="grid">
      <div class="bagpanel"><img src="${img("products/360/bag-02.webp")}" alt=""></div>
      <div>
        <ul class="sizes">${sizes}</ul>
      </div>
    </div>
    <dl class="specs">
      <div><dt>Origin</dt><dd>Nyaruguru, Southern Province, Rwanda</dd></div>
      <div><dt>Variety</dt><dd>100% Arabica</dd></div>
      <div><dt>Altitude</dt><dd>1,800–1,900 meters</dd></div>
      <div><dt>Process</dt><dd>Washed; hand-processed</dd></div>
      <div><dt>Packaging</dt><dd>Matte-black bag with the Shanana emblem and illustrated figures</dd></div>
      <div><dt>Packed in</dt><dd>Rwanda, finished and ready for sale</dd></div>
    </dl>
    <div class="note"><b>Pricing and ordering.</b> Wholesale pricing, minimum orders and case packs are shared directly with approved buyers. Roast and grind options, origin collections and seasonal releases will be added as they are confirmed.</div>
  </div>
  <div class="foot"><span>Shanana Coffee · Wholesale overview</span><span>3 / 4</span></div>
</section>

<section class="page">
  <div class="p4a">
    <p class="eyebrow">Beyond the cup</p>
    <h2>The impact behind <em>every cup.</em></h2>
    <p class="lead" style="margin-top:.14in;max-width:6.3in">Shanana is building a commercially sustainable coffee business that creates opportunity on both sides of the cup. These are our commitments and intended outcomes; we will publish impact figures only once they can be verified.</p>
    <div class="commit">
      <article><span class="n">Women &amp; communities</span><h3>Recognizing the work of women in coffee</h3><p>Supporting women involved in cultivation and processing, and celebrating the skill of local coffee workers.</p></article>
      <article><span class="n">Families &amp; education</span><h3>Steadier incomes for farming families</h3><p>Helping families build more stable incomes and the ability to invest in their children’s education.</p></article>
      <article><span class="n">Employment</span><h3>Value created close to the farm</h3><p>Production, packaging and logistics in Rwanda support local jobs and promote Rwandan coffee internationally.</p></article>
      <article><span class="n">Rwanda &amp; the U.S.</span><h3>A lasting trade connection</h3><p>Long-term relationships with American cafés, retailers and distributors, and more people tasting Rwandan coffee.</p></article>
    </div>
  </div>
  <div class="p4b dark">
    <p class="eyebrow">Wholesale &amp; distribution</p>
    <h2>Partner with <em>Shanana.</em></h2>
    <div class="cols">
      <div>
        <ul class="who"><li>Specialty coffee shops</li><li>Independent cafés</li><li>Specialty grocery</li><li>Restaurants &amp; hotels</li><li>Regional distributors</li><li>Commercial buyers</li></ul>
        <ol class="steps"><li>Tell us about your business and the sizes you’re interested in.</li><li>Request samples.</li><li>Receive wholesale pricing and terms directly.</li></ol>
        <p class="small" style="margin-top:.12in">Shanana is in its U.S. market-entry phase. Import, regulatory, warehousing and distribution arrangements are being established; inventory availability is confirmed directly with approved buyers.</p>
      </div>
      <div class="contact">
        <h3>Let’s talk coffee</h3>
        <dl>
          <dt>Wholesale</dt><dd>${field(c.wholesaleEmail, "wholesale email")}</dd>
          <dt>Phone</dt><dd>${field(c.phoneUS, "phone")}</dd>
          <dt>Website</dt><dd>${field(site, "website")}</dd>
          ${social ? `<dt>Follow</dt><dd>${social}</dd>` : ""}
          <dt>Origin</dt><dd>Nyaruguru, Southern Province, Rwanda</dd>
        </dl>
      </div>
    </div>
    <div class="foot"><span>Every sip tells a story.</span><span>4 / 4</span></div>
  </div>
</section>
</body></html>`;

(async () => {
  fs.writeFileSync(path.join(__dirname, "pamphlet.html"), html);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 816, height: 1056 }, deviceScaleFactor: 2 });
  await p.goto("file://" + path.join(__dirname, "pamphlet.html"), { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  const pdf = path.join(__dirname, "Shanana-Coffee-Wholesale-Pamphlet.pdf");
  await p.pdf({ path: pdf, width: "8.5in", height: "11in", printBackground: true, preferCSSPageSize: true });
  fs.mkdirSync(path.join(__dirname, "previews"), { recursive: true });
  const pages = await p.locator(".page").count();
  for (let i = 0; i < pages; i++) await p.locator(".page").nth(i).screenshot({ path: path.join(__dirname, "previews", `page-${i + 1}.png`) });
  const missing = await p.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.src));
  console.log("pages", pages, "| size KB", Math.round(fs.statSync(pdf).size / 1024), "| broken images:", missing.length ? missing : "none");
  await b.close();
})();
