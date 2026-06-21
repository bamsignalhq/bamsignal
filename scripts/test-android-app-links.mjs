#!/usr/bin/env node
/**
 * Android App Links — assetlinks.json + manifest integrity checks.
 * Optional: compares release APK cert fingerprint and runs adb verification when a device is attached.
 */
import { execSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
const assetlinksPath = join(rootPath, "public", ".well-known", "assetlinks.json");
const manifestPath = join(rootPath, "android", "app", "src", "main", "AndroidManifest.xml");
const releaseApkPath = join(rootPath, "android", "app", "build", "outputs", "apk", "release", "app-release.apk");

const EXPECTED_PACKAGE = "com.bamsignal.com";
const EXPECTED_HOST = "bamsignal.com";
const EXPECTED_PATH_PREFIX = "/payment/success";

function assertCheck(condition, message) {
  if (condition) return;
  console.error(`android app-links test failed: ${message}`);
  process.exit(1);
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

function extractApkSha256Fingerprint(apkPath) {
  const result = spawnSync("keytool", ["-printcert", "-jarfile", apkPath], {
    encoding: "utf8"
  });
  if (result.status !== 0) {
    return null;
  }
  const match = result.stdout.match(/SHA256:\s*([0-9A-F:]+)/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function hasAdbDevice() {
  try {
    const output = execSync("adb devices", { encoding: "utf8" });
    return output
      .split("\n")
      .slice(1)
      .some((line) => line.trim().endsWith("device"));
  } catch {
    return false;
  }
}

assertCheck(existsSync(assetlinksPath), "public/.well-known/assetlinks.json must exist");

const assetlinks = JSON.parse(readFileSync(assetlinksPath, "utf8"));
assertCheck(Array.isArray(assetlinks) && assetlinks.length > 0, "assetlinks.json must be a non-empty array");

const entry = assetlinks[0];
assertCheck(
  entry?.relation?.includes("delegate_permission/common.handle_all_urls"),
  "assetlinks must delegate common.handle_all_urls"
);
assertCheck(entry?.target?.namespace === "android_app", "assetlinks target namespace must be android_app");
assertCheck(
  entry?.target?.package_name === EXPECTED_PACKAGE,
  `assetlinks package_name must be ${EXPECTED_PACKAGE}`
);

const fingerprints = entry?.target?.sha256_cert_fingerprints ?? [];
assertCheck(fingerprints.length > 0, "assetlinks must include at least one sha256_cert_fingerprint");
for (const fingerprint of fingerprints) {
  assertCheck(
    /^[0-9A-F]{2}(:[0-9A-F]{2}){31}$/.test(String(fingerprint).toUpperCase()),
    `invalid sha256 fingerprint format: ${fingerprint}`
  );
}

const manifestSource = read("android/app/src/main/AndroidManifest.xml");
assertCheck(
  manifestSource.includes('android:autoVerify="true"') &&
    manifestSource.includes('android:scheme="https"') &&
    manifestSource.includes(`android:host="${EXPECTED_HOST}"`) &&
    manifestSource.includes(`android:pathPrefix="${EXPECTED_PATH_PREFIX}"`),
  "AndroidManifest must declare verified HTTPS app link for payment success"
);

assertCheck(
  manifestSource.includes('android:host="payment-success"') &&
    manifestSource.includes('android:scheme="@string/custom_url_scheme"'),
  "AndroidManifest must keep custom scheme payment-success callback"
);
assertCheck(
  manifestSource.includes('android:host="auth-callback"') &&
    manifestSource.includes('android:scheme="@string/custom_url_scheme"'),
  "AndroidManifest must keep custom scheme auth-callback"
);

const stringsSource = read("android/app/src/main/res/values/strings.xml");
assertCheck(
  stringsSource.includes(`<string name="custom_url_scheme">${EXPECTED_PACKAGE}</string>`),
  "custom_url_scheme must remain com.bamsignal.com"
);

const paymentConfigSource = read("server/config.js");
assertCheck(
  paymentConfigSource.includes("PAYSTACK_ANDROID_CALLBACK_URL") &&
    paymentConfigSource.includes("com.bamsignal.com://payment-success"),
  "native Paystack callback must keep com.bamsignal.com custom scheme fallback"
);

if (existsSync(releaseApkPath)) {
  const apkFingerprint = extractApkSha256Fingerprint(releaseApkPath);
  if (apkFingerprint) {
    assertCheck(
      fingerprints.map((value) => String(value).toUpperCase()).includes(apkFingerprint),
      `assetlinks fingerprint must match release APK signing cert (${apkFingerprint})`
    );
  }
}

if (hasAdbDevice()) {
  try {
    const output = execSync(`adb shell pm get-app-links ${EXPECTED_PACKAGE}`, { encoding: "utf8" });
    assertCheck(
      /verified/i.test(output) || /approved/i.test(output),
      `adb app-link verification must report verified (got: ${output.trim()})`
    );
    console.log("adb app-link verification: verified");
  } catch (error) {
    console.warn(
      "adb app-link verification skipped:",
      error instanceof Error ? error.message : String(error)
    );
  }
} else {
  console.log("adb app-link verification skipped (no device attached)");
}

console.log("android app-links tests ok");
