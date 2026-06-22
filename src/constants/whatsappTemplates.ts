import type {
  WhatsappDeliveryStatus,
  WhatsappFutureCapability,
  WhatsappTemplateId
} from "../types/conciergeWhatsapp";

export const WHATSAPP_NOTIFICATION_ENGINE_BRAND = "WhatsApp Notification Engine™";

export const WHATSAPP_OPERATIONAL_RULES =
  "Professional operational messages only. No matchmaking conversations. No WhatsApp relationship coaching.";

export const WHATSAPP_PRIVACY_COPY =
  "WhatsApp supports timely reminders — consultants remain the human relationship stewards.";

/** Permanent Message IDs — BS-WA-YYYY-#### */
export const WHATSAPP_MESSAGE_ID_PREFIX = "BS-WA";
export const WHATSAPP_MESSAGE_ID_PATTERN = /^BS-WA-\d{4}-\d{4}$/;
export const WHATSAPP_MESSAGE_ID_LABEL = "Message ID";

export const WHATSAPP_PROVIDER = "sendchamp" as const;

export const WHATSAPP_TEMPLATES: {
  id: WhatsappTemplateId;
  label: string;
  preview: string;
  operationalNote: string;
}[] = [
  {
    id: "consultation-reminder",
    label: "Consultation Reminder",
    preview: "Reminder: your private Signal Concierge consultation is coming up.",
    operationalNote: "Scheduling reminder only — not a coaching thread."
  },
  {
    id: "meeting-starting-soon",
    label: "Meeting Starting Soon",
    preview: "Your consultation begins shortly. Join via your BamSignal status page.",
    operationalNote: "Time-sensitive access reminder — no conversation."
  },
  {
    id: "introduction-accepted",
    label: "Introduction Accepted",
    preview: "An introduction was accepted. Next steps stay in BamSignal — not on WhatsApp.",
    operationalNote: "Status update only — never matchmaking chat."
  },
  {
    id: "follow-up-reminder",
    label: "Follow-Up Reminder",
    preview: "Steward follow-up reminder. Check your BamSignal journey status.",
    operationalNote: "Operational nudge — consultant handles the conversation."
  },
  {
    id: "milestone-congratulations",
    label: "Milestone Congratulations",
    preview: "Congratulations on your relationship milestone.",
    operationalNote: "Brief celebration — no coaching on WhatsApp."
  }
];

export const WHATSAPP_TEMPLATE_LABELS: Record<WhatsappTemplateId, string> = Object.fromEntries(
  WHATSAPP_TEMPLATES.map((item) => [item.id, item.label])
) as Record<WhatsappTemplateId, string>;

export const WHATSAPP_STATUS_ORDER: WhatsappDeliveryStatus[] = [
  "queued",
  "sent",
  "delivered",
  "failed"
];

export const WHATSAPP_STATUS_LABELS: Record<WhatsappDeliveryStatus, string> = {
  queued: "Queued",
  sent: "Sent",
  delivered: "Delivered",
  failed: "Failed"
};

export const WHATSAPP_STATUS_HINTS: Record<WhatsappDeliveryStatus, string> = {
  queued: "Awaiting dignified delivery via Sendchamp.",
  sent: "Handed to Sendchamp — operational only.",
  delivered: "Member received the WhatsApp notification.",
  failed: "Delivery did not complete — steward may follow up in-app."
};

export const WHATSAPP_PROHIBITED_PATTERNS: RegExp[] = [
  /\bmatch(?:making|maker)\b/i,
  /\brelationship\s+coach(?:ing)?\b/i,
  /\bdating\s+advice\b/i,
  /\bfind\s+(?:you|a)\s+(?:partner|match|husband|wife)\b/i,
  /\bchat\s+with\s+(?:him|her|them|your\s+match)\b/i,
  /\bwhatsapp\s+coaching\b/i
];

export const WHATSAPP_FUTURE_CAPABILITIES: {
  id: WhatsappFutureCapability;
  label: string;
}[] = [
  { id: "voice-notes", label: "Voice notes" },
  { id: "regional-languages", label: "Regional languages" },
  { id: "ai-assistants", label: "AI assistants" }
];

/**
 * Future-ready architecture hooks — not implemented.
 * Wire `WhatsappFutureConfig` when capabilities are enabled.
 */
export const WHATSAPP_FUTURE_ARCHITECTURE = {
  voiceNotes: "Steward-recorded voice reminders — human-reviewed before send.",
  regionalLanguages: "Approved template translations — never auto-translate coaching.",
  aiAssistants: "AI draft operational reminders — steward approval required."
} as const;

export function formatWhatsappMessageId(year: number, sequence: number): string {
  return `${WHATSAPP_MESSAGE_ID_PREFIX}-${year}-${String(sequence).padStart(4, "0")}`;
}

export function isValidWhatsappMessageId(value: string): boolean {
  return WHATSAPP_MESSAGE_ID_PATTERN.test(value.trim().toUpperCase());
}

export function normalizeWhatsappMessageId(value: string): string {
  return value.trim().toUpperCase();
}

export function parseWhatsappMessageId(value: string): { year: number; sequence: number } | null {
  const trimmed = value.trim().toUpperCase();
  const match = trimmed.match(/^BS-WA-(\d{4})-(\d{4})$/);
  if (!match) return null;
  return { year: Number(match[1]), sequence: Number(match[2]) };
}

export function whatsappMessageIdYearFromDate(iso: string): number {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return new Date().getFullYear();
  return new Date(parsed).getFullYear();
}

export function getWhatsappTemplate(templateId: WhatsappTemplateId) {
  const template = WHATSAPP_TEMPLATES.find((item) => item.id === templateId);
  if (!template) {
    throw new Error(`Unknown WhatsApp template: ${templateId}`);
  }
  return template;
}
