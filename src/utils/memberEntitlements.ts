import type { BoostProductId } from "../constants/boosts";
import { isPremiumTrialActive } from "./premiumTrial";

export type SignalPassSnapshot = {
  active: boolean;
  expiresAt: string | null;
  source: "subscription" | "trial" | null;
};

export type FastConnectionPassSnapshot = {
  active: boolean;
  expiresAt: string | null;
};

export function resolveSignalPassSnapshot(input?: {
  premiumUntil?: string | null;
  isPremium?: boolean;
  includeTrial?: boolean;
}): SignalPassSnapshot {
  const includeTrial = input?.includeTrial !== false;
  if (includeTrial && isPremiumTrialActive()) {
    return { active: true, expiresAt: null, source: "trial" };
  }

  const untilRaw = input?.premiumUntil || null;
  const untilMs = untilRaw ? new Date(untilRaw).getTime() : 0;
  if (Number.isFinite(untilMs) && untilMs > Date.now()) {
    return {
      active: true,
      expiresAt: new Date(untilMs).toISOString(),
      source: "subscription"
    };
  }

  return { active: false, expiresAt: null, source: null };
}

export function resolveFastConnectionPassSnapshot(untilRaw?: string | null): FastConnectionPassSnapshot {
  const untilMs = untilRaw ? new Date(untilRaw).getTime() : 0;
  const active = Number.isFinite(untilMs) && untilMs > Date.now();
  return {
    active,
    expiresAt: active ? new Date(untilMs).toISOString() : null
  };
}

export function hasUnlimitedSignals(signalPass: SignalPassSnapshot): boolean {
  return signalPass.active;
}

export function formatEntitlementUntil(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function boostActiveLabel(productId: BoostProductId, expiresAt: string): string {
  const when = formatEntitlementUntil(expiresAt);
  switch (productId) {
    case "signal-boost":
      return `Boost Visibility active until ${when}`;
    case "profile-boost":
      return `Featured Profile active until ${when}`;
    case "city-boost":
      return `City Boost active until ${when}`;
    case "city-spotlight":
      return `Spotlight active until ${when}`;
    default:
      return `Boost active until ${when}`;
  }
}
