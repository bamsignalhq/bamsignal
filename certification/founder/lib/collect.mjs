import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FOUNDER_CERT_SUBSYSTEMS } from "../../../shared/founderCertificationSubsystems.mjs";
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

function subsystem(id, label, score, status, summary, source, issues = []) {
  return { id, label, score, status, summary, source, issues };
}

function issue(id, subsystemId, title, detail, severity) {
  return { id, subsystemId, title, detail, severity };
}

function staticScore(passed, total) {
  if (!total) return 0;
  return Math.round((passed / total) * 100);
}

function certSubsystem(id, label, report, scoreKey, passedKey, failDetail) {
  if (!report) {
    return subsystem(
      id,
      label,
      0,
      "warning",
      `No ${label.toLowerCase()} certification snapshot — run certify command.`,
      "pending",
      [issue(`${id}_pending`, id, `${label} certification pending`, failDetail, "warning")]
    );
  }
  const score = report[scoreKey] ?? 0;
  const passed = Boolean(report[passedKey]);
  const status = passed ? scoreToReadinessResult(score, false) : "critical";
  const issues = passed
    ? []
    : [issue(`${id}_failed`, id, `${label} certification failed`, failDetail, "critical")];
  return subsystem(id, label, score, status, `${label} certification ${passed ? "passed" : "failed"}.`, "cert-report", issues);
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
  const issues = failed.map((item, index) =>
    issue(
      `${id}_${index}`,
      id,
      item.title,
      item.detail,
      item.critical ? "critical" : "warning"
    )
  );
  const summary =
    failed.length === 0
      ? `${label} controls verified (${score}%).`
      : `${failed.length} gap(s) in ${label.toLowerCase()} controls.`;
  return subsystem(id, label, score, status, summary, "static", issues);
}

export function readReleaseCandidate() {
  const buildInfo = readJson("src/buildInfo.ts") ? null : null;
  try {
    const source = read("src/buildInfo.ts");
    const version = source.match(/BUILD_VERSION = "([^"]+)"/)?.[1] ?? "unknown";
    const code = source.match(/BUILD_CODE = "([^"]+)"/)?.[1] ?? "0";
    const cache = source.match(/CACHE_VERSION = "([^"]+)"/)?.[1] ?? "";
    return cache || `bamsignal-v${version}-${code}`;
  } catch {
    return "unknown";
  }
}

export function collectFounderSubsystemScores() {
  const securityReport = readJson("certification/security/reports/latest.json");
  const performanceReport = readJson("certification/performance/reports/latest.json");
  const reliabilityReport = readJson("certification/reliability/reports/latest.json");

  const scores = [
    staticSubsystem("qa", "QA", [
      {
        pass: existsSync(join(rootPath, "scripts/test-quality-assurance.mjs")),
        critical: true,
        title: "QA certification center tests",
        detail: "scripts/test-quality-assurance.mjs missing"
      },
      {
        pass: read("package.json").includes("test:quality-assurance"),
        critical: true,
        title: "QA test script",
        detail: "test:quality-assurance not in package.json"
      },
      {
        pass: read("src/constants/qualityAssuranceCenter.ts").includes("QA_AUTOMATED_TESTS"),
        critical: false,
        title: "QA automated test registry",
        detail: "QA automated tests not registered"
      }
    ]),
    certSubsystem(
      "security",
      "Security",
      securityReport,
      "securityScore",
      "passed",
      "Run npm run certify:security and resolve critical/high findings."
    ),
    performanceReport
      ? certSubsystem(
          "performance",
          "Performance",
          performanceReport,
          "performanceScore",
          "passed",
          "Run npm run certify:performance after build."
        )
      : staticSubsystem("performance", "Performance", [
          {
            pass: existsSync(join(rootPath, "certification/performance/run.mjs")),
            critical: true,
            title: "Performance certification runner",
            detail: "certification/performance/run.mjs missing"
          },
          {
            pass: read("package.json").includes("certify:performance"),
            critical: false,
            title: "certify:performance script",
            detail: "Performance cert command not wired"
          }
        ]),
    certSubsystem(
      "reliability",
      "Reliability",
      reliabilityReport,
      "reliabilityScore",
      "passed",
      "Run npm run certify:reliability and verify failure recovery."
    ),
    staticSubsystem("observability", "Observability", [
      {
        pass: read("server/services/observability.js").includes("logThresholdedAlert"),
        critical: true,
        title: "Thresholded alerts",
        detail: "Observability alerts missing"
      },
      {
        pass: read("src/constants/productionObservabilityAdmin.ts").includes("/hard/observability"),
        critical: false,
        title: "Observability admin route",
        detail: "Observability center route missing"
      },
      {
        pass: read("server/production.js").includes("/ready"),
        critical: true,
        title: "Production readiness probe",
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
    staticSubsystem("payments", "Payments", [
      {
        pass: read("server/services/paystackWebhookHandler.js").includes("verifyPaystackWebhookSignature"),
        critical: true,
        title: "Paystack webhook signature",
        detail: "Webhook signature verification missing"
      },
      {
        pass: read("server/services/paymentInitializeThrottle.js").includes("rateLimitIp"),
        critical: true,
        title: "Payment initialize throttle",
        detail: "Payment abuse throttle missing"
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
      },
      {
        pass: read("scripts/test-signup-protection.mjs").length > 0,
        critical: false,
        title: "Signup protection tests",
        detail: "OTP protection tests missing"
      }
    ]),
    staticSubsystem("messaging", "Messaging", [
      {
        pass: read("src/constants/internalMessagingAdmin.ts").includes("/hard/messages"),
        critical: false,
        title: "Messaging admin route",
        detail: "Messaging dashboard route missing"
      },
      {
        pass: read("shared/contactGuardCore.mjs").includes("scanTextForContactLeak"),
        critical: true,
        title: "Contact leak guard",
        detail: "Messaging contact guard missing"
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
        critical: false,
        title: "Email retry policy",
        detail: "Outbound email retry missing"
      }
    ]),
    staticSubsystem("concierge", "Concierge", [
      {
        pass: read("src/constants/operationsCenter.ts").includes("/hard/concierge"),
        critical: true,
        title: "Concierge operations route",
        detail: "Concierge operations center missing"
      },
      {
        pass: existsSync(join(rootPath, "certification/e2e/scenarios/07-concierge.mjs")),
        critical: false,
        title: "Concierge e2e scenario",
        detail: "Concierge certification scenario missing"
      }
    ]),
    staticSubsystem("abuse-protection", "Abuse Protection", [
      {
        pass: read("src/constants/abuseProtectionAdmin.ts").includes("/hard/abuse-protection"),
        critical: true,
        title: "Abuse protection center",
        detail: "Abuse protection route missing"
      },
      {
        pass: read("src/constants/abuseProtection.ts").includes("payment-abuse"),
        critical: false,
        title: "Payment abuse monitor",
        detail: "Abuse monitors incomplete"
      }
    ]),
    staticSubsystem("readiness", "Readiness", [
      {
        pass: read("src/constants/institutionalReadinessAdmin.ts").includes("/hard/readiness"),
        critical: true,
        title: "Institutional readiness route",
        detail: "Readiness audit route missing"
      },
      {
        pass: read("server/services/institutionalReadinessVerification.js").includes("buildGoNoGoRecommendation"),
        critical: true,
        title: "Go/no-go recommendation engine",
        detail: "Readiness decision engine missing"
      }
    ]),
    staticSubsystem("release", "Release", [
      {
        pass: read("src/constants/launchInfrastructureAdmin.ts").includes("launch-infrastructure"),
        critical: false,
        title: "Launch infrastructure",
        detail: "Launch infrastructure dashboard missing"
      },
      {
        pass: read("scripts/build-android-release.mjs").includes("verify"),
        critical: false,
        title: "Android release verification",
        detail: "Android release asset verification missing"
      }
    ]),
    staticSubsystem("backup", "Backup", [
      {
        pass: read("src/constants/disasterRecoveryAdmin.ts").includes("/hard/disaster-recovery"),
        critical: true,
        title: "Disaster recovery center",
        detail: "Backup/recovery route missing"
      },
      {
        pass: read("docs/operations/environment/disaster-recovery.md").length > 100,
        critical: false,
        title: "Disaster recovery runbook",
        detail: "DR documentation missing"
      }
    ]),
    staticSubsystem("governance", "Governance", [
      {
        pass: read("src/constants/institutionalGovernanceAdmin.ts").includes("/hard/governance"),
        critical: false,
        title: "Governance center",
        detail: "Governance route missing"
      },
      {
        pass: read("server/middleware/governanceAuthorization.js").length > 0,
        critical: true,
        title: "Governance authorization middleware",
        detail: "Governance middleware missing"
      }
    ]),
    staticSubsystem("api", "API", [
      {
        pass: read("src/constants/apiPlatformAdmin.ts").includes("/hard/api-platform"),
        critical: false,
        title: "API platform route",
        detail: "API platform center missing"
      },
      {
        pass: read("src/constants/enterpriseApiCenterAdmin.ts").includes("/hard/api"),
        critical: false,
        title: "Enterprise API center",
        detail: "Enterprise API route missing"
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
        pass: read("src/utils/featureFlagPlatformLogic.ts").includes("buildFeatureFlagPlatformBundle"),
        critical: false,
        title: "Feature flag engine",
        detail: "Feature flag logic missing"
      }
    ]),
    staticSubsystem("remote-config", "Remote Config", [
      {
        pass: existsSync(join(rootPath, "server/services/remoteConfig.js")),
        critical: true,
        title: "Remote config service",
        detail: "server/services/remoteConfig.js missing"
      },
      {
        pass: existsSync(join(rootPath, "api/remote-config/index.js")),
        critical: false,
        title: "Remote config API",
        detail: "Remote config API route missing"
      }
    ])
  ];

  const order = Object.fromEntries(FOUNDER_CERT_SUBSYSTEMS.map((item, index) => [item.id, index]));
  return scores.sort((a, b) => (order[a.id] ?? 0) - (order[b.id] ?? 0));
}

export function flattenIssues(subsystems) {
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

export function buildResolvedSinceLastRelease(previous, currentCritical, currentWarnings) {
  if (!previous) return [];
  const prevKeys = new Set(
    [...(previous.criticalIssues || []), ...(previous.warnings || [])].map((item) => item.id)
  );
  const currentKeys = new Set([...currentCritical, ...currentWarnings].map((item) => item.id));
  const resolved = [];
  for (const key of prevKeys) {
    if (!currentKeys.has(key)) resolved.push(key);
  }
  return resolved;
}
