import type { LaunchInfrastructureReport } from "../types/launchInfrastructure";
import { buildLaunchInfrastructureReport } from "./launchInfrastructureLogic";

export function buildLaunchInfrastructureVerification(): LaunchInfrastructureReport {
  return buildLaunchInfrastructureReport();
}
