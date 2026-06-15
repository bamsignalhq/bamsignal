import { apiUrl, supabase } from "./supabase";

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

async function adminHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const session = await supabase?.auth.getSession();
  const token = session?.data.session?.access_token;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function fetchVerificationSubmissions(
  status?: string
): Promise<ServerVerificationSubmission[]> {
  try {
    const params = new URLSearchParams({ action: "list" });
    if (status) params.set("status", status);
    const response = await fetch(apiUrl(`/api/verify/submissions?${params.toString()}`), {
      method: "GET",
      headers: await adminHeaders(),
      cache: "no-store"
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok || !Array.isArray(payload.submissions)) return [];
    return payload.submissions as ServerVerificationSubmission[];
  } catch {
    return [];
  }
}

export async function reviewVerificationSubmission(input: {
  id: string;
  action: "approve" | "reject";
  rejectReason?: string;
}): Promise<boolean> {
  try {
    const response = await fetch(apiUrl(`/api/verify/submissions?action=${input.action}`), {
      method: "POST",
      headers: await adminHeaders(),
      body: JSON.stringify({
        id: input.id,
        rejectReason: input.rejectReason
      })
    });
    const payload = await response.json().catch(() => null);
    return Boolean(response.ok && payload?.ok);
  } catch {
    return false;
  }
}
