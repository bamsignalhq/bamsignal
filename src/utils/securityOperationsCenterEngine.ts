import type { SecurityOperationsCenterBundle } from "../types/securityOperationsCenter";
import { buildSecurityOperationsCenterBundle } from "./securityOperationsCenterLogic";
import {
  listSecurityOpsActions,
  listSecurityOpsEvents,
  listSecurityOpsIncidents,
  listSecurityOpsScores
} from "./securityOperationsCenterStore";

export function buildLiveSecurityOperationsCenterBundle(): SecurityOperationsCenterBundle {
  return buildSecurityOperationsCenterBundle({
    scores: listSecurityOpsScores(),
    events: listSecurityOpsEvents(),
    incidents: listSecurityOpsIncidents(),
    recentActions: listSecurityOpsActions()
  });
}

export { buildSecurityOperationsCenterBundle };
