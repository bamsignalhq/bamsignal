import type { DatingProfile, DiscoverProfile } from "../types";
import { isPreferNot } from "../utils/profile";
import { hasVoiceVibe } from "../utils/voiceVibe";
import { safeArray } from "../utils/safeProfile";
import {
  MORE_ABOUT_ME_ICEBREAKERS,
  normalizeMoreAboutMeInterests
} from "../utils/moreAboutMe";
import type { MoreAboutMeId } from "../constants/moreAboutMe";

export type IcebreakerCategoryId =
  | "compliments"
  | "food"
  | "music"
  | "movies"
  | "travel"
  | "weekend"
  | "funny"
  | "faith"
  | "career"
  | "lifestyle"
  | "personality"
  | "nigeria"
  | "dreams"
  | "family"
  | "personalized";

export type IcebreakerContext = "profile" | "chat" | "chat-empty" | "match";

export type IcebreakerDefinition = {
  id: string;
  text: string;
  category: IcebreakerCategoryId;
  /** Future: city slugs, festivals, relationship goals */
  tags?: string[];
};

export const ICEBREAKER_CATEGORY_LABELS: Record<IcebreakerCategoryId, string> = {
  compliments: "Compliments",
  food: "Food",
  music: "Music",
  movies: "Movies",
  travel: "Travel",
  weekend: "Weekend",
  funny: "Funny",
  faith: "Faith",
  career: "Career",
  lifestyle: "Lifestyle",
  personality: "Personality",
  nigeria: "Nigeria",
  dreams: "Dreams",
  family: "Family",
  personalized: "For you"
};

export const ICEBREAKERS: IcebreakerDefinition[] = [
  { id: "compliment-smile", text: "😊 Love your smile", category: "compliments" },
  { id: "compliment-vibe", text: "✨ You have a lovely vibe", category: "compliments" },
  { id: "compliment-profile", text: "❤️ Nice profile", category: "compliments" },
  { id: "compliment-talk", text: "🌸 You seem easy to talk to", category: "compliments" },
  { id: "compliment-photos", text: "💜 Your photos are beautiful", category: "compliments" },
  { id: "compliment-happy", text: "🌟 You look genuinely happy", category: "compliments" },

  { id: "food-dish", text: "🍲 Favorite Nigerian dish?", category: "food" },
  { id: "food-jollof", text: "🍛 Jollof rice or fried rice?", category: "food" },
  { id: "food-amala", text: "🍜 Amala or pounded yam?", category: "food" },
  { id: "food-pepper", text: "🌶 Can you handle pepper?", category: "food" },
  { id: "food-suya", text: "🍢 Suya or shawarma?", category: "food" },
  { id: "food-soup", text: "🥘 Favorite soup?", category: "food" },
  { id: "food-rice", text: "🍚 Rice every day or variety?", category: "food" },

  { id: "music-artist", text: "🎵 Which artist is on repeat lately?", category: "music" },
  { id: "music-afrobeats", text: "🎤 Davido, Burna Boy or Wizkid?", category: "music" },
  { id: "music-gospel", text: "🎶 Favorite gospel song?", category: "music" },
  { id: "music-genre", text: "🎧 What genre do you enjoy most?", category: "music" },
  { id: "music-comfort", text: "🎼 What's your comfort song?", category: "music" },

  { id: "movies-recent", text: "🎬 What movie have you watched recently?", category: "movies" },
  { id: "movies-netflix", text: "📺 Netflix or cinema?", category: "movies" },
  { id: "movies-nollywood", text: "🎥 Nollywood or Hollywood?", category: "movies" },
  { id: "movies-actor", text: "🍿 Favorite actor or actress?", category: "movies" },

  { id: "travel-dream", text: "✈ Dream country to visit?", category: "travel" },
  { id: "travel-city", text: "🌍 Lagos, Abuja or Port Harcourt?", category: "travel" },
  { id: "travel-beach", text: "🏖 Beach vacation or staycation?", category: "travel" },
  { id: "travel-honeymoon", text: "🛫 What's your dream honeymoon destination?", category: "travel" },

  { id: "weekend-how", text: "🎉 How do you spend weekends?", category: "weekend" },
  { id: "weekend-sleep", text: "😴 Sleep in or go out?", category: "weekend" },
  { id: "weekend-movie", text: "🍿 Movie night or outing?", category: "weekend" },
  { id: "weekend-home", text: "🏡 Homebody or outdoors?", category: "weekend" },

  { id: "funny-you", text: "😂 What's something funny about you?", category: "funny" },
  { id: "funny-food", text: "😄 What's the weirdest food you've eaten?", category: "funny" },
  { id: "funny-laugh", text: "🤣 Who makes you laugh the most?", category: "funny" },
  { id: "funny-embarrassing", text: "🙈 Most embarrassing moment?", category: "funny" },

  { id: "faith-important", text: "🙏 How important is faith to you?", category: "faith" },
  { id: "faith-worship", text: "⛪ Favorite worship song?", category: "faith" },
  { id: "faith-inspired", text: "💜 What keeps you inspired?", category: "faith" },
  { id: "faith-grateful", text: "🌞 What are you grateful for today?", category: "faith" },

  { id: "career-enjoy", text: "💼 What do you enjoy most about your work?", category: "career" },
  { id: "career-dream", text: "🚀 What's a dream you're working towards?", category: "career" },
  { id: "career-business", text: "📈 Business or 9–5?", category: "career" },
  { id: "career-motivate", text: "🎯 What motivates you?", category: "career" },

  { id: "family-close", text: "👨‍👩‍👧 Are you close to your family?", category: "family" },
  { id: "family-values", text: "💜 What values matter most to you?", category: "family" },
  { id: "family-village", text: "🏡 Village visits or city life?", category: "family" },

  { id: "personality-introvert", text: "🌟 Introvert or extrovert?", category: "personality" },
  { id: "personality-morning", text: "☀ Morning person or night owl?", category: "personality" },
  { id: "personality-deep", text: "💬 Deep conversations or playful banter?", category: "personality" },
  { id: "personality-peace", text: "😊 What gives you peace?", category: "personality" },

  { id: "dreams-bucket", text: "✈ What's on your bucket list?", category: "dreams" },
  { id: "dreams-hoping", text: "💜 What are you hoping for in life right now?", category: "dreams" },
  { id: "dreams-money", text: "🌍 If money wasn't an issue, what would you do?", category: "dreams" },

  { id: "nigeria-city", text: "🌆 Favorite city in Nigeria?", category: "nigeria" },
  { id: "nigeria-suya", text: "🍢 Best suya spot?", category: "nigeria" },
  { id: "nigeria-club", text: "⚽ Which club do you support?", category: "nigeria" },
  { id: "nigeria-holiday", text: "🎉 Favorite Nigerian holiday?", category: "nigeria" },
  { id: "nigeria-afrobeats", text: "🎵 Favorite Afrobeats artist?", category: "nigeria" },

  { id: "lifestyle-balance", text: "🌿 How do you unwind after a long day?", category: "lifestyle" },
  { id: "lifestyle-routine", text: "☕ Morning routine or wing it?", category: "lifestyle" }
];

export const ICEBREAKER_PERSONALIZED: IcebreakerDefinition[] = [
  {
    id: "personal-travel",
    text: "✈ Dream country to visit?",
    category: "personalized",
    tags: ["more_about_me:travel"]
  },
  {
    id: "personal-movies",
    text: "🎬 What's your favorite movie recently?",
    category: "personalized",
    tags: ["more_about_me:movies"]
  },
  {
    id: "personal-music",
    text: "🎵 Which artist is on repeat lately?",
    category: "personalized",
    tags: ["more_about_me:music"]
  },
  {
    id: "personal-voice-vibe",
    text: "🎤 Loved your Voice Vibe. What inspired it?",
    category: "personalized",
    tags: ["voice_vibe"]
  },
  {
    id: "personal-trusted",
    text: "💜 What made you join BamSignal?",
    category: "personalized",
    tags: ["verified"]
  },
  {
    id: "personal-faith",
    text: "❤️ What role does faith play in your life?",
    category: "personalized",
    tags: ["same_religion"]
  },
  {
    id: "personal-city",
    text: "🌆 What's your favorite place in the city?",
    category: "personalized",
    tags: ["same_city"]
  },
  {
    id: "personal-occupation",
    text: "💼 What do you enjoy most about your profession?",
    category: "personalized",
    tags: ["same_occupation"]
  }
];

export type IcebreakerProfile = Partial<
  Pick<
    DatingProfile,
    | "religion"
    | "interests"
    | "occupation"
    | "occupations"
    | "city"
    | "state"
    | "verified"
    | "voiceIntroUrl"
    | "voiceVibeUrl"
  >
>;

const DEFAULT_LIMIT = 8;
const MIN_LIMIT = 6;

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const list = [...items];
  let state = hashSeed(seed) || 1;
  for (let i = list.length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function targetMoreAboutMe(target: IcebreakerProfile): MoreAboutMeId[] {
  return normalizeMoreAboutMeInterests(target.interests);
}

function sharedOccupation(viewer: IcebreakerProfile, target: IcebreakerProfile): boolean {
  const viewerOcc = viewer.occupations?.length
    ? viewer.occupations
    : viewer.occupation
      ? [viewer.occupation]
      : [];
  const targetOcc = target.occupations?.length
    ? target.occupations
    : target.occupation
      ? [target.occupation]
      : [];
  const cleanViewer = viewerOcc.filter((value) => !isPreferNot(value));
  const cleanTarget = targetOcc.filter((value) => !isPreferNot(value));
  return cleanViewer.some((value) => cleanTarget.includes(value));
}

function pickPersonalized(viewer: IcebreakerProfile, target: IcebreakerProfile): IcebreakerDefinition[] {
  const picks: IcebreakerDefinition[] = [];
  const seen = new Set<string>();

  const add = (item: IcebreakerDefinition) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    picks.push(item);
  };

  const byTag = (tag: string) => ICEBREAKER_PERSONALIZED.find((item) => item.tags?.includes(tag));

  if (hasVoiceVibe(target)) {
    const item = byTag("voice_vibe");
    if (item) add(item);
  }
  if (
    !isPreferNot(viewer.religion) &&
    viewer.religion &&
    viewer.religion === target.religion
  ) {
    const item = byTag("same_religion");
    if (item) add(item);
  }
  if (viewer.city && target.city && viewer.city === target.city) {
    const item = byTag("same_city");
    if (item) add(item);
  }
  if (sharedOccupation(viewer, target)) {
    const item = byTag("same_occupation");
    if (item) add(item);
  }
  for (const id of targetMoreAboutMe(target)) {
    const text = MORE_ABOUT_ME_ICEBREAKERS[id];
    if (text) {
      add({
        id: `personal-more-about-me-${id}`,
        text,
        category: "personalized",
        tags: [`more_about_me:${id}`]
      });
    }
    const tagged = byTag(`more_about_me:${id}`);
    if (tagged) add(tagged);
  }
  if (target.verified) {
    const item = byTag("verified");
    if (item) add(item);
  }

  return picks;
}

export function buildIcebreakers(
  viewer: IcebreakerProfile,
  target: IcebreakerProfile,
  options?: { limit?: number; seed?: string }
): string[] {
  const limit = Math.min(DEFAULT_LIMIT, Math.max(MIN_LIMIT, options?.limit ?? DEFAULT_LIMIT));
  const seed = options?.seed ?? `${viewer.city ?? ""}:${target.city ?? ""}:${targetMoreAboutMe(target).join(",")}`;
  const personalized = pickPersonalized(viewer, target);
  const pool = seededShuffle(
    ICEBREAKERS.filter((item) => item.category !== "personalized"),
    seed
  );

  const chosen: IcebreakerDefinition[] = [];
  const seenText = new Set<string>();

  const push = (item: IcebreakerDefinition) => {
    const key = item.text.toLowerCase();
    if (seenText.has(key) || chosen.length >= limit) return;
    seenText.add(key);
    chosen.push(item);
  };

  for (const item of personalized) push(item);

  const categoriesUsed = new Set(chosen.map((item) => item.category));
  for (const item of pool) {
    if (chosen.length >= limit) break;
    if (categoriesUsed.has(item.category) && chosen.length >= MIN_LIMIT) continue;
    push(item);
    categoriesUsed.add(item.category);
  }

  for (const item of pool) {
    if (chosen.length >= limit) break;
    push(item);
  }

  return chosen.map((item) => item.text);
}

export const EMPTY_CHAT_STARTERS = [
  "😊 Love your smile",
  "🍲 Favorite Nigerian dish?",
  "🎵 Which artist is on repeat lately?",
  "✈ Dream destination?",
  "🌟 You seem easy to talk to",
  "💜 What made you join BamSignal?"
] as const;

export function icebreakerSectionTitle(context: IcebreakerContext, messageCount = 0): string {
  if (context === "match") return "Start with an Icebreaker";
  if (context === "chat-empty" || messageCount === 0) return "Start with an Icebreaker";
  if (context === "chat") return "Need help getting started?";
  return "Icebreakers";
}

export function icebreakerSectionEyebrow(context: IcebreakerContext): string | null {
  if (context === "match") return "You connected 🎉";
  if (context === "profile") return "Conversation ideas";
  return null;
}

export type { DatingProfile, DiscoverProfile };
