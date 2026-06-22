export type ConciergeEmailTemplateId =
  | "application-received"
  | "consultation-scheduled"
  | "consultation-reminder"
  | "application-approved"
  | "introduction-presented"
  | "relationship-milestone"
  | "archive-congratulations";

export type EmailDeliveryStatus = "queued" | "sent" | "delivered" | "failed";

export type EmailTimelineEntry = {
  status: EmailDeliveryStatus;
  at: string;
  detail?: string;
};

export type ConciergeEmailVariables = {
  firstName?: string;
  memberName?: string;
  consultantName?: string;
  scheduledAt?: string;
  scheduledAtLabel?: string;
  meetingLink?: string;
  meetingChannel?: string;
  milestoneLabel?: string;
  introductionName?: string;
  archiveNote?: string;
  journeyId?: string;
  statusUrl?: string;
};

export type ConciergeEmailRecord = {
  id: string;
  emailId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  journeyId?: string;
  templateId: ConciergeEmailTemplateId;
  subject: string;
  preview: string;
  resendId?: string;
  timeline: EmailTimelineEntry[];
  createdAt: string;
  updatedAt: string;
};

export type ConciergeEmailHistoryEntry = {
  id: string;
  emailId: string;
  memberId: string;
  journeyId?: string;
  templateId: ConciergeEmailTemplateId;
  status: EmailDeliveryStatus;
  subject: string;
  preview: string;
  recordedAt: string;
};

export type MemberEmailBundle = {
  recent: ConciergeEmailRecord[];
  history: ConciergeEmailHistoryEntry[];
  summaryStatus: EmailDeliveryStatus;
  narrative: string;
};

/** Reserved — not implemented. */
export type ConciergeEmailFutureCapability =
  | "ai-summaries"
  | "weekly-reports"
  | "regional-newsletters";

export type ConciergeEmailFutureConfig = {
  capability?: ConciergeEmailFutureCapability;
  enabled?: boolean;
};
