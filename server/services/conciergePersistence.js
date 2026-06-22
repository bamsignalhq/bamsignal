import { query, isDatabaseReady, getDatabaseStatus } from "../db.js";
import { logObservabilityEvent } from "./observability.js";

const MEMBER_TABLE = "concierge_members";

function asIso(value) {
  if (!value) return new Date().toISOString();
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? new Date().toISOString() : new Date(parsed).toISOString();
}

function pickMemberFields(member = {}) {
  const journeyId = String(member.journeyId || "").trim().toUpperCase();
  if (!journeyId) {
    throw new Error("journey_id_required");
  }

  const application = { ...member };
  const photos = Array.isArray(member.photos) ? member.photos : [];
  const introductions = Array.isArray(member.introductions) ? member.introductions : [];
  const followUpTasks = Array.isArray(member.followUpTasks) ? member.followUpTasks : [];

  for (const key of [
    "photos",
    "trustedMember",
    "ownership",
    "currentConsultantId",
    "assignedConsultantId",
    "assignedBy",
    "assignedAt",
    "stewardshipHistory",
    "communicationJournal",
    "flags",
    "privateNotes",
    "consultantSummary",
    "timeline",
    "journeyArchive",
    "successStoryConsent",
    "relationshipLegacyIndex",
    "introductions",
    "followUpTasks"
  ]) {
    delete application[key];
  }

  return {
    id: String(member.id || member.memberId || "").trim(),
    journeyId,
    status: String(member.status || "applied"),
    preferredTier: member.preferredTier ? String(member.preferredTier) : null,
    application,
    photos,
    trustedMember: Boolean(member.trustedMember),
    ownership: String(member.ownership || "bamsignal"),
    currentConsultantId:
      String(member.currentConsultantId || member.assignedConsultantId || "").trim() || null,
    assignedBy: member.assignedBy ? String(member.assignedBy) : null,
    assignedAt: member.assignedAt ? asIso(member.assignedAt) : null,
    stewardshipHistory: Array.isArray(member.stewardshipHistory) ? member.stewardshipHistory : [],
    communicationJournal: Array.isArray(member.communicationJournal)
      ? member.communicationJournal
      : [],
    flags: Array.isArray(member.flags) ? member.flags : [],
    privateNotes: Array.isArray(member.privateNotes) ? member.privateNotes : [],
    consultantSummary: member.consultantSummary ?? null,
    timeline: Array.isArray(member.timeline) ? member.timeline : [],
    journeyArchive: member.journeyArchive ?? null,
    successStoryConsent: member.successStoryConsent ?? null,
    journeyMilestoneTimeline: member.journeyMilestoneTimeline ?? null,
    relationshipLegacyIndex: member.relationshipLegacyIndex ?? null,
    introductions,
    followUpTasks,
    createdAt: asIso(member.createdAt),
    updatedAt: asIso(member.updatedAt)
  };
}

function mergeMemberRow(row, related = {}) {
  const application = row.application && typeof row.application === "object" ? row.application : {};
  const member = {
    ...application,
    id: row.id,
    journeyId: row.journey_id,
    status: row.status,
    preferredTier: row.preferred_tier ?? undefined,
    photos: row.photos ?? [],
    trustedMember: Boolean(row.trusted_member),
    ownership: row.ownership,
    currentConsultantId: row.current_consultant_id ?? undefined,
    assignedConsultantId: row.current_consultant_id ?? undefined,
    assignedBy: row.assigned_by ?? undefined,
    assignedAt: row.assigned_at ?? undefined,
    stewardshipHistory: row.stewardship_history ?? [],
    communicationJournal: row.communication_journal ?? [],
    flags: row.flags ?? [],
    privateNotes: row.private_notes ?? [],
    consultantSummary: row.consultant_summary ?? undefined,
    timeline: row.timeline ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    introductions: related.introductions ?? [],
    followUpTasks: related.followups ?? []
  };

  if (related.archive?.record) {
    member.journeyArchive = related.archive.record;
  }
  if (related.legacyProfile?.record) {
    member.relationshipLegacyIndex = related.legacyProfile.record;
  }
  if (related.successStoryConsent?.record) {
    member.successStoryConsent = related.successStoryConsent.record;
  }

  return member;
}

async function loadRelatedMemberData(memberId, journeyId) {
  const [introductions, followups, archive, legacyProfile, consent] = await Promise.all([
    query(`select record from concierge_introductions where member_id = $1 order by created_at asc`, [memberId]),
    query(`select record from concierge_followups where member_id = $1 order by created_at asc`, [memberId]),
    journeyId
      ? query(`select record from concierge_archives where journey_id = $1 limit 1`, [journeyId])
      : Promise.resolve({ rows: [] }),
    journeyId
      ? query(`select record from concierge_legacy_profiles where journey_id = $1 limit 1`, [journeyId])
      : Promise.resolve({ rows: [] }),
    journeyId
      ? query(`select record from concierge_success_story_consents where journey_id = $1 limit 1`, [journeyId])
      : Promise.resolve({ rows: [] })
  ]);

  return {
    introductions: introductions.rows.map((row) => row.record),
    followups: followups.rows.map((row) => row.record),
    archive: archive.rows[0] ?? null,
    legacyProfile: legacyProfile.rows[0] ?? null,
    successStoryConsent: consent.rows[0] ?? null
  };
}

export async function getConciergePersistenceStatus() {
  if (!isDatabaseReady()) {
    return {
      ready: false,
      database: getDatabaseStatus(),
      memberCount: 0,
      consultantCount: 0,
      bootstrapped: false
    };
  }

  const [members, consultants] = await Promise.all([
    query(`select count(*)::int as count from ${MEMBER_TABLE}`),
    query(`select count(*)::int as count from concierge_consultants`)
  ]);

  const memberCount = Number(members.rows[0]?.count || 0);
  const consultantCount = Number(consultants.rows[0]?.count || 0);

  return {
    ready: true,
    database: getDatabaseStatus(),
    memberCount,
    consultantCount,
    bootstrapped: memberCount > 0
  };
}

export async function listConciergeMembersFromDb() {
  if (!isDatabaseReady()) return [];

  const { rows } = await query(
    `select * from ${MEMBER_TABLE} order by created_at desc`
  );

  const members = [];
  for (const row of rows) {
    const related = await loadRelatedMemberData(row.id, row.journey_id);
    members.push(mergeMemberRow(row, related));
  }
  return members;
}

export async function getConciergeMemberFromDb(memberId) {
  if (!isDatabaseReady()) return null;

  const { rows } = await query(`select * from ${MEMBER_TABLE} where id = $1 limit 1`, [memberId]);
  const row = rows[0];
  if (!row) return null;

  const related = await loadRelatedMemberData(row.id, row.journey_id);
  return mergeMemberRow(row, related);
}

export async function upsertConciergeMemberRecord(member) {
  if (!isDatabaseReady()) {
    return { ok: false, error: "database_unavailable" };
  }

  const normalized = pickMemberFields(member);
  if (!normalized.id) {
    return { ok: false, error: "member_id_required" };
  }

  await query(
      `insert into ${MEMBER_TABLE} (
         id, journey_id, status, preferred_tier, application, photos, trusted_member, ownership,
         current_consultant_id, assigned_by, assigned_at, stewardship_history, communication_journal,
         flags, private_notes, consultant_summary, timeline, created_at, updated_at
       ) values (
         $1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8,$9,$10,$11,$12::jsonb,$13::jsonb,$14::jsonb,$15::jsonb,$16::jsonb,$17::jsonb,$18,$19
       )
       on conflict (id) do update set
         status = excluded.status,
         preferred_tier = excluded.preferred_tier,
         application = excluded.application,
         photos = excluded.photos,
         trusted_member = excluded.trusted_member,
         ownership = excluded.ownership,
         current_consultant_id = excluded.current_consultant_id,
         assigned_by = excluded.assigned_by,
         assigned_at = excluded.assigned_at,
         stewardship_history = excluded.stewardship_history,
         communication_journal = excluded.communication_journal,
         flags = excluded.flags,
         private_notes = excluded.private_notes,
         consultant_summary = excluded.consultant_summary,
         timeline = excluded.timeline,
         updated_at = excluded.updated_at`,
      [
        normalized.id,
        normalized.journeyId,
        normalized.status,
        normalized.preferredTier,
        JSON.stringify({
          ...normalized.application,
          journeyMilestoneTimeline:
            normalized.journeyMilestoneTimeline ?? normalized.application.journeyMilestoneTimeline,
          id: normalized.id,
          journeyId: normalized.journeyId,
          status: normalized.status,
          preferredTier: normalized.preferredTier,
          createdAt: normalized.createdAt,
          updatedAt: normalized.updatedAt
        }),
        JSON.stringify(normalized.photos),
        normalized.trustedMember,
        normalized.ownership,
        normalized.currentConsultantId,
        normalized.assignedBy,
        normalized.assignedAt,
        JSON.stringify(normalized.stewardshipHistory),
        JSON.stringify(normalized.communicationJournal),
        JSON.stringify(normalized.flags),
        JSON.stringify(normalized.privateNotes),
        normalized.consultantSummary ? JSON.stringify(normalized.consultantSummary) : null,
        JSON.stringify(normalized.timeline),
        normalized.createdAt,
        normalized.updatedAt
      ]
    );

    for (const introduction of normalized.introductions) {
      const introId = String(introduction.id || "").trim();
      if (!introId) continue;
      const introductionId = String(introduction.introductionId || introId).trim();
      await query(
        `insert into concierge_introductions (id, introduction_id, member_id, journey_id, record, timeline, created_at, updated_at)
         values ($1,$2,$3,$4,$5::jsonb,'[]'::jsonb,now(),now())
         on conflict (id) do update set
           record = excluded.record,
           updated_at = now()`,
        [introId, introductionId, normalized.id, normalized.journeyId, JSON.stringify(introduction)]
      );
    }

    for (const followup of normalized.followUpTasks) {
      const followupId = String(followup.id || "").trim();
      if (!followupId) continue;
      await query(
        `insert into concierge_followups (id, member_id, journey_id, record, timeline, created_at, updated_at)
         values ($1,$2,$3,$4::jsonb,'[]'::jsonb,now(),now())
         on conflict (id) do update set
           record = excluded.record,
           updated_at = now()`,
        [followupId, normalized.id, normalized.journeyId, JSON.stringify(followup)]
      );
    }

    if (normalized.journeyArchive) {
      await query(
        `insert into concierge_archives (journey_id, member_id, record, timeline, created_at, updated_at)
         values ($1,$2,$3::jsonb,'[]'::jsonb,now(),now())
         on conflict (journey_id) do update set
           record = excluded.record,
           updated_at = now()`,
        [normalized.journeyId, normalized.id, JSON.stringify(normalized.journeyArchive)]
      );
    }

    if (normalized.relationshipLegacyIndex) {
      await query(
        `insert into concierge_legacy_profiles (journey_id, member_id, record, created_at, updated_at)
         values ($1,$2,$3::jsonb,now(),now())
         on conflict (journey_id) do update set
           record = excluded.record,
           updated_at = now()`,
        [normalized.journeyId, normalized.id, JSON.stringify(normalized.relationshipLegacyIndex)]
      );
    }

    if (normalized.successStoryConsent) {
      const consentId = String(normalized.successStoryConsent.id || `consent_${normalized.journeyId}`).trim();
      await query(
        `insert into concierge_success_story_consents (id, journey_id, record, timeline, created_at, updated_at)
         values ($1,$2,$3::jsonb,'[]'::jsonb,now(),now())
         on conflict (journey_id) do update set
           record = excluded.record,
           updated_at = now()`,
        [consentId, normalized.journeyId, JSON.stringify(normalized.successStoryConsent)]
      );
    }

  return { ok: true, memberId: normalized.id, journeyId: normalized.journeyId };
}

const TIMELINE_TABLES = {
  members: { table: MEMBER_TABLE, idColumn: "id" },
  consultation_payments: { table: "concierge_consultation_payments", idColumn: "payment_id" },
  consultations: { table: "concierge_consultations", idColumn: "id" },
  meeting_notes: { table: "concierge_meeting_notes", idColumn: "id" },
  introductions: { table: "concierge_introductions", idColumn: "id" },
  followups: { table: "concierge_followups", idColumn: "id" },
  archives: { table: "concierge_archives", idColumn: "journey_id" },
  success_story_consents: { table: "concierge_success_story_consents", idColumn: "id" },
  notifications: { table: "concierge_notifications", idColumn: "id" },
  relationship_health_alerts: { table: "concierge_relationship_health_alerts", idColumn: "id" }
};

export async function appendConciergeTimelineEntry(input) {
  if (!isDatabaseReady()) {
    return { ok: false, error: "database_unavailable" };
  }

  const config = TIMELINE_TABLES[input?.table];
  const recordId = String(input?.recordId || "").trim();
  const entry = input?.entry && typeof input.entry === "object" ? input.entry : null;

  if (!config || !recordId || !entry) {
    return { ok: false, error: "invalid_timeline_request" };
  }

  const { rows } = await query(
    `update ${config.table}
     set timeline = timeline || $2::jsonb,
         updated_at = now()
     where ${config.idColumn} = $1
     returning timeline`,
    [recordId, JSON.stringify([entry])]
  );

  if (!rows[0]) {
    return { ok: false, error: "record_not_found" };
  }

  return { ok: true, timeline: rows[0].timeline };
}

async function upsertConsultant(consultant) {
  const id = String(consultant?.id || "").trim();
  if (!id) return;
  await query(
    `insert into concierge_consultants (id, record, created_at, updated_at)
     values ($1,$2::jsonb,now(),now())
     on conflict (id) do update set record = excluded.record, updated_at = now()`,
    [id, JSON.stringify(consultant)]
  );
}

async function upsertConsultationPayment(payment) {
  const paymentId = String(payment?.paymentId || payment?.id || "").trim().toUpperCase();
  if (!paymentId) return;
  await query(
    `insert into concierge_consultation_payments (payment_id, member_id, journey_id, record, timeline, created_at, updated_at)
     values ($1,$2,$3,$4::jsonb,$5::jsonb,now(),now())
     on conflict (payment_id) do update set
       record = excluded.record,
       timeline = excluded.timeline,
       updated_at = now()`,
    [
      paymentId,
      String(payment.memberId || ""),
      String(payment.journeyId || ""),
      JSON.stringify(payment),
      JSON.stringify(Array.isArray(payment.timeline) ? payment.timeline : [])
    ]
  );
}

async function upsertConsultation(consultation) {
  const id = String(consultation?.id || "").trim();
  if (!id) return;
  await query(
    `insert into concierge_consultations (id, member_id, journey_id, consultant_id, record, timeline, created_at, updated_at)
     values ($1,$2,$3,$4,$5::jsonb,$6::jsonb,now(),now())
     on conflict (id) do update set
       record = excluded.record,
       timeline = excluded.timeline,
       updated_at = now()`,
    [
      id,
      String(consultation.memberId || ""),
      String(consultation.journeyId || ""),
      String(consultation.consultantId || "") || null,
      JSON.stringify(consultation),
      JSON.stringify(Array.isArray(consultation.timeline) ? consultation.timeline : [])
    ]
  );
}

async function upsertMeetingNote(note) {
  const id = String(note?.id || "").trim();
  const noteId = String(note?.noteId || id).trim().toUpperCase();
  if (!id || !noteId) return;
  await query(
    `insert into concierge_meeting_notes (id, note_id, member_id, journey_id, record, timeline, created_at, updated_at)
     values ($1,$2,$3,$4,$5::jsonb,$6::jsonb,now(),now())
     on conflict (id) do update set
       record = excluded.record,
       timeline = excluded.timeline,
       updated_at = now()`,
    [
      id,
      noteId,
      String(note.memberId || ""),
      String(note.journeyId || "") || null,
      JSON.stringify(note),
      JSON.stringify(Array.isArray(note.timeline) ? note.timeline : [])
    ]
  );
}

async function upsertEngineIntroduction(introduction) {
  const id = String(introduction?.id || "").trim();
  const introductionId = String(introduction?.introductionId || id).trim().toUpperCase();
  if (!id || !introductionId) return;
  await query(
    `insert into concierge_introductions (id, introduction_id, member_id, journey_id, record, timeline, created_at, updated_at)
     values ($1,$2,$3,$4,$5::jsonb,$6::jsonb,now(),now())
     on conflict (id) do update set
       record = excluded.record,
       timeline = excluded.timeline,
       updated_at = now()`,
    [
      id,
      introductionId,
      String(introduction.memberAId || introduction.memberId || ""),
      String(introduction.journeyAId || introduction.journeyId || ""),
      JSON.stringify(introduction),
      JSON.stringify(Array.isArray(introduction.timeline) ? introduction.timeline : [])
    ]
  );
}

async function upsertNotification(notification) {
  const id = String(notification?.id || "").trim();
  const notificationId = String(notification?.notificationId || id).trim().toUpperCase();
  if (!id || !notificationId) return;
  await query(
    `insert into concierge_notifications (id, notification_id, member_id, journey_id, record, timeline, created_at, updated_at)
     values ($1,$2,$3,$4,$5::jsonb,$6::jsonb,now(),now())
     on conflict (id) do update set
       record = excluded.record,
       timeline = excluded.timeline,
       updated_at = now()`,
    [
      id,
      notificationId,
      String(notification.memberId || ""),
      String(notification.journeyId || "") || null,
      JSON.stringify(notification),
      JSON.stringify(Array.isArray(notification.timeline) ? notification.timeline : [])
    ]
  );
}

async function upsertHealthAlert(alert) {
  const id = String(alert?.id || "").trim();
  if (!id) return;
  await query(
    `insert into concierge_relationship_health_alerts (id, journey_id, introduction_id, record, timeline, created_at, updated_at)
     values ($1,$2,$3,$4::jsonb,$5::jsonb,now(),now())
     on conflict (id) do update set
       record = excluded.record,
       timeline = excluded.timeline,
       updated_at = now()`,
    [
      id,
      String(alert.journeyId || ""),
      String(alert.introductionId || "") || null,
      JSON.stringify(alert),
      JSON.stringify(Array.isArray(alert.timeline) ? alert.timeline : [])
    ]
  );
}

export async function bootstrapConciergePersistence(payload = {}) {
  if (!isDatabaseReady()) {
    return { ok: false, skipped: true, reason: "database_unavailable" };
  }

  const status = await getConciergePersistenceStatus();
  if (status.memberCount > 0 && !payload.force) {
    return { ok: true, skipped: true, reason: "already_bootstrapped", ...status };
  }

  const consultants = Array.isArray(payload.consultants) ? payload.consultants : [];
  const members = Array.isArray(payload.members) ? payload.members : [];

  if (!consultants.length && !members.length) {
    return { ok: false, error: "bootstrap_payload_empty" };
  }

  await query("begin");
  try {
    for (const consultant of consultants) {
      await upsertConsultant(consultant);
    }

    for (const member of members) {
      await upsertConciergeMemberRecord(member);
    }

    for (const payment of payload.consultationPayments || []) {
      await upsertConsultationPayment(payment);
    }
    for (const consultation of payload.consultations || []) {
      await upsertConsultation(consultation);
    }
    for (const note of payload.meetingNotes || []) {
      await upsertMeetingNote(note);
    }
    for (const introduction of payload.introductions || []) {
      await upsertEngineIntroduction(introduction);
    }
    for (const followup of payload.followups || []) {
      const followupId = String(followup?.id || "").trim();
      if (!followupId) continue;
      await query(
        `insert into concierge_followups (id, member_id, journey_id, record, timeline, created_at, updated_at)
         values ($1,$2,$3,$4::jsonb,'[]'::jsonb,now(),now())
         on conflict (id) do nothing`,
        [
          followupId,
          String(followup.memberId || ""),
          String(followup.journeyId || "") || null,
          JSON.stringify(followup)
        ]
      );
    }
    for (const archive of payload.archives || []) {
      const journeyId = String(archive?.journeyId || archive?.journey_id || "").trim();
      if (!journeyId) continue;
      await query(
        `insert into concierge_archives (journey_id, member_id, record, timeline, created_at, updated_at)
         values ($1,$2,$3::jsonb,'[]'::jsonb,now(),now())
         on conflict (journey_id) do nothing`,
        [journeyId, String(archive.memberId || ""), JSON.stringify(archive)]
      );
    }
    for (const profile of payload.legacyProfiles || []) {
      const journeyId = String(profile?.journeyId || "").trim();
      if (!journeyId) continue;
      await query(
        `insert into concierge_legacy_profiles (journey_id, member_id, record, created_at, updated_at)
         values ($1,$2,$3::jsonb,now(),now())
         on conflict (journey_id) do nothing`,
        [journeyId, String(profile.memberId || ""), JSON.stringify(profile)]
      );
    }
    for (const consent of payload.successStoryConsents || []) {
      const journeyId = String(consent?.journeyId || "").trim();
      const consentId = String(consent?.id || `consent_${journeyId}`).trim();
      if (!journeyId) continue;
      await query(
        `insert into concierge_success_story_consents (id, journey_id, record, timeline, created_at, updated_at)
         values ($1,$2,$3::jsonb,'[]'::jsonb,now(),now())
         on conflict (journey_id) do nothing`,
        [consentId, journeyId, JSON.stringify(consent)]
      );
    }
    for (const notification of payload.notifications || []) {
      await upsertNotification(notification);
    }
    for (const alert of payload.relationshipHealthAlerts || []) {
      await upsertHealthAlert(alert);
    }

    await query("commit");

    logObservabilityEvent("concierge_persistence_bootstrapped", {
      consultants: consultants.length,
      members: members.length
    });

    return {
      ok: true,
      consultants: consultants.length,
      members: members.length,
      ...(await getConciergePersistenceStatus())
    };
  } catch (error) {
    await query("rollback");
    throw error;
  }
}

export async function listConciergeConsultantsFromDb() {
  if (!isDatabaseReady()) return [];
  const { rows } = await query(`select record from concierge_consultants order by created_at asc`);
  return rows.map((row) => row.record);
}
