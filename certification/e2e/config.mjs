/**
 * Production E2E Certification™ — environment configuration.
 */
import dotenv from "dotenv";

dotenv.config();

export const config = {
  baseUrl: String(process.env.CERTIFICATION_BASE_URL || "https://bamsignal.com").replace(/\/$/, ""),
  diagnosticsSecret: String(
    process.env.DIAGNOSTICS_SECRET || process.env.CRON_SECRET || ""
  ).trim(),
  emailDomain: String(process.env.CERTIFICATION_EMAIL_DOMAIN || "cert.bamsignal.com")
    .trim()
    .toLowerCase(),
  databaseUrl: String(process.env.DATABASE_URL || "").trim(),
  headless: process.env.CERTIFICATION_HEADLESS !== "false",
  screenshotOnFailure: process.env.CERTIFICATION_SCREENSHOTS !== "false",
  outputDir: String(process.env.CERTIFICATION_OUTPUT_DIR || "certification/e2e/reports").trim(),
  runId: `e2e-${Date.now().toString(36)}`,
  pin: "135790",
  timeoutMs: Number(process.env.CERTIFICATION_TIMEOUT_MS || 120_000)
};

export function certEmail(suffix = "a") {
  return `${config.runId}-${suffix}@${config.emailDomain}`;
}

export function certUsername(suffix = "a") {
  const base = config.runId.replace(/[^a-z0-9]/gi, "").slice(-12).toLowerCase();
  return `cert${base}${suffix}`.slice(0, 20);
}

export function certPhone(suffix = "01") {
  return `0809${String(Date.now()).slice(-7)}${suffix}`.slice(0, 11);
}

export function assertCertificationEnv() {
  const missing = [];
  if (!config.diagnosticsSecret) missing.push("DIAGNOSTICS_SECRET or CRON_SECRET");
  if (!config.databaseUrl) missing.push("DATABASE_URL");
  if (missing.length) {
    const error = new Error(
      `Production certification requires: ${missing.join(", ")}. Set env vars before running npm run certify:e2e.`
    );
    error.code = "CERT_ENV_MISSING";
    throw error;
  }
}
