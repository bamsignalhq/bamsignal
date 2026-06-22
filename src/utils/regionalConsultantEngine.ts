import { REGIONAL_CONSULTANT_TEAMS_BRAND } from "../constants/regionalConsultantTeams";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { ConciergeConsultantRecord } from "../types/conciergeConsultantDirectory";
import type { RegionalConsultantTeamsBundle } from "../types/regionalConsultantTeams";
import { listConciergeConsultants } from "./conciergeConsultantDirectoryStore";
import { listConciergeMembers } from "./conciergeConsultantStore";
import { buildRegionalConsultantTeamsBundle as buildBundle } from "./regionalConsultantLogic";

export { REGIONAL_CONSULTANT_TEAMS_BRAND };

export function buildRegionalConsultantTeamsBundle(input?: {
  consultants?: ConciergeConsultantRecord[];
  members?: ConciergeMemberRecord[];
}): RegionalConsultantTeamsBundle {
  return buildBundle({
    consultants: input?.consultants ?? listConciergeConsultants(),
    members: input?.members ?? listConciergeMembers()
  });
}

export function getRegionalConsultantTeamsSnapshot(): RegionalConsultantTeamsBundle {
  return buildRegionalConsultantTeamsBundle();
}
