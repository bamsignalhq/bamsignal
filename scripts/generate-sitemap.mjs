import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LEGAL_STATIC_PATHS,
  ROBOTS_TXT,
  SEO_DETAIL_PATHS,
  SEO_HUB_PATHS
} from "./seo-sitemap-data.mjs";

const SITE = "https://bamsignal.com";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

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
const blogSlugs = [...citySlugs, ...pillarSlugs.map((s) => `/blog/${s}`)];

const staticPaths = ["", "/blog", ...LEGAL_STATIC_PATHS, ...SEO_HUB_PATHS, ...SEO_DETAIL_PATHS];

const lastmod = "2026-06-19";

const urls = [...staticPaths, ...blogSlugs];

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

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((path) => {
    const loc = path ? `${SITE}${path}` : `${SITE}/`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreqFor(path)}</changefreq>
    <priority>${priorityFor(path)}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>
`;

writeFileSync(join(root, "public/sitemap.xml"), xml);
writeFileSync(join(root, "public/robots.txt"), ROBOTS_TXT);
console.log(
  `Sitemap written: ${urls.length} URLs (${blogSlugs.length} blog posts, ${SEO_HUB_PATHS.length} SEO hubs, ${SEO_DETAIL_PATHS.length} SEO articles)`
);
