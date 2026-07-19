import { readResponseJson } from "../utils/httpJson";
import { apiUrl } from "./supabase";
import { appendAdminConsentHeader } from "../utils/adminConsent";

export type ConciergePackageAdmin = {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  priceKobo: number;
  priceLabel?: string;
  active: boolean;
  sortOrder: number;
  benefits: string[];
  regions?: string[];
};

export async function fetchConciergePackagesAdmin(): Promise<{
  packages: ConciergePackageAdmin[];
  consultationFeeNgn?: number;
}> {
  try {
    const response = await fetch(apiUrl("/api/auth/identity?action=concierge-packages"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store"
    });
    if (!response.ok) return { packages: [] };
    const payload = await readResponseJson<{
      ok?: boolean;
      packages?: ConciergePackageAdmin[];
      consultationFeeNgn?: number;
    }>(response);
    return {
      packages: Array.isArray(payload?.packages) ? payload.packages : [],
      consultationFeeNgn: payload?.consultationFeeNgn
    };
  } catch {
    return { packages: [] };
  }
}

export async function saveConciergePackagesAdmin(
  packages: ConciergePackageAdmin[],
  accessToken?: string,
  consultationFeeNgn?: number
): Promise<{ ok: boolean; error?: string; packages?: ConciergePackageAdmin[] }> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const response = await fetch(apiUrl("/api/auth/identity?action=concierge-packages-save"), {
      method: "POST",
      headers: appendAdminConsentHeader(headers),
      body: JSON.stringify({ packages, consultationFeeNgn })
    });
    const payload = await readResponseJson<{
      ok?: boolean;
      error?: string;
      packages?: ConciergePackageAdmin[];
    }>(response);
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Could not save Concierge packages." };
    }
    return { ok: true, packages: payload.packages || packages };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Save failed."
    };
  }
}
