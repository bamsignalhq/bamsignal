export type MemberJourneyStage =
  | "application"
  | "consultation"
  | "review"
  | "approved"
  | "introductions"
  | "relationship"
  | "legacy";

export type MemberJourneyHealth = "steady" | "active" | "celebration" | "paused";

export type MemberDashboardOverview = {
  memberName: string;
  journeyId?: string;
  currentStage: MemberJourneyStage;
  stageLabel: string;
  health: MemberJourneyHealth;
  healthLabel: string;
  narrative: string;
};

export type AssignedConsultantSummary = {
  name?: string;
  message: string;
};

export type UpcomingMeetingSummary = {
  scheduledAt: string;
  channelLabel: string;
  label: string;
  detail: string;
};

export type RecentMeetingSummary = {
  id: string;
  label: string;
  at: string;
  detail: string;
};

export type IntroductionSummary = {
  count: number;
  latestLabel?: string;
  detail: string;
};

export type RelationshipMilestoneSummary = {
  count: number;
  latestLabel?: string;
  latestAt?: string;
  detail: string;
};

export type MemberNotificationSummary = {
  id: string;
  subject: string;
  preview: string;
  at: string;
};

export type MemberTimelineEntry = {
  id: string;
  label: string;
  detail?: string;
  at: string;
};

export type MemberDashboardBundle = {
  overview: MemberDashboardOverview;
  consultant: AssignedConsultantSummary;
  upcomingMeeting?: UpcomingMeetingSummary;
  recentMeetings: RecentMeetingSummary[];
  introductions: IntroductionSummary;
  milestones: RelationshipMilestoneSummary;
  notifications: MemberNotificationSummary[];
  timeline: MemberTimelineEntry[];
};

/** Reserved — not implemented. */
export type MemberDashboardFutureCapability =
  | "mobile-app"
  | "push-notifications"
  | "anniversary-celebrations"
  | "success-stories"
  | "legacy-family-view";
