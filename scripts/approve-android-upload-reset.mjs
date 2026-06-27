#!/usr/bin/env node
/**
 * Mark upload key reset as approved by Google Play (after Play Console shows new upload cert).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LOCAL_DEV_KEYSTORE_SHA1, normalizeCertFingerprint } from "../shared/androidPlayUploadCert.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const statusPath = join(root, "play-store", "signing-status.json");

if (!existsSync(statusPath)) {
  console.error("[bamsignal] play-store/signing-status.json missing — run npm run android:fix-signing first");
  process.exit(1);
}

const status = JSON.parse(readFileSync(statusPath, "utf8"));
const localSha1 = normalizeCertFingerprint(status.localSha1 || LOCAL_DEV_KEYSTORE_SHA1);

status.uploadKeyResetRequired = true;
status.uploadKeyResetApproved = true;
status.activeExpectedSha1 = localSha1;
status.at = new Date().toISOString();
status.nextStep = "Run npm run android:release and upload the new AAB from play-store/releases/.";

writeFileSync(statusPath, `${JSON.stringify(status, null, 2)}\n`, "utf8");

console.log("[bamsignal] Upload key reset marked APPROVED in signing-status.json");
console.log(`  active upload SHA-1: ${localSha1}`);
console.log("  Next: npm run android:release");
