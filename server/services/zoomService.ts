/** Zoom meeting infrastructure for Signal Concierge consultations. */

export type ZoomMeetingInput = {
  topic: string;
  startTime: string;
  durationMinutes: number;
  timezone: string;
  agenda?: string;
};

export type ZoomMeetingResult = {
  meetingId: string;
  joinUrl: string;
  startUrl?: string;
  password?: string;
};
