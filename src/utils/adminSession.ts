import { DEMO_ADMIN } from "../constants/demoAccounts";
import type { AdminTab } from "../components/admin/adminConsoleNav";
import { adminPathForTab, parseAdminTabFromPath } from "../constants/adminRoutes";
import { ADMIN_AUTH_PATH, navigateToPath, normalizePath } from "../constants/routes";
import { supabase } from "../services/supabase";
import { verifyAdminSession } from "../services/plans";

/** Dedicated admin persistence — never reuse member STORAGE_KEYS. */
export const ADMIN_STORAGE = {
  session: "bamsignal_admin_session",
  lastRoute: "bamsignal_admin_last_route",
  authAt: "bamsignal_admin_auth_at",
  memberSnapshot: "bamsignal_member_session_snapshot"
} as const;

const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export type AdminSessionRecord = {
  email: string;
  accessToken?: string;
};

function readSession(): AdminSessionRecord | null {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE.session);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSessionRecord;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(record: AdminSessionRecord): void {
  localStorage.setItem(ADMIN_STORAGE.session, JSON.stringify(record));
  localStorage.setItem(ADMIN_STORAGE.authAt, String(Date.now()));
}

export function getAdminSessionEmail(): string | null {
  return readSession()?.email ?? null;
}

export function getAdminAuthAt(): number | null {
  const raw = localStorage.getItem(ADMIN_STORAGE.authAt);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function isAdminSessionFresh(): boolean {
  const at = getAdminAuthAt();
  if (!at) return false;
  return Date.now() - at < ADMIN_SESSION_TTL_MS;
}

export function hasLocalAdminSession(): boolean {
  const email = getAdminSessionEmail();
  if (!email) return false;
  if (!isAdminSessionFresh()) return false;
  if (import.meta.env.DEV && email === DEMO_ADMIN.email.toLowerCase()) return true;
  return Boolean(readSession()?.accessToken);
}

export async function snapshotMemberSessionBeforeAdminLogin(): Promise<void> {
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session?.access_token || !data.session.refresh_token) return;
  localStorage.setItem(
    ADMIN_STORAGE.memberSnapshot,
    JSON.stringify({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    })
  );
}

export async function restoreMemberSessionAfterAdminLogout(): Promise<boolean> {
  if (!supabase) return false;
  const raw = localStorage.getItem(ADMIN_STORAGE.memberSnapshot);
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
    localStorage.removeItem(ADMIN_STORAGE.memberSnapshot);
  }
}

export async function persistAdminSession(email: string, accessToken?: string): Promise<void> {
  writeSession({
    email: email.trim().toLowerCase(),
    accessToken: accessToken || undefined
  });
  saveAdminLastRoute(adminPathForTab("command"));
}

export function clearAdminSessionOnly(): void {
  localStorage.removeItem(ADMIN_STORAGE.session);
  localStorage.removeItem(ADMIN_STORAGE.authAt);
  localStorage.removeItem(ADMIN_STORAGE.lastRoute);
}

export async function logoutAdminSession(): Promise<void> {
  clearAdminSessionOnly();
  await restoreMemberSessionAfterAdminLogout();
}

export function saveAdminLastRoute(path: string): void {
  const normalized = normalizePath(path);
  if (!normalized.startsWith("/admin")) return;
  localStorage.setItem(ADMIN_STORAGE.lastRoute, normalized);
}

export function getAdminLastRoute(): string | null {
  const path = localStorage.getItem(ADMIN_STORAGE.lastRoute);
  if (!path) return null;
  return normalizePath(path);
}

export function resolveAdminHubPath(pathname = window.location.pathname): string {
  const path = normalizePath(pathname);
  if (path === "/admin" || path === "/hard") return adminPathForTab("command");
  const tab = parseAdminTabFromPath(path);
  if (tab) return adminPathForTab(tab);
  const last = getAdminLastRoute();
  if (last && last !== ADMIN_AUTH_PATH) return last;
  return adminPathForTab("command");
}

export function restoreAdminRouteOnLoad(): AdminTab {
  const fromPath = parseAdminTabFromPath(window.location.pathname);
  if (fromPath) return fromPath;
  const last = getAdminLastRoute();
  if (last) {
    const tab = parseAdminTabFromPath(last);
    if (tab) return tab;
  }
  return "command";
}

/** Dev-only fast path for demo admin without server token. */
export function isDevDemoAdminSession(): boolean {
  if (!import.meta.env.DEV) return false;
  const email = getAdminSessionEmail();
  return Boolean(email && email === DEMO_ADMIN.email.toLowerCase() && isAdminSessionFresh());
}

export async function validateAdminSession(): Promise<boolean> {
  if (isDevDemoAdminSession()) return true;

  const record = readSession();
  if (!record?.email || !isAdminSessionFresh()) {
    clearAdminSessionOnly();
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
    clearAdminSessionOnly();
    return false;
  }

  const ok = await verifyAdminSession(token);
  if (!ok) {
    clearAdminSessionOnly();
    return false;
  }

  return true;
}

/** @deprecated use persistAdminSession */
export function setAdminSession(email: string): void {
  void persistAdminSession(email);
}

/** @deprecated use logoutAdminSession */
export function clearAdminSession(): void {
  void logoutAdminSession();
}

export function isAdminSessionActive(): boolean {
  return hasLocalAdminSession() || isDevDemoAdminSession();
}

export function redirectToAdminLogin(): void {
  navigateToPath(ADMIN_AUTH_PATH);
}
