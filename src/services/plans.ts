import {
  DEFAULT_PREMIUM_PLAN_INPUTS,
  DEFAULT_PREMIUM_PLANS,
  hydratePlan,
  type PremiumPlan,
  type PremiumPlanInput
} from "../constants/plans";
import { STORAGE_KEYS } from "../constants/limits";
import { readResponseJson } from "../utils/httpJson";
import { apiUrl } from "./supabase";
import { appendAdminConsentHeader } from "../utils/adminConsent";
import { readJson, writeJson } from "../utils/storage";
export { verifyAdminSession } from "../utils/adminSession";

const VALID_IDS = new Set(["weekly", "monthly", "quarterly"]);

function normalizeInputs(raw: unknown): PremiumPlanInput[] {
  if (!Array.isArray(raw)) return DEFAULT_PREMIUM_PLAN_INPUTS;
  const parsed = raw
    .map((item) => {
      const row = item as Partial<PremiumPlanInput>;
      const id = String(row.id || "") as PremiumPlanInput["id"];
      if (!VALID_IDS.has(id)) return null;
      return {
        id,
        name: String(row.name || id),
        price: Math.max(0, Math.round(Number(row.price) || 0)),
        days: Math.max(1, Math.round(Number(row.days) || 1)),
        highlight: row.highlight ? String(row.highlight) : undefined
      } satisfies PremiumPlanInput;
    })
    .filter(Boolean) as PremiumPlanInput[];
  return parsed.length ? parsed : DEFAULT_PREMIUM_PLAN_INPUTS;
}

export function plansFromInputs(inputs: PremiumPlanInput[]): PremiumPlan[] {
  return normalizeInputs(inputs).map(hydratePlan);
}

export function loadLocalPremiumPlans(): PremiumPlan[] | null {
  const cached = readJson<PremiumPlanInput[] | null>(STORAGE_KEYS.premiumPlans, null);
  if (!cached?.length) return null;
  return plansFromInputs(cached);
}

export function saveLocalPremiumPlans(inputs: PremiumPlanInput[]): PremiumPlan[] {
  const normalized = normalizeInputs(inputs);
  writeJson(STORAGE_KEYS.premiumPlans, normalized);
  return plansFromInputs(normalized);
}

export async function fetchPremiumPlans(): Promise<PremiumPlan[]> {
  try {
    const response = await fetch(apiUrl("/api/auth/identity?action=pricing"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store"
    });
    if (response.ok) {
      const payload = await readResponseJson<{ ok?: boolean; plans?: PremiumPlanInput[] }>(response);
      if (payload?.ok && Array.isArray(payload.plans) && payload.plans.length) {
        const plans = plansFromInputs(payload.plans);
        writeJson(STORAGE_KEYS.premiumPlans, payload.plans);
        return plans;
      }
    }
  } catch {
    /* offline — use cache */
  }

  return loadLocalPremiumPlans() || DEFAULT_PREMIUM_PLANS;
}

export async function savePremiumPlansAdmin(
  inputs: PremiumPlanInput[],
  accessToken?: string
): Promise<{ ok: boolean; plans?: PremiumPlan[]; error?: string }> {
  const plans = saveLocalPremiumPlans(inputs);

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const response = await fetch(apiUrl("/api/auth/identity?action=pricing-save"), {
      method: "POST",
      headers: appendAdminConsentHeader(headers),
      body: JSON.stringify({ plans: normalizeInputs(inputs) })
    });
    const payload = await readResponseJson<{ ok?: boolean; plans?: PremiumPlanInput[]; error?: string }>(response);
    if (!response.ok || !payload?.ok) {
      if (import.meta.env.DEV) {
        return { ok: true, plans, error: payload?.error || "Saved locally (API unavailable in dev)." };
      }
      return { ok: false, error: payload?.error || "Could not save pricing." };
    }
    const saved = plansFromInputs(payload.plans || inputs);
    writeJson(STORAGE_KEYS.premiumPlans, payload.plans || inputs);
    return { ok: true, plans: saved };
  } catch (error) {
    if (import.meta.env.DEV) {
      return {
        ok: true,
        plans,
        error: error instanceof Error ? error.message : "Saved locally only."
      };
    }
    return { ok: false, error: error instanceof Error ? error.message : "Save failed." };
  }
}
