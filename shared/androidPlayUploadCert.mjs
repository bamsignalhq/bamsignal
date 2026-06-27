/**
 * Google Play Console registered upload certificate (public fingerprint — not a secret).
 * App integrity → App signing → Upload key certificate → SHA-1 certificate fingerprint.
 *
 * Release builds MUST sign with the keystore that matches this fingerprint.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = dirname(fileURLToPath(import.meta.url));
const statusPath = join(moduleDir, "..", "play-store", "signing-status.json");

/** Google Play upload certificate after approved key reset (2026-06). */
export const PLAY_UPLOAD_CERT_SHA1_APPROVED =
  "71:BA:6A:A2:70:98:94:CB:45:64:83:F2:36:3E:C9:D6:22:D6:6E:67";

export const PLAY_UPLOAD_CERT_SHA256_APPROVED =
  "5C:85:43:2F:5E:13:F2:B7:2B:C3:52:46:C0:C5:F6:F5:65:B5:A5:19:82:D8:A3:A1:64:80:4F:6A:7D:52:7B:BB";

export const PLAY_UPLOAD_CERT_SHA1 =
  process.env.PLAY_UPLOAD_CERT_SHA1?.trim() ||
  "85:64:EC:E7:77:F3:57:9E:D7:B5:0F:21:98:78:B2:AB:70:1F:81:71";

/** Local dev / post-reset upload keystore on this machine. */
export const LOCAL_DEV_KEYSTORE_SHA1 = PLAY_UPLOAD_CERT_SHA1_APPROVED;

export function normalizeCertFingerprint(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^0-9A-F]/g, "")
    .replace(/(.{2})(?=.)/g, "$1:");
}

export function readSigningStatus() {
  if (!existsSync(statusPath)) return null;
  try {
    return JSON.parse(readFileSync(statusPath, "utf8"));
  } catch {
    return null;
  }
}

/** SHA-1 currently registered in Play Console (upload key certificate). */
export function getPlayRegisteredUploadSha1() {
  const status = readSigningStatus();
  const registered = status?.playRegisteredSha1 || status?.playExpectedSha1 || PLAY_UPLOAD_CERT_SHA1;
  return normalizeCertFingerprint(registered);
}

/**
 * SHA-1 release builds must match for upload.
 * Defaults to Play-registered cert unless Google approved an upload key reset.
 */
export function getActivePlayUploadSha1() {
  const status = readSigningStatus();
  if (status?.uploadKeyResetApproved === true && status?.activeExpectedSha1) {
    return normalizeCertFingerprint(status.activeExpectedSha1);
  }
  return getPlayRegisteredUploadSha1();
}

export function isUploadKeyResetPending() {
  const status = readSigningStatus();
  return status?.uploadKeyResetRequired === true && status?.uploadKeyResetApproved !== true;
}

export function fingerprintMatchesPlayUpload(sha1) {
  return normalizeCertFingerprint(sha1) === getActivePlayUploadSha1();
}

export function fingerprintMatchesPlayUploadSha256(sha256) {
  const normalized = normalizeCertFingerprint(sha256);
  const approved = normalizeCertFingerprint(PLAY_UPLOAD_CERT_SHA256_APPROVED);
  const status = readSigningStatus();
  if (status?.uploadKeyResetApproved === true) {
    return normalized === approved;
  }
  return false;
}

export function fingerprintMatchesPlayRegistered(sha1) {
  return normalizeCertFingerprint(sha1) === getPlayRegisteredUploadSha1();
}
