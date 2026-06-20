import { apiUrl, supabase } from "../services/supabase";

const CONSENT_STORAGE_KEY = "bamsignal_hard_consent";

type StoredConsent = {
  token: string;
  expiresAt: number;
};

const LEGACY_CONSENT_KEY = "bamsignal_admin_consent";

function migrateConsentStorage(): void {
  const legacy = sessionStorage.getItem(LEGACY_CONSENT_KEY);
  if (legacy && !sessionStorage.getItem(CONSENT_STORAGE_KEY)) {
    sessionStorage.setItem(CONSENT_STORAGE_KEY, legacy);
  }
  sessionStorage.removeItem(LEGACY_CONSENT_KEY);
}

export function getAdminConsentToken(): string | null {
  migrateConsentStorage();
  try {
    const raw = sessionStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (!parsed?.token || Date.now() >= parsed.expiresAt) {
      sessionStorage.removeItem(CONSENT_STORAGE_KEY);
      return null;
    }
    return parsed.token;
  } catch {
    return null;
  }
}

export function setAdminConsentToken(token: string, expiresAt: number): void {
  sessionStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ token, expiresAt }));
}

export function clearAdminConsentToken(): void {
  sessionStorage.removeItem(CONSENT_STORAGE_KEY);
}

export async function fetchAdminPinStatus(): Promise<{ ok: boolean; pinConfigured?: boolean; error?: string }> {
  try {
    const session = await supabase?.auth.getSession();
    const token = session?.data.session?.access_token;
    if (!token) return { ok: false, error: "Console session required." };

    const response = await fetch(apiUrl("/api/admin/consent?action=status"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: "{}"
    });
    const payload = await response.json();
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Could not load console PIN status." };
    }
    return { ok: true, pinConfigured: Boolean(payload.pinConfigured) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Network error" };
  }
}

export async function verifyAdminActionPin(pin: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await supabase?.auth.getSession();
    const token = session?.data.session?.access_token;
    if (!token) return { ok: false, error: "Console session required." };

    const response = await fetch(apiUrl("/api/admin/consent?action=verify"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ pin })
    });
    const payload = await response.json();
    if (!response.ok || !payload?.ok || !payload.consentToken) {
      return {
        ok: false,
        error: payload?.error || "Invalid action PIN."
      };
    }
    setAdminConsentToken(payload.consentToken, Number(payload.expiresAt) || Date.now() + 15 * 60 * 1000);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Network error" };
  }
}

export async function rotateAdminActionPin(
  currentPin: string,
  nextPin: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await supabase?.auth.getSession();
    const token = session?.data.session?.access_token;
    if (!token) return { ok: false, error: "Console session required." };

    const response = await fetch(apiUrl("/api/admin/consent?action=rotate-pin"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ currentPin, nextPin })
    });
    const payload = await response.json();
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Could not update console PIN." };
    }
    clearAdminConsentToken();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Network error" };
  }
}

export async function setInitialAdminActionPin(pin: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await supabase?.auth.getSession();
    const token = session?.data.session?.access_token;
    if (!token) return { ok: false, error: "Console session required." };

    const response = await fetch(apiUrl("/api/admin/consent?action=set-pin"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ nextPin: pin })
    });
    const payload = await response.json();
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Could not set console PIN." };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Network error" };
  }
}

export function appendAdminConsentHeader(headers: Record<string, string>): Record<string, string> {
  const consent = getAdminConsentToken();
  if (consent) headers["X-Admin-Consent"] = consent;
  return headers;
}

export function isConsentRequiredError(payload: unknown): boolean {
  return Boolean(
    payload &&
      typeof payload === "object" &&
      "code" in payload &&
      (payload as { code?: string }).code === "consent_required"
  );
}
