#!/usr/bin/env node
/**
 * Scan common locations for .jks/.keystore and compare SHA-1 to Play upload cert.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PLAY_UPLOAD_CERT_SHA1, normalizeCertFingerprint } from "../shared/androidPlayUploadCert.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scanScript = join(root, "scripts", "scan-keystore-fingerprints.mjs");

function findKeystores(dir, found = [], depth = 0) {
  if (depth > 5 || !existsSync(dir)) return found;
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return found;
  }
  for (const name of entries) {
    if (name === "node_modules" || name === ".git" || name === "build") continue;
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      findKeystores(full, found, depth + 1);
    } else if (/\.(jks|keystore)$/i.test(name)) {
      found.push(full);
    }
  }
  return found;
}

const home = homedir();
const roots = [
  root,
  join(home, "Desktop"),
  join(home, "Desktop", "bamsignal_backups"),
  join(home, "Downloads"),
  join(home, "Documents"),
  ...(process.env.ANDROID_KEYSTORE_SEARCH || "").split(":").filter(Boolean)
];

const all = [...new Set(roots.flatMap((r) => findKeystores(r)))];
console.log(`\n[bamsignal] Scanning ${all.length} keystore(s) for Play SHA-1 ${PLAY_UPLOAD_CERT_SHA1}\n`);
if (!all.length) {
  console.log("No .jks / .keystore files found in search paths.");
  console.log("Set ANDROID_KEYSTORE_SEARCH=/path/to/backup:/other/path to scan more.\n");
  process.exit(0);
}

spawnSync(process.execPath, [scanScript, ...all], { stdio: "inherit" });
