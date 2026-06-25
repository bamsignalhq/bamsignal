import type { LaunchCertificationReport } from "../types/launchCertification";
import { buildLaunchCertificationReport } from "./launchCertificationLogic";

export function buildInstitutionalLaunchCertification(): LaunchCertificationReport {
  return buildLaunchCertificationReport();
}
