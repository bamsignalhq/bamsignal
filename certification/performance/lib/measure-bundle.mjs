import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

function walkFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walkFiles(full, acc);
    else acc.push(full);
  }
  return acc;
}

export function measureBundle(distDir) {
  const files = walkFiles(join(distDir, "assets"));
  let totalJs = 0;
  let largestJs = { name: "", bytes: 0 };
  let largestImage = { name: "", bytes: 0 };

  for (const file of files) {
    const bytes = statSync(file).size;
    const ext = extname(file).toLowerCase();
    if (ext === ".js") {
      totalJs += bytes;
      if (bytes > largestJs.bytes) largestJs = { name: file.split("/").pop() || file, bytes };
    }
    if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext)) {
      if (bytes > largestImage.bytes) largestImage = { name: file.split("/").pop() || file, bytes };
    }
  }

  return {
    bundleSizeKb: Math.round(totalJs / 1024),
    largestJsChunkKb: Math.round(largestJs.bytes / 1024),
    largestJsChunkName: largestJs.name,
    largestImageKb: Math.round(largestImage.bytes / 1024),
    largestImageName: largestImage.name,
    fileCount: files.length
  };
}

export function readBuildId(distDir) {
  try {
    const index = readFileSync(join(distDir, "index.html"), "utf8");
    const match = index.match(/bamsignal-v[\w.-]+/i);
    return match?.[0] ?? null;
  } catch {
    return null;
  }
}
