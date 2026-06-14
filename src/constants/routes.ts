export const AUTH_LOGIN_PATH = "/love/login";
export const AUTH_SIGNUP_PATH = "/love/sign";
export const ADMIN_AUTH_PATH = "/hard/auth";
export const ADMIN_HUB_PATH = "/hard";
export const BLOG_INDEX_PATH = "/blog";

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
  return path === ADMIN_HUB_PATH || path.startsWith(`${ADMIN_HUB_PATH}/`);
}

export function isAdminAuthRoute(pathname = window.location.pathname): boolean {
  return normalizePath(pathname) === ADMIN_AUTH_PATH;
}

export function isAdminHubRoute(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  return path === ADMIN_HUB_PATH || path.startsWith(`${ADMIN_HUB_PATH}/`);
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

export function navigateToPath(path: string) {
  window.history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

/** Legacy /admin → /hard */
export function redirectLegacyAdmin(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  if (path === "/admin" || path.startsWith("/admin/")) {
    navigateToPath(ADMIN_HUB_PATH);
    return true;
  }
  return false;
}
