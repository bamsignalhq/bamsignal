import { isDatabaseReady, normalizeUserKey, query } from "../databaseConnection.js";
import { findMemberProfileByUserKey } from "../cityHome.js";
import { findAppUserIdentity } from "./appUserQueries.js";
import { assertSchemaTable } from "./schemaVerification.js";
import { assertTextSafeForContactLeak } from "./contactLeak.js";
import { exchangeAllowsContactSharing } from "./contactExchange.js";
import { analyzeOutgoingMessage } from "./spamDetection.js";
import { ensureModerationSchema, maybeAutoShadowBanProfile } from "./moderation.js";
import { writeAuditLog } from "./auditLog.js";
import { fetchMemberSocialBundle } from "../memberSocial.js";

function memberIdentity({ email, phone }) {
  const userKey = normalizeUserKey({ email, phone });
  const normalizedPhone = String(phone || "")
    .replace(/\D/g, "")
    .replace(/^234/, "");
  return {
    userKey,
    email: String(email || "")
      .trim()
      .toLowerCase(),
    phone: normalizedPhone || null
  };
}

async function ensureAppMessagesTable() {
  return assertSchemaTable("app_messages");
}

async function ensureAppChatThreadsTable() {
  return assertSchemaTable("app_chat_threads");
}

async function ensureAppReportsTable() {
  return assertSchemaTable("app_reports");
}

export async function persistMessage({ email, phone, threadId, message, threadMeta = {} }) {
  if (!isDatabaseReady() || !threadId || !message?.id) return null;
  const identity = memberIdentity({ email, phone });
  if (!identity.userKey) return null;

  const matchResult = await query(
    `select id from app_matches where id = $1 and user_key = $2 limit 1`,
    [threadId, identity.userKey]
  );
  const hasMatch = Boolean(matchResult.rows[0]);
  const threadRow = await query(
    `select meta from app_chat_threads where match_id = $1 and user_key = $2 limit 1`,
    [threadId, identity.userKey]
  );
  const storedMeta =
    threadRow.rows[0]?.meta && typeof threadRow.rows[0].meta === "object" ? threadRow.rows[0].meta : {};
  const contactExchange = storedMeta.contactExchange || threadMeta?.contactExchange || null;
  const allowContactExchange = hasMatch && exchangeAllowsContactSharing(contactExchange);
  const messageCheck = await assertTextSafeForContactLeak({
    email,
    phone,
    text: message.text,
    field: "message",
    allowContactExchange
  });
  if (!messageCheck.ok) {
    const error = new Error(messageCheck.error);
    error.code = "CONTACT_LEAK_BLOCKED";
    throw error;
  }

  const member = await query(`select id, shadow_banned from app_member_profiles where user_key = $1 limit 1`, [
    identity.userKey
  ]);
  const senderShadowBanned = Boolean(member.rows[0]?.shadow_banned);

  if (!senderShadowBanned) {
    await analyzeOutgoingMessage({
      email,
      phone,
      text: message.text,
      recipientProfileId: threadMeta?.recipientProfileId || null,
      profileId: member.rows[0]?.id
    });
  }

  const peerLookup = await query(
    `select user_key, owner_email, owner_phone, profile_id
     from app_matches
     where id = $1 and user_key <> $2
     limit 1`,
    [threadId, identity.userKey]
  );
  const peer = peerLookup.rows[0] || null;
  if (peer?.user_key) {
    const { isEitherSideBlocked } = await import("./memberBlocks.js");
    const blocked = await isEitherSideBlocked({
      userKeyA: identity.userKey,
      userKeyB: peer.user_key,
      profileIdA: member.rows[0]?.id || null,
      profileIdB: peer.profile_id || null
    });
    if (blocked) {
      const error = new Error("You can't message this person.");
      error.code = "MEMBER_BLOCKED";
      throw error;
    }
  }

  await ensureAppMessagesTable();
  await ensureAppChatThreadsTable();

  const messageResult = await query(
    `insert into app_messages (id, thread_id, user_key, owner_email, owner_phone, from_side, body, payload, created_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     on conflict (id, user_key) do nothing
     returning *`,
    [
      message.id,
      threadId,
      identity.userKey,
      identity.email || null,
      identity.phone,
      message.from,
      message.text,
      message,
      message.at || new Date().toISOString()
    ]
  );

  await query(
    `insert into app_chat_threads (match_id, user_key, owner_email, owner_phone, meta, updated_at)
     values ($1, $2, $3, $4, $5, now())
     on conflict (match_id, user_key)
     do update set meta = excluded.meta, updated_at = now()`,
    [threadId, identity.userKey, identity.email || null, identity.phone, threadMeta]
  );

  const row = messageResult.rows[0] || null;
  if (!row) return null;
  if (senderShadowBanned) {
    return { ...row, payload: { ...(row.payload || message), suppressed: true }, suppressed: true };
  }

  // Fan-out to match partner so both sides share the same thread id.
  try {
    if (peer?.user_key) {
      const peerFrom = message.from === "me" ? "them" : "me";
      const peerPayload = { ...message, from: peerFrom };
      await query(
        `insert into app_messages (id, thread_id, user_key, owner_email, owner_phone, from_side, body, payload, created_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         on conflict (id, user_key) do nothing`,
        [
          message.id,
          threadId,
          peer.user_key,
          peer.owner_email || null,
          peer.owner_phone || null,
          peerFrom,
          message.text,
          peerPayload,
          message.at || new Date().toISOString()
        ]
      );
      await query(
        `insert into app_chat_threads (match_id, user_key, owner_email, owner_phone, meta, updated_at)
         values ($1, $2, $3, $4, $5, now())
         on conflict (match_id, user_key)
         do update set updated_at = now()`,
        [
          threadId,
          peer.user_key,
          peer.owner_email || null,
          peer.owner_phone || null,
          {}
        ]
      );
    }
  } catch (error) {
    console.error("[bamsignal] message fan-out failed:", error?.message || error);
  }

  return row;
}

export async function persistReport({ email, phone, report }) {
  if (!isDatabaseReady() || !report?.profileId || !report?.reason) return null;
  const identity = memberIdentity({ email, phone });
  if (!identity.userKey) return null;

  if (report.details) {
    const detailsCheck = await assertTextSafeForContactLeak({
      email,
      phone,
      text: report.details,
      field: "report_note"
    });
    if (!detailsCheck.ok) {
      const error = new Error(detailsCheck.error);
      error.code = "CONTACT_LEAK_BLOCKED";
      throw error;
    }
  }

  await ensureAppReportsTable();
  await ensureModerationSchema();

  const result = await query(
    `insert into app_reports (user_key, reporter_email, reporter_phone, profile_id, reason, details, payload, created_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     returning *`,
    [
      identity.userKey,
      identity.email || null,
      identity.phone,
      report.profileId,
      report.reason,
      report.details || null,
      report,
      report.at || new Date().toISOString()
    ]
  );
  const row = result.rows[0] || null;
  if (row?.profile_id) {
    void maybeAutoShadowBanProfile(row.profile_id).catch((error) => {
      console.error("[bamsignal] auto shadow ban failed:", error);
    });
  }
  if (row) {
    const reporter = await findMemberProfileByUserKey(email, phone);
    await writeAuditLog({
      userId: reporter?.id || null,
      targetUserId: report.profileId,
      action: report.blocked ? "block_and_report_submitted" : "report_submitted",
      details: {
        reason: report.reason,
        hasDetails: Boolean(report.details)
      }
    });
  }
  return row;
}

export async function fetchMemberBundle({ email, phone }) {
  if (!isDatabaseReady()) return null;
  const identity = memberIdentity({ email, phone });
  if (!identity.userKey) return null;

  const [matches, messages, threadMetaRows, reports, signals, user, social] = await Promise.all([
    query(
      `select payload, matched_at
       from app_matches
       where user_key = $1
       order by matched_at desc`,
      [identity.userKey]
    ),
    query(
      `select thread_id, payload, created_at
       from app_messages
       where user_key = $1
       order by created_at asc`,
      [identity.userKey]
    ),
    query(
      `select match_id, meta
       from app_chat_threads
       where user_key = $1`,
      [identity.userKey]
    ),
    query(
      `select payload, created_at
       from app_reports
       where user_key = $1
       order by created_at desc`,
      [identity.userKey]
    ),
    query(
      `select count(*)::int as count
       from app_signals
       where user_key = $1`,
      [identity.userKey]
    ),
    findAppUserIdentity({ email: identity.email, phone: identity.phone }),
    fetchMemberSocialBundle({ email, phone })
  ]);

  const threadMetaById = Object.fromEntries(
    threadMetaRows.rows.map((row) => [row.match_id, row.meta && typeof row.meta === "object" ? row.meta : {}])
  );

  const threads = {};
  for (const row of messages.rows) {
    const threadId = row.thread_id;
    const payload = row.payload || {};
    if (!threads[threadId]) {
      const meta = threadMetaById[threadId] || {};
      threads[threadId] = {
        matchId: threadId,
        messages: [],
        ...(meta.contactExchange ? { contactExchange: meta.contactExchange } : {}),
        ...(meta.offPlatformApproved ? { offPlatformApproved: meta.offPlatformApproved } : {}),
        ...(meta.pendingOffPlatformRequest
          ? { pendingOffPlatformRequest: meta.pendingOffPlatformRequest }
          : {}),
        ...(meta.offPlatformDeclined ? { offPlatformDeclined: meta.offPlatformDeclined } : {})
      };
    }
    threads[threadId].messages.push(payload);
  }

  for (const [threadId, meta] of Object.entries(threadMetaById)) {
    if (!threads[threadId]) {
      threads[threadId] = {
        matchId: threadId,
        messages: [],
        ...(meta.contactExchange ? { contactExchange: meta.contactExchange } : {})
      };
    }
  }

  return {
    user,
    matches: matches.rows.map((row) => row.payload),
    chats: threads,
    reports: reports.rows.map((row) => row.payload),
    signalsSent: signals.rows[0]?.count ?? 0,
    incomingSignals: social?.incomingSignals ?? [],
    referral: social?.referral ?? null,
    premium: social?.premium ?? null,
    memberProfileId: social?.memberProfileId ?? null,
    datingProfile: social?.datingProfile ?? null,
    incomingLikes: social?.incomingLikes ?? [],
    incomingFollows: social?.incomingFollows ?? [],
    savedProfileIds: social?.savedProfileIds ?? [],
    activeBoosts: social?.activeBoosts ?? [],
    shadowBanned: Boolean(social?.shadowBanned)
  };
}
