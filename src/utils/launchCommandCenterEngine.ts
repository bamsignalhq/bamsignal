import type { LaunchCommandCenterBundle } from "../types/launchCommandCenter";
import { buildLaunchCommandCenterBundle } from "./launchCommandCenterLogic";
import {
  listLaunchCommandBlockers,
  listLaunchCommandDeployments,
  listLaunchCommandIncidents,
  listLaunchCommandSections,
  listLaunchCommandServices,
  listLaunchReadinessScores
} from "./launchCommandCenterStore";

export function buildLiveLaunchCommandCenterBundle(): LaunchCommandCenterBundle {
  return buildLaunchCommandCenterBundle({
    readinessScores: listLaunchReadinessScores(),
    blockers: listLaunchCommandBlockers(),
    sections: listLaunchCommandSections(),
    criticalServices: listLaunchCommandServices(),
    incidents: listLaunchCommandIncidents(),
    deployments: listLaunchCommandDeployments()
  });
}

export { buildLaunchCommandCenterBundle };
