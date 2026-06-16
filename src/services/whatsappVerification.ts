import { apiUrl } from "./supabase";
import { USER_MESSAGES } from "../constants/userMessages";
import { normalizeNigerianPhone } from "../utils/authIdentity";
import { readResponseJson } from "../utils/httpJson";

export async function startWhatsappVerification(
  phone: string,
  email?: string
): Promise<{ ok: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(apiUrl("/api/verify/whatsapp/start"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: normalizeNigerianPhone(phone) || phone,
        email: email?.trim().toLowerCase() || undefined
      })
    });
    const payload = await readResponseJson<{ ok?: boolean; message?: string; error?: string }>(response);
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || USER_MESSAGES.otpSendFailed };
    }
    return { ok: true, message: payload.message || "Code sent on WhatsApp." };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[bamsignal] whatsapp otp send failed", error);
    }
    return { ok: false, error: USER_MESSAGES.otpSendFailed };
  }
}

export async function confirmWhatsappVerification(
  phone: string,
  code: string,
  email?: string
): Promise<{ ok: boolean; phoneVerified?: boolean; error?: string; message?: string }> {
  try {
    const response = await fetch(apiUrl("/api/verify/whatsapp/confirm"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: normalizeNigerianPhone(phone) || phone,
        code,
        email: email?.trim().toLowerCase() || undefined
      })
    });
    const payload = await readResponseJson<{ ok?: boolean; message?: string; error?: string }>(response);
    if (!response.ok || !payload?.ok) {
      return {
        ok: false,
        error: payload?.error || USER_MESSAGES.otpVerifyFailed
      };
    }
    return { ok: true, phoneVerified: true, message: payload.message || "Phone verified successfully." };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[bamsignal] whatsapp otp verify failed", error);
    }
    return { ok: false, error: USER_MESSAGES.otpVerifyFailed };
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
    const payload = await readResponseJson<{ ok?: boolean; message?: string; error?: string; status?: string }>(response);
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Couldn't submit verification right now." };
    }
    return { ok: true, status: payload.status || "pending" };
  } catch {
    return { ok: false, error: "Couldn't submit verification right now." };
  }
}
