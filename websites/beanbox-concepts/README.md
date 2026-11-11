# Bean Box — 3D website concepts

Three website directions for Bean Box, a robotic coffee dispenser that makes barista-quality coffee
automatically, with fresh, fast and customizable drinks for any location. All three share one
real-time 3D model of the machine, built in the browser with three.js. There is no build step.

| Concept | Folder | Idea |
| --- | --- | --- |
| A · Showroom | `a-showroom/` | Dark product stage with a huge title and a turntable. Drag to rotate, and use ← → to switch the drink being brewed. Light numbered feature sections use images rendered from the model, then a spec sheet and contact form. |
| B · Blueprint | `b-blueprint/` | Paper-and-ink technical drawing. The hero rotates the line art with dimension lines. A scroll-driven exploded view highlights 7 systems with leader labels. Ends with stats and a title-block spec sheet. |
| C · Journey | `c-journey/` | Full-screen scroll story: Choose → Grind (beans swirl into the hopper) → Brew (scroll to pour) → Customize (the drink changes) → Anywhere → Origin (Rwanda). |

`index.html` is a picker that links to all three.

## Run

ES modules need a local server, so double-clicking the files won't work:

```bash
cd websites
python3 -m http.server 8080
# open http://localhost:8080/beanbox-concepts/
```

## Files

- `shared/beanbox3d.js`: the procedural Bean Box model. It provides brew animation with inverse kinematics for the arm, drink presets, an exploded view, a line-art mode with silhouettes, and a studio lighting helper.
- `shared/concepts.css`: a small shared reset.
- `vendor/`: three.js r170 (MIT, see `THREE-LICENSE.txt`) plus OrbitControls, RoomEnvironment and RoundedBoxGeometry.
- `previews/`: thumbnails used by the picker.

## Using the real machine

The model is a stand-in. To use the real Bean Box, export a `.glb` from your CAD or 3D scan and load it
with three.js `GLTFLoader` in place of `createBeanBox()`. Keep separate node names for the arm, cup,
hopper and so on if you want the brewing animation and exploded view to keep working.
