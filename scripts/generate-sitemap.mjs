import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LEGAL_STATIC_PATHS, ROBOTS_TXT, SEO_DETAIL_PATHS, SEO_HUB_PATHS } from "./seo-sitemap-data.mjs";
import { getNigeriaIndexablePaths } from "./nigeria-sitemap-paths.mjs";
import { getSignalEventsIndexablePaths } from "./signal-events-sitemap-paths.mjs";
import { sitemapPriorityFor, sitemapChangefreqFor } from "./sitemap-priority.mjs";

const SITE = "https://bamsignal.com";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const cities = JSON.parse(readFileSync(join(root, "src/data/blog/sitemap-cities.json"), "utf8"));
const pillarSlugs = [
  "best-dating-apps-nigeria-2026",
  "find-real-love-nigeria-guide",
  "verified-dating-nigeria-safety",
  "what-is-bamsignal-nigeria-dating"
];

const blogSlugs = [
  ...cities.map((c) => `/blog/find-love-in-${c}-nigeria`),
  ...pillarSlugs.map((s) => `/blog/${s}`)
];

const nigeriaPaths = getNigeriaIndexablePaths();
const signalEventsPaths = getSignalEventsIndexablePaths();
const staticPaths = ["", "/blog", "/signal-concierge", ...signalEventsPaths, ...LEGAL_STATIC_PATHS, ...SEO_HUB_PATHS, ...SEO_DETAIL_PATHS, ...nigeriaPaths];
const lastmod = new Date().toISOString().slice(0, 10);
const urls = [...staticPaths, ...blogSlugs];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((path) => {
    const loc = path ? `${SITE}${path}` : `${SITE}/`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${sitemapChangefreqFor(path)}</changefreq>
    <priority>${sitemapPriorityFor(path)}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>
`;

writeFileSync(join(root, "public/sitemap.xml"), xml);
writeFileSync(join(root, "public/robots.txt"), ROBOTS_TXT);
console.log(
  `Sitemap written: ${urls.length} indexable URLs (${blogSlugs.length} blog, ${nigeriaPaths.length} Nigeria)`
);
