import { discoverPhotoFromProfile } from "../../shared/mainPhoto.mjs";
import {
  findAppUserIdentity,
  isDatabaseReady,
  normalizeUserKey,
  query
} from "../db.js";
import { ensureMemberProfilesTable } from "../cityHome.js";
import { ensureSocialSchema } from "../memberSocial.js";
import { ensureVerificationSubmissionsTable } from "./verificationQueue.js";
import {
  deleteAllUserPhotoStorage,
  parsePhotoStorageUrl
} from "./photoStorage.js";
import { supabaseServiceHeaders } from "../supabaseEnv.js";

function normalizePhone(value = "") {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("234") && digits.length >= 13) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}

async function resolveMemberTarget({ profileId, email, phone, username, query: searchQuery }) {
  if (!isDatabaseReady()) return null;
  await ensureMemberProfilesTable();

  if (profileId) {
    const byId = await query("select * from app_member_profiles where id = $1 limit 1", [profileId]);
    if (byId.rows[0]) return byId.rows[0];
  }

  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPhone = normalizePhone(phone);
  const normalizedUsername = String(username || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  if (normalizedEmail || normalizedPhone) {
    const userKey = normalizeUserKey({ email: normalizedEmail, phone: normalizedPhone });
    if (userKey) {
      const byKey = await query("select * from app_member_profiles where user_key = $1 limit 1", [
        userKey
      ]);
      if (byKey.rows[0]) return byKey.rows[0];
    }
    const byIdentity = await query(
      `select * from app_member_profiles
       where ($1::text is not null and lower(email) = lower($1::text))
          or ($2::text is not null and phone = $2::text)
       limit 1`,
      [normalizedEmail || null, normalizedPhone || null]
    );
    if (byIdentity.rows[0]) return byIdentity.rows[0];
  }

  if (normalizedUsername) {
    const byUsername = await query(
      "select * from app_member_profiles where lower(username) = lower($1) limit 1",
      [normalizedUsername]
    );
    if (byUsername.rows[0]) return byUsername.rows[0];
  }

  const q = String(searchQuery || normalizedEmail || normalizedUsername || "").trim();
  if (q) {
    const like = `%${q.replace(/[%_]/g, "")}%`;
    const digits = q.replace(/\D/g, "");
    const found = await query(
      `select * from app_member_profiles
       where lower(email) like lower($1)
          or lower(name) like lower($1)
          or lower(username) like lower($1)
          or ($2 <> '' and phone like '%' || $2 || '%')
          or id::text = $3
       order by updated_at desc
       limit 1`,
      [like, digits, q]
    );
    if (found.rows[0]) return found.rows[0];
  }

  return null;
}

export async function adminSearchMembers(searchText, limit = 25) {
  if (!isDatabaseReady()) return [];
  await ensureMemberProfilesTable();

  const q = String(searchText || "").trim();
  if (q.length < 2) return [];

  const like = `%${q.replace(/[%_]/g, "")}%`;
  const digits = q.replace(/\D/g, "");

  const result = await query(
    `select id, user_key, email, phone, name, username, city, state, profile,
            onboarding_complete, created_at, updated_at,
            account_status, account_delete_scheduled_for
     from app_member_profiles
     where lower(email) like lower($1)
        or lower(name) like lower($1)
        or lower(username) like lower($1)
        or lower(city) like lower($1)
        or ($2 <> '' and phone like '%' || $2 || '%')
        or id::text = $3
     order by updated_at desc
     limit $4`,
    [like, digits, q, Math.min(50, Math.max(1, Number(limit) || 25))]
  );

  return result.rows.map((row) => {
    const profile = row.profile || {};
    const photos = Array.isArray(profile.photos) ? profile.photos : [];
    return {
      id: row.id,
      userKey: row.user_key,
      email: row.email,
      phone: row.phone,
      name: row.name || profile.name || "Member",
      username: row.username,
      city: row.city,
      state: row.state,
      onboardingComplete: row.onboarding_complete,
      photo: discoverPhotoFromProfile(profile),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      accountStatus: row.account_status || "active",
      accountDeleteScheduledFor: row.account_delete_scheduled_for || null
    };
  });
}

async function deleteSupabaseAuthUser(email) {
  const headers = supabaseServiceHeaders();
  if (!headers || !email) return { deleted: false, reason: "supabase_not_configured" };

  const { serviceKey, url } = headers;
  const list = await fetch(
    `${url}/auth/v1/admin/users?${new URLSearchParams({ page: "1", per_page: "1", email })}`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  );
  if (!list.ok) {
    return { deleted: false, reason: "auth_lookup_failed" };
  }

  const payload = await list.json();
  const userId = payload?.users?.[0]?.id;
  if (!userId) return { deleted: false, reason: "auth_user_not_found" };

  const del = await fetch(`${url}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
  });

  return { deleted: del.ok, authUserId: userId, reason: del.ok ? "deleted" : "auth_delete_failed" };
}

async function deleteProfilePhotoUrls(profileJson, authUserId) {
  const profile = profileJson || {};
  const urls = new Set();
  if (profile.coverPhoto) urls.add(profile.coverPhoto);
  if (profile.coverPhotoUrl) urls.add(profile.coverPhotoUrl);
  if (Array.isArray(profile.photos)) {
    for (const url of profile.photos) {
      if (url) urls.add(url);
    }
  }
  if (profile.verificationSelfie) urls.add(profile.verificationSelfie);

  let deleted = 0;
  const { deletePhotoStorageObject } = await import("./photoStorage.js");
  for (const url of urls) {
    const parsed = parsePhotoStorageUrl(url);
    if (!parsed) continue;
    try {
      await deletePhotoStorageObject(parsed.bucket, parsed.path);
      deleted += 1;
    } catch {
      /* best effort */
    }
  }

  if (authUserId) {
    const bulk = await deleteAllUserPhotoStorage(authUserId);
    deleted += bulk.deleted || 0;
  }

  return deleted;
}

export async function purgeMemberCompletely(targetInput = {}) {
  if (!isDatabaseReady()) {
    throw new Error("Database is not connected.");
  }

  await ensureMemberProfilesTable();
  await ensureSocialSchema();
  await ensureVerificationSubmissionsTable();

  const member = await resolveMemberTarget(targetInput);
  if (!member) {
    return { ok: false, error: "Member not found." };
  }

  const profileId = member.id;
  const userKey = member.user_key;
  const email = String(member.email || "").trim().toLowerCase();
  const phone = member.phone || null;
  const localPhone = phone ? phone.replace(/^234/, "0") : null;

  const counts = {};

  const runCount = async (label, sql, params) => {
    const result = await query(sql, params);
    counts[label] = result.rowCount || 0;
    return result.rowCount || 0;
  };

  await runCount(
    "signalsAsTarget",
    "delete from app_signals where target_profile_id = $1",
    [String(profileId)]
  );
  await runCount("signalsByUser", "delete from app_signals where user_key = $1", [userKey]);
  if (email) {
    await runCount("signalsByEmail", "delete from app_signals where lower(sender_email) = lower($1)", [
      email
    ]);
  }
  if (phone) {
    await runCount("signalsByPhone", "delete from app_signals where sender_phone = $1", [phone]);
  }

  await runCount("matchesByProfile", "delete from app_matches where profile_id = $1", [String(profileId)]);
  await runCount("matchesByUser", "delete from app_matches where user_key = $1", [userKey]);

  await runCount("messagesByUser", "delete from app_messages where user_key = $1", [userKey]);
  await runCount("threadsByUser", "delete from app_chat_threads where user_key = $1", [userKey]);

  await runCount("reportsByProfile", "delete from app_reports where profile_id = $1", [String(profileId)]);
  await runCount("reportsByUser", "delete from app_reports where user_key = $1", [userKey]);

  await runCount(
    "likes",
    "delete from app_profile_likes where actor_profile_id = $1 or target_profile_id = $1",
    [profileId]
  );
  await runCount(
    "follows",
    "delete from app_profile_follows where actor_profile_id = $1 or target_profile_id = $1",
    [profileId]
  );

  await runCount(
    "referrals",
    "delete from app_referral_events where referrer_user_key = $1 or referred_user_key = $1",
    [userKey]
  );
  await runCount(
    "referrerLinks",
    "update app_users set referred_by_user_key = null where referred_by_user_key = $1",
    [userKey]
  );

  await runCount(
    "spotlightEvents",
    "delete from city_spotlight_events where profile_id = $1 or viewer_key = $2",
    [profileId, userKey]
  );

  await runCount(
    "verifications",
    "delete from verification_submissions where user_key = $1 or lower(email) = lower($2)",
    [userKey, email || ""]
  );

  if (email) {
    await runCount(
      "emailCodes",
      "delete from email_verification_codes where lower(email) = lower($1)",
      [email]
    );
    await runCount(
      "subscriptionEvents",
      "delete from subscription_events where lower(user_email) = lower($1) or user_id = $2",
      [email, userKey]
    );
  }

  if (phone || localPhone) {
    await runCount("whatsappCodes", "delete from whatsapp_verification_codes where phone = $1 or phone = $2", [
      phone,
      localPhone
    ]);
  }

  const appUser = await findAppUserIdentity({ email, phone });
  if (appUser?.id) {
    await runCount("appUsers", "delete from app_users where id = $1", [appUser.id]);
  } else if (userKey) {
    await runCount("appUsers", "delete from app_users where user_key = $1", [userKey]);
  }

  const authResult = email ? await deleteSupabaseAuthUser(email) : { deleted: false };
  const photosDeleted = await deleteProfilePhotoUrls(member.profile, authResult.authUserId);

  await runCount("memberProfile", "delete from app_member_profiles where id = $1", [profileId]);

  return {
    ok: true,
    member: {
      id: profileId,
      email: email || null,
      phone: phone || null,
      username: member.username || null,
      name: member.name || null
    },
    purged: {
      ...counts,
      photosDeleted,
      supabaseAuth: authResult
    }
  };
}
