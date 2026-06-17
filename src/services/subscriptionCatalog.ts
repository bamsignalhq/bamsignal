import type { PremiumPlanInput } from "../constants/plans";
import { apiUrl } from "./supabase";
import { readResponseJson } from "../utils/httpJson";
import { appendAdminConsentHeader } from "../utils/adminConsent";
import { supabase } from "./supabase";

export type SubscriptionProductPlan = {
  id: string;
  name: string;
  price: number;
  days: number;
  active?: boolean;
  highlight?: string;
  sortOrder?: number;
};

export type SubscriptionProduct = {
  id: string;
  active: boolean;
  name: string;
  description: string;
  badgeText?: string;
  visibility: "public" | "hidden";
  sortOrder: number;
  features: string[];
  plans: SubscriptionProductPlan[];
};

export type SubscriptionCatalog = {
  contactExchangePolicy: {
    freeLimit: number;
    windowDays: number;
  };
  products: SubscriptionProduct[];
};

export async function fetchSubscriptionCatalog(): Promise<SubscriptionCatalog | null> {
  const response = await fetch(apiUrl("/api/member/data?action=subscription-catalog"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
  const payload = await readResponseJson<{ ok?: boolean; catalog?: SubscriptionCatalog }>(response);
  return payload?.catalog || null;
}

export async function saveSubscriptionCatalogAdmin(
  catalog: SubscriptionCatalog,
  token?: string
): Promise<{ ok: boolean; error?: string }> {
  const headers = await appendAdminConsentHeader({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  });
  const response = await fetch(apiUrl("/api/auth/identity?action=subscription-catalog-save"), {
    method: "POST",
    headers,
    body: JSON.stringify({ catalog })
  });
  const payload = await readResponseJson<{ ok?: boolean; error?: string }>(response);
  return { ok: Boolean(payload?.ok), error: payload?.error };
}

export function signalPassPlansFromCatalog(catalog: SubscriptionCatalog | null): PremiumPlanInput[] {
  const product = catalog?.products?.find((item) => item.id === "signal_pass");
  if (!product?.plans?.length) return [];
  return product.plans
    .filter((plan) => plan.active !== false)
    .map((plan) => ({
      id: plan.id as PremiumPlanInput["id"],
      name: plan.name,
      price: plan.price,
      days: plan.days,
      highlight: plan.highlight
    }));
}

export function fastConnectionWeeklyPrice(catalog: SubscriptionCatalog | null): number {
  const product = catalog?.products?.find((item) => item.id === "fast_connection_pass");
  const weekly = product?.plans?.find((plan) => plan.id === "weekly" && plan.active !== false);
  return weekly?.price || 0;
}

export async function fetchContactExchangeMetricsAdmin(limit = 100) {
  const session = await supabase?.auth.getSession();
  const headers = await appendAdminConsentHeader({
    "Content-Type": "application/json",
    ...(session?.data.session?.access_token
      ? { Authorization: `Bearer ${session.data.session.access_token}` }
      : {})
  });
  const response = await fetch(apiUrl("/api/auth/identity?action=contact-exchange-metrics"), {
    method: "POST",
    headers,
    body: JSON.stringify({ limit })
  });
  return readResponseJson<{
    ok?: boolean;
    metrics?: { totals: Record<string, number>; recent: Array<Record<string, unknown>> };
  }>(response);
}
