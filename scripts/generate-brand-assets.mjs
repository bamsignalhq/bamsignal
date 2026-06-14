import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "public/brand/logo.png");

const webpOpts = { quality: 92, alphaQuality: 100, effort: 6 };

async function writeWebp(input, output, size) {
  let pipeline = sharp(input).ensureAlpha();
  if (size) pipeline = pipeline.resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } });
  await pipeline.webp(webpOpts).toFile(output);
  const meta = await sharp(output).metadata();
  const stat = await import("node:fs/promises").then((fs) => fs.stat(output));
  console.log(`✓ ${path.relative(root, output)} (${meta.width}×${meta.height}, ${(stat.size / 1024).toFixed(1)} KB)`);
}

await mkdir(path.join(root, "public/icons"), { recursive: true });

await writeWebp(src, path.join(root, "public/brand/logo.webp"), 512);
await writeWebp(src, path.join(root, "public/favicon.webp"), 48);
await writeWebp(src, path.join(root, "public/icons/icon-192.webp"), 192);
await writeWebp(src, path.join(root, "public/icons/icon-512.webp"), 512);
await writeWebp(src, path.join(root, "public/apple-touch-icon.webp"), 180);

console.log("Brand assets generated.");
