/**
 * Canonical Passport Summary — portable trust representation.
 * Must NOT expose raw product data; high-level trust information only.
 */

import { getPassportAuditTimeline } from "./audit";
import { getPassportIdentity } from "./session";
import { getTrustSnapshot } from "./trust";
import type {
  IdentityVerificationStatus,
  PassportId,
  PassportProductId,
  PassportSummary
} from "./types";
import type { TrustConfidenceLevel } from "./trust/types";

function identityConfidenceFromVerification(
  status: IdentityVerificationStatus | undefined
): TrustConfidenceLevel {
  if (status === "verified") return "medium";
  if (status === "partial") return "low";
  return "pending";
}

function displayNameFromIdentity(): string {
  const identity = getPassportIdentity();
  if (!identity) return "Member";
  return identity.username || identity.email || identity.phone || "Member";
}

/**
 * Build the standard Passport Summary object consumed across Stankings products.
 * No raw chats, wallets, listings, or transaction data — summaries only.
 */
export function buildPassportSummary(): PassportSummary {
  const identity = getPassportIdentity();
  const passportId = (identity?.passportId ?? "unknown") as PassportId;
  const trust = getTrustSnapshot();
  const audit = getPassportAuditTimeline(20);
  const securityEvents = audit.filter(
    (e) => e.category === "security" || e.category === "authentication"
  ).length;

  const activeProducts = (identity?.boundProducts ?? ["bamsignal"]) as PassportProductId[];

  const verificationParticipation: string[] = [];
  if (identity?.emailVerified) verificationParticipation.push("email");
  if (identity?.phoneVerified) verificationParticipation.push("phone");
  if (identity?.verificationStatus === "verified") verificationParticipation.push("identity");

  return {
    passportId,
    identity: {
      displayName: displayNameFromIdentity(),
      verificationStatus: identity?.verificationStatus ?? "unverified",
      identityConfidence: identityConfidenceFromVerification(identity?.verificationStatus),
      securityStatus: identity?.securityStatus ?? "normal"
    },
    trust: trust.dimensions,
    products: {
      active: activeProducts,
      verificationParticipation
    },
    timeline: {
      memberSince: identity?.createdAt ?? null,
      lastActive: identity?.updatedAt ?? null,
      recentSecurityEvents: securityEvents
    },
    generatedAt: new Date().toISOString()
  };
}

export function getPassportSummaryJson(): string {
  return JSON.stringify(buildPassportSummary(), null, 2);
}
