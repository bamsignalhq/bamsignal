#!/usr/bin/env node
/**
 * Production SEO crawl audit — sitemap/robots + HTML canonical/meta checks.
 *
 * Usage:
 *   node scripts/audit-production-seo.mjs
 *   SEO_AUDIT_BASE_URL=https://bamsignal.com node scripts/audit-production-seo.mjs
 *   SEO_AUDIT_SAMPLE=40 node scripts/audit-production-seo.mjs   # limit HTML deep checks
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.SEO_AUDIT_BASE_URL || "https://bamsignal.com").replace(/\/$/, "");
const SAMPLE = Number(process.env.SEO_AUDIT_SAMPLE || 0); // 0 = all sitemap URLs
const TIMEOUT_MS = Number(process.env.SEO_AUDIT_TIMEOUT_MS || 20000);

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
  "/love/"
];

const errors = [];
const warnings = [];
const info = [];

async function fetchText(pathOrUrl, { accept } = {}) {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${BASE}${pathOrUrl}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "manual",
      signal: controller.signal,
      headers: accept ? { Accept: accept } : undefined
    });
    const text = await res.text().catch(() => "");
    return { url, status: res.status, headers: res.headers, text, location: res.headers.get("location") };
  } finally {
    clearTimeout(timer);
  }
}

function parseLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
}

function pickMeta(html, { name, property } = {}) {
  if (name) {
    const re = new RegExp(`<meta[^>]+name=["']${name}["'][^>]*content=["']([^"']*)["']`, "i");
    const alt = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*name=["']${name}["']`, "i");
    return html.match(re)?.[1] ?? html.match(alt)?.[1] ?? null;
  }
  if (property) {
    const re = new RegExp(`<meta[^>]+property=["']${property}["'][^>]*content=["']([^"']*)["']`, "i");
    const alt = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*property=["']${property}["']`, "i");
    return html.match(re)?.[1] ?? html.match(alt)?.[1] ?? null;
  }
  return null;
}

function pickCanonical(html) {
  const re = /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i;
  const alt = /<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i;
  return html.match(re)?.[1] ?? html.match(alt)?.[1] ?? null;
}

function pickTitle(html) {
  return html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? null;
}

function pathFromLoc(loc) {
  try {
    const u = new URL(loc);
    return u.pathname.length > 1 && u.pathname.endsWith("/")
      ? u.pathname.slice(0, -1)
      : u.pathname || "/";
  } catch {
    return null;
  }
}

function isPrivatePath(pathname) {
  return PRIVATE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p.endsWith("/") ? p : `${p}/`)
  );
}

async function main() {
  console.log(`SEO audit against ${BASE}`);

  const robots = await fetchText("/robots.txt", { accept: "text/plain" });
  if (robots.status !== 200) {
    errors.push(`robots.txt returned ${robots.status}`);
  } else {
    info.push("robots.txt 200");
    if (!/Sitemap:\s*https:\/\/bamsignal\.com\/sitemap\.xml/i.test(robots.text)) {
      errors.push("robots.txt missing Sitemap: https://bamsignal.com/sitemap.xml");
    } else {
      info.push("robots.txt includes Sitemap line");
    }
  }

  const sitemap = await fetchText("/sitemap.xml", { accept: "application/xml" });
  if (sitemap.status !== 200) {
    errors.push(`sitemap.xml returned ${sitemap.status}`);
  } else {
    info.push("sitemap.xml 200");
  }

  const locs = sitemap.status === 200 ? parseLocs(sitemap.text) : [];
  info.push(`sitemap URL count: ${locs.length}`);
  if (locs.length < 50) {
    errors.push(`sitemap URL count suspiciously low (${locs.length})`);
  }

  const blogLocs = locs.filter((l) => l.includes("/blog/"));
  if (blogLocs.length === 0) {
    errors.push("sitemap has zero /blog/* URLs (Docker blog path regression?)");
  } else {
    info.push(`sitemap blog URLs: ${blogLocs.length}`);
  }

  if (!locs.includes(`${BASE}/help`) && !locs.includes("https://bamsignal.com/help")) {
    warnings.push("sitemap missing /help hub");
  }

  for (const loc of locs) {
    const pathname = pathFromLoc(loc);
    if (pathname && isPrivatePath(pathname)) {
      errors.push(`private path in sitemap: ${loc}`);
    }
  }

  const statusSample = SAMPLE > 0 ? locs.slice(0, Math.min(SAMPLE, locs.length)) : locs;
  let statusOk = 0;
  let statusFail = 0;
  for (const loc of statusSample) {
    const res = await fetchText(loc);
    if (res.status >= 300 && res.status < 400) {
      errors.push(`${loc} redirected (${res.status} → ${res.location || "?"})`);
      statusFail += 1;
      continue;
    }
    if (res.status !== 200) {
      errors.push(`${loc} returned ${res.status}`);
      statusFail += 1;
      continue;
    }
    statusOk += 1;
  }
  info.push(`URL status checks: ${statusOk} ok, ${statusFail} fail (of ${statusSample.length})`);

  const deepTargets =
    SAMPLE > 0
      ? statusSample.slice(0, Math.min(40, statusSample.length))
      : [
          `${BASE}/`,
          `${BASE}/blog`,
          `${BASE}/help`,
          `${BASE}/nigeria/lagos`,
          `${BASE}/features`,
          `${BASE}/privacy`,
          ...locs.filter((l) => l.includes("/blog/")).slice(0, 3),
          ...locs.filter((l) => l.includes("/nigeria/")).slice(0, 3),
          ...locs.filter((l) => l.includes("/help/")).slice(0, 3)
        ].filter((v, i, a) => a.indexOf(v) === i);

  const titles = new Set();
  const canonicals = new Set();
  let htmlOk = 0;

  for (const loc of deepTargets) {
    const res = await fetchText(loc, { accept: "text/html" });
    if (res.status !== 200) {
      errors.push(`HTML fetch ${loc} → ${res.status}`);
      continue;
    }
    const pathname = pathFromLoc(loc) || "/";
    const expectedCanonical = pathname === "/" ? `${BASE}/` : `${BASE}${pathname}`;
    const title = pickTitle(res.text);
    const description = pickMeta(res.text, { name: "description" });
    const canonical = pickCanonical(res.text);
    const robotsMeta = pickMeta(res.text, { name: "robots" });
    const ogTitle = pickMeta(res.text, { property: "og:title" });
    const ogUrl = pickMeta(res.text, { property: "og:url" });

    if (!title) errors.push(`${loc}: missing <title>`);
    if (!description) errors.push(`${loc}: missing meta description`);
    if (!canonical) {
      errors.push(`${loc}: missing canonical`);
    } else if (canonical !== expectedCanonical) {
      errors.push(`${loc}: canonical mismatch got=${canonical} expected=${expectedCanonical}`);
    }
    if (canonical === `${BASE}/` && pathname !== "/") {
      errors.push(`${loc}: still using homepage canonical`);
    }
    if (robotsMeta && /noindex/i.test(robotsMeta) && !isPrivatePath(pathname)) {
      // Known indexable marketing pages should not be noindex
      if (
        pathname === "/" ||
        pathname.startsWith("/blog") ||
        pathname.startsWith("/nigeria") ||
        pathname.startsWith("/help") ||
        pathname.startsWith("/features")
      ) {
        errors.push(`${loc}: unexpected noindex (${robotsMeta})`);
      } else {
        warnings.push(`${loc}: robots=${robotsMeta}`);
      }
    }
    if (ogTitle && title && ogTitle !== title) {
      warnings.push(`${loc}: og:title differs from title`);
    }
    if (ogUrl && canonical && ogUrl !== canonical) {
      errors.push(`${loc}: og:url mismatch`);
    }

    if (title) titles.add(title);
    if (canonical) canonicals.add(canonical);
    htmlOk += 1;
  }

  info.push(`HTML deep checks: ${htmlOk}/${deepTargets.length}`);
  info.push(`unique titles in sample: ${titles.size}`);
  info.push(`unique canonicals in sample: ${canonicals.size}`);

  if (htmlOk >= 3 && titles.size < 2) {
    errors.push("HTML sample titles are not unique (SPA shell regression?)");
  }
  if (htmlOk >= 3 && canonicals.size < 2) {
    errors.push("HTML sample canonicals are not unique (SPA shell regression?)");
  }

  // Spot-check private route noindex without requiring auth
  const privateProbe = await fetchText("/home", { accept: "text/html" });
  if (privateProbe.status === 200) {
    const robotsMeta = pickMeta(privateProbe.text, { name: "robots" });
    const canonical = pickCanonical(privateProbe.text);
    if (!robotsMeta || !/noindex/i.test(robotsMeta)) {
      errors.push("/home HTML missing noindex robots meta");
    }
    if (canonical === `${BASE}/`) {
      errors.push("/home still has homepage canonical");
    } else {
      info.push("/home has noindex and non-homepage canonical");
    }
  } else {
    warnings.push(`/home probe returned ${privateProbe.status}`);
  }

  const report = {
    base: BASE,
    generatedAt: new Date().toISOString(),
    info,
    warnings,
    errors,
    sitemapUrlCount: locs.length,
    blogUrlCount: blogLocs.length,
    ok: errors.length === 0
  };

  const outPath = join(__dirname, "seo-audit-latest.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2));

  for (const line of info) console.log(`INFO  ${line}`);
  for (const line of warnings) console.log(`WARN  ${line}`);
  for (const line of errors) console.log(`ERROR ${line}`);
  console.log(`Wrote ${outPath}`);

  if (errors.length) {
    console.error(`SEO audit FAILED (${errors.length} errors)`);
    process.exit(1);
  }
  console.log("SEO audit PASSED");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
