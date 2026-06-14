import { DEMO_ADMIN } from "../constants/demoAccounts";

const SESSION_KEY = "bamsignal-admin-session";

export function setAdminSession(email: string): void {
  sessionStorage.setItem(SESSION_KEY, email.trim().toLowerCase());
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getAdminSessionEmail(): string | null {
  return sessionStorage.getItem(SESSION_KEY);
}

export function isAdminSessionActive(): boolean {
  const email = getAdminSessionEmail();
  if (!email) return false;
  return email === DEMO_ADMIN.email.toLowerCase();
}
