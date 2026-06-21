import { createHash } from "node:crypto";
import { findMemberProfileByUserKey } from "../cityHome.js";
import { isDatabaseReady, normalizeUserKey, query } from "../db.js";
import { createModerationFlag } from "../memberTrust.js";
import { getSubscriptionCatalog } from "./subscriptionCatalog.js";
import { assertSchemaReady } from "./schemaVerification.js";

export const EXCHANGE_STATUSES = ["pending", "accepted", "declined", "completed", "cancelled", "expired"];
export const REQUEST_EXPIRY_DAYS = 7;

function hashMeta(value = "") {
  return createHash("sha256").update(String(value)).digest("hex").slice(0, 16);
}

export async function ensureContactExchangeSchema() {
  if (!isDatabaseReady()) return;
  await assertSchemaReady();
}

async function logExchangeEvent({ matchId, userKey, profileId, eventType, field = null, text = null }) {
  if (!isDatabaseReady()) return null;
  await ensureContactExchangeSchema();
  const result = await query(
    `insert into contact_exchange_events (match_id, user_key, profile_id, event_type, field, text_hash)
     values ($1, $2, $3, $4, $5, $6)
     returning *`,
    [matchId, userKey, profileId || null, eventType, field, text ? hashMeta(text) : null]
  );
  return result.rows[0] || null;
}

async function memberIsShadowBanned(profileId) {
  if (!profileId || !isDatabaseReady()) return false;
  const result = await query(
    `select coalesce(shadow_banned, false) as shadow_banned
     from app_member_profiles where id = $1 limit 1`,
    [profileId]
  );
  return Boolean(result.rows[0]?.shadow_banned);
}

async function memberHasOpenModerationFlags(userKey) {
  if (!userKey || !isDatabaseReady()) return false;
  const result = await query(
    `select id from moderation_flags
     where user_key = $1 and resolved_at is null
     limit 1`,
    [userKey]
  );
  return Boolean(result.rows[0]);
}

async function memberPhoneVerified(email, phone) {
  const member = await findMemberProfileByUserKey(email, phone);
  if (!member) return false;
  const result = await query(
    `select phone_verified from app_users
     where user_key = $1
     limit 1`,
    [member.user_key]
  );
  return Boolean(result.rows[0]?.phone_verified);
}

async function memberIsPremium(email, phone) {
  const member = await findMemberProfileByUserKey(email, phone);
  if (!member) return false;
  const result = await query(
    `select premium_until from app_users
     where user_key = $1
     limit 1`,
    [member.user_key]
  );
  const until = result.rows[0]?.premium_until;
  return until ? new Date(until).getTime() > Date.now() : false;
}

async function memberHasFastConnectionPass(email, phone) {
  const member = await findMemberProfileByUserKey(email, phone);
  if (!member) return false;
  const result = await query(
    `select fast_connection_pass_until from app_users
     where user_key = $1
     limit 1`,
    [member.user_key]
  );
  const until = result.rows[0]?.fast_connection_pass_until;
  return until ? new Date(until).getTime() > Date.now() : false;
}

async function countCompletedExchanges(userKey, windowDays) {
  if (!isDatabaseReady() || !userKey) return 0;
  await ensureContactExchangeSchema();
  const result = await query(
    `select count(*)::int as count
     from contact_exchange_requests
     where status = 'completed'
       and completed_at >= now() - ($2 || ' days')::interval
       and (requester_user_key = $1 or recipient_user_key = $1)`,
    [userKey, Math.max(1, windowDays)]
  );
  return Number(result.rows[0]?.count || 0);
}

export async function getContactExchangeEntitlements({ email, phone }) {
  const catalog = await getSubscriptionCatalog();
  const policy = catalog.contactExchangePolicy;
  const userKey = normalizeUserKey({ email, phone });
  const premium = await memberIsPremium(email, phone);
  const fastConnection = await memberHasFastConnectionPass(email, phone);
  const unlimited = premium || fastConnection;
  const completed = userKey ? await countCompletedExchanges(userKey, policy.windowDays) : 0;
  const remaining = unlimited ? null : Math.max(0, policy.freeLimit - completed);

  return {
    policy,
    premium,
    fastConnection,
    completedInWindow: completed,
    remainingFree: remaining,
    unlimited
  };
}

export async function assertContactExchangeEligibility({ email, phone, profileId }) {
  const userKey = normalizeUserKey({ email, phone });
  if (!userKey) return { ok: false, error: "Sign in to exchange contacts." };

  const phoneVerified = await memberPhoneVerified(email, phone);
  if (!phoneVerified) {
    return { ok: false, error: "Verify your phone number before exchanging contacts." };
  }

  if (await memberHasOpenModerationFlags(userKey)) {
    return { ok: false, error: "We couldn't save that information. Please try something different." };
  }

  if (profileId && (await memberIsShadowBanned(profileId))) {
    return { ok: false, error: "We couldn't save that information. Please try something different." };
  }

  const entitlements = await getContactExchangeEntitlements({ email, phone });
  if (!entitlements.unlimited && entitlements.remainingFree !== null && entitlements.remainingFree <= 0) {
    return {
      ok: false,
      error: "You've used your free contact exchange for this month.",
      limitReached: true,
      entitlements
    };
  }

  return { ok: true, entitlements };
}

async function getThreadContactExchange(matchId, userKey) {
  if (!matchId || !userKey) return null;
  const existing = await query(
    `select meta from app_chat_threads where match_id = $1 and user_key = $2 limit 1`,
    [matchId, userKey]
  );
  const meta = existing.rows[0]?.meta;
  return meta?.contactExchange && typeof meta.contactExchange === "object" ? meta.contactExchange : null;
}

async function expireStalePendingRequests(matchId = null) {
  if (!isDatabaseReady()) return [];
  await ensureContactExchangeSchema();

  const params = [REQUEST_EXPIRY_DAYS];
  let matchClause = "";
  if (matchId) {
    params.push(matchId);
    matchClause = `and match_id = $${params.length}`;
  }

  const stale = await query(
    `update contact_exchange_requests
     set status = 'expired',
         responded_at = coalesce(responded_at, now()),
         updated_at = now()
     where status = 'pending'
       and requested_at < now() - ($1 || ' days')::interval
       ${matchClause}
     returning *`,
    params
  );

  for (const row of stale.rows) {
    const exchangePatch = { status: "expired", expiredAt: new Date().toISOString() };
    await upsertThreadMeta(row.match_id, row.requester_user_key, exchangePatch);
    await upsertThreadMeta(row.match_id, row.recipient_user_key, exchangePatch);
    await logExchangeEvent({
      matchId: row.match_id,
      userKey: row.requester_user_key,
      profileId: row.requester_profile_id,
      eventType: "contact_request_expired"
    });
  }
  return stale.rows;
}

function canStartNewExchange(latest, meta) {
  if (!latest) return true;
  if (latest.status === "pending") return false;
  if (["declined", "cancelled", "expired"].includes(latest.status)) return true;
  if (["accepted", "completed"].includes(latest.status)) {
    return meta?.contactSharingEnabled === false;
  }
  return false;
}

async function getLatestExchangeForMatch(matchId) {
  await ensureContactExchangeSchema();
  const result = await query(
    `select * from contact_exchange_requests
     where match_id = $1
     order by updated_at desc
     limit 1`,
    [matchId]
  );
  return result.rows[0] || null;
}

export async function getContactExchangeState({ email, phone, matchId }) {
  const userKey = normalizeUserKey({ email, phone });
  if (matchId) await expireStalePendingRequests(matchId);
  const row = matchId ? await getLatestExchangeForMatch(matchId) : null;
  const entitlements = await getContactExchangeEntitlements({ email, phone });
  const threadExchange = matchId && userKey ? await getThreadContactExchange(matchId, userKey) : null;

  if (!row) {
    return { ok: true, exchange: null, entitlements, role: null };
  }

  const role =
    row.requester_user_key === userKey ? "requester" : row.recipient_user_key === userKey ? "recipient" : null;

  const exchange = {
    id: row.id,
    matchId: row.match_id,
    status: row.status,
    requesterUserKey: row.requester_user_key,
    recipientUserKey: row.recipient_user_key,
    requestedAt: row.requested_at,
    respondedAt: row.responded_at,
    completedAt: row.completed_at,
    sharedContacts: row.shared_contacts || {},
    contactSharingEnabled: threadExchange?.contactSharingEnabled !== false,
    contactSharingDisabledAt: threadExchange?.contactSharingDisabledAt || null,
    contactSharingDisabledBy: threadExchange?.contactSharingDisabledBy || null
  };

  return {
    ok: true,
    exchange,
    entitlements,
    role
  };
}

async function upsertThreadMeta(matchId, userKey, patch) {
  if (!isDatabaseReady() || !matchId || !userKey) return;
  const existing = await query(
    `select meta from app_chat_threads where match_id = $1 and user_key = $2 limit 1`,
    [matchId, userKey]
  );
  const prev = existing.rows[0]?.meta && typeof existing.rows[0].meta === "object" ? existing.rows[0].meta : {};
  const meta = { ...prev, contactExchange: { ...(prev.contactExchange || {}), ...patch } };
  await query(
    `insert into app_chat_threads (match_id, user_key, meta, updated_at)
     values ($1, $2, $3, now())
     on conflict (match_id, user_key)
     do update set meta = excluded.meta, updated_at = now()`,
    [matchId, userKey, meta]
  );
}

export async function requestContactExchange({
  email,
  phone,
  matchId,
  recipientProfileId,
  requesterProfileId
}) {
  const eligibility = await assertContactExchangeEligibility({ email, phone, profileId: requesterProfileId });
  if (!eligibility.ok) return eligibility;

  const requesterKey = normalizeUserKey({ email, phone });
  const recipient = await query(`select user_key, id from app_member_profiles where id = $1 limit 1`, [
    recipientProfileId
  ]);
  const recipientKey = recipient.rows[0]?.user_key;
  if (!requesterKey || !recipientKey || !matchId) {
    return { ok: false, error: "We couldn't start that request right now." };
  }

  const latest = await getLatestExchangeForMatch(matchId);
  const requesterMeta = await getThreadContactExchange(matchId, requesterKey);
  if (latest && !canStartNewExchange(latest, requesterMeta)) {
    if (latest.status === "pending") {
      return { ok: true, exchange: latest, alreadyExists: true };
    }
    return { ok: false, error: "Contact sharing is already enabled for this chat." };
  }

  await ensureContactExchangeSchema();
  const result = await query(
    `insert into contact_exchange_requests (
       match_id, requester_user_key, requester_profile_id,
       recipient_user_key, recipient_profile_id, status
     ) values ($1, $2, $3, $4, $5, 'pending')
     returning *`,
    [matchId, requesterKey, requesterProfileId || null, recipientKey, recipientProfileId || null]
  );
  const row = result.rows[0];
  if (!row) return { ok: false, error: "We couldn't start that request right now." };

  const exchangePatch = {
    status: "pending",
    requesterUserKey: requesterKey,
    recipientUserKey: recipientKey,
    requestedAt: row.requested_at
  };

  await upsertThreadMeta(matchId, requesterKey, exchangePatch);
  await upsertThreadMeta(matchId, recipientKey, exchangePatch);
  await logExchangeEvent({
    matchId,
    userKey: requesterKey,
    profileId: requesterProfileId,
    eventType: "exchange_requested"
  });

  return { ok: true, exchange: row };
}

export async function respondContactExchange({ email, phone, matchId, accept, profileId }) {
  const userKey = normalizeUserKey({ email, phone });
  const row = await getLatestExchangeForMatch(matchId);
  if (!row || row.status !== "pending") {
    return { ok: false, error: "No pending contact exchange request." };
  }
  if (row.recipient_user_key !== userKey) {
    return { ok: false, error: "Only the recipient can respond to this request." };
  }

  const eligibility = await assertContactExchangeEligibility({ email, phone, profileId });
  if (!eligibility.ok) return eligibility;

  const status = accept ? "accepted" : "declined";
  const result = await query(
    `update contact_exchange_requests
     set status = $2,
         responded_at = now(),
         updated_at = now()
     where id = $1
     returning *`,
    [row.id, status]
  );
  const updated = result.rows[0];
  if (!updated) return { ok: false, error: "We couldn't update that request right now." };

  const exchangePatch = {
    status,
    respondedAt: updated.responded_at,
    acceptedAt: accept ? updated.responded_at : undefined
  };

  await upsertThreadMeta(matchId, row.requester_user_key, exchangePatch);
  await upsertThreadMeta(matchId, row.recipient_user_key, exchangePatch);
  await logExchangeEvent({
    matchId,
    userKey,
    profileId,
    eventType: accept ? "exchange_accepted" : "exchange_declined"
  });

  return { ok: true, exchange: updated };
}

export async function completeContactExchange({
  email,
  phone,
  matchId,
  sharedContacts = {},
  profileId
}) {
  const userKey = normalizeUserKey({ email, phone });
  const row = await getLatestExchangeForMatch(matchId);
  if (!row || row.status !== "accepted") {
    return { ok: false, error: "Contact exchange is not enabled for this chat yet." };
  }
  if (![row.requester_user_key, row.recipient_user_key].includes(userKey)) {
    return { ok: false, error: "You are not part of this exchange." };
  }

  const mergedContacts = {
    ...(row.shared_contacts || {}),
    [userKey]: sharedContacts
  };

  const result = await query(
    `update contact_exchange_requests
     set shared_contacts = $2::jsonb,
         status = case when status = 'accepted' then 'completed' else status end,
         completed_at = case when completed_at is null then now() else completed_at end,
         updated_at = now()
     where id = $1
     returning *`,
    [row.id, mergedContacts]
  );
  const updated = result.rows[0];
  if (!updated) return { ok: false, error: "We couldn't save those details right now." };

  const exchangePatch = {
    status: updated.status,
    completedAt: updated.completed_at,
    sharedContacts: mergedContacts
  };

  await upsertThreadMeta(matchId, row.requester_user_key, exchangePatch);
  await upsertThreadMeta(matchId, row.recipient_user_key, exchangePatch);
  await logExchangeEvent({
    matchId,
    userKey,
    profileId,
    eventType: "exchange_completed"
  });

  return { ok: true, exchange: updated };
}

export async function disableContactSharing({ email, phone, matchId, profileId }) {
  const userKey = normalizeUserKey({ email, phone });
  const row = await getLatestExchangeForMatch(matchId);
  if (!row || !["accepted", "completed"].includes(row.status)) {
    return { ok: false, error: "Contact sharing is not enabled for this chat." };
  }
  if (![row.requester_user_key, row.recipient_user_key].includes(userKey)) {
    return { ok: false, error: "You are not part of this exchange." };
  }

  const exchangePatch = {
    status: row.status,
    contactSharingEnabled: false,
    contactSharingDisabledAt: new Date().toISOString(),
    contactSharingDisabledBy: userKey
  };

  await upsertThreadMeta(matchId, row.requester_user_key, exchangePatch);
  await upsertThreadMeta(matchId, row.recipient_user_key, exchangePatch);
  await logExchangeEvent({
    matchId,
    userKey,
    profileId,
    eventType: "contact_sharing_disabled"
  });

  return { ok: true, exchange: { ...row, ...exchangePatch } };
}

export async function cancelContactExchange({ email, phone, matchId, profileId }) {
  const userKey = normalizeUserKey({ email, phone });
  const row = await getLatestExchangeForMatch(matchId);
  if (!row || row.status !== "pending" || row.requester_user_key !== userKey) {
    return { ok: false, error: "No pending request to cancel." };
  }

  const result = await query(
    `update contact_exchange_requests
     set status = 'cancelled', updated_at = now()
     where id = $1
     returning *`,
    [row.id]
  );
  const updated = result.rows[0];
  const exchangePatch = { status: "cancelled" };
  await upsertThreadMeta(matchId, row.requester_user_key, exchangePatch);
  await upsertThreadMeta(matchId, row.recipient_user_key, exchangePatch);
  await logExchangeEvent({
    matchId,
    userKey,
    profileId,
    eventType: "exchange_declined"
  });
  return { ok: true, exchange: updated };
}

export async function listContactExchangeMetrics({ limit = 100 } = {}) {
  if (!isDatabaseReady()) return { totals: {}, windows: {}, recent: [], audit: [] };
  await ensureContactExchangeSchema();
  await expireStalePendingRequests();

  const totalsResult = await query(
    `select event_type, count(*)::int as count
     from contact_exchange_events
     group by event_type`
  );
  const totals = Object.fromEntries(totalsResult.rows.map((row) => [row.event_type, row.count]));

  const windows = {};
  for (const days of [7, 30]) {
    const windowResult = await query(
      `select event_type, count(*)::int as count
       from contact_exchange_events
       where created_at >= now() - ($1 || ' days')::interval
       group by event_type`,
      [days]
    );
    windows[`last${days}d`] = Object.fromEntries(windowResult.rows.map((row) => [row.event_type, row.count]));
  }

  const statusTotals = await query(
    `select status, count(*)::int as count
     from contact_exchange_requests
     group by status`
  );
  for (const row of statusTotals.rows) {
    totals[`status_${row.status}`] = row.count;
  }

  const recent = await query(
    `select e.event_type, e.match_id, e.user_key, e.field, e.text_hash, e.created_at,
            p.name, p.username
     from contact_exchange_events e
     left join app_member_profiles p on p.user_key = e.user_key
     order by e.created_at desc
     limit $1`,
    [Math.min(200, Math.max(1, limit))]
  );

  const audit = await query(
    `select r.id, r.match_id, r.status, r.requested_at as created_at,
            r.responded_at as resolved_at, r.completed_at,
            req.name as requester_name, req.username as requester_username,
            rec.name as recipient_name, rec.username as recipient_username,
            r.requester_profile_id, r.recipient_profile_id
     from contact_exchange_requests r
     left join app_member_profiles req on req.id = r.requester_profile_id
     left join app_member_profiles rec on rec.id = r.recipient_profile_id
     order by r.updated_at desc
     limit $1`,
    [Math.min(200, Math.max(1, limit))]
  );

  return {
    totals,
    windows,
    recent: recent.rows,
    audit: audit.rows
  };
}

export function exchangeAllowsContactSharing(contactExchange) {
  if (!contactExchange) return false;
  if (contactExchange.contactSharingEnabled === false) return false;
  const status = typeof contactExchange === "string" ? contactExchange : contactExchange.status;
  return status === "accepted" || status === "completed";
}
