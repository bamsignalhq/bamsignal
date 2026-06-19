import { LEGAL_STATIC_PATHS, SEO_HUB_PATHS, SEO_DETAIL_PATHS } from "./seo-sitemap-data.mjs";

/** @param {string} path URL path without domain, "" for homepage */
export function sitemapPriorityFor(path) {
  if (path === "") return "1.0";
  if (LEGAL_STATIC_PATHS.includes(path)) return "0.3";
  if (SEO_HUB_PATHS.includes(path)) return "0.8";
  if (path === "/nigeria") return "0.8";
  if (path.startsWith("/nigeria/") && path.split("/").filter(Boolean).length === 2) return "0.7";
  if (path.startsWith("/nigeria/") && path.split("/").filter(Boolean).length === 3) return "0.6";
  if (path === "/blog") return "0.8";
  if (path.startsWith("/blog/")) return "0.6";
  if (SEO_DETAIL_PATHS.includes(path)) return "0.6";
  return "0.6";
}

/** @param {string} path */
export function sitemapChangefreqFor(path) {
  if (path.startsWith("/blog") || SEO_DETAIL_PATHS.includes(path)) return "weekly";
  if (path.startsWith("/nigeria/") && path.split("/").filter(Boolean).length === 3) return "weekly";
  return "monthly";
}
