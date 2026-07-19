/**
 * Public marketing chrome + final polish integrity.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (c, m) => {
  if (!c) throw new Error(m);
};

const navConst = read("src/constants/publicMarketingNav.ts");
assert(navConst.includes("Get Started"), "primary CTA Get Started");
assert(navConst.includes("Sign In"), "secondary CTA Sign In");
assert(!navConst.includes('"Join"'), "no Join CTA in marketing constants");
assert(navConst.includes("isPublicMarketingNavActive"), "active section helper");
assert(navConst.includes("/success-stories"), "success stories route");

const nav = read("src/components/PublicMarketingNav.tsx");
assert(nav.includes("public-mkt-nav--compact"), "shrink on scroll");
assert(nav.includes("public-mkt-nav__cta--always"), "Get Started always visible");
assert(nav.includes("scrollIntoView"), "homepage smooth scroll support");

const coming = read("src/constants/comingSoonPages.ts");
assert(coming.includes("/success-stories"), "success stories coming soon");
assert(coming.includes("/press"), "press coming soon");
assert(coming.includes("/cookies"), "cookies coming soon");
assert(coming.includes("/refund-policy"), "refund coming soon");

const app = read("src/App.tsx");
assert(app.includes("coming-soon"), "app routes coming soon");
assert(app.includes("getComingSoonPage"), "coming soon lookup");
assert(app.includes("!isPublicSurface"), "bottom nav gated off public web");

const footerConst = read("src/constants/footer.ts");
assert(footerConst.includes("/press"), "footer press path");
assert(footerConst.includes("/cookies"), "footer cookies path");
assert(footerConst.includes("Discover Membership") || footerConst.includes("Signal Concierge"), "product naming");
assert(!footerConst.includes("Signal Pass"), "no Signal Pass in footer");

const seoNotFound = read("src/pages/seo/PublicNotFoundPage.tsx");
assert(seoNotFound.includes("Get Started"), "404 uses Get Started");
assert(!seoNotFound.includes("Join BamSignal"), "404 Join removed");

const css = read("src/styles/public-marketing-nav.css");
assert(css.includes("prefers-reduced-motion"), "reduced motion");
assert(css.includes(":focus-visible"), "focus states");
assert(css.includes("overflow-x: clip"), "no horizontal scroll guard");

console.log("public-marketing-chrome: PASS");
