import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { getNigeriaIndexablePaths } from "./nigeria-sitemap-paths.mjs";
import { SEO_DETAIL_PATHS, SEO_HUB_PATHS, LEGAL_STATIC_PATHS } from "./seo-sitemap-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const manifestPath = join(__dirname, "seo-manifest.json");

const BANNED = [
  /guaranteed matches/i,
  /everyone is verified/i,
  /100% safe/i,
  /real people guaranteed/i,
  /verified singles everywhere/i,
  /thousands of members/i,
  /safe guaranteed/i
];

const MIN_WORDS = 300;
const FAQ_REQUIRED_PREFIXES = ["/cities/", "/help/", "/safety/", "/premium/", "/guides/"];

if (!existsSync(manifestPath)) {
  execSync("node scripts/generate-seo-manifest.mjs", { cwd: root, stdio: "inherit" });
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const pages = manifest.pages;

const errors = [];
const warnings = [];

function scanBannedPhrases() {
  const targets = [
    join(root, "src/data/blogPosts.ts"),
    join(root, "src/content/seo"),
    join(root, "src/pages/seo")
  ];
  for (const target of targets) {
    if (!existsSync(target)) continue;
    const files = target.endsWith(".ts")
      ? [target]
      : readdirSync(target)
          .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
          .map((f) => join(target, f));
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      for (const pattern of BANNED) {
        if (pattern.test(content)) {
          errors.push(`Banned phrase ${pattern} in ${file.replace(root + "/", "")}`);
        }
      }
    }
  }
}

scanBannedPhrases();

const indexablePages = pages.filter((p) => p.indexable);
const noindexPages = pages.filter((p) => !p.indexable);

const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();

for (const page of pages) {
  const fullText = [page.title, page.description, page.intro, page.h1].join(" ");
  for (const pattern of BANNED) {
    if (pattern.test(fullText)) {
      errors.push(`Banned phrase on ${page.canonicalPath}: ${pattern}`);
    }
  }

  if (!page.canonicalPath) {
    errors.push(`Missing canonicalPath (${page.source})`);
    continue;
  }

  if (canonicals.has(page.canonicalPath)) {
    errors.push(`Duplicate canonicalPath: ${page.canonicalPath}`);
  }
  canonicals.set(page.canonicalPath, page);

  if (!page.title?.trim()) errors.push(`Empty title: ${page.canonicalPath}`);
  if (!page.description?.trim()) errors.push(`Empty description: ${page.canonicalPath}`);
  if (!page.h1?.trim()) errors.push(`Missing h1: ${page.canonicalPath}`);

  if (page.title) {
    if (titles.has(page.title)) {
      errors.push(`Duplicate title: "${page.title}" (${page.canonicalPath} vs ${titles.get(page.title)})`);
    }
    titles.set(page.title, page.canonicalPath);
  }

  if (page.description) {
    if (descriptions.has(page.description)) {
      warnings.push(
        `Duplicate description: ${page.canonicalPath} vs ${descriptions.get(page.description)}`
      );
    }
    descriptions.set(page.description, page.canonicalPath);
  }

  if (page.indexable) {
    if (page.wordCount < MIN_WORDS) {
      warnings.push(
        `Indexable page under ${MIN_WORDS} words (~${page.wordCount}): ${page.canonicalPath}`
      );
    }
    const needsFaq = FAQ_REQUIRED_PREFIXES.some((prefix) => page.canonicalPath.startsWith(prefix));
    const isNigeriaCity =
      page.canonicalPath.startsWith("/nigeria/") &&
      page.canonicalPath.split("/").filter(Boolean).length === 3;
    if ((needsFaq || isNigeriaCity) && page.faqCount === 0) {
      errors.push(`Indexable page missing FAQ: ${page.canonicalPath}`);
    }
  }
}

const sitemapXml = readFileSync(join(root, "public/sitemap.xml"), "utf8");
const sitemapCount = (sitemapXml.match(/<loc>/g) || []).length;
const sitemapPaths = [...sitemapXml.matchAll(/<loc>https:\/\/bamsignal\.com([^<]*)<\/loc>/g)].map(
  (m) => m[1] || "/"
);
const indexablePaths = new Set(
  indexablePages.map((p) => (p.canonicalPath === "/" ? "/" : p.canonicalPath))
);

const nigeriaManifest = new Set(getNigeriaIndexablePaths());
for (const path of nigeriaManifest) {
  if (!sitemapPaths.includes(path)) {
    warnings.push(`Nigeria indexable path missing from sitemap: ${path}`);
  }
}

const blocked = ["/home", "/discover", "/chats", "/signals", "/profile", "/settings", "/admin", "/hard", "/onboarding"];
for (const path of blocked) {
  if (sitemapPaths.some((p) => p === path || p.startsWith(`${path}/`))) {
    errors.push(`Blocked member/admin path in sitemap: ${path}`);
  }
}

if (Math.abs(sitemapCount - indexablePaths.size) > 30) {
  warnings.push(
    `Sitemap count (${sitemapCount}) differs from manifest indexable count (${indexablePaths.size}) — blog/legal may differ`
  );
}

console.log("SEO content validation");
console.log(`  Total pages: ${pages.length}`);
console.log(`  Indexable pages: ${indexablePages.length}`);
console.log(`  Noindex pages: ${noindexPages.length}`);
console.log(`  Sitemap URLs: ${sitemapCount}`);
console.log(`  Errors: ${errors.length}`);
console.log(`  Warnings: ${warnings.length}`);

if (warnings.length) {
  console.log("\nWarnings:");
  warnings.slice(0, 20).forEach((w) => console.log(`  - ${w}`));
  if (warnings.length > 20) console.log(`  ... and ${warnings.length - 20} more`);
}

if (errors.length) {
  console.log("\nErrors:");
  errors.forEach((e) => console.log(`  - ${e}`));
  process.exit(1);
}

console.log("\nOK: SEO content validation passed.");
