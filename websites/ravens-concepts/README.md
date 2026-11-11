# Ravens Tech — 3D website concepts

Three website directions built from the Ravens Tech "Midnight Tech" design spec. Each has a homepage
**and a dedicated page for every product** (Frosti, Bean Box, ZnapCase), all built around live three.js
models of the machines.

| Concept | Home | Product pages |
| --- | --- | --- |
| 1 · Immersive Showroom | `1-showroom/index.html`: neon stage, three machines on a turntable, glass product cards, technology strip, locations | `1-showroom/product.html?p=frosti\|beanbox\|znapcase`: 3D viewer, variant switcher, live status, how it works, features rendered from the model, specs, other products |
| 2 · Engineering Blueprint | `2-blueprint/index.html`: line-art lineup with callouts and a product register | `2-blueprint/product.html?p=…`: dimensioned drawing, scroll-driven exploded view with each machine's own parts, flow diagram, title-block spec sheet |
| 3 · Showroom Journey | `3-journey/index.html`: one 3D world; scroll walks the camera from machine to machine | `3-journey/product.html?p=…`: follow one order through chapters; scrolling drives the making and the customizing |

`index.html` is a picker that links to every page.

## Run

```bash
cd websites && python3 -m http.server 8080
# open http://localhost:8080/ravens-concepts/
```

## Files

- `shared/machines3d.js`: procedural models of all three machines (`createMachine(type)`). It provides each machine's making animation (pour, scoop, print), variants, an exploded view and line-art mode.
- `shared/products.js`: all product copy (headlines, steps, features, specs, parts, venues). Edit text here.
- `vendor/`: three.js r170 (MIT).

## Using the real machines

Replace `createMachine()` with a `GLTFLoader` that loads each machine's `.glb`. Keep separate nodes for the arm,
stage and modules so the animations and exploded view keep working.
