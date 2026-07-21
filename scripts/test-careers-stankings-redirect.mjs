/**
 * BamSignal careers → Stankings Legacy Ltd centralized recruitment (no local page).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (c, m) => {
  if (!c) throw new Error(m);
};

const corporate = read("src/constants/corporate.ts");
assert(corporate.includes("careersUrl: \"https://stankings.com/career\""), "careers external target");
assert(corporate.includes("legalName: \"Stankings Legacy Ltd\""), "parent legal name");

const careers = read("src/constants/careers.ts");
assert(careers.includes("CORPORATE"), "careers imports CORPORATE");
assert(careers.includes("BamSignal is a product of"), "product-of positioning");
assert(!careers.includes("Stankings group"), "no unofficial group naming");

const footer = read("src/constants/footer.ts");
assert(footer.includes("CORPORATE.careersUrl"), "footer uses centralized careers url");
assert(footer.includes("external: true"), "footer careers opens Stankings");

const routes = read("src/constants/careersRoutes.ts");
assert(routes.includes('CAREERS_ALIAS_PATH = "/career"'), "supports /career alias");
assert(routes.includes("CORPORATE.careersUrl"), "routes reference external destination");
assert(!routes.includes("open-roles"), "open-roles route removed");

const redirect = read("src/components/careers/CareersExternalRedirect.tsx");
assert(redirect.includes("window.location.replace"), "immediate external redirect");
assert(redirect.includes("CORPORATE.careersUrl"), "redirect target");

const app = read("src/App.tsx");
assert(app.includes("CareersExternalRedirect"), "app uses external redirect");
assert(!app.includes("LazyCareersLandingPage"), "landing page not mounted");

const siteFooter = read("src/components/SiteFooter.tsx");
assert(siteFooter.includes("link.external"), "footer supports external links");

const legal = read("src/data/legalPages.ts");
assert(legal.includes("Stankings Legacy Ltd"), "legal pages identify parent company");

const sitemap = read("scripts/careers-sitemap-paths.mjs");
assert(sitemap.includes("CAREERS_HUB_PATHS = []"), "no local careers sitemap entries");

console.log("careers-stankings-redirect: PASS");
