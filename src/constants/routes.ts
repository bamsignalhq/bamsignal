import { adminPathForTab, parseAdminTabFromPath } from "./adminRoutes";

export const AUTH_LOGIN_PATH = "/love/login";
export const AUTH_SIGNUP_PATH = "/love/sign";
export const ADMIN_AUTH_PATH = "/admin/auth";
export const ADMIN_HUB_PATH = "/admin/command";
export const BLOG_INDEX_PATH = "/blog";
export const MOMENTS_PATH_PREFIX = "/moments";

/** Legacy obscured paths — redirect to /admin/* */
export const LEGACY_ADMIN_AUTH_PATH = "/hard/auth";
export const LEGACY_ADMIN_HUB_PATH = "/hard";

export function getMomentSlug(pathname = window.location.pathname): string | null {
  const path = normalizePath(pathname);
  if (!path.startsWith(`${MOMENTS_PATH_PREFIX}/`)) return null;
  const slug = path.slice(MOMENTS_PATH_PREFIX.length + 1);
  return slug && !slug.includes("/") ? slug : null;
}

export const AUTH_PATHS = [AUTH_LOGIN_PATH, AUTH_SIGNUP_PATH] as const;
export type AuthPath = (typeof AUTH_PATHS)[number];

export const ADMIN_PATHS = [ADMIN_AUTH_PATH, ADMIN_HUB_PATH] as const;

export function normalizePath(pathname = window.location.pathname): string {
  return pathname.replace(/\/$/, "") || "/";
}

export function getAuthPath(pathname = window.location.pathname): AuthPath | null {
  const path = normalizePath(pathname);
  return AUTH_PATHS.includes(path as AuthPath) ? (path as AuthPath) : null;
}

export function isAdminRoute(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  if (path === "/admin" || path.startsWith("/admin/")) return true;
  if (path === "/hard" || path.startsWith("/hard/")) return true;
  return false;
}

export function isAdminAuthRoute(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  return path === ADMIN_AUTH_PATH || path === LEGACY_ADMIN_AUTH_PATH;
}

export function isAdminHubRoute(pathname = window.location.pathname): boolean {
  return isAdminRoute(pathname) && !isAdminAuthRoute(pathname);
}

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

/** Map legacy /hard and bare /admin to canonical admin hub paths. */
export function redirectLegacyAdmin(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);

  if (path === LEGACY_ADMIN_AUTH_PATH) {
    navigateToPath(ADMIN_AUTH_PATH, true);
    return true;
  }

  if (path === LEGACY_ADMIN_HUB_PATH || path.startsWith(`${LEGACY_ADMIN_HUB_PATH}/`)) {
    const tab = parseAdminTabFromPath(path);
    navigateToPath(tab ? adminPathForTab(tab) : adminPathForTab("command"), true);
    return true;
  }

  if (path === "/admin") {
    navigateToPath(adminPathForTab("command"), true);
    return true;
  }

  return false;
}

export { parseAdminTabFromPath, adminPathForTab };
