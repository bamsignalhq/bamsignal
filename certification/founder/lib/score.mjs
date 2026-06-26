import {
  buildGoNoGoRecommendation,
  buildInstitutionReadinessScore
} from "../../../server/services/institutionalReadinessVerification.js";
import { FOUNDER_CERT_BLOCK_ON_NO_GO, FOUNDER_CERT_DECISIONS } from "../../../shared/founderCertificationSubsystems.mjs";

export function buildFounderOverallScore(subsystemScores) {
  const normalized = subsystemScores.map((item) => ({
    score: item.score,
    status: item.status
  }));
  return buildInstitutionReadinessScore(normalized);
}

export function buildFounderLaunchDecision(overallScore, criticalIssues, warnings) {
  const recommendation = buildGoNoGoRecommendation(
    overallScore,
    criticalIssues.map((item) => ({ title: item.title, detail: item.detail })),
    warnings.map((item) => ({ title: item.title, detail: item.detail }))
  );

  return {
    releaseDecision: recommendation.verdict,
    releaseDecisionLabel: FOUNDER_CERT_DECISIONS[recommendation.verdict] || recommendation.label,
    releaseDecisionDetail: recommendation.detail,
    passed: FOUNDER_CERT_BLOCK_ON_NO_GO ? recommendation.verdict !== "no-go" : true
  };
}
