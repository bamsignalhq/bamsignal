/**
 * Phase 3E — Concierge Operations (pure helpers).
 *
 * Eligibility ≠ Workflow ≠ Billing ≠ Consultant activity.
 * This module owns workflow vocabulary and the case state machine only.
 */

export const CASE_EVENT = Object.freeze({
  APPLICATION_SUBMITTED: "APPLICATION_SUBMITTED",
  REVIEW_STARTED: "REVIEW_STARTED",
  APPLICATION_ACCEPTED: "APPLICATION_ACCEPTED",
  APPLICATION_REJECTED: "APPLICATION_REJECTED",
  CONSULTANT_ASSIGNED: "CONSULTANT_ASSIGNED",
  CONSULTANT_TRANSFERRED: "CONSULTANT_TRANSFERRED",
  NOTE_ADDED: "NOTE_ADDED",
  INVOICE_CREATED: "INVOICE_CREATED",
  INVOICE_SENT: "INVOICE_SENT",
  INVOICE_PAID: "INVOICE_PAID",
  INVOICE_CANCELLED: "INVOICE_CANCELLED",
  PROGRESS_RECORDED: "PROGRESS_RECORDED",
  CASE_COMPLETED: "CASE_COMPLETED",
  CASE_REOPENED: "CASE_REOPENED",
  CASE_CLOSED: "CASE_CLOSED",
  STATUS_CHANGED: "STATUS_CHANGED"
});

export const CASE_STATUS = Object.freeze({
  APPLIED: "applied",
  UNDER_REVIEW: "under_review",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CLOSED: "closed"
});

export const INVOICE_STATUS = Object.freeze({
  DRAFT: "draft",
  SENT: "sent",
  PARTIALLY_PAID: "partially_paid",
  PAID: "paid",
  CANCELLED: "cancelled",
  OVERDUE: "overdue"
});

/** Allowed transitions: from → Set(to). Empty set = terminal unless reopen rules apply. */
export const CASE_TRANSITIONS = Object.freeze({
  [CASE_STATUS.APPLIED]: Object.freeze([
    CASE_STATUS.UNDER_REVIEW,
    CASE_STATUS.REJECTED,
    CASE_STATUS.CLOSED
  ]),
  [CASE_STATUS.UNDER_REVIEW]: Object.freeze([
    CASE_STATUS.ACCEPTED,
    CASE_STATUS.REJECTED,
    CASE_STATUS.CLOSED
  ]),
  [CASE_STATUS.ACCEPTED]: Object.freeze([
    CASE_STATUS.ASSIGNED,
    CASE_STATUS.REJECTED,
    CASE_STATUS.CLOSED
  ]),
  [CASE_STATUS.REJECTED]: Object.freeze([CASE_STATUS.UNDER_REVIEW, CASE_STATUS.CLOSED]),
  [CASE_STATUS.ASSIGNED]: Object.freeze([
    CASE_STATUS.IN_PROGRESS,
    CASE_STATUS.COMPLETED,
    CASE_STATUS.CLOSED,
    CASE_STATUS.ASSIGNED
  ]),
  [CASE_STATUS.IN_PROGRESS]: Object.freeze([
    CASE_STATUS.COMPLETED,
    CASE_STATUS.CLOSED,
    CASE_STATUS.ASSIGNED,
    CASE_STATUS.IN_PROGRESS
  ]),
  [CASE_STATUS.COMPLETED]: Object.freeze([CASE_STATUS.IN_PROGRESS, CASE_STATUS.CLOSED]),
  [CASE_STATUS.CLOSED]: Object.freeze([CASE_STATUS.UNDER_REVIEW, CASE_STATUS.IN_PROGRESS])
});

/** Statuses where invoices may be created (billing attached to an open case). */
export const INVOICE_ELIGIBLE_STATUSES = Object.freeze([
  CASE_STATUS.ASSIGNED,
  CASE_STATUS.IN_PROGRESS,
  CASE_STATUS.COMPLETED
]);

/**
 * Map operations status → existing concierge_members.status labels
 * (Journey/matching UI vocabulary — ops does not invent matching stages).
 */
export const OPS_TO_MEMBER_STATUS = Object.freeze({
  [CASE_STATUS.APPLIED]: "applied",
  [CASE_STATUS.UNDER_REVIEW]: "under-review",
  [CASE_STATUS.ACCEPTED]: "accepted",
  [CASE_STATUS.REJECTED]: "closed",
  [CASE_STATUS.ASSIGNED]: "active-search",
  [CASE_STATUS.IN_PROGRESS]: "active-search",
  [CASE_STATUS.COMPLETED]: "matched",
  [CASE_STATUS.CLOSED]: "closed"
});

/** Best-effort derive ops status from legacy member.status when ops_status is null. */
export const MEMBER_STATUS_TO_OPS = Object.freeze({
  applied: CASE_STATUS.APPLIED,
  "consultation-scheduled": CASE_STATUS.UNDER_REVIEW,
  "under-review": CASE_STATUS.UNDER_REVIEW,
  accepted: CASE_STATUS.ACCEPTED,
  waitlisted: CASE_STATUS.UNDER_REVIEW,
  "active-search": CASE_STATUS.IN_PROGRESS,
  "introductions-in-progress": CASE_STATUS.IN_PROGRESS,
  relationship: CASE_STATUS.IN_PROGRESS,
  matched: CASE_STATUS.COMPLETED,
  exclusive: CASE_STATUS.IN_PROGRESS,
  engaged: CASE_STATUS.IN_PROGRESS,
  married: CASE_STATUS.COMPLETED,
  paused: CASE_STATUS.IN_PROGRESS,
  closed: CASE_STATUS.CLOSED,
  "legacy-archive": CASE_STATUS.COMPLETED
});

export function normalizeCaseStatus(value) {
  const raw = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
  return Object.values(CASE_STATUS).includes(raw) ? raw : null;
}

export function canTransition(fromStatus, toStatus) {
  const from = normalizeCaseStatus(fromStatus);
  const to = normalizeCaseStatus(toStatus);
  if (!from || !to) return false;
  const allowed = CASE_TRANSITIONS[from] || [];
  return allowed.includes(to);
}

export function assertTransition(fromStatus, toStatus) {
  if (!canTransition(fromStatus, toStatus)) {
    const err = new Error(`invalid_case_transition:${fromStatus}->${toStatus}`);
    err.code = "invalid_case_transition";
    err.fromStatus = fromStatus;
    err.toStatus = toStatus;
    throw err;
  }
}

export function memberStatusForOps(opsStatus) {
  const normalized = normalizeCaseStatus(opsStatus);
  return OPS_TO_MEMBER_STATUS[normalized] || "applied";
}

export function deriveOpsStatusFromMember(member = {}) {
  const explicit = normalizeCaseStatus(member.opsStatus || member.ops_status);
  if (explicit) return explicit;
  const legacy = String(member.status || "")
    .trim()
    .toLowerCase();
  return MEMBER_STATUS_TO_OPS[legacy] || CASE_STATUS.APPLIED;
}

export function canCreateInvoice(opsStatus) {
  const status = normalizeCaseStatus(opsStatus);
  return Boolean(status && INVOICE_ELIGIBLE_STATUSES.includes(status));
}

export function formatInvoiceNumber(year, sequence) {
  const y = Number(year);
  const seq = Number(sequence);
  if (!Number.isInteger(y) || y < 2000 || y > 9999) {
    throw new Error("invalid_invoice_year");
  }
  if (!Number.isInteger(seq) || seq < 1 || seq > 999999) {
    throw new Error("invalid_invoice_sequence");
  }
  return `BS-INV-${y}-${String(seq).padStart(4, "0")}`;
}

export function sumLineItemsKobo(lineItems = []) {
  return (Array.isArray(lineItems) ? lineItems : []).reduce((sum, item) => {
    const amount = Number(item?.amountKobo ?? item?.amount_kobo ?? 0);
    const qty = Number(item?.quantity ?? 1);
    if (!Number.isFinite(amount) || amount < 0) return sum;
    if (!Number.isFinite(qty) || qty < 1) return sum;
    return sum + Math.round(amount) * Math.round(qty);
  }, 0);
}
