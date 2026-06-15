import { apiUrl } from "./supabase";
import { normalizeNigerianPhone } from "../utils/authIdentity";

export async function startWhatsappVerification(phone: string): Promise<{ ok: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(apiUrl("/api/verify/whatsapp/start"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: normalizeNigerianPhone(phone) || phone })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "We couldn't send the code right now." };
    }
    return { ok: true, message: payload.message || "Verification code sent." };
  } catch {
    return { ok: false, error: "We couldn't send the code right now." };
  }
}

export async function confirmWhatsappVerification(
  phone: string,
  code: string
): Promise<{ ok: boolean; phoneVerified?: boolean; error?: string }> {
  try {
    const response = await fetch(apiUrl("/api/verify/whatsapp/confirm"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: normalizeNigerianPhone(phone) || phone, code })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) {
      return {
        ok: false,
        error: payload?.error || "That code is not correct. Please check and try again."
      };
    }
    return { ok: true, phoneVerified: true };
  } catch {
    return { ok: false, error: "We couldn't verify that code right now." };
  }
}

export async function submitVerificationSelfie(input: {
  email: string;
  phone: string;
  name: string;
  profilePhoto?: string;
  verificationSelfie: string;
}): Promise<{ ok: boolean; status?: string; error?: string }> {
  try {
    const response = await fetch(apiUrl("/api/verify/submissions?action=submit-selfie"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Couldn't submit verification right now." };
    }
    return { ok: true, status: payload.status || "pending" };
  } catch {
    return { ok: false, error: "Couldn't submit verification right now." };
  }
}
