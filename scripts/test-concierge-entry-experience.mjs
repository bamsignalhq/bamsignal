/**
 * Signal Concierge entry experience — UX wiring checks (no architecture changes).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const journeyPage = read("src/pages/RelationshipJourneyPage.tsx");
const journeyConstants = read("src/constants/journey.ts");
const routes = read("src/constants/signalConciergeRoutes.ts");
const landing = read("src/components/signalConcierge/SignalConciergeLandingPage.tsx");
const constants = read("src/constants/signalConcierge.ts");
const app = read("src/App.tsx");
const authPage = read("src/pages/signal-concierge/SignalConciergeClientAuthPage.tsx");

assert(!journeyConstants.includes("No payment on this step."), "meet screen must not show payment trust line");
assert(journeyPage.includes("How would you like to meet?"), "meet question retained");
assert(journeyPage.includes("Apply for Signal Concierge™"), "Concierge option renamed to Apply");
assert(
  journeyPage.includes("navigateToPath(SIGNAL_CONCIERGE_ROUTES.landing)") &&
    !journeyPage.includes("SIGNAL_CONCIERGE_ROUTES.apply"),
  "Concierge tap exits Journey to landing — not apply/signup"
);
assert(journeyPage.includes('intent === "concierge"'), "Continue disabled when Concierge selected mid-tap");

assert(routes.includes("signIn:") && routes.includes("signUp:") && routes.includes("forgotPin:"), "dedicated auth routes");
assert(routes.includes('"signIn"') && routes.includes("PUBLIC_ROUTE_SET"), "auth routes are public");

assert(landing.includes("Pricing is tailored to your requirements"), "no hardcoded pricing on landing");
assert(landing.includes("SIGNAL_CONCIERGE_EDITORIAL_IMAGES"), "editorial photography");
assert(landing.includes("Already a client? Sign In") || constants.includes("Already a client? Sign In"), "client sign-in CTA");
assert(constants.includes("Apply for Signal Concierge™"), "primary CTA copy");
assert(!landing.includes("priceLabel") && !landing.includes("SIGNAL_CONCIERGE_TIERS"), "tier price cards removed from landing");

assert(authPage.includes("Username and PIN") || authPage.includes("PIN only"), "Concierge auth uses PIN not password");
assert(!authPage.includes("Forgot Password") && authPage.includes("Forgot PIN"), "Forgot PIN not password");

assert(app.includes("SIGNAL_CONCIERGE_ROUTES.signIn"), "App redirects Concierge clients to dedicated sign-in");
assert(app.includes("LazySignalConciergeClientAuthPage"), "App mounts Concierge auth pages");

const gateIdx = app.indexOf("isSignalConciergeAuthenticatedRoute(route)");
assert(gateIdx > 0, "Concierge auth gate present");
const gateBlock = app.slice(gateIdx, gateIdx + 450);
assert(gateBlock.includes("SIGNAL_CONCIERGE_ROUTES.signIn"), "authenticated Concierge routes → sign-in");
assert(!gateBlock.includes("openAuth"), "authenticated Concierge routes must not open Discover auth");

console.log("test-concierge-entry-experience: PASS");
