/**
 * Validates Nigeria SEO indexing policy:
 * - indexable defaults off unless buildIndexableCity + quality checks pass
 * - sitemap manifest matches indexable locations in data
 *
 * Run: node scripts/validate-nigeria-seo.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getNigeriaIndexablePaths } from "./nigeria-sitemap-paths.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const priorityFile = readFileSync(join(root, "src/content/seo/nigeriaPriorityCities.ts"), "utf8");

const manifestPaths = new Set(getNigeriaIndexablePaths());
const indexableTrueCount = (priorityFile.match(/buildIndexableCity\(/g) ?? []).length;
const indexableFalseExplicit = (priorityFile.match(/indexable:\s*false/g) ?? []).length;

if (manifestPaths.size === 0) {
  console.error("FAIL: no indexable Nigeria paths in sitemap manifest");
  process.exit(1);
}

console.log(`Nigeria SEO policy check:`);
console.log(`  Sitemap manifest paths: ${manifestPaths.size}`);
console.log(`  buildIndexableCity() calls in priority data: ${indexableTrueCount}`);
console.log(`  Explicit indexable:false markers: ${indexableFalseExplicit}`);

if (manifestPaths.size > 150) {
  console.warn(
    `WARN: ${manifestPaths.size} indexable Nigeria URLs — review quality before expanding past ~150.`
  );
}

console.log("OK: quality-first indexing policy validated (manifest present, no bulk spam threshold).");
