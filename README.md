# RayTrace ’95

Ein Zufallsbild-Generator im Stil klassischer Raytracing-Bilder der 90er Jahre
(POV-Ray-Ära): verchromte Kugeln auf Schachbrettböden, Glasobjekte, harte
Schatten, kitschige Himmel. Komplett als **eine einzige HTML-Datei** ohne
Abhängigkeiten — einfach `index.html` im Browser öffnen, kein Server nötig.

## Bedienung

- **Neues Bild** (oder Leertaste): würfelt eine komplett neue Szene.
- **Variation**: würfelt gezielt nur einen Aspekt neu — Farben, Kamera,
  Himmel oder Layout — und behält den Rest exakt bei.
- **Seed**: Jedes Bild ist durch seinen Seed (`a.b.c.d`, vier Teilströme für
  Layout/Palette/Himmel/Kamera) exakt reproduzierbar. Beliebiger Text
  funktioniert ebenfalls als Master-Seed. Der Seed steht auch in der URL —
  Link kopieren genügt zum Teilen.
- **Szene/Palette**: erzwingt einen bestimmten Archetyp bzw. ein Farbschema.
- **Effekte-Panel**: Himmel, Nebel, Berge, Planeten, Gasnebel, Lens Flare,
  God-Rays, Prisma-Dispersion, Bloom und Fischauge sind einzeln per
  Auto/An/Aus wählbar; dazu Anaglyph 3D (Rot/Cyan) und ein Retro-Rahmen mit
  eingebrannter Bildunterschrift. Alle Einstellungen wandern in den
  Teilen-Link und in die Favoriten.
- **Qualität**: Schnell (1 Strahl/Pixel) · Adaptiv (Kantenglättung nur an
  Kanten) · Maximal (4× überall) · Ultra (zusätzlich weiche Schatten).
- **Knallige Farben** (Standard: an): Sättigungs-Boost + Kontrast-S-Kurve als
  Nachbearbeitung — kompensiert das Auswaschen durch die Gamma-Korrektur und
  bringt den kontrastreichen CRT-Look der alten Renderer zurück (ohne
  Neu-Rendern umschaltbar).
- **256 Farben**: Median-Cut-Quantisierung + Floyd-Steinberg-Dithering für
  den authentischen GIF-Look von damals (ohne Neu-Rendern umschaltbar).
- **Batch-ZIP**: rendert 8 Zufallsbilder und lädt sie gesammelt als ZIP.
- **Galerie**: Kuratierte Sammlung berühmter Motive (Jongleur, Boing-Ball,
  Billard, Newton-Pendel, Saturn, Stillleben, …) — ein Klick lädt das Bild.
- **Animation**: Kamerapfade Orbit, Spirale, Wellen (animiertes Wasser),
  Sonnenumlauf (wandernde Schatten) sowie Objekt-Animationen Jonglieren,
  Pendelschwung und Boing-Hüpfer — als endlos loopendes GIF oder als
  WebM-Video (WebCodecs, sofern der Browser es unterstützt). Alle Pfade
  loopen nahtlos.
- **Verlauf/Favoriten**: Thumbnails der letzten Bilder (localStorage), Klick
  lädt das Bild zurück. Favoriten lassen sich als JSON exportieren und in
  einem anderen Browser wieder importieren.

## Szenen-Archetypen

Klassische Kugeln, Formen-Mix, Säulenhalle, Kugelpyramide, schwebende
Objekte, Zentralkugel, Wasser, Innenraum, Sphereflake, Helix, Türme,
Glasbox, fremde Welt (Planeten, Monolith, UFO), Ringe/Tori, Logo-Schriftzug
(3D-Buchstaben aus einer 5×7-Pixelschrift), Würfel & Co (CSG: Spielwürfel
mit Augen, angebissene Würfel, Schalen, Rohre), Menger-Schwamm und
Säulenwald, Berglandschaft (echtes Raymarching-Heightfield mit Schnee,
See und schwebender Chromkugel — der Bryce-Look), Blobs/Metaballs,
Schwimmbad (transparentes Wasser über gekacheltem Becken mit
Kaustik-Lichtnetz), Schachbrett mit Figuren, Spiegelsaal mit
Endlos-Reflexionen — und die berühmten Motive: der Jongleur (Hommage an
Eric Grahams Amiga-Klassiker von 1986, inkl. Jonglier-Animation), der
Boing-Ball, nummerierte Billardkugeln (Ziffern per 5×7-Pixelschrift als
Kugeltextur), das Newton-Pendel (mit Schwung-Animation), Stillleben mit
CSG-Weinglas und Trauben, Studio-Produktfotos, griechischer Tempel,
Innenraum mit Fenster-Lichtschacht und Wendeltreppe — kombiniert mit
7 Farbschemata (inkl. reiner
POV-Ray-Primärfarben), 6 Himmelstypen (inkl. Wolken, Sternen, Gasnebeln,
Silhouetten-Bergen und Planeten mit Ringen), Nebel, God-Rays, Lens Flare
und Fake-Kaustiken unter Glasobjekten.

## Technik

- Rekursiver Raytracer in reinem JavaScript: Kugel, Ebene, Box (rotiert),
  Zylinder, Kegel, **Torus** (Quartic-Löser nach Graphics Gems),
  **CSG** (Differenz/Schnitt konvexer Körper über Intervall-Arithmetik),
  **Heightfield-Terrain** (Grid-basiertes Raymarching) und
  **Blobs/Metaballs** (Feld-Marching mit analytischen Normalen).
- Effekte: volumetrische God-Rays, Prisma-Dispersion (Brechung pro
  Farbkanal), Bloom/Glow, Anaglyph 3D, Fischaugen-Projektion.
- Spiegelung, Brechung mit Fresnel (Schlick), farbige Glas-Schatten,
  prozedurale Texturen (Schachbrett, Marmor, Holz, Bozo, Streifen, Grid),
  Bump-Mapping, Distanz-Fade gegen Moiré.
- **BVH** (Bounding Volume Hierarchy) für Szenen mit hunderten Objekten.
- **Web-Worker-Pool** (bis 8 Threads) mit automatischem
  Hauptthread-Fallback; `?noworker` in der URL erzwingt den Fallback.
- Eigene Encoder, alles ohne Bibliotheken: PNG (via Canvas), animiertes
  GIF89a (LZW), ZIP (Store) und WebM (minimaler EBML-Muxer für
  VP8-Chunks aus WebCodecs).

## Headless-Rendern / Tests

Der Renderkern lässt sich mit Node ohne Browser ausführen:

```
node test/render.js <ausgabeordner> <seed> <seed:archetyp> ...
SWEEP=400 node test/render.js          # Robustheits-Sweep über 400 Seeds
```

Umgebungsvariablen: `W`/`H` (Auflösung), `MODE` (0–3, wie Qualitätsstufen),
`DITHER=1` (256 Farben), `GIF=1` (zusätzlich kleines Orbit-GIF).
