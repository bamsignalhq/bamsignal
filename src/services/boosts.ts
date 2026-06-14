import {
  DEFAULT_BOOST_INPUTS,
  DEFAULT_BOOST_PRODUCTS,
  hydrateBoost,
  type BoostProduct,
  type BoostProductInput
} from "../constants/boosts";
import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "../utils/storage";

const VALID_BOOST_IDS = new Set(["signal-boost", "priority-signal-once", "profile-boost"]);

function normalizeBoostInputs(raw: unknown): BoostProductInput[] {
  if (!Array.isArray(raw)) return DEFAULT_BOOST_INPUTS;
  const parsed = raw
    .map((item) => {
      const row = item as Partial<BoostProductInput>;
      const id = String(row.id || "") as BoostProductInput["id"];
      if (!VALID_BOOST_IDS.has(id)) return null;
      return {
        id,
        name: String(row.name || id),
        price: Math.max(0, Math.round(Number(row.price) || 0)),
        description: String(row.description || ""),
        cta: String(row.cta || DEFAULT_BOOST_INPUTS.find((d) => d.id === id)?.cta || "Get boost")
      } satisfies BoostProductInput;
    })
    .filter(Boolean) as BoostProductInput[];
  return parsed.length ? parsed : DEFAULT_BOOST_INPUTS;
}

export function boostsFromInputs(inputs: BoostProductInput[]): BoostProduct[] {
  return normalizeBoostInputs(inputs).map(hydrateBoost);
}

export function loadLocalBoostProducts(): BoostProduct[] | null {
  const cached = readJson<BoostProductInput[] | null>(STORAGE_KEYS.boostProducts, null);
  if (!cached?.length) return null;
  return boostsFromInputs(cached);
}

export function saveLocalBoostProducts(inputs: BoostProductInput[]): BoostProduct[] {
  const normalized = normalizeBoostInputs(inputs);
  writeJson(STORAGE_KEYS.boostProducts, normalized);
  return boostsFromInputs(normalized);
}

export async function fetchBoostProducts(): Promise<BoostProduct[]> {
  return loadLocalBoostProducts() || DEFAULT_BOOST_PRODUCTS;
}

export async function saveBoostProductsAdmin(
  inputs: BoostProductInput[]
): Promise<{ ok: boolean; products?: BoostProduct[]; error?: string }> {
  const products = saveLocalBoostProducts(inputs);
  return { ok: true, products };
}
