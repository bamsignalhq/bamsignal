import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { IntroductionRecord } from "../types/conciergeIntroduction";
import type { HouseInstituteDataPipelineBundle } from "../types/houseInstituteDataPipeline";
import { listConciergeMembers } from "./conciergeConsultantStore";
import { listIntroductionRecords } from "./conciergeIntroductionStore";
import { buildHouseInstituteDataPipelineBundle } from "./houseInstituteDataPipelineLogic";

export { HOUSE_INSTITUTE_DATA_PIPELINE_BRAND } from "../constants/houseInstituteDataPipeline";

export function getHouseInstituteDataPipelineBundle(input?: {
  members?: ConciergeMemberRecord[];
  introductions?: IntroductionRecord[];
}): HouseInstituteDataPipelineBundle {
  return buildHouseInstituteDataPipelineBundle({
    members: input?.members ?? listConciergeMembers(),
    introductions: input?.introductions ?? listIntroductionRecords()
  });
}

export function getHouseInstituteDataPipelineSnapshot(): HouseInstituteDataPipelineBundle {
  return getHouseInstituteDataPipelineBundle();
}
