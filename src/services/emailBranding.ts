import {
  DEFAULT_EMAIL_BRANDING,
  type EmailBrandingSettings
} from "../constants/emailBranding";
import { apiUrl } from "./supabase";

function normalize(raw: unknown): EmailBrandingSettings {
  const source = raw && typeof raw === "object" ? (raw as Partial<EmailBrandingSettings>) : {};
  return {
    bannerEnabled: Boolean(source.bannerEnabled),
    bannerImageUrl: String(source.bannerImageUrl || "").trim(),
    bannerLinkUrl: String(source.bannerLinkUrl || "").trim(),
    bannerAltText: String(source.bannerAltText || "").trim()
  };
}

export async function fetchEmailBranding(): Promise<EmailBrandingSettings> {
  try {
    const response = await fetch(apiUrl("/api/auth/identity?action=email-branding"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store"
    });
    if (response.ok) {
      const payload = await response.json();
      if (payload?.ok) return normalize(payload.value);
    }
  } catch {
    /* offline */
  }
  return DEFAULT_EMAIL_BRANDING;
}

export async function saveEmailBrandingAdmin(
  value: EmailBrandingSettings,
  accessToken?: string
): Promise<{ ok: boolean; value?: EmailBrandingSettings; error?: string }> {
  const normalized = normalize(value);

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const response = await fetch(apiUrl("/api/auth/identity?action=email-branding-save"), {
      method: "POST",
      headers,
      body: JSON.stringify({ value: normalized })
    });
    const payload = await response.json();
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Could not save email branding." };
    }
    return { ok: true, value: normalize(payload.value) };
  } catch {
    return { ok: false, error: "Network error while saving email branding." };
  }
}
