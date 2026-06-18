/**
 * Runtime Supabase env resolution for signup email and admin auth.
 * Accepts legacy JWT service_role keys (eyJ…) and new secret keys (sb_secret_…).
 */

function normalizeEnvValue(value = "") {
  return String(value).trim().replace(/^\uFEFF/, "").replace(/^['"]|['"]$/g, "");
}

export function resolveSupabaseUrl() {
  const raw = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  return normalizeEnvValue(raw).replace(/\/$/, "");
}

export function resolveSupabaseServiceKey() {
  const raw =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    "";
  return normalizeEnvValue(raw);
}

/** True for legacy JWT service_role keys and new sb_secret_ API keys. */
export function isSupabaseServiceKeyFormat(key = "") {
  const trimmed = String(key).trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("eyJ")) return true;
  if (trimmed.startsWith("sb_secret_")) return true;
  return trimmed.length >= 20;
}

export function isSignupEmailConfigured() {
  const hasResend = Boolean(normalizeEnvValue(process.env.RESEND_API_KEY || ""));
  const serviceKey = resolveSupabaseServiceKey();
  return Boolean(
    hasResend &&
      serviceKey &&
      isSupabaseServiceKeyFormat(serviceKey) &&
      resolveSupabaseUrl()
  );
}

export function getSignupEmailEnvTrace() {
  const serviceKey = resolveSupabaseServiceKey();
  const hasResend = Boolean(normalizeEnvValue(process.env.RESEND_API_KEY || ""));
  return {
    hasResend,
    hasSupabaseUrl: Boolean(normalizeEnvValue(process.env.SUPABASE_URL || "")),
    hasViteSupabaseUrl: Boolean(normalizeEnvValue(process.env.VITE_SUPABASE_URL || "")),
    hasServiceRoleKey: Boolean(serviceKey),
    hasSecretKeyAlias: Boolean(normalizeEnvValue(process.env.SUPABASE_SECRET_KEY || "")),
    serviceKeyPrefixIsSbSecret: serviceKey.startsWith("sb_secret_"),
    serviceKeyLength: serviceKey.length,
    resolvedUrl: Boolean(resolveSupabaseUrl()),
    validServiceKeyFormat: isSupabaseServiceKeyFormat(serviceKey)
  };
}

/** Safe booleans for /health — shows which gate fails when signupEmail is false. */
export function getSignupEmailHealthTrace() {
  const trace = getSignupEmailEnvTrace();
  return {
    hasResend: trace.hasResend,
    hasServiceRoleKey: trace.hasServiceRoleKey,
    validServiceKeyFormat: trace.validServiceKeyFormat,
    resolvedUrl: trace.resolvedUrl
  };
}

export function logSignupEmailEnvTrace() {
  const trace = getSignupEmailEnvTrace();
  console.info(
    "[bamsignal] signupEmail env trace:",
    JSON.stringify({
      hasResend: trace.hasResend,
      hasSupabaseUrl: trace.hasSupabaseUrl,
      hasViteSupabaseUrl: trace.hasViteSupabaseUrl,
      hasServiceRoleKey: trace.hasServiceRoleKey,
      serviceKeyPrefixIsSbSecret: trace.serviceKeyPrefixIsSbSecret,
      serviceKeyLength: trace.serviceKeyLength,
      resolvedUrl: trace.resolvedUrl,
      validServiceKeyFormat: trace.validServiceKeyFormat,
      signupEmail: isSignupEmailConfigured()
    })
  );

  if (trace.hasServiceRoleKey && !trace.validServiceKeyFormat) {
    console.warn(
      "[bamsignal] SUPABASE_SERVICE_ROLE_KEY is set but does not match eyJ… or sb_secret_… format."
    );
  }

  if (!trace.resolvedUrl && trace.hasServiceRoleKey && process.env.RESEND_API_KEY?.trim()) {
    console.warn(
      "[bamsignal] signupEmail=false — set SUPABASE_URL in Coolify (or VITE_SUPABASE_URL at runtime)."
    );
  }
}

export function supabaseServiceHeaders() {
  const serviceKey = resolveSupabaseServiceKey();
  const url = resolveSupabaseUrl();
  if (!serviceKey || !url || !isSupabaseServiceKeyFormat(serviceKey)) return null;
  return { url, serviceKey };
}

/** Runtime anon key for verifying member JWTs (photo upload API). */
export function resolveSupabaseAnonKey() {
  return normalizeEnvValue(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "");
}

/** Resolve Supabase user id from a member access token. */
export async function verifySupabaseBearerUserId(bearer = "") {
  const token = String(bearer || "").trim();
  if (!token) return null;

  const url = resolveSupabaseUrl();
  const apiKey = resolveSupabaseAnonKey() || resolveSupabaseServiceKey();
  if (!url || !apiKey || !isSupabaseServiceKeyFormat(apiKey)) return null;

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) return null;
  const user = await response.json().catch(() => null);
  return user?.id ? String(user.id) : null;
}
