/**
 * Static source integrity checks — requires src/ (not present in Docker runner).
 * Run locally and in pre-push; skipped when src/ is absent.
 *
 * Modes:
 *   (default)     web + android when android/ is present
 *   --web         web-safe checks only (Docker builder)
 *   --android     android checks only (skipped without android/)
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  createContext,
  isAndroidProjectPresent,
  parseIntegrityMode,
  resolveRootPath,
} from "./source-integrity/lib.mjs";
import { runWebIntegrityChecks } from "./source-integrity/web.mjs";
import { runAndroidIntegrityChecks } from "./source-integrity/android.mjs";

const rootPath = resolveRootPath(import.meta.url);
const srcRoot = join(rootPath, "src");
const mode = parseIntegrityMode(process.argv);

if (!existsSync(srcRoot)) {
  console.log("source integrity skipped (no src/ — Docker runner or partial checkout)");
  process.exit(0);
}

const ctx = createContext(rootPath);

if (mode === "web" || mode === "all") {
  runWebIntegrityChecks(ctx);
}

if (mode === "android" || mode === "all") {
  if (!isAndroidProjectPresent(ctx)) {
    console.log("Android project not detected. Skipping Android integrity checks.");
  } else {
    runAndroidIntegrityChecks(ctx);
  }
}

console.log("source integrity ok");
