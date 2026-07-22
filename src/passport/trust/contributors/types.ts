import type { AuditEventCategory, PassportProductId } from "../../types";
import type { TrustDimension } from "../types";

export type TrustContributorId = PassportProductId | "education" | "healthcare" | "employment" | "travel" | "government";

export type ReputationBehaviorType =
  | "community"
  | "marketplace"
  | "financial"
  | "professional"
  | "education"
  | "product";

export type TrustContributorDefinition = {
  id: TrustContributorId;
  label: string;
  description: string;
  /** Trust dimensions this product contributes to (never owns). */
  trustContributions: readonly TrustDimension[];
  /** Behaviour reputation types this product may emit. */
  reputationTypes: readonly ReputationBehaviorType[];
  /** Audit categories this product may append to the Passport timeline. */
  auditCategories: readonly AuditEventCategory[];
  /** Future trust signal descriptors — prepared, not collected. */
  preparedSignals: readonly string[];
  shipped: boolean;
};
