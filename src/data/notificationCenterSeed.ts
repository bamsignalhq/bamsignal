import type {
  NotificationAuditRecord,
  NotificationTemplateRecord
} from "../types/notificationReliability";

export const NOTIFICATION_TEMPLATE_SEED: NotificationTemplateRecord[] = [
  {
    id: "otp",
    label: "OTP",
    channels: ["email", "whatsapp", "sms"],
    subject: "Your BamSignal verification code",
    preview: "Your verification code is {{code}}. Valid for 10 minutes.",
    lastUsedAt: "2026-06-26T08:12:00.000Z",
    sentCount: 1842,
    enabled: true
  },
  {
    id: "welcome",
    label: "Welcome",
    channels: ["email", "in-app"],
    subject: "Welcome to BamSignal",
    preview: "Hi {{name}}, your account is ready. Start discovering connections in {{city}}.",
    lastUsedAt: "2026-06-26T07:45:00.000Z",
    sentCount: 312,
    enabled: true
  },
  {
    id: "verification",
    label: "Verification",
    channels: ["email", "whatsapp"],
    subject: "Verify your BamSignal profile",
    preview: "Complete verification to unlock full discovery features.",
    lastUsedAt: "2026-06-26T06:30:00.000Z",
    sentCount: 89,
    enabled: true
  },
  {
    id: "consultation",
    label: "Consultation",
    channels: ["email", "whatsapp", "push"],
    subject: "Consultation scheduled",
    preview: "Your consultation with {{consultant}} is confirmed for {{date}}.",
    lastUsedAt: "2026-06-26T09:00:00.000Z",
    sentCount: 156,
    enabled: true
  },
  {
    id: "signal",
    label: "Signal",
    channels: ["push", "in-app"],
    preview: "{{sender}} sent you a signal. Open BamSignal to respond.",
    lastUsedAt: "2026-06-26T09:15:00.000Z",
    sentCount: 2401,
    enabled: true
  },
  {
    id: "message",
    label: "Message",
    channels: ["push", "in-app"],
    preview: "New message from {{sender}}: {{preview}}",
    lastUsedAt: "2026-06-26T09:18:00.000Z",
    sentCount: 5102,
    enabled: true
  },
  {
    id: "payment",
    label: "Payment",
    channels: ["email", "whatsapp"],
    subject: "Payment received — BamSignal",
    preview: "We received your payment of ₦{{amount}}. Reference: {{reference}}.",
    lastUsedAt: "2026-06-26T08:55:00.000Z",
    sentCount: 428,
    enabled: true
  },
  {
    id: "reminder",
    label: "Reminder",
    channels: ["email", "whatsapp", "push"],
    subject: "Reminder: {{title}}",
    preview: "This is a friendly reminder about your upcoming {{event}}.",
    lastUsedAt: "2026-06-26T07:00:00.000Z",
    sentCount: 267,
    enabled: true
  },
  {
    id: "relationship",
    label: "Relationship",
    channels: ["email", "in-app"],
    subject: "Relationship milestone",
    preview: "Congratulations on reaching {{milestone}} with {{partner}}.",
    lastUsedAt: "2026-06-25T18:00:00.000Z",
    sentCount: 44,
    enabled: true
  },
  {
    id: "system",
    label: "System",
    channels: ["email", "in-app"],
    subject: "BamSignal system notice",
    preview: "{{message}}",
    lastUsedAt: "2026-06-26T05:00:00.000Z",
    sentCount: 18,
    enabled: true
  }
];

export const NOTIFICATION_AUDIT_SEED: NotificationAuditRecord[] = [
  {
    id: "aud-001",
    triggeredBy: "system@bamsignal.com",
    triggeredAt: "2026-06-26T09:18:22.000Z",
    templateId: "message",
    templateLabel: "Message",
    channel: "push",
    recipient: "ada.lagos@member",
    durationMs: 842,
    providerResponse: "FCM: projects/bamsignal/messages/0:1719394702",
    status: "delivered",
    messageId: "ntf-msg-8841"
  },
  {
    id: "aud-002",
    triggeredBy: "concierge@bamsignal.com",
    triggeredAt: "2026-06-26T09:12:05.000Z",
    templateId: "consultation",
    templateLabel: "Consultation",
    channel: "whatsapp",
    recipient: "+2348012345678",
    durationMs: 1240,
    providerResponse: "SendChamp: wamid.HBgLM...",
    status: "read",
    messageId: "ntf-wa-3312"
  },
  {
    id: "aud-003",
    triggeredBy: "payments@bamsignal.com",
    triggeredAt: "2026-06-26T08:55:41.000Z",
    templateId: "payment",
    templateLabel: "Payment",
    channel: "email",
    recipient: "chidi.abuja@member",
    durationMs: 2103,
    providerResponse: "Resend: re_abc123delivered",
    status: "delivered",
    messageId: "ntf-em-9920"
  },
  {
    id: "aud-004",
    triggeredBy: "auth@bamsignal.com",
    triggeredAt: "2026-06-26T08:12:18.000Z",
    templateId: "otp",
    templateLabel: "OTP",
    channel: "email",
    recipient: "new.user@member",
    durationMs: 956,
    providerResponse: "Resend: re_otp8821sent",
    status: "delivered",
    messageId: "ntf-em-8810"
  },
  {
    id: "aud-005",
    triggeredBy: "operator@bamsignal.com",
    triggeredAt: "2026-06-26T07:30:00.000Z",
    templateId: "reminder",
    templateLabel: "Reminder",
    channel: "email",
    recipient: "failed.delivery@member",
    durationMs: 45000,
    providerResponse: "Resend: bounce — mailbox unavailable",
    status: "failed",
    messageId: "ntf-em-7701"
  }
];

export const NOTIFICATION_ACTION_LOG_SEED: {
  id: string;
  tool: string;
  messageId: string;
  actor: string;
  at: string;
  detail: string;
}[] = [];
