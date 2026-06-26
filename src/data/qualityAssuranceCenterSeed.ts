import {
  QA_AUTOMATED_TESTS,
  QA_CERTIFICATION_SECTIONS,
  QA_CERTIFICATION_SUBSYSTEMS,
  QA_MANUAL_CHECKS,
  QA_REPORT_TYPES,
  type QAAutomatedTestId,
  type QACertificationSectionId
} from "../constants/qualityAssuranceCenter";
import type {
  QAAutomatedTestRun,
  QACertificationApproval,
  QACertificationHistoryEntry,
  QAManualCheckRun,
  QAReleaseGate,
  QASubsystemScore
} from "../types/qualityAssuranceCenter";

const NOW = "2026-06-26T12:00:00.000Z";

const AUTOMATED_STATUS: Record<QAAutomatedTestId, QAAutomatedTestRun["status"]> = {
  build: "pass",
  unit: "pass",
  integration: "pass",
  "server-import": "pass",
  database: "pass",
  api: "pass",
  notifications: "pass",
  payments: "pass",
  otp: "warning",
  concierge: "pass",
  operations: "pass",
  "feature-flags": "pass",
  "remote-config": "warning",
  "platform-health": "pass",
  "abuse-protection": "pass",
  observability: "pass"
};

export const QA_AUTOMATED_TEST_SEED: QAAutomatedTestRun[] = QA_AUTOMATED_TESTS.map((test) => ({
  id: test.id,
  label: test.label,
  status: AUTOMATED_STATUS[test.id],
  durationMs: [4200, 1800, 2400, 890, 1200, 1600, 2100, 1900, 1400, 3200, 1500, 600, 700, 1100, 950, 1300][
    QA_AUTOMATED_TESTS.findIndex((item) => item.id === test.id)
  ] ?? 1000,
  lastRunAt: NOW,
  detail:
    AUTOMATED_STATUS[test.id] === "warning"
      ? "Non-blocking warnings detected — review before release"
      : "All assertions passed"
}));

const MANUAL_STATUS: Record<string, QAManualCheckRun["status"]> = {
  android: "pass",
  iphone: "pass",
  tablet: "pass",
  chrome: "pass",
  safari: "warning",
  firefox: "pass",
  edge: "pass",
  "slow-network": "warning",
  offline: "pass",
  "dark-mode": "pass"
};

export const QA_MANUAL_CHECK_SEED: QAManualCheckRun[] = QA_MANUAL_CHECKS.map((check) => ({
  id: check.id,
  label: check.label,
  status: MANUAL_STATUS[check.id] ?? "pass",
  testedBy: "qa@bamsignal.com",
  lastRunAt: NOW,
  notes:
    MANUAL_STATUS[check.id] === "warning"
      ? "Minor layout variance — documented for release notes"
      : undefined
}));

const SECTION_GATE_STATUS: Record<QACertificationSectionId, QAReleaseGate["status"]> = {
  "certification-summary": "pass",
  "automated-tests": "warning",
  "manual-qa": "warning",
  "cross-browser": "warning",
  "mobile-testing": "pass",
  "regression-tests": "pass",
  performance: "pass",
  security: "pass",
  accessibility: "warning",
  "production-readiness": "pass"
};

export const QA_RELEASE_GATE_SEED: QAReleaseGate[] = QA_CERTIFICATION_SECTIONS.map((section, index) => {
  const status = SECTION_GATE_STATUS[section.id];
  return {
    id: `qrg_${index + 1}`,
    gateRef: `QRG-2026-${String(index + 1).padStart(4, "0")}`,
    name: section.label,
    sectionId: section.id,
    status,
    blocksRelease: status === "failed",
    detail:
      status === "pass"
        ? "All checks passed for this release gate."
        : status === "warning"
          ? "Warnings present — review required but release not blocked."
          : "Failed checks block production deployment.",
    evaluatedAt: NOW
  };
});

const SUBSYSTEM_SCORES: Record<string, number> = {
  automated: 94,
  manual: 88,
  "cross-browser": 86,
  mobile: 96,
  regression: 97,
  performance: 93,
  security: 95,
  accessibility: 84,
  production: 92
};

function scoreToGateStatus(score: number): QASubsystemScore["status"] {
  if (score >= 92) return "pass";
  if (score >= 80) return "warning";
  return "failed";
}

export const QA_SUBSYSTEM_SCORE_SEED: QASubsystemScore[] = QA_CERTIFICATION_SUBSYSTEMS.map(
  (subsystem) => ({
    id: subsystem.id,
    label: subsystem.label,
    score: SUBSYSTEM_SCORES[subsystem.id] ?? 90,
    status: scoreToGateStatus(SUBSYSTEM_SCORES[subsystem.id] ?? 90)
  })
);

export const QA_CERTIFICATION_APPROVAL_SEED: QACertificationApproval[] = [
  { role: "engineer", status: "approved", signedBy: "engineering@bamsignal.com", signedAt: NOW },
  { role: "qa", status: "approved", signedBy: "qa@bamsignal.com", signedAt: NOW },
  { role: "founder", status: "pending" }
];

export const QA_CERTIFICATION_HISTORY_SEED: QACertificationHistoryEntry[] = [
  {
    id: "qch_001",
    certificationRef: "QAC-2026-0018",
    version: "v1.0.15-18",
    overallScore: 91,
    releaseBlocked: false,
    certifiedAt: "2026-06-26T08:00:00.000Z",
    certifiedBy: "qa@bamsignal.com"
  },
  {
    id: "qch_002",
    certificationRef: "QAC-2026-0017",
    version: "v1.0.15-17",
    overallScore: 88,
    releaseBlocked: false,
    certifiedAt: "2026-06-24T16:30:00.000Z",
    certifiedBy: "qa@bamsignal.com"
  },
  {
    id: "qch_003",
    certificationRef: "QAC-2026-0016",
    version: "v1.0.15-16",
    overallScore: 72,
    releaseBlocked: true,
    certifiedAt: "2026-06-22T11:00:00.000Z",
    certifiedBy: "engineering@bamsignal.com"
  }
];

export const QA_REPORT_SEED = QA_REPORT_TYPES.map((report) => ({
  id: report.id,
  label: report.label,
  lastGeneratedAt: report.id === "release-certification-pdf" ? NOW : undefined
}));
