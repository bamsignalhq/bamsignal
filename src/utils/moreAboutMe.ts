import {
  MAX_MORE_ABOUT_ME,
  MORE_ABOUT_ME_ITEM_BY_ID,
  MORE_ABOUT_ME_ITEMS,
  type MoreAboutMeId
} from "../constants/moreAboutMe";

/** Reserved for future products — not implemented. */
export type MoreAboutMeFutureTier =
  | "ai-compatibility"
  | "circle-matchmaking"
  | "compatibility-ranking"
  | "conversation-suggestions";

export type MoreAboutMeFutureConfig = {
  tier?: MoreAboutMeFutureTier;
  rankingWeight?: number;
  circleId?: string;
};

const LEGACY_INTEREST_MAP: Record<string, MoreAboutMeId> = {
  Travel: "travel",
  "Road trips": "roadTrips",
  "Road Trips": "roadTrips",
  "Beach days": "beachTrips",
  Beach: "beachTrips",
  "Beach Trips": "beachTrips",
  Adventure: "adventure",
  Food: "foodLover",
  "Food Lover": "foodLover",
  "Suya & chill": "suya",
  Suya: "suya",
  "Jollof debates": "jollofRice",
  "Jollof Rice": "jollofRice",
  "Amala & ewedu": "nigerianSoups",
  "Pepper soup": "lovesPepper",
  "Loves Pepper": "lovesPepper",
  Music: "music",
  Afrobeats: "music",
  "Gospel music": "faith",
  Highlife: "music",
  "Hip-hop": "music",
  "Wizkid & Davido": "music",
  "Asake & Burna": "music",
  Movies: "movies",
  Nollywood: "movies",
  Comedy: "comedy",
  "Live comedy": "comedy",
  Gaming: "gaming",
  Podcasts: "podcasts",
  Fitness: "fitness",
  Gym: "fitness",
  "CrossFit Naija": "fitness",
  Football: "football",
  "EPL banter": "football",
  Reading: "reading",
  Photography: "photography",
  Fashion: "shopping",
  Business: "business",
  Tech: "professional",
  Entrepreneurship: "entrepreneur",
  Networking: "social",
  Family: "familyOriented",
  "Church community": "faith",
  "Mosque hangouts": "faith",
  Volunteering: "familyOriented",
  Cooking: "cooking",
  "Night Owl": "nightOwl",
  "Morning Person": "morningPerson"
};

export function normalizeMoreAboutMeId(raw: string): MoreAboutMeId | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed in MORE_ABOUT_ME_ITEM_BY_ID) return trimmed as MoreAboutMeId;

  const legacy = LEGACY_INTEREST_MAP[trimmed];
  if (legacy) return legacy;

  const lower = trimmed.toLowerCase();
  const byLabel = MORE_ABOUT_ME_ITEMS.find(
    (item) => item.label.toLowerCase() === lower || `${item.emoji} ${item.label}`.toLowerCase() === lower
  );
  return byLabel?.id ?? null;
}

export function normalizeMoreAboutMeInterests(raw: string[] | undefined): MoreAboutMeId[] {
  const out: MoreAboutMeId[] = [];
  for (const item of raw ?? []) {
    const id = normalizeMoreAboutMeId(item);
    if (!id || out.includes(id)) continue;
    out.push(id);
  }
  return out.slice(0, MAX_MORE_ABOUT_ME);
}

export function toggleMoreAboutMeSelection(
  current: string[],
  id: MoreAboutMeId
): { next: string[]; blocked: boolean; blockedReason?: string } {
  const normalized = normalizeMoreAboutMeInterests(current);
  if (normalized.includes(id)) {
    return { next: normalized.filter((item) => item !== id), blocked: false };
  }
  if (normalized.length >= MAX_MORE_ABOUT_ME) {
    return {
      next: normalized,
      blocked: true,
      blockedReason: `You can choose up to ${MAX_MORE_ABOUT_ME}.`
    };
  }
  return { next: [...normalized, id], blocked: false };
}

export function hasMoreAboutMeItem(interests: string[] | undefined, id: MoreAboutMeId): boolean {
  return normalizeMoreAboutMeInterests(interests).includes(id);
}

export const MORE_ABOUT_ME_ICEBREAKERS: Partial<Record<MoreAboutMeId, string>> = {
  movies: "🎬 What's your favorite movie recently?",
  foodLover: "🍲 Favorite Nigerian dish?",
  travel: "✈ Dream country to visit?",
  music: "🎵 Which artist is on repeat lately?",
  romantic: "💜 What makes a connection feel special to you?",
  familyOriented: "❤️ What does family mean to you?",
  reading: "📚 What are you reading right now?",
  ambitious: "🚀 What are you building toward?",
  football: "⚽ Which club do you support?",
  suya: "🍢 Best suya spot you've tried?",
  beachTrips: "🏖 Beach vacation or staycation?",
  faith: "🙏 What role does faith play in your life?"
};

export const MORE_ABOUT_ME_COMPATIBILITY: Partial<
  Record<MoreAboutMeId, { reason: string; key: string }>
> = {
  music: { reason: "🎵 Music lovers", key: "music" },
  travel: { reason: "✈ Both love travelling", key: "travel" },
  romantic: { reason: "💜 Romantic personalities", key: "romantic" },
  familyOriented: { reason: "❤️ Family-oriented", key: "family" },
  reading: { reason: "📚 Curious minds", key: "reading" },
  ambitious: { reason: "🚀 Ambitious people", key: "ambitious" },
  movies: { reason: "🎬 Movie lovers", key: "movies" },
  foodLover: { reason: "🍲 Food lovers", key: "food" },
  fitness: { reason: "🏃 Health-conscious lifestyles", key: "fitness" },
  entrepreneur: { reason: "🚀 Ambitious people", key: "entrepreneur" }
};
