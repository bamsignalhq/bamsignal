#!/usr/bin/env node
/**
 * Automated Android Play signing recovery.
 *
 * 1. Scan project for .jks / .keystore files
 * 2. If Play-registered upload key (85:64:EC…) is found → install + sync assetlinks
 * 3. Else → export local upload cert PEM for Play upload-key reset + flip expected SHA1
 */
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LOCAL_DEV_KEYSTORE_SHA1,
  PLAY_UPLOAD_CERT_SHA1,
  PLAY_UPLOAD_CERT_SHA1_APPROVED,
  fingerprintMatchesPlayRegistered,
  getActivePlayUploadSha1,
  getPlayRegisteredUploadSha1,
  isUploadKeyResetPending,
  normalizeCertFingerprint,
  readSigningStatus
} from "../shared/androidPlayUploadCert.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const androidAppDir = join(root, "android", "app");
const keyPropsPath = join(root, "android", "key.properties");
const assetlinksPath = join(root, "public", ".well-known", "assetlinks.json");
const playStoreDir = join(root, "play-store");
const pemOut = join(playStoreDir, "play-upload-certificate.pem");
const statusOut = join(playStoreDir, "signing-status.json");

function log(msg) {
  console.log(`[bamsignal] ${msg}`);
}

function fail(msg) {
  console.error(`[bamsignal] signing fix failed: ${msg}`);
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

function extractSha1(text) {
  const match = text.match(/SHA1:\s*([0-9A-F:]+)/i);
  return match?.[1] ? normalizeCertFingerprint(match[1]) : null;
}

function extractSha256(text) {
  const match = text.match(/SHA256:\s*([0-9A-F:]+)/i);
  return match?.[1] ? normalizeCertFingerprint(match[1]) : null;
}

function runKeytool(args) {
  return spawnSync("keytool", args, { encoding: "utf8" });
}

function listKeystoreAliases(keystorePath, storePassword) {
  const result = runKeytool(["-list", "-keystore", keystorePath, "-storepass", storePassword]);
  if (result.status !== 0) return null;
  const aliases = [];
  for (const line of result.stdout.split("\n")) {
    const m = line.match(/^([a-zA-Z0-9_-]+),/);
    if (m && !line.includes("Keystore type")) aliases.push(m[1]);
  }
  return aliases;
}

function readEntryFingerprints(keystorePath, alias, storePassword, keyPassword) {
  const result = runKeytool([
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
  ]);
  if (result.status !== 0) return null;
  const text = `${result.stdout}\n${result.stderr}`;
  return {
    sha1: extractSha1(text),
    sha256: extractSha256(text)
  };
}

function defaultSearchRoots() {
  const home = process.env.HOME || "";
  const extra = (process.env.ANDROID_KEYSTORE_SEARCH || "")
    .split(":")
    .map((p) => p.trim())
    .filter(Boolean);
  return [
    root,
    join(home, "Desktop"),
    join(home, "Desktop", "bamsignal_backups"),
    join(home, "Downloads"),
    join(home, "Documents"),
    ...extra
  ];
}

function findKeystores(dir, found = [], depth = 0) {
  if (depth > 6) return found;
  if (!existsSync(dir)) return found;
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return found;
  }
  for (const name of entries) {
    if (name === "node_modules" || name === "build" || name === ".git") continue;
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      findKeystores(full, found, depth + 1);
      continue;
    }
    if (/\.(jks|keystore)$/i.test(name)) found.push(full);
  }
  return found;
}

function tryPasswords(keystorePath, passwords, aliases) {
  const uniquePasswords = [...new Set(passwords.filter(Boolean))];
  const tryAliases = aliases.length ? aliases : ["bamsignal_upload", "upload", "key0", "android"];
  for (const storePassword of uniquePasswords) {
    const discovered = listKeystoreAliases(keystorePath, storePassword);
    const aliasList = discovered?.length ? discovered : tryAliases;
    for (const alias of aliasList) {
      const fps = readEntryFingerprints(
        keystorePath,
        alias,
        storePassword,
        storePassword
      );
      if (fps?.sha1) {
        return { alias, storePassword, keyPassword: storePassword, ...fps };
      }
    }
  }
  return null;
}

function syncAssetlinksSha256(sha256) {
  const normalized = normalizeCertFingerprint(sha256);
  const assetlinks = JSON.parse(readFileSync(assetlinksPath, "utf8"));
  assetlinks[0].target.sha256_cert_fingerprints = [normalized];
  writeFileSync(assetlinksPath, `${JSON.stringify(assetlinks, null, 2)}\n`, "utf8");
  log(`assetlinks.json SHA-256 → ${normalized}`);
}

function installKeystore(sourcePath, props) {
  const target = join(androidAppDir, "bamsignal-upload-key.jks");
  copyFileSync(sourcePath, target);
  const body = [
    `storePassword=${props.storePassword}`,
    `keyPassword=${props.keyPassword}`,
    `keyAlias=${props.alias}`,
    "storeFile=bamsignal-upload-key.jks",
    ""
  ].join("\n");
  writeFileSync(keyPropsPath, body, "utf8");
  log(`Installed keystore → ${relative(root, target)}`);
}

function exportUploadPem(keystorePath, alias, storePassword, keyPassword) {
  mkdirSync(playStoreDir, { recursive: true });
  const result = runKeytool([
    "-export",
    "-rfc",
    "-keystore",
    keystorePath,
    "-alias",
    alias,
    "-file",
    pemOut,
    "-storepass",
    storePassword,
    "-keypass",
    keyPassword
  ]);
  if (result.status !== 0) {
    fail(`Could not export upload certificate: ${(result.stderr || result.stdout).trim()}`);
  }
  log(`Exported upload certificate → ${relative(root, pemOut)}`);
}

if (!existsSync(keyPropsPath)) {
  fail("android/key.properties missing");
}

const keyProps = parseKeyProperties(readFileSync(keyPropsPath, "utf8"));
const passwords = [keyProps.storePassword, keyProps.keyPassword];
const preferredAliases = keyProps.keyAlias ? [keyProps.keyAlias] : [];

const keystores = [];
for (const searchRoot of defaultSearchRoots()) {
  findKeystores(searchRoot, keystores);
}
const uniqueKeystores = [...new Set(keystores)];
log(`Scanning ${uniqueKeystores.length} keystore file(s)…`);

let playMatch = null;
for (const keystorePath of uniqueKeystores) {
  const match = tryPasswords(keystorePath, passwords, preferredAliases);
  if (!match) continue;
  log(`  ${relative(root, keystorePath)} → SHA-1 ${match.sha1}`);
  if (fingerprintMatchesPlayRegistered(match.sha1)) {
    playMatch = { keystorePath, ...match };
    break;
  }
}

const expectedPlay = getPlayRegisteredUploadSha1();
const priorStatus = readSigningStatus();
const status = {
  at: new Date().toISOString(),
  playExpectedSha1: expectedPlay,
  playRegisteredSha1: expectedPlay,
  localKeystoreSha1: LOCAL_DEV_KEYSTORE_SHA1,
  playKeystoreFound: Boolean(playMatch),
  action: null,
  pemPath: null,
  nextStep: null,
  uploadKeyResetRequired: priorStatus?.uploadKeyResetRequired === true,
  uploadKeyResetApproved: priorStatus?.uploadKeyResetApproved === true,
  activeExpectedSha1: priorStatus?.activeExpectedSha1 || null
};

if (playMatch) {
  installKeystore(playMatch.keystorePath, playMatch);
  syncAssetlinksSha256(playMatch.sha256);
  status.action = "installed_play_upload_keystore";
  status.uploadKeyResetRequired = false;
  status.uploadKeyResetApproved = false;
  status.nextStep = "Run npm run android:release and upload the new AAB.";
  writeFileSync(statusOut, `${JSON.stringify(status, null, 2)}\n`, "utf8");
  log("Play upload keystore recovered — signing fix complete.");
  process.exit(0);
}

log("Play upload keystore (85:64:EC…) not found in project.");
const localPath = resolve(androidAppDir, keyProps.storeFile || "bamsignal-upload-key.jks");
if (!existsSync(localPath)) {
  fail(`Local keystore missing: ${localPath}`);
}

const local = tryPasswords(localPath, passwords, preferredAliases);
if (!local) {
  fail("Could not read local keystore with android/key.properties credentials.");
}

exportUploadPem(localPath, local.alias, local.storePassword, local.keyPassword);
syncAssetlinksSha256(local.sha256);

const resetApproved =
  priorStatus?.uploadKeyResetApproved === true &&
  normalizeCertFingerprint(local.sha1) === normalizeCertFingerprint(PLAY_UPLOAD_CERT_SHA1_APPROVED);

status.action = resetApproved ? "upload_key_reset_active" : "upload_key_reset_prepared";
status.pemPath = relative(root, pemOut);
status.localSha1 = local.sha1;
status.uploadKeyResetRequired = !resetApproved;
status.uploadKeyResetApproved = resetApproved;
if (resetApproved) {
  status.activeExpectedSha1 = normalizeCertFingerprint(PLAY_UPLOAD_CERT_SHA1_APPROVED);
  status.nextStep = "Run npm run android:release and upload the new AAB from play-store/releases/.";
} else {
  status.nextStep =
    "Submit play-store/play-upload-certificate.pem in Play Console → App integrity → App signing → Request upload key reset. After Google approves, run npm run android:approve-upload-reset.";
}
writeFileSync(statusOut, `${JSON.stringify(status, null, 2)}\n`, "utf8");

if (resetApproved) {
  log("Upload key reset approved — local keystore matches active Play upload certificate.");
  log(`Status → ${relative(root, statusOut)}`);
  process.exit(0);
}

if (process.platform === "darwin") {
  spawnSync("open", [pemOut], { stdio: "ignore" });
}

log("Signing fix prepared for upload-key reset path.");
log(`Status → ${relative(root, statusOut)}`);
log("Submit play-store/play-upload-certificate.pem in Play Console (App integrity → App signing).");
log("After Google approves: set uploadKeyResetApproved true in signing-status.json, then android:release.");
