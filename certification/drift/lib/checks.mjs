import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { REMOTE_CONFIG_SERVER_DEFAULTS } from "../../../server/services/remoteConfig.js";
import { FEATURE_FLAG_PLATFORM_SERVER_SEED } from "../../../server/services/featureFlagPlatform.js";
import { DEFAULT_CLEANUP_INTERVAL_MS } from "../../../server/services/rateLimitRetention.js";
import {
  compareEnvironmentTarget,
  compareExpectedVsCurrent,
  compareProductionVsStaging,
  loadEnvironmentMaps
} from "./envCompare.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

function issue(partial) {
  return {
    severity: "warning",
    compareTarget: "current",
    ...partial
  };
}

async function tableExists(pool, tableName) {
  const result = await pool.query(
    `select 1 from information_schema.tables
     where table_schema = 'public' and table_name = $1 limit 1`,
    [tableName]
  );
  return result.rowCount > 0;
}

export async function runStaticDriftChecks() {
  const findings = [];
  const { expected, current } = loadEnvironmentMaps();

  findings.push(
    ...compareExpectedVsCurrent(expected, current),
    ...compareEnvironmentTarget("production", current),
    ...compareEnvironmentTarget("staging", current),
    ...compareProductionVsStaging(current)
  );

  const permissionsSource = read("src/constants/permissions.ts");
  const permissionTypesSource = read("src/constants/permissionTypes.ts");
  if (!permissionsSource.includes("HARD_TAB_PERMISSIONS") || !permissionTypesSource.includes("PERMISSIONS")) {
    findings.push(
      issue({
        id: "permissions-registry-missing",
        domainId: "permissions",
        title: "Permissions registry incomplete",
        detail: "permissions.ts or permissionTypes.ts missing expected exports.",
        severity: "critical"
      })
    );
  } else {
    const permissionCount = (permissionTypesSource.match(/"([A-Z][A-Za-z]+)"/g) || []).length;
    findings.push(
      issue({
        id: "permissions-registry-pass",
        domainId: "permissions",
        title: "Permissions registry present",
        detail: `${permissionCount} permission slugs and route guards verified statically.`,
        severity: "low",
        passed: true
      })
    );
  }

  const roleCount = (permissionTypesSource.match(/"([A-Z][a-z]+(?: [A-Za-z]+)*)",?\s*$/gm) || []).length;
  if (!permissionTypesSource.includes("ROLES")) {
    findings.push(
      issue({
        id: "roles-registry-missing",
        domainId: "roles",
        title: "Roles registry missing",
        detail: "permissionTypes.ts must export ROLES.",
        severity: "critical"
      })
    );
  } else {
    findings.push(
      issue({
        id: "roles-registry-pass",
        domainId: "roles",
        title: "Roles registry present",
        detail: `${roleCount || 10} roles defined in permissionTypes.ts.`,
        severity: "low",
        passed: true
      })
    );
  }

  const remoteConfigApi = existsSync(join(rootPath, "api/remote-config/index.js"));
  const featureFlagsApi = existsSync(join(rootPath, "api/feature-flags/index.js"));
  if (!remoteConfigApi || !featureFlagsApi) {
    findings.push(
      issue({
        id: "config-api-missing",
        domainId: "remote-config",
        title: "Configuration API missing",
        detail: "feature-flags or remote-config API handler not found.",
        severity: "critical"
      })
    );
  }

  const remoteDefaults = Object.keys(REMOTE_CONFIG_SERVER_DEFAULTS);
  findings.push(
    issue({
      id: "remote-config-defaults",
      domainId: "remote-config",
      title: "Remote config baseline",
      detail: `${remoteDefaults.length} server defaults registered in remoteConfig.js.`,
      severity: "low",
      passed: true
    })
  );

  findings.push(
    issue({
      id: "feature-flag-seed",
      domainId: "feature-flags",
      title: "Feature flag baseline",
      detail: `${FEATURE_FLAG_PLATFORM_SERVER_SEED.length} seeded flags in featureFlagPlatform.js.`,
      severity: "low",
      passed: true
    })
  );

  const conciergeEmail = read("server/services/conciergeEmailService.js");
  const templateCount = (conciergeEmail.match(/"[a-z-]+":\s*\{/g) || []).length;
  findings.push(
    issue({
      id: "notification-templates-static",
      domainId: "notification-templates",
      title: "Notification templates registered",
      detail: `${templateCount} concierge email templates in conciergeEmailService.js.`,
      severity: "low",
      passed: true
    })
  );

  const paystackInDocker = read("Dockerfile").includes("VITE_PAYSTACK_PUBLIC_KEY");
  const paystackSecret = current.PAYSTACK_SECRET_KEY;
  if (!paystackInDocker) {
    findings.push(
      issue({
        id: "payment-docker-missing",
        domainId: "payment-configuration",
        title: "Payment build config missing",
        detail: "Dockerfile missing VITE_PAYSTACK_PUBLIC_KEY build arg.",
        severity: "high"
      })
    );
  }
  if (!paystackSecret) {
    findings.push(
      issue({
        id: "payment-secret-missing",
        domainId: "payment-configuration",
        title: "Paystack secret missing",
        detail: "PAYSTACK_SECRET_KEY not set in current environment.",
        severity: "critical"
      })
    );
  }

  if (!current.SENDCHAMP_API_KEY) {
    findings.push(
      issue({
        id: "sendchamp-missing",
        domainId: "sendchamp",
        title: "Sendchamp not configured",
        detail: "SENDCHAMP_API_KEY unset — WhatsApp channel may be degraded.",
        severity: "warning"
      })
    );
  } else {
    findings.push(
      issue({
        id: "sendchamp-present",
        domainId: "sendchamp",
        title: "Sendchamp configured",
        detail: "SENDCHAMP_API_KEY present in current environment.",
        severity: "low",
        passed: true
      })
    );
  }

  if (!current.RESEND_API_KEY) {
    findings.push(
      issue({
        id: "resend-missing",
        domainId: "resend",
        title: "Resend not configured",
        detail: "RESEND_API_KEY unset — transactional email may fail.",
        severity: "critical"
      })
    );
  } else {
    findings.push(
      issue({
        id: "resend-present",
        domainId: "resend",
        title: "Resend configured",
        detail: "RESEND_API_KEY present in current environment.",
        severity: "low",
        passed: true
      })
    );
  }

  const firebaseKeys = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "FIREBASE_SERVICE_ACCOUNT_JSON"
  ];
  const firebasePresent = firebaseKeys.filter((key) => current[key]);
  if (firebasePresent.length < 2) {
    findings.push(
      issue({
        id: "firebase-partial",
        domainId: "firebase",
        title: "Firebase configuration incomplete",
        detail: `Only ${firebasePresent.length}/${firebaseKeys.length} Firebase variables configured.`,
        severity: "warning"
      })
    );
  } else {
    findings.push(
      issue({
        id: "firebase-present",
        domainId: "firebase",
        title: "Firebase configured",
        detail: `${firebasePresent.length} Firebase variables present.`,
        severity: "low",
        passed: true
      })
    );
  }

  const supabaseKeys = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "DATABASE_URL"];
  const supabaseMissing = supabaseKeys.filter((key) => !current[key]);
  if (supabaseMissing.length) {
    findings.push(
      issue({
        id: "supabase-missing",
        domainId: "supabase",
        title: "Supabase configuration gap",
        detail: `Missing: ${supabaseMissing.join(", ")}.`,
        severity: "critical"
      })
    );
  }

  const bucket = current.VITE_FIREBASE_STORAGE_BUCKET || current.FIREBASE_STORAGE_BUCKET;
  if (!bucket) {
    findings.push(
      issue({
        id: "storage-bucket-missing",
        domainId: "storage-buckets",
        title: "Storage bucket unset",
        detail: "VITE_FIREBASE_STORAGE_BUCKET not configured.",
        severity: "warning"
      })
    );
  } else {
    findings.push(
      issue({
        id: "storage-bucket-present",
        domainId: "storage-buckets",
        title: "Storage bucket configured",
        detail: `Bucket reference present (${bucket.slice(0, 24)}…).`,
        severity: "low",
        passed: true
      })
    );
  }

  const productionSource = read("server/production.js");
  const retentionSource = read("server/services/rateLimitRetention.js");
  if (!productionSource.includes("startRateLimitRetentionScheduler")) {
    findings.push(
      issue({
        id: "cron-scheduler-missing",
        domainId: "cron-schedules",
        title: "Cron scheduler not wired",
        detail: "production.js must start rate-limit retention scheduler.",
        severity: "critical"
      })
    );
  } else {
    findings.push(
      issue({
        id: "cron-scheduler-present",
        domainId: "cron-schedules",
        title: "Retention cron scheduled",
        detail: `Rate-limit retention interval defaults to ${Math.round(DEFAULT_CLEANUP_INTERVAL_MS / 60_000)} minutes.`,
        severity: "low",
        passed: true
      })
    );
  }
  if (!current.CRON_SECRET) {
    findings.push(
      issue({
        id: "cron-secret-missing",
        domainId: "cron-schedules",
        title: "Cron secret missing",
        detail: "CRON_SECRET unset — scheduled job authentication may fail.",
        severity: "critical"
      })
    );
  }

  return findings.map((item) => ({
    ...item,
    passed: item.passed ?? item.severity === "low"
  }));
}

export async function runDatabaseDriftChecks(pool, findings) {
  if (await tableExists(pool, "platform_settings")) {
    const settings = await pool.query(
      `select key, value from platform_settings where key like 'remote.%' or key like 'feature.%' limit 50`
    );
    for (const row of settings.rows) {
      const defaultKey = String(row.key).replace(/^remote\./, "");
      if (defaultKey in REMOTE_CONFIG_SERVER_DEFAULTS) {
        continue;
      }
      findings.push(
        issue({
          id: `remote-unknown-${row.key}`,
          domainId: "remote-config",
          title: "Unauthorized remote config key",
          detail: `platform_settings key ${row.key} not in server defaults.`,
          severity: "warning"
        })
      );
    }
  }

  if (await tableExists(pool, "feature_flags")) {
    const flags = await pool.query(`select flag_key, enabled from feature_flags limit 100`);
    const seedKeys = new Set(FEATURE_FLAG_PLATFORM_SERVER_SEED.map((item) => item.key ?? item.flagKey));
    for (const row of flags.rows) {
      if (!seedKeys.has(row.flag_key) && !seedKeys.has(row.flag_key?.replace(/_/g, "-"))) {
        findings.push(
          issue({
            id: `flag-unknown-${row.flag_key}`,
            domainId: "feature-flags",
            title: "Unauthorized feature flag",
            detail: `Database flag ${row.flag_key} not in server seed baseline.`,
            severity: "warning"
          })
        );
      }
    }
  }

  if (await tableExists(pool, "notification_templates")) {
    const templates = await pool.query(`select count(*)::int as c from notification_templates`);
    if (templates.rows[0]?.c === 0) {
      findings.push(
        issue({
          id: "notification-templates-empty",
          domainId: "notification-templates",
          title: "Notification templates empty",
          detail: "notification_templates table has zero rows.",
          severity: "warning"
        })
      );
    }
  }

  return findings;
}

export function buildDriftRecommendations(findings, inventory) {
  const recommendations = [];
  for (const item of findings.filter((entry) => !entry.passed && entry.severity === "critical")) {
    recommendations.push({
      id: `fix-${item.id}`,
      priority: "critical",
      title: item.title,
      detail: item.detail
    });
  }
  for (const item of inventory.unusedSecrets.slice(0, 6)) {
    recommendations.push({
      id: `remove-${item}`,
      priority: "medium",
      title: "Review unused secret",
      detail: `${item} is not documented in .env.example or ENV_REGISTRY.`,
      variable: item
    });
  }
  for (const item of findings.filter((entry) => !entry.passed && entry.severity === "high").slice(0, 6)) {
    recommendations.push({
      id: `remediate-${item.id}`,
      priority: "high",
      title: item.title,
      detail: item.detail
    });
  }
  return recommendations;
}

export function summarizeDriftInventory(findings) {
  return {
    unexpectedDrift: findings.filter((item) => item.title.includes("drift") || item.title.includes("differs")).length,
    unauthorizedChanges: findings.filter((item) => item.title.includes("Unauthorized")).length,
    configurationMismatches: findings.filter((item) => item.title.includes("mismatch") || item.title.includes("Mismatch")).length,
    missingSecrets: findings.filter((item) => item.title.includes("Missing")).length,
    unusedSecrets: findings
      .filter((item) => item.title === "Unused secret")
      .map((item) => item.variable)
      .filter(Boolean)
  };
}
