import { GOVERNANCE_PILLARS } from "../constants/governanceFramework";
import type { GovernanceFrameworkBundle } from "../types/governanceFramework";
import {
  listArchitectureGovernancePillars,
  listArchitectureGovernanceTimeline,
  listArchitectureInstitutionCommitments,
  listArchitectureStewardshipPrinciples
} from "./governanceFrameworkLogic";

export function getGovernanceFrameworkBundle(): GovernanceFrameworkBundle {
  return {
    pillars: listArchitectureGovernancePillars(),
    principles: listArchitectureStewardshipPrinciples(),
    timeline: listArchitectureGovernanceTimeline(),
    commitments: listArchitectureInstitutionCommitments(),
    pillarCount: GOVERNANCE_PILLARS.length
  };
}
