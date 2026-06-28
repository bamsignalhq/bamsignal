/**
 * Admin operational health — Service Registry snapshot via authenticated /ready.
 */
import type { AdminHealthSnapshot } from "../components/admin/AdminHealthPanel";
import { apiUrl, supabase } from "../services/supabase";

type RegistryReadyPayload = AdminHealthSnapshot & {
  ok?: boolean;
  ready?: boolean;
  registry?: unknown;
};

export async function fetchAdminHealthSnapshot(): Promise<AdminHealthSnapshot | null> {
  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const response = await fetch(apiUrl("/ready?details=1"), {
      cache: "no-store",
      headers
    });

    if (response.status !== 200 && response.status !== 503) {
      return null;
    }

    const payload = (await response.json()) as RegistryReadyPayload;
    if (typeof payload?.database !== "string") {
      return null;
    }

    return {
      database: payload.database,
      paystack: Boolean(payload.paystack),
      resend: Boolean(payload.resend),
      signupEmail: Boolean(payload.signupEmail),
      sendchamp: Boolean(payload.sendchamp),
      firebase: Boolean(payload.firebase),
      photoStorage: Boolean(payload.photoStorage),
      telegram: Boolean(payload.telegram)
    };
  } catch {
    return null;
  }
}
