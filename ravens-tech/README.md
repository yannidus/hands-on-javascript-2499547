# Ravens Tech website

A static, mobile-first marketing site for Ravens Tech's three robotic retail machines: **Frosti** (ice cream), **Bean Box** (coffee) and **ZnapCase** (phone case printing). It has no build step and no dependencies, so it can be hosted on any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3).

```
ravens-tech/
├── index.html          the one-page site
├── privacy.html        privacy notice (DRAFT: replace before launch)
├── css/styles.css      all styles, mobile-first
├── js/config.js        ← EDIT THIS: contact details, links, films, form endpoint
├── js/main.js          menu, galleries, 3D showroom, films, inquiry form
├── viewers/            the three interactive 3D showrooms (Three.js)
├── vendor/three/       self-hosted Three.js r160 (MIT), no CDN needed
├── fonts/              self-hosted Space Grotesk + Inter (SIL OFL)
└── img/                responsive WebP images + og.jpg + favicon
```

## Run locally

```
cd ravens-tech
python3 -m http.server 8000
# open http://localhost:8000
```

Use a local server. Opening `index.html` straight from disk (`file://`) blocks the 3D viewers' ES modules.

## Before launch: fill in `js/config.js`

| Setting | What happens while it's empty |
|---|---|
| `contact.email` / `phone` / `location` | That row is hidden on the Contact section |
| `productSites.frosti/bean/znap` | The "Product website" button is hidden |
| `films.*.src` (+ optional `captions` .vtt) | The play button opens the 3D showroom for that machine instead |
| `formEndpoint` | The form opens the visitor's email app, addressed to `contact.email`. If that's empty too, the visitor is asked to use the contact details. |
| `privacyUrl` | Links to `privacy.html` |

**Form endpoint:** the form POSTs JSON (`journey, name, company, email, phone, machine, location, quantity/term/traffic/region, message, consent, page, _subject`). Formspree, Getform and Basin all accept this, or you can use your own API. Any non-2xx response shows an error and keeps the visitor's answers.

## The four inquiry journeys

**Buy a machine**, **Lease or rent**, **Host one at my venue** (revenue share) and **Partner or distribute**. Each one reveals its own extra field (units, term, foot traffic or region) and changes the submit button label. The "Get … for your space" buttons in each machine section preselect the Buy journey and that machine. To change the journeys, edit the radio buttons in `index.html` (`#inquiry`) and the `LABELS`/`SUBMIT` maps in `js/main.js`.

## How the responsive / 3D requirements are met

- **Layouts:** mobile-first CSS. The hamburger menu (focus trap, Esc, closes on link tap, body scroll lock) switches to horizontal navigation at 1024px. Machine sections are two-column from 900px, galleries are swipe + buttons + arrow keys, and short landscape phones get a compact hero. `svh` units and safe-area insets are used throughout.
- **No 3D scroll traps:** the 3D showroom loads only after a tap or click on "Explore … in 3D". Until then it is a static image and the page scrolls normally. While it's active, a **Done** button (or Esc) hands control back to the page.
- **One WebGL context at a time:** switching machines destroys the previous viewer. A viewer pauses when scrolled off-screen or the tab is hidden, and its WebGL context is freed once it is far off-screen. A lost context or a failed load shows a message and a retry option.
- **Adaptive quality** (in `viewers/*.html`): on phones, touch devices and low-core/low-memory devices, bloom post-processing is off, the pixel ratio is capped at 1.5 and shadow maps are 1024px. If the frame rate stays under 30 fps, the pixel ratio drops to 1.
- **No WebGL:** the photo stays, with an explanation.
- **Reduced motion:** page animations, the auto-rotate and the guided tour are removed. Save-Data and low-power devices also get lighter background effects.
- **Accessibility:** skip link, landmarks, visible focus, labelled controls, ARIA tabs for the showroom, inline form errors linked with `aria-describedby`, a live status region, a honeypot instead of a CAPTCHA, and 44px+ touch targets.

## Testing done

Automated with Playwright/Chromium: no horizontal scroll at 320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440, 1920 and 2560 px, plus 844×390 and 1366×1024. The menu, film-to-3D fallback, 3D activate / Done / scroll-past, journey switching, validation, draft restore and the no-endpoint message were exercised on an emulated iPhone 13.

**Still to do on real devices before launch:** iOS Safari (iPhone + iPad), Android Chrome on a mid-range phone, desktop Safari, Firefox and Edge, Lighthouse mobile and an axe scan on the deployed URL.

## Credits

Three.js (MIT, `vendor/three/LICENSE`). Space Grotesk and Inter (SIL Open Font License 1.1).
