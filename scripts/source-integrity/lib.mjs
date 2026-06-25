/**
 * Shared helpers for source integrity checks.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const ANDROID_MANIFEST_PATH = "android/app/src/main/AndroidManifest.xml";

export function createContext(rootPath) {
  return {
    rootPath,
    readSrc(relativePath) {
      return readFileSync(join(rootPath, relativePath), "utf8");
    },
    readFile(relativePath) {
      return readFileSync(join(rootPath, relativePath), "utf8");
    },
    exists(relativePath) {
      return existsSync(join(rootPath, relativePath));
    },
  };
}

export function resolveRootPath(metaUrl) {
  return join(dirname(fileURLToPath(metaUrl)), "..");
}

export function assertCheck(condition, message) {
  if (condition) return;
  console.error(`source integrity failed: ${message}`);
  process.exit(1);
}

export function isAndroidProjectPresent(ctx) {
  return ctx.exists(ANDROID_MANIFEST_PATH);
}

export function parseIntegrityMode(argv) {
  if (argv.includes("--web")) return "web";
  if (argv.includes("--android")) return "android";
  return "all";
}
