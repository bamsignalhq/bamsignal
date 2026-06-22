import { AI_ASSISTED_CONSULTANT_BRAND } from "../constants/aiAssistedConsultant";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { ConciergeScheduledMeeting } from "../types/conciergeConsultantDirectory";
import type { AIAssistedWorkspaceBundle } from "../types/aiAssistedConsultant";
import {
  listConciergeConsultantMeetings,
  listMembersForConsultant
} from "./conciergeConsultantDirectoryStore";
import { listConciergeMembers } from "./conciergeConsultantStore";
import {
  assertAIAssistedWorkspaceRespectsRules,
  buildAIAssistedWorkspaceBundle as buildBundle
} from "./aiAssistedConsultantLogic";

export { AI_ASSISTED_CONSULTANT_BRAND, assertAIAssistedWorkspaceRespectsRules };

export function buildAIAssistedWorkspaceBundle(input?: {
  members?: ConciergeMemberRecord[];
  meetings?: ConciergeScheduledMeeting[];
  selectedMemberId?: string | null;
  consultantId?: string;
}): AIAssistedWorkspaceBundle {
  const members =
    input?.members ??
    (input?.consultantId ? listMembersForConsultant(input.consultantId) : listConciergeMembers());
  const meetings =
    input?.meetings ??
    (input?.consultantId ? listConciergeConsultantMeetings(input.consultantId) : []);

  return buildBundle({
    members,
    meetings,
    selectedMemberId: input?.selectedMemberId
  });
}

export function getAIAssistedWorkspaceSnapshot(consultantId?: string): AIAssistedWorkspaceBundle {
  return buildAIAssistedWorkspaceBundle({ consultantId });
}
