/**
 * BamSignal careers → Stankings Legacy Ltd employer brand (no local job board).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (c, m) => {
  if (!c) throw new Error(m);
};

const careers = read("src/constants/careers.ts");
assert(careers.includes("STANKINGS_CAREERS_URL"), "stankings careers url");
assert(careers.includes("https://stankings.com/careers"), "careers CTA target");
assert(careers.includes("BamSignal is a product of Stankings Legacy Ltd."), "product-of positioning");
assert(careers.includes("Explore Opportunities at Stankings"), "primary CTA label");
assert(careers.includes("Learn About Stankings Legacy Ltd"), "secondary CTA label");
assert(
  careers.includes("Join the Team Behind Africa's Next Generation of Digital Products."),
  "closing employer proposition"
);
assert(careers.includes("CAREERS_PORTFOLIO_COMPANIES"), "portfolio companies");
assert(careers.includes("https://yike.ng"), "Yike link");
assert(careers.includes("https://bayright.com"), "BayRight link");

const landing = read("src/components/careers/CareersLandingPage.tsx");
assert(landing.includes("CAREERS_PRIMARY_CTA"), "primary CTA");
assert(landing.includes("CAREERS_SECONDARY_CTA"), "secondary CTA");
assert(landing.includes("CAREERS_PORTFOLIO_COMPANIES"), "companies section");
assert(landing.includes("CAREERS_CLOSING_HEADING"), "closing CTA");
assert(!landing.includes("View open roles"), "no local open roles CTA");
assert(landing.includes("SeoHead"), "SEO metadata");

const footer = read("src/constants/footer.ts");
assert(footer.includes('href: "/careers"'), "footer careers → BamSignal join landing");

const routes = read("src/constants/careersRoutes.ts");
assert(routes.includes("landing: CAREERS_BASE_PATH"), "single landing route");
assert(!routes.includes("open-roles"), "open-roles route removed");

const app = read("src/App.tsx");
assert(app.includes("LazyCareersLandingPage"), "landing still mounted");
assert(!app.includes("LazyCareersOpenRolesPage"), "open roles not mounted");

const siteFooter = read("src/components/SiteFooter.tsx");
assert(siteFooter.includes("link.external"), "footer supports external links");

console.log("careers-stankings-redirect: PASS");
