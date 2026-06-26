import type { QACertificationCenterBundle } from "../types/qualityAssuranceCenter";
import { buildQACertificationCenterBundle } from "./qualityAssuranceCenterLogic";
import {
  listQAAutomatedTests,
  listQACertificationApprovals,
  listQACertificationHistory,
  listQAManualChecks,
  listQAReleaseGates,
  listQAReports,
  listQASubsystemScores
} from "./qualityAssuranceCenterStore";

export function buildLiveQACertificationCenterBundle(): QACertificationCenterBundle {
  return buildQACertificationCenterBundle({
    subsystemScores: listQASubsystemScores(),
    releaseGates: listQAReleaseGates(),
    automatedTests: listQAAutomatedTests(),
    manualChecks: listQAManualChecks(),
    approvals: listQACertificationApprovals(),
    history: listQACertificationHistory(),
    reports: listQAReports()
  });
}

export { buildQACertificationCenterBundle };
