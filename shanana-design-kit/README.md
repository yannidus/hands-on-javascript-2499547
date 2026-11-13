# Shanana Coffee: design kit for Figma

This kit holds everything needed to build a Figma file of the website: page previews for desktop, tablet and mobile, high-resolution product renders, SVG icons and SVG illustrations.

> **Important:** the bag shown in every render and preview is an **illustrative render**, not Shanana's official packaging or logo. No product photography was supplied. Replace it before using it in production or marketing (see "Updating" below).

## Get it into Figma

### Option A: run the importer plugin (builds the whole file, recommended)
1. Open the **Figma desktop app** and create a new design file.
2. Go to **Plugins → Development → Import plugin from manifest…** and choose `figma-plugin/manifest.json`.
3. Run **Plugins → Development → Shanana Design Kit Importer**. Click **Choose folder…** and select this `shanana-design-kit` folder.
4. The plugin creates four pages:
   - **01 Preview:** each of the 7 site pages as Desktop (1440), Tablet (834) and Mobile (390) frames, side by side, from 2× screenshots
   - **02 Product Renders:** the 3 bag renders, each on studio white and transparent, plus the flat front artwork
   - **03 Icons:** every icon as a reusable **component** (`icon/ui/arrow-right`, …), as editable vectors
   - **04 Illustrations:** all illustrations as editable vectors

The plugin was checked against a mock of Figma's plugin interface, but it has not been run inside Figma itself. If it fails, use Option B. Text that follows a curved path (in `tasting-rings.svg`) may import as straight text, because Figma doesn't support text on a path.

### Option B: drag and drop (always works)
- Drag `icons-overview-sheet.svg` onto the canvas to get every icon as editable vectors in one step. You can also drag in individual files from `icons/`.
- Drag any file from `illustrations/` onto the canvas to get editable vectors.
- Drag in the files from `renders/`.
- For previews, create a frame of the right width (1440 / 834 / 390), drop in the `previews/<device>/<page>/tile-*.jpg` files and stack them top to bottom. Each tile is 2000px tall at 1×; the last tile is shorter.
- `preview-board-home.png` shows the homepage at all three sizes on one board.

### Option C: editable page layers
The previews are pixel-perfect screenshots, so their text and boxes are flat images. For editable layers, deploy the site and import its URL with a third-party HTML-to-Figma plugin (for example *html.to.design*).

## Brand reasoning
See [`CREATIVE-RATIONALE.md`](CREATIVE-RATIONALE.md) for what the Shanana emblem, its gold-on-black palette and its rising-sun motif mean.

## Contents

```
previews/<desktop|tablet|mobile>/<page>/tile-NN.jpg   2× screenshots, ≤4000 px tiles (Figma's limit is 4096 px)
previews/.../frame.json                               frame size and tile layout
renders/shanana-bag-01-front-*.png                    front view
renders/shanana-bag-02-three-quarter-*.png            ¾ left view
renders/shanana-bag-03-three-quarter-right-*.png      ¾ right view
        *-studio-white.png  on white with soft shadow (~2800 × 3250 px)
        *-transparent.png   cut out with an alpha channel (~2000 × 3000 px)
renders/shanana-bag-front-artwork-flat-2400x3360.png  flat front artwork
icons/ui/        24 px UI icons (arrows, chevrons, menu, play/pause, rotate, mail, phone, map pin, lock, …)
icons/process/   48 px origin and process icons (harvest, depulp, ferment, wash, dry, package, export, warehouse, …)
icons/impact/    48 px impact icons (women and community, education, family income, employment, value chain, trade)
icons/heritage/  64 px packaging-language icons (sun, people, bean, bag, mountains, geometric band)
icons/brand/     placeholder emblem, favicon, typeset wordmark
illustrations/   altitude band, tasting rings, Rwanda → U.S. journey, contour backgrounds, bean orbit,
                 geometric band pattern, front packaging artwork (illustrative)
icons-overview-sheet.svg   every icon on one artboard
preview-board-home.png     homepage on desktop, tablet and mobile
```

The outline icons use `stroke="currentColor"` with a 1.5 stroke, so they recolor in CSS. Figma imports them as near-black (#111110).

Brand colors: ink `#111110` · charcoal `#2B2926` · gold `#B08D57` · deep gold `#8A6B3C` · ivory `#FAF7F2` · line `#E6E0D6`.
Fonts: **Cormorant Garamond** for display headings and **Manrope** for interface text (both on Google Fonts).

## Updating (for example, once real product photos exist)
Run these from the repository root:
```bash
python3 -m http.server 8766 &                    # serve the repo
python3 shanana-design-kit/tools/make_icons.py   # rebuild icons and the overview sheet
node shanana-design-kit/tools/capture.cjs        # rebuild renders and previews (or pass: renders | previews)
```
The renders and previews are generated from the live site. After you set the real product image in `shanana-coffee/assets/js/config.js`, re-run `capture.cjs` and every asset updates.
