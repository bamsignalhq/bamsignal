import { MEMBER_JOURNEY_DASHBOARD_BRAND } from "../constants/memberDashboard";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { SignalConciergeApplication } from "../types/signalConcierge";
import type { MemberDashboardBundle } from "../types/memberDashboard";
import { buildMemberDashboardBundle } from "./memberDashboardLogic";

export { MEMBER_JOURNEY_DASHBOARD_BRAND };

export function buildMemberJourneyDashboardBundle(
  application: SignalConciergeApplication,
  member?: ConciergeMemberRecord | null
): MemberDashboardBundle {
  return buildMemberDashboardBundle(application, member);
}

export function getMemberJourneyDashboardSnapshot(
  application: SignalConciergeApplication,
  member?: ConciergeMemberRecord | null
) {
  return buildMemberJourneyDashboardBundle(application, member);
}
