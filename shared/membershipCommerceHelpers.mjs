/** Pure helpers for membership commerce (no DB). */

export const MEMBERSHIP_EVENT = Object.freeze({
  PAYMENT_COMPLETED: "PAYMENT_COMPLETED",
  MEMBERSHIP_GRANTED: "MEMBERSHIP_GRANTED",
  MEMBERSHIP_RENEWED: "MEMBERSHIP_RENEWED",
  MEMBERSHIP_EXPIRED: "MEMBERSHIP_EXPIRED",
  MEMBERSHIP_REVOKED: "MEMBERSHIP_REVOKED",
  ADMIN_GRANTED: "ADMIN_GRANTED",
  ADMIN_REVOKED: "ADMIN_REVOKED",
  REFUND_APPLIED: "REFUND_APPLIED"
});

export const EXPERIENCE_MODE = Object.freeze({
  DISCOVER: "discover",
  DISCREET: "discreet",
  CONCIERGE: "concierge"
});

export function normalizeExperienceMode(value) {
  const mode = String(value || "")
    .trim()
    .toLowerCase();
  if (mode === "discover" || mode === "premium" || mode === "signal_pass") return EXPERIENCE_MODE.DISCOVER;
  if (mode === "discreet" || mode === "discreet_membership") return EXPERIENCE_MODE.DISCREET;
  if (mode === "concierge" || mode === "signal_concierge") return EXPERIENCE_MODE.CONCIERGE;
  return null;
}

export function clampDays(days, fallback = 30) {
  const n = Number(days);
  const raw = Number.isFinite(n) && n > 0 ? n : fallback;
  return Math.max(1, Math.min(366, Math.round(raw)));
}

export function computeEndsAt(existingEndsAt, days) {
  const durationMs = clampDays(days) * 86400000;
  const existingMs = existingEndsAt ? new Date(existingEndsAt).getTime() : 0;
  const baseMs = Number.isFinite(existingMs) && existingMs > Date.now() ? existingMs : Date.now();
  return new Date(baseMs + durationMs).toISOString();
}
