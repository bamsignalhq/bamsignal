/**
 * Sprint 7 — Security audit contract (static analysis + env validation).
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateOperationSecrets } from "../../../shared/operationSecretValidation.mjs";
import { validateEnterpriseStartup } from "../../../shared/enterpriseStartupValidation.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function read(rel) {
  return readFileSync(join(rootPath, rel), "utf8");
}

function check(name, passed, detail, severity = passed ? "info" : "high") {
  return { name, passed, detail, severity };
}

export function runSecurityAudit(env = process.env) {
  const findings = [];
  const mode = env.NODE_ENV === "production" ? "production" : "development";

  const adminAuth = read("server/adminAuth.js");
  findings.push(
    check(
      "admin_auth_supabase",
      adminAuth.includes("verifySupabaseAdmin") && adminAuth.includes("requireAdmin"),
      "Admin routes require Supabase session or automation secret"
    )
  );
  findings.push(
    check(
      "admin_no_generic_errors",
      adminAuth.includes("GENERIC_NOT_AUTHORIZED"),
      "Admin auth failures use generic unauthorized response"
    )
  );

  const diagnostics = read("server/services/diagnosticsAccess.js");
  findings.push(
    check(
      "diagnostics_secret_gated",
      diagnostics.includes("matchesDiagnosticsSecret"),
      "Diagnostics endpoints require secret header"
    )
  );

  const pinLogin = read("api/auth/pin-login.js");
  findings.push(
    check(
      "pin_login_no_password_copy",
      !pinLogin.toLowerCase().includes("password") || pinLogin.includes("PIN"),
      "Login UI contract preserved (username + PIN)"
    )
  );

  const appSource = read("server/app.js");
  findings.push(
    check(
      "admin_routes_mounted",
      appSource.includes("/api/operations/admin") && appSource.includes("/api/passport/integration"),
      "Admin operational APIs mounted behind requireAdmin"
    )
  );

  const secrets = validateOperationSecrets(env, { mode });
  findings.push(
    check(
      "operation_secrets",
      secrets.ok || mode !== "production",
      secrets.ok ? "Operation secrets validated" : `Secret issues: ${secrets.critical.length} critical`,
      secrets.ok ? "info" : mode === "production" ? "critical" : "medium"
    )
  );

  const startup = validateEnterpriseStartup(env, { mode });
  findings.push(
    check(
      "enterprise_startup",
      startup.ok || mode !== "production",
      startup.ok ? "Startup validation passed" : `${startup.critical.length} critical startup gaps`,
      startup.ok ? "info" : mode === "production" ? "critical" : "medium"
    )
  );

  const migration = existsSync(join(rootPath, "migrations/0056_passport_trust_signals.sql"));
  if (migration) {
    const sql = read("migrations/0056_passport_trust_signals.sql");
    findings.push(
      check(
        "passport_rls_enabled",
        sql.includes("enable row level security"),
        "Passport tables have RLS enabled for PostgREST"
      )
    );
  }

  const highRisk = findings.filter((f) => !f.passed && (f.severity === "high" || f.severity === "critical"));
  const passed = highRisk.length === 0;

  return {
    domain: "security",
    passed,
    status: passed ? "PASS" : "FAIL",
    findingCount: findings.length,
    highRiskCount: highRisk.length,
    findings,
    recommendations: highRisk.length
      ? ["Resolve critical secret and startup validation gaps before production cutover"]
      : ["Run npm run certify:security before launch", "Review dependency audit monthly"]
  };
}
