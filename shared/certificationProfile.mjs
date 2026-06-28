/**
 * Certification execution profiles — LOCAL (advisory), STAGING (integration), PRODUCTION (release gate).
 */
import { execSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  certificationModeDescription,
  resolveCertificationExecutionMode
} from "./certificationEnvironment.mjs";

export const CERT_PROFILES = ["local", "staging", "production"];

export const CERT_RESULT_STATUS = {
  PASSED: "passed",
  FAILED: "failed",
  SKIPPED: "skipped"
};

const PROVIDER_SECRET_KEYS = {
  database: ["DATABASE_URL"],
  supabase: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
  paystack: ["PAYSTACK_SECRET_KEY"],
  sendchamp: ["SENDCHAMP_API_KEY"],
  resend: ["RESEND_API_KEY"],
  cron: ["CRON_SECRET"],
  commandCenter: ["COMMAND_CENTER_PIN"]
};

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {"local"|"staging"|"production"}
 */
export function resolveCertificationProfile(env = process.env) {
  const explicit = String(env.CERTIFICATION_PROFILE || "").toLowerCase();
  if (CERT_PROFILES.includes(explicit)) return explicit;

  const executionMode = resolveCertificationExecutionMode(env);
  if (executionMode === "production") return "production";
  if (executionMode === "staging") return "staging";
  return "local";
}

/**
 * @param {"local"|"staging"|"production"} profile
 */
export function certificationProfileDescription(profile) {
  switch (profile) {
    case "local":
      return "Local — advisory certification; unavailable infrastructure is SKIPPED, not FAILED.";
    case "staging":
      return "Staging — full integration certification with staging secrets on stable hardware.";
    case "production":
      return "Production — read-only production verification; official Release Candidate gate.";
    default:
      return profile;
  }
}

/**
 * @param {NodeJS.ProcessEnv} [env]
 */
export function detectCertificationPrerequisites(env = process.env) {
  const missingSecrets = {};
  for (const [provider, keys] of Object.entries(PROVIDER_SECRET_KEYS)) {
    const missing = keys.filter((key) => !String(env[key] || "").trim());
    if (missing.length) missingSecrets[provider] = missing;
  }

  return {
    playwright: detectPlaywrightBrowsers(),
    database: !missingSecrets.database,
    supabase: !missingSecrets.supabase,
    paystack: !missingSecrets.paystack,
    sendchamp: !missingSecrets.sendchamp,
    resend: !missingSecrets.resend,
    cron: !missingSecrets.cron,
    commandCenter: !missingSecrets.commandCenter,
    missingSecrets
  };
}

export function detectPlaywrightBrowsers() {
  if (String(process.env.CERTIFICATION_PLAYWRIGHT_READY || "").toLowerCase() === "true") {
    return { ready: true, reason: null };
  }
  if (String(process.env.CERTIFICATION_PLAYWRIGHT_READY || "").toLowerCase() === "false") {
    return { ready: false, reason: "playwright_disabled_by_env" };
  }

  const cacheRoot = process.env.PLAYWRIGHT_BROWSERS_PATH || join(homedir(), "Library", "Caches", "ms-playwright");
  const chromiumMarkers = ["chromium-", "chromium_headless_shell-"];
  if (existsSync(cacheRoot)) {
    try {
      const entries = readdirSync(cacheRoot);
      if (chromiumMarkers.some((prefix) => entries.some((name) => name.startsWith(prefix)))) {
        return { ready: true, reason: null };
      }
    } catch {
      // fall through
    }
  }

  try {
    execSync("npx playwright --version", { stdio: "ignore", timeout: 8000 });
    return { ready: true, reason: null };
  } catch {
    return {
      ready: false,
      reason: "playwright_browsers_missing — run `npx playwright install chromium`"
    };
  }
}

/**
 * @param {"local"|"staging"|"production"} profile
 */
export function profileBlocksRelease(profile) {
  return profile === "staging" || profile === "production";
}

/**
 * @param {"local"|"staging"|"production"} profile
 */
export function profileReportLabel(profile) {
  switch (profile) {
    case "local":
      return "LOCAL";
    case "staging":
      return "STAGING";
    case "production":
      return "PRODUCTION";
    default:
      return String(profile || "LOCAL").toUpperCase();
  }
}

export function buildSkipReason({ requirement, detail, profile }) {
  return {
    status: CERT_RESULT_STATUS.SKIPPED,
    skipped: true,
    passed: false,
    skipReason: requirement,
    skipDetail: detail,
    certificationProfile: profile,
    advisoryOnly: profile === "local"
  };
}

export function mergeExecutionContext(env = process.env) {
  const profile = resolveCertificationProfile(env);
  const executionMode = resolveCertificationExecutionMode(env);
  const prerequisites = detectCertificationPrerequisites(env);

  return {
    profile,
    executionMode,
    profileDescription: certificationProfileDescription(profile),
    executionModeDescription: certificationModeDescription(executionMode),
    prerequisites,
    blocksRelease: profileBlocksRelease(profile),
    reportLabel: profileReportLabel(profile),
    generatedAt: new Date().toISOString()
  };
}
