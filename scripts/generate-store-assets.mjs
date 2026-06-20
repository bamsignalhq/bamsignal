#!/usr/bin/env node
/**
 * Generate Google Play store marketing assets from real BamSignal UI.
 *
 * Usage: npm run generate:store-assets
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "store-assets");

const CAPTIONS = [
  "Meet People Who Match Your Vibe",
  "Discover Genuine Connections",
  "Chat Naturally",
  "Build Your Profile",
  "Find What Matters To You",
  "Across Nigerian Cities",
  "Unlock More Connections",
  "Safer And Verified"
];

const PHONE_SCENES = [
  "01-home",
  "02-discover",
  "03-chat",
  "04-profile",
  "05-filters",
  "06-city",
  "07-premium",
  "08-safety"
];

const TABLET_SCENES = PHONE_SCENES.slice(0, 5);

const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://127.0.0.1:${PREVIEW_PORT}`;

function run(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: root,
      stdio: "inherit",
      shell: process.platform === "win32",
      ...options
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} exited with ${code}`));
    });
  });
}

function startPreview() {
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["run", "preview", "--", "--port", String(PREVIEW_PORT), "--strictPort"], {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
      env: { ...process.env, VITE_STORE_SCREENSHOTS: "true" }
    });

    let ready = false;
    const onData = (chunk) => {
      const text = chunk.toString();
      if (!ready && /Local:\s+http/.test(text)) {
        ready = true;
        resolve(child);
      }
    };
    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);
    child.on("error", reject);
    child.on("close", (code) => {
      if (!ready) reject(new Error(`Preview server failed (${code})`));
    });

    setTimeout(() => {
      if (!ready) {
        ready = true;
        resolve(child);
      }
    }, 8000);
  });
}

async function waitForServer(page) {
  for (let i = 0; i < 30; i += 1) {
    try {
      await page.goto(`${PREVIEW_URL}/store-screenshots?scene=01-home&variant=phone`, {
        waitUntil: "networkidle",
        timeout: 5000
      });
      return;
    } catch {
      await page.waitForTimeout(500);
    }
  }
  throw new Error("Preview server did not become ready");
}

async function captureScene(page, scene, variant, outputPath) {
  const sizes = {
    phone: { width: 1080, height: 1920 },
    "tablet-7": { width: 1600, height: 2560 },
    "tablet-10": { width: 2048, height: 2732 }
  };
  const size = sizes[variant];
  await page.setViewportSize(size);
  await page.goto(`${PREVIEW_URL}/store-screenshots?scene=${scene}&variant=${variant}`, {
    waitUntil: "networkidle"
  });
  await page.waitForSelector("[data-store-shot-ready]");
  await page.waitForTimeout(600);
  await page.screenshot({
    path: outputPath,
    type: "png",
    fullPage: false,
    animations: "disabled"
  });
  console.log(`✓ ${path.relative(root, outputPath)}`);
}

async function generateFeatureGraphic() {
  const heroPath = path.join(root, "public/showcase/hero-lagos-young-professionals-01.webp");
  const logoPath = path.join(root, "public/brand/logo.webp");
  const width = 1024;
  const height = 500;
  const outPath = path.join(outDir, "feature-graphic", "feature-graphic-1024x500.png");

  const bgSvg = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#071222"/>
        <stop offset="55%" stop-color="#0f2340"/>
        <stop offset="100%" stop-color="#152f52"/>
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#c9a227"/>
        <stop offset="100%" stop-color="#e8c56a"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <rect x="56" y="188" width="72" height="5" rx="2.5" fill="url(#gold)"/>
    <text x="56" y="96" fill="#ffffff" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-size="42" font-weight="800">Meet People Who Match Your Vibe</text>
    <text x="56" y="148" fill="#d7e3f4" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-size="22" font-weight="500">Meaningful Connections Across Nigerian Cities</text>
    <text x="56" y="430" fill="#9eb4d4" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-size="18" font-weight="600">BamSignal</text>
  </svg>`);

  const hero = await sharp(heroPath)
    .resize(500, height, { fit: "cover", position: "centre" })
    .modulate({ brightness: 1.02, saturation: 0.95 })
    .toBuffer();

  const logo = await sharp(logoPath).resize(40, 40).toBuffer();

  await sharp(bgSvg)
    .composite([
      { input: hero, left: width - 500, top: 0 },
      { input: logo, left: 56, top: 404 }
    ])
    .png({ compressionLevel: 9, quality: 92 })
    .toFile(outPath);

  console.log(`✓ ${path.relative(root, outPath)}`);
}

async function writeCaptionFiles() {
  const captionsPath = path.join(outDir, "captions", "screenshot-captions.txt");
  const copyPath = path.join(outDir, "captions", "play-store-copy.txt");

  const captionsBody = CAPTIONS.map((line, i) => `${i + 1}.\n${line}\n`).join("\n");
  await writeFile(captionsPath, `${captionsBody.trim()}\n`, "utf8");

  const copyBody = `BamSignal — Google Play listing copy

Short description (80 chars max):
Meet people who match your vibe across Nigerian cities.

Full description:
BamSignal is a Nigerian-first dating app built for intentional connections — not endless swiping.

• Discover genuine people in Lagos, Abuja, Port Harcourt and more
• Send a Signal when someone catches your interest
• Chat naturally with clean, respectful messaging
• Build a rich profile with photos, interests and what you're looking for
• Filter by what matters — faith, lifestyle, cities and more
• Signal Pass unlocks more connections, filters and priority visibility
• Safety tools: block, report, verification and moderation

Meaningful connections across Nigerian cities.

Feature graphic headline:
Meet People Who Match Your Vibe

Feature graphic subheading:
Meaningful Connections Across Nigerian Cities
`;
  await writeFile(copyPath, copyBody, "utf8");
  console.log(`✓ ${path.relative(root, captionsPath)}`);
  console.log(`✓ ${path.relative(root, copyPath)}`);
}

async function main() {
  await mkdir(path.join(outDir, "feature-graphic"), { recursive: true });
  await mkdir(path.join(outDir, "phone"), { recursive: true });
  await mkdir(path.join(outDir, "tablet-7-inch"), { recursive: true });
  await mkdir(path.join(outDir, "tablet-10-inch"), { recursive: true });
  await mkdir(path.join(outDir, "captions"), { recursive: true });

  console.log("[bamsignal] Building app with store screenshot route…");
  await run("npm", ["run", "build"], {
    env: { ...process.env, VITE_STORE_SCREENSHOTS: "true" }
  });

  console.log("[bamsignal] Starting preview server…");
  const preview = await startPreview();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await waitForServer(page);

    for (const scene of PHONE_SCENES) {
      await captureScene(
        page,
        scene,
        "phone",
        path.join(outDir, "phone", `screenshot-${scene}.png`)
      );
    }

    for (const scene of TABLET_SCENES) {
      await captureScene(
        page,
        scene,
        "tablet-7",
        path.join(outDir, "tablet-7-inch", `screenshot-${scene}.png`)
      );
    }

    for (const scene of TABLET_SCENES) {
      await captureScene(
        page,
        scene,
        "tablet-10",
        path.join(outDir, "tablet-10-inch", `screenshot-${scene}.png`)
      );
    }
  } finally {
    await browser.close();
    preview.kill("SIGTERM");
  }

  await generateFeatureGraphic();
  await writeCaptionFiles();

  console.log("\n[bamsignal] Store assets ready in store-assets/");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
