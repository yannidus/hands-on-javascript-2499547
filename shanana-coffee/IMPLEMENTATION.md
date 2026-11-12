# Shanana Coffee website: implementation guide

This is a static, production-ready website. It has no build step and no dependencies, so it can be deployed to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3 or another).

## 1. What is complete

| Area | Status |
|---|---|
| 7 pages: Home, Our Coffee, Collection, Heritage, Beyond the Cup, Wholesale, Contact, plus Privacy and 404 | ✅ Complete |
| Design system (Cormorant Garamond + Manrope, white/ivory/black/gold tokens, spacing, buttons, cards, icons) | ✅ `assets/css/main.css` |
| Responsive layouts for mobile, tablet and desktop, tested at 390 px (iPhone) and 1440 px, with no horizontal scroll | ✅ |
| Interactive 360° product viewer: mouse drag, touch swipe (vertical page scroll still works), keyboard arrows, auto-rotate with pause/resume, view thumbnails, inertia, dynamic lighting | ✅ `assets/js/viewer.js` |
| Size selector (12 oz / 1 lb / 2 lb / 5 lb) with previous/next and live spec updates; the selection carries to the inquiry form (`?size=`) | ✅ |
| Interactive tasting profile (top, heart and base notes) | ✅ |
| Scroll reveals, hover states, reduced-motion support, skip link, focus states, ARIA roles | ✅ |
| Wholesale inquiry form with every requested field, client-side validation, honeypot spam trap, privacy notice and consent | ✅ UI complete · ⚠️ **needs a form service** (see §3) |
| SEO: per-page titles and descriptions, Open Graph, JSON-LD Organization, semantic headings, `robots.txt`, `sitemap.xml` | ✅ · ⚠️ domain placeholder |
| Security headers and CSP for Netlify (`netlify.toml`) and Vercel (`vercel.json`) | ✅ |

## 2. What still needs verified information

Every gap is shown on the site as a dashed gold **"Pending confirmation"**, **"To be published"** or **"Photography to come"** label. Nothing has been invented.

### Product photography and logo (highest priority)
No product photos or logo files were supplied. The bag in the viewer is an **illustrative render** at `assets/img/products/bag-front-placeholder.svg`, and the site labels it that way. It is **not** the official emblem or illustration. To replace it:

1. **Front photo only (fastest):** shoot the bag head-on against white. Crop it to a 600×840 ratio and save it as `assets/img/products/bag-front.webp`. In `assets/js/config.js`, set `media.frontImage` to that file and set `media.isPlaceholder: false`.
2. **True 360° photography (best):** shoot 24–36 frames on a turntable against white. Put them in `assets/img/products/360/` and list them in `media.frames` (there is a commented example in `config.js`). The viewer switches to photo mode automatically and keeps drag, touch, keyboard and auto-rotate.
3. **Logo:** the header and footer use a typeset "SHANANA / COFFEE" wordmark. Replace the `.wordmark` markup in `partials/header.html` and `partials/footer.html` with the official logo (SVG preferred), then run `node tools/sync-partials.mjs`.
4. **Heritage and origin photography:** replace each `<figure class="ph">` placeholder with `<img src="…" alt="…" loading="lazy" width="…" height="…">` inside the same figure. Only use photos of people with their consent.

The site shows the same packaging for every size until size-specific photos exist, and it says so on the Collection page.

### Business details: edit `assets/js/config.js` only
- `contact.*`: wholesale and general email, U.S. and Rwanda phone numbers, addresses
- `social.*`: profile URLs (the links appear automatically)
- `impactMetrics[*].value` and `.source`: publish only independently verified figures. Empty values show "Reporting in progress".

### Catalog: edit `assets/js/catalog.js`
- `options.roastLevels` and `options.grinds`, plus `casePack` and `moq` for each product
- To add roast varieties, grind options, collections or seasonal releases, add data here. The selectors render whatever is in the list.
- **Wholesale prices are deliberately not stored in public code.** Share them privately (see §5).

### Legal
- `privacy.html` is marked **"Draft for legal review."** Confirm the legal entity, the form provider and a contact address, add the publication date, and have counsel review it.

### Domain
- Replace `https://YOUR-DOMAIN` in `sitemap.xml` and `robots.txt`. Optionally add `<link rel="canonical">` and an `og:image` (a 1200×630 product photo) to each page once the domain is known.

## 3. Connecting the inquiry form (required before launch)

Until this is configured, the form shows a notice that says **"Online submission is not yet connected."** It validates entries but never claims an inquiry was sent. Choose one option in `config.js → form`:

| Option | Steps |
|---|---|
| **Netlify Forms** (simplest on Netlify) | Deploy on Netlify, set `provider: "netlify"` and enable form detection. Submissions appear in the Netlify dashboard and can trigger email notifications. |
| **Formspree** (any host) | Create a form at formspree.io, set `provider: "formspree"` and `endpoint: "https://formspree.io/f/XXXX"`. The CSP already allows formspree.io. |
| **Custom backend** | Set `provider: "custom"` and give an HTTPS `endpoint` that accepts JSON. Add its origin to `connect-src` in the CSP. **Validate on the server as well**: client checks are for usability only. |

After connecting, send a test submission and confirm that the success message appears and the data arrives.

## 4. Deploying
- **Netlify:** drag-and-drop the `shanana-coffee/` folder, or connect the repo with base directory `shanana-coffee`. `netlify.toml` handles the headers.
- **Vercel:** import the repo with root directory `shanana-coffee` and framework preset "Other". `vercel.json` handles the headers.
- **Other hosts:** upload the folder. Configure `404.html` as the error page, and re-create the headers from `netlify.toml` if the host supports them.
- Preview locally: `cd shanana-coffee && python3 -m http.server 8000`, then open http://localhost:8000

## 5. Future wholesale platform
The public site is static on purpose, so that no prices or forecasts are exposed. Approved buyer accounts, private price tiers, MOQs, case-pack ordering, inventory, reordering, distributor terms and shipment tracking all need authentication and a database. Two recommended paths:
- A B2B commerce platform with gated wholesale pricing (for example Shopify B2B or BigCommerce B2B), linked from a "Partner login" button, **or**
- A small authenticated app (for example Next.js with Supabase or Postgres) at `partners.<domain>`.

`catalog.js` already models products as data, so it can become that system's seed catalog.

## 6. Editing the site
- **Page content:** edit the `.html` files directly.
- **Navigation and footer:** edit `partials/header.html` or `partials/footer.html`, then run `node tools/sync-partials.mjs`. This copies them into every page and marks the active link.
- **Colors, fonts and spacing:** change the tokens at the top of `assets/css/main.css`.

## 7. Content principles to keep
- Present job creation, women's empowerment and education support as **commitments and intended outcomes**, not results.
- Do not add awards, cupping scores, certifications, testimonials or statistics without evidence.
- Do not state that import licensing, FDA registration, U.S. inventory or distribution agreements are complete until they are. The Wholesale page marks these steps "Planned".
