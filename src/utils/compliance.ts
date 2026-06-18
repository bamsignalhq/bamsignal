import {
  PRIVACY_VERSION,
  SAFETY_PLEDGE_VERSION,
  TERMS_VERSION,
  type ComplianceAckType
} from "../constants/compliance";
import type { MemberCompliance } from "../types";

export function normalizeCompliance(raw: unknown): MemberCompliance {
  const data = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    tosAccepted: Boolean(data.tosAccepted),
    tosAcceptedAt: typeof data.tosAcceptedAt === "string" ? data.tosAcceptedAt : undefined,
    tosVersion: typeof data.tosVersion === "string" ? data.tosVersion : undefined,
    privacyAccepted: Boolean(data.privacyAccepted),
    privacyAcceptedAt:
      typeof data.privacyAcceptedAt === "string" ? data.privacyAcceptedAt : undefined,
    privacyVersion: typeof data.privacyVersion === "string" ? data.privacyVersion : undefined,
    ageConfirmed18: Boolean(data.ageConfirmed18),
    ageConfirmedAt: typeof data.ageConfirmedAt === "string" ? data.ageConfirmedAt : undefined,
    safetyPledgeAccepted: Boolean(data.safetyPledgeAccepted),
    safetyPledgeAcceptedAt:
      typeof data.safetyPledgeAcceptedAt === "string" ? data.safetyPledgeAcceptedAt : undefined,
    safetyPledgeVersion:
      typeof data.safetyPledgeVersion === "string" ? data.safetyPledgeVersion : undefined,
    signupIp: typeof data.signupIp === "string" ? data.signupIp : undefined,
    signupUserAgent: typeof data.signupUserAgent === "string" ? data.signupUserAgent : undefined
  };
}

export function hasLegalCompliance(compliance?: MemberCompliance): boolean {
  if (!compliance) return false;
  return Boolean(
    compliance.tosAccepted &&
      compliance.tosVersion === TERMS_VERSION &&
      compliance.privacyAccepted &&
      compliance.privacyVersion === PRIVACY_VERSION &&
      compliance.ageConfirmed18 &&
      compliance.ageConfirmedAt
  );
}

export function hasSafetyPledge(compliance?: MemberCompliance): boolean {
  if (!compliance) return false;
  return Boolean(
    compliance.safetyPledgeAccepted &&
      compliance.safetyPledgeVersion === SAFETY_PLEDGE_VERSION &&
      compliance.safetyPledgeAcceptedAt
  );
}

export function isComplianceComplete(compliance?: MemberCompliance): boolean {
  return hasLegalCompliance(compliance) && hasSafetyPledge(compliance);
}

export type ComplianceGatePhase = "none" | "legal" | "pledge";

export function complianceGatePhase(compliance?: MemberCompliance): ComplianceGatePhase {
  if (isComplianceComplete(compliance)) return "none";
  if (!hasLegalCompliance(compliance)) return "legal";
  return "pledge";
}

export function buildCompliancePatch(
  existing: MemberCompliance | undefined,
  ackTypes: ComplianceAckType[],
  serverMeta?: Partial<MemberCompliance>
): MemberCompliance {
  const now = new Date().toISOString();
  const next: MemberCompliance = { ...(existing || {}) };

  if (ackTypes.includes("terms")) {
    next.tosAccepted = true;
    next.tosAcceptedAt = now;
    next.tosVersion = TERMS_VERSION;
  }
  if (ackTypes.includes("privacy")) {
    next.privacyAccepted = true;
    next.privacyAcceptedAt = now;
    next.privacyVersion = PRIVACY_VERSION;
  }
  if (ackTypes.includes("age_18")) {
    next.ageConfirmed18 = true;
    next.ageConfirmedAt = now;
  }
  if (ackTypes.includes("safety_pledge")) {
    next.safetyPledgeAccepted = true;
    next.safetyPledgeAcceptedAt = now;
    next.safetyPledgeVersion = SAFETY_PLEDGE_VERSION;
  }

  if (serverMeta?.signupIp) next.signupIp = serverMeta.signupIp;
  if (serverMeta?.signupUserAgent) next.signupUserAgent = serverMeta.signupUserAgent;

  return next;
}

export function signupLegalAckTypes(): ComplianceAckType[] {
  return ["terms", "privacy", "age_18"];
}
