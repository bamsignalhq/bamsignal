/**
 * Trust progression event types — extension interfaces for future trust growth.
 * No calculations. Products emit progression events; Passport indexes milestones.
 *
 * @see docs/architecture/TRUST_EVOLUTION_MODEL.md
 */

import type { PassportProductId } from "../types";
import type { TrustDimension } from "../trust/types";

/** Registered progression event kinds — extend via registry, never ad-hoc strings in products. */
export type TrustProgressionEventKind =
  | "identity_verified"
  | "phone_verified"
  | "government_id_verified"
  | "marketplace_participation"
  | "financial_participation"
  | "community_participation"
  | "long_term_activity"
  | "positive_dispute_resolution"
  | "years_of_good_standing"
  | "ecosystem_contribution";

export type TrustProgressionEventDescriptor = {
  kind: TrustProgressionEventKind;
  label: string;
  description: string;
  relatedDimensions: TrustDimension[];
  contributorProducts: PassportProductId[];
};

export const TRUST_PROGRESSION_EVENT_REGISTRY: readonly TrustProgressionEventDescriptor[] = [
  {
    kind: "identity_verified",
    label: "Identity verified",
    description: "Core identity verification completed",
    relatedDimensions: ["identity_trust"],
    contributorProducts: ["bamsignal", "bayright", "yike", "stankings"]
  },
  {
    kind: "phone_verified",
    label: "Phone verified",
    description: "Phone number verification completed",
    relatedDimensions: ["identity_trust"],
    contributorProducts: ["bamsignal"]
  },
  {
    kind: "government_id_verified",
    label: "Government ID verified",
    description: "Authorized government identity attestation",
    relatedDimensions: ["identity_trust", "ecosystem_trust"],
    contributorProducts: ["stankings"]
  },
  {
    kind: "marketplace_participation",
    label: "Marketplace participation",
    description: "Active participation in marketplace trust domain",
    relatedDimensions: ["marketplace_trust"],
    contributorProducts: ["yike"]
  },
  {
    kind: "financial_participation",
    label: "Financial participation",
    description: "Active participation in financial trust domain",
    relatedDimensions: ["financial_trust"],
    contributorProducts: ["bayright"]
  },
  {
    kind: "community_participation",
    label: "Community participation",
    description: "Positive community participation in social discovery",
    relatedDimensions: ["social_trust"],
    contributorProducts: ["bamsignal"]
  },
  {
    kind: "long_term_activity",
    label: "Long-term activity",
    description: "Sustained activity across the Stankings ecosystem",
    relatedDimensions: ["ecosystem_trust"],
    contributorProducts: ["stankings"]
  },
  {
    kind: "positive_dispute_resolution",
    label: "Positive dispute resolution",
    description: "Dispute resolved in favour of correction or fair outcome",
    relatedDimensions: ["identity_trust", "social_trust", "ecosystem_trust"],
    contributorProducts: ["stankings"]
  },
  {
    kind: "years_of_good_standing",
    label: "Years of good standing",
    description: "Multi-year consistent positive participation",
    relatedDimensions: ["ecosystem_trust"],
    contributorProducts: ["stankings"]
  },
  {
    kind: "ecosystem_contribution",
    label: "Ecosystem contribution",
    description: "Notable contribution to the Stankings trust ecosystem",
    relatedDimensions: ["ecosystem_trust"],
    contributorProducts: ["stankings"]
  }
] as const;

/** Future progression record — indexed reference, not raw product data. */
export type TrustProgressionEventRecord = {
  eventId: string;
  passportId: string;
  kind: TrustProgressionEventKind;
  originProduct: PassportProductId;
  occurredAt: string;
  headline: string;
  description: string;
  evidenceRef: string | null;
  auditRef: string | null;
};

/** Future ingestion contract — not implemented. */
export interface TrustProgressionClient {
  recordEvent(event: Omit<TrustProgressionEventRecord, "eventId">): Promise<TrustProgressionEventRecord>;
  listEvents(passportId: string): Promise<TrustProgressionEventRecord[]>;
}

export function getProgressionEventDescriptor(
  kind: TrustProgressionEventKind
): TrustProgressionEventDescriptor {
  const found = TRUST_PROGRESSION_EVENT_REGISTRY.find((e) => e.kind === kind);
  if (!found) throw new Error(`Unknown progression event kind: ${kind}`);
  return found;
}

export function listProgressionEventKinds(): TrustProgressionEventKind[] {
  return TRUST_PROGRESSION_EVENT_REGISTRY.map((e) => e.kind);
}
