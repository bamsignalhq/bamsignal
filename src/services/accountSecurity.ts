import type { UserProfile } from "../types";
import { apiUrl } from "./supabase";
import { readResponseJson } from "../utils/httpJson";
import { getTrustedDeviceId } from "../utils/deviceTrust";

type SecuritySettings = {
  twoFactorEnabled: boolean;
  twoFactorMethod: "email" | "whatsapp";
  whatsappAvailable: boolean;
  trustedDeviceCount: number;
  last2faAt?: string | null;
};

type LoginCheck = {
  required?: boolean;
  method?: "email" | "whatsapp";
  maskedEmail?: string | null;
  maskedPhone?: string | null;
};

async function postLoginSecurity(
  user: Pick<UserProfile, "email" | "phone">,
  action: string,
  body: Record<string, unknown> = {}
) {
  const response = await fetch(apiUrl(`/api/auth/login-security?action=${action}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.email,
      phone: user.phone,
      deviceId: getTrustedDeviceId(),
      ...body
    })
  });
  return readResponseJson<Record<string, unknown>>(response);
}

export async function fetchSecuritySettingsRemote(
  user: Pick<UserProfile, "email" | "phone">
): Promise<SecuritySettings | null> {
  const payload = await postLoginSecurity(user, "security-settings");
  return (payload?.settings as SecuritySettings | undefined) ?? null;
}

export async function setTwoFactorRemote(
  user: Pick<UserProfile, "email" | "phone">,
  enabled: boolean,
  method: "email" | "whatsapp" = "email"
) {
  const payload = await postLoginSecurity(user, "two-factor-enable", { enabled, method });
  return payload;
}

export async function checkLogin2faRemote(user: Pick<UserProfile, "email" | "phone">): Promise<LoginCheck> {
  const payload = await postLoginSecurity(user, "login-check");
  return {
    required: Boolean(payload?.required),
    method: (payload?.method as LoginCheck["method"]) || "email",
    maskedEmail: (payload?.maskedEmail as string | null) ?? null,
    maskedPhone: (payload?.maskedPhone as string | null) ?? null
  };
}

export async function sendLogin2faRemote(user: Pick<UserProfile, "email" | "phone">) {
  const response = await fetch(apiUrl("/api/auth/login-security?action=login-2fa-send"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.email,
      phone: user.phone,
      deviceId: getTrustedDeviceId()
    })
  });
  const payload = await readResponseJson<{ ok?: boolean; error?: string; method?: string; message?: string }>(
    response
  );
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error || "We couldn't verify this login. Please try again.");
  }
  return payload;
}

export async function verifyLogin2faRemote(
  user: Pick<UserProfile, "email" | "phone">,
  code: string
) {
  const response = await fetch(apiUrl("/api/auth/login-security?action=login-2fa-verify"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.email,
      phone: user.phone,
      deviceId: getTrustedDeviceId(),
      code
    })
  });
  const payload = await readResponseJson<{ ok?: boolean; error?: string }>(response);
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error || "We couldn't verify this login. Please try again.");
  }
  return true;
}
