import { hardPathForTab, parseHardTabFromPath } from "./hardRoutes";
import { getLegalPath } from "./footer";
import { isSeoRoute } from "./seoRoutes";
import { isNigeriaSeoRoute } from "./nigeriaRoutes";
import { isSignalConciergeRoute } from "./signalConciergeRoutes";
import { isSignalEventsRoute } from "./signalEventsRoutes";

export const AUTH_LOGIN_PATH = "/love/login";
export const AUTH_SIGNUP_PATH = "/love/sign";
export const AUTH_SIGNUP_ALIASES = ["/signup", "/join", "/register"] as const;
export const HARD_AUTH_PATH = "/hard/auth";
export const HARD_HUB_PATH = "/hard/command";
export const BLOG_INDEX_PATH = "/blog";
export const MOMENTS_PATH_PREFIX = "/moments";

/** @deprecated use HARD_AUTH_PATH */
export const ADMIN_AUTH_PATH = HARD_AUTH_PATH;
/** @deprecated use HARD_HUB_PATH */
export const ADMIN_HUB_PATH = HARD_HUB_PATH;

export function getMomentSlug(pathname = window.location.pathname): string | null {
  const path = normalizePath(pathname);
  if (!path.startsWith(`${MOMENTS_PATH_PREFIX}/`)) return null;
  const slug = path.slice(MOMENTS_PATH_PREFIX.length + 1);
  return slug && !slug.includes("/") ? slug : null;
}

export const AUTH_PATHS = [AUTH_LOGIN_PATH, AUTH_SIGNUP_PATH] as const;
export type AuthPath = (typeof AUTH_PATHS)[number];

export const HARD_PATHS = [HARD_AUTH_PATH, HARD_HUB_PATH] as const;

export function normalizePath(pathname = window.location.pathname): string {
  return pathname.replace(/\/$/, "") || "/";
}

export function getAuthPath(pathname = window.location.pathname): AuthPath | null {
  const path = normalizePath(pathname);
  if (AUTH_PATHS.includes(path as AuthPath)) return path as AuthPath;
  if (AUTH_SIGNUP_ALIASES.includes(path as (typeof AUTH_SIGNUP_ALIASES)[number])) {
    return AUTH_SIGNUP_PATH;
  }
  return null;
}

/** Canonical signup URL for legacy /signup, /join, /register entry points. */
export function redirectAuthSignupAliases(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  if (!AUTH_SIGNUP_ALIASES.includes(path as (typeof AUTH_SIGNUP_ALIASES)[number])) return false;
  navigateToPath(AUTH_SIGNUP_PATH, true);
  return true;
}

export function isHardRoute(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  if (path === "/hard" || path.startsWith("/hard/")) return true;
  if (path === "/admin" || path.startsWith("/admin/")) return true;
  return false;
}

/** @deprecated use isHardRoute */
export const isAdminRoute = isHardRoute;

export function isHardAuthRoute(pathname = window.location.pathname): boolean {
  return normalizePath(pathname) === HARD_AUTH_PATH;
}

/** @deprecated use isHardAuthRoute */
export const isAdminAuthRoute = isHardAuthRoute;

export function isHardHubRoute(pathname = window.location.pathname): boolean {
  return isHardRoute(pathname) && !isHardAuthRoute(pathname);
}

/** @deprecated use isHardHubRoute */
export const isAdminHubRoute = isHardHubRoute;

export function getBlogSlug(pathname = window.location.pathname): string | null {
  const path = normalizePath(pathname);
  if (!path.startsWith(`${BLOG_INDEX_PATH}/`)) return null;
  const slug = path.slice(BLOG_INDEX_PATH.length + 1);
  return slug && !slug.includes("/") ? slug : null;
}

export function isBlogIndex(pathname = window.location.pathname): boolean {
  return normalizePath(pathname) === BLOG_INDEX_PATH;
}

export const PAYMENT_SUCCESS_PATH = "/payment/success";

export function isPaymentReturnPath(pathname = window.location.pathname): boolean {
  return normalizePath(pathname) === PAYMENT_SUCCESS_PATH;
}

/** Marketing / legal / auth pages that must not block on member session restore (web). */
export function isPublicWebRoute(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  if (isPaymentReturnPath(path)) return false;
  if (isHardRoute(path)) return false;
  if (getAuthPath(path)) return true;
  if (AUTH_SIGNUP_ALIASES.includes(path as (typeof AUTH_SIGNUP_ALIASES)[number])) return true;
  if (path === "/love") return true;
  if (getLegalPath(path)) return true;
  if (isBlogIndex(path) || getBlogSlug(path)) return true;
  if (getMomentSlug(path)) return true;
  if (isSeoRoute(path)) return true;
  if (isNigeriaSeoRoute(path)) return true;
  if (isSignalConciergeRoute(path)) return true;
  if (isSignalEventsRoute(path)) return true;
  if (path === "/") return true;
  return false;
}

/** Unknown URL on web — show public 404 (not auth/member/admin). */
export function shouldShowPublicNotFound(
  pathname = window.location.pathname,
  isNative = false
): boolean {
  const path = normalizePath(pathname);
  if (path === "/") return false;
  if (isPublicWebRoute(path)) return false;
  if (isHardRoute(path)) return false;
  if (getAuthPath(path)) return false;
  if (AUTH_SIGNUP_ALIASES.includes(path as (typeof AUTH_SIGNUP_ALIASES)[number])) return false;
  if (requiresMemberRestoreBlocking(path, isNative)) return false;
  return true;
}

const MEMBER_APP_PATHS = [
  "/home",
  "/fast-connection",
  "/onboarding",
  "/discover",
  "/chats",
  "/signals",
  "/profile",
  "/voice-vibe",
  "/trusted-member",
  "/saved-profiles",
  "/settings",
  "/subscription",
  PAYMENT_SUCCESS_PATH
] as const;

/** True when boot should block UI with member session restore (native app or explicit member URL). */
export function requiresMemberRestoreBlocking(
  pathname = window.location.pathname,
  isNative = false
): boolean {
  const path = normalizePath(pathname);
  if (isPublicWebRoute(path)) return false;
  if (isNative) return true;
  return MEMBER_APP_PATHS.some((memberPath) => path === memberPath || path.startsWith(`${memberPath}/`));
}

export function navigateToPath(path: string, replace = false) {
  if (replace) {
    window.history.replaceState(null, "", path);
  } else {
    window.history.pushState(null, "", path);
  }
  window.dispatchEvent(new PopStateEvent("popstate"));
}

/** Redirect legacy /admin/* URLs to canonical /hard/* console paths. */
export function redirectLegacyConsolePaths(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);

  if (path === "/admin") {
    navigateToPath(hardPathForTab("command"), true);
    return true;
  }

  if (path.startsWith("/admin/")) {
    const suffix = path.slice("/admin".length);
    navigateToPath(`/hard${suffix}`, true);
    return true;
  }

  if (path === "/hard") {
    navigateToPath(hardPathForTab("command"), true);
    return true;
  }

  return false;
}

/** @deprecated use redirectLegacyConsolePaths */
export const redirectLegacyAdmin = redirectLegacyConsolePaths;

export { parseHardTabFromPath, hardPathForTab };
export { parseHardTabFromPath as parseAdminTabFromPath, hardPathForTab as adminPathForTab };
