import type { UserProfile } from "../types";
import { readResponseJson } from "../utils/httpJson";
import { isPremiumTrialActive } from "../utils/premiumTrial";
import { apiUrl } from "./supabase";

type PremiumSnapshot = {
  isPremium: boolean;
  premiumUntil: string | null;
};

let snapshot: PremiumSnapshot = { isPremium: false, premiumUntil: null };

export function setPremiumSnapshot(premium: PremiumSnapshot): void {
  snapshot = {
    isPremium: Boolean(premium.isPremium),
    premiumUntil: premium.premiumUntil || null
  };
}

export function getPremiumSnapshot(): PremiumSnapshot {
  return snapshot;
}

export function isPremiumActive(): boolean {
  if (isPremiumTrialActive()) return true;
  if (snapshot.premiumUntil) {
    return new Date(snapshot.premiumUntil).getTime() > Date.now();
  }
  return snapshot.isPremium;
}

export async function refreshPremiumStatus(
  user: Pick<UserProfile, "email" | "phone">
): Promise<PremiumSnapshot> {
  try {
    const response = await fetch(apiUrl("/api/member/data?action=status"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, phone: user.phone })
    });
    const payload = await readResponseJson<{ ok?: boolean; premium?: PremiumSnapshot }>(response);
    if (response.ok && payload?.ok && payload.premium) {
      setPremiumSnapshot(payload.premium);
      return payload.premium;
    }
  } catch {
    // keep last snapshot
  }
  return getPremiumSnapshot();
}
