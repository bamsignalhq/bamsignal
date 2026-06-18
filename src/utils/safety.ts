import { defaultSafetySettings, isFemaleGender } from "../constants/safety";
import { STORAGE_KEYS } from "../constants/limits";
import type {
  ChatThread,
  DatingProfile,
  DiscoverProfile,
  DmControl,
  Gender,
  LookingFor,
  MatchPreferences,
  ReportReason,
  ReportRecord,
  SafetySettings
} from "../types";
import { matchesPreferences } from "./compatibility";
import { defaultMatchPreferences } from "./profile";
import { meetsDiscoveryQuality } from "./launchSeed";
import { readJson, writeJson } from "./storage";
import { persistReportRemote } from "../services/memberData";
import { apiUrl } from "../services/supabase";
import { trackSafetyBlock, trackSafetyReport } from "./safetyAnalytics";

export function resolveSafetySettings(profile: {
  gender?: Gender;
  safetySettings?: SafetySettings;
}): SafetySettings {
  return { ...defaultSafetySettings(profile.gender), ...profile.safetySettings };
}

export function senderAsDiscoverProfile(sender: DatingProfile, id = "viewer"): DiscoverProfile {
  return {
    id,
    name: "You",
    age: sender.age,
    gender: sender.gender,
    lookingFor: sender.lookingFor,
    city: sender.city,
    bio: sender.bio,
    photo: sender.photos[0] ?? "",
    intents: sender.intents,
    interests: sender.interests,
    religion: sender.religion,
    ethnicity: sender.ethnicity,
    stateOfOrigin: sender.stateOfOrigin,
    lifestyle: sender.lifestyle,
    verified: sender.verified
  };
}

export function genderMatchesLookingFor(lookingFor: LookingFor | undefined, gender?: Gender): boolean {
  if (!lookingFor || (lookingFor as string) === "Everyone" || !gender || (gender as string) === "Prefer not to say") return true;
  if (lookingFor === "Men") return gender === "Man";
  if (lookingFor === "Women") return gender === "Woman";
  return true;
}

export function getReportCount(profileId: string): number {
  const reports = readJson<ReportRecord[]>(STORAGE_KEYS.reports, []);
  return reports.filter((r) => r.profileId === profileId).length;
}

export function isUserBlocked(profileId: string): boolean {
  const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []);
  return blocked.includes(profileId);
}

export function isAutoFlagged(profileId: string): boolean {
  return getReportCount(profileId) >= 3;
}

export function recordReport(
  profileId: string,
  reason: ReportReason,
  details?: string,
  options?: { blocked?: boolean }
): void {
  const reports = readJson<ReportRecord[]>(STORAGE_KEYS.reports, []);
  const report: ReportRecord = {
    profileId,
    reason,
    details: details?.trim() || undefined,
    at: new Date().toISOString(),
    blocked: Boolean(options?.blocked)
  };
  reports.push(report);
  writeJson(STORAGE_KEYS.reports, reports);
  trackSafetyReport(profileId, reason);
  const user = readJson<{ email?: string; phone?: string; name?: string }>(STORAGE_KEYS.userProfile, {
    email: "",
    phone: "",
    name: ""
  });
  if (user.email || user.phone) {
    persistReportRemote(
      { email: user.email || "", phone: user.phone || "", name: user.name || "" },
      report
    );
  }
}

export function blockUser(profileId: string): void {
  const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []);
  if (!blocked.includes(profileId)) {
    writeJson(STORAGE_KEYS.blocked, [...blocked, profileId]);
    trackSafetyBlock(profileId);
    const user = readJson<{ email?: string; phone?: string }>(STORAGE_KEYS.userProfile, {
      email: "",
      phone: ""
    });
    if (user.email || user.phone) {
      void fetch(apiUrl("/api/member/data?action=user-block"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email || "",
          phone: user.phone || "",
          targetProfileId: profileId
        })
      }).catch(() => undefined);
    }
  }
  const matches = readJson<{ profileId: string; id?: string }[]>(STORAGE_KEYS.matches, []);
  writeJson(
    STORAGE_KEYS.matches,
    matches.filter((m) => m.profileId !== profileId)
  );
  const likedBy = readJson<{ profileId: string }[]>(STORAGE_KEYS.likedBy, []);
  writeJson(
    STORAGE_KEYS.likedBy,
    likedBy.filter((l) => l.profileId !== profileId)
  );
  const matchIds = matches.filter((m) => m.profileId === profileId).map((m) => m.id).filter(Boolean) as string[];
  if (matchIds.length) {
    const chats = readJson<Record<string, ChatThread>>(STORAGE_KEYS.chats, {});
    const nextChats = { ...chats };
    for (const id of matchIds) delete nextChats[id];
    writeJson(STORAGE_KEYS.chats, nextChats);
  }
}

export function blockAndReportUser(profileId: string, reason: ReportReason, details?: string): void {
  recordReport(profileId, reason, details, { blocked: true });
  blockUser(profileId);
}

export function unmatchUser(matchId: string, profileId: string): void {
  const matches = readJson<{ id: string; profileId: string }[]>(STORAGE_KEYS.matches, []);
  writeJson(
    STORAGE_KEYS.matches,
    matches.filter((m) => m.id !== matchId && m.profileId !== profileId)
  );
  const chats = readJson<Record<string, ChatThread>>(STORAGE_KEYS.chats, {});
  const { [matchId]: _removed, ...rest } = chats;
  void _removed;
  writeJson(STORAGE_KEYS.chats, rest);
}

export type SignalGateResult = { allowed: true } | { allowed: false; reason: string };

/** Can the logged-in user send a signal to this discover profile? */
export function canUserSignalTarget(
  sender: DatingProfile,
  recipient: DiscoverProfile,
  recipientPrefs: MatchPreferences = defaultMatchPreferences()
): SignalGateResult {
  if (isUserBlocked(recipient.id)) {
    return { allowed: false, reason: "You've blocked this person." };
  }

  const safety = resolveSafetySettings({
    gender: recipient.gender,
    safetySettings: recipient.safetySettings
  });

  if (safety.whoCanSignalMe === "verified_only" && !sender.verified) {
    return {
      allowed: false,
      reason: "Only verified members can signal this person."
    };
  }

  if (safety.whoCanSignalMe === "matches_preferences" || safety.onlyMatchingPreferencesCanSignal) {
    const senderCard = senderAsDiscoverProfile(sender);
    if (!matchesPreferences(senderCard, recipientPrefs)) {
      return {
        allowed: false,
        reason: "This person only accepts signals from profiles matching their preferences."
      };
    }
  }

  if (recipient.lookingFor && !genderMatchesLookingFor(recipient.lookingFor, sender.gender)) {
    return { allowed: false, reason: "This person isn't looking for signals from your profile type." };
  }

  if (!genderMatchesLookingFor(sender.lookingFor, recipient.gender)) {
    return { allowed: false, reason: "This profile doesn't match who you're looking for." };
  }

  return { allowed: true };
}

/** Can the logged-in user receive / send messages in an existing match? */
export function canUseInbox(viewer: DatingProfile): SignalGateResult {
  const safety = resolveSafetySettings(viewer);
  if (safety.dmControl === "nobody") {
    return { allowed: false, reason: "You've paused incoming messages in Safety settings." };
  }
  return { allowed: true };
}

export function canReceiveMessageFrom(
  recipient: DatingProfile,
  senderVerified: boolean,
  isMatch: boolean
): SignalGateResult {
  const safety = resolveSafetySettings(recipient);
  if (!isMatch) {
    return { allowed: false, reason: "Messages unlock after a signal is accepted." };
  }
  if (safety.dmControl === "nobody") {
    return { allowed: false, reason: "This member has paused incoming messages." };
  }
  if (safety.dmControl === "verified_only" && !senderVerified) {
    return { allowed: false, reason: "This member only accepts messages from verified profiles." };
  }
  return { allowed: true };
}

export function shouldHideFromDiscovery(profile: DatingProfile): boolean {
  return Boolean(resolveSafetySettings(profile).hideFromDiscovery);
}

export function filterDiscoverDeck(
  profiles: DiscoverProfile[],
  viewer: DatingProfile,
  blocked: string[],
  passed: string[]
): DiscoverProfile[] {
  return profiles.filter((p) => {
    if (!meetsDiscoveryQuality(p)) return false;
    if (blocked.includes(p.id) || passed.includes(p.id)) return false;
    if (!genderMatchesLookingFor(viewer.lookingFor, p.gender)) return false;
    return true;
  });
}

export function filterBlockedById<T extends { id: string }>(items: T[]): T[] {
  const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []);
  return items.filter((p) => !blocked.includes(p.id));
}

export function filterBlockedByProfileId<T extends { profileId: string }>(items: T[]): T[] {
  const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []);
  return items.filter((p) => !blocked.includes(p.profileId));
}

export function applyFemaleFirstDefaults(profile: DatingProfile): DatingProfile {
  if (!isFemaleGender(profile.gender)) return profile;
  return {
    ...profile,
    safetySettings: {
      ...defaultSafetySettings("Woman"),
      ...profile.safetySettings
    }
  };
}
