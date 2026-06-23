import { DEMO_ADMIN } from "../constants/demoAccounts";
import { normalizeOperatorRole, type Role } from "../constants/permissions";
import type { HardTab } from "../components/admin/adminConsoleNav";
import { hardPathForTab, parseHardTabFromPath } from "../constants/hardRoutes";
import { HARD_AUTH_PATH, navigateToPath, normalizePath } from "../constants/routes";
import { apiUrl, supabase } from "../services/supabase";
import { readResponseJson } from "./httpJson";
import { clearAdminConsentToken } from "./adminConsent";

/** Console persistence — route preference only; never use for access control. */
export const HARD_STORAGE = {
  session: "bamsignal_hard_session",
  lastRoute: "bamsignal_hard_last_route",
  authAt: "bamsignal_hard_auth_at",
  memberSnapshot: "bamsignal_member_session_snapshot"
} as const;

/** @deprecated use HARD_STORAGE */
export const ADMIN_STORAGE = HARD_STORAGE;

const LEGACY_STORAGE = {
  session: "bamsignal_admin_session",
  lastRoute: "bamsignal_admin_last_route",
  authAt: "bamsignal_admin_auth_at"
} as const;

const STALE_ADMIN_BROWSER_KEYS = [
  ...Object.values(LEGACY_STORAGE),
  "bamsignal_admin_user",
  "bamsignal_admin_role",
  "bamsignal_command_center_state",
  "adminSession",
  "adminUser",
  "adminRole",
  "commandCenterState",
  HARD_STORAGE.session,
  HARD_STORAGE.authAt
] as const;

const DEV_DEMO_FLAG = "bamsignal_dev_demo_hard";

let validatedOperatorEmail: string | null = null;
let validatedOperatorRole: Role | null = null;

export type HardSessionRecord = {
  email: string;
  accessToken?: string;
};

/** @deprecated */
export type AdminSessionRecord = HardSessionRecord;

function migrateLegacyStorage(): void {
  for (const key of ["lastRoute"] as const) {
    const legacy = localStorage.getItem(LEGACY_STORAGE[key]);
    if (legacy && !localStorage.getItem(HARD_STORAGE[key])) {
      localStorage.setItem(HARD_STORAGE[key], legacy);
    }
  }
  for (const key of ["session", "authAt"] as const) {
    localStorage.removeItem(LEGACY_STORAGE[key]);
  }
}

export function logAdminAudit(event: string, detail?: Record<string, unknown>): void {
  if (detail && Object.keys(detail).length > 0) {
    console.info(`[bamsignal:admin-audit] ${event}`, detail);
    return;
  }
  console.info(`[bamsignal:admin-audit] ${event}`);
}

export function clearStaleAdminBrowserState(options?: { keepLastRoute?: boolean }): void {
  migrateLegacyStorage();
  for (const key of STALE_ADMIN_BROWSER_KEYS) {
    localStorage.removeItem(key);
  }
  sessionStorage.removeItem("bamsignal_command_center_state");
  sessionStorage.removeItem("commandCenterState");
  sessionStorage.removeItem(DEV_DEMO_FLAG);
  validatedOperatorEmail = null;
  validatedOperatorRole = null;
  if (!options?.keepLastRoute) {
    localStorage.removeItem(HARD_STORAGE.lastRoute);
    localStorage.removeItem(LEGACY_STORAGE.lastRoute);
  }
}

export function getHardSessionEmail(): string | null {
  if (validatedOperatorEmail) return validatedOperatorEmail;
  if (isDevDemoHardSession()) return DEMO_ADMIN.email.toLowerCase();
  return null;
}

export function getOperatorRole(): Role | null {
  if (validatedOperatorRole) return validatedOperatorRole;
  if (isDevDemoHardSession()) return "Admin";
  return null;
}

/** @deprecated use getHardSessionEmail */
export const getAdminSessionEmail = getHardSessionEmail;

/** @deprecated local auth timestamp must not gate access */
export function getHardAuthAt(): number | null {
  return null;
}

/** @deprecated */
export const getAdminAuthAt = getHardAuthAt;

/** @deprecated local freshness must not gate access */
export function isHardSessionFresh(): boolean {
  return false;
}

/** @deprecated browser cache must not grant console access */
export function hasLocalHardSession(): boolean {
  return false;
}

/** @deprecated */
export const hasLocalAdminSession = hasLocalHardSession;

export async function snapshotMemberSessionBeforeHardLogin(): Promise<void> {
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session?.access_token || !data.session.refresh_token) return;
  localStorage.setItem(
    HARD_STORAGE.memberSnapshot,
    JSON.stringify({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    })
  );
}

/** @deprecated */
export const snapshotMemberSessionBeforeAdminLogin = snapshotMemberSessionBeforeHardLogin;

export async function restoreMemberSessionAfterHardLogout(): Promise<boolean> {
  if (!supabase) return false;
  const raw = localStorage.getItem(HARD_STORAGE.memberSnapshot);
  if (!raw) return false;
  try {
    const snap = JSON.parse(raw) as { access_token?: string; refresh_token?: string };
    if (!snap.access_token || !snap.refresh_token) return false;
    const { error } = await supabase.auth.setSession({
      access_token: snap.access_token,
      refresh_token: snap.refresh_token
    });
    return !error;
  } catch {
    return false;
  } finally {
    localStorage.removeItem(HARD_STORAGE.memberSnapshot);
  }
}

/** @deprecated */
export const restoreMemberSessionAfterAdminLogout = restoreMemberSessionAfterHardLogout;

export type HardSessionVerifyResult = {
  ok: boolean;
  role: Role | null;
};

export async function verifyAdminSession(accessToken?: string): Promise<HardSessionVerifyResult> {
  if (isDevDemoHardSession()) {
    return { ok: true, role: "Admin" };
  }
  if (!accessToken) return { ok: false, role: null };
  try {
    const response = await fetch(apiUrl("/api/auth/identity?action=admin-session"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: "{}",
      cache: "no-store"
    });
    if (!response.ok) return { ok: false, role: null };
    const payload = await readResponseJson<{ ok?: boolean; role?: string }>(response);
    if (payload?.ok === false) return { ok: false, role: null };
    return { ok: true, role: normalizeOperatorRole(payload?.role) };
  } catch {
    return { ok: false, role: null };
  }
}

export async function persistHardSession(email: string, accessToken?: string): Promise<void> {
  void accessToken;
  clearStaleAdminBrowserState({ keepLastRoute: true });
  if (import.meta.env.DEV && email.trim().toLowerCase() === DEMO_ADMIN.email.toLowerCase() && !accessToken) {
    sessionStorage.setItem(DEV_DEMO_FLAG, "1");
  }
  validatedOperatorEmail = email.trim().toLowerCase();
  if (accessToken) {
    const verification = await verifyAdminSession(accessToken);
    validatedOperatorRole = verification.role ?? "Admin";
  } else if (isDevDemoHardSession()) {
    validatedOperatorRole = "Admin";
  } else {
    validatedOperatorRole = "Admin";
  }
  saveHardLastRoute(hardPathForTab("command"));
  logAdminAudit("admin_login_success", { role: validatedOperatorRole });
}

/** @deprecated */
export const persistAdminSession = persistHardSession;

export function clearHardSessionOnly(): void {
  clearStaleAdminBrowserState({ keepLastRoute: true });
}

/** @deprecated */
export const clearAdminSessionOnly = clearHardSessionOnly;

export async function exitHardSession(): Promise<void> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token;
  if (token) {
    try {
      await fetch(apiUrl("/api/auth/identity?action=operator-logout"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: "{}"
      });
    } catch {
      /* best effort */
    }
  }
  await supabase?.auth.signOut().catch(() => undefined);
  clearStaleAdminBrowserState({ keepLastRoute: true });
  logAdminAudit("admin_logout");
  await restoreMemberSessionAfterHardLogout();
}

/** @deprecated */
export const logoutAdminSession = exitHardSession;

export function saveHardLastRoute(path: string): void {
  const normalized = normalizePath(path);
  if (!normalized.startsWith("/hard")) return;
  localStorage.setItem(HARD_STORAGE.lastRoute, normalized);
}

/** @deprecated */
export const saveAdminLastRoute = saveHardLastRoute;

export function getHardLastRoute(): string | null {
  migrateLegacyStorage();
  const path = localStorage.getItem(HARD_STORAGE.lastRoute);
  if (!path) return null;
  const normalized = normalizePath(path);
  if (normalized.startsWith("/admin")) {
    const migrated = `/hard${normalized.slice("/admin".length)}`;
    localStorage.setItem(HARD_STORAGE.lastRoute, migrated);
    return migrated;
  }
  return normalized;
}

/** @deprecated */
export const getAdminLastRoute = getHardLastRoute;

export function resolveHardHubPath(pathname = window.location.pathname): string {
  const path = normalizePath(pathname);
  if (path === "/hard") return hardPathForTab("command");
  if (path.startsWith("/admin")) {
    return `/hard${path.slice("/admin".length)}` || hardPathForTab("command");
  }
  const tab = parseHardTabFromPath(path);
  if (tab) return hardPathForTab(tab);
  const last = getHardLastRoute();
  if (last && last !== HARD_AUTH_PATH) return last;
  return hardPathForTab("command");
}

/** @deprecated */
export const resolveAdminHubPath = resolveHardHubPath;

export function restoreHardRouteOnLoad(): HardTab {
  const fromPath = parseHardTabFromPath(window.location.pathname);
  if (fromPath) return fromPath;
  const last = getHardLastRoute();
  if (last) {
    const tab = parseHardTabFromPath(last);
    if (tab) return tab;
  }
  return "command";
}

/** @deprecated */
export const restoreAdminRouteOnLoad = restoreHardRouteOnLoad;

export function isDevDemoHardSession(): boolean {
  if (!import.meta.env.DEV) return false;
  return sessionStorage.getItem(DEV_DEMO_FLAG) === "1";
}

/** @deprecated */
export const isDevDemoAdminSession = isDevDemoHardSession;

export async function validateHardSession(): Promise<boolean> {
  if (isDevDemoHardSession()) {
    validatedOperatorEmail = DEMO_ADMIN.email.toLowerCase();
    validatedOperatorRole = "Admin";
    logAdminAudit("admin_restore_success", { mode: "dev_demo" });
    return true;
  }

  if (!supabase) {
    clearStaleAdminBrowserState({ keepLastRoute: true });
    logAdminAudit("admin_restore_denied", { reason: "supabase_unconfigured" });
    return false;
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  const email = session?.user?.email?.trim().toLowerCase() || null;

  if (!token || !email) {
    clearStaleAdminBrowserState({ keepLastRoute: true });
    logAdminAudit("admin_restore_denied", { reason: "missing_session" });
    return false;
  }

  const verification = await verifyAdminSession(token);
  if (!verification.ok) {
    clearStaleAdminBrowserState({ keepLastRoute: true });
    await supabase.auth.signOut().catch(() => undefined);
    logAdminAudit("admin_restore_denied", { reason: "server_rejected" });
    return false;
  }

  validatedOperatorEmail = email;
  validatedOperatorRole = verification.role ?? "Admin";
  logAdminAudit("admin_restore_success", { role: validatedOperatorRole });
  return true;
}

/** @deprecated */
export const validateAdminSession = validateHardSession;

export function setHardSession(email: string): void {
  void persistHardSession(email);
}

/** @deprecated */
export const setAdminSession = setHardSession;

export function clearHardSession(): void {
  void exitHardSession();
}

/** @deprecated */
export const clearAdminSession = clearHardSession;

/** @deprecated use validateHardSession() — never trust browser cache for access */
export function isHardSessionActive(): boolean {
  return false;
}

/** @deprecated */
export const isAdminSessionActive = isHardSessionActive;

export function redirectToHardLogin(): void {
  navigateToPath(HARD_AUTH_PATH);
}

/** @deprecated */
export const redirectToAdminLogin = redirectToHardLogin;

export async function handleAdminSessionExpired(onRedirect: () => void): Promise<void> {
  clearAdminConsentToken();
  clearStaleAdminBrowserState({ keepLastRoute: true });
  await supabase?.auth.signOut().catch(() => undefined);
  logAdminAudit("admin_session_expired");
  onRedirect();
}
