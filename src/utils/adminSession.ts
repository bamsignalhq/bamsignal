import { DEMO_ADMIN } from "../constants/demoAccounts";
import type { HardTab } from "../components/admin/adminConsoleNav";
import { hardPathForTab, parseHardTabFromPath } from "../constants/hardRoutes";
import { HARD_AUTH_PATH, navigateToPath, normalizePath } from "../constants/routes";
import { apiUrl, supabase } from "../services/supabase";
import { verifyAdminSession } from "../services/plans";

/** Console persistence — separate from member session keys. */
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

const HARD_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export type HardSessionRecord = {
  email: string;
  accessToken?: string;
};

/** @deprecated */
export type AdminSessionRecord = HardSessionRecord;

function migrateLegacyStorage(): void {
  for (const key of ["session", "lastRoute", "authAt"] as const) {
    const legacy = localStorage.getItem(LEGACY_STORAGE[key]);
    if (legacy && !localStorage.getItem(HARD_STORAGE[key])) {
      localStorage.setItem(HARD_STORAGE[key], legacy);
    }
    localStorage.removeItem(LEGACY_STORAGE[key]);
  }
}

function readSession(): HardSessionRecord | null {
  migrateLegacyStorage();
  try {
    const raw = localStorage.getItem(HARD_STORAGE.session);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HardSessionRecord;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(record: HardSessionRecord): void {
  localStorage.setItem(HARD_STORAGE.session, JSON.stringify(record));
  localStorage.setItem(HARD_STORAGE.authAt, String(Date.now()));
}

export function getHardSessionEmail(): string | null {
  return readSession()?.email ?? null;
}

/** @deprecated use getHardSessionEmail */
export const getAdminSessionEmail = getHardSessionEmail;

export function getHardAuthAt(): number | null {
  migrateLegacyStorage();
  const raw = localStorage.getItem(HARD_STORAGE.authAt);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** @deprecated */
export const getAdminAuthAt = getHardAuthAt;

export function isHardSessionFresh(): boolean {
  const at = getHardAuthAt();
  if (!at) return false;
  return Date.now() - at < HARD_SESSION_TTL_MS;
}

export function hasLocalHardSession(): boolean {
  const email = getHardSessionEmail();
  if (!email) return false;
  if (!isHardSessionFresh()) return false;
  if (import.meta.env.DEV && email === DEMO_ADMIN.email.toLowerCase()) return true;
  return Boolean(readSession()?.accessToken);
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

export async function persistHardSession(email: string, accessToken?: string): Promise<void> {
  writeSession({
    email: email.trim().toLowerCase(),
    accessToken: accessToken || undefined
  });
  saveHardLastRoute(hardPathForTab("command"));
}

/** @deprecated */
export const persistAdminSession = persistHardSession;

export function clearHardSessionOnly(): void {
  localStorage.removeItem(HARD_STORAGE.session);
  localStorage.removeItem(HARD_STORAGE.authAt);
  localStorage.removeItem(HARD_STORAGE.lastRoute);
}

/** @deprecated */
export const clearAdminSessionOnly = clearHardSessionOnly;

export async function exitHardSession(): Promise<void> {
  const session = readSession();
  if (session?.accessToken) {
    try {
      await fetch(apiUrl("/api/auth/identity?action=operator-logout"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`
        },
        body: "{}"
      });
    } catch {
      /* best effort */
    }
  }
  clearHardSessionOnly();
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
  const email = getHardSessionEmail();
  return Boolean(email && email === DEMO_ADMIN.email.toLowerCase() && isHardSessionFresh());
}

/** @deprecated */
export const isDevDemoAdminSession = isDevDemoHardSession;

export async function validateHardSession(): Promise<boolean> {
  if (isDevDemoHardSession()) return true;

  const record = readSession();
  if (!record?.email || !isHardSessionFresh()) {
    clearHardSessionOnly();
    return false;
  }

  let token = record.accessToken;
  if (!token && supabase) {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token;
    if (token && data.session?.user?.email?.toLowerCase() === record.email) {
      writeSession({ ...record, accessToken: token });
    }
  }

  if (!token) {
    clearHardSessionOnly();
    return false;
  }

  const ok = await verifyAdminSession(token);
  if (!ok) {
    clearHardSessionOnly();
    return false;
  }

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

export function isHardSessionActive(): boolean {
  return hasLocalHardSession() || isDevDemoHardSession();
}

/** @deprecated */
export const isAdminSessionActive = isHardSessionActive;

export function redirectToHardLogin(): void {
  navigateToPath(HARD_AUTH_PATH);
}

/** @deprecated */
export const redirectToAdminLogin = redirectToHardLogin;
