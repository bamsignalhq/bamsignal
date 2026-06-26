/**
 * Optional connectivity probes for environment validation (never logs secrets).
 */

export async function probePostgres(databaseUrl) {
  if (!databaseUrl?.trim()) {
    return { ok: false, skipped: true, detail: "DATABASE_URL not set" };
  }
  try {
    const pg = await import("pg");
    const client = new pg.default.Client({
      connectionString: databaseUrl,
      connectionTimeoutMillis: 8000
    });
    await client.connect();
    await client.query("SELECT 1 AS ok");
    await client.end();
    return { ok: true, detail: "Postgres reachable" };
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

export async function probeSupabaseRest(supabaseUrl, anonKey) {
  const base = String(supabaseUrl || "").replace(/\/$/, "");
  if (!base) return { ok: false, skipped: true, detail: "SUPABASE_URL not set" };
  try {
    const headers = { Accept: "application/json" };
    if (anonKey?.trim()) headers.apikey = anonKey.trim();
    const response = await fetch(`${base}/rest/v1/`, { method: "GET", headers, signal: AbortSignal.timeout(8000) });
    if (response.status === 401 || response.status === 200 || response.status === 404) {
      return { ok: true, detail: `Supabase REST responded (${response.status})` };
    }
    return { ok: false, detail: `Unexpected status ${response.status}` };
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

export async function probeHttpHead(url, label) {
  if (!url?.trim()) return { ok: false, skipped: true, detail: `${label} URL not set` };
  try {
    const response = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    return { ok: response.ok || response.status < 500, detail: `${label} HTTP ${response.status}` };
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

export async function probePaystackSecret(secretKey) {
  if (!secretKey?.trim()) {
    return { ok: false, skipped: true, detail: "PAYSTACK_SECRET_KEY not set" };
  }
  try {
    const response = await fetch("https://api.paystack.co/balance", {
      headers: { Authorization: `Bearer ${secretKey.trim()}` },
      signal: AbortSignal.timeout(8000)
    });
    if (response.status === 401) {
      return { ok: false, detail: "Paystack rejected secret (401)" };
    }
    return { ok: response.ok, detail: `Paystack API ${response.status}` };
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

export async function probeResend(apiKey) {
  if (!apiKey?.trim()) {
    return { ok: false, skipped: true, detail: "RESEND_API_KEY not set" };
  }
  try {
    const response = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey.trim()}` },
      signal: AbortSignal.timeout(8000)
    });
    if (response.status === 401) {
      return { ok: false, detail: "Resend rejected API key (401)" };
    }
    return { ok: response.ok, detail: `Resend API ${response.status}` };
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

export async function probeSendchamp(apiKey, baseUrl) {
  if (!apiKey?.trim()) {
    return { ok: false, skipped: true, detail: "SENDCHAMP_API_KEY not set" };
  }
  const base = String(baseUrl || "https://api.sendchamp.com/api/v1").replace(/\/$/, "");
  try {
    const response = await fetch(`${base}/status`, {
      headers: { Authorization: `Bearer ${apiKey.trim()}` },
      signal: AbortSignal.timeout(8000)
    });
    return { ok: response.status < 500, detail: `Sendchamp ${response.status}` };
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

export async function runConnectivityProbes(envMap) {
  const results = [];

  results.push({
    group: "database",
    name: "DATABASE_URL",
    ...(await probePostgres(envMap.DATABASE_URL))
  });

  const supabaseUrl = envMap.SUPABASE_URL || envMap.VITE_SUPABASE_URL;
  const anonKey = envMap.SUPABASE_ANON_KEY || envMap.VITE_SUPABASE_ANON_KEY;
  results.push({
    group: "supabase",
    name: "SUPABASE_URL",
    ...(await probeSupabaseRest(supabaseUrl, anonKey))
  });

  results.push({
    group: "payments",
    name: "PAYSTACK_SECRET_KEY",
    ...(await probePaystackSecret(envMap.PAYSTACK_SECRET_KEY))
  });

  results.push({
    group: "email",
    name: "RESEND_API_KEY",
    ...(await probeResend(envMap.RESEND_API_KEY))
  });

  results.push({
    group: "whatsapp",
    name: "SENDCHAMP_API_KEY",
    ...(await probeSendchamp(envMap.SENDCHAMP_API_KEY, envMap.SENDCHAMP_BASE_URL))
  });

  const publicUrl = envMap.PUBLIC_APP_URL || envMap.VITE_PUBLIC_APP_URL;
  results.push({
    group: "application",
    name: "PUBLIC_APP_URL",
    ...(await probeHttpHead(publicUrl, "App"))
  });

  return results;
}
