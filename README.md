# RayTrace ’95

A random image generator in the style of classic 1990s raytracing pictures
(the POV-Ray era): chrome spheres on checkerboard floors, glass objects, hard
shadows, kitschy skies.

Everything lives in **a single HTML file** with zero dependencies — no build
step, no server, no library. The raytracer, the scene generator and every
encoder (PNG, GIF, ZIP, WebM) are handwritten in plain JavaScript.

### ▶ [Try it live](https://laserrapt0r.github.io/RayTrace-95/)

| | |
|---|---|
| ![Mountain landscape](docs/terrain.png) | ![Saturn at sunset](docs/saturn.png) |
| ![The Juggler](docs/juggler.png) | ![Billiards](docs/billiard.png) |
| ![Swimming pool](docs/pool.png) | ![Chessboard](docs/chess.png) |

## Getting started

Just open the [live version](https://laserrapt0r.github.io/RayTrace-95/), or
run it locally:

```bash
git clone https://github.com/laserrapt0r/RayTrace-95.git
cd RayTrace-95
xdg-open index.html      # or simply double-click the file
```

Then hit **New image** (or press the spacebar). For a quick tour, the
**Gallery** dropdown holds a curated selection of famous motifs.

The interface is in **English by default and switches to German automatically
in a German-language browser**. You can force either language with
`?lang=en` or `?lang=de` in the URL.

## Usage

- **New image** (or spacebar): rolls a completely new scene.
- **Variation**: re-rolls just one aspect — colours, camera, sky or layout —
  and keeps everything else exactly as it is.
- **Seed**: every image is exactly reproducible from its seed (`a.b.c.d`, four
  sub-streams for layout/palette/sky/camera). Any text works as a master seed
  too. The seed also lives in the URL, so copying the link is enough to share
  an image.
- **Scene/Palette**: force a specific archetype or colour scheme.
- **Effects panel**: sky, fog, mountains, planets, nebula, lens flare, god
  rays, prism dispersion, bloom and fisheye can each be set to Auto/On/Off,
  plus anaglyph 3D (red/cyan) and a retro frame with a burnt-in caption. Every
  setting travels in the share link and in your favourites.
- **Quality**: Fast (1 ray/pixel) · Adaptive (anti-aliasing only along edges) ·
  Maximum (4× everywhere) · Ultra (adds soft shadows).
- **Image bar**: colour intensity (Off to Extreme), brightness, reflection
  strength and contact shadows (ambient occlusion). The colour grading is
  applied **during rendering** to the floating-point colour values (before the
  8-bit conversion, see `tone3`) — so the punchy CRT look is produced by the
  renderer itself rather than by a filter slapped on afterwards, and without
  banding from quantisation. The PNG export is therefore always exactly what
  you see on screen.
- **256 colours**: median-cut quantisation + Floyd–Steinberg dithering for the
  authentic GIF look of the era.
- **Batch ZIP**: renders 8 random images and downloads them as one ZIP.
- **Animation**: camera paths orbit, spiral, waves (animated water) and sun
  cycle (travelling shadows), plus object animations juggling, pendulum swing
  and boing bounce — as an endlessly looping GIF or as a WebM video (WebCodecs,
  where the browser supports it). All paths loop seamlessly.
- **History/Favourites**: thumbnails of recent images (localStorage); click to
  bring one back. Favourites can be exported as JSON and imported in another
  browser.

## Scene archetypes

33 archetypes make sure that hardly any two images look alike:

- **Classics**: spheres on a checkerboard, shape mix, colonnade, sphere
  pyramid, floating objects, central sphere, water, interior, sphereflake,
  helix, towers, glass box, rings/tori, chaos.
- **Big set pieces**: mountain landscape (a real raymarched heightfield with
  snow, a lake and a floating chrome sphere — the Bryce look), blobs/metaballs,
  swimming pool (transparent water over a tiled basin with a dancing caustic
  light net), chessboard with pieces, hall of mirrors with endless reflections,
  Menger sponge, pillar forest, alien world (planets, monolith, UFO).
- **Famous motifs**: the **Juggler** (an homage to Eric Graham's 1986 Amiga
  classic, including a juggling animation), the **Boing ball**, numbered
  **billiard balls** (the digits are computed onto the sphere surface from a
  5×7 pixel font), **Newton's cradle** (with a swinging animation), a **still
  life** with a CSG wine glass and grapes, **studio** product shots, **logo
  lettering** made of extruded letters, and **dice & co** (CSG: dice with real
  hollowed-out pips, bitten cubes, bowls, tubes).
- **Backdrops**: Greek temple, interior with a window light shaft, spiral
  staircase.

These combine with 7 colour schemes (including pure POV-Ray primaries), 6 sky
types (clouds, stars, nebulae, silhouetted mountains, ringed planets), fog, god
rays, lens flare and fake caustics beneath glass objects.

## How it works

- Recursive raytracer in plain JavaScript: sphere, plane, box (rotated),
  cylinder, cone, **torus** (quartic solver after Graphics Gems),
  **CSG** (difference/intersection of convex solids via interval arithmetic),
  **heightfield terrain** (grid-based raymarching) and **blobs/metaballs**
  (field marching with analytic normals).
- Reflection, refraction with Fresnel (Schlick), coloured glass shadows,
  procedural textures (checker, marble, wood, bozo, stripes, grid), bump
  mapping, distance fade to fight moiré.
- Effects: volumetric god rays, prism dispersion (per-channel refraction),
  bloom/glow, anaglyph 3D, fisheye projection, ambient occlusion and a
  subsurface sheen on marble.
- **BVH** (bounding volume hierarchy) for scenes with hundreds of objects.
- **Web worker pool** (up to 8 threads) with an automatic main-thread
  fallback; `?noworker` in the URL forces the fallback.
- Hand-rolled encoders, no libraries at all: PNG (via canvas), animated GIF89a
  (LZW), ZIP (store) and WebM (a minimal EBML muxer for VP8 chunks from
  WebCodecs).

## Headless rendering / tests

The render core also runs under Node without a browser — handy as a batch
renderer and as a regression test:

```bash
# Render individual images (output directory, then seeds)
node test/render.js out 42 1234:terrain "7:forest:rays=1,sky=sunset"

# Robustness sweep: 400 seeds across all archetypes, checks for errors
SWEEP=400 node test/render.js
```

Environment variables: `W`/`H` (resolution), `MODE` (0–3, same as the quality
levels), `DITHER=1` (256 colours), `BLOOM=1`, `FRAME=1` (retro frame),
`NOGRADE=1` (no colour grading), `GIF=1` (also writes a small orbit GIF).

## Browser support

Runs in any modern browser. The WebM export requires WebCodecs (Chrome/Edge);
without it the option is disabled automatically and the GIF export works
everywhere.

## Licence

[MIT](LICENSE) — © 2026 Tommy Wurzbacher
