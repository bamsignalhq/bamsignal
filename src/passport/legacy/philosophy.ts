/**
 * Legacy Philosophy — Principle 12.
 * Legacy is stewardship, not status. It emerges; it is never calculated directly.
 *
 * @see docs/architecture/LEGACY_ARCHITECTURE.md
 */

/** Principle 12 — Legacy cannot be purchased, granted arbitrarily, or inherited. */
export const LEGACY_PHILOSOPHY =
  "Legacy represents stewardship rather than status. " +
  "It emerges from years of verified participation, responsible conduct, meaningful contribution, " +
  "and enduring trust across the Stankings ecosystem.";

export const LEGACY_EMERGENCE_PHILOSOPHY =
  "Legacy is never calculated directly. It emerges from sustained positive contribution over time. " +
  "Legacy is not a score, rank, or trust dimension — it is recognition of a lifelong digital trust journey.";

export const LEGACY_STEWARDSHIP_NOTICE =
  "Legacy recognition reflects what remains after years of trustworthy participation — " +
  "not a single action, purchase, or arbitrary grant.";

/** What Legacy is NOT — architectural boundaries. */
export const LEGACY_PROHIBITIONS = [
  "Legacy cannot be purchased",
  "Legacy cannot be granted arbitrarily",
  "Legacy cannot be inherited",
  "Legacy must never be calculated as a direct score",
  "Legacy must never replace trust dimensions",
  "Legacy must never be assigned by AI without human oversight"
] as const;
