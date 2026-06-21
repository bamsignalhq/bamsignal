import { BUILD_CODE, BUILD_VERSION } from "../buildInfo";
import { APP_BUILD_ID } from "../constants/build";
import { STORAGE_KEYS } from "../constants/limits";
import { getLastApiError } from "./safeStorage";
import { getCrashMetadata, getLastSuccessfulRoute, currentRoute } from "./crashRecovery";
import { safeGetJSON } from "./safeStorage";

function crashUserId(): string {
  const user = safeGetJSON<{ email?: string; phone?: string }>(STORAGE_KEYS.userProfile, {});
  return user.email || user.phone || "";
}

export function logAppCrash(error: Error, componentStack?: string | null): void {
  const payload = {
    message: error.message,
    stack: error.stack || componentStack || "",
    route: currentRoute(),
    lastRoute: getLastSuccessfulRoute(),
    userId: crashUserId() || undefined,
    buildVersion: BUILD_VERSION,
    buildCode: BUILD_CODE,
    appBuildId: APP_BUILD_ID,
    userAgent: navigator.userAgent,
    lastApiError: getLastApiError(),
    componentStack: componentStack || undefined
  };

  console.error("[app-crash]", payload);

  try {
    sessionStorage.setItem("bamsignal:last-crash", JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function logRouteCrash(routeName: string, error: Error, componentStack?: string | null): void {
  const payload = {
    routeName,
    message: error.message,
    stack: error.stack || componentStack || "",
    ...getCrashMetadata()
  };
  console.error("[route-crash]", payload);
  try {
    sessionStorage.setItem("bamsignal:last-crash", JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}
