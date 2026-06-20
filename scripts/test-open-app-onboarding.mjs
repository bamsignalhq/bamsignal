/**
 * Static checks for Open App server-confirmed onboarding routing.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assertCheck(condition, message) {
  if (condition) return;
  console.error(`open app onboarding test failed: ${message}`);
  process.exit(1);
}

const goToAppSource = readFileSync(join(rootPath, "src/services/goToApp.ts"), "utf8");
const appSource = readFileSync(join(rootPath, "src/App.tsx"), "utf8");
const onboardingRepairSource = readFileSync(join(rootPath, "src/services/onboardingRepair.ts"), "utf8");
const cacheSource = readFileSync(join(rootPath, "src/utils/openAppOnboardingCache.ts"), "utf8");

assertCheck(
  goToAppSource.includes("fetchOnboardingStatusWithTimeout") &&
    !goToAppSource.includes("await bootstrapMemberSession") &&
    goToAppSource.includes("hydrateMemberAppInBackground") &&
    goToAppSource.includes("writeOpenAppOnboardingCache") &&
    goToAppSource.includes("readOpenAppOnboardingCache"),
  "goToApp must gate routing on onboarding-status and hydrate only in background"
);

assertCheck(
  !appSource.includes('flowLog("home_enter", { source: "open_app_fast" })') &&
    appSource.includes("open_app_server_confirmed") &&
    appSource.includes("goToApp({ loginEmail: undefined })") &&
    appSource.includes("readOpenAppOnboardingCache"),
  "Open App must await server onboarding status before routing home"
);

const fetchOnboardingStatusBlock = onboardingRepairSource.slice(
  onboardingRepairSource.indexOf("export async function fetchOnboardingStatus"),
  onboardingRepairSource.indexOf("export async function fetchOnboardingStatusWithTimeout")
);

assertCheck(
  onboardingRepairSource.includes("fetchOnboardingStatusWithTimeout") &&
    fetchOnboardingStatusBlock.includes('action=onboarding-status"') &&
    fetchOnboardingStatusBlock.includes("memberApiHeaders()") &&
    !fetchOnboardingStatusBlock.includes("email: user.email"),
  "onboarding-status request must rely on bearer auth, not body identity"
);

assertCheck(
  cacheSource.includes("userId") &&
    cacheSource.includes("24 * 60 * 60 * 1000") &&
    cacheSource.includes("readOpenAppOnboardingCache") &&
    cacheSource.includes("writeOpenAppOnboardingCache"),
  "Open App cache must store server-confirmed completion per userId for 24 hours"
);

assertCheck(
  goToAppSource.includes("OPEN_APP_STATUS_TIMEOUT_MS = 2000") &&
    goToAppSource.includes('source: "cache_fallback"') &&
    appSource.includes("OPEN_APP_FAILSAFE_MS"),
  "Open App must time out onboarding-status and fail safe without hanging"
);

console.log("open app onboarding tests ok");
