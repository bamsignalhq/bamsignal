import type {
  QAAutomatedTestRun,
  QACertificationCenterBundle,
  QACertificationSummary,
  QAManualCheckRun,
  QAReleaseGate,
  QASubsystemScore
} from "../types/qualityAssuranceCenter";
import type { QAReleaseGateStatusId } from "../constants/qualityAssuranceCenter";

export function gateStatusBlocksRelease(status: QAReleaseGateStatusId) {
  return status === "failed";
}

export function computeOverallCertificationScore(subsystems: QASubsystemScore[]) {
  if (!subsystems.length) return 0;
  const total = subsystems.reduce((sum, item) => sum + item.score, 0);
  return Math.round(total / subsystems.length);
}

export function buildCertificationSummary(
  releaseGates: QAReleaseGate[],
  automatedTests: QAAutomatedTestRun[],
  manualChecks: QAManualCheckRun[],
  subsystemScores: QASubsystemScore[]
): QACertificationSummary {
  const passCount = releaseGates.filter((item) => item.status === "pass").length;
  const warningCount = releaseGates.filter((item) => item.status === "warning").length;
  const failedCount = releaseGates.filter((item) => item.status === "failed").length;
  const releaseBlocked = releaseGates.some((item) => item.blocksRelease);
  const automatedPassRate = Math.round(
    (automatedTests.filter((item) => item.status === "pass").length / automatedTests.length) * 100
  );
  const manualPassRate = Math.round(
    (manualChecks.filter((item) => item.status === "pass").length / manualChecks.length) * 100
  );

  return {
    overallScore: computeOverallCertificationScore(subsystemScores),
    releaseBlocked,
    passCount,
    warningCount,
    failedCount,
    automatedPassRate,
    manualPassRate
  };
}

export function buildQACertificationCenterBundle(input: {
  subsystemScores: QASubsystemScore[];
  releaseGates: QAReleaseGate[];
  automatedTests: QAAutomatedTestRun[];
  manualChecks: QAManualCheckRun[];
  approvals: QACertificationCenterBundle["approvals"];
  history: QACertificationCenterBundle["history"];
  reports: QACertificationCenterBundle["reports"];
}): QACertificationCenterBundle {
  const summary = buildCertificationSummary(
    input.releaseGates,
    input.automatedTests,
    input.manualChecks,
    input.subsystemScores
  );

  return {
    generatedAt: new Date().toISOString(),
    summary,
    subsystemScores: input.subsystemScores,
    releaseGates: input.releaseGates,
    automatedTests: input.automatedTests,
    manualChecks: input.manualChecks,
    approvals: input.approvals,
    history: input.history,
    reports: input.reports
  };
}

export function filterGatesBySection(releaseGates: QAReleaseGate[], sectionId: string) {
  return releaseGates.filter((item) => item.sectionId === sectionId);
}

export function formatCertificationSummaryLine(summary: QACertificationSummary) {
  const blockLabel = summary.releaseBlocked ? "RELEASE BLOCKED" : "RELEASE CLEARED";
  return `${summary.overallScore}% overall · ${blockLabel} · ${summary.passCount} pass · ${summary.warningCount} warning · ${summary.failedCount} failed`;
}

export function allApprovalsComplete(
  approvals: QACertificationCenterBundle["approvals"]
) {
  return approvals.every((item) => item.status === "approved");
}
