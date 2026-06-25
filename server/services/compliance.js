import { isDatabaseReady, normalizeUserKey, query } from "../db.js";
import { ensureMemberProfilesTable, findMemberProfileByUserKey } from "../cityHome.js";
import { assertSchemaTable } from "./schemaVerification.js";

export const TERMS_VERSION = "2026-06-18";
export const PRIVACY_VERSION = "2026-06-18";
export const SAFETY_PLEDGE_VERSION = "2026-06-18";
export const ADULT_RISK_VERSION = "2026-06-18";
export const OFFLINE_SAFETY_VERSION = "2026-06-18";

const VERSION_BY_TYPE = {
  terms: TERMS_VERSION,
  privacy: PRIVACY_VERSION,
  age_18: TERMS_VERSION,
  safety_pledge: SAFETY_PLEDGE_VERSION,
  adult_risk: ADULT_RISK_VERSION,
  offline_safety: OFFLINE_SAFETY_VERSION
};

const VALID_ACK_TYPES = new Set(Object.keys(VERSION_BY_TYPE));

export async function ensureComplianceSchema() {
  if (!isDatabaseReady()) return;
  await ensureMemberProfilesTable();
  await assertSchemaTable("user_compliance_acknowledgements");
}

function normalizeAckTypes(acks = []) {
  const unique = [];
  for (const raw of acks) {
    const type = String(raw?.type || raw || "").trim();
    if (!VALID_ACK_TYPES.has(type) || unique.includes(type)) continue;
    unique.push(type);
  }
  return unique;
}

function applyAckRowToCompliance(compliance, ackType, version, acceptedAt) {
  const at =
    acceptedAt instanceof Date
      ? acceptedAt.toISOString()
      : typeof acceptedAt === "string"
        ? acceptedAt
        : new Date().toISOString();

  if (ackType === "terms") {
    compliance.tosAccepted = true;
    compliance.tosAcceptedAt = at;
    compliance.tosVersion = version;
  }
  if (ackType === "privacy") {
    compliance.privacyAccepted = true;
    compliance.privacyAcceptedAt = at;
    compliance.privacyVersion = version;
  }
  if (ackType === "age_18") {
    compliance.ageConfirmed18 = true;
    compliance.ageConfirmedAt = at;
  }
  if (ackType === "safety_pledge") {
    compliance.safetyPledgeAccepted = true;
    compliance.safetyPledgeAcceptedAt = at;
    compliance.safetyPledgeVersion = version;
  }
  if (ackType === "adult_risk") {
    compliance.adultRiskAcknowledged = true;
    compliance.adultRiskAcknowledgedAt = at;
    compliance.adultRiskVersion = version;
  }
  if (ackType === "offline_safety") {
    compliance.offlineSafetyAcknowledged = true;
    compliance.offlineSafetyAcknowledgedAt = at;
    compliance.offlineSafetyVersion = version;
  }
}

export function isServerComplianceComplete(compliance = {}) {
  return Boolean(
    compliance.tosAccepted &&
      compliance.tosVersion === TERMS_VERSION &&
      compliance.privacyAccepted &&
      compliance.privacyVersion === PRIVACY_VERSION &&
      compliance.ageConfirmed18 &&
      compliance.ageConfirmedAt &&
      compliance.safetyPledgeAccepted &&
      compliance.safetyPledgeVersion === SAFETY_PLEDGE_VERSION &&
      compliance.safetyPledgeAcceptedAt &&
      compliance.offlineSafetyAcknowledged &&
      compliance.offlineSafetyVersion === OFFLINE_SAFETY_VERSION &&
      compliance.offlineSafetyAcknowledgedAt
  );
}

export async function resolveMemberCompliance(profileId, profileCompliance = {}) {
  const base =
    profileCompliance && typeof profileCompliance === "object" ? { ...profileCompliance } : {};

  if (!profileId || !isDatabaseReady()) return base;

  await ensureComplianceSchema();
  const acks = await query(
    `select distinct on (ack_type) ack_type, version, accepted_at
     from user_compliance_acknowledgements
     where profile_id = $1::uuid
     order by ack_type, accepted_at desc`,
    [profileId]
  );

  for (const row of acks.rows) {
    applyAckRowToCompliance(base, row.ack_type, row.version, row.accepted_at);
  }

  return base;
}

function buildComplianceSummary(existing = {}, ackTypes, { ip, userAgent } = {}) {
  const now = new Date().toISOString();
  const next = { ...existing };

  for (const type of ackTypes) {
    const version = VERSION_BY_TYPE[type];
    if (type === "terms") {
      next.tosAccepted = true;
      next.tosAcceptedAt = now;
      next.tosVersion = version;
    }
    if (type === "privacy") {
      next.privacyAccepted = true;
      next.privacyAcceptedAt = now;
      next.privacyVersion = version;
    }
    if (type === "age_18") {
      next.ageConfirmed18 = true;
      next.ageConfirmedAt = now;
    }
    if (type === "safety_pledge") {
      next.safetyPledgeAccepted = true;
      next.safetyPledgeAcceptedAt = now;
      next.safetyPledgeVersion = version;
    }
    if (type === "adult_risk") {
      next.adultRiskAcknowledged = true;
      next.adultRiskAcknowledgedAt = now;
      next.adultRiskVersion = version;
    }
    if (type === "offline_safety") {
      next.offlineSafetyAcknowledged = true;
      next.offlineSafetyAcknowledgedAt = now;
      next.offlineSafetyVersion = version;
    }
  }

  if (ip && !next.signupIp) next.signupIp = ip;
  if (userAgent && !next.signupUserAgent) next.signupUserAgent = userAgent;

  return next;
}

export async function recordComplianceAcknowledgements({
  email,
  phone,
  acks = [],
  ip = null,
  userAgent = null,
  metadata = {}
}) {
  const ackTypes = normalizeAckTypes(acks);
  if (!ackTypes.length) {
    return { ok: false, error: "No acknowledgements provided." };
  }

  const userKey = normalizeUserKey({ email, phone });
  if (!userKey) {
    return { ok: false, error: "Member identity required." };
  }

  const complianceOnly = buildComplianceSummary({}, ackTypes, { ip, userAgent });

  if (!isDatabaseReady()) {
    return { ok: true, compliance: complianceOnly, dryRun: true };
  }

  await ensureComplianceSchema();
  const member = await findMemberProfileByUserKey(email, phone);
  if (!member?.id) {
    return { ok: false, error: "Member profile not found." };
  }

  const existingProfile =
    member.profile && typeof member.profile === "object" ? member.profile : {};
  const existingCompliance =
    existingProfile.compliance && typeof existingProfile.compliance === "object"
      ? existingProfile.compliance
      : {};
  const compliance = buildComplianceSummary(existingCompliance, ackTypes, { ip, userAgent });
  const nextProfile = { ...existingProfile, compliance };

  for (const type of ackTypes) {
    await query(
      `insert into user_compliance_acknowledgements
         (profile_id, user_key, ack_type, version, ip, user_agent, metadata)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [
        member.id,
        userKey,
        type,
        VERSION_BY_TYPE[type],
        ip || null,
        userAgent || null,
        metadata
      ]
    );
  }

  await query(
    `update app_member_profiles
     set profile = $2::jsonb, updated_at = now()
     where id = $1`,
    [member.id, nextProfile]
  );

  const { writeAuditLog } = await import("./auditLog.js");
  const ackActionByType = {
    terms: "terms_accepted",
    privacy: "privacy_accepted",
    age_18: "age_confirmed",
    safety_pledge: "safety_pledge_accepted",
    adult_risk: "adult_risk_acknowledged",
    offline_safety: "offline_safety_acknowledged"
  };
  for (const type of ackTypes) {
    const auditAction = ackActionByType[type];
    if (!auditAction) continue;
    await writeAuditLog({
      userId: member.id,
      action: auditAction,
      details: { version: VERSION_BY_TYPE[type], ackType: type },
      ip,
      userAgent
    });
  }

  return { ok: true, compliance };
}
