import { normalizeMeetingLinkChannel } from "../constants/meetingLink";
import { MEETING_INFRASTRUCTURE_API_PATH } from "../constants/meetingInfrastructure";
import type { MeetingLinkAccess, MeetingLinkChannel, MeetingLinkRecord } from "../types/meetingLink";
import type { ConsultationEvent } from "../types/calendar";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { ConciergeConsultantRecord } from "../types/conciergeConsultantDirectory";
import type { SignalConciergeApplication } from "../types/signalConcierge";
import {
  markMeetingInvitesSent,
  recordMeetingInfrastructure
} from "../utils/MeetingInfrastructureEngine";
import { resolveConsultationPaymentMember } from "./consultationPayment";
import { apiUrl, supabase } from "./supabase";
import { memberApiHeaders } from "../utils/memberApiAuth";
import { readResponseJson } from "../utils/httpJson";

type GeneratePayload = {
  ok?: boolean;
  error?: string;
  meetingId?: string;
  consultationEventId?: string;
  googleEventId?: string;
  journeyId?: string;
  scheduledAt?: string;
  status?: MeetingLinkRecord["status"];
  channel?: MeetingLinkChannel;
  provider?: MeetingLinkRecord["provider"];
  access?: MeetingLinkAccess;
  participants?: MeetingLinkRecord["participants"];
  memberId?: string;
  memberName?: string;
  consultantId?: string;
  consultantName?: string;
  consultantEmail?: string;
};

export async function generateMeetingInfrastructureForEvent(input: {
  application: SignalConciergeApplication;
  event: ConsultationEvent;
  member?: ConciergeMemberRecord;
  consultant: ConciergeConsultantRecord;
  memberEmail?: string;
}): Promise<{ ok: boolean; record?: MeetingLinkRecord; error?: string }> {
  const member = input.member ?? resolveConsultationPaymentMember(input.application);
  const channel = normalizeMeetingLinkChannel(input.event.channel);
  if (!channel) {
    return {
      ok: false,
      error: "WhatsApp is not a consultation channel. Choose Zoom, Google Meet, or Phone."
    };
  }

  const response = await fetch(apiUrl(`${MEETING_INFRASTRUCTURE_API_PATH}?action=generate`), {
    method: "POST",
    headers: await memberApiHeaders(),
    body: JSON.stringify({
      memberId: member.id,
      memberName: member.aboutYou.name,
      memberEmail: input.memberEmail,
      consultantId: input.consultant.id,
      consultantName: input.consultant.name,
      consultantEmail: input.consultant.email,
      consultantPhone: input.consultant.phone,
      meetingId: input.event.meetingId,
      consultationEventId: input.event.id,
      googleEventId: input.event.googleEventId,
      googleEventLink: input.event.googleEventLink,
      startsAt: input.event.scheduledAt,
      endsAt: input.event.endsAt,
      durationMinutes: input.event.durationMinutes,
      timezone: input.event.timezone,
      journeyId: input.event.journeyId,
      channel
    })
  });
  const payload = (await readResponseJson<GeneratePayload>(response)) ?? {};

  if (!response.ok || !payload.ok || !payload.access || !payload.channel || !payload.provider) {
    return { ok: false, error: payload.error || "Unable to generate meeting infrastructure." };
  }

  const record = recordMeetingInfrastructure({
    meetingId: input.event.meetingId,
    consultationEventId: input.event.id,
    googleEventId: input.event.googleEventId,
    journeyId: input.event.journeyId,
    member,
    consultant: input.consultant,
    memberEmail: String(input.memberEmail || "").trim(),
    channel: payload.channel,
    provider: payload.provider,
    access: payload.access,
    participants: payload.participants,
    scheduledAt: payload.scheduledAt ?? input.event.scheduledAt,
    calendarEventLinkedAt: input.event.googleEventId ? input.event.createdAt : undefined
  });

  return { ok: true, record };
}

export function markMeetingInfrastructureInvitesSent(meetingId: string): MeetingLinkRecord | null {
  return markMeetingInvitesSent(meetingId);
}

export async function getAuthenticatedMemberEmail(): Promise<string> {
  if (!supabase) return "";
  const session = (await supabase.auth.getSession()).data.session;
  return String(session?.user?.email || "").trim().toLowerCase();
}

/** @deprecated Use generateMeetingInfrastructureForEvent */
export const generateMeetingLinkForEvent = generateMeetingInfrastructureForEvent;
