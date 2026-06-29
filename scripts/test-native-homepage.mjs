#!/usr/bin/env node
/**
 * Native Android/WebView — marketing homepage must render at / for guests.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
const appSource = readFileSync(join(rootPath, "src/App.tsx"), "utf8");
const swSource = readFileSync(join(rootPath, "src/utils/serviceWorker.ts"), "utf8");

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

assert(
  appSource.includes('const isPublicHome = currentPathname === "/" && !paystackCallbackActive'),
  "native app must treat / as public marketing home"
);
assert(
  !appSource.includes("!isNative && currentPathname === \"/\""),
  "public home must not exclude native Capacitor"
);
assert(
  appSource.includes("useState(false)") && appSource.includes("memberAppEntered"),
  "guests must not enter member shell before authentication"
);
assert(
  swSource.includes("isNativeCapacitorApp") && swSource.includes("registerServiceWorker"),
  "service worker must skip registration on native Capacitor"
);

console.log("native homepage tests ok");
