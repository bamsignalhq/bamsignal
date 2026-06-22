export type ConsultationChannel = "zoom" | "google-meet" | "phone" | "whatsapp-voice";

export type ConsultationMeetingStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "rescheduled";

export type ConsultationParticipantRole = "member" | "consultant";

export type ConsultationParticipant = {
  id: string;
  role: ConsultationParticipantRole;
  name: string;
  memberId?: string;
  consultantId?: string;
};

export type ConsultationSlot = {
  id: string;
  consultantId: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  available: boolean;
};

export type ConsultationAvailability = {
  consultantId: string;
  consultantName: string;
  timezone: string;
  slots: ConsultationSlot[];
  updatedAt: string;
};

export type ConsultationMeeting = {
  id: string;
  meetingId: string;
  journeyId: string;
  memberId: string;
  memberName: string;
  consultantId: string;
  consultantName: string;
  scheduledAt: string;
  durationMinutes: number;
  channel: ConsultationChannel;
  notes?: string;
  status: ConsultationMeetingStatus;
  participants: ConsultationParticipant[];
  createdAt: string;
  updatedAt: string;
  previousMeetingId?: string;
};

/** Reserved — not implemented. */
export type ConsultationSchedulerFutureCapability =
  | "google-calendar"
  | "zoom-api"
  | "meet-api"
  | "automatic-reminders"
  | "availability-engine"
  | "recurring-meetings";

export type ConsultationSchedulerFutureConfig = {
  capability?: ConsultationSchedulerFutureCapability;
  enabled?: boolean;
};
