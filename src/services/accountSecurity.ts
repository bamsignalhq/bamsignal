import type { UserProfile } from "../types";
import { resolveMemberIdentity } from "../utils/authIdentity";
import { apiUrl } from "./supabase";
import { memberApiHeaders } from "../utils/memberApiAuth";
import { readResponseJson } from "../utils/httpJson";
import { getTrustedDeviceId } from "../utils/deviceTrust";

export type SecuritySettings = {
  twoFactorEnabled: boolean;
  twoFactorMethod: "email" | "whatsapp";
  whatsappAvailable: boolean;
  trustedDeviceCount: number;
  last2faAt?: string | null;
  twoFactorUpdatedAt?: string | null;
};

type LoginCheck = {
  required?: boolean;
  method?: "email" | "whatsapp";
  maskedEmail?: string | null;
  maskedPhone?: string | null;
};

type SecurityApiResult<T = Record<string, unknown>> = {
  ok: boolean;
  error?: string;
} & T;

function resolvedUser(user: Pick<UserProfile, "email" | "phone" | "username">) {
  return resolveMemberIdentity(user);
}

async function postMemberSecurity(
  user: Pick<UserProfile, "email" | "phone" | "username">,
  action: string,
  body: Record<string, unknown> = {}
): Promise<SecurityApiResult> {
  const identity = resolvedUser(user);
  const response = await fetch(apiUrl(`/api/member/data?action=${action}`), {
    method: "POST",
    headers: await memberApiHeaders(),
    body: JSON.stringify({
      email: identity.email,
      phone: identity.phone,
      username: identity.username,
      ...body
    })
  });
  const payload = (await readResponseJson<SecurityApiResult>(response)) ?? { ok: false };
  if (!response.ok || payload.ok === false) {
    return {
      ok: false,
      error: payload.error || "We couldn't update login protection right now."
    };
  }
  return payload;
}

async function postLoginSecurity(
  user: Pick<UserProfile, "email" | "phone">,
  action: string,
  body: Record<string, unknown> = {}
) {
  const identity = resolvedUser(user);
  const response = await fetch(apiUrl(`/api/auth/login-security?action=${action}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: identity.email,
      phone: identity.phone,
      deviceId: getTrustedDeviceId(),
      ...body
    })
  });
  return readResponseJson<Record<string, unknown>>(response);
}

export async function fetchSecuritySettingsRemote(
  user: Pick<UserProfile, "email" | "phone" | "username">
): Promise<{ settings: SecuritySettings | null; error?: string }> {
  const payload = await postMemberSecurity(user, "security-settings");
  if (!payload.ok) {
    return { settings: null, error: payload.error };
  }
  return { settings: (payload.settings as SecuritySettings | undefined) ?? null };
}

export async function setTwoFactorRemote(
  user: Pick<UserProfile, "email" | "phone" | "username">,
  enabled: boolean,
  method: "email" | "whatsapp" = "email"
) {
  return postMemberSecurity(user, "two-factor-enable", { enabled, method });
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
  const identity = resolvedUser(user);
  const response = await fetch(apiUrl("/api/auth/login-security?action=login-2fa-send"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: identity.email,
      phone: identity.phone,
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
  const identity = resolvedUser(user);
  const response = await fetch(apiUrl("/api/auth/login-security?action=login-2fa-verify"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: identity.email,
      phone: identity.phone,
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
