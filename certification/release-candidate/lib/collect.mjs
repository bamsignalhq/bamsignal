import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  RC1_DOMAIN_PILLARS,
  RC_CERT_SUBSYSTEMS,
  buildRc1Number
} from "../../../shared/releaseCandidateCertificationSubsystems.mjs";
import { scoreToReadinessResult } from "../../../server/services/institutionalReadinessVerification.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

function readJson(relativePath) {
  if (!existsSync(join(rootPath, relativePath))) return null;
  try {
    return JSON.parse(read(relativePath));
  } catch {
    return null;
  }
}

function subsystem(id, label, score, status, summary, source, passed, issues = []) {
  return { id, label, score, status, summary, source, passed, issues };
}

function issue(id, subsystemId, title, detail, severity) {
  return { id, subsystemId, title, detail, severity };
}

function staticScore(passed, total) {
  if (!total) return 0;
  return Math.round((passed / total) * 100);
}

function certSubsystem(meta, report) {
  if (!report) {
    return subsystem(
      meta.id,
      meta.label,
      0,
      "warning",
      `No ${meta.label.toLowerCase()} snapshot — run ${meta.certify}.`,
      "pending",
      false,
      [
        issue(
          `${meta.id}_pending`,
          meta.id,
          `${meta.label} certification pending`,
          `Run ${meta.certify} before RC certification.`,
          "warning"
        )
      ]
    );
  }

  const score = meta.scoreKey ? report[meta.scoreKey] ?? 0 : report.passed ? 100 : 0;
  const passed = Boolean(report[meta.passedKey]);
  const status = passed ? scoreToReadinessResult(score, false) : "critical";
  const issues = passed
    ? []
    : [
        issue(
          `${meta.id}_failed`,
          meta.id,
          `${meta.label} certification failed`,
          `Latest ${meta.certify} report did not pass.`,
          "critical"
        )
      ];

  return subsystem(
    meta.id,
    meta.label,
    score,
    status,
    `${meta.label} ${passed ? "passed" : "failed"} (${score}%).`,
    "cert-report",
    passed,
    issues
  );
}

function staticSubsystem(id, label, checks) {
  const failed = checks.filter((item) => !item.pass);
  const score = staticScore(checks.length - failed.length, checks.length);
  const criticalFails = failed.filter((item) => item.critical);
  const status = criticalFails.length
    ? "critical"
    : failed.length
      ? "warning"
      : scoreToReadinessResult(score, false);
  const passed = criticalFails.length === 0;
  const issues = failed.map((item, index) =>
    issue(
      `${id}_${index}`,
      id,
      item.title,
      item.detail,
      item.critical ? "critical" : "warning"
    )
  );

  return subsystem(
    id,
    label,
    score,
    status,
    failed.length === 0 ? `${label} controls verified (${score}%).` : `${failed.length} gap(s) in ${label}.`,
    "static",
    passed,
    issues
  );
}

export function readBuildMetadata() {
  try {
    const source = read("src/buildInfo.ts");
    return {
      buildVersion: source.match(/BUILD_VERSION = "([^"]+)"/)?.[1] ?? "unknown",
      buildCode: source.match(/BUILD_CODE = "([^"]+)"/)?.[1] ?? "0",
      cacheVersion: source.match(/CACHE_VERSION = "([^"]+)"/)?.[1] ?? "unknown",
      buildTime: source.match(/BUILD_TIME = "([^"]+)"/)?.[1] ?? null
    };
  } catch {
    return { buildVersion: "unknown", buildCode: "0", cacheVersion: "unknown", buildTime: null };
  }
}

export function readGitCommit() {
  const result = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: rootPath,
    encoding: "utf8"
  });
  const full = result.stdout?.trim() || "unknown";
  return {
    gitCommit: full,
    gitCommitShort: full.slice(0, 12)
  };
}

export function buildRcNumber(buildMeta, runId) {
  return buildRc1Number(buildMeta, runId);
}

export function readEnvironment() {
  return (
    process.env.ENV_TARGET ||
    process.env.DEPLOY_ENV ||
    process.env.NODE_ENV ||
    "production"
  ).toLowerCase();
}

export function collectRcSubsystemScores() {
  const certReports = Object.fromEntries(
    RC_CERT_SUBSYSTEMS.filter((item) => item.certPath).map((item) => [
      item.id,
      readJson(item.certPath)
    ])
  );

  const e2eReport = readJson("certification/e2e/reports/latest.json");

  const scores = [
    staticSubsystem("qa", "QA", [
      {
        pass: existsSync(join(rootPath, "scripts/test-quality-assurance.mjs")),
        critical: true,
        title: "QA certification tests",
        detail: "scripts/test-quality-assurance.mjs missing"
      },
      {
        pass: read("package.json").includes("test:quality-assurance"),
        critical: true,
        title: "QA test script",
        detail: "test:quality-assurance not wired"
      },
      {
        pass: Boolean(e2eReport?.passed ?? e2eReport?.summary?.passed),
        critical: false,
        title: "E2E certification snapshot",
        detail: e2eReport ? "E2E cert snapshot loaded." : "Run npm run certify:e2e for full QA gate."
      }
    ]),
    ...RC_CERT_SUBSYSTEMS.filter((item) => item.certPath).map((meta) =>
      certSubsystem(meta, certReports[meta.id])
    ),
    staticSubsystem("observability", "Observability", [
      {
        pass: read("server/services/observability.js").includes("logThresholdedAlert"),
        critical: true,
        title: "Thresholded alerts",
        detail: "Observability alerts missing"
      },
      {
        pass: read("server/production.js").includes("/ready"),
        critical: true,
        title: "Readiness probe",
        detail: "/ready health gate missing"
      }
    ]),
    staticSubsystem("platform-health", "Platform Health", [
      {
        pass: read("src/constants/platformHealthAdmin.ts").includes("/hard/platform-health"),
        critical: false,
        title: "Platform health route",
        detail: "Platform health center missing"
      },
      {
        pass: read("server/services/systemHealthEngine.js").includes("resolveLiveServiceStatus"),
        critical: true,
        title: "Live service status resolver",
        detail: "System health engine incomplete"
      }
    ]),
    staticSubsystem("notifications", "Notifications", [
      {
        pass: read("src/constants/notificationReliabilityAdmin.ts").includes("notification"),
        critical: false,
        title: "Notification reliability route",
        detail: "Notification center route missing"
      },
      {
        pass: read("server/services/conciergeEmailService.js").includes("withBoundedRetry"),
        critical: true,
        title: "Email retry policy",
        detail: "Outbound email retry missing"
      }
    ]),
    staticSubsystem("payments", "Payments", [
      {
        pass: read("server/services/paystackWebhookHandler.js").includes("verifyPaystackWebhookSignature"),
        critical: true,
        title: "Paystack webhook signature",
        detail: "Webhook signature verification missing"
      },
      {
        pass: read("server/services/purchaseEmail.js").includes("purchase is confirmed"),
        critical: false,
        title: "Purchase confirmation email",
        detail: "Post-payment email path missing"
      }
    ]),
    staticSubsystem("otp", "OTP", [
      {
        pass: read("server/services/signupOtp.js").includes("Too many attempts"),
        critical: true,
        title: "OTP attempt limits",
        detail: "Signup OTP throttling missing"
      }
    ]),
    staticSubsystem("feature-flags", "Feature Flags", [
      {
        pass: read("src/constants/featureFlagPlatformAdmin.ts").includes("feature-flags"),
        critical: true,
        title: "Feature flag platform",
        detail: "Feature flags route missing"
      },
      {
        pass: existsSync(join(rootPath, "api/feature-flags/index.js")),
        critical: false,
        title: "Feature flags API",
        detail: "Feature flags API missing"
      }
    ]),
    staticSubsystem("remote-config", "Remote Config", [
      {
        pass: existsSync(join(rootPath, "server/services/remoteConfig.js")),
        critical: true,
        title: "Remote config service",
        detail: "remoteConfig.js missing"
      },
      {
        pass: existsSync(join(rootPath, "api/remote-config/index.js")),
        critical: false,
        title: "Remote config API",
        detail: "Remote config API missing"
      }
    ]),
    staticSubsystem("backups", "Backups", [
      {
        pass: read("src/constants/disasterRecoveryAdmin.ts").includes("/hard/disaster-recovery"),
        critical: true,
        title: "Disaster recovery center",
        detail: "Backup/recovery route missing"
      },
      {
        pass: existsSync(join(rootPath, "docs/operations/environment/disaster-recovery.md")),
        critical: false,
        title: "Disaster recovery runbook",
        detail: "DR documentation missing"
      }
    ]),
    staticSubsystem("release-management", "Release Management", [
      {
        pass: read("src/constants/launchInfrastructureAdmin.ts").includes("launch-infrastructure"),
        critical: false,
        title: "Launch infrastructure",
        detail: "Launch infrastructure dashboard missing"
      },
      {
        pass: read("scripts/build-android-release.mjs").includes("verify"),
        critical: true,
        title: "Android release verification",
        detail: "Android release asset verification missing"
      }
    ]),
    staticSubsystem("launch-readiness", "Launch Readiness", [
      {
        pass: read("src/constants/institutionalReadinessAdmin.ts").includes("/hard/readiness"),
        critical: true,
        title: "Institutional readiness route",
        detail: "Readiness audit route missing"
      },
      {
        pass: read("server/services/institutionalReadinessVerification.js").includes("buildGoNoGoRecommendation"),
        critical: true,
        title: "Go/no-go engine",
        detail: "Readiness decision engine missing"
      }
    ]),
    staticSubsystem("founder-acceptance", "Founder Acceptance (FAT)", [
      {
        pass: existsSync(join(rootPath, "FOUNDER_ACCEPTANCE_REPORT.md")),
        critical: false,
        title: "Founder acceptance report",
        detail: "FOUNDER_ACCEPTANCE_REPORT.md missing"
      },
      {
        pass: read("package.json").includes("test:founder-acceptance"),
        critical: true,
        title: "Founder acceptance test script",
        detail: "test:founder-acceptance not wired"
      },
      {
        pass: read("src/constants/founderAcceptanceAdmin.ts").includes("/hard/founder-acceptance"),
        critical: false,
        title: "Founder acceptance dashboard",
        detail: "FAT admin route missing"
      }
    ])
  ];

  const order = Object.fromEntries(RC_CERT_SUBSYSTEMS.map((item, index) => [item.id, index]));
  return scores.sort((a, b) => (order[a.id] ?? 999) - (order[b.id] ?? 999));
}

export function flattenRcIssues(subsystems) {
  const criticalIssues = [];
  const warnings = [];
  for (const entry of subsystems) {
    for (const item of entry.issues || []) {
      if (item.severity === "critical") criticalIssues.push(item);
      else warnings.push(item);
    }
  }
  return { criticalIssues, warnings };
}

export function buildDomainPillars(subsystemScores) {
  return RC1_DOMAIN_PILLARS.map((pillar) => {
    const members = subsystemScores.filter((item) => pillar.subsystemIds.includes(item.id));
    const score = members.length
      ? Math.round(members.reduce((total, item) => total + item.score, 0) / members.length)
      : 0;
    const passed = members.length > 0 && members.every((item) => item.passed);
    const failed = members.filter((item) => !item.passed);
    return {
      id: pillar.id,
      label: pillar.label,
      score,
      passed,
      status: passed ? scoreToReadinessResult(score, false) : "critical",
      subsystemIds: pillar.subsystemIds,
      subsystems: members.map((item) => ({
        id: item.id,
        label: item.label,
        score: item.score,
        passed: item.passed
      })),
      summary:
        failed.length === 0
          ? `${pillar.label} domain ready (${score}%).`
          : `${failed.length} subsystem(s) open in ${pillar.label}.`
    };
  });
}
