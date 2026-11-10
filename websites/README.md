# Ravens Tech product websites

Three standalone marketing websites for the Ravens Tech self-service machines,
built from the "Midnight Tech" design spec (colors `#0B0B13 / #16233C / #48CFFF / #F5F8FF`,
Space Grotesk + Inter, line-and-glow icons, 12-column grid).

| Site | Folder | Accent | Interactive feature |
| --- | --- | --- | --- |
| **Bean Box** — robotic coffee | `beanbox/` | Amber `#FFB15C` | "Build your cup": drink, size, milk, strength, syrup, hot/iced, with a live cup preview and price |
| **Frosti** — robotic ice cream | `frosti/` | Ice blue `#48CFFF` | "Build a cone": cone/cup, up to 3 scoops, toppings, with a live preview and price |
| **ZnapCase** — phone case printing | `znapcase/` | Violet `#A77BFF` | Case designer: phone model, upload a photo (preview stays in the browser), patterns, text, case type and finish |

`index.html` is a small Ravens Tech hub that links to all three sites.

Every product site has these sections: hero with an animated machine illustration, how it works,
menu or design catalog with filter tabs, the builder, features, "ideal for" venues,
a location finder (search, live status, map pins), an app or gift CTA,
a "host a machine" partner form, an FAQ and a footer that links to the other sites.

## Structure

```
websites/
├── index.html          Ravens Tech hub
├── shared/
│   ├── styles.css      design system (tokens, components, responsive rules)
│   ├── icons.js        SVG icon sprite (<svg><use href="#i-cup"/></svg>)
│   └── main.js         nav, scroll reveal, tabs, location finder, forms, modal
├── beanbox/   index.html + app.js (menu data + builder)
├── frosti/    index.html + app.js
└── znapcase/  index.html + app.js
```

There is no build step and no dependencies apart from Google Fonts.

## Run locally

```bash
cd websites
python3 -m http.server 8080   # or: npx serve .
# open http://localhost:8080
```

## Customising

- **Currency**: each page sets `window.SITE.currency`. For example, use `{ code: "RWF", locale: "en-RW" }` for Rwandan francs, then update the prices in that site's `app.js`.
- **Locations**: edit `window.SITE.locations` in each `index.html`. `x` and `y` are the pin position on the map, as a percentage.
- **Menu, flavours, designs and prices**: the data arrays at the top of each `app.js`.
- **Product video**: replace the placeholder inside `.modal-box` with a YouTube or Vimeo embed, or a `<video>`.
- **Partner form**: it currently only validates and shows a confirmation. To receive leads, point it at a form service or your backend in `shared/main.js`.
- **Product images**: Bean Box uses real photos from `beanbox/images/` (machine, latte crop, banner used as the social share image). Frosti and ZnapCase still use inline SVG illustrations. To switch them, replace the `<svg class="machine">` in the hero with `<img class="machine machine-photo" src="images/...">` (see Bean Box). Set `og:image` to an absolute URL once the site has a domain.
- **Each site on its own domain**: copy `shared/` into the site folder and change `../shared/` to `shared/`.
