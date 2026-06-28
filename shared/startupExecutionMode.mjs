/**
 * Startup execution modes — import, smoke boot, development, production.
 *
 * smoke-import  — module graph only (Docker RUN smoke); no HTTP, no validation exit
 * smoke           — HTTP boot with fake/minimal env; /ready may be 503; never exit on missing critical
 * development     — local dev; log report; continue without critical secrets
 * production      — refuse listen() when critical secrets missing
 */

export const STARTUP_MODES = ["smoke-import", "smoke", "development", "production"];

/** @returns {"smoke-import"|"smoke"|"development"|"production"} */
export function resolveStartupMode(env = process.env) {
  const explicit = String(env.BAMSIGNAL_STARTUP_MODE || "").trim().toLowerCase();
  if (STARTUP_MODES.includes(explicit)) return explicit;
  if (env.BAMSIGNAL_SMOKE_IMPORT === "1") return "smoke-import";
  if (env.BAMSIGNAL_SMOKE_STARTUP === "1") return "smoke";
  const nodeEnv = String(env.NODE_ENV || "development").toLowerCase();
  if (nodeEnv === "production") return "production";
  return "development";
}

export function isSmokeImportMode(env = process.env) {
  return resolveStartupMode(env) === "smoke-import";
}

export function isSmokeStartupMode(env = process.env) {
  const mode = resolveStartupMode(env);
  return mode === "smoke" || mode === "smoke-import";
}

export function shouldEnforceCriticalSecrets(env = process.env) {
  return resolveStartupMode(env) === "production";
}

/** Inject minimal fake configuration for smoke HTTP boot tests. */
export function applySmokeStartupFixtures(env = process.env) {
  env.BAMSIGNAL_STARTUP_MODE = "smoke";
  env.BAMSIGNAL_SMOKE_STARTUP = "1";
  if (!env.VITE_PUBLIC_APP_URL?.trim()) {
    env.VITE_PUBLIC_APP_URL = "https://bamsignal.com";
  }
  if (!env.PUBLIC_APP_URL?.trim()) {
    env.PUBLIC_APP_URL = env.VITE_PUBLIC_APP_URL;
  }
}
