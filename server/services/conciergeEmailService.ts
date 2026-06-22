/** Signal Concierge Email Engine™ — Resend journey email delivery. */

export const CONCIERGE_EMAIL_TEMPLATE_IDS = [
  "application-received",
  "consultation-scheduled",
  "consultation-reminder",
  "application-approved",
  "introduction-presented",
  "relationship-milestone",
  "archive-congratulations"
] as const;

export type ConciergeEmailTemplateId = (typeof CONCIERGE_EMAIL_TEMPLATE_IDS)[number];

export type ConciergeEmailDeliveryStatus = "queued" | "sent" | "delivered" | "failed";

export type ConciergeEmailTimelineEntry = {
  status: ConciergeEmailDeliveryStatus;
  at: string;
  detail?: string;
};

export type ConciergeEmailSendInput = {
  templateId: ConciergeEmailTemplateId;
  to: string;
  memberId: string;
  memberName: string;
  journeyId?: string;
  emailId?: string;
  variables?: Record<string, string | undefined>;
};

export type ConciergeEmailSendResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  emailId?: string;
  templateId?: ConciergeEmailTemplateId;
  subject?: string;
  preview?: string;
  resendId?: string;
  timeline?: ConciergeEmailTimelineEntry[];
  error?: string;
};
