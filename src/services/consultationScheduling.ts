import { CONSULTATION_SCHEDULING_DEFAULT_TIMEZONE } from "../constants/consultationScheduling";
import { CONSULTATION_SCHEDULING_API_PATH } from "../constants/consultationScheduling";
import type { ConsultationAvailability, ConsultationEvent, ConsultationSlot } from "../types/consultationScheduling";
import type { MeetingLinkRecord } from "../types/meetingLink";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { SignalConciergeApplication } from "../types/signalConcierge";
import { listConciergeConsultants } from "../utils/conciergeConsultantDirectoryStore";
import {
  bookConsultationSchedulingSlot,
  getConsultantAvailabilityConfig,
  listOpenConsultationSlots,
  syncSchedulingAvailability
} from "../utils/ConsultationSchedulingEngine";
import { generateMeetingInfrastructureForEvent } from "./meetingInfrastructure";
import { resolveConsultationPaymentMember } from "./consultationPayment";
import { apiUrl, supabase } from "./supabase";
import { memberApiHeaders } from "../utils/memberApiAuth";
import { readResponseJson } from "../utils/httpJson";

type AvailabilityPayload = {
  ok?: boolean;
  error?: string;
  availability?: ConsultationAvailability;
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
  status?: string;
};

export function resolveSchedulingConsultant(consultantId?: string) {
  const consultants = listConciergeConsultants().filter((item) => item.status === "active");
  if (!consultantId) return consultants[0] ?? null;
  return consultants.find((item) => item.id === consultantId) ?? null;
}

export async function fetchConsultationAvailability(consultantId: string, consultantName: string) {
  const config = getConsultantAvailabilityConfig(consultantId);
  const response = await fetch(apiUrl(`${CONSULTATION_SCHEDULING_API_PATH}?action=availability`), {
    method: "POST",
    headers: await memberApiHeaders(),
    body: JSON.stringify({
      consultantId,
      consultantName,
      timezone: config.timezone,
      availableDays: config.availableDays,
      availableHours: config.availableHours,
      blackoutPeriods: config.blackoutPeriods,
      durationMinutes: config.durationMinutes,
      horizonDays: config.horizonDays
    })
  });
  const payload = (await readResponseJson<AvailabilityPayload>(response)) ?? {};
  if (!response.ok || !payload.ok || !payload.availability) {
    const local = syncSchedulingAvailability().find((item) => item.consultantId === consultantId);
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

export async function bookConsultationSchedulingSlotRemote(input: {
  application: SignalConciergeApplication;
  member?: ConciergeMemberRecord;
  memberEmail?: string;
  consultantId: string;
  consultantName: string;
  consultantEmail: string;
  slot: ConsultationSlot;
  meetingId?: string;
  journeyId?: string;
}): Promise<{ ok: boolean; event?: ConsultationEvent; meetingLink?: MeetingLinkRecord; error?: string }> {
  const member = input.member ?? resolveConsultationPaymentMember(input.application);
  const rawChannel =
    input.application.consultationPreferences?.preferredChannel ??
    input.application.consultationPreference ??
    "google-meet";
  const channel = rawChannel === "whatsapp" ? "google-meet" : rawChannel;

  const response = await fetch(apiUrl(`${CONSULTATION_SCHEDULING_API_PATH}?action=book`), {
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
      timezone: CONSULTATION_SCHEDULING_DEFAULT_TIMEZONE,
      channel,
      meetingId: input.meetingId,
      journeyId: input.journeyId ?? member.journeyId
    })
  });
  const payload = (await readResponseJson<BookPayload>(response)) ?? {};

  if (!response.ok || !payload.ok) {
    return { ok: false, error: payload.error || "Unable to book consultation." };
  }

  const event = bookConsultationSchedulingSlot({
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

  const consultant = listConciergeConsultants().find((item) => item.id === input.consultantId);
  if (consultant) {
    const linkResult = await generateMeetingInfrastructureForEvent({
      application: input.application,
      event: event as import("../types/calendar").ConsultationEvent,
      member,
      consultant,
      memberEmail: String(input.memberEmail || "").trim()
    });
    if (!linkResult.ok) {
      return {
        ok: false,
        error: linkResult.error || "Consultation booked, but meeting link could not be generated."
      };
    }
    return { ok: true, event, meetingLink: linkResult.record };
  }

  return { ok: true, event };
}

export function listLocalSchedulingSlots(consultantId: string): ConsultationSlot[] {
  syncSchedulingAvailability();
  return listOpenConsultationSlots(consultantId);
}

export async function getAuthenticatedMemberEmail(): Promise<string> {
  if (!supabase) return "";
  const session = (await supabase.auth.getSession()).data.session;
  return String(session?.user?.email || "").trim().toLowerCase();
}

/** @deprecated Use bookConsultationSchedulingSlotRemote */
export const bookConsultationCalendarSlot = bookConsultationSchedulingSlotRemote;

/** @deprecated Use fetchConsultationAvailability */
export const fetchConsultantAvailability = fetchConsultationAvailability;

/** @deprecated Use resolveSchedulingConsultant */
export const resolveBookingConsultant = resolveSchedulingConsultant;

/** @deprecated Use listLocalSchedulingSlots */
export const listLocalAvailableSlots = listLocalSchedulingSlots;
