import { readResponseJson } from "../utils/httpJson";
import { apiUrl } from "./supabase";
import { USER_MESSAGES } from "../constants/userMessages";
import { normalizeUsername, isValidSignupUsername } from "../utils/authIdentity";
import type { SignupConflict, SignupConflictField } from "../constants/signupConflicts";
import { conflictMessageFor } from "../constants/signupConflicts";

type SendCodeResponse = { ok: boolean; email?: string; error?: string };
type VerifyCodeResponse = {
  ok: boolean;
  email?: string;
  error?: string;
  code?: string;
  onboardingComplete?: boolean;
  recovered?: boolean;
  memberProfileId?: string;
  session?: LoginResponse["session"];
};

export class AuthEmailError extends Error {
  readonly kind: "network" | "server" | "validation" | "rate_limit" | "exists";
  readonly field?: SignupConflictField;
  readonly code?: string;
  readonly conflicts?: SignupConflict[];
  readonly suggestions?: string[];

  constructor(
    message: string,
    kind: AuthEmailError["kind"] = "server",
    field?: AuthEmailError["field"],
    code?: string,
    extras?: { conflicts?: SignupConflict[]; suggestions?: string[] }
  ) {
    super(message);
    this.name = "AuthEmailError";
    this.kind = kind;
    this.field = field;
    this.code = code;
    this.conflicts = extras?.conflicts;
    this.suggestions = extras?.suggestions;
  }
}

type ApiErrorPayload = {
  ok?: boolean;
  error?: string;
  field?: string;
  code?: string;
  conflicts?: SignupConflict[];
  suggestions?: string[];
};

function normalizeConflicts(
  payload: ApiErrorPayload | null,
  fallbackField?: SignupConflictField
): SignupConflict[] | undefined {
  if (Array.isArray(payload?.conflicts) && payload.conflicts.length > 0) {
    return payload.conflicts
      .filter((item): item is SignupConflict =>
        Boolean(item && (item.field === "email" || item.field === "phone" || item.field === "username"))
      )
      .map((item) => ({
        field: item.field,
        code: item.code,
        message: conflictMessageFor(item.field, item.message)
      }));
  }
  if (fallbackField) {
    return [
      {
        field: fallbackField,
        code: payload?.code,
        message: conflictMessageFor(fallbackField, payload?.error)
      }
    ];
  }
  return undefined;
}

async function readApiResponse<T extends ApiErrorPayload>(
  response: Response,
  fallbackError: string
): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  let payload: T | null = null;

  if (contentType.includes("application/json")) {
    payload = await readResponseJson<T>(response);
  } else {
    const text = await response.text().catch(() => "");
    if (response.status === 503 || response.status === 502) {
      throw new AuthEmailError(
        "We're having trouble creating your account right now. Please try again shortly.",
        "server"
      );
    }
    if (/<!doctype html|<html/i.test(text)) {
      throw new AuthEmailError(
        "We're having trouble creating your account right now. Please try again shortly.",
        "server"
      );
    }
    if (text.trim()) {
      throw new AuthEmailError(text.slice(0, 240), "server");
    }
  }

  if (!response.ok || payload?.ok === false) {
    const message = payload?.error || fallbackError;
    if (payload?.code && import.meta.env.DEV) {
      console.info(`[bamsignal:flow] signup_api_error`, { code: payload.code });
    }
    if (response.status === 429) {
      throw new AuthEmailError(message, "rate_limit");
    }
    if (
      response.status === 409 ||
      /already exists|already taken|already linked|already registered/i.test(message)
    ) {
      const field = payload?.field as AuthEmailError["field"] | undefined;
      const conflicts = normalizeConflicts(payload, field);
      throw new AuthEmailError(message, "exists", field || conflicts?.[0]?.field, payload?.code, {
        conflicts,
        suggestions: Array.isArray(payload?.suggestions) ? payload.suggestions : undefined
      });
    }
    if (response.status === 400) {
      throw new AuthEmailError(
        message,
        "validation",
        payload?.field as AuthEmailError["field"],
        payload?.code
      );
    }
    if (response.status === 503 || /not configured|unavailable/i.test(message)) {
      throw new AuthEmailError(
        message.includes("configured") || message.includes("unavailable")
          ? message
          : "Email verification is temporarily unavailable. Please try again shortly.",
        "server"
      );
    }
    throw new AuthEmailError(message, "server");
  }

  if (!payload) {
    throw new AuthEmailError(fallbackError, "server");
  }

  return payload;
}

async function postEmailCode(body: Record<string, unknown>) {
  let response: Response;
  try {
    response = await fetch(apiUrl("/api/auth/email-code"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "");
    if (/failed to fetch|network|load failed/i.test(message)) {
      throw new AuthEmailError(
        "Unable to connect. Check your internet connection and try again.",
        "network"
      );
    }
    throw new AuthEmailError(
      "We're having trouble creating your account right now. Please try again shortly.",
      "server"
    );
  }

  return response;
}

export async function checkSignupAvailability(input: {
  email: string;
  phone: string;
  username: string;
}): Promise<void> {
  const response = await postEmailCode({
    action: "check",
    email: input.email.trim().toLowerCase(),
    phone: input.phone,
    username: input.username
  });
  await readApiResponse<{ ok: boolean }>(
    response,
    "We couldn't verify your details. Try again shortly."
  );
}

export type SignupFieldCheckResult = {
  available: boolean;
  status?: string;
  suggestions?: string[];
};

export async function checkSignupField(
  field: SignupConflictField,
  value: string
): Promise<SignupFieldCheckResult> {
  const body: Record<string, unknown> = { action: "check", field };
  if (field === "email") body.email = value.trim().toLowerCase();
  if (field === "phone") body.phone = value;
  if (field === "username") body.username = value;

  const response = await postEmailCode(body);
  const payload = await readApiResponse<{
    ok: boolean;
    available?: boolean;
    status?: string;
    suggestions?: string[];
  }>(response, "We couldn't verify your details. Try again shortly.");
  return {
    available: payload.available !== false,
    status: payload.status,
    suggestions: payload.suggestions
  };
}

/** Pick an available username from email when signup collects name in onboarding. */
export async function resolveSignupUsername(email: string): Promise<string> {
  const local = email.trim().toLowerCase().split("@")[0] || "user";
  let base = normalizeUsername(local);
  if (!isValidSignupUsername(base)) {
    base = normalizeUsername(`user${Date.now().toString().slice(-6)}`);
  }
  const candidates = [
    base,
    ...Array.from({ length: 4 }, () =>
      normalizeUsername(`${base.slice(0, 12)}_${Math.floor(Math.random() * 9000 + 1000)}`)
    )
  ];
  for (const candidate of candidates) {
    if (!isValidSignupUsername(candidate)) continue;
    try {
      await checkSignupField("username", candidate);
      return candidate;
    } catch {
      /* try next */
    }
  }
  return normalizeUsername(`bs${Date.now().toString().slice(-8)}`);
}

export async function requestSignupMathChallenge(): Promise<{ token: string; a: number; b: number }> {
  const response = await postEmailCode({ action: "math-challenge" });
  const payload = await readApiResponse<{
    ok?: boolean;
    token: string;
    challengeToken?: string;
    a: number;
    b: number;
  }>(response, "We couldn't load the quick check. Please try again.");
  const token = payload.challengeToken || payload.token;
  return { token, a: Number(payload.a), b: Number(payload.b) };
}

export async function resendSignupEmailCode(
  email: string,
  name: string,
  identity?: { phone: string; username: string }
): Promise<SendCodeResponse> {
  const response = await postEmailCode({
    action: "send",
    resend: true,
    email,
    name,
    phone: identity?.phone || "",
    username: identity?.username || ""
  });
  return readApiResponse<SendCodeResponse>(response, USER_MESSAGES.otpSendFailed);
}

export async function sendSignupEmailCode(
  email: string,
  name: string,
  identity?: { phone: string; username: string },
  options?: { legalAccepted: boolean; mathToken: string; mathAnswer: string }
): Promise<SendCodeResponse> {
  const response = await postEmailCode({
    action: "send",
    email,
    name,
    phone: identity?.phone || "",
    username: identity?.username || "",
    legalAccepted: Boolean(options?.legalAccepted),
    mathToken: options?.mathToken || "",
    mathAnswer: options?.mathAnswer || ""
  });
  return readApiResponse<SendCodeResponse>(response, USER_MESSAGES.otpSendFailed);
}

export async function verifySignupEmailCode(input: {
  email: string;
  code: string;
  password: string;
  name: string;
  username: string;
  phone: string;
}): Promise<VerifyCodeResponse> {
  const response = await postEmailCode({ action: "verify", ...input });
  return readApiResponse<VerifyCodeResponse>(response, USER_MESSAGES.signupCompleteFailed);
}

type LoginResponse = {
  ok?: boolean;
  email?: string;
  error?: string;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
    expires_at?: number;
    token_type?: string;
    user?: unknown;
  };
};

/** Server-side username + PIN verify (source of truth for login). */
export async function loginWithPin(
  username: string,
  pin: string
): Promise<LoginResponse> {
  const normalizedUsername = normalizeUsername(username);
  try {
    const response = await fetch(apiUrl("/api/auth/pin-login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: normalizedUsername, pin })
    });
    const payload = await readResponseJson<LoginResponse>(response);
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Invalid username or PIN." };
    }
    return payload;
  } catch {
    return { ok: false, error: "Unable to connect. Check your internet and try again." };
  }
}

/** @deprecated Use loginWithPin */
export async function loginWithPassword(
  username: string,
  password: string
): Promise<LoginResponse> {
  return loginWithPin(username, password);
}

type PinResetSendResponse = { ok?: boolean; sent?: boolean; email?: string; error?: string };
type PinResetCompleteResponse = { ok?: boolean; username?: string; email?: string; error?: string };

export async function sendPinResetCode(email: string): Promise<PinResetSendResponse> {
  const normalized = email.trim().toLowerCase();
  try {
    const response = await fetch(apiUrl("/api/auth/pin-reset?action=send"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalized })
    });
    return readApiResponse<PinResetSendResponse>(
      response,
      "We couldn't send the reset code right now. Please try again shortly."
    );
  } catch (error) {
    if (error instanceof AuthEmailError) throw error;
    throw new AuthEmailError("Unable to connect. Check your internet and try again.", "network");
  }
}

export async function completePinReset(
  email: string,
  code: string,
  newPin: string
): Promise<PinResetCompleteResponse> {
  const normalized = email.trim().toLowerCase();
  try {
    const response = await fetch(apiUrl("/api/auth/pin-reset?action=complete"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalized, code, newPin })
    });
    return readApiResponse<PinResetCompleteResponse>(
      response,
      "We couldn't reset your PIN right now. Please try again shortly."
    );
  } catch (error) {
    if (error instanceof AuthEmailError) throw error;
    throw new AuthEmailError("Unable to connect. Check your internet and try again.", "network");
  }
}

type ForgotUsernameSendResponse = {
  ok?: boolean;
  sent?: boolean;
  email?: string;
  message?: string;
  error?: string;
};

type ForgotUsernameCompleteResponse = {
  ok?: boolean;
  username?: string;
  message?: string;
  error?: string;
};

export async function sendForgotUsernameCode(input: {
  email?: string;
  phone?: string;
}): Promise<ForgotUsernameSendResponse> {
  try {
    const response = await fetch(apiUrl("/api/auth/forgot-username?action=send"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: (input.email || "").trim().toLowerCase(),
        phone: input.phone || ""
      })
    });
    return readApiResponse<ForgotUsernameSendResponse>(
      response,
      "We couldn't start username recovery right now. Please try again shortly."
    );
  } catch (error) {
    if (error instanceof AuthEmailError) throw error;
    throw new AuthEmailError("Unable to connect. Check your internet and try again.", "network");
  }
}

export async function completeForgotUsername(input: {
  email?: string;
  phone?: string;
  code: string;
}): Promise<ForgotUsernameCompleteResponse> {
  try {
    const response = await fetch(apiUrl("/api/auth/forgot-username?action=complete"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: (input.email || "").trim().toLowerCase(),
        phone: input.phone || "",
        code: input.code
      })
    });
    return readApiResponse<ForgotUsernameCompleteResponse>(
      response,
      "We couldn't recover your username right now. Please try again shortly."
    );
  } catch (error) {
    if (error instanceof AuthEmailError) throw error;
    throw new AuthEmailError("Unable to connect. Check your internet and try again.", "network");
  }
}
