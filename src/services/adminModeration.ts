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

export type AdminReportRow = {
  id: string;
  profileId: string;
  reportedName: string;
  reportedCity: string;
  reporterEmail?: string | null;
  reporterPhone?: string | null;
  reason: string;
  details?: string | null;
  note?: string | null;
  blocked: boolean;
  at: string;
  reportCount: number;
  shadowBanned: boolean;
  status: "pending" | "reviewed" | "action_taken";
};

export async function fetchAdminReports(limit = 200) {
  const result = await adminPostJson<{ reports?: AdminReportRow[]; count?: number }>(
    "/api/admin/moderation?action=list-reports",
    { limit }
  );
  if (!result.ok) return { ok: false as const, reports: [] as AdminReportRow[], error: result.error };
  return { ok: true as const, reports: result.data.reports || [], count: result.data.count };
}

export type ContactLeakAttempt = {
  id: string;
  user_key: string;
  profile_id?: string | null;
  field: string;
  text_hash: string;
  created_at: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
};

export async function fetchContactLeakAttempts(limit = 50) {
  const result = await adminPostJson<{ attempts?: ContactLeakAttempt[]; count?: number }>(
    "/api/admin/moderation?action=list-contact-leaks",
    { limit }
  );
  if (!result.ok) return { ok: false as const, attempts: [] as ContactLeakAttempt[], error: result.error };
  return { ok: true as const, attempts: result.data.attempts || [], count: result.data.count };
}

export type PhotoReviewItem = {
  id: string;
  profileId?: string | null;
  userKey?: string | null;
  memberName: string;
  photoUrl: string;
  photoType: "profile" | "cover";
  photoReviewStatus: "approved" | "pending_review" | "rejected";
  photoRiskFlags: string[];
  rejectReason?: string | null;
  uploadedAt: string;
  photoViolationCount?: number;
};

export async function fetchPhotoReviews(limit = 50) {
  const result = await adminPostJson<{ reviews?: PhotoReviewItem[]; count?: number }>(
    "/api/admin/moderation?action=list-photo-reviews",
    { status: "pending_review", limit }
  );
  if (!result.ok) return { ok: false as const, reviews: [] as PhotoReviewItem[], error: result.error };
  return { ok: true as const, reviews: result.data.reviews || [], count: result.data.count };
}

export async function approvePhotoReviewAdmin(reviewId: string) {
  return adminPostJson<{ ok?: boolean; error?: string }>("/api/admin/moderation?action=approve-photo-review", {
    reviewId
  });
}

export async function rejectPhotoReviewAdmin(reviewId: string, reason: string) {
  return adminPostJson<{ ok?: boolean; error?: string }>("/api/admin/moderation?action=reject-photo-review", {
    reviewId,
    reason
  });
}

export async function deletePhotoReviewAdmin(reviewId: string, reason?: string) {
  return adminPostJson<{ ok?: boolean; error?: string }>("/api/admin/moderation?action=delete-photo-review", {
    reviewId,
    reason: reason || "Deleted instantly by moderator"
  });
}
