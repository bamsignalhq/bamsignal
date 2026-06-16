import { STORAGE_KEYS } from "../constants/limits";
import { ERROR_COPY } from "../constants/copy";
import { readJson, writeJson } from "./storage";

export const USERNAME_MIN_LENGTH = 4;
export const USERNAME_MAX_LENGTH = 20;
export const USERNAME_LOGIN_MIN_LENGTH = 3;
export const USERNAME_CHANGE_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

/** Normalize username: lowercase letters, numbers, underscore only */
export function formatUsernameInput(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_]/g, "");
}

export function normalizeUsername(value: string): string {
  return formatUsernameInput(value);
}

export function isValidSignupUsername(value: string): boolean {
  const u = normalizeUsername(value);
  return (
    u.length >= USERNAME_MIN_LENGTH &&
    u.length <= USERNAME_MAX_LENGTH &&
    /^[a-z0-9_]+$/.test(u)
  );
}

/** Login — allows shorter legacy usernames */
export function isValidLoginUsername(value: string): boolean {
  const u = normalizeUsername(value);
  return (
    u.length >= USERNAME_LOGIN_MIN_LENGTH &&
    u.length <= USERNAME_MAX_LENGTH &&
    /^[a-z0-9_]+$/.test(u)
  );
}

/** @deprecated Use isValidSignupUsername or isValidLoginUsername */
export function isValidUsername(value: string): boolean {
  return isValidSignupUsername(value);
}

export function usernameChangeBlockedMessage(lastChangedAt?: string | null): string | null {
  if (!lastChangedAt) return null;
  const elapsed = Date.now() - new Date(lastChangedAt).getTime();
  if (elapsed < USERNAME_CHANGE_COOLDOWN_MS) {
    return "You can change your username again after 30 days.";
  }
  return null;
}

export function canChangeUsername(lastChangedAt?: string | null, current?: string, next?: string): boolean {
  const normalizedCurrent = normalizeUsername(current || "");
  const normalizedNext = normalizeUsername(next || "");
  if (!normalizedNext || normalizedNext === normalizedCurrent) return true;
  return !usernameChangeBlockedMessage(lastChangedAt);
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

export function toE164NigerianPhone(value: string): string {
  const local = normalizeNigerianPhone(value);
  if (!local) return "";
  if (/^0[789]\d{9}$/.test(local)) return `+234${local.slice(1)}`;
  return value.trim().startsWith("+") ? value.trim() : `+${local}`;
}

export function isValidNigerianPhone(value: string): boolean {
  const phone = normalizeNigerianPhone(value);
  return /^0[789]\d{9}$/.test(phone);
}

export function rememberUsernameEmail(username: string, email: string): void {
  const key = normalizeUsername(username);
  if (!key || !email.trim()) return;
  const index = readJson<Record<string, string>>(STORAGE_KEYS.authUsernameIndex, {});
  writeJson(STORAGE_KEYS.authUsernameIndex, { ...index, [key]: email.trim().toLowerCase() });
}

export function lookupUsernameEmail(username: string): string | null {
  const key = normalizeUsername(username);
  if (!key) return null;
  const index = readJson<Record<string, string>>(STORAGE_KEYS.authUsernameIndex, {});
  return index[key] || null;
}

/** @deprecated Use lookupUsernameEmail */
export function emailForUsername(username: string): string | null {
  return lookupUsernameEmail(username);
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
    phoneVerified: Boolean(meta.phoneVerified)
  };
}

export const USERNAME_TAKEN_MESSAGE = "This username is already taken.";
export const USERNAME_CHANGE_COOLDOWN_MESSAGE = "You can change your username again after 30 days.";
export const GENERIC_TRY_AGAIN = ERROR_COPY.tryAgain;
