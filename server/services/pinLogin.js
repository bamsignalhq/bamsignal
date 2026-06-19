import { findAppUserIdentity } from "../db.js";
import { findEmailByPhone, findEmailByUsername, findMemberProfileByUserKey } from "../cityHome.js";
import {
  normalizeSignupEmail,
  normalizeSignupPhone,
  normalizeSignupUsername
} from "./signupIdentity.js";
import { resolveSupabaseUrl } from "../supabaseEnv.js";

function pinLoginLog(...args) {
  if (process.env.NODE_ENV === "production") return;
  console.info("[pin-login]", ...args);
}

function resolveAnonKey() {
  return String(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();
}

function isLikelyEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function isLikelyPhone(value = "") {
  const digits = String(value).replace(/\D/g, "");
  return digits.length >= 10;
}

/** Resolve username, email, or phone to the Supabase auth email used for PIN login. */
export async function resolveLoginIdentifier(rawIdentifier = "") {
  const received = String(rawIdentifier || "").trim();
  pinLoginLog("identifier received", received || "(empty)");

  if (!received) {
    pinLoginLog("normalized identifier", "(empty)");
    pinLoginLog("matched user?", false);
    pinLoginLog("profile exists", false);
    return { email: null, kind: null, normalized: "" };
  }

  if (isLikelyEmail(received)) {
    const email = normalizeSignupEmail(received);
    pinLoginLog("normalized identifier", email);
    const appUser = await findAppUserIdentity({ email, phone: null });
    const member = await findMemberProfileByUserKey(email, null);
    const matched = Boolean(appUser?.email || member?.email);
    pinLoginLog("matched user?", matched);
    pinLoginLog("profile exists", Boolean(member?.id));
    return { email, kind: "email", normalized: email, matched, profileExists: Boolean(member?.id) };
  }

  if (isLikelyPhone(received)) {
    const phone = normalizeSignupPhone(received);
    pinLoginLog("normalized identifier", phone);
    const email = await findEmailByPhone(phone);
    const member = email ? await findMemberProfileByUserKey(email, phone) : null;
    pinLoginLog("matched user?", Boolean(email));
    pinLoginLog("profile exists", Boolean(member?.id));
    return {
      email,
      kind: "phone",
      normalized: phone,
      matched: Boolean(email),
      profileExists: Boolean(member?.id)
    };
  }

  const username = normalizeSignupUsername(received.replace(/^@+/, ""));
  pinLoginLog("normalized identifier", username);
  const email = await findEmailByUsername(username);
  const member = email ? await findMemberProfileByUserKey(email, null) : null;
  pinLoginLog("matched user?", Boolean(email));
  pinLoginLog("profile exists", Boolean(member?.id));
  return {
    email,
    kind: "username",
    normalized: username,
    matched: Boolean(email),
    profileExists: Boolean(member?.id)
  };
}

/** Verify PIN via Supabase password grant (never logs the PIN). */
export async function verifyLoginPin(email, pin) {
  const normalizedEmail = normalizeSignupEmail(email);
  const password = String(pin || "");
  if (!normalizedEmail || !password) {
    pinLoginLog("pin compare result", false);
    return { ok: false, session: null, error: "Missing credentials." };
  }

  const supabaseUrl = resolveSupabaseUrl();
  const anonKey = resolveAnonKey();
  if (!supabaseUrl || !anonKey) {
    pinLoginLog("pin compare result", false);
    return { ok: false, session: null, error: "Auth is not configured." };
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: normalizedEmail, password })
    });
    const payload = await response.json().catch(() => ({}));
    const ok = response.ok && Boolean(payload?.access_token);
    pinLoginLog("pin compare result", ok);
    if (!ok) {
      return {
        ok: false,
        session: null,
        error: payload?.error_description || payload?.msg || "Invalid credentials."
      };
    }
    return {
      ok: true,
      session: {
        access_token: payload.access_token,
        refresh_token: payload.refresh_token,
        expires_in: payload.expires_in,
        expires_at: payload.expires_at,
        token_type: payload.token_type,
        user: payload.user
      },
      error: null
    };
  } catch (error) {
    pinLoginLog("pin compare result", false);
    return {
      ok: false,
      session: null,
      error: error instanceof Error ? error.message : "Login failed."
    };
  }
}

export async function loginWithIdentifierAndPin(identifier, pin) {
  const resolved = await resolveLoginIdentifier(identifier);
  if (!resolved.email) {
    return { ok: false, error: "Account not found.", resolved };
  }
  const verified = await verifyLoginPin(resolved.email, pin);
  return {
    ok: verified.ok,
    email: resolved.email,
    session: verified.session,
    error: verified.error,
    resolved
  };
}
