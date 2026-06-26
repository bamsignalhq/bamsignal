import { apiUrl } from "./supabase";
import { USER_MESSAGES } from "../constants/userMessages";
import { normalizeNigerianPhone } from "../utils/authIdentity";
import { readResponseJson } from "../utils/httpJson";

type VerificationPayload = {
  ok?: boolean;
  message?: string;
  error?: string;
  errorCode?: string;
  requestId?: string;
};

export type WhatsappVerificationResult = {
  ok: boolean;
  message?: string;
  error?: string;
  errorCode?: string;
  requestId?: string;
  phoneVerified?: boolean;
};

let activeStartController: AbortController | null = null;
let activeConfirmController: AbortController | null = null;

function abortActive(controller: AbortController | null) {
  if (controller && !controller.signal.aborted) {
    controller.abort();
  }
}

export async function startWhatsappVerification(
  phone: string,
  email?: string,
  options: { signal?: AbortSignal } = {}
): Promise<WhatsappVerificationResult> {
  abortActive(activeStartController);
  const controller = new AbortController();
  activeStartController = controller;

  const onExternalAbort = () => controller.abort();
  options.signal?.addEventListener("abort", onExternalAbort, { once: true });

  try {
    const response = await fetch(apiUrl("/api/verify/whatsapp/start"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: normalizeNigerianPhone(phone) || phone,
        email: email?.trim().toLowerCase() || undefined
      }),
      signal: controller.signal
    });
    const payload = await readResponseJson<VerificationPayload>(response);
    if (!response.ok || !payload?.ok) {
      return {
        ok: false,
        error: payload?.error || USER_MESSAGES.otpSendFailed,
        errorCode: payload?.errorCode,
        requestId: payload?.requestId
      };
    }
    return {
      ok: true,
      message: payload.message || "Code sent on WhatsApp.",
      requestId: payload.requestId
    };
  } catch (error) {
    if (controller.signal.aborted) {
      return { ok: false, error: "Request cancelled.", errorCode: "cancelled" };
    }
    if (import.meta.env.DEV) {
      console.error("[bamsignal] whatsapp otp send failed", error);
    }
    return { ok: false, error: USER_MESSAGES.otpSendFailed, errorCode: "network_error" };
  } finally {
    options.signal?.removeEventListener("abort", onExternalAbort);
    if (activeStartController === controller) {
      activeStartController = null;
    }
  }
}

export async function confirmWhatsappVerification(
  phone: string,
  code: string,
  email?: string,
  options: { signal?: AbortSignal } = {}
): Promise<WhatsappVerificationResult> {
  abortActive(activeConfirmController);
  const controller = new AbortController();
  activeConfirmController = controller;

  const onExternalAbort = () => controller.abort();
  options.signal?.addEventListener("abort", onExternalAbort, { once: true });

  try {
    const response = await fetch(apiUrl("/api/verify/whatsapp/confirm"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: normalizeNigerianPhone(phone) || phone,
        code,
        email: email?.trim().toLowerCase() || undefined
      }),
      signal: controller.signal
    });
    const payload = await readResponseJson<VerificationPayload>(response);
    if (!response.ok || !payload?.ok) {
      return {
        ok: false,
        error: payload?.error || USER_MESSAGES.otpVerifyFailed,
        errorCode: payload?.errorCode,
        requestId: payload?.requestId
      };
    }
    return {
      ok: true,
      phoneVerified: true,
      message: payload.message || "Phone verified successfully.",
      requestId: payload.requestId
    };
  } catch (error) {
    if (controller.signal.aborted) {
      return { ok: false, error: "Request cancelled.", errorCode: "cancelled" };
    }
    if (import.meta.env.DEV) {
      console.error("[bamsignal] whatsapp otp verify failed", error);
    }
    return { ok: false, error: USER_MESSAGES.otpVerifyFailed, errorCode: "network_error" };
  } finally {
    options.signal?.removeEventListener("abort", onExternalAbort);
    if (activeConfirmController === controller) {
      activeConfirmController = null;
    }
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
