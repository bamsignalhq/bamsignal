import {
  buildGoNoGoRecommendation,
  buildInstitutionReadinessScore
} from "../../../server/services/institutionalReadinessVerification.js";
import { RC_CERT_BLOCK_ON_NO_GO, RC_CERT_DECISIONS } from "../../../shared/releaseCandidateCertificationSubsystems.mjs";
import { CERT_RESULT_STATUS } from "../../../shared/certificationProfile.mjs";
import { rcBlocksDeployment } from "../../../shared/releaseCandidateGate.mjs";

export function buildRcOverallScore(subsystemScores) {
  const scored = subsystemScores.filter(
    (item) => item.outcome !== CERT_RESULT_STATUS.SKIPPED && item.status !== "skipped"
  );
  const normalized = (scored.length ? scored : subsystemScores).map((item) => ({
    score: item.score,
    status: item.status
  }));
  return buildInstitutionReadinessScore(normalized);
}

export function buildRcReleaseDecision(overallScore, criticalIssues, warnings, blockers, profile = "production") {
  const recommendation = buildGoNoGoRecommendation(
    overallScore,
    criticalIssues.map((item) => ({ title: item.title, detail: item.detail })),
    warnings.map((item) => ({ title: item.title, detail: item.detail })),
    blockers
  );

  const advisory = profile === "local";

  return {
    releaseDecision: advisory ? "go-with-conditions" : recommendation.verdict,
    releaseDecisionLabel: advisory
      ? "LOCAL ADVISORY"
      : RC_CERT_DECISIONS[recommendation.verdict] || recommendation.label,
    releaseDecisionDetail: advisory
      ? "Local profile — certification is advisory and does not block production release."
      : recommendation.detail,
    passed: advisory ? true : RC_CERT_BLOCK_ON_NO_GO ? recommendation.verdict !== "no-go" : true,
    advisoryOnly: advisory,
    certificationProfile: profile
  };
}

export function countPassedChecks(subsystemScores) {
  return subsystemScores.filter((item) => item.passed || item.outcome === CERT_RESULT_STATUS.SKIPPED).length;
}

export function buildSignOffs(decision, timestamp) {
  const status =
    decision.releaseDecision === "go"
      ? "APPROVED"
      : decision.releaseDecision === "go-with-conditions" || decision.advisoryOnly
        ? "APPROVED WITH CONDITIONS"
        : "NOT APPROVED";

  return [
    { role: "Chief Engineer", status, signedAt: timestamp },
    { role: "DevOps", status, signedAt: timestamp },
    { role: "QA", status, signedAt: timestamp },
    { role: "Founder", status, signedAt: timestamp }
  ];
}

export function buildBlockers(subsystemScores, criticalIssues, profile = "production") {
  const blockers = [];

  if (!rcBlocksDeployment(profile)) {
    return blockers;
  }

  for (const subsystem of subsystemScores.filter((item) => item.blocksRelease && !item.passed)) {
    blockers.push({
      id: `blocker-${subsystem.id}`,
      subsystemId: subsystem.id,
      title: `${subsystem.label} certification ${subsystem.outcome === CERT_RESULT_STATUS.SKIPPED ? "skipped" : "failed"}`,
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
