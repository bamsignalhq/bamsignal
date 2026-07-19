import { findAppUserIdentity, isDatabaseReady, query } from "../db.js";
import { findMemberProfileByUserKey } from "../cityHome.js";
import { markMemberOnboardingComplete } from "../memberSocial.js";
import { resolveLoginAccount } from "./loginResolve.js";

function pickString(...values) {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "";
}

function isPlaceholderName(name = "") {
  const value = String(name).trim().toLowerCase();
  return !value || value === "member";
}

function isPlaceholderCity(city = "") {
  const value = String(city).trim().toLowerCase();
  return !value || value === "select city";
}

function isPersistablePhoto(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) return false;
  if (trimmed.startsWith("/showcase/")) return false;
  return true;
}

/** Normalize completion flags across camelCase and snake_case variants. */
export function normalizeOnboardingStatus(profileJson = {}, member = {}) {
  const onboardingComplete = Boolean(
    member.onboarding_complete ||
      profileJson.onboardingComplete ||
      profileJson.onboardingCompleted ||
      profileJson.onboarding_completed
  );
  const setupCompleted = Boolean(profileJson.setupCompleted || profileJson.setup_completed);
  const profileCompletedAt = pickString(profileJson.profileCompletedAt, profileJson.profile_completed_at);
  const onboardingCompletedAt = pickString(
    profileJson.onboardingCompletedAt,
    profileJson.onboarding_completed_at
  );
  const completedAt = pickString(profileJson.completedAt, profileJson.completed_at);
  const markedComplete = Boolean(
    onboardingComplete ||
      setupCompleted ||
      profileCompletedAt ||
      onboardingCompletedAt ||
      completedAt
  );

  return {
    markedComplete,
    onboardingComplete: markedComplete || onboardingComplete,
    setupCompleted: markedComplete || setupCompleted,
    profileCompletedAt: profileCompletedAt || undefined,
    onboardingCompletedAt: onboardingCompletedAt || undefined,
    completedAt: completedAt || undefined
  };
}

export function profileHasMinimumOnboardingData(member, appUser, profileJson = {}) {
  const name = pickString(member?.name, appUser?.name, profileJson.fullName, profileJson.name);
  const age = Number(profileJson.age);
  const gender = pickString(profileJson.gender);
  const state = pickString(member?.state, profileJson.state);
  const city = pickString(member?.city, profileJson.city);
  const photos = (Array.isArray(profileJson.photos) ? profileJson.photos : []).filter(isPersistablePhoto);
  const mainPhotoUrl = pickString(profileJson.mainPhotoUrl);
  const hasPhotos = photos.length >= 2 || Boolean(mainPhotoUrl && isPersistablePhoto(mainPhotoUrl));
  const hasGender = Boolean(gender && gender !== "Prefer not to say");
  const hasRealName = Boolean(name) && !isPlaceholderName(name);
  const hasRealCity = Boolean(city) && !isPlaceholderCity(city);

  return Boolean(
    hasRealName &&
      Number.isFinite(age) &&
      age >= 17 &&
      hasGender &&
      state &&
      hasRealCity &&
      hasPhotos
  );
}

function buildDiagnostics({ appUser, member, profileJson, status }) {
  const photos = Array.isArray(profileJson.photos) ? profileJson.photos : [];
  return {
    userId: appUser?.id || member?.id || null,
    email: pickString(member?.email, appUser?.email),
    memberProfileExists: Boolean(member?.id),
    appUserExists: Boolean(appUser?.id),
    profileName: pickString(member?.name, appUser?.name, profileJson.fullName, profileJson.name),
    profileAge: profileJson.age ?? null,
    profileGender: profileJson.gender ?? null,
    profileState: pickString(member?.state, profileJson.state) || null,
    profileCity: pickString(member?.city, profileJson.city) || null,
    photosCount: photos.filter(isPersistablePhoto).length,
    mainPhotoUrl: pickString(profileJson.mainPhotoUrl) || null,
    onboardingCompleted: status.onboardingComplete,
    setupCompleted: status.setupCompleted,
    profileCompletedAt: status.profileCompletedAt ?? null,
    onboardingCompletedAt: status.onboardingCompletedAt ?? null,
    completedAt: status.completedAt ?? null,
    hasMinimumData: profileHasMinimumOnboardingData(member, appUser, profileJson)
  };
}

function buildDatingProfilePatch(member, profileJson, status) {
  const now = new Date().toISOString();
  return {
    ...profileJson,
    onboardingCompleted: true,
    state: pickString(member?.state, profileJson.state) || undefined,
    city: pickString(member?.city, profileJson.city) || undefined,
    onboardingComplete: true,
    setupCompleted: true,
    onboardingCompletedAt: status.onboardingCompletedAt || now,
    profileCompletedAt: status.profileCompletedAt || now,
    completedAt: status.completedAt || now
  };
}

function profileMissingCompletionPatch(profileJson = {}, member = {}) {
  return Boolean(
    !member?.onboarding_complete ||
      !profileJson.onboardingCompleted ||
      !profileJson.onboardingComplete ||
      !profileJson.setupCompleted ||
      !pickString(profileJson.profileCompletedAt, profileJson.profile_completed_at) ||
      !pickString(profileJson.onboardingCompletedAt, profileJson.onboarding_completed_at)
  );
}

async function persistCompletionPatch({ member, profileJson, status, email, phone }) {
  if (!member?.id || !isDatabaseReady()) return false;
  const patch = buildDatingProfilePatch(member, profileJson, status);
  await query(
    `update app_member_profiles
     set onboarding_complete = true,
         profile = $2::jsonb,
         updated_at = now()
     where id = $1`,
    [member.id, patch]
  );
  await query(
    `update app_users
     set onboarding_completed_at = coalesce(onboarding_completed_at, now()), updated_at = now()
     where ($1::text is not null and lower(email) = lower($1::text))
        or ($2::text is not null and phone = $2::text)`,
    [email || null, phone || null]
  );
  return true;
}

function inferIncompleteReason(member, appUser, profileJson, status) {
  if (status.markedComplete) return "complete";
  if (!member?.id) return "incomplete_no_member";
  const name = pickString(member?.name, appUser?.name, profileJson.fullName, profileJson.name);
  if (!name || isPlaceholderName(name)) return "incomplete_missing_name";
  const age = Number(profileJson.age);
  if (!Number.isFinite(age) || age < 17) return "incomplete_missing_age";
  const gender = pickString(profileJson.gender);
  if (!gender || gender === "Prefer not to say") return "incomplete_missing_gender";
  const state = pickString(member?.state, profileJson.state);
  if (!state) return "incomplete_missing_state";
  const city = pickString(member?.city, profileJson.city);
  if (!city || isPlaceholderCity(city)) return "incomplete_missing_city";
  const photos = (Array.isArray(profileJson.photos) ? profileJson.photos : []).filter(isPersistablePhoto);
  const mainPhotoUrl = pickString(profileJson.mainPhotoUrl);
  const hasPhotos = photos.length >= 2 || Boolean(mainPhotoUrl && isPersistablePhoto(mainPhotoUrl));
  if (!hasPhotos) return "incomplete_missing_photos";
  return "incomplete";
}

async function resolveMemberForOnboarding({ email, phone, username }) {
  let resolvedEmail = pickString(email);
  let resolvedPhone = pickString(phone);
  let member = await findMemberProfileByUserKey(resolvedEmail, resolvedPhone);

  if (!member?.id && username) {
    const account = await resolveLoginAccount(username);
    if (account.member) member = account.member;
    if (account.email) resolvedEmail = account.email;
    if (!member?.id && resolvedEmail) {
      member = await findMemberProfileByUserKey(resolvedEmail, resolvedPhone || account.member?.phone);
    }
  }

  const appUser = await findAppUserIdentity({ email: resolvedEmail, phone: resolvedPhone });
  return { member, appUser, resolvedEmail, resolvedPhone };
}

function looksLikeUuid(value = "") {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "").trim()
  );
}

export async function resolveIdentityFromUserId(userId, identity = {}) {
  const rawUserId = String(userId || "").trim();
  let resolvedEmail = pickString(identity.email);
  let resolvedPhone = pickString(identity.phone);
  let resolvedUsername = pickString(identity.username);
  let member = null;
  let appUser = null;

  if (!isDatabaseReady()) {
    return { member, appUser, resolvedEmail, resolvedPhone, resolvedUsername };
  }

  if (!resolvedEmail && rawUserId.includes("@")) {
    resolvedEmail = rawUserId.toLowerCase();
  }

  if (looksLikeUuid(rawUserId)) {
    const memberResult = await query(
      "select * from app_member_profiles where id = $1::uuid limit 1",
      [rawUserId]
    );
    member = memberResult.rows[0] || null;
    if (member) {
      resolvedEmail = pickString(resolvedEmail, member.email);
      resolvedPhone = pickString(resolvedPhone, member.phone);
      resolvedUsername = pickString(resolvedUsername, member.username, member.profile?.username);
    }

    const appUserResult = await query("select * from app_users where id = $1::uuid limit 1", [
      rawUserId
    ]);
    appUser = appUserResult.rows[0] || appUser;
    if (appUser) {
      resolvedEmail = pickString(resolvedEmail, appUser.email);
      resolvedPhone = pickString(resolvedPhone, appUser.phone);
    }

    const authResult = await query(
      "select id, email, raw_user_meta_data from auth.users where id = $1::uuid limit 1",
      [rawUserId]
    );
    const authUser = authResult.rows[0] || null;
    if (authUser) {
      const meta = authUser.raw_user_meta_data && typeof authUser.raw_user_meta_data === "object"
        ? authUser.raw_user_meta_data
        : {};
      resolvedEmail = pickString(resolvedEmail, authUser.email, meta.email).toLowerCase();
      resolvedPhone = pickString(resolvedPhone, meta.phone);
      resolvedUsername = pickString(resolvedUsername, meta.username);
    }
  }

  if (!member?.id && (resolvedEmail || resolvedPhone)) {
    member = await findMemberProfileByUserKey(resolvedEmail, resolvedPhone);
  }

  if (!member?.id && resolvedUsername) {
    const account = await resolveLoginAccount(resolvedUsername);
    if (account.member) member = account.member;
    if (account.email) resolvedEmail = account.email;
    if (!resolvedPhone && account.member?.phone) resolvedPhone = account.member.phone;
  }

  if (!appUser && (resolvedEmail || resolvedPhone)) {
    appUser = await findAppUserIdentity({ email: resolvedEmail, phone: resolvedPhone });
  }

  return { member, appUser, resolvedEmail, resolvedPhone, resolvedUsername };
}

export async function repairOnboardingStatus(userId, identity = {}) {
  const { member, resolvedEmail, resolvedPhone, resolvedUsername } = await resolveIdentityFromUserId(
    userId,
    identity
  );
  const email = pickString(resolvedEmail, member?.email);
  const phone = pickString(resolvedPhone, member?.phone);
  return repairMemberOnboarding({
    email,
    phone,
    username: pickString(resolvedUsername, member?.username, member?.profile?.username)
  });
}

export async function getMemberOnboardingStatus({ email, phone, username }) {
  const { member, appUser, resolvedEmail, resolvedPhone } = await resolveMemberForOnboarding({
    email,
    phone,
    username
  });
  const result = await repairMemberOnboarding({
    email: resolvedEmail,
    phone: resolvedPhone,
    username
  });
  const profileJson = member?.profile && typeof member.profile === "object" ? member.profile : {};
  const status = normalizeOnboardingStatus(profileJson, member || {});
  const reason = result.completed
    ? result.repaired
      ? "repaired_complete"
      : "complete"
    : inferIncompleteReason(member, appUser, profileJson, status);

  return {
    ok: true,
    /** Canonical completion flag — computed from database member + profile fields only. */
    completed: result.completed,
    onboardingCompleted: result.completed,
    nextRoute: result.nextRoute,
    reason,
    repaired: result.repaired,
    diagnostics: result.diagnostics,
    datingProfile: result.datingProfile
  };
}

export async function forceCompleteMemberOnboarding({ email, phone, username }) {
  const { member, appUser, resolvedEmail, resolvedPhone } = await resolveMemberForOnboarding({
    email,
    phone,
    username
  });

  if (!member?.id) {
    return { ok: false, error: "Member profile not found." };
  }

  const profileJson = member.profile && typeof member.profile === "object" ? { ...member.profile } : {};
  const status = normalizeOnboardingStatus(profileJson, member);

  if (status.markedComplete || profileHasMinimumOnboardingData(member, appUser, profileJson)) {
    const repair = await repairMemberOnboarding({ email: resolvedEmail, phone: resolvedPhone, username });
    if (repair.completed) {
      return {
        ok: true,
        completed: true,
        nextRoute: "/home",
        reason: "complete",
        datingProfile: repair.datingProfile
      };
    }
  }

  const now = new Date().toISOString();
  profileJson.onboardingCompleted = true;
  profileJson.onboardingComplete = true;
  profileJson.setupCompleted = true;
  profileJson.onboardingCompletedAt = profileJson.onboardingCompletedAt || now;
  profileJson.profileCompletedAt = profileJson.profileCompletedAt || now;
  profileJson.completedAt = profileJson.completedAt || now;

  const { query, isDatabaseReady } = await import("../db.js");
  if (!isDatabaseReady()) {
    return { ok: false, error: "Database unavailable." };
  }

  await query(
    `update app_member_profiles
     set onboarding_complete = true,
         profile = $2::jsonb,
         updated_at = now()
     where id = $1`,
    [member.id, profileJson]
  );

  await query(
    `update app_users
     set onboarding_completed_at = coalesce(onboarding_completed_at, now()), updated_at = now()
     where ($1::text is not null and lower(email) = lower($1::text))
        or ($2::text is not null and phone = $2::text)`,
    [resolvedEmail || null, resolvedPhone || null]
  );

  const datingProfile = buildDatingProfilePatch(member, profileJson, {
    ...status,
    onboardingComplete: true,
    setupCompleted: true,
    profileCompletedAt: profileJson.profileCompletedAt,
    onboardingCompletedAt: profileJson.onboardingCompletedAt,
    completedAt: profileJson.completedAt
  });

  return {
    ok: true,
    completed: true,
    nextRoute: "/home",
    reason: "force_complete",
    datingProfile
  };
}

export async function repairMemberOnboarding({ email, phone, username }) {
  let resolvedEmail = pickString(email);
  let resolvedPhone = pickString(phone);
  let member = await findMemberProfileByUserKey(resolvedEmail, resolvedPhone);

  if (!member?.id && username) {
    const account = await resolveLoginAccount(username);
    if (account.member) member = account.member;
    if (account.email) resolvedEmail = account.email;
    if (!member?.id && resolvedEmail) {
      member = await findMemberProfileByUserKey(resolvedEmail, resolvedPhone || account.member?.phone);
    }
  }

  const appUser = await findAppUserIdentity({ email: resolvedEmail, phone: resolvedPhone });
  const profileJson = member?.profile && typeof member.profile === "object" ? member.profile : {};
  const status = normalizeOnboardingStatus(profileJson, member);
  const diagnostics = buildDiagnostics({ appUser, member, profileJson, status });

  if (status.markedComplete) {
    const persisted = profileMissingCompletionPatch(profileJson, member)
      ? await persistCompletionPatch({
          member,
          profileJson,
          status,
          email: resolvedEmail,
          phone: resolvedPhone
        })
      : false;
    return {
      ok: true,
      completed: true,
      repaired: persisted,
      nextRoute: "/home",
      diagnostics,
      datingProfile: buildDatingProfilePatch(member, profileJson, status)
    };
  }

  if (!member?.id) {
    return {
      ok: true,
      completed: false,
      repaired: false,
      nextRoute: "/onboarding",
      diagnostics
    };
  }

  if (profileHasMinimumOnboardingData(member, appUser, profileJson)) {
    const marked = await markMemberOnboardingComplete({
      email: resolvedEmail,
      phone: resolvedPhone || member.phone
    });
    const nextStatus = marked?.ok
      ? normalizeOnboardingStatus(buildDatingProfilePatch(member, profileJson, status), {
          ...member,
          onboarding_complete: true
        })
      : status;
    return {
      ok: true,
      completed: true,
      repaired: Boolean(marked?.ok),
      nextRoute: "/home",
      diagnostics: {
        ...diagnostics,
        onboardingCompleted: true,
        setupCompleted: true,
        hasMinimumData: true
      },
      datingProfile: buildDatingProfilePatch(member, profileJson, nextStatus)
    };
  }

  return {
    ok: true,
    completed: false,
    repaired: false,
    nextRoute: "/onboarding",
    diagnostics
  };
}

export async function repairMemberOnboardingByProfileId(profileId) {
  const { query, isDatabaseReady } = await import("../db.js");
  if (!isDatabaseReady()) {
    return { ok: false, error: "Database unavailable." };
  }
  const result = await query("select email, phone from app_member_profiles where id = $1 limit 1", [
    profileId
  ]);
  const row = result.rows[0];
  if (!row) {
    return { ok: false, error: "Member not found." };
  }
  return repairMemberOnboarding({ email: row.email, phone: row.phone });
}
