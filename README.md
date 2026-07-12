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
- **Qualität**: Schnell (1 Strahl/Pixel) · Adaptiv (Kantenglättung nur an
  Kanten) · Maximal (4× überall) · Ultra (zusätzlich weiche Schatten).
- **256 Farben**: Median-Cut-Quantisierung + Floyd-Steinberg-Dithering für
  den authentischen GIF-Look von damals (ohne Neu-Rendern umschaltbar).
- **Batch-ZIP**: rendert 8 Zufallsbilder und lädt sie gesammelt als ZIP.
- **Animation**: Kamerapfade Orbit, Spirale, Wellen (animiertes Wasser) und
  Sonnenumlauf (wandernde Schatten) — als endlos loopendes GIF oder als
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
Säulenwald — kombiniert mit 6 Farbschemata, 6 Himmelstypen (inkl. Wolken,
Sternen, Silhouetten-Bergen und Planeten mit Ringen), Nebel, Lens Flare
und Fake-Kaustiken unter Glasobjekten.

## Technik

- Rekursiver Raytracer in reinem JavaScript: Kugel, Ebene, Box (rotiert),
  Zylinder, Kegel, **Torus** (Quartic-Löser nach Graphics Gems) und
  **CSG** (Differenz/Schnitt konvexer Körper über Intervall-Arithmetik).
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
