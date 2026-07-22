/**
 * Production certification orchestrator — single launch gate result.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { validateEnterpriseStartup } from "./enterpriseStartupValidation.mjs";
import { validateOperationSecrets } from "./operationSecretValidation.mjs";
import { resolveStartupMode } from "./startupExecutionMode.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

export const PRODUCTION_CERT_VERSION = "1.5.0";

/**
 * @param {string} command
 * @param {string[]} [args]
 */
export function runNpmScript(command, args = []) {
  const started = Date.now();
  const result = spawnSync("npm", ["run", command, ...args], {
    cwd: rootPath,
    encoding: "utf8",
    env: { ...process.env, CI: process.env.CI || "true" },
    shell: process.platform === "win32"
  });
  return {
    command: `npm run ${command}${args.length ? ` ${args.join(" ")}` : ""}`,
    passed: result.status === 0,
    durationMs: Date.now() - started,
    stdout: (result.stdout || "").slice(-4000),
    stderr: (result.stderr || "").slice(-4000),
    exitCode: result.status ?? 1
  };
}

export function evaluateEnvironmentCertification(env = process.env) {
  const mode = resolveStartupMode(env);
  const startup = validateEnterpriseStartup(env, { mode: mode === "production" ? "production" : mode });
  const secrets = validateOperationSecrets(env, { mode: mode === "production" ? "production" : mode });
  const passed = startup.ok && secrets.ok;
  return {
    id: "environment",
    label: "Environment",
    passed,
    status: passed ? "PASS" : "FAIL",
    mode,
    startupOk: startup.ok,
    secretsOk: secrets.ok,
    criticalCount: startup.critical.length + secrets.critical.length,
    warningCount: startup.warnings.length + secrets.warnings.length
  };
}

export function buildProductionCertReport(checks = [], options = {}) {
  const passed = checks.every((check) => check.passed !== false);
  const sections = checks.map((check) => ({
    id: check.id,
    label: check.label,
    status: check.passed ? "PASS" : "FAIL",
    durationMs: check.durationMs || 0
  }));

  return {
    certificationVersion: PRODUCTION_CERT_VERSION,
    suite: "production",
    title: passed ? "Production Ready" : "Production Not Ready",
    passed,
    status: passed ? "PASS" : "FAIL",
    generatedAt: new Date().toISOString(),
    environment: process.env.NODE_ENV || "unknown",
    profile: options.profile || "local",
    sections,
    checks,
    summary: sections.map((s) => `${s.label}: ${s.status}`).join(" · ")
  };
}

export function readLatestMigrationCert() {
  const path = join(rootPath, "certification/migrations/reports/latest.json");
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function readGitMetadata() {
  const commit = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: rootPath,
    encoding: "utf8"
  });
  const branch = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd: rootPath,
    encoding: "utf8"
  });
  return {
    commitSha: commit.status === 0 ? commit.stdout.trim() : null,
    branch: branch.status === 0 ? branch.stdout.trim() : null
  };
}

function readLatestMigrationVersion() {
  const migrationsDir = join(rootPath, "migrations");
  if (!existsSync(migrationsDir)) return null;
  try {
    const entries = readdirSync(migrationsDir)
      .filter((name) => /^\d{4}_.+\.sql$/i.test(name))
      .sort();
    const latest = entries[entries.length - 1] || null;
    return latest ? latest.replace(/\.sql$/i, "") : null;
  } catch {
    return null;
  }
}

export function buildCertificationManifest(report, options = {}) {
  const git = readGitMetadata();
  const migrationCert = readLatestMigrationCert();
  const checksPassed = report.checks.filter((c) => c.passed !== false).length;
  const checksFailed = report.checks.filter((c) => c.passed === false).length;
  const migrationVersion = options.migrationVersion || readLatestMigrationVersion();

  return {
    certificationVersion: report.certificationVersion || PRODUCTION_CERT_VERSION,
    gitCommitSha: git.commitSha,
    branch: git.branch,
    buildTimestamp: report.generatedAt,
    migrationVersion,
    migrationCertStatus: migrationCert?.status || null,
    environment: report.environment || process.env.NODE_ENV || "unknown",
    nodeVersion: process.version,
    dockerImage: process.env.DOCKER_IMAGE || process.env.COOLIFY_FQDN || null,
    checksExecuted: report.checks.length,
    checksPassed,
    checksFailed,
    overallStatus: report.passed ? "PASS" : "FAIL",
    title: report.title,
    profile: report.profile || "local"
  };
}

export function writeProductionCertReports(report, outputDir) {
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, "latest.json"), JSON.stringify(report, null, 2));

  const manifest = buildCertificationManifest(report);
  writeFileSync(join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2));

  const md = [
    `# ${report.title}`,
    "",
    `**Certification version:** ${report.certificationVersion}`,
    `**Generated:** ${report.generatedAt}`,
    `**Overall:** ${report.status}`,
    "",
    "## Results",
    "",
    "| Section | Status | Duration |",
    "|---------|--------|----------|",
    ...report.sections.map(
      (s) => `| ${s.label} | ${s.status} | ${s.durationMs}ms |`
    ),
    "",
    report.passed
      ? "All production certification checks passed."
      : "One or more checks failed. Resolve blockers before launch cutover."
  ].join("\n");

  writeFileSync(join(outputDir, "latest.md"), md);

  const manifestMd = [
    "# Certification Manifest",
    "",
    `**Overall status:** ${manifest.overallStatus}`,
    `**Certification version:** ${manifest.certificationVersion}`,
    `**Git commit:** ${manifest.gitCommitSha || "unknown"}`,
    `**Branch:** ${manifest.branch || "unknown"}`,
    `**Build timestamp:** ${manifest.buildTimestamp}`,
    `**Migration version:** ${manifest.migrationVersion || "unknown"}`,
    `**Environment:** ${manifest.environment}`,
    `**Node version:** ${manifest.nodeVersion}`,
    `**Docker image:** ${manifest.dockerImage || "n/a"}`,
    "",
    "## Checks",
    "",
    `- Executed: ${manifest.checksExecuted}`,
    `- Passed: ${manifest.checksPassed}`,
    `- Failed: ${manifest.checksFailed}`
  ].join("\n");

  writeFileSync(join(outputDir, "manifest.md"), manifestMd);

  return {
    jsonPath: join(outputDir, "latest.json"),
    mdPath: join(outputDir, "latest.md"),
    manifestJsonPath: join(outputDir, "manifest.json"),
    manifestMdPath: join(outputDir, "manifest.md")
  };
}
