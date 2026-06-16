import { readResponseJson } from "./httpJson";
import { apiUrl, supabase } from "../services/supabase";
import { getAdminSessionEmail } from "./adminSession";

export type AdminApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

export async function adminAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const session = await supabase?.auth.getSession();
  const token = session?.data.session?.access_token;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function adminPostJson<T>(
  path: string,
  body: Record<string, unknown> = {}
): Promise<AdminApiResult<T>> {
  try {
    const response = await fetch(apiUrl(path), {
      method: "POST",
      headers: await adminAuthHeaders(),
      body: JSON.stringify(body)
    });
    const payload = await readResponseJson<T & { ok?: boolean; error?: string }>(response);
    if (!response.ok || payload?.ok === false) {
      const message =
        (payload && typeof payload === "object" && "error" in payload && String(payload.error)) ||
        `Request failed (${response.status})`;
      if (import.meta.env.DEV) {
        console.warn("[bamsignal:admin-api]", path, message, getAdminSessionEmail());
      }
      return { ok: false, error: message, status: response.status };
    }
    return { ok: true, data: payload as T };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return { ok: false, error: message };
  }
}

export async function adminGetJson<T>(path: string): Promise<AdminApiResult<T>> {
  try {
    const response = await fetch(apiUrl(path), {
      method: "GET",
      headers: await adminAuthHeaders(),
      cache: "no-store"
    });
    const payload = await readResponseJson<T & { ok?: boolean; error?: string }>(response);
    if (!response.ok || payload?.ok === false) {
      const message =
        (payload && typeof payload === "object" && "error" in payload && String(payload.error)) ||
        `Request failed (${response.status})`;
      return { ok: false, error: message, status: response.status };
    }
    return { ok: true, data: payload as T };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return { ok: false, error: message };
  }
}
