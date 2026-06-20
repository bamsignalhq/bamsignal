import { clearOpenAppPendingState } from "../services/goToApp";

const BOOT_FLAG_KEYS = {
  otpVerifyPending: "bamsignal-otp-verify-pending",
  appUpdatePending: "bamsignal-app-update-pending",
  bootReload: "bamsignal-boot-reload"
} as const;

/** Clear stuck boot/navigation flags without touching auth, profile, photos, or preferences. */
export function clearStaleBootFlags(): void {
  if (typeof window === "undefined") return;
  clearOpenAppPendingState();
  try {
    sessionStorage.removeItem(BOOT_FLAG_KEYS.otpVerifyPending);
    sessionStorage.removeItem(BOOT_FLAG_KEYS.appUpdatePending);
    sessionStorage.removeItem(BOOT_FLAG_KEYS.bootReload);
  } catch {
    /* ignore */
  }
}

export function markOtpVerifyPending(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(BOOT_FLAG_KEYS.otpVerifyPending, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function clearOtpVerifyPending(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(BOOT_FLAG_KEYS.otpVerifyPending);
  } catch {
    /* ignore */
  }
}

export function markAppUpdatePending(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(BOOT_FLAG_KEYS.appUpdatePending, "1");
  } catch {
    /* ignore */
  }
}

export function clearAppUpdatePending(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(BOOT_FLAG_KEYS.appUpdatePending);
  } catch {
    /* ignore */
  }
}

export function hasAppUpdatePending(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(BOOT_FLAG_KEYS.appUpdatePending) === "1";
  } catch {
    return false;
  }
}
