import type { EnterpriseApiCenterBundle } from "../types/enterpriseApiCenter";
import { buildEnterpriseApiCenterBundle } from "./enterpriseApiCenterLogic";
import {
  listEnterpriseApiEndpoints,
  listEnterpriseApiFailedJobs,
  listEnterpriseApiToolRuns
} from "./enterpriseApiCenterStore";

export function buildLiveEnterpriseApiCenterBundle(): EnterpriseApiCenterBundle {
  return buildEnterpriseApiCenterBundle({
    endpoints: listEnterpriseApiEndpoints(),
    failedJobs: listEnterpriseApiFailedJobs(),
    toolRuns: listEnterpriseApiToolRuns()
  });
}

export { buildEnterpriseApiCenterBundle };
