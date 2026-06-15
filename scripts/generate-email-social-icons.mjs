import sharp from "sharp";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const socialDir = path.join(__dirname, "../public/email/social");

const icons = await readdir(socialDir);
const svgFiles = icons.filter((file) => file.endsWith(".svg"));

for (const file of svgFiles) {
  const input = path.join(socialDir, file);
  const output = path.join(socialDir, file.replace(/\.svg$/, ".png"));
  await sharp(input).resize(44, 44).png().toFile(output);
  console.log(`Generated ${path.basename(output)}`);
}

console.log(`Done — ${svgFiles.length} email social icons.`);
