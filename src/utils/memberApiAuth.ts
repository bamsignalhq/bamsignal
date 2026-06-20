import { supabase } from "../services/supabase";

/** Attach the current Supabase session bearer token for member API calls. */
export async function memberApiHeaders(
  extra: Record<string, string> = {}
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extra
  };
  if (!supabase) return headers;

  let session = (await supabase.auth.getSession()).data.session;
  if (!session?.access_token) {
    const refreshed = await supabase.auth.refreshSession();
    session = refreshed.data.session;
  }

  const token = session?.access_token;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}
