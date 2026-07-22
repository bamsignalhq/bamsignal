export type TrustPlatformEventType =
  | "trust.signal.created"
  | "trust.signal.accepted"
  | "trust.signal.rejected"
  | "passport.updated"
  | "reputation.updated"
  | "verification.completed"
  | "identity.updated";

export type ReputationDimension =
  | "identity"
  | "reliability"
  | "safety"
  | "engagement"
  | "financial"
  | "community"
  | "verification"
  | "concierge"
  | "support";

export const REPUTATION_DIMENSIONS: ReputationDimension[] = [
  "identity",
  "reliability",
  "safety",
  "engagement",
  "financial",
  "community",
  "verification",
  "concierge",
  "support"
];

export const TRUST_PLATFORM_EVENT_TYPES: TrustPlatformEventType[] = [
  "trust.signal.created",
  "trust.signal.accepted",
  "trust.signal.rejected",
  "passport.updated",
  "reputation.updated",
  "verification.completed",
  "identity.updated"
];
