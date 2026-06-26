/**
 * Optimize public/showcase/backdrop.png → backdrop.webp for profile cover fallback.
 * Keeps the PNG source in repo; production serves WebP only.
 */
import sharp from "sharp";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const inputPath = path.join(root, "public/showcase/backdrop.png");
const outputPath = path.join(root, "public/showcase/backdrop.webp");

const QUALITY = 84;
const MAX_WIDTH = 1920;
const MAX_BYTES = 180 * 1024;
const PREFERRED_BYTES = 120 * 1024;

let pipeline = sharp(inputPath);
const meta = await pipeline.metadata();
if (meta.width && meta.width > MAX_WIDTH) {
  pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true, fit: "inside" });
}

await pipeline
  .rotate()
  .webp({ quality: QUALITY, effort: 6, smartSubsample: true })
  .toFile(outputPath);

const outStat = await stat(outputPath);
const sizeKb = outStat.size / 1024;

console.log(
  `✓ backdrop.png → backdrop.webp (${meta.width}×${meta.height}, ${sizeKb.toFixed(1)} KB, q=${QUALITY})`
);

if (outStat.size < 512) {
  throw new Error("WebP output too small — conversion may have failed");
}
if (outStat.size > MAX_BYTES) {
  console.warn(`⚠ backdrop.webp is ${sizeKb.toFixed(1)} KB (target ≤ ${MAX_BYTES / 1024} KB)`);
} else if (outStat.size <= PREFERRED_BYTES) {
  console.log(`✓ Under preferred ${PREFERRED_BYTES / 1024} KB target`);
}
