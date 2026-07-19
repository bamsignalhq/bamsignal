/**
 * Phase 3E — Concierge Operations (workflow layer).
 *
 * After Concierge eligibility is granted elsewhere:
 * Application → Review → Acceptance → Assignment → Case → Invoice → Payment → Progress → Completion
 *
 * Invoices belong to the case and never grant membership.
 * Does not perform matching / Discover / privacy / entitlements / commerce.
 */

import { isDatabaseReady, query } from "../db.js";
import { formatJourneyId, isValidJourneyId, normalizeJourneyId } from "./journeyId.js";
import { upsertConciergeMemberRecord } from "./conciergePersistence.js";
import {
  CASE_EVENT,
  CASE_STATUS,
  INVOICE_STATUS,
  assertTransition,
  canCreateInvoice,
  deriveOpsStatusFromMember,
  formatInvoiceNumber,
  memberStatusForOps,
  normalizeCaseStatus,
  sumLineItemsKobo
} from "../../shared/conciergeOperationsHelpers.mjs";

export {
  CASE_EVENT,
  CASE_STATUS,
  INVOICE_STATUS,
  canCreateInvoice,
  deriveOpsStatusFromMember,
  normalizeCaseStatus
};

function asIso(value = new Date()) {
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? new Date().toISOString() : new Date(parsed).toISOString();
}

function fail(code, message, extra = {}) {
  return { ok: false, error: code, message, ...extra };
}

async function recordCaseEvent({
  eventType,
  caseMemberId,
  journeyId,
  fromStatus = null,
  toStatus = null,
  consultantId = null,
  invoiceId = null,
  actor = "system",
  notes = null,
  metadata = {}
}) {
  if (!isDatabaseReady()) return null;
  try {
    const result = await query(
      `insert into concierge_case_events (
         event_type, case_member_id, journey_id, from_status, to_status,
         consultant_id, invoice_id, actor, notes, metadata
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)
       returning *`,
      [
        eventType,
        caseMemberId,
        journeyId,
        fromStatus,
        toStatus,
        consultantId,
        invoiceId,
        String(actor || "system").slice(0, 120),
        notes ? String(notes).slice(0, 4000) : null,
        JSON.stringify(metadata || {})
      ]
    );
    return result.rows[0] || null;
  } catch {
    // Table may be absent until migrate — do not block ops when events cannot persist.
    return null;
  }
}

async function loadCaseRow(memberId) {
  if (!isDatabaseReady() || !memberId) return null;
  try {
    const result = await query(
      `select id, journey_id, status, ops_status, preferred_tier, application,
              current_consultant_id, assigned_by, assigned_at, private_notes, timeline,
              stewardship_history, created_at, updated_at
       from concierge_members
       where id = $1
       limit 1`,
      [String(memberId).trim()]
    );
    return result.rows[0] || null;
  } catch {
    return null;
  }
}

function caseSnapshot(row) {
  if (!row) return null;
  const opsStatus = deriveOpsStatusFromMember({
    opsStatus: row.ops_status,
    status: row.status
  });
  return {
    memberId: row.id,
    journeyId: row.journey_id,
    opsStatus,
    memberStatus: row.status,
    preferredTier: row.preferred_tier || null,
    consultantId: row.current_consultant_id || null,
    assignedBy: row.assigned_by || null,
    assignedAt: row.assigned_at || null,
    privateNotes: Array.isArray(row.private_notes) ? row.private_notes : [],
    stewardshipHistory: Array.isArray(row.stewardship_history) ? row.stewardship_history : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function applyOpsStatus(row, nextOpsStatus, { actor, consultantId, assignedBy, assignedAt } = {}) {
  const opsStatus = normalizeCaseStatus(nextOpsStatus);
  if (!opsStatus) {
    return fail("invalid_ops_status", "Unknown case status.");
  }
  const memberStatus = memberStatusForOps(opsStatus);
  const consultant =
    consultantId === undefined ? row.current_consultant_id : consultantId || null;
  const by =
    assignedBy === undefined ? row.assigned_by : assignedBy || null;
  const at =
    assignedAt === undefined
      ? row.assigned_at
      : assignedAt
        ? asIso(assignedAt)
        : null;

  try {
    const result = await query(
      `update concierge_members
       set ops_status = $2,
           status = $3,
           current_consultant_id = $4,
           assigned_by = $5,
           assigned_at = $6,
           updated_at = now()
       where id = $1
       returning id, journey_id, status, ops_status, preferred_tier, application,
                 current_consultant_id, assigned_by, assigned_at, private_notes, timeline,
                 stewardship_history, created_at, updated_at`,
      [row.id, opsStatus, memberStatus, consultant, by, at]
    );
    return { ok: true, row: result.rows[0], actor };
  } catch (error) {
    // ops_status column may be missing pre-migrate — fall back to status only.
    if (String(error?.message || "").includes("ops_status")) {
      const result = await query(
        `update concierge_members
         set status = $2,
             current_consultant_id = $3,
             assigned_by = $4,
             assigned_at = $5,
             updated_at = now()
         where id = $1
         returning id, journey_id, status, preferred_tier, application,
                   current_consultant_id, assigned_by, assigned_at, private_notes, timeline,
                   stewardship_history, created_at, updated_at`,
        [row.id, memberStatus, consultant, by, at]
      );
      const fallback = result.rows[0];
      if (fallback) fallback.ops_status = opsStatus;
      return { ok: true, row: fallback, actor };
    }
    throw error;
  }
}

async function appendPrivateNote(memberId, note) {
  if (!note) return;
  await query(
    `update concierge_members
     set private_notes = coalesce(private_notes, '[]'::jsonb) || $2::jsonb,
         updated_at = now()
     where id = $1`,
    [memberId, JSON.stringify([note])]
  );
}

async function appendStewardship(memberId, entry) {
  if (!entry) return;
  await query(
    `update concierge_members
     set stewardship_history = coalesce(stewardship_history, '[]'::jsonb) || $2::jsonb,
         updated_at = now()
     where id = $1`,
    [memberId, JSON.stringify([entry])]
  );
}

async function allocateJourneyId() {
  const year = new Date().getUTCFullYear();
  const result = await query(
    `select journey_id from concierge_members
     where journey_id like $1
     order by journey_id desc
     limit 1`,
    [`BS-JR-${year}-%`]
  );
  let sequence = 1;
  const last = result.rows[0]?.journey_id;
  if (last) {
    const match = String(last).match(/^BS-JR-\d{4}-(\d{4})$/);
    if (match) sequence = Number(match[1]) + 1;
  }
  if (sequence > 9999) {
    throw new Error("journey_id_sequence_exhausted");
  }
  return formatJourneyId(year, sequence);
}

async function allocateInvoiceNumber() {
  const year = new Date().getUTCFullYear();
  const result = await query(
    `select invoice_number from concierge_invoices
     where invoice_number like $1
     order by invoice_number desc
     limit 1`,
    [`BS-INV-${year}-%`]
  );
  let sequence = 1;
  const last = result.rows[0]?.invoice_number;
  if (last) {
    const match = String(last).match(/^BS-INV-\d{4}-(\d{4,})$/);
    if (match) sequence = Number(match[1]) + 1;
  }
  return formatInvoiceNumber(year, sequence);
}

export async function listConciergeCases({ opsStatus = null, consultantId = null, limit = 100 } = {}) {
  if (!isDatabaseReady()) {
    return fail("database_unavailable", "Database is not connected.");
  }
  const caps = Math.max(1, Math.min(500, Number(limit) || 100));
  const clauses = [];
  const params = [];
  if (opsStatus) {
    params.push(normalizeCaseStatus(opsStatus));
    clauses.push(`ops_status = $${params.length}`);
  }
  if (consultantId) {
    params.push(String(consultantId).trim());
    clauses.push(`current_consultant_id = $${params.length}`);
  }
  params.push(caps);
  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
  try {
    const result = await query(
      `select id, journey_id, status, ops_status, preferred_tier, application,
              current_consultant_id, assigned_by, assigned_at, private_notes, timeline,
              stewardship_history, created_at, updated_at
       from concierge_members
       ${where}
       order by updated_at desc
       limit $${params.length}`,
      params
    );
    return { ok: true, cases: result.rows.map(caseSnapshot) };
  } catch (error) {
    if (String(error?.message || "").includes("ops_status")) {
      const members = [];
      const all = await query(
        `select id, journey_id, status, preferred_tier, application,
                current_consultant_id, assigned_by, assigned_at, private_notes, timeline,
                stewardship_history, created_at, updated_at
         from concierge_members
         order by updated_at desc
         limit $1`,
        [caps]
      );
      for (const row of all.rows) {
        const snap = caseSnapshot({ ...row, ops_status: null });
        if (opsStatus && snap.opsStatus !== normalizeCaseStatus(opsStatus)) continue;
        if (consultantId && snap.consultantId !== String(consultantId).trim()) continue;
        members.push(snap);
      }
      return { ok: true, cases: members };
    }
    throw error;
  }
}

export async function getConciergeCase(memberId) {
  if (!isDatabaseReady()) {
    return fail("database_unavailable", "Database is not connected.");
  }
  const row = await loadCaseRow(memberId);
  if (!row) return fail("case_not_found", "Concierge case not found.");

  let history = [];
  try {
    const events = await query(
      `select * from concierge_case_events
       where case_member_id = $1
       order by created_at asc`,
      [row.id]
    );
    history = events.rows;
  } catch {
    history = [];
  }

  let invoices = [];
  try {
    const inv = await query(
      `select * from concierge_invoices
       where member_id = $1
       order by created_at desc`,
      [row.id]
    );
    invoices = inv.rows;
  } catch {
    invoices = [];
  }

  return {
    ok: true,
    case: caseSnapshot(row),
    history,
    invoices
  };
}

/**
 * New application → creates/ensures case at applied.
 * Does not check entitlements (eligibility is a separate layer).
 */
export async function submitConciergeApplication({
  memberId,
  journeyId = null,
  preferredTier = null,
  application = {},
  actor = "member"
} = {}) {
  if (!isDatabaseReady()) {
    return fail("database_unavailable", "Database is not connected.");
  }
  const id = String(memberId || "").trim();
  if (!id) return fail("member_id_required", "Member ID is required.");

  const existing = await loadCaseRow(id);
  if (existing) {
    const ops = deriveOpsStatusFromMember({
      opsStatus: existing.ops_status,
      status: existing.status
    });
    return {
      ok: true,
      duplicate: true,
      case: caseSnapshot(existing),
      message: `Case already exists in status ${ops}.`
    };
  }

  let jid = journeyId ? normalizeJourneyId(String(journeyId)) : null;
  if (jid && !isValidJourneyId(jid)) {
    return fail("invalid_journey_id", "Journey ID must match BS-JR-YYYY-NNNN.");
  }
  if (!jid) {
    jid = await allocateJourneyId();
  }

  const now = asIso();
  const upsert = await upsertConciergeMemberRecord({
    id,
    journeyId: jid,
    status: memberStatusForOps(CASE_STATUS.APPLIED),
    preferredTier: preferredTier || null,
    ...application,
    timeline: [
      {
        id: `ops_app_${Date.now()}`,
        label: "Application submitted",
        at: now,
        actor
      }
    ],
    createdAt: now,
    updatedAt: now
  });
  if (!upsert?.ok) {
    return fail(upsert?.error || "upsert_failed", "Could not create Concierge case.");
  }

  try {
    await query(`update concierge_members set ops_status = $2 where id = $1`, [
      id,
      CASE_STATUS.APPLIED
    ]);
  } catch {
    /* ops_status may be absent pre-migrate */
  }

  const row = await loadCaseRow(id);
  await recordCaseEvent({
    eventType: CASE_EVENT.APPLICATION_SUBMITTED,
    caseMemberId: id,
    journeyId: jid,
    fromStatus: null,
    toStatus: CASE_STATUS.APPLIED,
    actor,
    metadata: { preferredTier: preferredTier || null }
  });

  return { ok: true, case: caseSnapshot(row) };
}

export async function startConciergeReview({ memberId, actor = "admin", notes = null } = {}) {
  return transitionCase({
    memberId,
    toStatus: CASE_STATUS.UNDER_REVIEW,
    eventType: CASE_EVENT.REVIEW_STARTED,
    actor,
    notes
  });
}

export async function acceptConciergeApplication({ memberId, actor = "admin", notes = null } = {}) {
  return transitionCase({
    memberId,
    toStatus: CASE_STATUS.ACCEPTED,
    eventType: CASE_EVENT.APPLICATION_ACCEPTED,
    actor,
    notes
  });
}

export async function rejectConciergeApplication({ memberId, actor = "admin", notes = null } = {}) {
  return transitionCase({
    memberId,
    toStatus: CASE_STATUS.REJECTED,
    eventType: CASE_EVENT.APPLICATION_REJECTED,
    actor,
    notes
  });
}

export async function assignConciergeConsultant({
  memberId,
  consultantId,
  actor = "admin",
  notes = null
} = {}) {
  if (!isDatabaseReady()) {
    return fail("database_unavailable", "Database is not connected.");
  }
  const cid = String(consultantId || "").trim();
  if (!cid) return fail("consultant_id_required", "Consultant ID is required.");

  const row = await loadCaseRow(memberId);
  if (!row) return fail("case_not_found", "Concierge case not found.");

  const from = deriveOpsStatusFromMember({ opsStatus: row.ops_status, status: row.status });
  const previousConsultant = row.current_consultant_id || null;
  const isTransfer = Boolean(previousConsultant && previousConsultant !== cid);
  const to = CASE_STATUS.ASSIGNED;

  if (
    from !== CASE_STATUS.ACCEPTED &&
    from !== CASE_STATUS.ASSIGNED &&
    from !== CASE_STATUS.IN_PROGRESS
  ) {
    return fail(
      "invalid_case_transition",
      `Cannot assign consultant from status ${from}. Accept the application first.`,
      { fromStatus: from, toStatus: to }
    );
  }

  try {
    assertTransition(from, to);
  } catch {
    return fail("invalid_case_transition", `Cannot assign consultant from ${from}.`, {
      fromStatus: from,
      toStatus: to
    });
  }

  const now = asIso();
  const applied = await applyOpsStatus(row, CASE_STATUS.ASSIGNED, {
    actor,
    consultantId: cid,
    assignedBy: actor,
    assignedAt: now
  });
  if (!applied.ok) return applied;

  await appendStewardship(row.id, {
    id: `steward_${Date.now()}`,
    type: isTransfer ? "transfer" : "assign",
    fromConsultantId: previousConsultant,
    toConsultantId: cid,
    at: now,
    by: actor,
    notes: notes || null
  });

  const event = await recordCaseEvent({
    eventType: isTransfer ? CASE_EVENT.CONSULTANT_TRANSFERRED : CASE_EVENT.CONSULTANT_ASSIGNED,
    caseMemberId: row.id,
    journeyId: row.journey_id,
    fromStatus: from,
    toStatus: CASE_STATUS.ASSIGNED,
    consultantId: cid,
    actor,
    notes,
    metadata: { previousConsultantId: previousConsultant }
  });

  return {
    ok: true,
    case: caseSnapshot(applied.row),
    transferred: isTransfer,
    event
  };
}

export async function transferConciergeConsultant(input = {}) {
  return assignConciergeConsultant(input);
}

export async function addConciergeCaseNote({
  memberId,
  note,
  actor = "admin",
  internal = true
} = {}) {
  if (!isDatabaseReady()) {
    return fail("database_unavailable", "Database is not connected.");
  }
  const text = String(note || "").trim();
  if (!text) return fail("note_required", "Note text is required.");

  const row = await loadCaseRow(memberId);
  if (!row) return fail("case_not_found", "Concierge case not found.");

  const entry = {
    id: `note_${Date.now()}`,
    text: text.slice(0, 4000),
    at: asIso(),
    by: actor,
    internal: Boolean(internal)
  };
  await appendPrivateNote(row.id, entry);
  const event = await recordCaseEvent({
    eventType: CASE_EVENT.NOTE_ADDED,
    caseMemberId: row.id,
    journeyId: row.journey_id,
    fromStatus: deriveOpsStatusFromMember({ opsStatus: row.ops_status, status: row.status }),
    toStatus: deriveOpsStatusFromMember({ opsStatus: row.ops_status, status: row.status }),
    consultantId: row.current_consultant_id,
    actor,
    notes: text.slice(0, 500),
    metadata: { internal: Boolean(internal) }
  });

  const refreshed = await loadCaseRow(row.id);
  return { ok: true, case: caseSnapshot(refreshed), note: entry, event };
}

export async function recordConciergeProgress({
  memberId,
  summary,
  actor = "consultant",
  advanceToInProgress = true
} = {}) {
  if (!isDatabaseReady()) {
    return fail("database_unavailable", "Database is not connected.");
  }
  const row = await loadCaseRow(memberId);
  if (!row) return fail("case_not_found", "Concierge case not found.");

  const from = deriveOpsStatusFromMember({ opsStatus: row.ops_status, status: row.status });
  let nextRow = row;
  if (advanceToInProgress && from === CASE_STATUS.ASSIGNED) {
    const applied = await applyOpsStatus(row, CASE_STATUS.IN_PROGRESS, { actor });
    if (!applied.ok) return applied;
    nextRow = applied.row;
  } else if (from !== CASE_STATUS.ASSIGNED && from !== CASE_STATUS.IN_PROGRESS && from !== CASE_STATUS.COMPLETED) {
    return fail(
      "invalid_case_transition",
      `Progress can only be recorded for assigned/in-progress cases (current: ${from}).`,
      { fromStatus: from }
    );
  }

  const to = deriveOpsStatusFromMember({
    opsStatus: nextRow.ops_status,
    status: nextRow.status
  });
  const event = await recordCaseEvent({
    eventType: CASE_EVENT.PROGRESS_RECORDED,
    caseMemberId: row.id,
    journeyId: row.journey_id,
    fromStatus: from,
    toStatus: to,
    consultantId: nextRow.current_consultant_id,
    actor,
    notes: summary ? String(summary).slice(0, 2000) : null,
    metadata: { summary: summary || null }
  });

  return { ok: true, case: caseSnapshot(nextRow), event };
}

export async function completeConciergeCase({ memberId, actor = "admin", notes = null } = {}) {
  return transitionCase({
    memberId,
    toStatus: CASE_STATUS.COMPLETED,
    eventType: CASE_EVENT.CASE_COMPLETED,
    actor,
    notes
  });
}

export async function closeConciergeCase({ memberId, actor = "admin", notes = null } = {}) {
  return transitionCase({
    memberId,
    toStatus: CASE_STATUS.CLOSED,
    eventType: CASE_EVENT.CASE_CLOSED,
    actor,
    notes
  });
}

export async function reopenConciergeCase({
  memberId,
  actor = "admin",
  notes = null,
  toStatus = null
} = {}) {
  if (!isDatabaseReady()) {
    return fail("database_unavailable", "Database is not connected.");
  }
  const row = await loadCaseRow(memberId);
  if (!row) return fail("case_not_found", "Concierge case not found.");

  const from = deriveOpsStatusFromMember({ opsStatus: row.ops_status, status: row.status });
  let target = normalizeCaseStatus(toStatus);
  if (!target) {
    if (from === CASE_STATUS.REJECTED || from === CASE_STATUS.CLOSED) {
      target = CASE_STATUS.UNDER_REVIEW;
    } else if (from === CASE_STATUS.COMPLETED) {
      target = CASE_STATUS.IN_PROGRESS;
    } else {
      return fail("invalid_reopen", `Cannot reopen from status ${from}.`);
    }
  }

  try {
    assertTransition(from, target);
  } catch {
    return fail("invalid_case_transition", `Cannot reopen ${from} → ${target}.`, {
      fromStatus: from,
      toStatus: target
    });
  }

  const applied = await applyOpsStatus(row, target, { actor });
  if (!applied.ok) return applied;

  const event = await recordCaseEvent({
    eventType: CASE_EVENT.CASE_REOPENED,
    caseMemberId: row.id,
    journeyId: row.journey_id,
    fromStatus: from,
    toStatus: target,
    consultantId: applied.row.current_consultant_id,
    actor,
    notes
  });

  return { ok: true, case: caseSnapshot(applied.row), event };
}

export async function setConciergeCaseStatus({
  memberId,
  opsStatus,
  actor = "admin",
  notes = null,
  force = false
} = {}) {
  if (!isDatabaseReady()) {
    return fail("database_unavailable", "Database is not connected.");
  }
  const row = await loadCaseRow(memberId);
  if (!row) return fail("case_not_found", "Concierge case not found.");

  const from = deriveOpsStatusFromMember({ opsStatus: row.ops_status, status: row.status });
  const to = normalizeCaseStatus(opsStatus);
  if (!to) return fail("invalid_ops_status", "Unknown case status.");

  if (!force) {
    try {
      assertTransition(from, to);
    } catch {
      return fail("invalid_case_transition", `Cannot change ${from} → ${to}.`, {
        fromStatus: from,
        toStatus: to
      });
    }
  }

  const applied = await applyOpsStatus(row, to, { actor });
  if (!applied.ok) return applied;

  const event = await recordCaseEvent({
    eventType: CASE_EVENT.STATUS_CHANGED,
    caseMemberId: row.id,
    journeyId: row.journey_id,
    fromStatus: from,
    toStatus: to,
    consultantId: applied.row.current_consultant_id,
    actor,
    notes,
    metadata: { force: Boolean(force) }
  });

  return { ok: true, case: caseSnapshot(applied.row), event };
}

async function transitionCase({ memberId, toStatus, eventType, actor, notes }) {
  if (!isDatabaseReady()) {
    return fail("database_unavailable", "Database is not connected.");
  }
  const row = await loadCaseRow(memberId);
  if (!row) return fail("case_not_found", "Concierge case not found.");

  const from = deriveOpsStatusFromMember({ opsStatus: row.ops_status, status: row.status });
  try {
    assertTransition(from, toStatus);
  } catch {
    return fail("invalid_case_transition", `Cannot transition ${from} → ${toStatus}.`, {
      fromStatus: from,
      toStatus
    });
  }

  const applied = await applyOpsStatus(row, toStatus, { actor });
  if (!applied.ok) return applied;

  if (notes) {
    await appendPrivateNote(row.id, {
      id: `note_${Date.now()}`,
      text: String(notes).slice(0, 4000),
      at: asIso(),
      by: actor,
      internal: true
    });
  }

  const event = await recordCaseEvent({
    eventType,
    caseMemberId: row.id,
    journeyId: row.journey_id,
    fromStatus: from,
    toStatus,
    consultantId: applied.row.current_consultant_id,
    actor,
    notes
  });

  return { ok: true, case: caseSnapshot(applied.row), event };
}

/**
 * Create an invoice on a case. Does NOT grant membership or entitlements.
 */
export async function createConciergeInvoice({
  memberId,
  lineItems = [],
  notes = null,
  dueAt = null,
  consultantId = null,
  actor = "admin",
  send = false
} = {}) {
  if (!isDatabaseReady()) {
    return fail("database_unavailable", "Database is not connected.");
  }
  const row = await loadCaseRow(memberId);
  if (!row) return fail("case_not_found", "Concierge case not found.");

  const ops = deriveOpsStatusFromMember({ opsStatus: row.ops_status, status: row.status });
  if (!canCreateInvoice(ops)) {
    return fail(
      "invoice_not_allowed",
      `Invoices require an assigned/in-progress case (current: ${ops}).`,
      { opsStatus: ops }
    );
  }

  const items = Array.isArray(lineItems) ? lineItems : [];
  const totalKobo = sumLineItemsKobo(items);
  if (totalKobo <= 0) {
    return fail("invoice_empty", "Invoice requires at least one positive line item.");
  }

  const invoiceNumber = await allocateInvoiceNumber();
  const status = send ? INVOICE_STATUS.SENT : INVOICE_STATUS.DRAFT;
  const cid = consultantId || row.current_consultant_id || null;

  const inserted = await query(
    `insert into concierge_invoices (
       invoice_number, journey_id, member_id, consultant_id, status,
       currency, total_kobo, amount_paid_kobo, due_at, notes, timeline
     ) values ($1,$2,$3,$4,$5,'NGN',$6,0,$7,$8,$9::jsonb)
     returning *`,
    [
      invoiceNumber,
      row.journey_id,
      row.id,
      cid,
      status,
      totalKobo,
      dueAt ? asIso(dueAt) : null,
      notes ? String(notes).slice(0, 4000) : null,
      JSON.stringify([
        {
          at: asIso(),
          actor,
          action: "created",
          status
        }
      ])
    ]
  );
  const invoice = inserted.rows[0];
  if (!invoice) return fail("invoice_create_failed", "Could not create invoice.");

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const label = String(item.label || item.description || "Service").slice(0, 200);
    const amountKobo = Math.round(Number(item.amountKobo ?? item.amount_kobo ?? 0));
    const quantity = Math.max(1, Math.round(Number(item.quantity ?? 1)));
    if (amountKobo < 0) continue;
    await query(
      `insert into concierge_invoice_line_items (invoice_id, label, amount_kobo, quantity, sort_order)
       values ($1,$2,$3,$4,$5)`,
      [invoice.id, label, amountKobo, quantity, i]
    );
  }

  const event = await recordCaseEvent({
    eventType: send ? CASE_EVENT.INVOICE_SENT : CASE_EVENT.INVOICE_CREATED,
    caseMemberId: row.id,
    journeyId: row.journey_id,
    fromStatus: ops,
    toStatus: ops,
    consultantId: cid,
    invoiceId: invoice.id,
    actor,
    notes,
    metadata: {
      invoiceNumber,
      totalKobo,
      status,
      grantsMembership: false
    }
  });

  return { ok: true, invoice, event, grantsMembership: false };
}

/**
 * Record payment against an invoice. Does NOT call commerce / entitlements.
 */
export async function markConciergeInvoicePaid({
  invoiceId,
  paymentRef = null,
  amountPaidKobo = null,
  actor = "system"
} = {}) {
  if (!isDatabaseReady()) {
    return fail("database_unavailable", "Database is not connected.");
  }
  const id = String(invoiceId || "").trim();
  if (!id) return fail("invoice_id_required", "Invoice ID is required.");

  let invoice;
  try {
    const found = await query(`select * from concierge_invoices where id = $1 limit 1`, [id]);
    invoice = found.rows[0];
  } catch {
    return fail("invoice_unavailable", "Invoice table unavailable.");
  }
  if (!invoice) return fail("invoice_not_found", "Invoice not found.");
  if (invoice.status === INVOICE_STATUS.CANCELLED) {
    return fail("invoice_cancelled", "Cannot pay a cancelled invoice.");
  }
  if (invoice.status === INVOICE_STATUS.PAID) {
    return { ok: true, duplicate: true, invoice, grantsMembership: false };
  }

  const paid = amountPaidKobo != null ? Math.round(Number(amountPaidKobo)) : Number(invoice.total_kobo);
  if (!Number.isFinite(paid) || paid < 0) {
    return fail("invalid_amount", "Invalid paid amount.");
  }

  const nextStatus =
    paid >= Number(invoice.total_kobo) ? INVOICE_STATUS.PAID : INVOICE_STATUS.PARTIALLY_PAID;
  const now = asIso();

  let updated;
  try {
    const result = await query(
      `update concierge_invoices
       set status = $2,
           amount_paid_kobo = $3,
           payment_ref = coalesce($4, payment_ref),
           paid_at = case when $2 = 'paid' then now() else paid_at end,
           timeline = coalesce(timeline, '[]'::jsonb) || $5::jsonb,
           updated_at = now()
       where id = $1
       returning *`,
      [
        id,
        nextStatus,
        paid,
        paymentRef ? String(paymentRef).trim() : null,
        JSON.stringify([{ at: now, actor, action: "payment", status: nextStatus, paymentRef }])
      ]
    );
    updated = result.rows[0];
  } catch (error) {
    if (String(error?.message || "").includes("payment_ref")) {
      const result = await query(
        `update concierge_invoices
         set status = $2,
             amount_paid_kobo = $3,
             timeline = coalesce(timeline, '[]'::jsonb) || $4::jsonb,
             updated_at = now()
         where id = $1
         returning *`,
        [
          id,
          nextStatus,
          paid,
          JSON.stringify([{ at: now, actor, action: "payment", status: nextStatus, paymentRef }])
        ]
      );
      updated = result.rows[0];
    } else {
      throw error;
    }
  }

  const event = await recordCaseEvent({
    eventType: CASE_EVENT.INVOICE_PAID,
    caseMemberId: invoice.member_id,
    journeyId: invoice.journey_id,
    consultantId: invoice.consultant_id,
    invoiceId: invoice.id,
    actor,
    metadata: {
      paymentRef: paymentRef || null,
      amountPaidKobo: paid,
      status: nextStatus,
      grantsMembership: false
    }
  });

  // Advance case into in_progress when still only assigned.
  const caseRow = await loadCaseRow(invoice.member_id);
  if (caseRow) {
    const ops = deriveOpsStatusFromMember({
      opsStatus: caseRow.ops_status,
      status: caseRow.status
    });
    if (ops === CASE_STATUS.ASSIGNED && nextStatus === INVOICE_STATUS.PAID) {
      await applyOpsStatus(caseRow, CASE_STATUS.IN_PROGRESS, { actor });
    }
  }

  return { ok: true, invoice: updated, event, grantsMembership: false };
}

export async function cancelConciergeInvoice({ invoiceId, actor = "admin", notes = null } = {}) {
  if (!isDatabaseReady()) {
    return fail("database_unavailable", "Database is not connected.");
  }
  const id = String(invoiceId || "").trim();
  const found = await query(`select * from concierge_invoices where id = $1 limit 1`, [id]);
  const invoice = found.rows[0];
  if (!invoice) return fail("invoice_not_found", "Invoice not found.");
  if (invoice.status === INVOICE_STATUS.PAID) {
    return fail("invoice_already_paid", "Cannot cancel a paid invoice.");
  }

  const result = await query(
    `update concierge_invoices
     set status = $2,
         notes = coalesce($3, notes),
         timeline = coalesce(timeline, '[]'::jsonb) || $4::jsonb,
         updated_at = now()
     where id = $1
     returning *`,
    [
      id,
      INVOICE_STATUS.CANCELLED,
      notes,
      JSON.stringify([{ at: asIso(), actor, action: "cancelled" }])
    ]
  );

  await recordCaseEvent({
    eventType: CASE_EVENT.INVOICE_CANCELLED,
    caseMemberId: invoice.member_id,
    journeyId: invoice.journey_id,
    invoiceId: invoice.id,
    actor,
    notes
  });

  return { ok: true, invoice: result.rows[0], grantsMembership: false };
}

/** Convenience for tests / admin: full happy-path verification without matching. */
export async function getCaseHistory(memberId) {
  if (!isDatabaseReady()) return [];
  try {
    const result = await query(
      `select * from concierge_case_events
       where case_member_id = $1
       order by created_at asc`,
      [String(memberId).trim()]
    );
    return result.rows;
  } catch {
    return [];
  }
}
