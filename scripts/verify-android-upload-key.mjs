#!/usr/bin/env node
/**
 * Fail loudly if android/key.properties points at a keystore that does not match
 * the upload certificate registered in Google Play Console.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PLAY_UPLOAD_CERT_SHA1_APPROVED,
  PLAY_UPLOAD_CERT_SHA256_APPROVED,
  fingerprintMatchesPlayUpload,
  getActivePlayUploadSha1,
  getPlayRegisteredUploadSha1,
  isUploadKeyResetPending,
  normalizeCertFingerprint,
  readSigningStatus
} from "../shared/androidPlayUploadCert.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const keyPropsPath = join(root, "android", "key.properties");
const androidAppDir = join(root, "android", "app");

function fail(message) {
  console.error(`\n[bamsignal] Android upload key check failed:\n${message}\n`);
  console.error(
    "Active Play upload SHA-1:\n" +
      `  ${getActivePlayUploadSha1()}\n\n` +
      "Approved upload SHA-1:\n" +
      `  ${normalizeCertFingerprint(PLAY_UPLOAD_CERT_SHA1_APPROVED)}\n\n` +
      "Run npm run android:approve-upload-reset after Google approves the reset.\n" +
      "See ANDROID_RELEASE_NOTES.md\n"
  );
  process.exit(1);
}

function parseKeyProperties(content) {
  const props = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    props[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return props;
}

function extractSha1FromKeytoolOutput(text) {
  const match = text.match(/SHA1:\s*([0-9A-F:]+)/i);
  return match?.[1] ? normalizeCertFingerprint(match[1]) : null;
}

function extractSha256FromKeytoolOutput(text) {
  const match = text.match(/SHA256:\s*([0-9A-F:]+)/i);
  return match?.[1] ? normalizeCertFingerprint(match[1]) : null;
}

function readKeystoreFingerprints(keystorePath, alias, storePassword, keyPassword) {
  const result = spawnSync(
    "keytool",
    [
      "-list",
      "-v",
      "-keystore",
      keystorePath,
      "-alias",
      alias,
      "-storepass",
      storePassword,
      "-keypass",
      keyPassword
    ],
    { encoding: "utf8" }
  );
  if (result.status !== 0) {
    fail(
      `Could not read keystore at ${keystorePath}.\n` +
        `keytool: ${(result.stderr || result.stdout || "").trim()}`
    );
  }
  const output = `${result.stdout}\n${result.stderr}`;
  const sha1 = extractSha1FromKeytoolOutput(output);
  const sha256 = extractSha256FromKeytoolOutput(output);
  if (!sha1) {
    fail(`Could not parse SHA-1 from keystore ${keystorePath}`);
  }
  return { sha1, sha256 };
}

function readJarFingerprints(jarPath) {
  const result = spawnSync("keytool", ["-printcert", "-jarfile", jarPath], {
    encoding: "utf8"
  });
  if (result.status !== 0) {
    return null;
  }
  const output = `${result.stdout}\n${result.stderr}`;
  return {
    sha1: extractSha1FromKeytoolOutput(output),
    sha256: extractSha256FromKeytoolOutput(output)
  };
}

if (!existsSync(keyPropsPath)) {
  fail("android/key.properties is missing.");
}

const props = parseKeyProperties(readFileSync(keyPropsPath, "utf8"));
const alias = props.keyAlias;
const storePassword = props.storePassword;
const keyPassword = props.keyPassword || storePassword;
const storeFile = props.storeFile;

if (!alias || !storePassword || !storeFile) {
  fail("android/key.properties must set keyAlias, storePassword, and storeFile.");
}

const keystorePath = resolve(androidAppDir, storeFile);
if (!existsSync(keystorePath)) {
  fail(`Keystore not found: ${keystorePath}`);
}

const { sha1: keystoreSha1, sha256: keystoreSha256 } = readKeystoreFingerprints(
  keystorePath,
  alias,
  storePassword,
  keyPassword
);
const expected = getActivePlayUploadSha1();
const playRegistered = getPlayRegisteredUploadSha1();
const expectedSha256 = normalizeCertFingerprint(PLAY_UPLOAD_CERT_SHA256_APPROVED);

console.log("[bamsignal] Android upload key check");
console.log(`  keystore: ${keystorePath}`);
console.log(`  alias: ${alias}`);
console.log(`  SHA-1: ${keystoreSha1}`);
console.log(`  SHA-256: ${keystoreSha256 || "unknown"}`);
console.log(`  Play active upload SHA-1: ${expected}`);
console.log(`  Play registered (legacy) SHA-1: ${playRegistered}`);
console.log(`  Expected upload SHA-256: ${expectedSha256}`);

if (isUploadKeyResetPending()) {
  console.log(
    "  upload key reset: PENDING — submit play-store/play-upload-certificate.pem in Play Console"
  );
}

if (!fingerprintMatchesPlayUpload(keystoreSha1)) {
  let hint = "";
  if (keystoreSha1 !== expected && keystoreSha1 !== normalizeCertFingerprint(PLAY_UPLOAD_CERT_SHA1_APPROVED)) {
    hint =
      "\nKeystore does not match the approved upload key (71:BA:6A…).\n" +
      "If Google approved upload key reset, run: npm run android:approve-upload-reset\n";
  }
  fail(
    `Keystore SHA-1 does not match active Play upload certificate.\n` +
      `  got:                ${keystoreSha1}\n` +
      `  expected (upload):  ${expected}` +
      hint
  );
}

if (keystoreSha256 && keystoreSha256 !== expectedSha256) {
  fail(
    `Keystore SHA-256 does not match approved upload certificate.\n` +
      `  got:      ${keystoreSha256}\n` +
      `  expected: ${expectedSha256}`
  );
}

const aabArg = process.argv[2];
if (aabArg) {
  const aabPath = resolve(process.cwd(), aabArg);
  if (!existsSync(aabPath)) {
    fail(`AAB not found: ${aabPath}`);
  }
  const aabPrint = readJarFingerprints(aabPath);
  if (!aabPrint?.sha1) {
    fail(`Could not read certificate from AAB: ${aabPath}`);
  }
  if (!fingerprintMatchesPlayUpload(aabPrint.sha1)) {
    fail(
      `AAB is signed with the wrong certificate.\n` +
        `  got:      ${aabPrint.sha1}\n` +
        `  expected: ${expected}`
    );
  }
  if (aabPrint.sha256 && aabPrint.sha256 !== expectedSha256) {
    fail(
      `AAB SHA-256 does not match approved upload certificate.\n` +
        `  got:      ${aabPrint.sha256}\n` +
        `  expected: ${expectedSha256}`
    );
  }
  console.log(`  AAB SHA-1: ${aabPrint.sha1} (matches Play upload key)`);
  console.log(`  AAB SHA-256: ${aabPrint.sha256}`);
}

console.log("[bamsignal] Android upload key OK — matches Play Console\n");
