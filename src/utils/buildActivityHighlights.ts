import { DAY_MS } from "./activity";
import { isNewSignalProfile } from "./launchSeed";
import { hasMoreAboutMeItem } from "./moreAboutMe";
import { calculateProfileStrength, getProfileStrengthLevel } from "./profileStrength";
import { isTrustedMember } from "./trustedMember";
import { hasVoiceVibe } from "./voiceVibe";
import type { DatingProfile, PhotoReviewMeta } from "../types";
import { safePhotoMeta } from "./photoMeta";

export const ACTIVITY_HIGHLIGHTS_TITLE = "Activity Highlights";
export const ACTIVITY_HIGHLIGHTS_EMPTY_HEADLINE = "No highlights available yet";
export const ACTIVITY_HIGHLIGHTS_EMPTY_COPY = "Good conversations begin with curiosity.";

export const MAX_ACTIVITY_HIGHLIGHTS = 5;
export const DISCOVER_ACTIVITY_HIGHLIGHTS = 2;

const RECENT_PHOTO_MS = 14 * DAY_MS;

export type ActivityHighlightId =
  | "active-today"
  | "voice-vibe"
  | "trusted-member"
  | "recent-photos"
  | "new-here"
  | "replies-quickly"
  | "excellent-profile"
  | "highly-complete"
  | "same-city"
  | "music-lover";

export type ActivityHighlight = {
  id: ActivityHighlightId;
  label: string;
};

/** Reserved for future signals — not scored yet unless explicitly enabled. */
export type ActivityHighlightsFutureSignals = {
  repliesQuickly?: boolean;
  popularMember?: boolean;
  recentlyVerified?: boolean;
  eventAttendee?: boolean;
  circleMember?: boolean;
};

export type ActivityHighlightsProfile = {
  city?: string;
  createdAt?: string;
  lastActiveAt?: string;
  verified?: boolean;
  verificationStatus?: DatingProfile["verificationStatus"];
  photos?: string[];
  photoMeta?: Record<string, PhotoReviewMeta>;
  interests?: string[];
  intents?: DatingProfile["intents"];
  bio?: string;
  premium?: boolean;
};

export type BuildActivityHighlightsContext = {
  viewerCity?: string;
  phoneVerified?: boolean;
  isPremium?: boolean;
  future?: ActivityHighlightsFutureSignals;
  now?: number;
};

type Candidate = ActivityHighlight & { score: number };

const HIGHLIGHT_COPY: Record<ActivityHighlightId, ActivityHighlight> = {
  "active-today": { id: "active-today", label: "🌞 Active Today" },
  "voice-vibe": { id: "voice-vibe", label: "🎙 Voice Vibe Available" },
  "trusted-member": { id: "trusted-member", label: "🛡 Trusted Member" },
  "recent-photos": { id: "recent-photos", label: "📸 Recently Added Photos" },
  "new-here": { id: "new-here", label: "✨ New Here" },
  "replies-quickly": { id: "replies-quickly", label: "💬 Replies Quickly" },
  "excellent-profile": { id: "excellent-profile", label: "💜 Excellent Profile" },
  "highly-complete": { id: "highly-complete", label: "📈 Highly Complete Profile" },
  "same-city": { id: "same-city", label: "🌆 Same City" },
  "music-lover": { id: "music-lover", label: "🎵 Music Lover" }
};

function isActiveToday(lastActiveAt: string | undefined, now: number): boolean {
  if (!lastActiveAt) return false;
  const diff = now - new Date(lastActiveAt).getTime();
  return diff >= 0 && diff < DAY_MS;
}

function hasRecentlyAddedPhotos(
  photoMeta: Record<string, PhotoReviewMeta> | undefined,
  now: number
): boolean {
  return Object.values(safePhotoMeta(photoMeta)).some((entry) => {
    if (!entry.uploadedAt) return false;
    const diff = now - new Date(entry.uploadedAt).getTime();
    return diff >= 0 && diff < RECENT_PHOTO_MS;
  });
}

function profileStrengthTier(
  profile: ActivityHighlightsProfile,
  context: BuildActivityHighlightsContext
) {
  const score = calculateProfileStrength(profile as DatingProfile, {
    phoneVerified: context.phoneVerified,
    isPremium: context.isPremium
  });
  return getProfileStrengthLevel(score);
}

/** Warm, non-surveillance activity chips for profile surfaces. */
export function buildActivityHighlights(
  profile: ActivityHighlightsProfile,
  context: BuildActivityHighlightsContext = {},
  limit = MAX_ACTIVITY_HIGHLIGHTS
): ActivityHighlight[] {
  const now = context.now ?? Date.now();
  const candidates: Candidate[] = [];

  const add = (id: ActivityHighlightId, score: number) => {
    candidates.push({ ...HIGHLIGHT_COPY[id], score });
  };

  if (isTrustedMember(profile)) {
    add("trusted-member", 96);
  }

  if (hasVoiceVibe(profile as Partial<DatingProfile>)) {
    add("voice-vibe", 92);
  }

  if (isNewSignalProfile(profile)) {
    add("new-here", 88);
  }

  if (isActiveToday(profile.lastActiveAt, now)) {
    add("active-today", 84);
  }

  if (
    context.viewerCity &&
    profile.city?.trim() &&
    context.viewerCity.trim().toLowerCase() === profile.city.trim().toLowerCase()
  ) {
    add("same-city", 80);
  }

  if (hasRecentlyAddedPhotos(profile.photoMeta, now)) {
    add("recent-photos", 76);
  }

  const tier = profileStrengthTier(profile, context);
  if (tier.tier === "excellent" || tier.tier === "outstanding") {
    add("excellent-profile", 72);
  } else if (tier.tier === "very-good") {
    add("highly-complete", 68);
  }

  if (hasMoreAboutMeItem(profile.interests, "music")) {
    add("music-lover", 64);
  }

  if (context.future?.repliesQuickly) {
    add("replies-quickly", 60);
  }

  void context.future?.popularMember;
  void context.future?.recentlyVerified;
  void context.future?.eventAttendee;
  void context.future?.circleMember;

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(0, limit))
    .map(({ id, label }) => ({ id, label }));
}
