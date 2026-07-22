/**
 * Stankings Digital Trust Passport — trust dimension types.
 * Trust is derived confidence — never manually assigned, not calculated in this sprint.
 */

import type { TrustMaturityLevel } from "../governance/maturity";

/** Derived confidence dimensions — independent layers, not a single score. */
export type TrustDimension =
  | "identity_trust"
  | "social_trust"
  | "financial_trust"
  | "marketplace_trust"
  | "ecosystem_trust";

export type TrustConfidenceLevel = "pending" | "low" | "medium" | "high" | "unknown";

/** High-level trust summary for a single dimension — no raw product data. */
export type TrustDimensionSummary = {
  dimension: TrustDimension;
  label: string;
  /** Derived confidence — null until trust engine ships. */
  confidence: TrustConfidenceLevel;
  /** Placeholder for future derived score — always null in this sprint. */
  score: number | null;
  /** Platform readiness — prevents unfinished dimensions appearing authoritative. */
  maturity: TrustMaturityLevel;
  /** Which trust contributors may feed this dimension. */
  contributorIds: string[];
  updatedAt: string | null;
};

export type TrustSnapshot = {
  passportId: string;
  dimensions: Partial<Record<TrustDimension, TrustDimensionSummary>>;
  /** Trust is always derived — never manually assigned. */
  derived: true;
  updatedAt: string | null;
};

/** Descriptor for a future trust signal — products emit signals, Passport derives trust. */
export type TrustSignalDescriptor = {
  id: string;
  label: string;
  dimension: TrustDimension;
  contributorId: string;
  /** When true, signal type is registered but not yet collected. */
  prepared: boolean;
};
