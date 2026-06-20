import {
  ADULT_RISK_VERSION,
  OFFLINE_SAFETY_VERSION,
  PRIVACY_VERSION,
  SAFETY_PLEDGE_VERSION,
  TERMS_VERSION,
  type ComplianceAckType
} from "../constants/compliance";
import type { MemberCompliance, UserProfile } from "../types";
import { normalizeUsername } from "./authIdentity";

export const COMPLIANCE_SYNC_PENDING_KEY = "bamsignal_compliance_sync_pending";
export const COMPLIANCE_PENDING_ACKS_KEY = "bamsignal_compliance_pending_acks";
export const COMPLIANCE_DONE_MARKER_PREFIX = "bamsignal_compliance_done:";

const ALL_GATE_ACK_TYPES: ComplianceAckType[] = [
  "terms",
  "privacy",
  "age_18",
  "safety_pledge",
  "adult_risk"
];

type ComplianceCheckOptions = { relaxed?: boolean };

function pickBool(data: Record<string, unknown>, ...keys: string[]): boolean {
  for (const key of keys) {
    const value = data[key];
    if (value === true || value === "true" || value === 1) return true;
  }
  return false;
}

function pickString(data: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

/** Normalize profile.compliance and legacy snake_case / nested shapes. */
export function normalizeCompliance(raw: unknown): MemberCompliance {
  const root = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const nested =
    root.compliance && typeof root.compliance === "object"
      ? (root.compliance as Record<string, unknown>)
      : {};
  const data = { ...nested, ...root };

  return {
    tosAccepted: pickBool(data, "tosAccepted", "tos_accepted", "termsAccepted", "terms_accepted"),
    tosAcceptedAt: pickString(data, "tosAcceptedAt", "tos_accepted_at", "termsAcceptedAt"),
    tosVersion: pickString(data, "tosVersion", "tos_version", "termsVersion"),
    privacyAccepted: pickBool(data, "privacyAccepted", "privacy_accepted"),
    privacyAcceptedAt: pickString(data, "privacyAcceptedAt", "privacy_accepted_at"),
    privacyVersion: pickString(data, "privacyVersion", "privacy_version"),
    ageConfirmed18: pickBool(data, "ageConfirmed18", "age_confirmed_18", "ageConfirmed"),
    ageConfirmedAt: pickString(data, "ageConfirmedAt", "age_confirmed_at"),
    safetyPledgeAccepted: pickBool(
      data,
      "safetyPledgeAccepted",
      "safety_pledge_accepted",
      "safetyPledge"
    ),
    safetyPledgeAcceptedAt: pickString(
      data,
      "safetyPledgeAcceptedAt",
      "safety_pledge_accepted_at"
    ),
    safetyPledgeVersion: pickString(data, "safetyPledgeVersion", "safety_pledge_version"),
    adultRiskAcknowledged: pickBool(
      data,
      "adultRiskAcknowledged",
      "adult_risk_acknowledged",
      "adultRiskAccepted"
    ),
    adultRiskAcknowledgedAt: pickString(
      data,
      "adultRiskAcknowledgedAt",
      "adult_risk_acknowledged_at"
    ),
    adultRiskVersion: pickString(data, "adultRiskVersion", "adult_risk_version"),
    offlineSafetyAcknowledged: pickBool(
      data,
      "offlineSafetyAcknowledged",
      "offline_safety_acknowledged"
    ),
    offlineSafetyAcknowledgedAt: pickString(
      data,
      "offlineSafetyAcknowledgedAt",
      "offline_safety_acknowledged_at"
    ),
    offlineSafetyVersion: pickString(data, "offlineSafetyVersion", "offline_safety_version"),
    signupIp: pickString(data, "signupIp", "signup_ip"),
    signupUserAgent: pickString(data, "signupUserAgent", "signup_user_agent")
  };
}

function versionMatches(current: string | undefined, required: string, relaxed?: boolean): boolean {
  if (relaxed) return true;
  return Boolean(current && current === required);
}

export function hasLegalCompliance(
  compliance?: MemberCompliance,
  options?: ComplianceCheckOptions
): boolean {
  if (!compliance) return false;
  const relaxed = options?.relaxed;
  return Boolean(
    compliance.tosAccepted &&
      versionMatches(compliance.tosVersion, TERMS_VERSION, relaxed) &&
      compliance.privacyAccepted &&
      versionMatches(compliance.privacyVersion, PRIVACY_VERSION, relaxed) &&
      compliance.ageConfirmed18 &&
      compliance.ageConfirmedAt
  );
}

export function hasSafetyPledge(
  compliance?: MemberCompliance,
  options?: ComplianceCheckOptions
): boolean {
  if (!compliance) return false;
  const relaxed = options?.relaxed;
  if (relaxed) {
    return Boolean(compliance.safetyPledgeAccepted && compliance.safetyPledgeAcceptedAt);
  }
  return Boolean(
    compliance.safetyPledgeAccepted &&
      versionMatches(compliance.safetyPledgeVersion, SAFETY_PLEDGE_VERSION, relaxed) &&
      compliance.safetyPledgeAcceptedAt
  );
}

export function hasAdultRiskAck(
  compliance?: MemberCompliance,
  options?: ComplianceCheckOptions
): boolean {
  if (!compliance) return false;
  const relaxed = options?.relaxed;
  if (relaxed) {
    return Boolean(compliance.adultRiskAcknowledged && compliance.adultRiskAcknowledgedAt);
  }
  return Boolean(
    compliance.adultRiskAcknowledged &&
      versionMatches(compliance.adultRiskVersion, ADULT_RISK_VERSION, relaxed) &&
      compliance.adultRiskAcknowledgedAt
  );
}

export function hasOfflineSafetyAck(compliance?: MemberCompliance): boolean {
  if (!compliance) return false;
  return Boolean(
    compliance.offlineSafetyAcknowledged &&
      compliance.offlineSafetyVersion === OFFLINE_SAFETY_VERSION &&
      compliance.offlineSafetyAcknowledgedAt
  );
}

export type ComplianceGatePhase = "none" | "legal" | "pledge" | "adult_risk";

export function complianceGatePhase(
  compliance?: MemberCompliance,
  options?: ComplianceCheckOptions
): ComplianceGatePhase {
  if (!hasLegalCompliance(compliance, options)) return "legal";
  if (!hasSafetyPledge(compliance, options)) return "pledge";
  if (!hasAdultRiskAck(compliance, options)) return "adult_risk";
  return "none";
}

/** Single source of truth for route guards and compliance modals. */
export function isComplianceComplete(compliance?: MemberCompliance): boolean {
  return complianceGatePhase(compliance) === "none";
}

export function complianceVersionBundle(): string {
  return [TERMS_VERSION, PRIVACY_VERSION, SAFETY_PLEDGE_VERSION, ADULT_RISK_VERSION].join("|");
}

export function resolveComplianceUserKey(
  user?: Pick<UserProfile, "email" | "phone" | "username">
): string {
  const email = String(user?.email || "")
    .trim()
    .toLowerCase();
  if (email.includes("@") && !email.includes("@phone.bamsignal.local")) {
    return `email:${email}`;
  }
  const phone = String(user?.phone || "").replace(/\D/g, "");
  if (phone) return `phone:${phone}`;
  const username = normalizeUsername(user?.username || "");
  if (username) return `username:${username}`;
  return "";
}

export function readComplianceDoneMarker(userKey = ""): string | null {
  if (!userKey) return null;
  try {
    return localStorage.getItem(`${COMPLIANCE_DONE_MARKER_PREFIX}${userKey}`);
  } catch {
    return null;
  }
}

export function writeComplianceDoneMarker(userKey = ""): void {
  if (!userKey) return;
  try {
    localStorage.setItem(`${COMPLIANCE_DONE_MARKER_PREFIX}${userKey}`, complianceVersionBundle());
  } catch {
    /* ignore */
  }
}

export function hasComplianceDoneMarker(userKey = ""): boolean {
  return readComplianceDoneMarker(userKey) === complianceVersionBundle();
}

export function isComplianceCompleteForUser(
  compliance?: MemberCompliance,
  userKey = ""
): boolean {
  if (isComplianceComplete(compliance)) return true;
  return Boolean(userKey && hasComplianceDoneMarker(userKey));
}

export function allGateAckTypes(): ComplianceAckType[] {
  return [...ALL_GATE_ACK_TYPES];
}

export function hasComplianceSyncPending(): boolean {
  try {
    return localStorage.getItem(COMPLIANCE_SYNC_PENDING_KEY) === "1";
  } catch {
    return false;
  }
}

export function readPendingComplianceAcks(): ComplianceAckType[] {
  try {
    const raw = localStorage.getItem(COMPLIANCE_PENDING_ACKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ComplianceAckType[]) : [];
  } catch {
    return [];
  }
}

export function setComplianceSyncPending(ackTypes: ComplianceAckType[]): void {
  try {
    localStorage.setItem(COMPLIANCE_SYNC_PENDING_KEY, "1");
    const existing = new Set(readPendingComplianceAcks());
    for (const type of ackTypes) existing.add(type);
    localStorage.setItem(COMPLIANCE_PENDING_ACKS_KEY, JSON.stringify([...existing]));
  } catch {
    /* ignore */
  }
}

export function clearComplianceSyncPending(): void {
  try {
    localStorage.removeItem(COMPLIANCE_SYNC_PENDING_KEY);
    localStorage.removeItem(COMPLIANCE_PENDING_ACKS_KEY);
  } catch {
    /* ignore */
  }
}

/** Allow Home when sync is pending but the user has locally accepted required gates. */
export function isLocalComplianceSufficient(compliance?: MemberCompliance): boolean {
  return complianceGatePhase(compliance, { relaxed: true }) === "none";
}

export function shouldBlockForCompliance(
  compliance?: MemberCompliance,
  userKey = ""
): boolean {
  if (isComplianceCompleteForUser(compliance, userKey)) return false;
  if (hasComplianceSyncPending() && isLocalComplianceSufficient(compliance)) return false;
  return true;
}

function pickNewerIso(a?: string, b?: string): string | undefined {
  if (!a) return b;
  if (!b) return a;
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
}

function mergeBool(a?: boolean, b?: boolean): boolean {
  return Boolean(a || b);
}

function mergeVersion(local?: string, remote?: string, localAt?: string, remoteAt?: string): string | undefined {
  if (!local) return remote;
  if (!remote) return local;
  const localTime = localAt ? new Date(localAt).getTime() : 0;
  const remoteTime = remoteAt ? new Date(remoteAt).getTime() : 0;
  return remoteTime >= localTime ? remote : local;
}

/** Merge local + remote compliance without letting stale remote wipe fresh local acks. */
export function mergeMemberCompliance(localRaw?: unknown, remoteRaw?: unknown): MemberCompliance {
  const local = normalizeCompliance(localRaw);
  const remote = normalizeCompliance(remoteRaw);

  const merged: MemberCompliance = {
    tosAccepted: mergeBool(local.tosAccepted, remote.tosAccepted),
    tosAcceptedAt: pickNewerIso(local.tosAcceptedAt, remote.tosAcceptedAt),
    tosVersion: mergeVersion(
      local.tosVersion,
      remote.tosVersion,
      local.tosAcceptedAt,
      remote.tosAcceptedAt
    ),
    privacyAccepted: mergeBool(local.privacyAccepted, remote.privacyAccepted),
    privacyAcceptedAt: pickNewerIso(local.privacyAcceptedAt, remote.privacyAcceptedAt),
    privacyVersion: mergeVersion(
      local.privacyVersion,
      remote.privacyVersion,
      local.privacyAcceptedAt,
      remote.privacyAcceptedAt
    ),
    ageConfirmed18: mergeBool(local.ageConfirmed18, remote.ageConfirmed18),
    ageConfirmedAt: pickNewerIso(local.ageConfirmedAt, remote.ageConfirmedAt),
    safetyPledgeAccepted: mergeBool(local.safetyPledgeAccepted, remote.safetyPledgeAccepted),
    safetyPledgeAcceptedAt: pickNewerIso(
      local.safetyPledgeAcceptedAt,
      remote.safetyPledgeAcceptedAt
    ),
    safetyPledgeVersion: mergeVersion(
      local.safetyPledgeVersion,
      remote.safetyPledgeVersion,
      local.safetyPledgeAcceptedAt,
      remote.safetyPledgeAcceptedAt
    ),
    adultRiskAcknowledged: mergeBool(local.adultRiskAcknowledged, remote.adultRiskAcknowledged),
    adultRiskAcknowledgedAt: pickNewerIso(
      local.adultRiskAcknowledgedAt,
      remote.adultRiskAcknowledgedAt
    ),
    adultRiskVersion: mergeVersion(
      local.adultRiskVersion,
      remote.adultRiskVersion,
      local.adultRiskAcknowledgedAt,
      remote.adultRiskAcknowledgedAt
    ),
    offlineSafetyAcknowledged: mergeBool(
      local.offlineSafetyAcknowledged,
      remote.offlineSafetyAcknowledged
    ),
    offlineSafetyAcknowledgedAt: pickNewerIso(
      local.offlineSafetyAcknowledgedAt,
      remote.offlineSafetyAcknowledgedAt
    ),
    offlineSafetyVersion: mergeVersion(
      local.offlineSafetyVersion,
      remote.offlineSafetyVersion,
      local.offlineSafetyAcknowledgedAt,
      remote.offlineSafetyAcknowledgedAt
    ),
    signupIp: local.signupIp || remote.signupIp,
    signupUserAgent: local.signupUserAgent || remote.signupUserAgent
  };

  return normalizeCompliance(merged);
}

export function buildCompliancePatch(
  existing: MemberCompliance | undefined,
  ackTypes: ComplianceAckType[],
  serverMeta?: Partial<MemberCompliance>
): MemberCompliance {
  const now = new Date().toISOString();
  const next: MemberCompliance = mergeMemberCompliance(existing, serverMeta);

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
  if (ackTypes.includes("adult_risk")) {
    next.adultRiskAcknowledged = true;
    next.adultRiskAcknowledgedAt = now;
    next.adultRiskVersion = ADULT_RISK_VERSION;
  }
  if (ackTypes.includes("offline_safety")) {
    next.offlineSafetyAcknowledged = true;
    next.offlineSafetyAcknowledgedAt = now;
    next.offlineSafetyVersion = OFFLINE_SAFETY_VERSION;
  }

  if (serverMeta?.signupIp) next.signupIp = serverMeta.signupIp;
  if (serverMeta?.signupUserAgent) next.signupUserAgent = serverMeta.signupUserAgent;

  return next;
}

export function signupLegalAckTypes(): ComplianceAckType[] {
  return ["terms", "privacy", "age_18"];
}

export function logComplianceSave(detail: Record<string, unknown>): void {
  if (!import.meta.env.DEV) return;
  console.info("[compliance-save]", detail);
}

export function logComplianceRoute(detail: Record<string, unknown>): void {
  if (!import.meta.env.DEV) return;
  console.info("[route-decision]", detail);
}
