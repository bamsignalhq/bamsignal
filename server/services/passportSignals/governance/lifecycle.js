/**
 * Signal lifecycle model — operational states, never trust scores.
 */

/** Allowed lifecycle transitions for governance actions. */
export const LIFECYCLE_TRANSITIONS = {
  approve: { from: ["quarantined", "under_review", "validated", "pending"], to: "accepted" },
  reject: { from: ["quarantined", "under_review", "validated", "received", "pending"], to: "rejected" },
  revoke: { from: ["accepted", "validated"], to: "revoked" },
  restore: { from: ["revoked", "rejected", "quarantined"], to: "accepted" },
  expire: { from: ["accepted", "validated"], to: "expired" },
  quarantine: { from: ["received", "validated", "accepted", "under_review"], to: "quarantined" },
  annotate: { from: ["received", "validated", "accepted", "quarantined", "under_review", "rejected", "revoked", "expired", "archived"], to: null }
};

export const TERMINAL_STATUSES = new Set(["rejected", "revoked", "expired", "archived"]);

export function canTransition(action, currentStatus) {
  const rule = LIFECYCLE_TRANSITIONS[action];
  if (!rule) return false;
  if (action === "annotate") return true;
  return rule.from.includes(currentStatus);
}

export function targetStatusForAction(action) {
  return LIFECYCLE_TRANSITIONS[action]?.to || null;
}

export function isTerminalStatus(status) {
  return TERMINAL_STATUSES.has(status);
}

/** Map ingestion pipeline stage to lifecycle status. */
export function lifecycleStatusAfterIngestion({ validationPassed, requiresReview = false }) {
  if (!validationPassed) return "rejected";
  if (requiresReview) return "quarantined";
  return "accepted";
}
