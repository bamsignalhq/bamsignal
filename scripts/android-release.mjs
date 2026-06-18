#!/usr/bin/env node
/**
 * Production Android release build (APK + AAB).
 * - Requires .env with VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (baked into the web bundle).
 * - Requires android/key.properties + upload keystore for signed release artifacts.
 * - Uses Android Studio JBR (Java 21) when system Java is too new for Gradle.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
dotenv.config();

const requiredEnv = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
const missingEnv = requiredEnv.filter((key) => !String(process.env[key] || "").trim());
if (missingEnv.length) {
  console.error(
    `\n[bamsignal] Missing ${missingEnv.join(", ")} in .env.\n` +
      "The Android app bundles the web build — without Supabase keys login and API calls will fail.\n" +
      "Copy .env.example → .env and set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY, then retry.\n"
  );
  process.exit(1);
}

const keyProps = join(root, "android", "key.properties");
if (!existsSync(keyProps)) {
  console.error(
    "\n[bamsignal] android/key.properties is missing.\n" +
      "Release APK/AAB must be signed for device install and Play Console upload.\n" +
      "See android/key.properties.example and ANDROID_RELEASE_NOTES.md\n"
  );
  process.exit(1);
}

function resolveJavaHome() {
  const candidates = [
    process.env.JAVA_HOME,
    "/Applications/Android Studio.app/Contents/jbr/Contents/Home",
    process.env.ANDROID_STUDIO_JBR
  ].filter(Boolean);

  for (const home of candidates) {
    const java = join(home, "bin", "java");
    if (!existsSync(java)) continue;
    const probe = spawnSync(java, ["-version"], { encoding: "utf8" });
    const text = `${probe.stderr || ""}${probe.stdout || ""}`;
    const match = text.match(/version "(\d+)/);
    const major = match ? Number(match[1]) : 0;
    if (major >= 17 && major <= 21) return home;
  }

  console.error(
    "\n[bamsignal] Need Java 17–21 for Gradle (Java 22+ often breaks Android builds).\n" +
      "Install Android Studio or set JAVA_HOME to its bundled JBR, e.g.:\n" +
      'export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"\n'
  );
  process.exit(1);
}

function run(cmd, args, extraEnv = {}, cwd = root) {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    cwd,
    env: { ...process.env, ...extraEnv },
    shell: process.platform === "win32"
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const javaHome = resolveJavaHome();
console.log(`[bamsignal] Using JAVA_HOME=${javaHome}`);

run("npm", ["run", "build"]);
run("npx", ["cap", "sync", "android"]);

const androidDir = join(root, "android");
const gradle = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
run(gradle, ["assembleRelease", "bundleRelease"], {
  JAVA_HOME: javaHome,
  PATH: `${join(javaHome, "bin")}:${process.env.PATH || ""}`
}, androidDir);

const apk = join(root, "android", "app", "build", "outputs", "apk", "release", "app-release.apk");
const aab = join(root, "android", "app", "build", "outputs", "bundle", "release", "app-release.aab");

if (!existsSync(apk) || !existsSync(aab)) {
  console.error("[bamsignal] Build finished but APK or AAB output is missing.");
  process.exit(1);
}

const gradleFile = readFileSync(join(root, "android", "app", "build.gradle"), "utf8");
const versionName = gradleFile.match(/versionName "([^"]+)"/)?.[1] || "?";
const versionCode = gradleFile.match(/versionCode (\d+)/)?.[1] || "?";

console.log("\n[bamsignal] Android release artifacts ready:");
console.log(`  APK  ${apk}`);
console.log(`  AAB  ${aab}`);
console.log(`  v${versionName} (${versionCode})`);
console.log("\nInstall on device:");
console.log(`  adb install -r "${apk}"`);
console.log("\nUpload the AAB to Play Console closed testing.\n");
