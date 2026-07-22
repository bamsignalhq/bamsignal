import type { TrustContributorDefinition } from "./types";

/**
 * Trust Contributor registry — products contribute trust; they never own the Passport.
 * Add entries here; do not hardcode product logic in Passport core.
 */
export const TRUST_CONTRIBUTOR_REGISTRY: readonly TrustContributorDefinition[] = [
  {
    id: "bamsignal",
    label: "BamSignal",
    description: "Social discovery — contributes Social Trust signals",
    trustContributions: ["social_trust", "identity_trust"],
    reputationTypes: ["community", "product"],
    auditCategories: [
      "authentication",
      "verification",
      "moderation",
      "report",
      "security",
      "profile",
      "workspace",
      "persona"
    ],
    preparedSignals: [
      "reports",
      "blocks",
      "safety_incidents",
      "successful_matches",
      "community_behaviour",
      "profile_authenticity",
      "verification_participation"
    ],
    shipped: true
  },
  {
    id: "bayright",
    label: "BayRight",
    description: "Financial services — contributes Financial Trust signals",
    trustContributions: ["financial_trust", "identity_trust"],
    reputationTypes: ["financial", "professional"],
    auditCategories: ["authentication", "verification", "security", "product"],
    preparedSignals: [
      "kyc_completion",
      "payment_behaviour",
      "escrow_history",
      "chargebacks",
      "fraud_detection",
      "wallet_integrity",
      "credit_behaviour"
    ],
    shipped: false
  },
  {
    id: "yike",
    label: "Yike",
    description: "Marketplace — contributes Marketplace Trust signals",
    trustContributions: ["marketplace_trust", "identity_trust"],
    reputationTypes: ["marketplace", "product"],
    auditCategories: ["authentication", "verification", "moderation", "report", "security", "product"],
    preparedSignals: [
      "seller_ratings",
      "buyer_ratings",
      "transaction_completion",
      "listing_quality",
      "disputes",
      "fraud_reports"
    ],
    shipped: false
  },
  {
    id: "stankings",
    label: "Stankings",
    description: "Ecosystem hub — aggregates cross-product Ecosystem Trust",
    trustContributions: ["ecosystem_trust"],
    reputationTypes: ["product"],
    auditCategories: ["authentication", "workspace", "persona", "product"],
    preparedSignals: ["cross_product_consistency", "ecosystem_participation"],
    shipped: false
  },
  {
    id: "education",
    label: "Education",
    description: "Future trust contributor — education credentials and behaviour",
    trustContributions: ["identity_trust", "ecosystem_trust"],
    reputationTypes: ["education", "professional"],
    auditCategories: ["verification", "product"],
    preparedSignals: ["credential_verification", "institutional_affiliation"],
    shipped: false
  },
  {
    id: "healthcare",
    label: "Healthcare",
    description: "Future trust contributor — healthcare verification (where authorized)",
    trustContributions: ["identity_trust"],
    reputationTypes: ["professional"],
    auditCategories: ["verification", "security", "product"],
    preparedSignals: ["provider_verification"],
    shipped: false
  },
  {
    id: "employment",
    label: "Employment",
    description: "Future trust contributor — employment and professional history",
    trustContributions: ["identity_trust", "ecosystem_trust"],
    reputationTypes: ["professional"],
    auditCategories: ["verification", "product"],
    preparedSignals: ["employment_verification", "reference_checks"],
    shipped: false
  },
  {
    id: "travel",
    label: "Travel",
    description: "Future trust contributor — travel and mobility trust",
    trustContributions: ["marketplace_trust", "identity_trust"],
    reputationTypes: ["marketplace", "product"],
    auditCategories: ["verification", "product"],
    preparedSignals: ["booking_completion", "host_guest_ratings"],
    shipped: false
  },
  {
    id: "government",
    label: "Government",
    description: "Future trust contributor — authorized government verification",
    trustContributions: ["identity_trust", "ecosystem_trust"],
    reputationTypes: ["professional"],
    auditCategories: ["verification", "security"],
    preparedSignals: ["authorized_identity_attestation"],
    shipped: false
  }
] as const;

const BY_ID = Object.fromEntries(TRUST_CONTRIBUTOR_REGISTRY.map((c) => [c.id, c])) as Record<
  TrustContributorDefinition["id"],
  TrustContributorDefinition
>;

export function getTrustContributor(id: TrustContributorDefinition["id"]): TrustContributorDefinition {
  return BY_ID[id];
}

export function listTrustContributors(shippedOnly = false): TrustContributorDefinition[] {
  return TRUST_CONTRIBUTOR_REGISTRY.filter((c) => !shippedOnly || c.shipped);
}

export function listContributorsForTrustDimension(
  dimension: TrustContributorDefinition["trustContributions"][number]
): TrustContributorDefinition[] {
  return TRUST_CONTRIBUTOR_REGISTRY.filter((c) => c.trustContributions.includes(dimension));
}

export function isKnownTrustContributorId(value: string): value is TrustContributorDefinition["id"] {
  return value in BY_ID;
}
