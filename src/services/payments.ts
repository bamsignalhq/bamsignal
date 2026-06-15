import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import type { PremiumPlan } from "../constants/plans";
import { DEFAULT_PREMIUM_PLANS } from "../constants/plans";
import { STORAGE_KEYS } from "../constants/limits";
import type { UserProfile } from "../types";
import { apiUrl } from "./supabase";

export async function startPlanPayment(
  plan: PremiumPlan,
  user: UserProfile
): Promise<{ ok: boolean; error?: string; reference?: string }> {
  if (!user.email) {
    return { ok: false, error: "Add a verified email before upgrading." };
  }

  try {
    const response = await fetch(apiUrl("/api/paystack/verify?action=initialize"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        phone: user.phone,
        name: user.name,
        days: plan.days,
        amount: plan.price,
        plan: plan.id
      })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok || !payload.authorization_url) {
      return { ok: false, error: payload?.error || "Paystack checkout could not start." };
    }

    if (payload.reference) {
      localStorage.setItem(STORAGE_KEYS.paymentReference, payload.reference);
      localStorage.setItem(STORAGE_KEYS.paymentKind, "premium");
    }

    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url: payload.authorization_url, presentationStyle: "fullscreen" });
    } else {
      window.location.href = payload.authorization_url;
    }

    return { ok: true, reference: payload.reference };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Payment could not start."
    };
  }
}

export function startWeeklyPassPayment(user: UserProfile, plans = DEFAULT_PREMIUM_PLANS) {
  const plan = plans.find((p) => p.id === "weekly") || plans[0];
  return startPlanPayment(plan, user);
}

export function startMonthlyPassPayment(user: UserProfile, plans = DEFAULT_PREMIUM_PLANS) {
  const plan = plans.find((p) => p.id === "monthly") || plans[1] || plans[0];
  return startPlanPayment(plan, user);
}

export function startQuarterlyPassPayment(user: UserProfile, plans = DEFAULT_PREMIUM_PLANS) {
  const plan = plans.find((p) => p.id === "quarterly") || plans[2] || plans[0];
  return startPlanPayment(plan, user);
}

export async function verifyPayment(user: UserProfile): Promise<{
  ok: boolean;
  premiumUntil?: string;
  error?: string;
}> {
  const reference = localStorage.getItem(STORAGE_KEYS.paymentReference)?.trim();
  if (!reference) {
    return { ok: false, error: "No payment reference found." };
  }

  try {
    const response = await fetch(apiUrl("/api/paystack/verify"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        email: user.email,
        phone: user.phone,
        name: user.name
      })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Payment not verified yet." };
    }
    if (payload.premium_until) {
      setPremiumSnapshot({ isPremium: true, premiumUntil: payload.premium_until });
    }
    return { ok: true, premiumUntil: payload.premium_until };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Verification failed."
    };
  }
}

import { setPremiumSnapshot, isPremiumActive, refreshPremiumStatus } from "./premiumStatus";

export { isPremiumActive, refreshPremiumStatus };

export async function startQuickiePassPayment(
  user: UserProfile
): Promise<{ ok: boolean; error?: string; reference?: string }> {
  if (!user.email) {
    return { ok: false, error: "Add a verified email before purchasing a Quickie pass." };
  }

  try {
    const response = await fetch(apiUrl("/api/paystack/verify?action=initialize-quickie"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        phone: user.phone,
        name: user.name,
        amount: 999
      })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok || !payload.authorization_url) {
      return { ok: false, error: payload?.error || "Paystack checkout could not start." };
    }

    if (payload.reference) {
      localStorage.setItem(STORAGE_KEYS.paymentReference, payload.reference);
      localStorage.setItem(STORAGE_KEYS.paymentKind, "quickie");
    }

    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url: payload.authorization_url, presentationStyle: "fullscreen" });
    } else {
      window.location.href = payload.authorization_url;
    }

    return { ok: true, reference: payload.reference };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Payment could not start."
    };
  }
}

export async function verifyQuickiePayment(user: UserProfile): Promise<{ ok: boolean; error?: string }> {
  const reference = localStorage.getItem(STORAGE_KEYS.paymentReference)?.trim();
  if (!reference) {
    return { ok: false, error: "No payment reference found." };
  }

  try {
    const response = await fetch(apiUrl("/api/paystack/verify"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        email: user.email,
        phone: user.phone,
        name: user.name,
        productType: "quickie"
      })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Payment not verified yet." };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Verification failed."
    };
  }
}

export async function startBoostPayment(
  boostId: string,
  price: number,
  user: UserProfile,
  city: string,
  durationHours = 48
): Promise<{ ok: boolean; error?: string; reference?: string }> {
  if (!user.email) {
    return { ok: false, error: "Add a verified email before purchasing a boost." };
  }

  try {
    const response = await fetch(apiUrl("/api/paystack/verify?action=initialize-boost"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        phone: user.phone,
        name: user.name,
        boostId,
        city,
        amount: price,
        durationHours
      })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok || !payload.authorization_url) {
      return { ok: false, error: payload?.error || "Paystack checkout could not start." };
    }

    if (payload.reference) {
      localStorage.setItem(STORAGE_KEYS.paymentReference, payload.reference);
      localStorage.setItem(STORAGE_KEYS.paymentKind, "boost");
    }

    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url: payload.authorization_url, presentationStyle: "fullscreen" });
    } else {
      window.location.href = payload.authorization_url;
    }

    return { ok: true, reference: payload.reference };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Payment could not start."
    };
  }
}

export async function verifyBoostPayment(
  user: UserProfile,
  boostId = "city-boost",
  city = "Lagos"
): Promise<{ ok: boolean; error?: string; expiresAt?: string }> {
  const reference = localStorage.getItem(STORAGE_KEYS.paymentReference)?.trim();
  if (!reference) {
    return { ok: false, error: "No payment reference found." };
  }

  try {
    const response = await fetch(apiUrl("/api/paystack/verify"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        email: user.email,
        phone: user.phone,
        name: user.name,
        productType: "boost",
        boostId,
        city
      })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Payment not verified yet." };
    }
    return { ok: true, expiresAt: payload.expiresAt };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Verification failed."
    };
  }
}
