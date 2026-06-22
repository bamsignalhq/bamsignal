import {
  MEMBER_DASHBOARD_PRIVACY_COPY,
  MEMBER_JOURNEY_HEALTH_LABELS,
  MEMBER_JOURNEY_STAGE_LABELS
} from "../constants/memberDashboard";
import { JOURNEY_MILESTONE_LABELS } from "../constants/journeyMilestones";
import {
  SIGNAL_CONCIERGE_CONSULTATION_CHANNELS,
  SIGNAL_CONCIERGE_STATUS_LABELS,
  type SignalConciergeStatus
} from "../constants/signalConcierge";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { SignalConciergeApplication } from "../types/signalConcierge";
import type {
  AssignedConsultantSummary,
  IntroductionSummary,
  MemberDashboardBundle,
  MemberDashboardOverview,
  MemberJourneyHealth,
  MemberJourneyStage,
  MemberNotificationSummary,
  MemberTimelineEntry,
  RecentMeetingSummary,
  RelationshipMilestoneSummary,
  UpcomingMeetingSummary
} from "../types/memberDashboard";
import { getMemberStewardName } from "./conciergeMemberStewardship";
import { listConsultationMeetings } from "./consultationScheduler";
import { getUpcomingConsultationEventForMember } from "./CalendarEngine";

const STAGE_BY_STATUS: Record<SignalConciergeStatus, MemberJourneyStage> = {
  applied: "application",
  "consultation-scheduled": "consultation",
  "under-review": "review",
  waitlisted: "review",
  accepted: "approved",
  "active-search": "introductions",
  "introductions-in-progress": "introductions",
  relationship: "relationship",
  matched: "relationship",
  exclusive: "relationship",
  engaged: "relationship",
  married: "relationship",
  paused: "application",
  closed: "application",
  "legacy-archive": "legacy"
};

function deriveJourneyStage(status: SignalConciergeStatus): MemberJourneyStage {
  return STAGE_BY_STATUS[status] ?? "application";
}

function deriveJourneyHealth(
  application: SignalConciergeApplication,
  member?: ConciergeMemberRecord | null
): MemberJourneyHealth {
  if (application.status === "paused" || application.status === "closed") return "paused";
  if (
    application.status === "married" ||
    application.status === "engaged" ||
    application.status === "legacy-archive"
  ) {
    return "celebration";
  }
  if (
    application.status === "introductions-in-progress" ||
    application.status === "active-search" ||
    application.status === "relationship" ||
    (member?.communicationJournal.length ?? 0) > 0
  ) {
    return "active";
  }
  return "steady";
}

function channelLabel(channel?: string): string {
  const match = SIGNAL_CONCIERGE_CONSULTATION_CHANNELS.find((item) => item.id === channel);
  return match?.label ?? "Private consultation";
}

export function buildMemberDashboardOverview(
  application: SignalConciergeApplication,
  member?: ConciergeMemberRecord | null
): MemberDashboardOverview {
  const currentStage = deriveJourneyStage(application.status);
  const health = deriveJourneyHealth(application, member);

  return {
    memberName: application.aboutYou.name,
    journeyId: application.journeyId,
    currentStage,
    stageLabel: MEMBER_JOURNEY_STAGE_LABELS[currentStage],
    health,
    healthLabel: MEMBER_JOURNEY_HEALTH_LABELS[health],
    narrative: `${MEMBER_DASHBOARD_PRIVACY_COPY} You are in the ${MEMBER_JOURNEY_STAGE_LABELS[currentStage]} stage.`
  };
}

export function buildAssignedConsultantSummary(
  application: SignalConciergeApplication,
  member?: ConciergeMemberRecord | null
): AssignedConsultantSummary {
  const name = member ? getMemberStewardName(member) ?? undefined : undefined;

  if (!name) {
    return {
      message:
        application.status === "applied"
          ? "A steward will be assigned after your application is received."
          : "Your steward will be introduced privately as your journey continues."
    };
  }

  return {
    name,
    message: `${name} is your private journey steward — human-led, never algorithmic.`
  };
}

export function buildUpcomingMeeting(
  application: SignalConciergeApplication,
  member?: ConciergeMemberRecord | null
): UpcomingMeetingSummary | undefined {
  const calendarEvent = getUpcomingConsultationEventForMember(application.id);
  if (calendarEvent) {
    return {
      scheduledAt: calendarEvent.scheduledAt,
      channelLabel: calendarEvent.channel.replace("-", " "),
      label: "Upcoming consultation",
      detail: "Your private consultation — calendar invitations sent to you and your steward."
    };
  }

  const meetings = listConsultationMeetings()
    .filter((meeting) => meeting.memberId === application.id)
    .filter((meeting) => new Date(meeting.scheduledAt).getTime() >= Date.now())
    .sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt));

  const next = meetings[0];
  if (next) {
    return {
      scheduledAt: next.scheduledAt,
      channelLabel: next.channel.replace("-", " "),
      label: "Upcoming consultation",
      detail: "Your private consultation — details shared only with you."
    };
  }

  if (application.consultationScheduledAt && application.status === "consultation-scheduled") {
    return {
      scheduledAt: application.consultationScheduledAt,
      channelLabel: channelLabel(
        application.consultationPreferences?.preferredChannel ?? application.consultationPreference
      ),
      label: "Upcoming consultation",
      detail: "Your consultation is scheduled. Your steward will guide you privately."
    };
  }

  if (member?.consultationScheduledAt && application.status === "consultation-scheduled") {
    return {
      scheduledAt: member.consultationScheduledAt,
      channelLabel: channelLabel(member.consultationPreference),
      label: "Upcoming consultation",
      detail: "Your consultation is scheduled. Your steward will guide you privately."
    };
  }

  return undefined;
}

export function buildRecentMeetings(
  application: SignalConciergeApplication,
  member?: ConciergeMemberRecord | null
): RecentMeetingSummary[] {
  const journal = member?.communicationJournal ?? [];
  return journal
    .slice()
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, 3)
    .map((entry) => ({
      id: entry.id,
      label: "Private meeting",
      at: entry.date,
      detail: entry.summary
    }));
}

export function buildIntroductionSummary(member?: ConciergeMemberRecord | null): IntroductionSummary {
  const introductions = member?.introductions ?? [];
  if (!introductions.length) {
    return {
      count: 0,
      detail: "Confidential introductions appear here when your steward presents them."
    };
  }

  const latest = introductions[introductions.length - 1];
  return {
    count: introductions.length,
    latestLabel: "Latest introduction",
    detail: latest.notes || "A confidential introduction was presented for your consideration."
  };
}

export function buildRelationshipMilestoneSummary(
  application: SignalConciergeApplication,
  member?: ConciergeMemberRecord | null
): RelationshipMilestoneSummary {
  const milestones = member?.journeyMilestoneTimeline?.milestones ?? [];
  if (milestones.length) {
    const latest = milestones[milestones.length - 1];
    return {
      count: milestones.length,
      latestLabel: JOURNEY_MILESTONE_LABELS[latest.id],
      latestAt: latest.milestoneAt,
      detail: latest.note ?? "A relationship milestone recorded in your private journey."
    };
  }

  if (application.status === "married" || application.status === "engaged") {
    return {
      count: 1,
      latestLabel: SIGNAL_CONCIERGE_STATUS_LABELS[application.status],
      latestAt: application.updatedAt,
      detail: "Your relationship milestone is honored privately within BamSignal."
    };
  }

  return {
    count: 0,
    detail: "Relationship milestones will appear here as your journey deepens."
  };
}

export function buildMemberNotifications(
  application: SignalConciergeApplication
): MemberNotificationSummary[] {
  const notifications: MemberNotificationSummary[] = [
    {
      id: "notif_submitted",
      subject: "Application received",
      preview: "Your Signal Concierge application was received privately.",
      at: application.createdAt
    }
  ];

  if (application.consultationScheduledAt) {
    notifications.push({
      id: "notif_consultation",
      subject: "Consultation scheduled",
      preview: "Your private consultation is on the calendar.",
      at: application.consultationScheduledAt
    });
  }

  if (application.status !== "applied") {
    notifications.push({
      id: "notif_status",
      subject: "Journey update",
      preview: `Your journey stage is now ${SIGNAL_CONCIERGE_STATUS_LABELS[application.status]}.`,
      at: application.updatedAt
    });
  }

  return notifications.sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 5);
}

export function buildMemberTimeline(
  application: SignalConciergeApplication,
  member?: ConciergeMemberRecord | null
): MemberTimelineEntry[] {
  const timeline: MemberTimelineEntry[] = [
    {
      id: "tl_submitted",
      label: "Application submitted",
      detail: "Your private journey began.",
      at: application.createdAt
    }
  ];

  if (application.consultationScheduledAt) {
    timeline.push({
      id: "tl_consultation",
      label: "Consultation scheduled",
      at: application.consultationScheduledAt
    });
  }

  for (const event of member?.timeline ?? []) {
    timeline.push({
      id: event.id,
      label: event.label,
      detail: event.detail,
      at: event.at
    });
  }

  if (application.status !== "applied") {
    timeline.push({
      id: "tl_current",
      label: SIGNAL_CONCIERGE_STATUS_LABELS[application.status],
      detail: "Current journey stage.",
      at: application.updatedAt
    });
  }

  const seen = new Set<string>();
  return timeline
    .filter((entry) => {
      const key = `${entry.label}_${entry.at}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}

export function buildMemberDashboardBundle(
  application: SignalConciergeApplication,
  member?: ConciergeMemberRecord | null
): MemberDashboardBundle {
  return {
    overview: buildMemberDashboardOverview(application, member),
    consultant: buildAssignedConsultantSummary(application, member),
    upcomingMeeting: buildUpcomingMeeting(application, member),
    recentMeetings: buildRecentMeetings(application, member),
    introductions: buildIntroductionSummary(member),
    milestones: buildRelationshipMilestoneSummary(application, member),
    notifications: buildMemberNotifications(application),
    timeline: buildMemberTimeline(application, member)
  };
}
