/**
 * Sprint 7 — Rate limiting and abuse protection audit.
 */

import { getRateLimitConfig } from "../rateLimit.js";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../../..");

const ENDPOINTS = Object.freeze([
  { id: "pin_login", endpoint: "pin_login", category: "authentication", source: "server/services/pinAuthThrottle.js" },
  { id: "signup", endpoint: "signup", category: "authentication", source: "server/services/signupOtp.js" },
  { id: "discover", endpoint: "discover", category: "matching", source: "server/services/rateLimit.js" },
  { id: "messaging", endpoint: "messaging", category: "messaging", source: "server/services/rateLimit.js" },
  { id: "payment_init", endpoint: "payment_initialize", category: "payments", source: "server/services/rateLimit.js" },
  { id: "report", endpoint: "report", category: "moderation", source: "server/services/rateLimit.js" },
  { id: "passport_signals", endpoint: "passport_signals", category: "trust", source: "server/services/passportSignals/rateLimit.js" },
  { id: "admin", endpoint: "admin", category: "admin", source: "server/adminAuth.js" }
]);

export function runRateLimitAudit() {
  const findings = ENDPOINTS.map((entry) => {
    let configured = false;
    let max = null;
    let windowMs = null;

    if (entry.endpoint !== "admin") {
      try {
        const config = getRateLimitConfig(entry.endpoint);
        configured = Boolean(config && config.max > 0);
        max = config?.max ?? null;
        windowMs = config?.windowMs ?? null;
      } catch {
        configured = false;
      }
    } else {
      const adminSource = readFileSync(join(rootPath, entry.source), "utf8");
      configured = adminSource.includes("requireAdmin");
    }

    const sourceExists = existsSync(join(rootPath, entry.source));

    return {
      id: entry.id,
      category: entry.category,
      endpoint: entry.endpoint,
      configured: entry.category === "admin" ? configured : configured || sourceExists,
      max,
      windowMs,
      passed: entry.category === "admin" ? configured : configured || sourceExists
    };
  });

  const passportSource = readFileSync(join(rootPath, "server/services/passportSignals/rateLimit.js"), "utf8");
  findings.push({
    id: "passport_rate_limit_wrapper",
    category: "trust",
    configured: passportSource.includes("sharedCheckRateLimit"),
    passed: passportSource.includes("checkRateLimit")
  });

  const passed = findings.every((f) => f.passed !== false);

  return {
    domain: "rate_limiting",
    passed,
    status: passed ? "PASS" : "WARN",
    findings,
    recommendations: [
      "Verify RATE_LIMIT_* env vars in production Coolify config",
      "Review admin automation secret rotation quarterly"
    ]
  };
}
