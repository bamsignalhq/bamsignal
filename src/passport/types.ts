/**
 * Stankings Digital Trust Passport — ecosystem trust layer.
 * BamSignal consumes Passport; it does not own identity or trust.
 *
 * Hierarchy:
 * Passport → Identity → Trust → Workspace → Persona → Permissions → Product Profiles → Activities
 */

import type { WorkspaceId } from "../workspaces/types";
import type { TrustDimension, TrustDimensionSummary } from "./trust/types";

/** Immutable Passport ID — canonical SKL-XXXX-XXXX (Stankings Legacy). */
export type PassportId = string;

export type PassportProductId = "bamsignal" | "bayright" | "yike" | "stankings";

export type IdentityVerificationStatus = "unverified" | "partial" | "verified";

export type IdentitySecurityStatus = "normal" | "review" | "restricted";

export type IdentityConfidenceLevel = "pending" | "low" | "medium" | "high" | "unknown";

/** Re-export trust confidence for summary consumers. */
export type { TrustConfidenceLevel } from "./trust/types";

/** Human identity bound to exactly one Passport. */
export type PassportIdentity = {
  passportId: PassportId;
  /** Stable anchor used before server ids hydrate (username hash / auth user id). */
  anchor: string;
  username: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  verificationStatus: IdentityVerificationStatus;
  /** Derived identity confidence — not a trust score. */
  identityConfidence: IdentityConfidenceLevel;
  securityStatus: IdentitySecurityStatus;
  /** Products that have bound this passport (trust contributors, not owners). */
  boundProducts: PassportProductId[];
  createdAt: string;
  updatedAt: string;
};

export type PassportSessionState = {
  version: 1;
  passportId: PassportId | null;
  identityAnchor: string | null;
  selectedWorkspaceId: WorkspaceId | null;
  preferredWorkspaceId: WorkspaceId | null;
  availableWorkspaceIds: WorkspaceId[];
  lastPathByWorkspace: Partial<Record<WorkspaceId, string>>;
  selectedPersonaId: string | null;
  preferredPersonaId: string | null;
  availablePersonaIds: string[];
  lastRoute: string | null;
};

export type IdentityPermission =
  | "identity.view"
  | "identity.edit.username"
  | "identity.edit.contact"
  | "identity.verify"
  | "identity.security";

export type PersonaPermission =
  | "persona.view"
  | "persona.switch"
  | "persona.profile.edit"
  | "persona.activity.view";

export type AuditEventCategory =
  | "authentication"
  | "verification"
  | "moderation"
  | "report"
  | "security"
  | "profile"
  | "workspace"
  | "persona"
  | "product"
  | "transaction";

export type AuditTimelineEntry = {
  id: string;
  passportId: PassportId;
  category: AuditEventCategory;
  action: string;
  productId: PassportProductId;
  workspaceId?: WorkspaceId;
  personaId?: string;
  at: string;
  /** Audit stores references — not raw product payloads. */
  meta?: Record<string, string | number | boolean | null>;
};

/** Canonical portable Passport Summary — no raw product data. */
export type PassportSummary = {
  passportId: PassportId;
  identity: {
    displayName: string;
    verificationStatus: IdentityVerificationStatus;
    identityConfidence: IdentityConfidenceLevel;
    securityStatus: IdentitySecurityStatus;
  };
  trust: Partial<Record<TrustDimension, TrustDimensionSummary>>;
  products: {
    active: PassportProductId[];
    verificationParticipation: string[];
  };
  timeline: {
    memberSince: string | null;
    lastActive: string | null;
    recentSecurityEvents: number;
  };
  generatedAt: string;
};

/** @deprecated Use ReputationBehaviorDimension from `./reputation/types` */
export type ReputationDimension =
  | "trust"
  | "verification"
  | "safety"
  | "community"
  | "marketplace"
  | "financial"
  | "cross_product";

/** @deprecated Use ReputationSnapshot from `./reputation/types` */
export type ReputationSnapshot = {
  passportId: PassportId;
  dimensions: Partial<Record<ReputationDimension, { score: number | null; label: string }>>;
  updatedAt: string | null;
};
