/**
 * Runtime Supabase env resolution for signup email and admin auth.
 * Accepts legacy JWT service_role keys (eyJ…) and new secret keys (sb_secret_…).
 */

export function resolveSupabaseUrl() {
  return (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\/$/, "");
}

export function resolveSupabaseServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
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
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      resolveSupabaseServiceKey() &&
      isSupabaseServiceKeyFormat(resolveSupabaseServiceKey()) &&
      resolveSupabaseUrl()
  );
}

export function getSignupEmailEnvTrace() {
  const serviceKey = resolveSupabaseServiceKey();
  return {
    hasSupabaseUrl: Boolean(process.env.SUPABASE_URL?.trim()),
    hasViteSupabaseUrl: Boolean(process.env.VITE_SUPABASE_URL?.trim()),
    hasServiceRoleKey: Boolean(serviceKey),
    serviceKeyPrefixIsSbSecret: serviceKey.startsWith("sb_secret_"),
    serviceKeyLength: serviceKey.length,
    resolvedUrl: Boolean(resolveSupabaseUrl()),
    validServiceKeyFormat: isSupabaseServiceKeyFormat(serviceKey)
  };
}

export function logSignupEmailEnvTrace() {
  const trace = getSignupEmailEnvTrace();
  console.info(
    "[bamsignal] signupEmail env trace:",
    JSON.stringify({
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
