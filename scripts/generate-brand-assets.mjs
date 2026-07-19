#!/usr/bin/env node
/**
 * BamSignal brand asset pipeline
 *
 * Masters live in public/brand/masters/ (never overwritten by this script).
 * Outputs optimized PNG + WebP under public/brand/, favicons, PWA/Android icons.
 *
 * Run: npm run generate:brand
 */
import sharp from "sharp";
import {
  mkdir,
  writeFile,
  copyFile,
  stat,
  access,
  readdir
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const brandDir = path.join(root, "public/brand");
const mastersDir = path.join(brandDir, "masters");
const iconsDir = path.join(root, "public/icons");
const publicDir = path.join(root, "public");

const WEBP_OPTS = { quality: 90, alphaQuality: 100, effort: 6, smartSubsample: true };
const PNG_OPTS = { compressionLevel: 9, adaptiveFiltering: true };

const MASTER_NAMES = [
  "dark-favicon",
  "light-favicon",
  "dark-logo",
  "light-logo",
  "dark-icon",
  "light-icon",
  "dark-splash",
  "light-splash"
];

const report = { generatedAt: new Date().toISOString(), sources: [], outputs: [] };

function kb(n) {
  return `${(n / 1024).toFixed(1)} KB`;
}

async function fileSize(p) {
  try {
    return (await stat(p)).size;
  } catch {
    return 0;
  }
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureMasters() {
  await mkdir(mastersDir, { recursive: true });
  for (const name of MASTER_NAMES) {
    const master = path.join(mastersDir, `${name}.png`);
    const live = path.join(brandDir, `${name}.png`);
    if (!(await exists(master)) && (await exists(live))) {
      await copyFile(live, master);
      console.log(`seeded master ${name}.png`);
    }
    if (!(await exists(master))) {
      // legacy typo
      if (name === "light-favicon") {
        const typo = path.join(brandDir, "light-favison.png");
        if (await exists(typo)) {
          await copyFile(typo, master);
          console.log("seeded light-favicon from light-favison.png");
          continue;
        }
      }
      throw new Error(`Missing brand master: masters/${name}.png`);
    }
  }
}

/** Flood-fill near-corner background to transparent — only for plate removal. */
async function removeBackgroundFlood(inputPath, { maxDelta = 36, softEdge = 18 } = {}) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const ch = info.channels;
  const idx = (x, y) => (y * w + x) * ch;
  const samples = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1]
  ].map(([x, y]) => {
    const i = idx(x, y);
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  });
  // Skip if already transparent corners
  if (samples.every((s) => s[3] < 16)) {
    return sharp(inputPath).ensureAlpha().rotate();
  }
  const avg = samples
    .reduce((a, c) => [a[0] + c[0], a[1] + c[1], a[2] + c[2]], [0, 0, 0])
    .map((v) => v / samples.length);
  const dist = (i) =>
    Math.abs(data[i] - avg[0]) + Math.abs(data[i + 1] - avg[1]) + Math.abs(data[i + 2] - avg[2]);
  const visited = new Uint8Array(w * h);
  const stack = [0, 0, w - 1, 0, 0, h - 1, w - 1, h - 1];
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const p = y * w + x;
    if (visited[p]) continue;
    visited[p] = 1;
    const i = p * ch;
    const d = dist(i);
    if (d > maxDelta + softEdge) continue;
    if (d <= maxDelta) data[i + 3] = 0;
    else data[i + 3] = Math.round(data[i + 3] * ((d - maxDelta) / softEdge));
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } });
}

async function writePng(pipeline, outPath) {
  const buf = await pipeline.rotate().png(PNG_OPTS).toBuffer();
  // Re-encode without metadata
  const cleaned = await sharp(buf).png(PNG_OPTS).toBuffer();
  await writeFile(outPath, cleaned);
  return cleaned.length;
}

async function writeWebp(input, outPath, resize) {
  let pipeline = sharp(input).rotate();
  if (resize) {
    pipeline = pipeline.resize(resize.width, resize.height, {
      fit: resize.fit || "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    });
  }
  await pipeline.webp(WEBP_OPTS).toFile(outPath);
  return fileSize(outPath);
}

function encodeIco(pngBuffersWithSizes) {
  const count = pngBuffersWithSizes.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = [];
  for (const { size, buffer } of pngBuffersWithSizes) {
    entries.push({ size, buffer, offset });
    offset += buffer.length;
  }
  const out = Buffer.alloc(offset);
  out.writeUInt16LE(0, 0);
  out.writeUInt16LE(1, 2);
  out.writeUInt16LE(count, 4);
  let entryAt = 6;
  for (const e of entries) {
    out.writeUInt8(e.size >= 256 ? 0 : e.size, entryAt);
    out.writeUInt8(e.size >= 256 ? 0 : e.size, entryAt + 1);
    out.writeUInt8(0, entryAt + 2);
    out.writeUInt8(0, entryAt + 3);
    out.writeUInt16LE(1, entryAt + 4);
    out.writeUInt16LE(32, entryAt + 6);
    out.writeUInt32LE(e.buffer.length, entryAt + 8);
    out.writeUInt32LE(e.offset, entryAt + 12);
    e.buffer.copy(out, e.offset);
    entryAt += 16;
  }
  return out;
}

async function pngSizeBuffer(input, size) {
  return sharp(input)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png(PNG_OPTS)
    .toBuffer();
}

async function writeSizedPng(input, outPath, size) {
  await sharp(input)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png(PNG_OPTS)
    .toFile(outPath);
  return fileSize(outPath);
}

async function processMaster(name, { removeBg = false, maxDelta = 36 } = {}) {
  const masterPath = path.join(mastersDir, `${name}.png`);
  const before = await fileSize(masterPath);
  const pipeline = removeBg
    ? await removeBackgroundFlood(masterPath, { maxDelta })
    : sharp(masterPath).ensureAlpha();
  const outPng = path.join(brandDir, `${name}.png`);
  const outWebp = path.join(brandDir, `${name}.webp`);
  const pngBytes = await writePng(pipeline, outPng);
  const webpBytes = await writeWebp(outPng, outWebp);
  report.sources.push({ name, masterBytes: before, png: pngBytes, webp: webpBytes });
  console.log(`✓ ${name}: master ${kb(before)} → PNG ${kb(pngBytes)}, WebP ${kb(webpBytes)}`);
  return outPng;
}

async function main() {
  await ensureMasters();
  await mkdir(iconsDir, { recursive: true });
  await mkdir(path.join(iconsDir, "maskable"), { recursive: true });

  // Favicons: strip outer plate. Logos/icons/splashes: already prepared in masters.
  const darkFavicon = await processMaster("dark-favicon", { removeBg: true, maxDelta: 40 });
  const lightFavicon = await processMaster("light-favicon", { removeBg: true, maxDelta: 40 });
  const darkLogo = await processMaster("dark-logo", { removeBg: false });
  const lightLogo = await processMaster("light-logo", { removeBg: false });
  const darkIcon = await processMaster("dark-icon", { removeBg: false });
  const lightIcon = await processMaster("light-icon", { removeBg: false });
  await processMaster("dark-splash", { removeBg: false });
  await processMaster("light-splash", { removeBg: false });

  for (const [theme, src] of [
    ["dark", darkFavicon],
    ["light", lightFavicon]
  ]) {
    await writeWebp(src, path.join(publicDir, `favicon-${theme}.webp`), {
      width: 48,
      height: 48
    });
    await writeSizedPng(src, path.join(publicDir, `favicon-${theme}-32.png`), 32);
  }
  await copyFile(path.join(publicDir, "favicon-dark.webp"), path.join(publicDir, "favicon.webp"));

  for (const size of [16, 32, 48]) {
    await writeSizedPng(darkFavicon, path.join(publicDir, `favicon-${size}x${size}.png`), size);
  }

  const ico = encodeIco(
    await Promise.all(
      [16, 32, 48].map(async (size) => ({ size, buffer: await pngSizeBuffer(darkFavicon, size) }))
    )
  );
  await writeFile(path.join(publicDir, "favicon.ico"), ico);

  await writeSizedPng(darkIcon, path.join(publicDir, "apple-touch-icon.png"), 180);
  await writeWebp(path.join(publicDir, "apple-touch-icon.png"), path.join(publicDir, "apple-touch-icon.webp"));

  for (const size of [192, 512]) {
    await writeSizedPng(darkIcon, path.join(iconsDir, `android-chrome-${size}x${size}.png`), size);
    await writeSizedPng(darkIcon, path.join(iconsDir, `icon-${size}.png`), size);
    await writeWebp(darkIcon, path.join(iconsDir, `icon-${size}.webp`), {
      width: size,
      height: size,
      fit: "cover"
    });
  }

  for (const [theme, src] of [
    ["dark", darkIcon],
    ["light", lightIcon]
  ]) {
    for (const size of [192, 512]) {
      await writeWebp(src, path.join(iconsDir, `icon-${theme}-${size}.webp`), {
        width: size,
        height: size,
        fit: "contain"
      });
    }
  }

  const maskInner = await sharp(darkIcon)
    .resize(360, 360, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 26, g: 10, b: 46, alpha: 1 }
    }
  })
    .composite([{ input: maskInner, gravity: "centre" }])
    .png(PNG_OPTS)
    .toFile(path.join(iconsDir, "maskable", "icon-512.png"));

  // Legacy square mark alias
  await writeWebp(darkIcon, path.join(brandDir, "logo.webp"), {
    width: 512,
    height: 512,
    fit: "cover"
  });
  await writeSizedPng(darkIcon, path.join(brandDir, "logo.png"), 512);

  await writeFile(
    path.join(publicDir, "browserconfig.xml"),
    `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/icons/android-chrome-192x192.png"/>
      <TileColor>#1a0a2e</TileColor>
    </tile>
  </msapplication>
</browserconfig>
`
  );

  // Manifest is updated by a sibling write below via constants — keep icons in sync here
  const checks = [
    ["public/favicon.ico", 30],
    ["public/favicon-32x32.png", 30],
    ["public/brand/dark-logo.webp", 150],
    ["public/brand/light-logo.webp", 150],
    ["public/brand/dark-icon.webp", 100],
    ["public/brand/light-icon.webp", 100],
    ["public/brand/dark-splash.webp", 300],
    ["public/brand/light-splash.webp", 300],
    ["public/icons/icon-512.webp", 100]
  ];
  console.log("\nSize targets:");
  for (const [rel, maxKb] of checks) {
    const bytes = await fileSize(path.join(root, rel));
    console.log(`  ${bytes / 1024 <= maxKb ? "PASS" : "WARN"} ${rel} ${kb(bytes)} (<${maxKb}KB)`);
  }

  await writeFile(path.join(brandDir, "brand-pipeline-report.json"), JSON.stringify(report, null, 2));
  console.log("\nBrand assets generated.");
  // silence unused
  void darkLogo;
  void lightLogo;
  void readdir;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
