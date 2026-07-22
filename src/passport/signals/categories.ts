/**
 * Trust Signal categories — evidence classification only.
 * Signals are evidence. Signals are NOT trust.
 *
 * @see docs/architecture/TRUST_SIGNAL_STANDARD.md
 */

/** Canonical signal category — describes evidence domain, not trust dimension. */
export type TrustSignalEvidenceCategory =
  | "identity"
  | "verification"
  | "financial"
  | "marketplace"
  | "community"
  | "professional"
  | "education"
  | "government"
  | "security"
  | "compliance"
  | "legacy";

export type TrustSignalEvidenceCategoryDefinition = {
  id: TrustSignalEvidenceCategory;
  label: string;
  description: string;
};

export const TRUST_SIGNAL_EVIDENCE_CATEGORIES: Record<
  TrustSignalEvidenceCategory,
  TrustSignalEvidenceCategoryDefinition
> = {
  identity: {
    id: "identity",
    label: "Identity",
    description: "Identity binding and anchor evidence"
  },
  verification: {
    id: "verification",
    label: "Verification",
    description: "Verification milestones and attestations"
  },
  financial: {
    id: "financial",
    label: "Financial",
    description: "Financial participation and integrity evidence"
  },
  marketplace: {
    id: "marketplace",
    label: "Marketplace",
    description: "Marketplace transaction and merchant evidence"
  },
  community: {
    id: "community",
    label: "Community",
    description: "Social and community participation evidence"
  },
  professional: {
    id: "professional",
    label: "Professional",
    description: "Employment and professional conduct evidence"
  },
  education: {
    id: "education",
    label: "Education",
    description: "Educational credential and institutional evidence"
  },
  government: {
    id: "government",
    label: "Government",
    description: "Authorized government attestation evidence"
  },
  security: {
    id: "security",
    label: "Security",
    description: "Security events and integrity checks"
  },
  compliance: {
    id: "compliance",
    label: "Compliance",
    description: "Policy and regulatory compliance evidence"
  },
  legacy: {
    id: "legacy",
    label: "Legacy",
    description: "Long-horizon contribution evidence — not Legacy recognition itself"
  }
} as const;

export function getSignalEvidenceCategory(
  id: TrustSignalEvidenceCategory
): TrustSignalEvidenceCategoryDefinition {
  return TRUST_SIGNAL_EVIDENCE_CATEGORIES[id];
}

export function listSignalEvidenceCategories(): TrustSignalEvidenceCategoryDefinition[] {
  return Object.values(TRUST_SIGNAL_EVIDENCE_CATEGORIES);
}
