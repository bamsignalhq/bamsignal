import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "./storage";

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

export function isValidUsername(value: string): boolean {
  const u = normalizeUsername(value);
  return u.length >= 3 && u.length <= 24;
}

/** Login — any saved 6-digit PIN */
export function isValidPin(value: string): boolean {
  return /^\d{6}$/.test(value);
}

function hasSequentialRun(value: string, minLength = 3): boolean {
  for (let i = 0; i <= value.length - minLength; i++) {
    let ascending = true;
    let descending = true;
    for (let j = 0; j < minLength - 1; j++) {
      const current = Number(value[i + j]);
      const next = Number(value[i + j + 1]);
      if (next !== current + 1) ascending = false;
      if (next !== current - 1) descending = false;
    }
    if (ascending || descending) return true;
  }
  return false;
}

/** Signup — 6 digits, no 123/789-style runs or 222-style repeats */
export function isStrongPin(value: string): boolean {
  if (!/^\d{6}$/.test(value)) return false;
  if (/^(\d)\1{5}$/.test(value)) return false;
  if (/(\d)\1{2}/.test(value)) return false;
  if (hasSequentialRun(value, 3)) return false;
  return true;
}

export function normalizeNigerianPhone(value: string): string {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("234") && digits.length === 13) {
    digits = `0${digits.slice(3)}`;
  }

  if (digits.length === 10 && /^[789]/.test(digits)) {
    digits = `0${digits}`;
  }

  return digits;
}

export function isValidNigerianPhone(value: string): boolean {
  const phone = normalizeNigerianPhone(value);
  return /^0[789]\d{9}$/.test(phone);
}

export function rememberUsernameEmail(username: string, email: string): void {
  const key = normalizeUsername(username);
  if (!key || !email.trim()) return;
  const index = readJson<Record<string, string>>(STORAGE_KEYS.authUsernameIndex, {});
  index[key] = email.trim().toLowerCase();
  writeJson(STORAGE_KEYS.authUsernameIndex, index);
}

export function emailForUsername(username: string): string | null {
  const key = normalizeUsername(username);
  if (!key) return null;
  const index = readJson<Record<string, string>>(STORAGE_KEYS.authUsernameIndex, {});
  return index[key] ?? null;
}

export function profileFromSessionUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): import("../types").UserProfile {
  const meta = user.user_metadata ?? {};
  return {
    name: String(meta.name || "Member"),
    username: meta.username ? String(meta.username) : undefined,
    email: user.email?.includes("@phone.bamsignal.local") ? "" : user.email || "",
    phone: String(meta.phone || ""),
    phoneVerified: Boolean(meta.phone)
  };
}
