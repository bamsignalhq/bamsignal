import { isDatabaseReady, normalizeUserKey, query } from "../db.js";
import { ensureMemberProfilesTable, findMemberProfileByUserKey } from "../cityHome.js";

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
  await query(`
    create table if not exists user_compliance_acknowledgements (
      id uuid primary key default gen_random_uuid(),
      profile_id uuid references app_member_profiles(id) on delete cascade,
      user_key text not null,
      ack_type text not null,
      version text not null,
      accepted_at timestamptz not null default now(),
      ip text,
      user_agent text,
      metadata jsonb not null default '{}'::jsonb
    )
  `);
  await query(
    "create index if not exists user_compliance_user_key_idx on user_compliance_acknowledgements (user_key, ack_type, accepted_at desc)"
  );
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
