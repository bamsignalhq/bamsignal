import { findEmailByUsername, findMemberProfileByUserKey } from "../cityHome.js";
import { normalizeSignupUsername } from "./signupIdentity.js";
import { resolveSupabaseUrl } from "../supabaseEnv.js";

function loginLog(...args) {
  if (process.env.NODE_ENV === "production") return;
  console.info("[login]", ...args);
}

function resolveAnonKey() {
  return String(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();
}

/** Resolve username to the Supabase auth email used for password login. */
export async function resolveLoginUsername(rawUsername = "") {
  const username = normalizeSignupUsername(String(rawUsername || "").trim().replace(/^@+/, ""));
  loginLog("username received", username || "(empty)");

  if (!username) {
    loginLog("matched user?", false);
    loginLog("profile exists", false);
    return { email: null, username: "", matched: false, profileExists: false };
  }

  const email = await findEmailByUsername(username);
  const member = email ? await findMemberProfileByUserKey(email, null) : null;
  loginLog("matched user?", Boolean(email));
  loginLog("profile exists", Boolean(member?.id));
  return {
    email,
    username,
    matched: Boolean(email),
    profileExists: Boolean(member?.id)
  };
}

/** @deprecated Use resolveLoginUsername — username-only login. */
export async function resolveLoginIdentifier(rawIdentifier = "") {
  return resolveLoginUsername(rawIdentifier);
}

/** Verify password via Supabase password grant (never logs the password). */
export async function verifyLoginPassword(email, password) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const secret = String(password || "");
  if (!normalizedEmail || !secret) {
    loginLog("password compare result", false);
    return { ok: false, session: null, error: "Invalid username or password." };
  }

  const supabaseUrl = resolveSupabaseUrl();
  const anonKey = resolveAnonKey();
  if (!supabaseUrl || !anonKey) {
    loginLog("password compare result", false);
    return { ok: false, session: null, error: "Auth is not configured." };
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: normalizedEmail, password: secret })
    });
    const payload = await response.json().catch(() => ({}));
    const ok = response.ok && Boolean(payload?.access_token);
    loginLog("password compare result", ok);
    if (!ok) {
      return {
        ok: false,
        session: null,
        error: "Invalid username or password."
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
    loginLog("password compare result", false);
    return {
      ok: false,
      session: null,
      error: error instanceof Error ? error.message : "Login failed."
    };
  }
}

/** @deprecated Use verifyLoginPassword */
export async function verifyLoginPin(email, pin) {
  return verifyLoginPassword(email, pin);
}

export async function loginWithUsernameAndPassword(username, password) {
  const resolved = await resolveLoginUsername(username);
  if (!resolved.email) {
    return { ok: false, error: "Invalid username or password.", resolved };
  }
  const verified = await verifyLoginPassword(resolved.email, password);
  return {
    ok: verified.ok,
    email: resolved.email,
    session: verified.session,
    error: verified.ok ? null : verified.error || "Invalid username or password.",
    resolved
  };
}

/** @deprecated Use loginWithUsernameAndPassword */
export async function loginWithIdentifierAndPin(identifier, pin) {
  return loginWithUsernameAndPassword(identifier, pin);
}
