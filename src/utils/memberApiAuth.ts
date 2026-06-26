import { supabase } from "../services/supabase";
import { markStartupPhase } from "./startupInstrumentation";

const HEADER_CACHE_MS = 30_000;
const REFRESH_TIMEOUT_MS = 4_000;

let cachedHeaders: { token: string; expiresAt: number } | null = null;
let headersInFlight: Promise<Record<string, string>> | null = null;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label}_timeout`)), timeoutMs);
    })
  ]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

async function resolveBearerToken(): Promise<string | null> {
  if (!supabase) return null;

  markStartupPhase("member_api_headers");
  const sessionResult = await withTimeout(supabase.auth.getSession(), REFRESH_TIMEOUT_MS, "get_session");
  let session = sessionResult.data.session;

  if (!session?.access_token) {
    const refreshed = await withTimeout(supabase.auth.refreshSession(), REFRESH_TIMEOUT_MS, "refresh_session").catch(
      () => ({ data: { session: null }, error: null })
    );
    session = refreshed.data.session;
  }

  const token = session?.access_token ?? null;
  if (token && session?.expires_at) {
    cachedHeaders = {
      token,
      expiresAt: session.expires_at * 1000
    };
  }
  return token;
}

/** Attach the current Supabase session bearer token for member API calls. */
export async function memberApiHeaders(
  extra: Record<string, string> = {}
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extra
  };

  const now = Date.now();
  if (cachedHeaders && cachedHeaders.expiresAt > now + HEADER_CACHE_MS) {
    headers.Authorization = `Bearer ${cachedHeaders.token}`;
    return headers;
  }

  if (headersInFlight) {
    const shared = await headersInFlight;
    return { ...shared, ...extra };
  }

  headersInFlight = (async () => {
    try {
      const token = await resolveBearerToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...extra
      };
      if (token) headers.Authorization = `Bearer ${token}`;
      return headers;
    } finally {
      headersInFlight = null;
    }
  })();

  return headersInFlight;
}

export function clearMemberApiHeaderCache() {
  cachedHeaders = null;
  headersInFlight = null;
}
