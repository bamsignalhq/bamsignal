import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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

const staticPaths = ["", "/about", "/safety", "/privacy", "/terms", "/contact", "/blog"];

const citySlugs = cities.map((c) => `/blog/find-love-in-${c}-nigeria`);
const blogSlugs = [...citySlugs, ...pillarSlugs.map((s) => `/blog/${s}`)];

const lastmod = "2026-06-14";

const urls = [...staticPaths, ...blogSlugs];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((path) => {
    const loc = path ? `${SITE}${path}` : `${SITE}/`;
    const priority = path === "" ? "1.0" : path.startsWith("/blog/find-love") ? "0.85" : path === "/blog" ? "0.9" : "0.7";
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${path.startsWith("/blog") ? "weekly" : "monthly"}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>
`;

writeFileSync(join(root, "public/sitemap.xml"), xml);
console.log(`Sitemap written: ${urls.length} URLs (${blogSlugs.length} blog posts)`);
