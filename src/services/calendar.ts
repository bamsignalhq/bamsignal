import { CALENDAR_DEFAULT_TIMEZONE } from "../constants/calendar";
import type { CalendarAvailability, CalendarSlot, ConsultationEvent } from "../types/calendar";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { SignalConciergeApplication } from "../types/signalConcierge";
import { listConciergeConsultants } from "../utils/conciergeConsultantDirectoryStore";
import {
  bookConsultationSlot,
  listAvailableCalendarSlots,
  syncCalendarAvailabilityFromConsultants
} from "../utils/CalendarEngine";
import { resolveConsultationPaymentMember } from "./consultationPayment";
import { apiUrl, supabase } from "./supabase";
import { memberApiHeaders } from "../utils/memberApiAuth";
import { readResponseJson } from "../utils/httpJson";

type AvailabilityPayload = {
  ok?: boolean;
  error?: string;
  availability?: CalendarAvailability;
  googleCalendarReady?: boolean;
};

type BookPayload = {
  ok?: boolean;
  error?: string;
  googleEventId?: string;
  googleEventLink?: string;
  meetingId?: string;
  scheduledAt?: string;
  endsAt?: string;
};

export function resolveBookingConsultant(consultantId?: string) {
  const consultants = listConciergeConsultants().filter((item) => item.status === "active");
  if (!consultantId) return consultants[0] ?? null;
  return consultants.find((item) => item.id === consultantId) ?? null;
}

export async function fetchConsultantAvailability(consultantId: string, consultantName: string) {
  const response = await fetch(apiUrl("/api/calendar?action=availability"), {
    method: "POST",
    headers: await memberApiHeaders(),
    body: JSON.stringify({
      consultantId,
      consultantName,
      timezone: CALENDAR_DEFAULT_TIMEZONE
    })
  });
  const payload = (await readResponseJson<AvailabilityPayload>(response)) ?? {};
  if (!response.ok || !payload.ok || !payload.availability) {
    const local = syncCalendarAvailabilityFromConsultants().find((item) => item.consultantId === consultantId);
    return {
      ok: Boolean(local),
      availability: local ?? null,
      googleCalendarReady: false,
      error: payload.error
    };
  }
  return {
    ok: true,
    availability: payload.availability,
    googleCalendarReady: Boolean(payload.googleCalendarReady),
    error: undefined
  };
}

export async function bookConsultationCalendarSlot(input: {
  application: SignalConciergeApplication;
  member?: ConciergeMemberRecord;
  memberEmail?: string;
  consultantId: string;
  consultantName: string;
  consultantEmail: string;
  slot: CalendarSlot;
  meetingId?: string;
  journeyId?: string;
}): Promise<{ ok: boolean; event?: ConsultationEvent; error?: string }> {
  const member = input.member ?? resolveConsultationPaymentMember(input.application);
  const channel =
    input.application.consultationPreferences?.preferredChannel ??
    input.application.consultationPreference ??
    "google-meet";

  const response = await fetch(apiUrl("/api/calendar?action=book"), {
    method: "POST",
    headers: await memberApiHeaders(),
    body: JSON.stringify({
      memberId: member.id,
      memberName: member.aboutYou.name,
      memberEmail: input.memberEmail,
      consultantId: input.consultantId,
      consultantName: input.consultantName,
      consultantEmail: input.consultantEmail,
      startsAt: input.slot.startsAt,
      endsAt: input.slot.endsAt,
      timezone: CALENDAR_DEFAULT_TIMEZONE,
      channel: channel === "whatsapp" ? "whatsapp-voice" : channel,
      meetingId: input.meetingId,
      journeyId: input.journeyId ?? member.journeyId
    })
  });
  const payload = (await readResponseJson<BookPayload>(response)) ?? {};

  if (!response.ok || !payload.ok) {
    return { ok: false, error: payload.error || "Unable to book consultation." };
  }

  const event = bookConsultationSlot({
    application: input.application,
    member,
    memberEmail: String(input.memberEmail || "").trim(),
    consultantId: input.consultantId,
    slot: input.slot,
    googleEventId: payload.googleEventId,
    googleEventLink: payload.googleEventLink,
    meetingId: payload.meetingId
  });

  if (!event) {
    return { ok: false, error: "Unable to save consultation event locally." };
  }

  return { ok: true, event };
}

export function listLocalAvailableSlots(consultantId: string): CalendarSlot[] {
  syncCalendarAvailabilityFromConsultants();
  return listAvailableCalendarSlots(consultantId);
}

export async function getAuthenticatedMemberEmail(): Promise<string> {
  if (!supabase) return "";
  const session = (await supabase.auth.getSession()).data.session;
  return String(session?.user?.email || "").trim().toLowerCase();
}
