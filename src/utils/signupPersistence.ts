import { STORAGE_KEYS } from "../constants/limits";
import type { UserProfile } from "../types";

/** Survives refresh and native app reopen (localStorage). */
const SIGNUP_TTL_MS = 60 * 60 * 1000;
const RESEND_COOLDOWN_SEC = 60;

export type PendingSignupState = {
  profile: UserProfile;
  pin: string;
  codeSentAt: number;
  verifyCode?: string;
};

function readRawSignup(): string | null {
  try {
    return (
      localStorage.getItem(STORAGE_KEYS.pendingSignup) ||
      sessionStorage.getItem(STORAGE_KEYS.pendingSignup)
    );
  } catch {
    return null;
  }
}

function writeSignupRaw(value: string): boolean {
  let ok = false;
  try {
    localStorage.setItem(STORAGE_KEYS.pendingSignup, value);
    ok = true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[bamsignal] signup localStorage write failed", error);
    }
  }
  try {
    sessionStorage.setItem(STORAGE_KEYS.pendingSignup, value);
    ok = true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[bamsignal] signup sessionStorage write failed", error);
    }
  }
  return ok;
}

export function loadPendingSignup(): PendingSignupState | null {
  const raw = readRawSignup();
  if (!raw) return null;

  let state: PendingSignupState | null = null;
  try {
    state = JSON.parse(raw) as PendingSignupState;
  } catch {
    clearPendingSignup();
    return null;
  }

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
}): boolean {
  return writeSignupRaw(
    JSON.stringify({
      profile: input.profile,
      pin: input.pin,
      verifyCode: input.verifyCode || "",
      codeSentAt: input.codeSentAt ?? Date.now()
    })
  );
}

export function touchPendingVerifyCode(code: string): boolean {
  const current = loadPendingSignup();
  if (!current) return false;
  return writeSignupRaw(JSON.stringify({ ...current, verifyCode: code }));
}

export function touchPendingCodeSent(): boolean {
  const current = loadPendingSignup();
  if (!current) return false;
  return writeSignupRaw(
    JSON.stringify({
      ...current,
      codeSentAt: Date.now(),
      verifyCode: ""
    })
  );
}

export function clearPendingSignup(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.pendingSignup);
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
