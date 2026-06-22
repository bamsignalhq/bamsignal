export type WhatsappTemplateId =
  | "consultation-reminder"
  | "meeting-starting-soon"
  | "introduction-accepted"
  | "follow-up-reminder"
  | "milestone-congratulations";

export type WhatsappDeliveryStatus = "queued" | "sent" | "delivered" | "failed";

export type WhatsappTimelineEntry = {
  status: WhatsappDeliveryStatus;
  at: string;
  detail?: string;
};

export type WhatsappVariables = {
  firstName?: string;
  memberName?: string;
  consultantName?: string;
  scheduledAt?: string;
  scheduledAtLabel?: string;
  milestoneLabel?: string;
  introductionName?: string;
  statusUrl?: string;
};

export type ConciergeWhatsappRecord = {
  id: string;
  messageId: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  journeyId?: string;
  templateId: WhatsappTemplateId;
  preview: string;
  sendchampReference?: string;
  timeline: WhatsappTimelineEntry[];
  createdAt: string;
  updatedAt: string;
};

export type ConciergeWhatsappHistoryEntry = {
  id: string;
  messageId: string;
  memberId: string;
  journeyId?: string;
  templateId: WhatsappTemplateId;
  status: WhatsappDeliveryStatus;
  preview: string;
  recordedAt: string;
};

export type MemberWhatsappBundle = {
  recent: ConciergeWhatsappRecord[];
  history: ConciergeWhatsappHistoryEntry[];
  summaryStatus: WhatsappDeliveryStatus;
  narrative: string;
};

/** Reserved — not implemented. */
export type WhatsappFutureCapability = "voice-notes" | "regional-languages" | "ai-assistants";

export type WhatsappFutureConfig = {
  capability?: WhatsappFutureCapability;
  enabled?: boolean;
};
