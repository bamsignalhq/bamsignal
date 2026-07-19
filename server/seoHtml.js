/**
 * Server-side SEO meta for SPA HTML shells.
 * Crawlers that do not execute JS must still see per-URL canonical + title + description.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://bamsignal.com";
const DEFAULT_OG_IMAGE = `${SITE}/icons/icon-512.webp`;
const SITE_NAME = "BamSignal";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

/** Member / private app surfaces — never expose marketing canonicals. */
const PRIVATE_PREFIXES = [
  "/home",
  "/discover",
  "/chats",
  "/signals",
  "/profile",
  "/settings",
  "/subscription",
  "/onboarding",
  "/admin",
  "/hard",
  "/consultant",
  "/api",
  "/love/",
  "/signup",
  "/join",
  "/register"
];

/** Exact private paths (auth aliases, etc.). */
const PRIVATE_EXACT = new Set(["/love/login", "/love/sign", "/login"]);

let seoByPath = null;

function loadSeoCatalog() {
  if (seoByPath) return seoByPath;
  const map = new Map();
  const manifestPath = join(root, "scripts", "seo-manifest.json");
  try {
    if (existsSync(manifestPath)) {
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      for (const page of manifest.pages || []) {
        const path = normalizePath(page.canonicalPath);
        if (!path) continue;
        map.set(path, {
          title: String(page.title || "").trim(),
          description: String(page.description || "").trim(),
          indexable: page.indexable !== false
        });
      }
    }
  } catch {
    // Fall through with empty map — resolvePublicSeo still handles private/unknown.
  }
  seoByPath = map;
  return map;
}

export function normalizePath(rawPath) {
  if (!rawPath || typeof rawPath !== "string") return "/";
  let path = rawPath.split("?")[0].split("#")[0].trim();
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path || "/";
}

function absoluteUrl(path) {
  const normalized = normalizePath(path);
  return normalized === "/" ? `${SITE}/` : `${SITE}${normalized}`;
}

function isPrivatePath(path) {
  const normalized = normalizePath(path);
  if (PRIVATE_EXACT.has(normalized)) return true;
  return PRIVATE_PREFIXES.some((prefix) => {
    if (prefix.endsWith("/")) return normalized.startsWith(prefix);
    return normalized === prefix || normalized.startsWith(`${prefix}/`);
  });
}

function withSiteName(title) {
  const t = String(title || "").trim() || SITE_NAME;
  return t.includes(SITE_NAME) ? t : `${t} | ${SITE_NAME}`;
}

/**
 * @returns {{
 *   title: string,
 *   description: string,
 *   canonicalPath: string,
 *   canonicalUrl: string,
 *   ogImage: string,
 *   ogType: string,
 *   robots: string,
 *   known: boolean,
 *   private: boolean
 * }}
 */
export function resolvePublicSeo(rawPath) {
  const path = normalizePath(rawPath);
  const catalog = loadSeoCatalog();

  if (isPrivatePath(path)) {
    return {
      title: `${SITE_NAME} | Member`,
      description: "BamSignal member area.",
      canonicalPath: path,
      canonicalUrl: absoluteUrl(path),
      ogImage: DEFAULT_OG_IMAGE,
      ogType: "website",
      robots: "noindex,nofollow",
      known: false,
      private: true
    };
  }

  const entry = catalog.get(path);
  if (entry?.title && entry?.description) {
    const indexable = entry.indexable !== false;
    return {
      title: withSiteName(entry.title),
      description: entry.description,
      canonicalPath: path,
      canonicalUrl: absoluteUrl(path),
      ogImage: DEFAULT_OG_IMAGE,
      ogType: path.startsWith("/blog/") || path.startsWith("/guides/") || path.startsWith("/compare/")
        ? "article"
        : "website",
      robots: indexable ? "index,follow" : "noindex,follow",
      known: true,
      private: false
    };
  }

  // Soft-404 / unknown public path: do not inherit homepage canonical.
  if (path !== "/") {
    return {
      title: `Page not found | ${SITE_NAME}`,
      description: "This BamSignal page could not be found.",
      canonicalPath: path,
      canonicalUrl: absoluteUrl(path),
      ogImage: DEFAULT_OG_IMAGE,
      ogType: "website",
      robots: "noindex,follow",
      known: false,
      private: false
    };
  }

  return {
    title: "BamSignal | Your signal starts here",
    description: "BamSignal — the right connection starts with a signal.",
    canonicalPath: "/",
    canonicalUrl: `${SITE}/`,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    robots: "index,follow",
    known: true,
    private: false
  };
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function replaceOrInsertMetaByName(html, name, content) {
  const escaped = escapeAttr(content);
  const re = new RegExp(
    `<meta\\s+[^>]*name=["']${name}["'][^>]*>`,
    "i"
  );
  const tag = `<meta name="${name}" content="${escaped}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function replaceOrInsertMetaByProperty(html, property, content) {
  const escaped = escapeAttr(content);
  const re = new RegExp(
    `<meta\\s+[^>]*property=["']${property}["'][^>]*>`,
    "i"
  );
  const tag = `<meta property="${property}" content="${escaped}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function replaceOrInsertLinkRel(html, rel, href) {
  const escaped = escapeAttr(href);
  const re = new RegExp(`<link\\s+[^>]*rel=["']${rel}["'][^>]*>`, "i");
  const tag = `<link rel="${rel}" href="${escaped}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

/**
 * Rewrite SPA shell head tags for the requested path.
 * @param {string} html
 * @param {ReturnType<typeof resolvePublicSeo>} seo
 */
export function injectSeoIntoHtml(html, seo) {
  if (!html || typeof html !== "string" || !seo) return html;

  let out = html;

  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(seo.title)}</title>`);

  out = replaceOrInsertMetaByName(out, "description", seo.description);
  out = replaceOrInsertMetaByName(out, "robots", seo.robots);

  out = replaceOrInsertLinkRel(out, "canonical", seo.canonicalUrl);

  out = replaceOrInsertMetaByProperty(out, "og:title", seo.title);
  out = replaceOrInsertMetaByProperty(out, "og:description", seo.description);
  out = replaceOrInsertMetaByProperty(out, "og:url", seo.canonicalUrl);
  out = replaceOrInsertMetaByProperty(out, "og:type", seo.ogType);
  out = replaceOrInsertMetaByProperty(out, "og:image", seo.ogImage);

  out = replaceOrInsertMetaByName(out, "twitter:card", "summary_large_image");
  out = replaceOrInsertMetaByName(out, "twitter:title", seo.title);
  out = replaceOrInsertMetaByName(out, "twitter:description", seo.description);
  out = replaceOrInsertMetaByName(out, "twitter:image", seo.ogImage);

  return out;
}

/** Test helper — clear cached catalog after regenerating the manifest. */
export function resetSeoCatalogCache() {
  seoByPath = null;
}
