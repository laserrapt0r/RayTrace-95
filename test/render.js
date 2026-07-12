#!/usr/bin/env node
// Headless-Renderer und Testwerkzeug für RayTrace ’95.
// Extrahiert den Renderkern aus ../index.html und rendert Seeds als PNG.
//
// Aufrufe:
//   node test/render.js <outdir> <seed|seed:archetyp> ...   Bilder rendern
//   SWEEP=300 node test/render.js                            Robustheits-Sweep
//   GIF=1 node test/render.js <outdir> <seed>                zusätzlich Orbit-GIF (6 Frames)
//
// Umgebungsvariablen: W, H (Standard 480×360), MODE (0=schnell 1=adaptiv 2=4xAA
// 3=weiche Schatten; Standard 1), DITHER=1 (256 Farben)
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const core = html.split('//__CORE_START__')[1].split('//__CORE_END__')[0];
const RT90 = new Function(core + '\n;return RT90;')();

const W = Number(process.env.W || 480);
const H = Number(process.env.H || 360);
const MODE = Number(process.env.MODE || 1);

// --- Mini-PNG-Encoder (RGBA, 8 Bit) ---
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function writePNG(file, w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    for (let i = 0; i < w * 4; i++) raw[y * (w * 4 + 1) + 1 + i] = rgba[y * w * 4 + i];
  }
  fs.writeFileSync(file, Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 6 })),
    chunk('IEND', Buffer.alloc(0)),
  ]));
}

// --- Sweep-Modus: viele Seeds auf Fehler/schwarze Bilder prüfen ---
if (process.env.SWEEP) {
  const count = Number(process.env.SWEEP);
  let errs = 0, dark = 0;
  const archCount = {};
  for (let s = 1000; s < 1000 + count; s++) {
    try {
      const p = RT90.parseSeedInput(String(s));
      const sc = RT90.generateScene(p.seeds, {});
      archCount[sc.info.arch] = (archCount[sc.info.arch] || 0) + 1;
      const w = 64, h = 48;
      const buf = new Uint8ClampedArray(w * h * 4);
      RT90.createRenderer(sc, w, h, 0).renderBand(0, h, buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i += 4) sum += buf[i] + buf[i + 1] + buf[i + 2];
      if (sum / (w * h * 3) < 6) { dark++; console.log('  sehr dunkel:', s, sc.info.arch, sc.info.sky); }
      for (let i = 0; i < buf.length; i++) if (Number.isNaN(buf[i])) throw new Error('NaN im Bild');
    } catch (e) { errs++; console.log('  FEHLER Seed', s, e.message); }
  }
  console.log(`${count} Seeds — Fehler: ${errs}, sehr dunkel: ${dark}`);
  console.log('Verteilung:', JSON.stringify(archCount));
  process.exit(errs ? 1 : 0);
}

// --- Bilder rendern ---
const outDir = process.argv[2];
const specs = process.argv.slice(3);
if (!outDir || !specs.length) {
  console.log('Aufruf: node test/render.js <outdir> <seed|seed:archetyp> ...');
  console.log('   oder: SWEEP=300 node test/render.js');
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });
for (const spec of specs) {
  const [seedStr, arch] = spec.split(':');
  const parsed = RT90.parseSeedInput(seedStr);
  const opts = arch ? { arch } : {};
  const t0 = Date.now();
  const scene = RT90.generateScene(parsed.seeds, opts);
  const r = RT90.createRenderer(scene, W, H, MODE);
  const buf = new Uint8ClampedArray(W * H * 4);
  r.renderBand(0, H, buf);
  let flareTxt = '';
  if (scene.flare) {
    const sp = RT90.projectSun(scene, W, H);
    if (sp) { RT90.applyLensFlare(buf, W, H, sp.x, sp.y, scene.flare); flareTxt = ' / flare'; }
  }
  if (process.env.NOGRADE !== '1') RT90.applyColorGrade(buf, W, H, 1.35, 0.25);
  let out = buf;
  if (process.env.DITHER === '1') out = RT90.quantizeDither(buf, W, H).rgba;
  const name = `s${seedStr}${arch ? '_' + arch : ''}` +
    `${process.env.DITHER === '1' ? '_d' : ''}${process.env.NOGRADE === '1' ? '_flat' : ''}`;
  writePNG(path.join(outDir, name + '.png'), W, H, out);
  console.log(`${spec}: ${scene.info.arch} / ${scene.info.sky} / ${scene.info.pal}` +
    `${scene.info.fog ? ' / fog' : ''}${flareTxt} — ${((Date.now() - t0) / 1000).toFixed(1)}s -> ${name}.png`);
}

// --- GIF-Test: kleiner Orbit vom ersten Seed ---
if (process.env.GIF === '1') {
  const [seedStr, arch] = specs[0].split(':');
  const parsed = RT90.parseSeedInput(seedStr);
  const opts = arch ? { arch } : {};
  const scene = RT90.generateScene(parsed.seeds, opts);
  const cam0 = scene.cam;
  const GW = 240, GH = 180, FR = 6;
  const frames = [];
  for (let f = 0; f < FR; f++) {
    const ang = f / FR * Math.PI * 2;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    const relX = cam0.ex - cam0.lx, relZ = cam0.ez - cam0.lz;
    scene.cam = { ex: cam0.lx + ca * relX + sa * relZ, ey: cam0.ey,
      ez: cam0.lz - sa * relX + ca * relZ, lx: cam0.lx, ly: cam0.ly, lz: cam0.lz, fov: cam0.fov };
    delete scene._accel;
    const r = RT90.createRenderer(scene, GW, GH, 0);
    const buf = new Uint8ClampedArray(GW * GH * 4);
    r.renderBand(0, GH, buf);
    const q = RT90.quantizeDither(buf, GW, GH);
    frames.push({ indexed: q.indexed, palette: q.palette });
  }
  const gif = RT90.gifEncode(GW, GH, frames, 10);
  fs.writeFileSync(path.join(outDir, 'orbit.gif'), Buffer.from(gif));
  console.log(`orbit.gif: ${FR} Frames, ${(gif.length / 1024).toFixed(0)} kB`);
}
