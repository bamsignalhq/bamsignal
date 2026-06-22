/** Member ownership model — members belong to BamSignal; consultants are stewards. */

export const CONCIERGE_MEMBER_OWNERSHIP = "bamsignal" as const;

export const CONCIERGE_OWNERSHIP_TITLE = "Member Ownership";
export const CONCIERGE_OWNERSHIP_HEADLINE = "This member belongs to BamSignal";
export const CONCIERGE_OWNERSHIP_SUBCOPY =
  "Consultants steward the journey. They do not own members. Transitions preserve full history.";

export const CONCIERGE_STEWARDSHIP_TITLE = "Stewardship";
export const CONCIERGE_STEWARDSHIP_CURRENT_LABEL = "Current steward";
export const CONCIERGE_STEWARDSHIP_UNASSIGNED = "Awaiting steward assignment";

export const CONCIERGE_TRANSFER_TITLE = "Steward Transition";
export const CONCIERGE_TRANSFER_SUBCOPY =
  "Reassign or transfer without losing journey history, notes, introductions, or follow-ups.";

export const CONCIERGE_JOURNEY_HISTORY_TITLE = "Journey History";
export const CONCIERGE_COMMUNICATION_JOURNAL_TITLE = "Communication Journal";
export const CONCIERGE_COMMUNICATION_JOURNAL_SUBCOPY =
  "Documented professional touchpoints only. WhatsApp is never used for member ↔ consultant relationships.";

export const CONCIERGE_CONTINUITY_COPY =
  "When a consultant transitions, the new steward inherits the full journey — supported, never abandoned.";

export const CONCIERGE_MEMBER_TRUST_COPY =
  "Members trust BamSignal — not individuals. Every action is logged for continuity.";

/** Reserved regional team lanes — not implemented. */
export const CONCIERGE_FUTURE_REGIONAL_TEAMS = [
  { id: "lagos", label: "Lagos consultants" },
  { id: "abuja", label: "Abuja consultants" },
  { id: "diaspora", label: "Diaspora consultants" },
  { id: "family-values", label: "Family-value advisors" },
  { id: "senior-matchmakers", label: "Senior matchmakers" },
  { id: "relationship-coaches", label: "Relationship coaches" }
] as const;

export type ConciergeFutureRegionalTeamId = (typeof CONCIERGE_FUTURE_REGIONAL_TEAMS)[number]["id"];

export type ConciergeRegionalTeamFutureConfig = {
  teamId?: ConciergeFutureRegionalTeamId;
  consultantId?: string;
  memberId?: string;
  enabled?: boolean;
};
