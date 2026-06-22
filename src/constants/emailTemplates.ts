import type {
  ConciergeEmailFutureCapability,
  ConciergeEmailTemplateId,
  EmailDeliveryStatus
} from "../types/conciergeEmail";

export const SIGNAL_CONCIERGE_EMAIL_ENGINE_BRAND = "Signal Concierge Email Engine™";

export const CONCIERGE_EMAIL_PRIVACY_COPY =
  "Journey emails are private, dignified, and never shared publicly.";

/** Permanent Email IDs — BS-EML-YYYY-#### */
export const CONCIERGE_EMAIL_ID_PREFIX = "BS-EML";
export const CONCIERGE_EMAIL_ID_PATTERN = /^BS-EML-\d{4}-\d{4}$/;
export const CONCIERGE_EMAIL_ID_LABEL = "Email ID";

export const CONCIERGE_EMAIL_PROVIDER = "resend" as const;

export const CONCIERGE_EMAIL_TEMPLATES: {
  id: ConciergeEmailTemplateId;
  label: string;
  subject: string;
  preview: string;
  dignityNote: string;
}[] = [
  {
    id: "application-received",
    label: "Application Received",
    subject: "Your Signal Concierge application",
    preview: "We received your application privately. A steward will review with care.",
    dignityNote: "No public listing — your journey remains confidential."
  },
  {
    id: "consultation-scheduled",
    label: "Consultation Scheduled",
    subject: "Your consultation is scheduled",
    preview: "Your private consultation is confirmed. Details are shared only with you.",
    dignityNote: "Calendar details are never posted publicly."
  },
  {
    id: "consultation-reminder",
    label: "Consultation Reminder",
    subject: "Reminder: your Signal Concierge consultation",
    preview: "A gentle reminder about your upcoming private consultation.",
    dignityNote: "Reminders are discreet — one steward, one member."
  },
  {
    id: "application-approved",
    label: "Application Approved",
    subject: "Welcome to your private journey",
    preview: "Your application was approved. Your steward will guide next steps.",
    dignityNote: "Approval is personal — never announced on social feeds."
  },
  {
    id: "introduction-presented",
    label: "Introduction Presented",
    subject: "A confidential introduction",
    preview: "A confidential introduction was presented for your consideration.",
    dignityNote: "Introductions require mutual consent — always."
  },
  {
    id: "relationship-milestone",
    label: "Relationship Milestone",
    subject: "A milestone on your journey",
    preview: "A relationship milestone was recorded in your permanent journey archive.",
    dignityNote: "Milestones are celebrated privately within BamSignal."
  },
  {
    id: "archive-congratulations",
    label: "Archive Congratulations",
    subject: "Congratulations on your journey",
    preview: "Your journey was archived with dignity. The record is permanent.",
    dignityNote: "Archives honor the journey — never deleted, never public."
  }
];

export const CONCIERGE_EMAIL_TEMPLATE_LABELS: Record<ConciergeEmailTemplateId, string> =
  Object.fromEntries(CONCIERGE_EMAIL_TEMPLATES.map((item) => [item.id, item.label])) as Record<
    ConciergeEmailTemplateId,
    string
  >;

export const CONCIERGE_EMAIL_STATUS_ORDER: EmailDeliveryStatus[] = [
  "queued",
  "sent",
  "delivered",
  "failed"
];

export const CONCIERGE_EMAIL_STATUS_LABELS: Record<EmailDeliveryStatus, string> = {
  queued: "Queued",
  sent: "Sent",
  delivered: "Delivered",
  failed: "Failed"
};

export const CONCIERGE_EMAIL_STATUS_HINTS: Record<EmailDeliveryStatus, string> = {
  queued: "Awaiting dignified delivery via Resend.",
  sent: "Handed to Resend — content stays private.",
  delivered: "Member inbox received the communication.",
  failed: "Delivery did not complete — steward may follow up."
};

export const CONCIERGE_EMAIL_FUTURE_CAPABILITIES: {
  id: ConciergeEmailFutureCapability;
  label: string;
}[] = [
  { id: "ai-summaries", label: "AI summaries" },
  { id: "weekly-reports", label: "Weekly reports" },
  { id: "regional-newsletters", label: "Regional newsletters" }
];

/**
 * Future-ready architecture hooks — not implemented.
 * Wire `ConciergeEmailFutureConfig` when capabilities are enabled.
 */
export const CONCIERGE_EMAIL_FUTURE_ARCHITECTURE = {
  aiSummaries: "Generate human-reviewed email previews — never auto-send.",
  weeklyReports: "Steward digest of concierge pipeline health — admin only.",
  regionalNewsletters: "Opt-in diaspora updates — separate from journey emails."
} as const;

export function formatConciergeEmailId(year: number, sequence: number): string {
  return `${CONCIERGE_EMAIL_ID_PREFIX}-${year}-${String(sequence).padStart(4, "0")}`;
}

export function isValidConciergeEmailId(value: string): boolean {
  return CONCIERGE_EMAIL_ID_PATTERN.test(value.trim().toUpperCase());
}

export function normalizeConciergeEmailId(value: string): string {
  return value.trim().toUpperCase();
}

export function parseConciergeEmailId(value: string): { year: number; sequence: number } | null {
  const trimmed = value.trim().toUpperCase();
  const match = trimmed.match(/^BS-EML-(\d{4})-(\d{4})$/);
  if (!match) return null;
  return { year: Number(match[1]), sequence: Number(match[2]) };
}

export function conciergeEmailIdYearFromDate(iso: string): number {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return new Date().getFullYear();
  return new Date(parsed).getFullYear();
}

export function getConciergeEmailTemplate(templateId: ConciergeEmailTemplateId) {
  const template = CONCIERGE_EMAIL_TEMPLATES.find((item) => item.id === templateId);
  if (!template) {
    throw new Error(`Unknown concierge email template: ${templateId}`);
  }
  return template;
}
