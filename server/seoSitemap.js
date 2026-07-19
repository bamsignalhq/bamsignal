import {
  LEGAL_STATIC_PATHS,
  ROBOTS_TXT,
  SEO_DETAIL_PATHS,
  SEO_HUB_PATHS
} from "../scripts/seo-sitemap-data.mjs";
import { getNigeriaIndexablePaths } from "../scripts/nigeria-sitemap-paths.mjs";
import { sitemapPriorityFor, sitemapChangefreqFor } from "../scripts/sitemap-priority.mjs";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://bamsignal.com";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const LASTMOD = new Date().toISOString().slice(0, 10);

function loadBlogPaths() {
  // Prefer seo-manifest (copied into Docker via scripts/) so production sitemap
  // still includes blog URLs when src/ is not in the runtime image.
  try {
    const manifest = JSON.parse(readFileSync(join(root, "scripts/seo-manifest.json"), "utf8"));
    const fromManifest = (manifest.pages || [])
      .map((page) => page.canonicalPath)
      .filter((path) => typeof path === "string" && path.startsWith("/blog/"));
    if (fromManifest.length > 0) return [...new Set(fromManifest)];
  } catch {
    // fall through
  }

  try {
    const cities = JSON.parse(readFileSync(join(root, "src/data/blog/sitemap-cities.json"), "utf8"));
    const pillarSlugs = [
      "best-dating-apps-nigeria-2026",
      "find-real-love-nigeria-guide",
      "verified-dating-nigeria-safety",
      "what-is-bamsignal-nigeria-dating"
    ];
    return [
      ...cities.map((c) => `/blog/find-love-in-${c}-nigeria`),
      ...pillarSlugs.map((s) => `/blog/${s}`)
    ];
  } catch {
    return [];
  }
}

export function buildSitemapXml() {
  const blogSlugs = loadBlogPaths();
  const nigeriaPaths = getNigeriaIndexablePaths();
  const staticPaths = ["", "/blog", ...LEGAL_STATIC_PATHS, ...SEO_HUB_PATHS, ...SEO_DETAIL_PATHS, ...nigeriaPaths];
  const urls = [...staticPaths, ...blogSlugs];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((path) => {
    const loc = path ? `${SITE}${path}` : `${SITE}/`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>${sitemapChangefreqFor(path)}</changefreq>
    <priority>${sitemapPriorityFor(path)}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>
`;
}

export function getRobotsTxt() {
  return ROBOTS_TXT;
}
