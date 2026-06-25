import type { LaunchControlCenterBundle } from "../types/launchControlCenter";
import type { LaunchControlSectionId } from "../constants/launchControlCenter";
import {
  buildLaunchControlSummary,
  filterBlockersBySection,
  filterRisksBySection
} from "./launchControlCenterLogic";
import {
  listLaunchApprovals,
  listLaunchBlockers,
  listLaunchChecklist,
  listLaunchDependencies,
  listLaunchReadiness,
  listLaunchRecommendations,
  listLaunchRisks,
  listLaunchTimeline
} from "./launchControlCenterStore";

export function buildLaunchControlCenterBundle(
  sectionId: LaunchControlSectionId = "readiness"
): LaunchControlCenterBundle {
  const readiness = listLaunchReadiness();
  const checklist = listLaunchChecklist();
  const blockers = listLaunchBlockers();
  const risks = listLaunchRisks();
  const approvals = listLaunchApprovals();

  return {
    generatedAt: new Date().toISOString(),
    summary: buildLaunchControlSummary(readiness, checklist, blockers, risks, approvals),
    readiness: sectionId === "readiness" || sectionId === "launch-checklist" ? readiness : readiness,
    checklist:
      sectionId === "launch-checklist" || sectionId === "readiness" ? checklist : checklist,
    blockers: filterBlockersBySection(blockers, sectionId),
    risks: filterRisksBySection(risks, sectionId),
    dependencies: listLaunchDependencies(),
    timeline: listLaunchTimeline(),
    approvals,
    recommendations: listLaunchRecommendations()
  };
}
