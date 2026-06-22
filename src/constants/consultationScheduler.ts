import type {
  ConsultationChannel,
  ConsultationMeetingStatus
} from "../types/consultationScheduler";

export const CONSULTATION_SCHEDULER_BRAND = "Consultation Scheduler";

export const CONSULTATION_DEFAULT_DURATION_MINUTES = 45;

export const CONSULTATION_CHANNELS: { id: ConsultationChannel; label: string }[] = [
  { id: "zoom", label: "Zoom" },
  { id: "google-meet", label: "Google Meet" },
  { id: "phone", label: "Phone" },
  { id: "whatsapp-voice", label: "WhatsApp Voice" }
];

export const CONSULTATION_CHANNEL_LABELS: Record<ConsultationChannel, string> = Object.fromEntries(
  CONSULTATION_CHANNELS.map((channel) => [channel.id, channel.label])
) as Record<ConsultationChannel, string>;

export const CONSULTATION_MEETING_STATUSES: ConsultationMeetingStatus[] = [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "rescheduled"
];

export const CONSULTATION_STATUS_LABELS: Record<ConsultationMeetingStatus, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  rescheduled: "Rescheduled"
};

export const CONSULTATION_SCHEDULER_FUTURE_CAPABILITIES: {
  id: import("../types/consultationScheduler").ConsultationSchedulerFutureCapability;
  label: string;
}[] = [
  { id: "google-calendar", label: "Google Calendar" },
  { id: "zoom-api", label: "Zoom API" },
  { id: "meet-api", label: "Meet API" },
  { id: "automatic-reminders", label: "Automatic reminders" },
  { id: "availability-engine", label: "Availability engine" },
  { id: "recurring-meetings", label: "Recurring meetings" }
];
