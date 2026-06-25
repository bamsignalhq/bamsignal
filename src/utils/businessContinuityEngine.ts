import type { BusinessContinuityBundle } from "../types/businessContinuity";
import {
  assessBackupHealth,
  buildContinuityOverviewMetrics,
  buildRiskAssessment,
  deriveOverallContinuityStatus
} from "./businessContinuityLogic";
import {
  getLatestHealthSnapshot,
  listBackupJobs,
  listContinuityExercises,
  listIncidentReports,
  listProviderStatuses,
  listRecoveryPlans
} from "./businessContinuityStore";

export function buildBusinessContinuityBundle(): BusinessContinuityBundle {
  const incidents = listIncidentReports();
  const providerStatuses = listProviderStatuses();
  const backupJobs = listBackupJobs();
  const backupAssessment = assessBackupHealth(backupJobs);
  const activeIncidents = incidents.filter((item) => !["resolved", "closed"].includes(item.status)).length;
  const overallStatus = deriveOverallContinuityStatus(providerStatuses);

  return {
    generatedAt: new Date().toISOString(),
    overviewMetrics: buildContinuityOverviewMetrics(
      incidents,
      providerStatuses,
      backupAssessment,
      overallStatus
    ),
    incidents,
    providerStatuses,
    recoveryPlans: listRecoveryPlans(),
    backupJobs,
    exercises: listContinuityExercises(),
    latestSnapshot: getLatestHealthSnapshot(),
    riskAssessment: buildRiskAssessment(providerStatuses, backupAssessment, activeIncidents),
    overallStatus
  };
}
