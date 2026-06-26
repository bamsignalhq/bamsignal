import { STORAGE_KEYS } from "../constants/limits";
import {
  fastConnectionWeeklyPrice,
  type SubscriptionCatalog
} from "../services/subscriptionCatalog";
import type { IntentTag } from "../types";
import { formatEntitlementUntil } from "./memberEntitlements";
import { readJson, writeJson } from "./storage";

const DEFAULT_PASS_DAYS = 7;

export function cacheSubscriptionCatalogPricing(catalog: SubscriptionCatalog | null): void {
  if (!catalog) return;
  writeJson(STORAGE_KEYS.subscriptionCatalog, catalog);
}

export function quickiePriceLabel(): string {
  const catalog = readJson<SubscriptionCatalog | null>(STORAGE_KEYS.subscriptionCatalog, null);
  const price = fastConnectionWeeklyPrice(catalog);
  if (price > 0) return `₦${price.toLocaleString("en-NG")}`;
  return "—";
}

export function quickiePassDays(): number {
  const catalog = readJson<SubscriptionCatalog | null>(STORAGE_KEYS.subscriptionCatalog, null);
  const weekly = catalog?.products
    ?.find((item) => item.id === "fast_connection_pass")
    ?.plans?.find((plan) => plan.id === "weekly" && plan.active !== false);
  return weekly?.days || DEFAULT_PASS_DAYS;
}

export function getQuickiePassUntil(): string | null {
  return readJson<string | null>(STORAGE_KEYS.quickiePassUntil, null);
}

export function isQuickiePassActive(): boolean {
  const until = getQuickiePassUntil();
  if (!until) return false;
  return new Date(until).getTime() > Date.now();
}

export function activateQuickiePass(untilIso?: string): void {
  const until =
    untilIso || new Date(Date.now() + quickiePassDays() * 24 * 60 * 60 * 1000).toISOString();
  writeJson(STORAGE_KEYS.quickiePassUntil, until);
  localStorage.setItem(STORAGE_KEYS.fastConnectionExpiresAt, until);
}

export function clearQuickiePass(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.quickiePassUntil);
    localStorage.removeItem(STORAGE_KEYS.fastConnectionStartsAt);
    localStorage.removeItem(STORAGE_KEYS.fastConnectionExpiresAt);
  } catch {
    /* ignore */
  }
}

export function syncFastConnectionPassFromServer(expiresAt?: string | null, active?: boolean): void {
  if (active && expiresAt) {
    writeJson(STORAGE_KEYS.quickiePassUntil, expiresAt);
    localStorage.setItem(STORAGE_KEYS.fastConnectionExpiresAt, expiresAt);
    return;
  }
  clearQuickiePass();
}

export function getUnlockedQuickieMatches(): string[] {
  return readJson<string[]>(STORAGE_KEYS.quickieUnlockedMatches, []);
}

export function unlockQuickieMatch(profileId: string): void {
  const list = getUnlockedQuickieMatches();
  if (!list.includes(profileId)) {
    writeJson(STORAGE_KEYS.quickieUnlockedMatches, [...list, profileId]);
  }
}

export function canMessageQuickieProfile(profileId: string, hasQuickieIntent: boolean): boolean {
  if (!hasQuickieIntent) return true;
  if (isQuickiePassActive()) return true;
  return getUnlockedQuickieMatches().includes(profileId);
}

export function profileHasQuickieIntent(intents: string[] = []): boolean {
  return intents.includes("Quickie");
}

export function fastConnectionWeeklyAmount(): number {
  const catalog = readJson<SubscriptionCatalog | null>(STORAGE_KEYS.subscriptionCatalog, null);
  return fastConnectionWeeklyPrice(catalog);
}

export const QUICKIE_INTENT: IntentTag = "Quickie";

export function markPendingQuickieIntent(): void {
  writeJson(STORAGE_KEYS.pendingQuickieIntent, true);
}

export function clearPendingQuickieIntent(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.pendingQuickieIntent);
  } catch {
    /* ignore */
  }
}

export function hasPendingQuickieIntent(): boolean {
  return readJson<boolean>(STORAGE_KEYS.pendingQuickieIntent, false) === true;
}

export function fastConnectionActiveLabel(): string | null {
  const until = getQuickiePassUntil();
  if (!isQuickiePassActive() || !until) return null;
  return `Fast Connection active until ${formatEntitlementUntil(until)}`;
}
