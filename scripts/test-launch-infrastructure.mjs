#!/usr/bin/env node
/**
 * Launch Infrastructure Verification™
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canAccessLaunchInfrastructure,
  formatLaunchInfrastructureSummary,
  isValidAppleAssociationPayload,
  launchInfrastructureRouteRegistered
} from "../server/services/launchInfrastructure.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

assert(existsSync(join(rootPath, "Dockerfile")), "Dockerfile exists");
assert(existsSync(join(rootPath, "public/sitemap.xml")), "sitemap.xml exists");
assert(existsSync(join(rootPath, "public/robots.txt")), "robots.txt exists");
assert(existsSync(join(rootPath, "public/manifest.webmanifest")), "manifest.webmanifest exists");
assert(existsSync(join(rootPath, "public/.well-known/assetlinks.json")), "assetlinks.json exists");
assert(
  existsSync(join(rootPath, "public/.well-known/apple-app-site-association")),
  "apple-app-site-association exists"
);
assert(existsSync(join(rootPath, "public/sw.js")), "sw.js exists");
assert(existsSync(join(rootPath, "public/favicon.webp")), "favicon.webp exists");
assert(existsSync(join(rootPath, "public/icons/icon-192.webp")), "icon-192 exists");
assert(existsSync(join(rootPath, "public/icons/icon-512.webp")), "icon-512 exists");

const dockerfile = read("Dockerfile");
assert(dockerfile.includes("HEALTHCHECK"), "Dockerfile healthcheck");
assert(dockerfile.includes("/ready"), "Dockerfile ready probe");
assert(!dockerfile.includes("ARG DATABASE_URL"), "no DATABASE_URL build arg");

const vercel = read("vercel.json");
assert(vercel.includes("LEGACY"), "vercel.json marked legacy");

const manifest = JSON.parse(read("public/manifest.webmanifest"));
assert(manifest.start_url === "/", "manifest start_url is /");
assert(manifest.icons?.length >= 2, "manifest has icons");

const assetlinks = JSON.parse(read("public/.well-known/assetlinks.json"));
assert(assetlinks[0]?.target?.package_name === "com.bamsignal.com", "assetlinks package");

const aasa = JSON.parse(read("public/.well-known/apple-app-site-association"));
assert(isValidAppleAssociationPayload(aasa), "apple-app-site-association structure");
assert(
  JSON.stringify(aasa).includes("/payment/success"),
  "apple association includes payment success path"
);

const robots = read("public/robots.txt");
assert(robots.includes("Disallow: /consultant"), "robots disallows consultant");
assert(robots.includes("Sitemap:"), "robots references sitemap");

const sitemap = read("public/sitemap.xml");
assert(sitemap.includes("/signal-concierge/privacy"), "sitemap privacy path");
assert(sitemap.includes("/signal-concierge/faq"), "sitemap faq path");
assert(!sitemap.includes("/home"), "sitemap excludes member home");

const appJs = read("server/app.js");
assert(appJs.includes("apple-app-site-association"), "server serves apple association");
assert(appJs.includes("assetlinks.json"), "server serves assetlinks");
assert(appJs.includes("securityHeadersMiddleware"), "security headers middleware");

const sw = read("public/sw.js");
assert(sw.includes("caches.delete") && !sw.includes("location.reload()"), "sw cache hygiene");

const entitlements = read("ios/App/App/App.entitlements");
assert(entitlements.includes("applinks:bamsignal.com"), "iOS associated domains");

const adminSource = read("src/constants/launchInfrastructureAdmin.ts");
assert(adminSource.includes("/hard/launch-infrastructure"), "launch infra route");

const permissionsSource = read("src/constants/permissions.ts");
assert(launchInfrastructureRouteRegistered(permissionsSource), "launch infra permissions");

const reportDoc = read("LAUNCH_INFRASTRUCTURE_REPORT.md");
assert(reportDoc.includes("## Ready"), "report ready section");

assert(canAccessLaunchInfrastructure(["ManageOperations"]), "ops can access");
assert(!canAccessLaunchInfrastructure(["ViewFinance"]), "finance cannot access");

const sample = { readyCount: 15, warningCount: 2, overallScore: 88 };
assert(formatLaunchInfrastructureSummary(sample).includes("88"), "summary formatter");

if (failed > 0) {
  console.error(`\n${failed} launch infrastructure test(s) failed.`);
  process.exit(1);
}

console.log("launch infrastructure checks passed");
