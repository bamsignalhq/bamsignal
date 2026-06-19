import { findAppUserIdentity } from "../db.js";
import { findMemberProfileByUserKey } from "../cityHome.js";
import { markMemberOnboardingComplete } from "../memberSocial.js";

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
    state: pickString(member?.state, profileJson.state) || undefined,
    city: pickString(member?.city, profileJson.city) || undefined,
    onboardingComplete: true,
    setupCompleted: true,
    onboardingCompletedAt: status.onboardingCompletedAt || now,
    profileCompletedAt: status.profileCompletedAt || now,
    completedAt: status.completedAt || now
  };
}

export async function repairMemberOnboarding({ email, phone }) {
  const appUser = await findAppUserIdentity({ email, phone });
  const member = await findMemberProfileByUserKey(email, phone);
  const profileJson = member?.profile && typeof member.profile === "object" ? member.profile : {};
  const status = normalizeOnboardingStatus(profileJson, member);
  const diagnostics = buildDiagnostics({ appUser, member, profileJson, status });

  if (status.markedComplete) {
    return {
      ok: true,
      completed: true,
      repaired: false,
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
    const marked = await markMemberOnboardingComplete({ email, phone });
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
