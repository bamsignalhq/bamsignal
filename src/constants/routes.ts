import { hardPathForTab, parseHardTabFromPath } from "./hardRoutes";

export const AUTH_LOGIN_PATH = "/love/login";
export const AUTH_SIGNUP_PATH = "/love/sign";
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
  return AUTH_PATHS.includes(path as AuthPath) ? (path as AuthPath) : null;
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
