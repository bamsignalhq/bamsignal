import { adminPostJson } from "../utils/adminApi";

export type ShadowBannedUser = {
  profileId: string;
  userKey: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  username?: string | null;
  city?: string | null;
  shadowBanned: boolean;
  shadowBanReason?: string | null;
  reportCount: number;
  lastReportAt?: string | null;
  accountAgeDays?: number | null;
  paymentStatus: "premium_active" | "premium_lapsed" | "paid_history" | "none";
  isPremium: boolean;
  premiumUntil?: string | null;
  moderationNotes?: string | null;
  shadowBannedAt?: string | null;
  shadowBannedBy?: string | null;
};

type ListResponse = { ok?: boolean; users?: ShadowBannedUser[]; count?: number; error?: string };
type LiftResponse = { ok?: boolean; message?: string; error?: string; profile?: ShadowBannedUser };

export async function fetchShadowBannedUsers() {
  return adminPostJson<ListResponse>("/api/admin/moderation?action=list-shadow-banned", {});
}

export async function liftShadowBanAdmin(profileId: string, reason: string) {
  return adminPostJson<LiftResponse>("/api/admin/moderation?action=lift-shadow-ban", {
    profileId,
    reason
  });
}

export async function shadowBanAdmin(profileId: string, reason: string, moderationNotes?: string) {
  return adminPostJson<LiftResponse>("/api/admin/moderation?action=shadow-ban", {
    profileId,
    reason,
    moderationNotes
  });
}
