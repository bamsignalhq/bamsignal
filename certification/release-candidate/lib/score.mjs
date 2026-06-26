import {
  buildGoNoGoRecommendation,
  buildInstitutionReadinessScore
} from "../../../server/services/institutionalReadinessVerification.js";
import { RC_CERT_BLOCK_ON_NO_GO, RC_CERT_DECISIONS } from "../../../shared/releaseCandidateCertificationSubsystems.mjs";

export function buildRcOverallScore(subsystemScores) {
  const normalized = subsystemScores.map((item) => ({
    score: item.score,
    status: item.status
  }));
  return buildInstitutionReadinessScore(normalized);
}

export function buildRcReleaseDecision(overallScore, criticalIssues, warnings, blockers) {
  const recommendation = buildGoNoGoRecommendation(
    overallScore,
    criticalIssues.map((item) => ({ title: item.title, detail: item.detail })),
    warnings.map((item) => ({ title: item.title, detail: item.detail })),
    blockers
  );

  return {
    releaseDecision: recommendation.verdict,
    releaseDecisionLabel: RC_CERT_DECISIONS[recommendation.verdict] || recommendation.label,
    releaseDecisionDetail: recommendation.detail,
    passed: RC_CERT_BLOCK_ON_NO_GO ? recommendation.verdict !== "no-go" : true
  };
}

export function countPassedChecks(subsystemScores) {
  return subsystemScores.filter((item) => item.passed).length;
}

export function buildSignOffs(decision, timestamp) {
  const status =
    decision.releaseDecision === "go"
      ? "APPROVED"
      : decision.releaseDecision === "go-with-conditions"
        ? "APPROVED WITH CONDITIONS"
        : "NOT APPROVED";

  return [
    { role: "Chief Engineer", status, signedAt: timestamp },
    { role: "DevOps", status, signedAt: timestamp },
    { role: "QA", status, signedAt: timestamp },
    { role: "Founder", status, signedAt: timestamp }
  ];
}

export function buildBlockers(subsystemScores, criticalIssues) {
  const blockers = [];

  for (const subsystem of subsystemScores.filter((item) => !item.passed)) {
    blockers.push({
      id: `blocker-${subsystem.id}`,
      subsystemId: subsystem.id,
      title: `${subsystem.label} certification failed`,
      detail: subsystem.summary,
      severity: subsystem.status === "critical" ? "critical" : "high"
    });
  }

  for (const issue of criticalIssues) {
    blockers.push({
      id: issue.id,
      subsystemId: issue.subsystemId,
      title: issue.title,
      detail: issue.detail,
      severity: "critical"
    });
  }

  return blockers;
}
