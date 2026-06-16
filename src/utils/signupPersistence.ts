import { STORAGE_KEYS } from "../constants/limits";
import type { UserProfile } from "../types";

const SIGNUP_TTL_MS = 15 * 60 * 1000;
const RESEND_COOLDOWN_SEC = 60;

export type PendingSignupState = {
  profile: UserProfile;
  pin: string;
  codeSentAt: number;
  verifyCode?: string;
};

function readSession<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeSession(key: string, value: unknown): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / private mode */
  }
}

export function loadPendingSignup(): PendingSignupState | null {
  const state = readSession<PendingSignupState>(STORAGE_KEYS.pendingSignup);
  if (!state?.profile?.email || !state.pin) return null;
  if (Date.now() - state.codeSentAt > SIGNUP_TTL_MS) {
    clearPendingSignup();
    return null;
  }
  return state;
}

export function savePendingSignup(input: {
  profile: UserProfile;
  pin: string;
  verifyCode?: string;
  codeSentAt?: number;
}): void {
  writeSession(STORAGE_KEYS.pendingSignup, {
    profile: input.profile,
    pin: input.pin,
    verifyCode: input.verifyCode || "",
    codeSentAt: input.codeSentAt ?? Date.now()
  });
}

export function touchPendingVerifyCode(code: string): void {
  const current = loadPendingSignup();
  if (!current) return;
  writeSession(STORAGE_KEYS.pendingSignup, { ...current, verifyCode: code });
}

export function touchPendingCodeSent(): void {
  const current = loadPendingSignup();
  if (!current) return;
  writeSession(STORAGE_KEYS.pendingSignup, {
    ...current,
    codeSentAt: Date.now(),
    verifyCode: ""
  });
}

export function clearPendingSignup(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.pendingSignup);
  } catch {
    /* ignore */
  }
}

export function resendCooldownRemaining(
  sentAt: number,
  cooldownSec = RESEND_COOLDOWN_SEC
): number {
  const elapsed = Math.floor((Date.now() - sentAt) / 1000);
  return Math.max(0, cooldownSec - elapsed);
}

export function hasRestorableSignupVerify(): boolean {
  return Boolean(loadPendingSignup());
}
