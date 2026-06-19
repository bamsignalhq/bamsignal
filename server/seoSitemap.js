import {
  LEGAL_STATIC_PATHS,
  ROBOTS_TXT,
  SEO_DETAIL_PATHS,
  SEO_HUB_PATHS
} from "../scripts/seo-sitemap-data.mjs";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://bamsignal.com";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadBlogPaths() {
  try {
    const cities = JSON.parse(
      readFileSync(join(root, "src/data/blog/sitemap-cities.json"), "utf8")
    );
    const pillarSlugs = [
      "best-dating-apps-nigeria-2026",
      "find-real-love-nigeria-guide",
      "verified-dating-nigeria-safety",
      "what-is-bamsignal-nigeria-dating"
    ];
    const citySlugs = cities.map((c) => `/blog/find-love-in-${c}-nigeria`);
    return [...citySlugs, ...pillarSlugs.map((s) => `/blog/${s}`)];
  } catch {
    return [];
  }
}

const LASTMOD = "2026-06-19";

function priorityFor(path) {
  if (path === "") return "1.0";
  if (path === "/blog") return "0.9";
  if (SEO_HUB_PATHS.includes(path)) return "0.85";
  if (SEO_DETAIL_PATHS.includes(path)) return "0.8";
  if (path.startsWith("/blog/find-love")) return "0.85";
  return "0.7";
}

function changefreqFor(path) {
  if (path.startsWith("/blog") || SEO_DETAIL_PATHS.includes(path)) return "weekly";
  return "monthly";
}

export function buildSitemapXml() {
  const blogSlugs = loadBlogPaths();
  const staticPaths = ["", "/blog", ...LEGAL_STATIC_PATHS, ...SEO_HUB_PATHS, ...SEO_DETAIL_PATHS];
  const urls = [...staticPaths, ...blogSlugs];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((path) => {
    const loc = path ? `${SITE}${path}` : `${SITE}/`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>${changefreqFor(path)}</changefreq>
    <priority>${priorityFor(path)}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>
`;
}

export function getRobotsTxt() {
  return ROBOTS_TXT;
}
