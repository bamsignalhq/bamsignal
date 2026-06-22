import { normalizeMeetingLinkChannel } from "../constants/meetingLink";
import type { MeetingLinkAccess, MeetingLinkChannel, MeetingLinkRecord } from "../types/meetingLink";
import type { ConsultationEvent } from "../types/calendar";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { ConciergeConsultantRecord } from "../types/conciergeConsultantDirectory";
import type { SignalConciergeApplication } from "../types/signalConcierge";
import { recordMeetingLink } from "../utils/MeetingLinkEngine";
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

export async function generateMeetingLinkForEvent(input: {
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
      error: "WhatsApp meetings are disabled. Choose Zoom, Google Meet, or Phone."
    };
  }

  const response = await fetch(apiUrl("/api/meeting-link?action=generate"), {
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
    return { ok: false, error: payload.error || "Unable to generate meeting link." };
  }

  const record = recordMeetingLink({
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
    calendarEventLinkedAt: input.event.googleEventId ? input.event.createdAt : undefined
  });

  return { ok: true, record };
}

export async function getAuthenticatedMemberEmail(): Promise<string> {
  if (!supabase) return "";
  const session = (await supabase.auth.getSession()).data.session;
  return String(session?.user?.email || "").trim().toLowerCase();
}
