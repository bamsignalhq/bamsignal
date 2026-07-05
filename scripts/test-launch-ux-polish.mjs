#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const kit = read("src/components/member/MemberUxKit.tsx");
assert(kit.includes("MemberLoadingState"), "loading state");
assert(kit.includes("MemberEmptyState"), "empty state");
assert(kit.includes("MemberErrorState"), "error state");
assert(kit.includes("MemberOfflineBanner"), "offline banner");
assert(kit.includes("MemberSlowConnectionBanner"), "slow connection banner");
assert(kit.includes("MemberSheet"), "member sheet");
assert(kit.includes('aria-modal="true"'), "sheet accessibility");

const hook = read("src/hooks/useNetworkStatus.ts");
assert(hook.includes("navigator.onLine"), "online detection");
assert(hook.includes("effectiveType"), "slow connection detection");

const styles = read("src/styles/member-ux-kit.css");
assert(styles.includes("prefers-reduced-motion"), "reduced motion");
assert(styles.includes("member-ux-sheet__panel"), "sheet styles");

const app = read("src/App.tsx");
assert(app.includes("MemberOfflineBanner"), "offline banner in app");
assert(app.includes("MemberSlowConnectionBanner"), "slow banner in app");
assert(app.includes("useNetworkStatus"), "network hook in app");

const wallet = read("src/components/wallet/WalletExperienceSheet.tsx");
assert(wallet.includes("MemberSheet"), "wallet uses member sheet");
assert(wallet.includes("MemberErrorState"), "wallet error retry");
assert(wallet.includes("MemberLoadingState"), "wallet loading");

const discover = read("src/pages/DiscoverPage.tsx");
assert(discover.includes("MemberEmptyState"), "discover empty state");

const paymentReturn = read("src/components/PaymentReturnScreen.tsx");
assert(paymentReturn.includes("onRetry"), "payment return retry");

const design = read("src/constants/uxDesignSystem.ts");
assert(design.includes("MEMBER_UX_SURFACES"), "ux surfaces registry");
assert(design.includes("MEMBER_SHEET_PANEL"), "sheet tokens");

const deferred = read("src/deferredMemberStyles.ts");
assert(deferred.includes("member-ux-kit.css"), "ux kit css loaded");

const surfaceFiles = [
  "src/pages/AuthPage.tsx",
  "src/pages/DiscoverPage.tsx",
  "src/pages/ChatsPage.tsx",
  "src/pages/ProfilePage.tsx",
  "src/components/wallet/WalletExperienceSheet.tsx",
  "src/components/PaymentReturnScreen.tsx",
  "src/components/SessionRestoreOverlay.tsx",
  "src/components/RouteErrorBoundary.tsx"
];

for (const file of surfaceFiles) {
  const content = read(file);
  assert(content.length > 0, `surface file ${file}`);
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("PASS: PROGRAM 001 Milestone 2 launch UX polish checks");
