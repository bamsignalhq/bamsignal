/**
 * P0 Production Environment Audit — repository scan for process.env / import.meta.env usage.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { DUPLICATE_GROUPS, ENV_REGISTRY } from "./environmentRegistry.mjs";

const SCAN_PATTERNS = [
  /process\.env\.([A-Z][A-Z0-9_]*)/g,
  /process\.env\[['"]([A-Z][A-Z0-9_]*)['"]\]/g,
  /import\.meta\.env\.(VITE_[A-Z0-9_]+)/g,
  /import\.meta\.env\[['"](VITE_[A-Z0-9_]*)['"]\]/g
];

const SKIP_DIRS = new Set(["node_modules", "dist", "android/app/build", ".git", ".gradle"]);
const SCAN_EXT = /\.(js|mjs|ts|tsx|jsx)$/;

export const LEGACY_VARIABLES = new Set([
  "SUPABASE_SECRET_KEY",
  "ADMIN_ACTION_PIN",
  "ADMIN_EMAILS",
  "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY"
]);

export const DEPRECATED_VARIABLES = new Set(["ADMIN_ACTION_PIN", "ADMIN_EMAILS", "SUPABASE_SECRET_KEY"]);

export const TOOLING_VARIABLE_PATTERN =
  /^(LOAD_CERT_|PENTEST_|SMOKE_|CHAOS_|DRIFT_|RC_|ACCESSIBILITY_|DATABASE_PERF_|DATA_INTEGRITY_|FOUNDER_|RELIABILITY_|SECURITY_|DEPENDENCY_|GITHUB_|ANDROID_|PLAY_|JAVA_|READINESS_SMOKE|SMOKE_PORT|IDENTITY_EXPOSURE|LEGACY_SETUP_SMOKE|ADMIN_BOOTSTRAP_SMOKE|SENDCHAMP_TEST_|CERTIFICATION_HEADLESS|CERTIFICATION_SCREENSHOTS|CERTIFICATION_CLEANUP|CERTIFICATION_OUTPUT_DIR|CERTIFICATION_PERF_OUTPUT_DIR|CERTIFICATION_TIMEOUT_MS|CERTIFICATION_DIST_DIR|DEPLOY_ENV|ANDROID_PREPARE_RESET|ANDROID_KEYSTORE_SEARCH|ANDROID_STUDIO_JBR|DIAGNOSTICS_SMOKE|HOME)$/;

export const RUNTIME_DEFAULTS = {
  PORT: "3000",
  HOST: "0.0.0.0",
  NODE_ENV: "development",
  PUBLIC_APP_URL: "https://bamsignal.com",
  APP_TIMEZONE: "Africa/Lagos",
  PAYSTACK_ANDROID_CALLBACK_URL: "com.bamsignal.com://payment-success",
  GOOGLE_CALENDAR_ID: "primary",
  GOOGLE_MEET_CALENDAR_ID: "primary",
  SENDCHAMP_BASE_URL: "https://api.sendchamp.com/api/v1",
  CERTIFICATION_EMAIL_DOMAIN: "cert.bamsignal.com",
  CERTIFICATION_BASE_URL: "https://bamsignal.com",
  RUN_MIGRATIONS_ON_STARTUP: "true",
  TELEGRAM_ENABLE_POLLING: "false",
  VITE_ENABLE_REFERRALS_UI: "false",
  VITE_PHOTO_MODERATION_MODE: "upload_first",
  VITE_SUPPORT_EMAIL: "support@bamsignal.com",
  PHOTO_MODERATION_MODE: "upload_first",
  PGSSLMODE: "disable (local only)",
  SUPPORT_EMAIL_FROM: "BamSignal <support@bamsignal.com>",
  SUPPORT_EMAIL_TO: "support@bamsignal.com",
  ADMIN_BOOTSTRAP_EMAIL: "ops@bamsignal.com",
  LEGACY_SETUP_ENABLED: "false",
  ADMIN_BOOTSTRAP_ENABLED: "false"
};

export function walkSourceFiles(rootDir) {
  /** @type {string[]} */
  const files = [];

  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue;
      const full = join(dir, entry);
      let stat;
      try {
        stat = statSync(full);
      } catch {
        continue;
      }
      if (stat.isDirectory()) walk(full);
      else if (SCAN_EXT.test(entry)) files.push(full);
    }
  }

  walk(rootDir);
  return files;
}

export function scanEnvironmentUsage(rootDir) {
  const registryByName = new Map(
    ENV_REGISTRY.flatMap((entry) => [[entry.name, entry], ...(entry.aliases || []).map((alias) => [alias, entry])])
  );

  /** @type {Map<string, { files: Set<string>, runtime: boolean, buildtime: boolean }>} */
  const usage = new Map();
  const allFiles = walkSourceFiles(rootDir);

  for (const file of allFiles) {
    const rel = relative(rootDir, file);
    if (/certification\/[^/]+\/reports\//.test(rel)) continue;

    let content;
    try {
      content = readFileSync(file, "utf8");
    } catch {
      continue;
    }

    for (const pattern of SCAN_PATTERNS) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(content))) {
        const name = match[1];
        const entry = usage.get(name) || { files: new Set(), runtime: false, buildtime: false };
        entry.files.add(rel);
        if (match[0].includes("import.meta.env") || name.startsWith("VITE_")) {
          entry.buildtime = true;
        } else {
          entry.runtime = true;
        }
        usage.set(name, entry);
      }
    }
  }

  const usageRows = [...usage.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, meta]) => {
      const reg = registryByName.get(name);
      const required = classifyVariable(name, reg);
      return {
        variable: name,
        filesUsed: [...meta.files].sort(),
        fileCount: meta.files.size,
        required,
        optional: required === "optional" || required === "optional-tooling" || required === "legacy",
        scope: meta.buildtime && meta.runtime ? "both" : meta.buildtime ? "buildtime" : "runtime",
        defaultValue: RUNTIME_DEFAULTS[name] ?? null,
        inRegistry: Boolean(reg),
        legacy: LEGACY_VARIABLES.has(name),
        deprecated: DEPRECATED_VARIABLES.has(name),
        group: reg?.group ?? null
      };
    });

  return { allFiles, usageRows, registryByName };
}

function classifyVariable(name, reg) {
  if (reg) return reg.required;
  if (name.endsWith("_RUN_ID") || TOOLING_VARIABLE_PATTERN.test(name)) return "optional-tooling";
  if (LEGACY_VARIABLES.has(name)) return "legacy";
  return "undocumented";
}

export function parseEnvExampleKeys(rootDir) {
  const keys = new Set();
  try {
    for (const line of readFileSync(join(rootDir, ".env.example"), "utf8").split("\n")) {
      const match = line.match(/^([A-Z][A-Z0-9_]*)=/);
      if (match) keys.add(match[1]);
    }
  } catch {
    /* optional */
  }
  return keys;
}

export function buildProductionEnvironmentAuditReport(rootDir) {
  const { allFiles, usageRows } = scanEnvironmentUsage(rootDir);
  const exampleKeys = parseEnvExampleKeys(rootDir);
  const usageNames = new Set(usageRows.map((row) => row.variable));

  const unusedInCode = ENV_REGISTRY.filter(
    (entry) => !usageNames.has(entry.name) && !(entry.aliases || []).some((alias) => usageNames.has(alias))
  ).map((entry) => entry.name);

  const missingFromRegistry = usageRows
    .filter((row) => !row.inRegistry && !row.legacy && row.required === "undocumented")
    .map((row) => row.variable);

  const missingFromExample = usageRows
    .filter(
      (row) =>
        !exampleKeys.has(row.variable) &&
        !TOOLING_VARIABLE_PATTERN.test(row.variable) &&
        !row.legacy &&
        row.fileCount > 0 &&
        row.required !== "optional-tooling"
    )
    .map((row) => row.variable);

  const duplicateAnalysis = DUPLICATE_GROUPS.map((group) => {
    const referenced = group.variables.filter((variable) => usageNames.has(variable));
    return {
      id: group.id,
      canonical: group.canonical,
      variables: group.variables,
      referenced,
      undefinedBehaviourRisk:
        referenced.length > 1
          ? "Multiple aliases read with fallback — mismatched values cause client/server drift or auth failures"
          : referenced.length === 1
            ? "Single alias in use — prefer canonical in new config"
            : "Not referenced in scanned code"
    };
  });

  const cleanup = {
    keep: usageRows.filter((row) => row.inRegistry && !row.deprecated).map((row) => row.variable),
    delete: unusedInCode,
    rename: [
      {
        from: "SUPABASE_SECRET_KEY",
        to: "SUPABASE_SERVICE_ROLE_KEY",
        reason: "legacy alias — remove from Coolify after migration"
      },
      { from: "ADMIN_ACTION_PIN", to: "COMMAND_CENTER_PIN", reason: "deprecated alias" },
      { from: "ADMIN_EMAILS", to: "COMMAND_CENTER_EMAILS", reason: "deprecated alias" },
      {
        from: "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY",
        to: "VITE_PAYSTACK_PUBLIC_KEY",
        reason: "portability alias only"
      }
    ],
    rotate: ENV_REGISTRY.filter((entry) => entry.rotation && !["n/a", "single-use"].includes(entry.rotation)).map(
      (entry) => ({ name: entry.name, rotation: entry.rotation, required: entry.required })
    ),
    stagingEquivalents: ENV_REGISTRY.filter(
      (entry) => entry.envs.includes("staging") && (entry.required === "critical" || entry.required === "warning")
    ).map((entry) => ({ name: entry.name, required: entry.required }))
  };

  return {
    generatedAt: new Date().toISOString(),
    scannedFiles: allFiles.length,
    uniqueVariables: usageRows.length,
    usage: usageRows,
    summary: {
      unusedInCode,
      missingFromRegistry,
      missingFromExample: [...new Set(missingFromExample)].sort(),
      legacyVariables: [...LEGACY_VARIABLES].filter((name) => usageNames.has(name)),
      deprecatedVariables: [...DEPRECATED_VARIABLES].filter((name) => usageNames.has(name)),
      duplicateGroups: duplicateAnalysis
    },
    cleanup,
    duplicateAnalysis
  };
}

export function renderUsageReportMarkdown(report) {
  const lines = [
    "# Environment Usage Report",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `Scanned **${report.scannedFiles}** files · **${report.uniqueVariables}** unique environment variables.`,
    "",
    "## Variable inventory",
    "",
    "| Variable | Required | Scope | Default | Files |",
    "|----------|----------|-------|---------|------:|"
  ];

  for (const row of report.usage) {
    lines.push(
      `| \`${row.variable}\` | ${row.required} | ${row.scope} | ${row.defaultValue ?? "—"} | ${row.fileCount} |`
    );
  }

  lines.push("", "## Runtime references (detail)", "");
  for (const row of report.usage.filter((item) => item.scope !== "buildtime" || item.variable.startsWith("VITE_"))) {
    lines.push(`### \`${row.variable}\``, "");
    for (const file of row.filesUsed.slice(0, 10)) {
      lines.push(`- \`${file}\``);
    }
    if (row.filesUsed.length > 10) lines.push(`- … +${row.filesUsed.length - 10} more`);
    lines.push("");
  }

  lines.push("## Unused registry variables", "");
  lines.push(
    report.summary.unusedInCode.length
      ? report.summary.unusedInCode.map((name) => `- \`${name}\``).join("\n")
      : "_None_"
  );
  lines.push("", "## Undocumented in registry", "");
  lines.push(
    report.summary.missingFromRegistry.length
      ? report.summary.missingFromRegistry.map((name) => `- \`${name}\``).join("\n")
      : "_None_"
  );
  lines.push("", "## Legacy / deprecated", "");
  for (const name of report.summary.legacyVariables) lines.push(`- \`${name}\` (legacy)`);
  for (const name of report.summary.deprecatedVariables) lines.push(`- \`${name}\` (deprecated)`);

  return `${lines.join("\n")}\n`;
}

export function renderCleanupReportMarkdown(report) {
  const { cleanup, duplicateAnalysis } = report;
  const lines = [
    "# Environment Cleanup Report",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `## Variables to keep (${cleanup.keep.length})`,
    "",
    ...cleanup.keep.slice(0, 50).map((name) => `- \`${name}\``),
    cleanup.keep.length > 50 ? `- … +${cleanup.keep.length - 50} more` : "",
    "",
    "## Variables to delete",
    "",
    cleanup.delete.length
      ? cleanup.delete.map((name) => `- \`${name}\` — in registry but not referenced in code`).join("\n")
      : "_None — all registry entries are referenced or intentional build-only vars._",
    "",
    "## Variables to rename",
    "",
    "| From | To | Reason |",
    "|------|-----|--------|"
  ];

  for (const row of cleanup.rename) {
    lines.push(`| \`${row.from}\` | \`${row.to}\` | ${row.reason} |`);
  }

  lines.push("", "## Variables to rotate", "", "| Variable | Policy | Required |", "|----------|--------|----------|");
  for (const row of cleanup.rotate) {
    lines.push(`| \`${row.name}\` | ${row.rotation} | ${row.required} |`);
  }

  lines.push("", "## Duplicate groups — undefined behaviour risk", "");
  for (const group of duplicateAnalysis) {
    lines.push(`### ${group.id}`);
    lines.push(`- Canonical: \`${group.canonical}\``);
    lines.push(`- Referenced: ${group.referenced.map((name) => `\`${name}\``).join(", ") || "none"}`);
    lines.push(`- Risk: ${group.undefinedBehaviourRisk}`, "");
  }

  lines.push("## Staging equivalents required", "");
  for (const row of cleanup.stagingEquivalents) {
    lines.push(`- \`${row.name}\` (${row.required})`);
  }

  return `${lines.join("\n")}\n`;
}

/**
 * Verify startup config and /ready detailed payload alignment.
 * @param {Record<string, unknown>} readiness
 */
export function buildStartupHealthVerification(readiness) {
  const checks = [
    {
      id: "database",
      configSource: "DATABASE_URL → server/config.js → server/db.js",
      readinessField: "database",
      expected: readiness.database === "connected" ? "connected" : "dry-run or disconnected",
      ok: typeof readiness.database === "string"
    },
    {
      id: "paystack",
      configSource: "PAYSTACK_SECRET_KEY → server/config.js",
      readinessField: "paystack",
      expected: "boolean",
      ok: typeof readiness.paystack === "boolean"
    },
    {
      id: "signup-email",
      configSource: "RESEND + SUPABASE_SERVICE_ROLE_KEY → server/supabaseEnv.js",
      readinessField: "signupEmail",
      expected: "boolean",
      ok: typeof readiness.signupEmail === "boolean"
    },
    {
      id: "photo-storage",
      configSource: "SUPABASE_SERVICE_ROLE_KEY → server/services/photoStorage.js",
      readinessField: "photoStorage",
      expected: "boolean",
      ok: typeof readiness.photoStorage === "boolean"
    },
    {
      id: "resend",
      configSource: "RESEND_API_KEY direct",
      readinessField: "resend",
      expected: "boolean",
      ok: typeof readiness.resend === "boolean"
    }
  ];

  return {
    allOk: checks.every((item) => item.ok),
    checks
  };
}
