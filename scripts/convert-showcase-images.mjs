/**
 * Convert public/showcase/*.png → optimized WebP, then delete PNG originals.
 */
import sharp from "sharp";
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const showcaseDir = path.join(root, "public/showcase");

const QUALITY = 85;
const MAX_WIDTH = 1920;

function normalizeBasename(filename) {
  const base = filename.replace(/\.png$/i, "");
  return base.replace(/\.+$/, "").replace(/\.\./g, ".");
}

async function convertFile(filename) {
  const inputPath = path.join(showcaseDir, filename);
  const outBase = normalizeBasename(filename);
  const outputPath = path.join(showcaseDir, `${outBase}.webp`);

  let pipeline = sharp(inputPath);
  const meta = await pipeline.metadata();
  if (meta.width && meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true, fit: "inside" });
  }

  await pipeline.webp({ quality: QUALITY, effort: 6, smartSubsample: true }).toFile(outputPath);

  const outStat = await stat(outputPath);
  if (outStat.size < 512) {
    throw new Error("WebP output too small — conversion may have failed");
  }

  await unlink(inputPath);

  console.log(
    `✓ ${filename} → ${outBase}.webp (${meta.width}×${meta.height}, ${(outStat.size / 1024).toFixed(1)} KB) [PNG deleted]`
  );
  return `${outBase}.webp`;
}

const files = (await readdir(showcaseDir)).filter((f) => f.toLowerCase().endsWith(".png"));
if (!files.length) {
  console.log("No PNG files found in public/showcase/");
  process.exit(0);
}

console.log(`Converting ${files.length} showcase PNG(s)…\n`);
const outputs = [];
const errors = [];

for (const file of files.sort()) {
  try {
    outputs.push(await convertFile(file));
  } catch (err) {
    errors.push({ file, message: err.message });
    console.error(`✗ ${file}:`, err.message);
  }
}

console.log(`\nDone. ${outputs.length} WebP created, ${outputs.length} PNG deleted.`);
if (errors.length) {
  console.error(`${errors.length} file(s) failed — PNGs kept for failed conversions.`);
  process.exit(1);
}
