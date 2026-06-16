import { apiUrl } from "./supabase";
import { normalizeUsername } from "../utils/authIdentity";

type SendCodeResponse = { ok: boolean; email?: string; error?: string };
type VerifyCodeResponse = { ok: boolean; email?: string; error?: string };

export class AuthEmailError extends Error {
  readonly kind: "network" | "server" | "validation" | "rate_limit" | "exists";
  readonly field?: "email" | "phone" | "username";

  constructor(
    message: string,
    kind: AuthEmailError["kind"] = "server",
    field?: AuthEmailError["field"]
  ) {
    super(message);
    this.name = "AuthEmailError";
    this.kind = kind;
    this.field = field;
  }
}

async function readApiResponse<T extends { ok?: boolean; error?: string; field?: string }>(
  response: Response,
  fallbackError: string
): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  let payload: T | null = null;

  if (contentType.includes("application/json")) {
    payload = (await response.json().catch(() => null)) as T | null;
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
    if (response.status === 429) {
      throw new AuthEmailError(message, "rate_limit");
    }
    if (response.status === 409 || /already exists|already taken|already linked/i.test(message)) {
      const field = payload?.field as AuthEmailError["field"] | undefined;
      throw new AuthEmailError(message, "exists", field);
    }
    if (response.status === 400) {
      throw new AuthEmailError(message, "validation");
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

export async function sendSignupEmailCode(
  email: string,
  name: string,
  identity?: { phone: string; username: string }
): Promise<SendCodeResponse> {
  const response = await postEmailCode({
    action: "send",
    email,
    name,
    phone: identity?.phone || "",
    username: identity?.username || ""
  });
  return readApiResponse<SendCodeResponse>(
    response,
    "We couldn't send the code right now. Wait a minute and try again, or check your spam folder."
  );
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
  return readApiResponse<VerifyCodeResponse>(
    response,
    "We couldn't finish creating your account. Try again shortly."
  );
}

/** Resolve username → email for login on fresh installs (Play review, new devices). */
export async function resolveLoginEmail(username: string): Promise<string | null> {
  const normalized = normalizeUsername(username);
  if (!normalized) return null;

  try {
    const response = await fetch(apiUrl("/api/member/data?action=resolve-username"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: normalized })
    });
    const payload = (await response.json().catch(() => null)) as { ok?: boolean; email?: string } | null;
    if (!response.ok || !payload?.ok || !payload.email) return null;
    return payload.email.trim().toLowerCase();
  } catch {
    return null;
  }
}
