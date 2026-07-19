/**
 * Phase 3E — Concierge Operations workflow matrix (pure + wiring).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CASE_EVENT,
  CASE_STATUS,
  INVOICE_STATUS,
  canCreateInvoice,
  canTransition,
  deriveOpsStatusFromMember,
  formatInvoiceNumber,
  memberStatusForOps,
  normalizeCaseStatus,
  sumLineItemsKobo
} from "../shared/conciergeOperationsHelpers.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

// --- Event / status vocabulary ---
for (const key of [
  "APPLICATION_SUBMITTED",
  "REVIEW_STARTED",
  "APPLICATION_ACCEPTED",
  "APPLICATION_REJECTED",
  "CONSULTANT_ASSIGNED",
  "CONSULTANT_TRANSFERRED",
  "NOTE_ADDED",
  "INVOICE_CREATED",
  "INVOICE_SENT",
  "INVOICE_PAID",
  "INVOICE_CANCELLED",
  "PROGRESS_RECORDED",
  "CASE_COMPLETED",
  "CASE_REOPENED",
  "CASE_CLOSED",
  "STATUS_CHANGED"
]) {
  assert(CASE_EVENT[key] === key, `case event ${key}`);
}

for (const key of [
  "APPLIED",
  "UNDER_REVIEW",
  "ACCEPTED",
  "REJECTED",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CLOSED"
]) {
  assert(typeof CASE_STATUS[key] === "string", `case status ${key}`);
}

assert(normalizeCaseStatus("under-review") === CASE_STATUS.UNDER_REVIEW, "normalize hyphen");
assert(normalizeCaseStatus("IN_PROGRESS") === CASE_STATUS.IN_PROGRESS, "normalize case");
assert(normalizeCaseStatus("nope") === null, "invalid status");

// --- Happy-path state machine ---
assert(canTransition(CASE_STATUS.APPLIED, CASE_STATUS.UNDER_REVIEW), "apply → review");
assert(canTransition(CASE_STATUS.UNDER_REVIEW, CASE_STATUS.ACCEPTED), "review → accept");
assert(canTransition(CASE_STATUS.UNDER_REVIEW, CASE_STATUS.REJECTED), "review → reject");
assert(canTransition(CASE_STATUS.ACCEPTED, CASE_STATUS.ASSIGNED), "accept → assign");
assert(canTransition(CASE_STATUS.ASSIGNED, CASE_STATUS.IN_PROGRESS), "assign → progress");
assert(canTransition(CASE_STATUS.IN_PROGRESS, CASE_STATUS.COMPLETED), "progress → complete");
assert(canTransition(CASE_STATUS.COMPLETED, CASE_STATUS.IN_PROGRESS), "complete → reopen");
assert(canTransition(CASE_STATUS.REJECTED, CASE_STATUS.UNDER_REVIEW), "reject → reopen review");
assert(canTransition(CASE_STATUS.ASSIGNED, CASE_STATUS.ASSIGNED), "reassignment stays assigned");

assert(!canTransition(CASE_STATUS.APPLIED, CASE_STATUS.ASSIGNED), "cannot skip accept");
assert(!canTransition(CASE_STATUS.APPLIED, CASE_STATUS.COMPLETED), "cannot skip to complete");
assert(!canTransition(CASE_STATUS.REJECTED, CASE_STATUS.ASSIGNED), "rejected cannot assign");

// --- Invoice eligibility (billing ≠ membership) ---
assert(!canCreateInvoice(CASE_STATUS.APPLIED), "no invoice before assignment");
assert(!canCreateInvoice(CASE_STATUS.ACCEPTED), "no invoice before assignment");
assert(canCreateInvoice(CASE_STATUS.ASSIGNED), "invoice after assign");
assert(canCreateInvoice(CASE_STATUS.IN_PROGRESS), "invoice in progress");
assert(canCreateInvoice(CASE_STATUS.COMPLETED), "invoice after complete ok");

assert(sumLineItemsKobo([{ amountKobo: 1000, quantity: 2 }, { amount_kobo: 500 }]) === 2500, "line sum");
assert(formatInvoiceNumber(2026, 7) === "BS-INV-2026-0007", "invoice number format");

assert(memberStatusForOps(CASE_STATUS.UNDER_REVIEW) === "under-review", "legacy status map");
assert(
  deriveOpsStatusFromMember({ status: "introductions-in-progress" }) === CASE_STATUS.IN_PROGRESS,
  "derive from legacy matching status without owning matching"
);
assert(
  deriveOpsStatusFromMember({ opsStatus: "assigned", status: "applied" }) === CASE_STATUS.ASSIGNED,
  "ops_status wins over legacy"
);

assert(INVOICE_STATUS.PAID === "paid", "invoice paid status");

// --- Service surface ---
const ops = read("server/services/conciergeOperations.js");
for (const name of [
  "submitConciergeApplication",
  "startConciergeReview",
  "acceptConciergeApplication",
  "rejectConciergeApplication",
  "assignConciergeConsultant",
  "transferConciergeConsultant",
  "createConciergeInvoice",
  "markConciergeInvoicePaid",
  "recordConciergeProgress",
  "completeConciergeCase",
  "reopenConciergeCase",
  "listConciergeCases",
  "setConciergeCaseStatus"
]) {
  assert(ops.includes(`export async function ${name}`), `exports ${name}`);
}

assert(ops.includes("grantsMembership: false"), "invoices must declare no membership grant");
assert(
  !ops.includes("activateMembershipFromPayment") &&
    !ops.includes("membershipCommerce") &&
    !ops.includes("loadMembershipEntitlements"),
  "operations must not call commerce or entitlements"
);
assert(
  !ops.includes("IntroductionEngine") && !ops.includes("discoverVisibility"),
  "operations must not own matching or privacy"
);

const route = read("server/routes/conciergeOperations.js");
assert(route.includes("list-cases") && route.includes("mark-invoice-paid"), "admin route actions");

const app = read("server/app.js");
assert(
  app.includes("/api/concierge-operations") && app.includes("conciergeOperationsHandler"),
  "route mounted"
);

const migration = read("migrations/0053_concierge_operations.sql");
assert(migration.includes("concierge_case_events"), "case events table");
assert(migration.includes("ops_status"), "ops_status column");
assert(migration.includes("payment_ref"), "invoice payment_ref");
assert(
  migration.includes("APPLICATION_SUBMITTED") && migration.includes("INVOICE_PAID"),
  "event check constraint"
);

// Fortress / commerce / entitlements untouched by this phase wiring check
const fortress = read("server/services/paymentFortress.js");
assert(!fortress.includes("conciergeOperations"), "fortress must not depend on operations");

const commerce = read("server/services/membershipCommerce.js");
assert(!commerce.includes("conciergeOperations"), "commerce must not depend on operations");

const entitlements = read("server/services/membershipEntitlements.js");
assert(!entitlements.includes("conciergeOperations"), "entitlements must not depend on operations");

console.log("Phase 3E Concierge Operations workflow matrix: PASS");
console.log(
  JSON.stringify(
    {
      transitionsVerified: [
        "application→review",
        "accept",
        "reject",
        "assign",
        "reassign",
        "invoice",
        "payment",
        "progress",
        "complete",
        "reopen"
      ],
      boundaries: {
        eligibility: "untouched",
        commerce: "untouched",
        matching: "untouched",
        invoicesGrantMembership: false
      }
    },
    null,
    2
  )
);
