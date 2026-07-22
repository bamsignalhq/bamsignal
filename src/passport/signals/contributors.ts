/**
 * Signal Contributor registry — who may emit which signal types.
 * Extends Foundation v1.0 Trust Contributor model without modifying frozen contracts.
 *
 * @see docs/architecture/TRUST_SIGNAL_STANDARD.md
 */

import type { TrustSignalEvidenceCategory } from "./categories";
import type { TrustSignalTypeDescriptor } from "./types";

export type SignalContributorStatus = "active" | "reserved" | "suspended" | "deprecated";

export type SignalContributorTrustDomain =
  | "social"
  | "financial"
  | "marketplace"
  | "ecosystem"
  | "government"
  | "institutional"
  | "employment"
  | "education"
  | "manual";

export type SignalContributorVerificationLevel =
  | "unverified"
  | "registered"
  | "verified"
  | "institutional"
  | "government";

export type SignalContributorCapability =
  | "emit_signals"
  | "register_signal_types"
  | "request_human_review"
  | "attach_evidence_refs"
  | "revoke_own_signals"
  | "cross_product_correlation";

export type SignalContributorDefinition = {
  contributorId: string;
  displayName: string;
  trustDomain: SignalContributorTrustDomain;
  capabilities: readonly SignalContributorCapability[];
  allowedSignalTypes: readonly string[];
  verificationLevel: SignalContributorVerificationLevel;
  documentationUrl: string | null;
  status: SignalContributorStatus;
  /** Maps to Foundation Trust Contributor id when applicable. */
  trustContributorRef: string | null;
};

/** Product signal type registrations — BamSignal, BayRight, Yike. */
export const PRODUCT_SIGNAL_TYPE_REGISTRY: readonly TrustSignalTypeDescriptor[] = [
  // BamSignal — Social
  {
    signalType: "profile_verified",
    label: "Profile Verified",
    category: "verification",
    contributorId: "bamsignal",
    defaultHumanReview: "none",
    defaultExpiration: { expiresAt: null, policy: "permanent", rollingDays: null, label: "Permanent" },
    userFacingExplanation: "Your BamSignal profile verification was recorded.",
    documentationUrl: null
  },
  {
    signalType: "identity_verified",
    label: "Identity Verified",
    category: "identity",
    contributorId: "bamsignal",
    defaultHumanReview: "required",
    defaultExpiration: { expiresAt: null, policy: "permanent", rollingDays: null, label: "Permanent" },
    userFacingExplanation: "Identity verification milestone completed via BamSignal.",
    documentationUrl: null
  },
  {
    signalType: "positive_interaction",
    label: "Positive Interaction",
    category: "community",
    contributorId: "bamsignal",
    defaultHumanReview: "none",
    defaultExpiration: { expiresAt: null, policy: "rolling_days", rollingDays: 365, label: "One year" },
    userFacingExplanation: "A positive community interaction was recorded.",
    documentationUrl: null
  },
  {
    signalType: "successful_match",
    label: "Successful Match",
    category: "community",
    contributorId: "bamsignal",
    defaultHumanReview: "none",
    defaultExpiration: { expiresAt: null, policy: "rolling_days", rollingDays: 365, label: "One year" },
    userFacingExplanation: "A successful match interaction was recorded.",
    documentationUrl: null
  },
  {
    signalType: "community_participation",
    label: "Community Participation",
    category: "community",
    contributorId: "bamsignal",
    defaultHumanReview: "none",
    defaultExpiration: { expiresAt: null, policy: "rolling_days", rollingDays: 180, label: "Six months" },
    userFacingExplanation: "Sustained community participation was recorded.",
    documentationUrl: null
  },
  {
    signalType: "policy_violation",
    label: "Policy Violation",
    category: "compliance",
    contributorId: "bamsignal",
    defaultHumanReview: "required",
    defaultExpiration: { expiresAt: null, policy: "until_disputed", rollingDays: null, label: "Until resolved" },
    userFacingExplanation: "A policy review event was recorded — subject to dispute.",
    documentationUrl: null
  },
  {
    signalType: "appeal_approved",
    label: "Appeal Approved",
    category: "compliance",
    contributorId: "bamsignal",
    defaultHumanReview: "completed",
    defaultExpiration: { expiresAt: null, policy: "permanent", rollingDays: null, label: "Permanent" },
    userFacingExplanation: "An appeal was approved after human review.",
    documentationUrl: null
  },
  // BayRight — Financial
  {
    signalType: "bank_verified",
    label: "Bank Verified",
    category: "financial",
    contributorId: "bayright",
    defaultHumanReview: "required",
    defaultExpiration: { expiresAt: null, policy: "permanent", rollingDays: null, label: "Permanent" },
    userFacingExplanation: "Bank account verification was completed via BayRight.",
    documentationUrl: null
  },
  {
    signalType: "successful_escrow",
    label: "Successful Escrow",
    category: "financial",
    contributorId: "bayright",
    defaultHumanReview: "none",
    defaultExpiration: { expiresAt: null, policy: "rolling_days", rollingDays: 730, label: "Two years" },
    userFacingExplanation: "An escrow transaction completed successfully.",
    documentationUrl: null
  },
  {
    signalType: "completed_settlement",
    label: "Completed Settlement",
    category: "financial",
    contributorId: "bayright",
    defaultHumanReview: "none",
    defaultExpiration: { expiresAt: null, policy: "rolling_days", rollingDays: 730, label: "Two years" },
    userFacingExplanation: "A financial settlement completed successfully.",
    documentationUrl: null
  },
  {
    signalType: "chargeback",
    label: "Chargeback",
    category: "financial",
    contributorId: "bayright",
    defaultHumanReview: "required",
    defaultExpiration: { expiresAt: null, policy: "until_disputed", rollingDays: null, label: "Until resolved" },
    userFacingExplanation: "A chargeback event was recorded — subject to review.",
    documentationUrl: null
  },
  {
    signalType: "refund",
    label: "Refund",
    category: "financial",
    contributorId: "bayright",
    defaultHumanReview: "recommended",
    defaultExpiration: { expiresAt: null, policy: "rolling_days", rollingDays: 365, label: "One year" },
    userFacingExplanation: "A refund event was recorded.",
    documentationUrl: null
  },
  {
    signalType: "fraud_investigation",
    label: "Fraud Investigation",
    category: "security",
    contributorId: "bayright",
    defaultHumanReview: "required",
    defaultExpiration: { expiresAt: null, policy: "until_disputed", rollingDays: null, label: "Until resolved" },
    userFacingExplanation: "A fraud investigation was opened — human review required.",
    documentationUrl: null
  },
  // Yike — Marketplace
  {
    signalType: "verified_seller",
    label: "Verified Seller",
    category: "marketplace",
    contributorId: "yike",
    defaultHumanReview: "required",
    defaultExpiration: { expiresAt: null, policy: "permanent", rollingDays: null, label: "Permanent" },
    userFacingExplanation: "Seller verification completed via Yike.",
    documentationUrl: null
  },
  {
    signalType: "verified_buyer",
    label: "Verified Buyer",
    category: "marketplace",
    contributorId: "yike",
    defaultHumanReview: "required",
    defaultExpiration: { expiresAt: null, policy: "permanent", rollingDays: null, label: "Permanent" },
    userFacingExplanation: "Buyer verification completed via Yike.",
    documentationUrl: null
  },
  {
    signalType: "successful_transaction",
    label: "Successful Transaction",
    category: "marketplace",
    contributorId: "yike",
    defaultHumanReview: "none",
    defaultExpiration: { expiresAt: null, policy: "rolling_days", rollingDays: 730, label: "Two years" },
    userFacingExplanation: "A marketplace transaction completed successfully.",
    documentationUrl: null
  },
  {
    signalType: "inspection_passed",
    label: "Inspection Passed",
    category: "marketplace",
    contributorId: "yike",
    defaultHumanReview: "recommended",
    defaultExpiration: { expiresAt: null, policy: "rolling_days", rollingDays: 365, label: "One year" },
    userFacingExplanation: "A property or listing inspection passed.",
    documentationUrl: null
  },
  {
    signalType: "property_verified",
    label: "Property Verified",
    category: "verification",
    contributorId: "yike",
    defaultHumanReview: "required",
    defaultExpiration: { expiresAt: null, policy: "permanent", rollingDays: null, label: "Permanent" },
    userFacingExplanation: "A property verification milestone was completed.",
    documentationUrl: null
  },
  {
    signalType: "dispute_closed",
    label: "Dispute Closed",
    category: "compliance",
    contributorId: "yike",
    defaultHumanReview: "completed",
    defaultExpiration: { expiresAt: null, policy: "permanent", rollingDays: null, label: "Permanent" },
    userFacingExplanation: "A marketplace dispute was closed after review.",
    documentationUrl: null
  }
] as const;

export const SIGNAL_CONTRIBUTOR_REGISTRY: readonly SignalContributorDefinition[] = [
  {
    contributorId: "bamsignal",
    displayName: "BamSignal",
    trustDomain: "social",
    capabilities: ["emit_signals", "register_signal_types", "attach_evidence_refs", "revoke_own_signals"],
    allowedSignalTypes: [
      "profile_verified",
      "identity_verified",
      "positive_interaction",
      "successful_match",
      "community_participation",
      "policy_violation",
      "appeal_approved"
    ],
    verificationLevel: "verified",
    documentationUrl: null,
    status: "active",
    trustContributorRef: "bamsignal"
  },
  {
    contributorId: "bayright",
    displayName: "BayRight",
    trustDomain: "financial",
    capabilities: ["emit_signals", "register_signal_types", "attach_evidence_refs", "revoke_own_signals"],
    allowedSignalTypes: [
      "bank_verified",
      "successful_escrow",
      "completed_settlement",
      "chargeback",
      "refund",
      "fraud_investigation"
    ],
    verificationLevel: "registered",
    documentationUrl: null,
    status: "reserved",
    trustContributorRef: "bayright"
  },
  {
    contributorId: "yike",
    displayName: "Yike",
    trustDomain: "marketplace",
    capabilities: ["emit_signals", "register_signal_types", "attach_evidence_refs", "revoke_own_signals"],
    allowedSignalTypes: [
      "verified_seller",
      "verified_buyer",
      "successful_transaction",
      "inspection_passed",
      "property_verified",
      "dispute_closed"
    ],
    verificationLevel: "registered",
    documentationUrl: null,
    status: "reserved",
    trustContributorRef: "yike"
  },
  {
    contributorId: "stankings",
    displayName: "Stankings",
    trustDomain: "ecosystem",
    capabilities: ["emit_signals", "cross_product_correlation"],
    allowedSignalTypes: ["cross_product_consistency"],
    verificationLevel: "institutional",
    documentationUrl: null,
    status: "reserved",
    trustContributorRef: "stankings"
  },
  {
    contributorId: "government",
    displayName: "Government",
    trustDomain: "government",
    capabilities: ["emit_signals", "register_signal_types"],
    allowedSignalTypes: ["authorized_identity_attestation", "government_verification"],
    verificationLevel: "government",
    documentationUrl: null,
    status: "reserved",
    trustContributorRef: "government"
  },
  {
    contributorId: "financial_institution",
    displayName: "Financial Institution",
    trustDomain: "institutional",
    capabilities: ["emit_signals"],
    allowedSignalTypes: ["institutional_account_verified", "credit_reference"],
    verificationLevel: "institutional",
    documentationUrl: null,
    status: "reserved",
    trustContributorRef: null
  },
  {
    contributorId: "employer",
    displayName: "Employer",
    trustDomain: "employment",
    capabilities: ["emit_signals"],
    allowedSignalTypes: ["employment_verified", "reference_check"],
    verificationLevel: "institutional",
    documentationUrl: null,
    status: "reserved",
    trustContributorRef: "employment"
  },
  {
    contributorId: "educational_institution",
    displayName: "Educational Institution",
    trustDomain: "education",
    capabilities: ["emit_signals"],
    allowedSignalTypes: ["credential_verified", "institutional_affiliation"],
    verificationLevel: "institutional",
    documentationUrl: null,
    status: "reserved",
    trustContributorRef: "education"
  },
  {
    contributorId: "user_verified",
    displayName: "User Verified",
    trustDomain: "social",
    capabilities: ["request_human_review"],
    allowedSignalTypes: [],
    verificationLevel: "verified",
    documentationUrl: null,
    status: "reserved",
    trustContributorRef: null
  },
  {
    contributorId: "manual_review",
    displayName: "Manual Review",
    trustDomain: "manual",
    capabilities: ["emit_signals", "request_human_review"],
    allowedSignalTypes: ["human_review_outcome"],
    verificationLevel: "institutional",
    documentationUrl: null,
    status: "reserved",
    trustContributorRef: null
  }
] as const;

const CONTRIBUTOR_BY_ID = Object.fromEntries(
  SIGNAL_CONTRIBUTOR_REGISTRY.map((c) => [c.contributorId, c])
) as Record<string, SignalContributorDefinition>;

export function getSignalContributor(contributorId: string): SignalContributorDefinition | null {
  return CONTRIBUTOR_BY_ID[contributorId] ?? null;
}

export function listSignalContributors(
  filter?: { status?: SignalContributorStatus; domain?: SignalContributorTrustDomain }
): SignalContributorDefinition[] {
  return SIGNAL_CONTRIBUTOR_REGISTRY.filter((c) => {
    if (filter?.status && c.status !== filter.status) return false;
    if (filter?.domain && c.trustDomain !== filter.domain) return false;
    return true;
  });
}

export function getSignalTypeDescriptor(signalType: string): TrustSignalTypeDescriptor | null {
  return PRODUCT_SIGNAL_TYPE_REGISTRY.find((d) => d.signalType === signalType) ?? null;
}

export function listSignalTypesForContributor(contributorId: string): TrustSignalTypeDescriptor[] {
  return PRODUCT_SIGNAL_TYPE_REGISTRY.filter((d) => d.contributorId === contributorId);
}

export function listSignalTypesByCategory(
  category: TrustSignalEvidenceCategory
): TrustSignalTypeDescriptor[] {
  return PRODUCT_SIGNAL_TYPE_REGISTRY.filter((d) => d.category === category);
}

export function isContributorAllowedSignalType(contributorId: string, signalType: string): boolean {
  const contributor = getSignalContributor(contributorId);
  return contributor?.allowedSignalTypes.includes(signalType) ?? false;
}
