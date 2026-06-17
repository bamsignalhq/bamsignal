import { STORAGE_KEYS } from "../constants/limits";
import type { ChatMessage, ChatThread, LikeEntry, Match, ReportRecord, UserProfile } from "../types";
import { readJson, writeJson } from "../utils/storage";
import { liftShadowBan, memberShadowKey, shadowBanId } from "../utils/shadowBan";
import { cacheDiscoverProfiles } from "./discoverProfiles";
import { setPremiumSnapshot } from "./premiumStatus";
import { apiUrl } from "./supabase";
import { normalizeDatingProfile } from "../utils/profile";
import { mergeIncomingSocial } from "../utils/profileSocial";
import { readResponseJson } from "../utils/httpJson";
import { safeArray, safeCoverPhoto, safePhotos } from "../utils/safeProfile";

type MemberIdentity = Pick<UserProfile, "email" | "phone" | "name">;

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...identity, ...body })
    });
    const payload = await readResponseJson<MemberActionPayload>(response);
    if (!response.ok || !payload?.ok) return null;
    return payload;
  } catch {
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

export async function hydrateMemberData(user: MemberIdentity): Promise<boolean> {
  const payload = await postMemberAction("pull", user);
  const bundle = payload?.bundle;
  if (!bundle) return false;

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
    setPremiumSnapshot(bundle.premium);
  } else if (bundle.user) {
    const until = bundle.user.premium_until as string | null;
    setPremiumSnapshot({
      isPremium: until ? new Date(until).getTime() > Date.now() : Boolean(bundle.user.is_premium),
      premiumUntil: until || null
    });
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
    const remote = bundle.datingProfile as Record<string, unknown>;
    const remotePhotos = safePhotos(remote.photos);
    const localPhotos = safePhotos(local.photos);
    const mergedPhotos = remotePhotos.length >= localPhotos.length ? remotePhotos : localPhotos;
    const remoteCover = safeCoverPhoto(remote.coverPhoto);
    const localCover = safeCoverPhoto(local.coverPhoto);
    const coverPhoto = remoteCover || localCover;
    const coverPhotoExplicit = Boolean(
      (remote.coverPhotoExplicit ?? local.coverPhotoExplicit) && coverPhoto
    );
    const onboardingIncomplete = !Boolean(local.onboardingComplete || remote.onboardingComplete);
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
    const merged = normalizeDatingProfile({
      ...local,
      ...remote,
      photos: mergedPhotos.length ? mergedPhotos : localPhotos,
      coverPhoto,
      coverPhotoExplicit,
      interests,
      interestsTouched
    });
    writeJson(STORAGE_KEYS.datingProfile, merged);
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

export async function completeOnboardingRemote(user: MemberIdentity): Promise<void> {
  const payload = await postMemberAction("complete-onboarding", user);
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
