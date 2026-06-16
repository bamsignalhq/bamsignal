import { adminGetJson, adminPostJson } from "../utils/adminApi";

export type ServerVerificationSubmission = {
  id: string;
  user_name: string;
  phone: string;
  email?: string;
  phone_verified: boolean;
  profile_photo?: string;
  verification_selfie?: string;
  status: "pending" | "approved" | "rejected";
  reject_reason?: string;
  submitted_at: string;
};

type ListResponse = { ok?: boolean; submissions?: ServerVerificationSubmission[]; error?: string };
type ReviewResponse = { ok?: boolean; error?: string };

export async function fetchVerificationSubmissions(status?: string) {
  const params = new URLSearchParams({ action: "list" });
  if (status) params.set("status", status);
  return adminGetJson<ListResponse>(`/api/verify/submissions?${params.toString()}`);
}

export async function reviewVerificationSubmission(input: {
  id: string;
  action: "approve" | "reject";
  rejectReason?: string;
}) {
  return adminPostJson<ReviewResponse>(`/api/verify/submissions?action=${input.action}`, {
    id: input.id,
    rejectReason: input.rejectReason
  });
}
