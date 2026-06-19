import { BUILD_CODE, BUILD_VERSION, CACHE_VERSION } from "../buildInfo";
import { APP_BUILD_ID } from "../constants/build";
import { STORAGE_KEYS } from "../constants/limits";
import { clearOnboardingDrafts, isOnboardingFullyComplete } from "./onboardingStatus";
import { FLOW_STATE_KEY } from "./flowWatchdog";
import { clearLegacyPaymentFlags, sanitizeStalePaymentState } from "./paymentState";
import { safeGetJSON, safeGetString, safeRemove, safeSetString } from "./safeStorage";
import type { DatingProfile, UserProfile } from "../types";

export const SAFE_MODE_KEY = "bamsignal_safe_mode";
export const CRASH_TIMES_KEY = "bamsignal:crash-times";
export const LAST_ROUTE_KEY = "bamsignal:last-route";
export const RECOVERY_BANNER_KEY = "bamsignal:recovery-banner";

const SW_CACHE_PREFIX = "bamsignal-v";

export function currentRoute(): string {
  return `${window.location.pathname}${window.location.search}`;
}

export function rememberSuccessfulRoute(path = currentRoute()): void {
  try {
    sessionStorage.setItem(LAST_ROUTE_KEY, path);
  } catch {
    /* ignore */
  }
}

export function getLastSuccessfulRoute(): string {
  try {
    return sessionStorage.getItem(LAST_ROUTE_KEY) || "/";
  } catch {
    return "/";
  }
}

export function isSafeMode(): boolean {
  return safeGetString(SAFE_MODE_KEY) === "true";
}

export function enableSafeMode(): void {
  safeSetString(SAFE_MODE_KEY, "true");
  try {
    sessionStorage.setItem(RECOVERY_BANNER_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearSafeMode(): void {
  safeRemove(SAFE_MODE_KEY);
  try {
    sessionStorage.removeItem(RECOVERY_BANNER_KEY);
  } catch {
    /* ignore */
  }
}

export function shouldShowRecoveryBanner(): boolean {
  try {
    return sessionStorage.getItem(RECOVERY_BANNER_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissRecoveryBanner(): void {
  try {
    sessionStorage.removeItem(RECOVERY_BANNER_KEY);
  } catch {
    /* ignore */
  }
}

export function recordCrashTimestamp(): boolean {
  const now = Date.now();
  let recent: number[] = [];
  try {
    const raw = sessionStorage.getItem(CRASH_TIMES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        recent = parsed.filter((value) => typeof value === "number" && now - value < 60_000);
      }
    }
  } catch {
    recent = [];
  }
  recent.push(now);
  try {
    sessionStorage.setItem(CRASH_TIMES_KEY, JSON.stringify(recent));
  } catch {
    /* ignore */
  }
  return recent.length >= 2;
}

export function readHtmlBuildId(): string | null {
  try {
    return document.querySelector('meta[name="bamsignal-build"]')?.getAttribute("content") || null;
  } catch {
    return null;
  }
}

export function htmlBuildMatchesApp(): boolean {
  const htmlBuild = readHtmlBuildId();
  if (!htmlBuild) return true;
  return htmlBuild === APP_BUILD_ID;
}

export function isChunkLoadError(reason: unknown): boolean {
  const message =
    reason instanceof Error
      ? `${reason.name} ${reason.message}`
      : typeof reason === "string"
        ? reason
        : "";
  return /ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    message
  );
}

export async function unregisterStaleServiceWorkers(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      try {
        registration.active?.postMessage({ type: "CLEAR_CACHES" });
      } catch {
        /* ignore */
      }
    }
    await Promise.all(registrations.map((registration) => registration.unregister()));
  } catch {
    /* ignore */
  }
  await clearServiceWorkerCaches();
}

export async function clearServiceWorkerCaches(): Promise<void> {
  if (!("caches" in window)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((key) => key.startsWith(SW_CACHE_PREFIX)).map((key) => caches.delete(key))
    );
  } catch {
    /* ignore */
  }
}

function clearPaymentTransientState(): void {
  clearLegacyPaymentFlags();
  sanitizeStalePaymentState();
  safeRemove(STORAGE_KEYS.paymentFlowState);
  safeRemove(STORAGE_KEYS.paymentPending);
  safeRemove(STORAGE_KEYS.paymentCheckoutOpened);
  safeRemove(STORAGE_KEYS.paymentStartedAt);
}

function clearVolatileUiState(): void {
  safeRemove(FLOW_STATE_KEY);
  try {
    sessionStorage.removeItem("bamsignal:last-crash");
    sessionStorage.removeItem("bamsignal:build-reload");
    sessionStorage.removeItem("bamsignal:chunk-reload");
    sessionStorage.removeItem(CRASH_TIMES_KEY);
    sessionStorage.removeItem(LAST_ROUTE_KEY);
  } catch {
    /* ignore */
  }
  safeRemove(STORAGE_KEYS.onboardingStep);

  const profile = safeGetJSON<Partial<DatingProfile>>(STORAGE_KEYS.datingProfile, {});
  const user = safeGetJSON<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
  if (isOnboardingFullyComplete(profile, user)) {
    clearOnboardingDrafts();
  }
}

/** Clear volatile caches only — preserves auth, profile, photos, and preferences. */
export async function clearBamSignalVolatileCache(): Promise<void> {
  clearVolatileUiState();
  clearPaymentTransientState();
  await clearServiceWorkerCaches();
  await unregisterStaleServiceWorkers();
}

export async function performAppRecovery(options?: { enableSafeMode?: boolean }): Promise<void> {
  if (options?.enableSafeMode) {
    enableSafeMode();
  }
  await clearBamSignalVolatileCache();

  const url = new URL(window.location.href);
  url.searchParams.set("recover", String(Date.now()));
  window.location.replace(url.toString());
}

export function applySafeModeBoot(isAuthed: boolean): string {
  clearVolatileUiState();
  if (isAuthed) {
    return "/home";
  }
  return "/";
}

export function getServiceWorkerVersion(): string {
  return CACHE_VERSION;
}

export function getCrashMetadata(extra?: Record<string, unknown>) {
  const user = safeGetJSON<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
  const userId = user.email || user.phone || "";
  return {
    route: currentRoute(),
    lastRoute: getLastSuccessfulRoute(),
    userId: userId || undefined,
    buildVersion: BUILD_VERSION,
    buildCode: BUILD_CODE,
    appBuildId: APP_BUILD_ID,
    htmlBuildId: readHtmlBuildId(),
    serviceWorkerVersion: getServiceWorkerVersion(),
    userAgent: navigator.userAgent,
    safeMode: isSafeMode(),
    ...extra
  };
}
