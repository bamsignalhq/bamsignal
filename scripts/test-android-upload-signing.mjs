#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { getActivePlayUploadSha1, getPlayRegisteredUploadSha1, normalizeCertFingerprint } from "../shared/androidPlayUploadCert.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const statusPath = join(root, "play-store", "signing-status.json");
const pemPath = join(root, "play-store", "play-upload-certificate.pem");
const keyPropsPath = join(root, "android", "key.properties");

function fail(message) {
  console.error(`android upload signing test failed: ${message}`);
  process.exit(1);
}

if (!existsSync(statusPath)) {
  fail("play-store/signing-status.json missing — run npm run android:fix-signing");
}

const status = JSON.parse(readFileSync(statusPath, "utf8"));
if (!existsSync(pemPath)) {
  fail("play-store/play-upload-certificate.pem missing — run npm run android:fix-signing");
}

if (!String(readFileSync(pemPath, "utf8")).includes("BEGIN CERTIFICATE")) {
  fail("play-upload-certificate.pem is not a valid PEM export");
}

if (!existsSync(keyPropsPath)) {
  fail("android/key.properties missing");
}

const storeFile = readFileSync(keyPropsPath, "utf8").match(/^storeFile=(.+)$/m)?.[1]?.trim();
const keystorePath = join(root, "android", "app", storeFile || "bamsignal-upload-key.jks");
if (!existsSync(keystorePath)) {
  fail(`release keystore missing: ${keystorePath}`);
}

const storePassword = readFileSync(keyPropsPath, "utf8").match(/^storePassword=(.+)$/m)?.[1]?.trim();
const alias = readFileSync(keyPropsPath, "utf8").match(/^keyAlias=(.+)$/m)?.[1]?.trim() || "bamsignal_upload";
const keytool = spawnSync(
  "keytool",
  ["-list", "-v", "-keystore", keystorePath, "-alias", alias, "-storepass", storePassword],
  { encoding: "utf8" }
);
if (keytool.status !== 0) {
  fail("could not read release keystore with key.properties credentials");
}

const sha1Match = keytool.stdout.match(/SHA1:\s*([0-9A-F:]+)/i);
if (!sha1Match) {
  fail("could not parse keystore SHA-1");
}

const keystoreSha1 = normalizeCertFingerprint(sha1Match[1]);
const active = getActivePlayUploadSha1();
const registered = getPlayRegisteredUploadSha1();

if (status.uploadKeyResetRequired && !status.uploadKeyResetApproved) {
  if (keystoreSha1 !== normalizeCertFingerprint(status.localSha1 || "")) {
    fail(`local keystore ${keystoreSha1} does not match signing-status localSha1`);
  }
  if (keystoreSha1 === registered) {
    fail("unexpected: local keystore matches Play registered while reset pending");
  }
  console.log("android upload signing: reset PEM ready — waiting on Google Play approval");
  process.exit(0);
}

if (keystoreSha1 !== active) {
  fail(`keystore SHA-1 ${keystoreSha1} does not match active expected ${active}`);
}

if (status.uploadKeyResetRequired && status.playRegisteredSha1 === status.playExpectedSha1) {
  console.log("android upload signing: reset PEM ready — waiting on Google Play approval");
} else {
  console.log("android upload signing ok");
}
