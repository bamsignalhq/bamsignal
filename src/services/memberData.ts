import { STORAGE_KEYS } from "../constants/limits";
import type { ChatMessage, ChatThread, LikeEntry, Match, ReportRecord, UserProfile, DatingProfile } from "../types";
import { readJson, writeJson, recordApiError } from "../utils/storage";
import { liftShadowBan, memberShadowKey, shadowBanId } from "../utils/shadowBan";
import { cacheDiscoverProfiles } from "./discoverProfiles";
import { setPremiumSnapshot } from "./premiumStatus";
import { resolveSignalPassSnapshot } from "../utils/memberEntitlements";
import { apiUrl } from "./supabase";
import { mergeHydratedCompliance, syncComplianceDoneMarkerFromProfile } from "./compliance";
import { normalizeDatingProfile } from "../utils/profile";
import { resolveMemberIdentity } from "../utils/authIdentity";
import { mergeIncomingSocial } from "../utils/profileSocial";
import { memberApiHeaders } from "../utils/memberApiAuth";
import { readResponseJson } from "../utils/httpJson";
import { mergeMemberCover, safeArray, safePhotos, safeString, isPersistablePhotoUrl } from "../utils/safeProfile";
import {
  clearOnboardingDrafts,
  logRouteDecision,
  mergeOnboardingCompleteFlag,
  normalizeOnboardingStatus,
  shouldRouteToOnboarding
} from "../utils/onboardingStatus";
import {
  applyOnboardingRepairLocal,
  fetchOnboardingStatus,
  logLoginProfileState,
  type OnboardingStatusResult
} from "./onboardingRepair";

type MemberIdentity = Pick<UserProfile, "email" | "phone" | "name" | "username">;

type MemberBundle = {
  matches?: Match[];
  reports?: ReportRecord[];
  chats?: Record<string, ChatThread>;
  signalsSent?: number;
  incomingSignals?: LikeEntry[];
  referral?: { code?: string; successfulReferrals?: number; rewardsClaimed?: number };
  premium?: { isPremium: boolean; premiumUntil: string | null };
  user?: { premium_until?: string | null; is_premium?: boolean };
  memberProfileId?: string;
  shadowBanned?: boolean;
  datingProfile?: Record<string, unknown>;
  incomingLikes?: Parameters<typeof mergeIncomingSocial>[0]["incomingLikes"];
  incomingFollows?: Parameters<typeof mergeIncomingSocial>[0]["incomingFollows"];
};

type MemberActionPayload = {
  ok?: boolean;
  error?: string;
  cooldown?: boolean;
  bundle?: MemberBundle;
  signal?: unknown;
  match?: Match;
  referral?: MemberBundle["referral"];
  result?: { rewardGranted?: boolean };
  premium?: { isPremium: boolean; premiumUntil: string | null };
  incomingSignals?: LikeEntry[];
  viewers?: import("../utils/profileViews").ProfileViewer[];
};

async function postMemberAction(
  action: string,
  identity: MemberIdentity,
  body: Record<string, unknown> = {}
): Promise<MemberActionPayload | null> {
  try {
    const response = await fetch(apiUrl(`/api/member/data?action=${action}`), {
      method: "POST",
      headers: await memberApiHeaders(),
      body: JSON.stringify({
        email: identity.email,
        phone: identity.phone,
        name: identity.name,
        username: identity.username,
        ...body
      })
    });
    const payload = await readResponseJson<MemberActionPayload>(response);
    if (!response.ok || !payload?.ok) {
      recordApiError(action, payload?.error || `HTTP ${response.status}`);
      return null;
    }
    return payload;
  } catch (error) {
    recordApiError(action, error instanceof Error ? error.message : "network");
    return null;
  }
}

export async function registerMember(
  user: MemberIdentity,
  referralCode?: string | null
): Promise<boolean> {
  const payload = await postMemberAction("register", user, referralCode ? { referralCode } : {});
  return Boolean(payload?.ok);
}

export type MemberSessionBootstrapResult = {
  hydrated: boolean;
  status: OnboardingStatusResult | null;
  nextRoute: "home" | "onboarding";
};

/** Hydrate remote profile, run server onboarding-status, and return authoritative next route. */
export async function bootstrapMemberSession(
  user: MemberIdentity,
  options?: { forceOnboarding?: boolean; referralCode?: string | null; loginEmail?: string }
): Promise<MemberSessionBootstrapResult> {
  if (options?.forceOnboarding) {
    return { hydrated: false, status: null, nextRoute: "onboarding" };
  }

  const identity = resolveMemberIdentity(user, { loginEmail: options?.loginEmail });
  const ref = options?.referralCode;
  await registerMember(identity, ref);
  let hydrated = await hydrateMemberData(identity);
  if (!hydrated) {
    await registerMember(identity, ref);
    hydrated = await hydrateMemberData(identity);
  }

  const status = await fetchOnboardingStatus(identity);
  logLoginProfileState(identity, status);

  if (status?.completed || status?.nextRoute === "/home") {
    if (status.datingProfile) {
      applyOnboardingRepairLocal({
        ok: true,
        completed: true,
        repaired: Boolean(status.repaired),
        nextRoute: "/home",
        datingProfile: status.datingProfile
      });
    }
    clearOnboardingDrafts();
    return { hydrated, status, nextRoute: "home" };
  }

  return { hydrated, status, nextRoute: "onboarding" };
}

export async function hydrateMemberData(user: MemberIdentity): Promise<boolean> {
  const payload = await postMemberAction("pull", user);
  const bundle = payload?.bundle;
  if (!bundle) return false;
  logLoginProfileState(
    user,
    null,
    {
      memberProfileId: bundle.memberProfileId ?? null,
      datingProfile:
        bundle.datingProfile && typeof bundle.datingProfile === "object"
          ? (bundle.datingProfile as Record<string, unknown>)
          : null
    }
  );

  if (Array.isArray(bundle.matches)) {
    writeJson(STORAGE_KEYS.matches, bundle.matches as Match[]);
  } else {
    writeJson(STORAGE_KEYS.matches, []);
  }

  if (Array.isArray(bundle.reports)) {
    writeJson(STORAGE_KEYS.reports, bundle.reports as ReportRecord[]);
  }

  if (bundle.chats && typeof bundle.chats === "object") {
    writeJson(STORAGE_KEYS.chats, bundle.chats as Record<string, ChatThread>);
  } else {
    writeJson(STORAGE_KEYS.chats, {});
  }

  if (typeof bundle.signalsSent === "number") {
    writeJson(STORAGE_KEYS.signalsSent, bundle.signalsSent);
  }

  if (Array.isArray(bundle.incomingSignals)) {
    writeJson(STORAGE_KEYS.likedBy, bundle.incomingSignals as LikeEntry[]);
    writeJson(STORAGE_KEYS.signalsReceived, bundle.incomingSignals.length);
  } else {
    writeJson(STORAGE_KEYS.likedBy, []);
    writeJson(STORAGE_KEYS.signalsReceived, 0);
  }

  if (bundle.referral) {
    const prior = readJson<{ invitesSent?: number }>(STORAGE_KEYS.referrals, {});
    writeJson(STORAGE_KEYS.referrals, {
      code: bundle.referral.code,
      invitesSent: prior.invitesSent ?? 0,
      successfulReferrals: bundle.referral.successfulReferrals ?? 0,
      rewardsClaimed: bundle.referral.rewardsClaimed ?? 0
    });
  }

  if (bundle.premium) {
    const resolved = resolveSignalPassSnapshot({
      premiumUntil: bundle.premium.premiumUntil,
      isPremium: bundle.premium.isPremium,
      includeTrial: false
    });
    setPremiumSnapshot({ isPremium: resolved.active, premiumUntil: resolved.expiresAt });
  } else if (bundle.user) {
    const resolved = resolveSignalPassSnapshot({
      premiumUntil: bundle.user.premium_until as string | null,
      isPremium: Boolean(bundle.user.is_premium),
      includeTrial: false
    });
    setPremiumSnapshot({ isPremium: resolved.active, premiumUntil: resolved.expiresAt });
  }

  if (bundle.memberProfileId) {
    localStorage.setItem(STORAGE_KEYS.memberProfileId, String(bundle.memberProfileId));
    const profileId = String(bundle.memberProfileId);
    const memberKey = memberShadowKey(user.phone, user.email);
    if (bundle.shadowBanned) {
      shadowBanId(profileId);
      shadowBanId(memberKey);
    } else {
      liftShadowBan(profileId);
      liftShadowBan(memberKey);
    }
  }

  if (bundle.datingProfile && typeof bundle.datingProfile === "object") {
    const local = normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, {}));
    const remote = { ...(bundle.datingProfile as Record<string, unknown>) };
    const remoteCoverUrl =
      typeof remote.coverPhotoUrl === "string"
        ? remote.coverPhotoUrl
        : typeof remote.coverPhoto === "string"
          ? remote.coverPhoto
          : undefined;
    if (remoteCoverUrl?.startsWith("/showcase/")) {
      remote.coverPhotoUrl = undefined;
      remote.coverPhoto = undefined;
      remote.coverPhotoExplicit = false;
      remote.coverPhotoPath = undefined;
    } else if (typeof remote.coverPhoto === "string" && remote.coverPhoto.startsWith("/showcase/")) {
      remote.coverPhoto = undefined;
      remote.coverPhotoExplicit = false;
    }
    const remotePhotos = safePhotos(remote.photos);
    const localPhotos = safePhotos(local.photos);
    const remotePersistable = remotePhotos.filter(isPersistablePhotoUrl);
    const localPersistable = localPhotos.filter(isPersistablePhotoUrl);
    const remoteComplete = mergeOnboardingCompleteFlag(local, remote as Partial<import("../types").DatingProfile>);
    const remoteStatus = normalizeOnboardingStatus(remote as Record<string, unknown>);
    if (remoteComplete) {
      clearOnboardingDrafts();
    }
    const mergedPhotos =
      remoteComplete || remotePersistable.length >= localPersistable.length
        ? remotePhotos.length
          ? remotePhotos
          : localPhotos
        : localPhotos.length >= remotePhotos.length
          ? localPhotos
          : remotePhotos;
    const mergedCover = mergeMemberCover(local, remote);
    const { coverPhoto, coverPhotoExplicit } = mergedCover;
    const onboardingIncomplete = !remoteComplete;
    const interestsTouched = Boolean(
      onboardingIncomplete ? local.interestsTouched : local.interestsTouched || remote.interestsTouched
    );
    const localInterests = safeArray<string>(local.interests);
    const remoteInterests = safeArray<string>(remote.interests as string[] | undefined);
    const interests = onboardingIncomplete
      ? interestsTouched
        ? localInterests
        : []
      : remoteInterests.length >= localInterests.length
        ? remoteInterests
        : localInterests;
    const mergedBase = normalizeDatingProfile(
      remoteComplete
        ? {
            ...remote,
            photos: mergedPhotos.length ? mergedPhotos : localPhotos,
            mainPhotoUrl:
              safeString(remote.mainPhotoUrl) ||
              safeString(local.mainPhotoUrl) ||
              undefined,
            coverPhoto,
            coverPhotoUrl: mergedCover.coverPhotoUrl ?? coverPhoto,
            coverPhotoPath: mergedCover.coverPhotoPath,
            coverPhotoUpdatedAt: mergedCover.coverPhotoUpdatedAt,
            coverPhotoExplicit,
            onboardingComplete: true,
            setupCompleted: true,
            onboardingCompletedAt:
              safeString(remote.onboardingCompletedAt) ||
              safeString(remote.onboarding_completed_at) ||
              safeString(local.onboardingCompletedAt) ||
              remoteStatus.onboardingCompletedAt ||
              undefined,
            profileCompletedAt:
              safeString(remote.profileCompletedAt) ||
              safeString(remote.profile_completed_at) ||
              safeString(local.profileCompletedAt) ||
              remoteStatus.profileCompletedAt ||
              undefined,
            completedAt:
              safeString(remote.completedAt) ||
              safeString(remote.completed_at) ||
              safeString(local.completedAt) ||
              remoteStatus.completedAt ||
              undefined,
            interests: remoteInterests.length ? remoteInterests : localInterests,
            interestsTouched: true,
            compliance: mergeHydratedCompliance(local.compliance, remote.compliance)
          }
        : {
            ...local,
            ...remote,
            photos: mergedPhotos.length ? mergedPhotos : localPhotos,
            mainPhotoUrl:
              safeString(remote.mainPhotoUrl) ||
              safeString(local.mainPhotoUrl) ||
              undefined,
            coverPhoto,
            coverPhotoUrl: mergedCover.coverPhotoUrl ?? coverPhoto,
            coverPhotoPath: mergedCover.coverPhotoPath,
            coverPhotoUpdatedAt: mergedCover.coverPhotoUpdatedAt,
            coverPhotoExplicit,
            onboardingComplete: remoteComplete || remoteStatus.onboardingComplete,
            setupCompleted:
              remoteComplete || remoteStatus.setupCompleted || Boolean(local.setupCompleted || remote.setupCompleted),
            onboardingCompletedAt:
              safeString(remote.onboardingCompletedAt) ||
              safeString(remote.onboarding_completed_at) ||
              safeString(local.onboardingCompletedAt) ||
              remoteStatus.onboardingCompletedAt ||
              undefined,
            profileCompletedAt:
              safeString(remote.profileCompletedAt) ||
              safeString(remote.profile_completed_at) ||
              safeString(local.profileCompletedAt) ||
              remoteStatus.profileCompletedAt ||
              undefined,
            completedAt:
              safeString(remote.completedAt) ||
              safeString(remote.completed_at) ||
              safeString(local.completedAt) ||
              remoteStatus.completedAt ||
              undefined,
            interests,
            interestsTouched,
            compliance: mergeHydratedCompliance(local.compliance, remote.compliance)
          }
    );
    const merged = mergedBase;
    if (!shouldRouteToOnboarding(user, merged)) {
      clearOnboardingDrafts();
    }
    writeJson(STORAGE_KEYS.datingProfile, merged);
    syncComplianceDoneMarkerFromProfile(user, merged.compliance);
    logRouteDecision(user, merged, shouldRouteToOnboarding(user, merged) ? "onboarding" : "home", {
      hydrated: true,
      repaired: false,
      remoteComplete
    });
  }

  writeJson(
    STORAGE_KEYS.datingProfile,
    normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, {}))
  );

  if (Array.isArray(bundle.incomingLikes) || Array.isArray(bundle.incomingFollows)) {
    mergeIncomingSocial({
      incomingLikes: bundle.incomingLikes as Parameters<typeof mergeIncomingSocial>[0]["incomingLikes"],
      incomingFollows: bundle.incomingFollows as Parameters<typeof mergeIncomingSocial>[0]["incomingFollows"]
    });
  }

  const matchProfiles = (bundle.matches as Match[] | undefined)?.map((match) => ({
    id: match.profileId,
    name: match.name,
    age: 25,
    city: match.city,
    bio: "",
    photo: match.photo,
    intents: [],
    verified: false,
    lastActiveAt: match.lastActiveAt
  }));
  if (matchProfiles?.length) cacheDiscoverProfiles(matchProfiles);

  return true;
}

export async function likeProfileRemote(
  user: MemberIdentity,
  targetProfileId: string,
  photoIndex = 0
): Promise<boolean> {
  const payload = await postMemberAction("like-profile", user, { targetProfileId, photoIndex });
  return Boolean(payload?.ok);
}

export async function followProfileRemote(
  user: MemberIdentity,
  targetProfileId: string
): Promise<boolean> {
  const payload = await postMemberAction("follow-profile", user, { targetProfileId });
  return Boolean(payload?.ok);
}

export async function sendSignalRemote(
  user: MemberIdentity,
  targetProfileId: string,
  signalType: "signal" | "priority" = "signal"
): Promise<{ ok: boolean; error?: string }> {
  const payload = await postMemberAction("signal", user, { targetProfileId, signalType });
  if (payload?.cooldown) {
    return { ok: false, error: String(payload.error || "Please slow down a little.") };
  }
  if (payload?.ok === false) {
    return { ok: false, error: String(payload.error || "Could not send signal.") };
  }
  return { ok: Boolean(payload?.signal) };
}

export async function acceptSignalRemote(
  user: MemberIdentity,
  signalId: string
): Promise<Match | null> {
  const payload = await postMemberAction("accept-signal", user, { signalId });
  if (!payload?.match) return null;

  const match = payload.match as Match;
  const matches = readJson<Match[]>(STORAGE_KEYS.matches, []);
  if (!matches.some((m) => m.id === match.id)) {
    writeJson(STORAGE_KEYS.matches, [...matches, match]);
  }

  const incoming = readJson<LikeEntry[]>(STORAGE_KEYS.likedBy, []).filter(
    (s) => s.id !== signalId && s.profileId !== match.profileId
  );
  writeJson(STORAGE_KEYS.likedBy, incoming);
  writeJson(STORAGE_KEYS.signalsReceived, incoming.length);

  return match;
}

export async function declineSignalRemote(user: MemberIdentity, signalId: string): Promise<boolean> {
  const payload = await postMemberAction("decline-signal", user, { signalId });
  if (!payload?.ok) return false;

  const incoming = readJson<LikeEntry[]>(STORAGE_KEYS.likedBy, []).filter((s) => s.id !== signalId);
  writeJson(STORAGE_KEYS.likedBy, incoming);
  writeJson(STORAGE_KEYS.signalsReceived, incoming.length);
  return true;
}

export async function ignoreSignalRemote(user: MemberIdentity, signalId: string): Promise<boolean> {
  const payload = await postMemberAction("ignore-signal", user, { signalId });
  if (!payload?.ok) return false;

  const incoming = readJson<LikeEntry[]>(STORAGE_KEYS.likedBy, []).filter((s) => s.id !== signalId);
  writeJson(STORAGE_KEYS.likedBy, incoming);
  writeJson(STORAGE_KEYS.signalsReceived, incoming.length);
  return true;
}

export async function completeOnboardingRemote(user: MemberIdentity): Promise<boolean> {
  const payload = await postMemberAction("complete-onboarding", user);
  if (!payload?.ok) return false;
  if (payload?.referral) {
    writeJson(STORAGE_KEYS.referrals, {
      code: payload.referral.code,
      invitesSent: readJson<{ invitesSent?: number }>(STORAGE_KEYS.referrals, {}).invitesSent ?? 0,
      successfulReferrals: payload.referral.successfulReferrals ?? 0,
      rewardsClaimed: payload.referral.rewardsClaimed ?? 0
    });
  }
  if (payload?.result?.rewardGranted) {
    await postMemberAction("status", user).then((status) => {
      if (status?.premium) setPremiumSnapshot(status.premium);
    });
  }
  return true;
}

export async function fetchIncomingSignalsRemote(user: MemberIdentity): Promise<LikeEntry[]> {
  const payload = await postMemberAction("incoming", user);
  const incoming = (payload?.incomingSignals as LikeEntry[]) || [];
  writeJson(STORAGE_KEYS.likedBy, incoming);
  writeJson(STORAGE_KEYS.signalsReceived, incoming.length);
  return incoming;
}

export async function fetchVisitorsRemote(
  user: MemberIdentity
): Promise<import("../utils/profileViews").ProfileViewer[]> {
  const payload = await postMemberAction("visitors", user);
  return payload?.viewers || [];
}

export function persistMessageRemote(
  user: MemberIdentity,
  threadId: string,
  message: ChatMessage,
  threadMeta: Omit<ChatThread, "messages" | "matchId"> = {}
): void {
  void postMemberAction("message", user, { threadId, message, threadMeta });
}

export function persistReportRemote(user: MemberIdentity, report: ReportRecord): void {
  void postMemberAction("report", user, { report });
}

/** @deprecated use sendSignalRemote */
export function persistSignalRemote(
  user: MemberIdentity,
  targetProfileId: string,
  signalType: "signal" | "priority" = "signal"
): void {
  void sendSignalRemote(user, targetProfileId, signalType);
}

/** @deprecated matches created via accept-signal */
export function persistMatchRemote(user: MemberIdentity, match: Match): void {
  void postMemberAction("match", user, { match });
}
