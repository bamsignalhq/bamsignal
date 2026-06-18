import { isDatabaseReady, query } from "../db.js";
import { ensureMemberProfilesTable } from "../cityHome.js";
import { ensureComplianceSchema } from "./compliance.js";
import { listAuditLogsForUser } from "./auditLog.js";

export async function fetchMemberComplianceAdmin(profileId) {
  if (!isDatabaseReady() || !profileId) return null;
  await ensureMemberProfilesTable();
  await ensureComplianceSchema();

  const result = await query(
    `select id, user_key, email, phone, name, username, profile,
            account_status, account_deleted_at, account_delete_scheduled_for,
            two_factor_enabled, two_factor_method, last_2fa_at,
            created_at, updated_at
     from app_member_profiles
     where id = $1::uuid
     limit 1`,
    [profileId]
  );
  const row = result.rows[0];
  if (!row) return null;

  const profile = row.profile && typeof row.profile === "object" ? row.profile : {};
  const compliance = profile.compliance && typeof profile.compliance === "object" ? profile.compliance : {};

  const acks = await query(
    `select ack_type, version, accepted_at
     from user_compliance_acknowledgements
     where profile_id = $1::uuid
     order by accepted_at desc`,
    [profileId]
  );

  const latestAckByType = {};
  for (const ack of acks.rows) {
    if (!latestAckByType[ack.ack_type]) {
      latestAckByType[ack.ack_type] = {
        version: ack.version,
        acceptedAt: ack.accepted_at
      };
    }
  }

  return {
    id: row.id,
    userKey: row.user_key,
    email: row.email,
    phone: row.phone,
    name: row.name || profile.name || "Member",
    username: row.username,
    accountStatus: row.account_status || "active",
    accountDeletedAt: row.account_deleted_at || null,
    accountDeleteScheduledFor: row.account_delete_scheduled_for || null,
    twoFactorEnabled: Boolean(row.two_factor_enabled),
    twoFactorMethod: row.two_factor_method || null,
    last2faAt: row.last_2fa_at || null,
    compliance: {
      termsAcceptedAt: compliance.tosAcceptedAt || latestAckByType.terms?.acceptedAt || null,
      termsVersion: compliance.tosVersion || latestAckByType.terms?.version || null,
      privacyAcceptedAt: compliance.privacyAcceptedAt || latestAckByType.privacy?.acceptedAt || null,
      privacyVersion: compliance.privacyVersion || latestAckByType.privacy?.version || null,
      ageConfirmedAt: compliance.ageConfirmedAt || latestAckByType.age_18?.acceptedAt || null,
      safetyPledgeAcceptedAt:
        compliance.safetyPledgeAcceptedAt || latestAckByType.safety_pledge?.acceptedAt || null,
      safetyPledgeVersion:
        compliance.safetyPledgeVersion || latestAckByType.safety_pledge?.version || null,
      adultRiskAcknowledgedAt:
        compliance.adultRiskAcknowledgedAt || latestAckByType.adult_risk?.acceptedAt || null,
      offlineSafetyAcknowledgedAt:
        compliance.offlineSafetyAcknowledgedAt || latestAckByType.offline_safety?.acceptedAt || null
    }
  };
}

export async function fetchMemberAuditTrailAdmin(profileId, limit = 100) {
  if (!isDatabaseReady() || !profileId) return [];
  return listAuditLogsForUser(profileId, { limit });
}
