import { BiometricAuth, BiometryType } from "@aparajita/capacitor-biometric-auth";
import { Preferences } from "@capacitor/preferences";
import { isNativeApp } from "./platform";

const BIOMETRIC_ENABLED_KEY = "bamsignal_biometric_enabled";
const BIOMETRIC_EMAIL_KEY = "bamsignal_biometric_email";

export type BiometricAvailability = {
  available: boolean;
  biometryType: BiometryType;
  deviceIsSecure: boolean;
};

export async function getBiometricAvailability(): Promise<BiometricAvailability> {
  if (!isNativeApp()) {
    return { available: false, biometryType: BiometryType.none, deviceIsSecure: false };
  }
  try {
    const result = await BiometricAuth.checkBiometry();
    return {
      available: result.isAvailable,
      biometryType: result.biometryType,
      deviceIsSecure: result.deviceIsSecure
    };
  } catch {
    return { available: false, biometryType: BiometryType.none, deviceIsSecure: false };
  }
}

export async function isBiometricQuickLoginEnabled(): Promise<boolean> {
  const { value } = await Preferences.get({ key: BIOMETRIC_ENABLED_KEY });
  return value === "true";
}

export async function setBiometricQuickLoginEnabled(enabled: boolean, email?: string) {
  await Preferences.set({ key: BIOMETRIC_ENABLED_KEY, value: enabled ? "true" : "false" });
  if (email) {
    await Preferences.set({ key: BIOMETRIC_EMAIL_KEY, value: email.trim().toLowerCase() });
  }
}

export async function getBiometricQuickLoginEmail(): Promise<string | null> {
  const { value } = await Preferences.get({ key: BIOMETRIC_EMAIL_KEY });
  return value || null;
}

export async function promptBiometricUnlock(reason = "Unlock BamSignal"): Promise<boolean> {
  if (!isNativeApp()) return false;
  try {
    await BiometricAuth.authenticate({
      reason,
      cancelTitle: "Use PIN",
      allowDeviceCredential: true,
      iosFallbackTitle: "Use device passcode",
      androidTitle: "BamSignal",
      androidSubtitle: reason
    });
    return true;
  } catch {
    return false;
  }
}
