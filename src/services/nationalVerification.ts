import { apiUrl, supabase } from "./supabase";
import { readResponseJson } from "../utils/httpJson";
import type { PublicVerificationStatus } from "../lib/verification/types";

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (!supabase) return headers;
  let session = (await supabase.auth.getSession()).data.session;
  if (!session?.access_token) {
    const refreshed = await supabase.auth.refreshSession();
    session = refreshed.data.session;
  }
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  return headers;
}

export async function startNationalVerification(input: {
  deviceFingerprint?: string;
} = {}): Promise<{ ok: boolean; status?: PublicVerificationStatus & { challengeId?: string }; error?: string }> {
  try {
    const response = await fetch(apiUrl("/api/verification/start"), {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(input)
    });
    const payload = await readResponseJson<{
      ok?: boolean;
      error?: string;
      sessionId?: string;
      status?: PublicVerificationStatus["status"];
      challengeId?: string;
      messagingUnlocked?: boolean;
      updatedAt?: string;
    }>(response);
    if (!response.ok || !payload?.ok || !payload.sessionId) {
      return { ok: false, error: payload?.error || "Could not start verification." };
    }
    return {
      ok: true,
      status: {
        sessionId: payload.sessionId,
        status: payload.status || "selfie_pending",
        challengeId: payload.challengeId,
        messagingUnlocked: Boolean(payload.messagingUnlocked),
        updatedAt: payload.updatedAt || new Date().toISOString()
      }
    };
  } catch {
    return { ok: false, error: "Could not start verification." };
  }
}

export async function uploadNationalVerificationSelfie(input: {
  sessionId: string;
  selfieDataUrl: string;
}): Promise<{ ok: boolean; status?: PublicVerificationStatus; error?: string }> {
  try {
    const response = await fetch(apiUrl("/api/verification/upload"), {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(input)
    });
    const payload = await readResponseJson<{ ok?: boolean; error?: string; status?: PublicVerificationStatus }>(
      response
    );
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Could not upload selfie." };
    }
    return { ok: true, status: payload.status };
  } catch {
    return { ok: false, error: "Could not upload selfie." };
  }
}

export async function runNationalVerification(input: {
  sessionId: string;
  selfieDataUrl: string;
  profilePhotos?: string[];
  challengeResponse?: string;
  deviceFingerprint?: string;
}): Promise<{ ok: boolean; status?: PublicVerificationStatus; error?: string }> {
  try {
    const response = await fetch(apiUrl("/api/verification/verify"), {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(input)
    });
    const payload = await readResponseJson<{ ok?: boolean; error?: string; status?: PublicVerificationStatus }>(
      response
    );
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Verification failed." };
    }
    return { ok: true, status: payload.status };
  } catch {
    return { ok: false, error: "Verification failed." };
  }
}

export async function fetchNationalVerificationStatus(
  sessionId?: string
): Promise<{ ok: boolean; status?: PublicVerificationStatus | null; error?: string }> {
  try {
    const response = await fetch(apiUrl("/api/verification/status"), {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ sessionId: sessionId || undefined })
    });
    const payload = await readResponseJson<{ ok?: boolean; error?: string; status?: PublicVerificationStatus }>(
      response
    );
    if (!response.ok) {
      return { ok: false, error: payload?.error || "Could not load status." };
    }
    return { ok: true, status: payload?.status || null };
  } catch {
    return { ok: false, error: "Could not load status." };
  }
}
