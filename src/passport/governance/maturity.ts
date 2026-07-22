/**
 * Trust Maturity Levels — every capability declares readiness.
 * Prevents unfinished trust features from being treated as authoritative.
 *
 * Advance maturity in this registry; do not invent parallel status flags.
 *
 * @see docs/architecture/DIGITAL_TRUST_CONSTITUTION.md
 */

import type { TrustDimension } from "../trust/types";

export type TrustMaturityLevel = "production" | "beta" | "foundation" | "planned";

export type PassportCapabilityId =
  | "identity"
  | "passportId"
  | "workspace"
  | "persona"
  | "permissions"
  | "passportSummary"
  | "trustContributors"
  | "constitution"
  | "auditTimeline"
  | "reputation"
  | "identityTrust"
  | "socialTrust"
  | "financialTrust"
  | "marketplaceTrust"
  | "ecosystemTrust"
  | "trustEngine"
  | "trustSignals"
  | "explainability"
  | "consent"
  | "consentUi"
  | "disputes"
  | "disputeWorkflow"
  | "externalApi"
  | "userVisibility"
  | "trustLifecycle"
  | "trustProgression"
  | "trustTimeline"
  | "passportJourney"
  | "achievements"
  | "milestones"
  | "trustEvolutionModel"
  | "legacy"
  | "legacyContributions"
  | "legacyTimeline"
  | "legacyBadges"
  | "legacyApi";

export type PassportCapabilityDefinition = {
  id: PassportCapabilityId;
  label: string;
  maturity: TrustMaturityLevel;
  description: string;
};

/** Canonical maturity registry — single source of truth for platform readiness. */
export const PASSPORT_CAPABILITY_REGISTRY: Record<
  PassportCapabilityId,
  PassportCapabilityDefinition
> = {
  identity: {
    id: "identity",
    label: "Identity",
    maturity: "production",
    description: "Immutable Passport identity binding and verification snapshot"
  },
  passportId: {
    id: "passportId",
    label: "Passport ID",
    maturity: "production",
    description: "Immutable SKL-XXXX-XXXX Passport ID format and registry"
  },
  workspace: {
    id: "workspace",
    label: "Workspace",
    maturity: "production",
    description: "Workspace registry, session, and switching"
  },
  persona: {
    id: "persona",
    label: "Persona",
    maturity: "production",
    description: "Persona registry and workspace-scoped selection"
  },
  permissions: {
    id: "permissions",
    label: "Permissions",
    maturity: "production",
    description: "Identity, persona, and workspace permission gates"
  },
  passportSummary: {
    id: "passportSummary",
    label: "Passport Summary",
    maturity: "production",
    description: "Canonical portable trust summary schema"
  },
  trustContributors: {
    id: "trustContributors",
    label: "Trust Contributors",
    maturity: "production",
    description: "Contributor registry — BamSignal shipped; ecosystem reserved"
  },
  constitution: {
    id: "constitution",
    label: "Digital Trust Constitution",
    maturity: "production",
    description: "Governance principles, prohibitions, and platform contracts"
  },
  auditTimeline: {
    id: "auditTimeline",
    label: "Audit Timeline",
    maturity: "beta",
    description: "Client-side audit event timeline — server sync future"
  },
  reputation: {
    id: "reputation",
    label: "Behaviour Reputation",
    maturity: "foundation",
    description: "Behaviour history interfaces — distinct from derived trust"
  },
  identityTrust: {
    id: "identityTrust",
    label: "Identity Trust",
    maturity: "foundation",
    description: "Identity verification trust dimension — trust engine not shipped"
  },
  socialTrust: {
    id: "socialTrust",
    label: "Social Trust",
    maturity: "foundation",
    description: "BamSignal social trust dimension — signal ingestion future"
  },
  financialTrust: {
    id: "financialTrust",
    label: "Financial Trust",
    maturity: "planned",
    description: "BayRight financial trust dimension"
  },
  marketplaceTrust: {
    id: "marketplaceTrust",
    label: "Marketplace Trust",
    maturity: "planned",
    description: "Yike marketplace trust dimension"
  },
  ecosystemTrust: {
    id: "ecosystemTrust",
    label: "Ecosystem Trust",
    maturity: "planned",
    description: "Cross-product Stankings ecosystem trust dimension"
  },
  trustEngine: {
    id: "trustEngine",
    label: "Trust Engine",
    maturity: "planned",
    description: "Signal ingestion and derived trust calculation"
  },
  trustSignals: {
    id: "trustSignals",
    label: "Trust Signals",
    maturity: "foundation",
    description: "Signal metadata interfaces — no scoring in this phase"
  },
  explainability: {
    id: "explainability",
    label: "Explainability",
    maturity: "foundation",
    description: "Trust explanation model — placeholder until signals ship"
  },
  consent: {
    id: "consent",
    label: "Consent",
    maturity: "foundation",
    description: "Consent grant interfaces and local audit trail"
  },
  consentUi: {
    id: "consentUi",
    label: "Consent UI",
    maturity: "planned",
    description: "User-facing consent grant and revocation flows"
  },
  disputes: {
    id: "disputes",
    label: "Disputes",
    maturity: "foundation",
    description: "Dispute submission extension points"
  },
  disputeWorkflow: {
    id: "disputeWorkflow",
    label: "Dispute Workflow",
    maturity: "planned",
    description: "Human review and resolution workflows"
  },
  externalApi: {
    id: "externalApi",
    label: "External API",
    maturity: "planned",
    description: "Scoped Passport API for external consumers"
  },
  userVisibility: {
    id: "userVisibility",
    label: "User Visibility",
    maturity: "foundation",
    description: "User-facing Passport visibility snapshot contract"
  },
  trustLifecycle: {
    id: "trustLifecycle",
    label: "Trust Lifecycle",
    maturity: "foundation",
    description: "Lifecycle stages — maturity markers, not rankings"
  },
  trustProgression: {
    id: "trustProgression",
    label: "Trust Progression",
    maturity: "foundation",
    description: "Progression event interfaces — no calculations"
  },
  trustTimeline: {
    id: "trustTimeline",
    label: "Trust Timeline",
    maturity: "foundation",
    description: "Curated positive milestones — separate from audit"
  },
  passportJourney: {
    id: "passportJourney",
    label: "Passport Journey",
    maturity: "foundation",
    description: "User narrative architecture — document only"
  },
  achievements: {
    id: "achievements",
    label: "Achievements",
    maturity: "foundation",
    description: "Achievement registry — badges do not directly affect trust"
  },
  milestones: {
    id: "milestones",
    label: "Milestones",
    maturity: "foundation",
    description: "Milestone registry — participation markers"
  },
  trustEvolutionModel: {
    id: "trustEvolutionModel",
    label: "Trust Evolution Model",
    maturity: "foundation",
    description: "Living Passport philosophy and evolution phases"
  },
  legacy: {
    id: "legacy",
    label: "Legacy",
    maturity: "foundation",
    description: "Legacy layer — emerges over decades, never calculated directly"
  },
  legacyContributions: {
    id: "legacyContributions",
    label: "Legacy Contributions",
    maturity: "foundation",
    description: "Contribution dimension registry — not trust dimensions"
  },
  legacyTimeline: {
    id: "legacyTimeline",
    label: "Legacy Timeline",
    maturity: "foundation",
    description: "Decades-scale legacy narrative — separate from trust timeline"
  },
  legacyBadges: {
    id: "legacyBadges",
    label: "Legacy Recognition",
    maturity: "foundation",
    description: "Legacy badges — stewardship recognition, not achievements"
  },
  legacyApi: {
    id: "legacyApi",
    label: "Legacy API",
    maturity: "planned",
    description: "Server-side legacy emergence and human-reviewed recognition"
  }
} as const;

const MATURITY_RANK: Record<TrustMaturityLevel, number> = {
  production: 4,
  beta: 3,
  foundation: 2,
  planned: 1
};

const TRUST_DIMENSION_CAPABILITY: Record<TrustDimension, PassportCapabilityId> = {
  identity_trust: "identityTrust",
  social_trust: "socialTrust",
  financial_trust: "financialTrust",
  marketplace_trust: "marketplaceTrust",
  ecosystem_trust: "ecosystemTrust"
};

export function getCapabilityDefinition(id: PassportCapabilityId): PassportCapabilityDefinition {
  return PASSPORT_CAPABILITY_REGISTRY[id];
}

export function getCapabilityMaturity(id: PassportCapabilityId): TrustMaturityLevel {
  return PASSPORT_CAPABILITY_REGISTRY[id].maturity;
}

export function getTrustDimensionMaturity(dimension: TrustDimension): TrustMaturityLevel {
  return getCapabilityMaturity(TRUST_DIMENSION_CAPABILITY[dimension]);
}

export function listPassportCapabilities(): PassportCapabilityDefinition[] {
  return Object.values(PASSPORT_CAPABILITY_REGISTRY);
}

export function listCapabilitiesByMaturity(
  maturity: TrustMaturityLevel
): PassportCapabilityDefinition[] {
  return listPassportCapabilities().filter((c) => c.maturity === maturity);
}

/** Production capabilities may be treated as authoritative platform contracts. */
export function isAuthoritativeCapability(id: PassportCapabilityId): boolean {
  return getCapabilityMaturity(id) === "production";
}

export function isCapabilityAtLeast(
  id: PassportCapabilityId,
  minimum: TrustMaturityLevel
): boolean {
  return MATURITY_RANK[getCapabilityMaturity(id)] >= MATURITY_RANK[minimum];
}

export function maturityLabel(level: TrustMaturityLevel): string {
  if (level === "production") return "Production";
  if (level === "beta") return "Beta";
  if (level === "foundation") return "Foundation";
  return "Planned";
}
