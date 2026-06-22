import {
  MEMBER_DASHBOARD_PRIVACY_COPY,
  MEMBER_JOURNEY_ID_LABEL,
  MEMBER_JOURNEY_HEALTH_LABELS,
  MEMBER_JOURNEY_STAGE_LABELS
} from "../constants/memberDashboard";
import { SUCCESS_STORY_VISIBILITY_LABELS } from "../constants/conciergeSuccessStoryConsent";
import { JOURNEY_STORY_CATEGORY_LABELS } from "../constants/journeyStoryCategories";
import { CONCIERGE_INTRO_OUTCOME_LABELS } from "../constants/conciergeConsultant";
import { JOURNEY_MILESTONE_LABELS } from "../constants/journeyMilestones";
import {
  SIGNAL_CONCIERGE_CONSULTATION_CHANNELS,
  SIGNAL_CONCIERGE_STATUS_LABELS,
  SIGNAL_CONCIERGE_TIERS,
  type SignalConciergeStatus
} from "../constants/signalConcierge";
import type { ConciergeIntroductionOutcome } from "../constants/conciergeConsultant";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { SignalConciergeApplication } from "../types/signalConcierge";
import type {
  AssignedConsultantSummary,
  IntroductionSummary,
  MemberConsultantDetail,
  MemberDashboardBundle,
  MemberDashboardOverview,
  MemberIntroductionBuckets,
  MemberIntroductionItem,
  MemberJourneyHealth,
  MemberJourneyStage,
  MemberNotificationSummary,
  MemberRelationshipJourney,
  MemberSuccessStorySummary,
  MemberTimelineEntry,
  MemberUpcomingItem,
  RecentMeetingSummary,
  RelationshipMilestoneSummary,
  UpcomingMeetingSummary
} from "../types/memberDashboard";
import { getMemberStewardName } from "./conciergeMemberStewardship";
import { listConsultationMeetings } from "./consultationScheduler";
import { getUpcomingConsultationEventForMember } from "./CalendarEngine";
import { getMeetingLinkForMember } from "./MeetingLinkEngine";

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

function tierLabel(application: SignalConciergeApplication, member?: ConciergeMemberRecord | null): string | undefined {
  const tierId = member?.preferredTier ?? application.preferredTier;
  if (!tierId) return undefined;
  return SIGNAL_CONCIERGE_TIERS.find((tier) => tier.id === tierId)?.landingName ?? tierId;
}

export function buildMemberDashboardOverview(
  application: SignalConciergeApplication,
  member?: ConciergeMemberRecord | null
): MemberDashboardOverview {
  const currentStage = deriveJourneyStage(application.status);
  const health = deriveJourneyHealth(application, member);
  const journeyId = application.journeyId ?? member?.journeyId;
  const consultantName = member ? getMemberStewardName(member) ?? undefined : undefined;

  return {
    memberName: application.aboutYou.name,
    journeyId,
    statusLabel: SIGNAL_CONCIERGE_STATUS_LABELS[application.status],
    consultantName,
    tierLabel: tierLabel(application, member),
    dateJoined: application.createdAt,
    lastUpdate: application.updatedAt,
    currentStage,
    stageLabel: MEMBER_JOURNEY_STAGE_LABELS[currentStage],
    health,
    healthLabel: MEMBER_JOURNEY_HEALTH_LABELS[health],
    narrative: `${MEMBER_DASHBOARD_PRIVACY_COPY} ${MEMBER_JOURNEY_ID_LABEL}: ${journeyId ?? "pending"}.`
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
  const meetingLink = getMeetingLinkForMember(application.id);
  if (calendarEvent) {
    return {
      scheduledAt: calendarEvent.scheduledAt,
      channelLabel: meetingLink?.channel.replace("-", " ") ?? calendarEvent.channel.replace("-", " "),
      label: "Upcoming consultation",
      detail: meetingLink?.access.joinUrl
        ? "Your private consultation link is ready — details shared only with you."
        : "Your private consultation — calendar invitations sent to you and your steward."
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
  const journeyId = application.journeyId ?? member?.journeyId;
  const timeline: MemberTimelineEntry[] = [
    {
      id: "tl_submitted",
      label: "Application received",
      detail: "Your private journey began.",
      at: application.createdAt,
      journeyId
    }
  ];

  if (application.consultationScheduledAt) {
    timeline.push({
      id: "tl_consultation_scheduled",
      label: "Consultation scheduled",
      at: application.consultationScheduledAt,
      journeyId
    });
  }

  const TIMELINE_LABELS: Partial<Record<string, string>> = {
    "application-received": "Application received",
    "consultation-completed": "Consultation completed",
    accepted: "Approved",
    introduction: "Introduction",
    "relationship-update": "Relationship milestone",
    archived: "Archive event",
    engagement: "Relationship milestone",
    marriage: "Relationship milestone",
    "success-story": "Success story recorded"
  };

  for (const event of member?.timeline ?? []) {
    timeline.push({
      id: event.id,
      label: TIMELINE_LABELS[event.type] ?? event.label,
      detail: event.detail,
      at: event.at,
      journeyId: event.journeyId ?? journeyId
    });
  }

  if (application.status === "accepted" || application.status === "active-search") {
    timeline.push({
      id: "tl_approved",
      label: "Approved",
      detail: "Welcome to your private concierge journey.",
      at: application.updatedAt,
      journeyId
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

const INTRO_PENDING_OUTCOMES = new Set<ConciergeIntroductionOutcome>(["no-response", "paused"]);
const INTRO_DECLINED_OUTCOMES = new Set<ConciergeIntroductionOutcome>([
  "member-declined",
  "match-declined",
  "not-a-fit"
]);
const INTRO_ACCEPTED_OUTCOMES = new Set<ConciergeIntroductionOutcome>([
  "mutual-interest",
  "still-talking",
  "ongoing",
  "friendship",
  "relationship",
  "exclusive"
]);
const INTRO_COMPLETED_OUTCOMES = new Set<ConciergeIntroductionOutcome>([
  "engaged",
  "married",
  "completed"
]);

function toIntroductionItem(
  intro: ConciergeMemberRecord["introductions"][number],
  journeyId?: string
): MemberIntroductionItem {
  return {
    id: intro.id,
    label: intro.introducedWithName,
    detail: intro.notes || CONCIERGE_INTRO_OUTCOME_LABELS[intro.outcome],
    at: intro.date,
    journeyId
  };
}

export function buildMemberIntroductionBuckets(
  member?: ConciergeMemberRecord | null
): MemberIntroductionBuckets {
  const journeyId = member?.journeyId;
  const introductions = member?.introductions ?? [];
  const pending: MemberIntroductionItem[] = [];
  const accepted: MemberIntroductionItem[] = [];
  const declined: MemberIntroductionItem[] = [];
  const completed: MemberIntroductionItem[] = [];

  for (const intro of introductions) {
    const item = toIntroductionItem(intro, journeyId);
    if (INTRO_DECLINED_OUTCOMES.has(intro.outcome)) {
      declined.push(item);
    } else if (INTRO_COMPLETED_OUTCOMES.has(intro.outcome)) {
      completed.push(item);
    } else if (INTRO_ACCEPTED_OUTCOMES.has(intro.outcome)) {
      accepted.push(item);
    } else if (INTRO_PENDING_OUTCOMES.has(intro.outcome)) {
      pending.push(item);
    } else {
      pending.push(item);
    }
  }

  const history = [...introductions]
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .map((intro) => toIntroductionItem(intro, journeyId));

  return { pending, accepted, declined, completed, history };
}

export function buildMemberConsultantDetail(
  application: SignalConciergeApplication,
  member?: ConciergeMemberRecord | null,
  upcomingMeeting?: UpcomingMeetingSummary
): MemberConsultantDetail {
  const name = member ? getMemberStewardName(member) ?? undefined : undefined;
  const journeyId = application.journeyId ?? member?.journeyId;
  const summary =
    member?.consultantSummary?.lines.join(" · ") ??
    (name
      ? `${name} is your private journey steward — human-led, never algorithmic.`
      : "Your steward will be introduced privately as your journey continues.");

  return {
    name,
    role: "Journey steward",
    availability: name
      ? "Available for scheduled consultations and private follow-ups."
      : "A steward will be assigned after your application is welcomed.",
    messageSummary: summary,
    upcomingMeetingLabel: upcomingMeeting?.label,
    upcomingMeetingAt: upcomingMeeting?.scheduledAt,
    journeyId
  };
}

export function buildMemberUpcomingItems(
  application: SignalConciergeApplication,
  member?: ConciergeMemberRecord | null,
  upcomingMeeting?: UpcomingMeetingSummary
): MemberUpcomingItem[] {
  const journeyId = application.journeyId ?? member?.journeyId;
  const items: MemberUpcomingItem[] = [];

  if (upcomingMeeting) {
    items.push({
      id: "upcoming_consultation",
      kind: "consultation",
      label: upcomingMeeting.label,
      detail: upcomingMeeting.detail,
      scheduledAt: upcomingMeeting.scheduledAt,
      journeyId
    });
  }

  for (const meeting of buildRecentMeetings(application, member)) {
    if (new Date(meeting.at).getTime() >= Date.now()) {
      items.push({
        id: `upcoming_meeting_${meeting.id}`,
        kind: "meeting",
        label: meeting.label,
        detail: meeting.detail,
        scheduledAt: meeting.at,
        journeyId
      });
    }
  }

  for (const task of member?.followUpTasks ?? []) {
    if (task.completed) continue;
    items.push({
      id: task.id,
      kind: "scheduled-call",
      label: "Scheduled follow-up",
      detail: task.title,
      scheduledAt: task.dueAt,
      journeyId
    });
  }

  for (const intro of member?.introductions ?? []) {
    if (intro.outcome === "no-response" || intro.outcome === "mutual-interest") {
      items.push({
        id: `intro_response_${intro.id}`,
        kind: "introduction-response",
        label: "Introduction awaiting response",
        detail: `Confidential introduction with ${intro.introducedWithName}.`,
        scheduledAt: intro.date,
        journeyId
      });
    }
  }

  return items.sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt));
}

export function buildMemberRelationshipJourney(
  application: SignalConciergeApplication,
  member?: ConciergeMemberRecord | null
): MemberRelationshipJourney {
  const milestones =
    member?.journeyMilestoneTimeline?.milestones.map((milestone) => ({
      id: milestone.id,
      label: JOURNEY_MILESTONE_LABELS[milestone.id],
      at: milestone.milestoneAt,
      detail: milestone.note
    })) ?? [];

  const checkIns =
    member?.followUpTasks
      .filter((task) => !task.completed)
      .map((task) => ({
        id: task.id,
        label: task.title,
        at: task.dueAt,
        detail: task.type
      })) ?? [];

  const celebrations = (member?.timeline ?? [])
    .filter((event) => event.type === "engagement" || event.type === "marriage" || event.type === "success-story")
    .map((event) => ({
      id: event.id,
      label: event.label,
      at: event.at,
      detail: event.detail
    }));

  const anniversaries = milestones
    .filter((milestone) => milestone.label.toLowerCase().includes("anniversary"))
    .map((milestone) => ({
      id: milestone.id,
      label: milestone.label,
      at: milestone.at,
      detail: milestone.detail
    }));

  return {
    currentStage: SIGNAL_CONCIERGE_STATUS_LABELS[application.status],
    milestones,
    checkIns,
    celebrations,
    anniversaries
  };
}

export function buildMemberSuccessStorySummary(
  member?: ConciergeMemberRecord | null
): MemberSuccessStorySummary | undefined {
  const consent = member?.successStoryConsent;
  const journeyId = member?.journeyId;
  if (!consent || !journeyId) return undefined;

  const categories =
    consent.storyCategories?.map((category) => JOURNEY_STORY_CATEGORY_LABELS[category.id]) ?? [];
  const bothApproved = consent.partyApprovals.memberA.approved && consent.partyApprovals.memberB.approved;

  return {
    journeyId,
    consentStatus: bothApproved ? "Dual consent recorded" : "Awaiting dual consent",
    categories: categories.length ? categories : ["Categories pending steward review"],
    publicationPermission: SUCCESS_STORY_VISIBILITY_LABELS[consent.visibility],
    detail: "Success stories are never published without dual approval and steward review."
  };
}

export function buildMemberDashboardBundle(
  application: SignalConciergeApplication,
  member?: ConciergeMemberRecord | null
): MemberDashboardBundle {
  const upcomingMeeting = buildUpcomingMeeting(application, member);

  return {
    overview: buildMemberDashboardOverview(application, member),
    consultant: buildAssignedConsultantSummary(application, member),
    consultantDetail: buildMemberConsultantDetail(application, member, upcomingMeeting),
    upcoming: buildMemberUpcomingItems(application, member, upcomingMeeting),
    upcomingMeeting,
    recentMeetings: buildRecentMeetings(application, member),
    introductions: buildIntroductionSummary(member),
    introductionsDetail: buildMemberIntroductionBuckets(member),
    relationshipJourney: buildMemberRelationshipJourney(application, member),
    successStory: buildMemberSuccessStorySummary(member),
    milestones: buildRelationshipMilestoneSummary(application, member),
    notifications: buildMemberNotifications(application),
    timeline: buildMemberTimeline(application, member)
  };
}
