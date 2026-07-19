import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "public/brand/dark-icon.png");
const resRoot = path.join(root, "android/app/src/main/res");

const BRAND_BG = { r: 26, g: 10, b: 46, alpha: 1 }; // #1a0a2e
const SPLASH_BG = { r: 16, g: 25, b: 35, alpha: 1 }; // #101923

const launcherSizes = {
  "mipmap-mdpi": 48,
  "mipmap-hdpi": 72,
  "mipmap-xhdpi": 96,
  "mipmap-xxhdpi": 144,
  "mipmap-xxxhdpi": 192
};

const foregroundSizes = {
  "mipmap-mdpi": 108,
  "mipmap-hdpi": 162,
  "mipmap-xhdpi": 216,
  "mipmap-xxhdpi": 324,
  "mipmap-xxxhdpi": 432
};

async function writeIcon(output, size, paddingRatio = 0.12) {
  const inner = Math.round(size * (1 - paddingRatio * 2));
  const logo = await sharp(src)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND_BG
    }
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toFile(output);
}

async function writeForeground(output, size) {
  const inner = Math.round(size * 0.55);
  const logo = await sharp(src)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toFile(output);
}

async function writeSplash(output, size) {
  const inner = Math.round(size * 0.42);
  const logo = await sharp(src)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: SPLASH_BG
    }
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toFile(output);
}

for (const [folder, size] of Object.entries(launcherSizes)) {
  const dir = path.join(resRoot, folder);
  await mkdir(dir, { recursive: true });
  await writeIcon(path.join(dir, "ic_launcher.png"), size);
  await writeIcon(path.join(dir, "ic_launcher_round.png"), size);
  console.log(`✓ ${folder}/ic_launcher.png (${size}px)`);
}

for (const [folder, size] of Object.entries(foregroundSizes)) {
  const dir = path.join(resRoot, folder);
  await mkdir(dir, { recursive: true });
  await writeForeground(path.join(dir, "ic_launcher_foreground.png"), size);
  console.log(`✓ ${folder}/ic_launcher_foreground.png (${size}px)`);
}

const drawableDir = path.join(resRoot, "drawable");
await mkdir(drawableDir, { recursive: true });
await writeSplash(path.join(drawableDir, "splash_logo.png"), 512);
console.log("✓ drawable/splash_logo.png");

console.log("Android icons generated from public/brand/dark-icon.png");
