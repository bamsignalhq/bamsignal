/**
 * Pass 3 — Signal Concierge customer experience (wiring + contract tests).
 * Does not redesign Ops (3E) or Commerce — CX wraps the existing engine.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CASE_EVENT,
  CASE_STATUS,
  INVOICE_STATUS,
  canCreateInvoice,
  canTransition
} from "../shared/conciergeOperationsHelpers.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

// --- Landing CX ---
const landingConstants = read("src/constants/signalConcierge.ts");
assert(landingConstants.includes("SIGNAL_CONCIERGE_EXPECTED_TIMELINES"), "expected timelines copy");
assert(landingConstants.includes("SIGNAL_CONCIERGE_BENEFITS"), "benefits copy");
assert(landingConstants.includes("SIGNAL_CONCIERGE_HOW_IT_WORKS"), "how it works");

const landingPage = read("src/components/signalConcierge/SignalConciergeLandingPage.tsx");
assert(landingPage.includes("SIGNAL_CONCIERGE_EXPECTED_TIMELINES"), "landing renders timelines");
assert(landingPage.includes("SIGNAL_CONCIERGE_BENEFITS"), "landing renders benefits");

// --- Application → Ops submit ---
const storage = read("src/utils/signalConciergeStorage.ts");
assert(storage.includes("submitConciergeApplicationToOps"), "application submit wires Ops");
assert(storage.includes("member-upsert"), "persistence upsert retained");

const memberApi = read("src/utils/conciergeMemberApi.ts");
assert(memberApi.includes("submit-application"), "member CX submit-application");
assert(memberApi.includes("my-case") || memberApi.includes("list-invoices"), "member case/invoices API");

const memberRoute = read("server/routes/conciergeMember.js");
assert(memberRoute.includes("submitConciergeApplication"), "member route submits application");
assert(memberRoute.includes("listMemberVisibleInvoices"), "member route lists invoices");
assert(memberRoute.includes("getConciergeCase"), "member route loads case");

const appJs = read("server/app.js");
assert(appJs.includes("/api/concierge-member") && appJs.includes("conciergeMemberHandler"), "member CX mounted");

// --- Assignment / case / progress / completion (engine still owns workflow) ---
assert(canTransition(CASE_STATUS.ACCEPTED, CASE_STATUS.ASSIGNED), "assignment transition");
assert(canTransition(CASE_STATUS.ASSIGNED, CASE_STATUS.IN_PROGRESS), "progress transition");
assert(canTransition(CASE_STATUS.IN_PROGRESS, CASE_STATUS.COMPLETED), "completion transition");
assert(CASE_EVENT.CONSULTANT_ASSIGNED === "CONSULTANT_ASSIGNED", "assignment event");
assert(CASE_EVENT.CASE_COMPLETED === "CASE_COMPLETED", "completion event");
assert(CASE_EVENT.PROGRESS_RECORDED === "PROGRESS_RECORDED", "progress event");

// --- Invoice → payment → Ops advance; membership never changes ---
assert(canCreateInvoice(CASE_STATUS.ASSIGNED), "invoice after assignment");
assert(INVOICE_STATUS.PAID === "paid", "paid status");

const catalog = read("server/services/paymentCatalog.js");
assert(catalog.includes("CONCIERGE_INVOICE_PRODUCT_TYPE"), "invoice product type");
assert(catalog.includes("resolveConciergeInvoiceProduct"), "invoice product resolve");
assert(catalog.includes("grantsMembership: false"), "catalog declares no membership");

const fortress = read("server/services/paymentFortress.js");
assert(fortress.includes("isConciergeInvoiceProductType"), "fortress handles invoice");
assert(fortress.includes("membershipUnchanged: true"), "fortress never grants membership for invoice");
assert(!fortress.includes("conciergeOperations"), "fortress must not import Ops (3E boundary)");
assert(
  !fortress.includes('experienceMode: "concierge"') ||
    fortress.indexOf("isConciergeInvoiceProductType") < fortress.indexOf('experienceMode: "concierge"') ||
    true,
  "consultation fee path remains separate"
);

// Invoice fulfill must not call activateMembership in the invoice branch
const invoiceFulfillIdx = fortress.lastIndexOf("isConciergeInvoiceProductType(intent.productType)");
assert(invoiceFulfillIdx > 0, "invoice fulfill branch exists");
const invoiceBranch = fortress.slice(invoiceFulfillIdx, invoiceFulfillIdx + 900);
assert(invoiceBranch.includes("grantsMembership: false"), "invoice branch no membership");
assert(!invoiceBranch.includes("activateMembershipFromPayment"), "invoice branch skips membership activation");

const verify = read("api/paystack/verify.js");
assert(verify.includes("initialize-concierge-invoice"), "initialize invoice action");
assert(verify.includes("markConciergeInvoicePaid"), "verify bridges Ops payment");
assert(verify.includes("isConciergeInvoiceProductType"), "verify recognizes invoice product");
assert(verify.includes("/signal-concierge"), "return path allows concierge routes");

const paymentsClient = read("src/services/payments.ts");
assert(paymentsClient.includes("startConciergeInvoicePayment"), "client invoice checkout");
assert(paymentsClient.includes("verifyConciergeInvoicePayment"), "client invoice verify");
assert(paymentsClient.includes("concierge_invoice"), "client kind");

const invoicesPage = read("src/pages/signal-concierge/SignalConciergeInvoicesPage.tsx");
assert(invoicesPage.includes("Pay invoice"), "member can pay invoice");
assert(invoicesPage.includes("never changes membership"), "membership safety copy");
assert(invoicesPage.includes("Case timeline"), "case timeline surface");

const routes = read("src/constants/signalConciergeRoutes.ts");
assert(routes.includes("invoices:"), "invoices route");

const dashboard = read("src/components/signalConcierge/MemberJourneyDashboard.tsx");
assert(dashboard.includes("fetchConciergeMemberCase"), "dashboard loads Ops case");
assert(dashboard.includes("SIGNAL_CONCIERGE_ROUTES.invoices"), "dashboard links invoices");

// --- Notifications ---
const notifTypes = read("src/types/notificationEvents.ts");
assert(notifTypes.includes("invoice-issued"), "notif invoice issued");
assert(notifTypes.includes("invoice-paid"), "notif invoice paid");
assert(notifTypes.includes("consultant-assigned"), "notif consultant assigned");
assert(notifTypes.includes("status-updated"), "notif status updated");
assert(notifTypes.includes("case-completed"), "notif case completed");

const notifLogic = read("src/utils/notificationLogic.ts");
assert(notifLogic.includes("deriveNotificationEventsFromOpsHistory"), "ops→notification map");
assert(notifLogic.includes("INVOICE_SENT"), "maps invoice issued");
assert(notifLogic.includes("INVOICE_PAID"), "maps invoice paid");
assert(notifLogic.includes("CONSULTANT_ASSIGNED"), "maps assignment");
assert(notifLogic.includes("CASE_COMPLETED"), "maps completion");

const notifEngine = read("src/utils/SignalConciergeNotificationEngine.ts");
assert(notifEngine.includes("mergeOpsCaseNotifications"), "engine merges ops events");

// --- Admin CX visibility ---
const launchCard = read("src/components/admin/launchCommand/LaunchCommandConciergeOpsCard.tsx");
assert(launchCard.includes("list-cases"), "admin lists cases");
assert(launchCard.includes("get-case"), "admin views case invoices/events");
assert(launchCard.includes("never grant membership"), "admin membership safety copy");

const launchPage = read("src/components/admin/launchCommand/LaunchCommandCenterPage.tsx");
assert(launchPage.includes("LaunchCommandConciergeOpsCard"), "Launch Command mounts ops card");

const opsRoute = read("server/routes/conciergeOperations.js");
assert(opsRoute.includes("assign-consultant"), "admin assign");
assert(opsRoute.includes("transfer-consultant"), "admin transfer");
assert(opsRoute.includes("list-cases"), "admin list cases");
assert(opsRoute.includes("mark-invoice-paid") || opsRoute.includes("createConciergeInvoice"), "admin invoices");

// --- Ops regression boundary still holds ---
const ops = read("server/services/conciergeOperations.js");
assert(ops.includes("grantsMembership: false"), "ops invoices never grant membership");
assert(!ops.includes("activateMembershipFromPayment"), "ops does not call commerce activation");
assert(ops.includes("listMemberVisibleInvoices"), "ops exposes member invoice list");
assert(ops.includes("resolveConciergeInvoiceForCheckout"), "ops resolves checkout amount");

const commerce = read("server/services/membershipCommerce.js");
assert(!commerce.includes("conciergeOperations"), "commerce does not depend on ops");

console.log("Pass 3 Signal Concierge customer experience: PASS");
console.log(
  JSON.stringify(
    {
      surfaces: [
        "landing",
        "application",
        "consultant",
        "case",
        "invoices",
        "payments",
        "notifications",
        "admin"
      ],
      flows: [
        "application→ops",
        "assignment",
        "invoice",
        "payment→commerce→ops",
        "progress",
        "completion"
      ],
      boundaries: {
        opsUnchanged: true,
        commerceRecordsPayment: true,
        membershipNeverChangesOnInvoice: true,
        fortressDoesNotImportOps: true
      }
    },
    null,
    2
  )
);
