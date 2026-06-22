import {
  CONSULTATION_DEFAULT_DURATION_MINUTES,
  CONSULTATION_STATUS_LABELS
} from "../constants/consultationScheduler";
import { STORAGE_KEYS } from "../constants/limits";
import type { ConciergeScheduledMeeting } from "../types/conciergeConsultantDirectory";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  ConsultationAvailability,
  ConsultationChannel,
  ConsultationMeeting,
  ConsultationMeetingStatus,
  ConsultationParticipant,
  ConsultationSlot
} from "../types/consultationScheduler";
import type { SignalConciergeConsultationChannel } from "../constants/signalConcierge";
import { listConciergeConsultants, listConciergeConsultantMeetings } from "./conciergeConsultantDirectoryStore";
import { listConciergeMembers } from "./conciergeConsultantStore";
import { ensureMemberJourneyId } from "./conciergeJourneyRegistry";
import { ensureConsultationMeetingId } from "./consultationMeetingIdRegistry";
import { readJson, writeJson } from "./storage";

type ConsultationSchedulerStore = {
  meetings: Record<string, ConsultationMeeting>;
  availability: Record<string, ConsultationAvailability>;
  updatedAt: string;
};

const STORE_KEY = STORAGE_KEYS.conciergeConsultationScheduler;
const DEFAULT_TIMEZONE = "Africa/Lagos";

const UPCOMING_STATUSES = new Set<ConsultationMeetingStatus>([
  "scheduled",
  "confirmed",
  "rescheduled"
]);

function loadStore(): ConsultationSchedulerStore {
  return readJson<ConsultationSchedulerStore>(STORE_KEY, {
    meetings: {},
    availability: {},
    updatedAt: new Date().toISOString()
  });
}

function saveStore(store: ConsultationSchedulerStore): void {
  writeJson(STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

function mapPreferenceToChannel(
  preference?: SignalConciergeConsultationChannel | string
): ConsultationChannel {
  if (preference === "whatsapp") return "whatsapp-voice";
  if (preference === "phone") return "phone";
  if (preference === "google-meet") return "google-meet";
  return "zoom";
}

function mapDirectoryChannel(channel: ConciergeScheduledMeeting["channel"]): ConsultationChannel {
  if (channel === "phone") return "phone";
  if (channel === "google-meet") return "google-meet";
  if (channel === "zoom") return "zoom";
  return "google-meet";
}

function buildParticipants(
  member: Pick<ConciergeMemberRecord, "id" | "aboutYou">,
  consultantId: string,
  consultantName: string
): ConsultationParticipant[] {
  return [
    {
      id: `part_member_${member.id}`,
      role: "member",
      name: member.aboutYou.name,
      memberId: member.id
    },
    {
      id: `part_consultant_${consultantId}`,
      role: "consultant",
      name: consultantName,
      consultantId
    }
  ];
}

function deriveMeetingStatus(
  scheduledAt: string,
  existing?: ConsultationMeeting
): ConsultationMeetingStatus {
  if (existing?.status === "completed" || existing?.status === "cancelled") {
    return existing.status;
  }
  if (new Date(scheduledAt).getTime() < Date.now()) {
    return existing?.status === "confirmed" ? "completed" : "completed";
  }
  return existing?.status ?? "scheduled";
}

function meetingFromDirectoryEntry(
  entry: ConciergeScheduledMeeting,
  member?: ConciergeMemberRecord,
  existing?: ConsultationMeeting
): ConsultationMeeting {
  const journeyId = member
    ? ensureMemberJourneyId(member.id, member.createdAt, member.journeyId)
    : "";
  const createdAt = existing?.createdAt ?? entry.loggedAt;
  const meetingId = ensureConsultationMeetingId(entry.id, createdAt);
  const consultantName =
    listConciergeConsultants().find((consultant) => consultant.id === entry.consultantId)?.name ??
    "Consultant";

  const scheduledAt = entry.scheduledAt;
  const status = deriveMeetingStatus(scheduledAt, existing);

  return {
    id: entry.id,
    meetingId,
    journeyId,
    memberId: entry.memberId,
    memberName: entry.memberName,
    consultantId: entry.consultantId,
    consultantName,
    scheduledAt,
    durationMinutes: existing?.durationMinutes ?? CONSULTATION_DEFAULT_DURATION_MINUTES,
    channel: mapDirectoryChannel(entry.channel),
    notes: entry.notes,
    status,
    participants: buildParticipants(
      member ?? {
        id: entry.memberId,
        aboutYou: { name: entry.memberName } as ConciergeMemberRecord["aboutYou"]
      },
      entry.consultantId,
      consultantName
    ),
    createdAt,
    updatedAt: new Date().toISOString(),
    previousMeetingId: existing?.previousMeetingId
  };
}

function meetingFromMember(member: ConciergeMemberRecord, existing?: ConsultationMeeting): ConsultationMeeting | null {
  if (!member.consultationScheduledAt) return null;
  const consultantId = member.currentConsultantId ?? member.assignedConsultantId;
  if (!consultantId) return null;

  const recordId = existing?.id ?? `consult_${member.id}`;
  const createdAt = existing?.createdAt ?? member.createdAt;
  const meetingId = ensureConsultationMeetingId(recordId, createdAt);
  const consultantName = member.assignedConsultantName ?? "Consultant";
  const channel = mapPreferenceToChannel(
    member.consultationPreferences?.preferredChannel ?? member.consultationPreference
  );
  const scheduledAt = member.consultationScheduledAt;
  const status = deriveMeetingStatus(scheduledAt, existing);

  return {
    id: recordId,
    meetingId,
    journeyId: ensureMemberJourneyId(member.id, member.createdAt, member.journeyId),
    memberId: member.id,
    memberName: member.aboutYou.name,
    consultantId,
    consultantName,
    scheduledAt,
    durationMinutes: existing?.durationMinutes ?? CONSULTATION_DEFAULT_DURATION_MINUTES,
    channel,
    notes: existing?.notes,
    status,
    participants: buildParticipants(member, consultantId, consultantName),
    createdAt,
    updatedAt: new Date().toISOString(),
    previousMeetingId: existing?.previousMeetingId
  };
}

function buildDefaultAvailability(
  consultantId: string,
  consultantName: string,
  meetings: ConsultationMeeting[]
): ConsultationAvailability {
  const now = new Date();
  const slots: ConsultationSlot[] = [];

  for (let day = 0; day < 7; day += 1) {
    const date = new Date(now);
    date.setDate(date.getDate() + day);
    date.setHours(10, 0, 0, 0);
    const slotStart = date.toISOString();
    const slotEnd = new Date(date.getTime() + CONSULTATION_DEFAULT_DURATION_MINUTES * 60_000).toISOString();
    const booked = meetings.some(
      (meeting) =>
        meeting.consultantId === consultantId &&
        meeting.scheduledAt === slotStart &&
        UPCOMING_STATUSES.has(meeting.status)
    );
    slots.push({
      id: `slot_${consultantId}_${day}`,
      consultantId,
      startsAt: slotStart,
      endsAt: slotEnd,
      durationMinutes: CONSULTATION_DEFAULT_DURATION_MINUTES,
      available: !booked
    });
  }

  return {
    consultantId,
    consultantName,
    timezone: DEFAULT_TIMEZONE,
    slots,
    updatedAt: new Date().toISOString()
  };
}

export function syncConsultationMeetingsFromSources(): ConsultationMeeting[] {
  const store = loadStore();
  const members = listConciergeMembers();
  const memberById = new Map(members.map((member) => [member.id, member]));

  let directoryMeetings: ConciergeScheduledMeeting[] = [];
  const seenMeetingIds = new Set<string>();
  for (const consultant of listConciergeConsultants()) {
    for (const meeting of listConciergeConsultantMeetings(consultant.id)) {
      if (seenMeetingIds.has(meeting.id)) continue;
      seenMeetingIds.add(meeting.id);
      directoryMeetings.push(meeting);
    }
  }

  const nextMeetings = { ...store.meetings };

  for (const entry of directoryMeetings) {
    const existing = nextMeetings[entry.id];
    const member = memberById.get(entry.memberId);
    nextMeetings[entry.id] = meetingFromDirectoryEntry(entry, member, existing);
  }

  for (const member of members) {
    const existing = Object.values(nextMeetings).find((meeting) => meeting.memberId === member.id);
    const fromMember = meetingFromMember(member, existing);
    if (!fromMember) continue;
    if (!nextMeetings[fromMember.id]) {
      nextMeetings[fromMember.id] = fromMember;
    }
  }

  const meetingList = Object.values(nextMeetings);
  const availability: Record<string, ConsultationAvailability> = {};
  for (const consultant of listConciergeConsultants()) {
    if (consultant.status !== "active") continue;
    availability[consultant.id] = buildDefaultAvailability(
      consultant.id,
      consultant.name,
      meetingList
    );
  }

  saveStore({ meetings: nextMeetings, availability, updatedAt: new Date().toISOString() });
  return listConsultationMeetings();
}

function ensureStoreHydrated(): ConsultationSchedulerStore {
  const store = loadStore();
  if (Object.keys(store.meetings).length) return store;
  syncConsultationMeetingsFromSources();
  return loadStore();
}

export function listConsultationMeetings(): ConsultationMeeting[] {
  const store = ensureStoreHydrated();
  return Object.values(store.meetings).sort(
    (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  );
}

export function getConsultationMeeting(id: string): ConsultationMeeting | null {
  const store = ensureStoreHydrated();
  return (
    store.meetings[id] ??
    Object.values(store.meetings).find(
      (meeting) => meeting.meetingId === id || meeting.memberId === id
    ) ??
    null
  );
}

export function listUpcomingConsultations(now = Date.now()): ConsultationMeeting[] {
  return listConsultationMeetings()
    .filter(
      (meeting) =>
        UPCOMING_STATUSES.has(meeting.status) && new Date(meeting.scheduledAt).getTime() >= now
    )
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
}

export function listPastConsultations(now = Date.now()): ConsultationMeeting[] {
  return listConsultationMeetings()
    .filter(
      (meeting) =>
        meeting.status === "completed" ||
        meeting.status === "cancelled" ||
        new Date(meeting.scheduledAt).getTime() < now
    )
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
}

export function listConsultationAvailability(consultantId?: string): ConsultationAvailability[] {
  const store = ensureStoreHydrated();
  const all = Object.values(store.availability);
  if (!consultantId) return all;
  return all.filter((item) => item.consultantId === consultantId);
}

export function listConsultationSlots(consultantId: string): ConsultationSlot[] {
  const availability = listConsultationAvailability(consultantId)[0];
  return availability?.slots ?? [];
}

export function scheduleConsultationMeeting(input: {
  memberId: string;
  consultantId: string;
  scheduledAt: string;
  channel: ConsultationChannel;
  durationMinutes?: number;
  notes?: string;
}): ConsultationMeeting | null {
  const member = listConciergeMembers().find((item) => item.id === input.memberId);
  const consultant = listConciergeConsultants().find((item) => item.id === input.consultantId);
  if (!member || !consultant) return null;

  const store = loadStore();
  const id = `consult_${Date.now().toString(36)}`;
  const createdAt = new Date().toISOString();
  const meeting: ConsultationMeeting = {
    id,
    meetingId: ensureConsultationMeetingId(id, createdAt),
    journeyId: ensureMemberJourneyId(member.id, member.createdAt, member.journeyId),
    memberId: member.id,
    memberName: member.aboutYou.name,
    consultantId: consultant.id,
    consultantName: consultant.name,
    scheduledAt: input.scheduledAt,
    durationMinutes: input.durationMinutes ?? CONSULTATION_DEFAULT_DURATION_MINUTES,
    channel: input.channel,
    notes: input.notes,
    status: "scheduled",
    participants: buildParticipants(member, consultant.id, consultant.name),
    createdAt,
    updatedAt: createdAt
  };

  saveStore({
    ...store,
    meetings: { ...store.meetings, [id]: meeting }
  });
  syncConsultationMeetingsFromSources();
  return meeting;
}

export function updateConsultationMeetingStatus(
  meetingId: string,
  status: ConsultationMeetingStatus
): ConsultationMeeting | null {
  const store = loadStore();
  const meeting = getConsultationMeeting(meetingId);
  if (!meeting) return null;

  const next: ConsultationMeeting = {
    ...meeting,
    status,
    updatedAt: new Date().toISOString()
  };
  saveStore({
    ...store,
    meetings: { ...store.meetings, [meeting.id]: next }
  });
  return next;
}

export function rescheduleConsultationMeeting(
  meetingId: string,
  scheduledAt: string
): ConsultationMeeting | null {
  const store = loadStore();
  const meeting = getConsultationMeeting(meetingId);
  if (!meeting) return null;

  const next: ConsultationMeeting = {
    ...meeting,
    scheduledAt,
    status: "rescheduled",
    updatedAt: new Date().toISOString()
  };
  saveStore({
    ...store,
    meetings: { ...store.meetings, [meeting.id]: next }
  });
  return next;
}

export function formatConsultationMeetingSummary(meeting: ConsultationMeeting): string {
  return `${meeting.meetingId} · ${CONSULTATION_STATUS_LABELS[meeting.status]} · ${meeting.memberName}`;
}

export function resetConsultationSchedulerForTests(): void {
  writeJson(STORE_KEY, {
    meetings: {},
    availability: {},
    updatedAt: new Date().toISOString()
  });
}
