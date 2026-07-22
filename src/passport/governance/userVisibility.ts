/**
 * User Visibility architecture — Principle 6.
 * Documents what users must eventually see. No full UI in this sprint.
 *
 * @see docs/architecture/DIGITAL_TRUST_CONSTITUTION.md
 */

import { buildPassportSummary } from "../summary";
import { getPassportAuditTimeline } from "../audit";
import { getPassportIdentity } from "../session";
import { getTrustSnapshot } from "../trust";
import { getReputationSnapshot } from "../reputation";
import { listActiveConsentGrants, getConsentAuditTrail } from "./consent";
import { listDisputes } from "./disputes";
import { buildPlaceholderTrustExplanation, buildPlaceholderTrustEvolutionExplanation } from "./explainability";
import { buildPlaceholderTrustTimeline } from "../evolution/timeline";
import { buildPlaceholderPassportJourney } from "../evolution/journey";
import { buildPlaceholderLegacySnapshot } from "../legacy/model";
import type { TrustDimension } from "../trust/types";
import type { PassportId } from "../types";

/** Sections the user-facing Passport dashboard must eventually expose. */
export type UserVisibilitySection =
  | "passport_overview"
  | "verification_status"
  | "trust_dimensions"
  | "connected_products"
  | "audit_history"
  | "consent_grants"
  | "data_sharing_history"
  | "trust_explanations"
  | "disputes"
  | "trust_timeline"
  | "passport_journey"
  | "achievements"
  | "milestones"
  | "recommendations"
  | "legacy"
  | "legacy_contributions"
  | "legacy_timeline"
  | "legacy_badges";

export const USER_VISIBILITY_SECTIONS: readonly {
  id: UserVisibilitySection;
  label: string;
  description: string;
}[] = [
  {
    id: "passport_overview",
    label: "Passport overview",
    description: "Passport ID, display name, member since, active products"
  },
  {
    id: "verification_status",
    label: "Verification",
    description: "Email, phone, identity verification and confidence"
  },
  {
    id: "trust_dimensions",
    label: "Trust dimensions",
    description: "Independent confidence layers — never one life score"
  },
  {
    id: "connected_products",
    label: "Connected products",
    description: "Which Stankings products contribute to this Passport"
  },
  {
    id: "audit_history",
    label: "Audit history",
    description: "Authentication, security, workspace, and product events"
  },
  {
    id: "consent_grants",
    label: "Consent grants",
    description: "Active and revoked external access authorizations"
  },
  {
    id: "data_sharing_history",
    label: "Data sharing history",
    description: "When external consumers accessed scoped Passport summaries"
  },
  {
    id: "trust_explanations",
    label: "Trust explanations",
    description: "Why each trust dimension is at its current level"
  },
  {
    id: "disputes",
    label: "Disputes",
    description: "Submitted challenges and review status"
  },
  {
    id: "trust_timeline",
    label: "Trust timeline",
    description: "Positive milestones — how the Passport evolved (separate from audit)"
  },
  {
    id: "passport_journey",
    label: "Passport journey",
    description: "Narrative across identity, verification, trust, and products joined"
  },
  {
    id: "achievements",
    label: "Achievements",
    description: "Positive milestone badges — do not directly affect trust"
  },
  {
    id: "milestones",
    label: "Milestones",
    description: "Registered participation markers across the ecosystem"
  },
  {
    id: "recommendations",
    label: "Recommendations",
    description: "Suggested next steps to strengthen verification and participation"
  },
  {
    id: "legacy",
    label: "Legacy",
    description: "Sustained contribution recognition — emerges over years, not calculated directly"
  },
  {
    id: "legacy_contributions",
    label: "Legacy contributions",
    description: "What this person has contributed across community, business, marketplace, and more"
  },
  {
    id: "legacy_timeline",
    label: "Legacy timeline",
    description: "Decades-scale contribution narrative — separate from trust timeline and audit"
  },
  {
    id: "legacy_badges",
    label: "Legacy recognition",
    description: "Legacy badges — stewardship recognition, not achievements or trust scores"
  }
] as const;

/** Aggregated user visibility payload — architecture contract for future UI. */
export type UserPassportVisibilitySnapshot = {
  passportId: PassportId;
  summary: ReturnType<typeof buildPassportSummary>;
  trust: ReturnType<typeof getTrustSnapshot>;
  reputation: ReturnType<typeof getReputationSnapshot>;
  auditRecent: ReturnType<typeof getPassportAuditTimeline>;
  activeConsents: ReturnType<typeof listActiveConsentGrants>;
  consentAudit: ReturnType<typeof getConsentAuditTrail>;
  disputes: ReturnType<typeof listDisputes>;
  trustExplanations: Partial<Record<TrustDimension, ReturnType<typeof buildPlaceholderTrustExplanation>>>;
  trustEvolutionExplanation: ReturnType<typeof buildPlaceholderTrustEvolutionExplanation> | null;
  trustTimeline: ReturnType<typeof buildPlaceholderTrustTimeline>;
  passportJourney: ReturnType<typeof buildPlaceholderPassportJourney>;
  legacy: ReturnType<typeof buildPlaceholderLegacySnapshot>;
  availableSections: UserVisibilitySection[];
  generatedAt: string;
};

export function buildUserPassportVisibilitySnapshot(): UserPassportVisibilitySnapshot | null {
  const identity = getPassportIdentity();
  if (!identity) return null;
  const passportId = identity.passportId;

  const dimensions: TrustDimension[] = [
    "identity_trust",
    "social_trust",
    "financial_trust",
    "marketplace_trust",
    "ecosystem_trust"
  ];

  return {
    passportId,
    summary: buildPassportSummary(),
    trust: getTrustSnapshot(),
    reputation: getReputationSnapshot(),
    auditRecent: getPassportAuditTimeline(20),
    activeConsents: listActiveConsentGrants(passportId),
    consentAudit: getConsentAuditTrail(passportId),
    disputes: listDisputes(passportId),
    trustExplanations: Object.fromEntries(
      dimensions.map((d) => [d, buildPlaceholderTrustExplanation(passportId, d)])
    ),
    trustEvolutionExplanation: buildPlaceholderTrustEvolutionExplanation(passportId),
    trustTimeline: buildPlaceholderTrustTimeline(passportId),
    passportJourney: buildPlaceholderPassportJourney(passportId),
    legacy: buildPlaceholderLegacySnapshot(passportId),
    availableSections: USER_VISIBILITY_SECTIONS.map((s) => s.id),
    generatedAt: new Date().toISOString()
  };
}
