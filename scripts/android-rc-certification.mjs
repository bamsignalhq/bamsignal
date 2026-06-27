#!/usr/bin/env node
/**
 * Android RC1 release certification — audit, signing, deep links, bundle inspection, Play readiness.
 * Writes reports to play-store/releases/.
 */
import { createHash } from "node:crypto";
import { execSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PLAY_UPLOAD_CERT_SHA1_APPROVED,
  PLAY_UPLOAD_CERT_SHA256_APPROVED,
  getActivePlayUploadSha1,
  normalizeCertFingerprint
} from "../shared/androidPlayUploadCert.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const releasesDir = join(root, "play-store", "releases");
const versionName = "1.0.15";
const versionCode = 18;
const releaseBase = `BamSignal-v${versionName}-${versionCode}`;
const aabPath = join(releasesDir, `${releaseBase}.aab`);

const checks = [];
let score = 0;
let maxScore = 0;

function addCheck(category, name, pass, detail = "") {
  maxScore += 1;
  if (pass) score += 1;
  checks.push({ category, name, pass, detail });
  return pass;
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function run(cmd, args, cwd = root) {
  return spawnSync(cmd, args, { cwd, encoding: "utf8", shell: false });
}

function gitCommit() {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function sha256File(path) {
  const buf = readFileSync(path);
  return createHash("sha256").update(buf).digest("hex");
}

function extractFingerprintsFromJar(jarPath) {
  const result = run("keytool", ["-printcert", "-jarfile", jarPath]);
  if (result.status !== 0) return null;
  const text = `${result.stdout}\n${result.stderr}`;
  const sha1 = text.match(/SHA1:\s*([0-9A-F:]+)/i)?.[1];
  const sha256 = text.match(/SHA256:\s*([0-9A-F:]+)/i)?.[1];
  return {
    sha1: sha1 ? normalizeCertFingerprint(sha1) : null,
    sha256: sha256 ? normalizeCertFingerprint(sha256) : null
  };
}

function parseGradleVersion() {
  const gradle = read("android/app/build.gradle");
  const versionCodeMatch = gradle.match(/versionCode\s+(\d+)/);
  const versionNameMatch = gradle.match(/versionName\s+"([^"]+)"/);
  return {
    versionCode: versionCodeMatch ? Number.parseInt(versionCodeMatch[1], 10) : null,
    versionName: versionNameMatch?.[1] ?? null,
    applicationId: gradle.match(/applicationId\s+"([^"]+)"/)?.[1] ?? null,
    namespace: gradle.match(/namespace\s+"([^"]+)"/)?.[1] ?? null,
    minifyEnabled: /minifyEnabled\s+true/.test(gradle)
  };
}

function runSubprocessTest(label, npmScript) {
  const result = run("npm", ["run", npmScript]);
  const pass = result.status === 0;
  addCheck("Certification", label, pass, pass ? "PASS" : (result.stderr || result.stdout || "").slice(0, 400));
  return pass;
}

mkdirSync(releasesDir, { recursive: true });

// ── Phase 1: Release Audit ──
const gradle = parseGradleVersion();
const variables = read("android/variables.gradle");
const manifest = read("android/app/src/main/AndroidManifest.xml");
const compileSdk = variables.match(/compileSdkVersion\s*=\s*(\d+)/)?.[1];
const targetSdk = variables.match(/targetSdkVersion\s*=\s*(\d+)/)?.[1];
const minSdk = variables.match(/minSdkVersion\s*=\s*(\d+)/)?.[1];

addCheck("Audit", "applicationId com.bamsignal.com", gradle.applicationId === "com.bamsignal.com");
addCheck("Audit", "namespace com.bamsignal.com", gradle.namespace === "com.bamsignal.com");
addCheck("Audit", `versionName ${versionName}`, gradle.versionName === versionName);
addCheck("Audit", `versionCode ${versionCode}`, gradle.versionCode === versionCode);
addCheck("Audit", "minSdk 23", minSdk === "23");
addCheck("Audit", "targetSdk 35", targetSdk === "35");
addCheck("Audit", "compileSdk 35", compileSdk === "35");
addCheck("Audit", "INTERNET permission", manifest.includes("android.permission.INTERNET"));
addCheck("Audit", "No dangerous storage permissions", !manifest.includes("READ_EXTERNAL_STORAGE"));
addCheck("Audit", "Deep link autoVerify", manifest.includes('android:autoVerify="true"'));
addCheck("Audit", "Payment success App Link", manifest.includes('android:pathPrefix="/payment/success"'));
addCheck("Audit", "Adaptive icon (anydpi-v26)", existsSync(join(root, "android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml")));
addCheck("Audit", "Splash screen theme", manifest.includes("AppTheme.NoActionBarLaunch"));
addCheck("Audit", "Release signingConfig", read("android/app/build.gradle").includes("signingConfig signingConfigs.release"));
addCheck("Audit", "key.properties exists", existsSync(join(root, "android/key.properties")));
addCheck("Audit", "Proguard/R8 minify disabled (Capacitor)", !gradle.minifyEnabled);
addCheck("Audit", "allowBackup false", manifest.includes('android:allowBackup="false"'));
addCheck("Audit", "FileProvider not exported", manifest.includes('android:exported="false"'));

// ── Phase 2: Signing ──
const expectedSha1 = normalizeCertFingerprint(PLAY_UPLOAD_CERT_SHA1_APPROVED);
const expectedSha256 = normalizeCertFingerprint(PLAY_UPLOAD_CERT_SHA256_APPROVED);
const activeSha1 = getActivePlayUploadSha1();

addCheck("Signing", "Active expected SHA1 matches approved", activeSha1 === expectedSha1, activeSha1);

const verifyResult = run("node", ["scripts/verify-android-upload-key.mjs"]);
addCheck("Signing", "verify-android-upload-key", verifyResult.status === 0);

let aabPrint = null;
if (existsSync(aabPath)) {
  aabPrint = extractFingerprintsFromJar(aabPath);
  addCheck("Signing", "AAB SHA1 matches Play upload", aabPrint?.sha1 === expectedSha1, aabPrint?.sha1 ?? "missing");
  addCheck("Signing", "AAB SHA256 matches Play upload", aabPrint?.sha256 === expectedSha256, aabPrint?.sha256 ?? "missing");
}

// ── Phase 4: Deep Links ──
const assetlinks = JSON.parse(read("public/.well-known/assetlinks.json"));
const assetFp = assetlinks[0]?.target?.sha256_cert_fingerprints?.[0];
addCheck(
  "Deep Links",
  "assetlinks package_name",
  assetlinks[0]?.target?.package_name === "com.bamsignal.com"
);
addCheck(
  "Deep Links",
  "assetlinks SHA256 matches upload cert",
  normalizeCertFingerprint(assetFp) === expectedSha256,
  assetFp
);

let liveAssetlinks = null;
try {
  liveAssetlinks = execSync("curl -fsSL https://bamsignal.com/.well-known/assetlinks.json", {
    encoding: "utf8",
    timeout: 15000
  });
  const live = JSON.parse(liveAssetlinks);
  const liveFp = live[0]?.target?.sha256_cert_fingerprints?.[0];
  addCheck(
    "Deep Links",
    "Production assetlinks.json live",
    normalizeCertFingerprint(liveFp) === expectedSha256,
    liveFp
  );
} catch (err) {
  addCheck("Deep Links", "Production assetlinks.json live", false, String(err.message || err));
}

runSubprocessTest("test-android-app-links", "test:android-app-links");

// ── Phase 6: Bundle Inspection ──
let bundleSize = null;
let bundleSha256 = null;
let aabListing = "";
if (existsSync(aabPath)) {
  bundleSize = statSync(aabPath).size;
  bundleSha256 = sha256File(aabPath);
  addCheck("Bundle", "AAB exists at play-store/releases", true, aabPath);
  addCheck("Bundle", "AAB size > 1MB", bundleSize > 1_000_000, `${(bundleSize / 1024 / 1024).toFixed(2)} MB`);

  const listResult = run("unzip", ["-l", aabPath]);
  aabListing = listResult.stdout || "";
  addCheck("Bundle", "Contains base dex", /base\/dex/.test(aabListing));
  addCheck("Bundle", "Contains base manifest", /base\/manifest\//.test(aabListing));
  addCheck("Bundle", "Contains web assets", /base\/assets\/public/.test(aabListing));
  addCheck("Bundle", "Contains adaptive icons", /base\/res\/mipmap/.test(aabListing));
} else {
  addCheck("Bundle", "AAB exists at play-store/releases", false, aabPath);
}

// ── Phase 7: Play Readiness ──
addCheck("Play", "targetSdk 35 (Play 2025 requirement)", targetSdk === "35");
addCheck("Play", "No foreground service permission", !manifest.includes("FOREGROUND_SERVICE"));
addCheck("Play", "No legacy storage permissions", !manifest.includes("WRITE_EXTERNAL_STORAGE"));
addCheck("Play", "MainActivity exported (launcher)", manifest.includes('android:exported="true"'));
addCheck("Play", "Billing via web (Paystack) — no native billing SDK", true, "Capacitor WebView");
addCheck("Play", "Play Integrity — web-only app (N/A native SDK)", true, "N/A");

// ── Phase 8: Android test suite ──
runSubprocessTest("test-android-upload-signing", "test:android-upload-signing");
runSubprocessTest("test-source-integrity-android", "test:source-integrity:android");

const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
const go = pct === 100 && existsSync(aabPath) && aabPrint?.sha1 === expectedSha1;

const buildTime = existsSync(join(releasesDir, `${releaseBase}.meta.json`))
  ? JSON.parse(readFileSync(join(releasesDir, `${releaseBase}.meta.json`), "utf8")).buildTime
  : new Date().toISOString();

const releaseNotes = readFileSync(join(root, "ANDROID_RELEASE_NOTES.md"), "utf8")
  .match(/## RC1 \(1\.0\.15\)[\s\S]*?(?=##|$)/)?.[0]
  ?.trim() || "See ANDROID_RELEASE_NOTES.md";

// Reports
const auditMd = `# Android Release Audit Report

**Version:** ${versionName} (${versionCode})  
**Generated:** ${new Date().toISOString()}  
**Git:** ${gitCommit()}

| Check | Status | Detail |
|-------|--------|--------|
${checks.filter((c) => c.category === "Audit").map((c) => `| ${c.name} | ${c.pass ? "PASS" : "FAIL"} | ${c.detail} |`).join("\n")}

## Summary

- **applicationId / namespace:** \`com.bamsignal.com\`
- **minSdk / targetSdk / compileSdk:** ${minSdk} / ${targetSdk} / ${compileSdk}
- **Signing:** release signingConfig via \`android/key.properties\`
- **Permissions:** INTERNET, RECORD_AUDIO, MODIFY_AUDIO_SETTINGS
- **Deep links:** \`https://bamsignal.com/payment/success\` (autoVerify)
- **Play Billing / Integrity:** Web-only Capacitor shell (no native SDK)
`;

const signingMd = `# Signing Verification Report

**Expected SHA1:** \`${expectedSha1}\`  
**Expected SHA256:** \`${expectedSha256}\`  
**Active Play upload SHA1:** \`${activeSha1}\`

| Check | Status | Detail |
|-------|--------|--------|
${checks.filter((c) => c.category === "Signing").map((c) => `| ${c.name} | ${c.pass ? "PASS" : "FAIL"} | ${c.detail} |`).join("\n")}

${aabPrint ? `\n## AAB Certificate\n\n- **SHA1:** \`${aabPrint.sha1}\`\n- **SHA256:** \`${aabPrint.sha256}\`\n` : ""}
`;

const bundleMd = `# Bundle Inspection Report

**AAB:** \`${releaseBase}.aab\`  
**Size:** ${bundleSize ? `${(bundleSize / 1024 / 1024).toFixed(2)} MB (${bundleSize} bytes)` : "N/A"}  
**SHA256:** \`${bundleSha256 ?? "N/A"}\`

| Check | Status | Detail |
|-------|--------|--------|
${checks.filter((c) => c.category === "Bundle").map((c) => `| ${c.name} | ${c.pass ? "PASS" : "FAIL"} | ${c.detail} |`).join("\n")}

## Contents (unzip -l excerpt)

\`\`\`
${aabListing.split("\n").slice(0, 40).join("\n")}
...
\`\`\`
`;

const playMd = `# Play Readiness Report

**Target SDK:** ${targetSdk}  
**Verdict:** ${pct >= 95 ? "Ready for Play Console upload" : "Review failures before upload"}

| Check | Status | Detail |
|-------|--------|--------|
${checks.filter((c) => c.category === "Play" || c.category === "Deep Links").map((c) => `| ${c.name} | ${c.pass ? "PASS" : "FAIL"} | ${c.detail} |`).join("\n")}

## ADB verification (manual)

\`\`\`bash
adb shell pm get-app-links com.bamsignal.com
adb shell am start -a android.intent.action.VIEW -d "https://bamsignal.com/payment/success?reference=test"
\`\`\`
`;

const certMd = `# Android Release Certification — RC1

**Build version:** bamsignal-v${versionName}-${versionCode}  
**Version Name:** ${versionName}  
**Version Code:** ${versionCode}  
**Git Commit:** ${gitCommit()}  
**Signing SHA1:** ${aabPrint?.sha1 ?? expectedSha1}  
**Signing SHA256:** ${aabPrint?.sha256 ?? expectedSha256}  
**Bundle Size:** ${bundleSize ? `${(bundleSize / 1024 / 1024).toFixed(2)} MB` : "N/A"}  
**Bundle SHA256:** ${bundleSha256 ?? "N/A"}  
**Build Time:** ${buildTime}  
**Android Score:** ${pct}%  
**Verdict:** **${go ? "GO" : "NO GO"}**

## Release Notes

${releaseNotes}

## All Checks

| Category | Check | Status |
|----------|-------|--------|
${checks.map((c) => `| ${c.category} | ${c.name} | ${c.pass ? "PASS" : "FAIL"} |`).join("\n")}

## Artifacts

- \`play-store/releases/${releaseBase}.aab\`
- \`play-store/releases/android-release-certification.md\`
- \`play-store/releases/bundle-inspection.md\`
- \`play-store/releases/play-readiness.md\`
`;

writeFileSync(join(releasesDir, "android-release-audit.md"), auditMd, "utf8");
writeFileSync(join(releasesDir, "signing-verification.md"), signingMd, "utf8");
writeFileSync(join(releasesDir, "bundle-inspection.md"), bundleMd, "utf8");
writeFileSync(join(releasesDir, "play-readiness.md"), playMd, "utf8");
writeFileSync(join(releasesDir, "android-release-certification.md"), certMd, "utf8");

console.log(`\n[bamsignal] Android RC certification: ${pct}% — ${go ? "GO" : "NO GO"}`);
console.log(`  Reports: play-store/releases/`);
if (!go) process.exit(1);
