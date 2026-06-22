/** WhatsApp Notification Engine™ — Sendchamp operational journey notifications. */

export const WHATSAPP_TEMPLATE_IDS = [
  "consultation-reminder",
  "meeting-starting-soon",
  "introduction-accepted",
  "follow-up-reminder",
  "milestone-congratulations"
] as const;

export type WhatsappTemplateId = (typeof WHATSAPP_TEMPLATE_IDS)[number];

export type WhatsappDeliveryStatus = "queued" | "sent" | "delivered" | "failed";

export type WhatsappTimelineEntry = {
  status: WhatsappDeliveryStatus;
  at: string;
  detail?: string;
};

export type WhatsappSendInput = {
  templateId: WhatsappTemplateId;
  to: string;
  memberId: string;
  memberName: string;
  journeyId?: string;
  messageId?: string;
  variables?: Record<string, string | undefined>;
};

export type WhatsappSendResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  messageId?: string;
  templateId?: WhatsappTemplateId;
  preview?: string;
  sendchampReference?: string;
  timeline?: WhatsappTimelineEntry[];
  error?: string;
};
