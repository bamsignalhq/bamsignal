import type { UserProfile } from "../types";
import { memberApiHeaders } from "../utils/memberApiAuth";
import { readResponseJson } from "../utils/httpJson";
import {
  resolveFastConnectionPassSnapshot,
  resolveSignalPassSnapshot,
  type FastConnectionPassSnapshot,
  type SignalPassSnapshot
} from "../utils/memberEntitlements";
import { getQuickiePassUntil, syncFastConnectionPassFromServer } from "../utils/quickie";
import { pruneExpiredBoosts } from "../utils/activeBoosts";
import {
  hydrateDiscreetHistoryFromServer,
  setDiscreetStatusSnapshot
} from "../utils/discreetMembership";
import { dedupeInflight } from "../utils/inflightPromise";
import { apiUrl } from "./supabase";

type PremiumSnapshot = {
  isPremium: boolean;
  premiumUntil: string | null;
};

export type MemberEntitlementsSnapshot = {
  signalPass: SignalPassSnapshot;
  fastConnectionPass: FastConnectionPassSnapshot;
};

let snapshot: PremiumSnapshot = { isPremium: false, premiumUntil: null };

export function setPremiumSnapshot(premium: PremiumSnapshot): void {
  const resolved = resolveSignalPassSnapshot({
    premiumUntil: premium.premiumUntil,
    isPremium: premium.isPremium,
    includeTrial: false
  });
  snapshot = {
    isPremium: resolved.active,
    premiumUntil: resolved.expiresAt
  };
}

export function getPremiumSnapshot(): PremiumSnapshot {
  return snapshot;
}

/** Signal Pass / subscription only — boosts and Fast Connection never grant this. */
export function isPremiumActive(): boolean {
  return resolveSignalPassSnapshot({
    premiumUntil: snapshot.premiumUntil,
    isPremium: snapshot.isPremium,
    includeTrial: true
  }).active;
}

export function getSignalPassSnapshot(): SignalPassSnapshot {
  return resolveSignalPassSnapshot({
    premiumUntil: snapshot.premiumUntil,
    isPremium: snapshot.isPremium,
    includeTrial: true
  });
}

function applyEntitlementsPayload(payload?: {
  premium?: PremiumSnapshot;
  entitlements?: {
    signalPass?: PremiumSnapshot;
    fastConnectionPass?: { active?: boolean; expiresAt?: string | null };
    experiences?: { discreet?: boolean };
    discreetUntil?: string | null;
  };
  discreetEvents?: Array<{
    id?: string;
    event_type?: string;
    created_at?: string;
    metadata?: { endsAt?: string; renewed?: boolean };
  }>;
}): MemberEntitlementsSnapshot {
  const signalSource = payload?.entitlements?.signalPass || payload?.premium;
  if (signalSource) {
    setPremiumSnapshot(signalSource);
  }

  const passUntil =
    payload?.entitlements?.fastConnectionPass?.expiresAt ||
    (payload?.entitlements?.fastConnectionPass?.active ? getQuickiePassUntil() : null);
  const fastConnectionPass = resolveFastConnectionPassSnapshot(passUntil);
  syncFastConnectionPassFromServer(fastConnectionPass.expiresAt, fastConnectionPass.active);

  const discreetUntil = payload?.entitlements?.discreetUntil || null;
  const discreetActive = Boolean(payload?.entitlements?.experiences?.discreet) ||
    Boolean(discreetUntil && new Date(discreetUntil).getTime() > Date.now());
  setDiscreetStatusSnapshot({
    active: discreetActive,
    discreetUntil: discreetActive ? discreetUntil : discreetUntil
  });
  if (Array.isArray(payload?.discreetEvents)) {
    hydrateDiscreetHistoryFromServer(payload.discreetEvents);
  }

  pruneExpiredBoosts();

  return {
    signalPass: getSignalPassSnapshot(),
    fastConnectionPass: resolveFastConnectionPassSnapshot(getQuickiePassUntil())
  };
}

export async function refreshPremiumStatus(
  user: Pick<UserProfile, "email" | "phone">
): Promise<PremiumSnapshot> {
  const cacheKey = `premium-status:${user.email || ""}:${user.phone || ""}`;
  return dedupeInflight(cacheKey, async () => {
    try {
      const response = await fetch(apiUrl("/api/member/data?action=status"), {
        method: "POST",
        headers: await memberApiHeaders(),
        body: JSON.stringify({ email: user.email, phone: user.phone })
      });
      const payload = await readResponseJson<{
        ok?: boolean;
        premium?: PremiumSnapshot;
        entitlements?: {
          signalPass?: PremiumSnapshot;
          fastConnectionPass?: { active?: boolean; expiresAt?: string | null };
          experiences?: { discreet?: boolean };
          discreetUntil?: string | null;
        };
        discreetEvents?: Array<{
          id?: string;
          event_type?: string;
          created_at?: string;
          metadata?: { endsAt?: string; renewed?: boolean };
        }>;
      }>(response);
      if (response.ok && payload?.ok) {
        applyEntitlementsPayload(payload);
        return getPremiumSnapshot();
      }
    } catch {
      // keep last snapshot
    }

    pruneExpiredBoosts();
    const resolved = resolveSignalPassSnapshot({
      premiumUntil: snapshot.premiumUntil,
      isPremium: snapshot.isPremium,
      includeTrial: false
    });
    snapshot = { isPremium: resolved.active, premiumUntil: resolved.expiresAt };
    return getPremiumSnapshot();
  });
}

export async function refreshMemberEntitlements(
  user: Pick<UserProfile, "email" | "phone">
): Promise<MemberEntitlementsSnapshot> {
  await refreshPremiumStatus(user);
  return {
    signalPass: getSignalPassSnapshot(),
    fastConnectionPass: resolveFastConnectionPassSnapshot(getQuickiePassUntil())
  };
}

export function hasUnlimitedSignalsAccess(): boolean {
  return getSignalPassSnapshot().active;
}
