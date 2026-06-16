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

export async function purgeAdminMember(profileId: string, confirm: string) {
  return adminPostJson<AdminPurgeResult>("/api/admin/members?action=purge", { profileId, confirm });
}
