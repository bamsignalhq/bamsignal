import { adminPostJson } from "../utils/adminApi";

export type AdminMemberSummary = {
  id: string;
  userKey: string;
  email?: string;
  phone?: string;
  name: string;
  username?: string;
  city?: string;
  state?: string;
  onboardingComplete: boolean;
  photo: string;
  createdAt?: string;
  updatedAt?: string;
  accountStatus?: string;
  accountDeleteScheduledFor?: string | null;
};

export type AdminMemberCompliance = {
  id: string;
  userKey: string;
  email?: string;
  phone?: string;
  name: string;
  username?: string;
  accountStatus: string;
  accountDeletedAt?: string | null;
  accountDeleteScheduledFor?: string | null;
  twoFactorEnabled: boolean;
  twoFactorMethod?: string | null;
  last2faAt?: string | null;
  compliance: {
    termsAcceptedAt?: string | null;
    termsVersion?: string | null;
    privacyAcceptedAt?: string | null;
    privacyVersion?: string | null;
    ageConfirmedAt?: string | null;
    safetyPledgeAcceptedAt?: string | null;
    safetyPledgeVersion?: string | null;
    adultRiskAcknowledgedAt?: string | null;
    offlineSafetyAcknowledgedAt?: string | null;
  };
};

export type AdminAuditLogRow = {
  id: string;
  user_id?: string | null;
  target_user_id?: string | null;
  operator_id?: string | null;
  action: string;
  details: Record<string, unknown>;
  ip?: string | null;
  user_agent?: string | null;
  created_at: string;
};

export type AdminPurgeResult = {
  ok: boolean;
  error?: string;
  member?: {
    id: string;
    email: string | null;
    phone: string | null;
    username: string | null;
    name: string | null;
  };
  purged?: Record<string, unknown>;
};

type SearchResponse = { ok?: boolean; members?: AdminMemberSummary[]; error?: string };

export async function searchAdminMembers(query: string) {
  return adminPostJson<SearchResponse>("/api/admin/members?action=search", { q: query });
}

export async function fetchAdminMemberCompliance(profileId: string) {
  return adminPostJson<{ ok?: boolean; compliance?: AdminMemberCompliance; error?: string }>(
    "/api/admin/members?action=compliance",
    { profileId }
  );
}

export async function fetchAdminMemberAuditTrail(profileId: string, limit = 100) {
  return adminPostJson<{ ok?: boolean; rows?: AdminAuditLogRow[]; error?: string }>(
    "/api/admin/members?action=audit-trail",
    { profileId, limit }
  );
}

export async function repairAdminMemberOnboarding(profileId: string) {
  return adminPostJson<{
    ok?: boolean;
    completed?: boolean;
    repaired?: boolean;
    nextRoute?: string;
    error?: string;
  }>("/api/admin/members?action=repair-onboarding", { profileId });
}

export async function purgeAdminMember(profileId: string, confirm: string) {
  return adminPostJson<AdminPurgeResult>("/api/admin/members?action=purge", { profileId, confirm });
}
