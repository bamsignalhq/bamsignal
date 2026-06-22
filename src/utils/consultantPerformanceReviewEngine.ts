import { CONSULTANT_PERFORMANCE_REVIEWS_BRAND } from "../constants/consultantPerformanceReviews";
import type { ConciergeConsultantActivity } from "../types/conciergeConsultantDirectory";
import type { ConciergeScheduledMeeting } from "../types/conciergeConsultantDirectory";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { ConsultantPerformanceReviewBundle } from "../types/consultantPerformanceReviews";
import {
  listConciergeConsultantActivity,
  listConciergeConsultantMeetings,
  listConciergeConsultants,
  listMembersForConsultant
} from "./conciergeConsultantDirectoryStore";
import { buildConsultantPerformanceReviewBundle as buildBundle } from "./consultantPerformanceReviewLogic";

export { CONSULTANT_PERFORMANCE_REVIEWS_BRAND };

export function buildConsultantPerformanceReviewBundle(input: {
  consultantId: string;
  consultantName: string;
  members?: ConciergeMemberRecord[];
  activity?: ConciergeConsultantActivity[];
  meetings?: ConciergeScheduledMeeting[];
}): ConsultantPerformanceReviewBundle {
  return buildBundle({
    consultantId: input.consultantId,
    consultantName: input.consultantName,
    members: input.members ?? listMembersForConsultant(input.consultantId),
    activity: input.activity ?? listConciergeConsultantActivity(input.consultantId),
    meetings: input.meetings ?? listConciergeConsultantMeetings(input.consultantId)
  });
}

export function buildConsultantPerformanceReviewBundleById(
  consultantId: string
): ConsultantPerformanceReviewBundle | null {
  const consultant = listConciergeConsultants().find((entry) => entry.id === consultantId);
  if (!consultant) return null;

  return buildConsultantPerformanceReviewBundle({
    consultantId: consultant.id,
    consultantName: consultant.name
  });
}
