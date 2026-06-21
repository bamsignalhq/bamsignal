export type MoreAboutMeCategoryId =
  | "lifestyle"
  | "entertainment"
  | "food"
  | "faith"
  | "sports"
  | "travel"
  | "career"
  | "personality"
  | "fun";

export type MoreAboutMeId =
  | "business"
  | "reading"
  | "fitness"
  | "faith"
  | "cooking"
  | "nature"
  | "shopping"
  | "nightOwl"
  | "morningPerson"
  | "movies"
  | "music"
  | "karaoke"
  | "podcasts"
  | "netflix"
  | "comedy"
  | "foodLover"
  | "suya"
  | "jollofRice"
  | "coffee"
  | "nigerianSoups"
  | "lovesPepper"
  | "travel"
  | "adventure"
  | "beachTrips"
  | "roadTrips"
  | "football"
  | "basketball"
  | "running"
  | "cycling"
  | "ambitious"
  | "entrepreneur"
  | "professional"
  | "growthMindset"
  | "easygoing"
  | "romantic"
  | "social"
  | "thinker"
  | "spontaneous"
  | "calm"
  | "familyOriented"
  | "loyal"
  | "photography"
  | "gaming"
  | "creativity"
  | "parties"
  | "singing";

export type MoreAboutMeItem = {
  id: MoreAboutMeId;
  label: string;
  emoji: string;
  category: MoreAboutMeCategoryId;
};

export type MoreAboutMeCategory = {
  id: MoreAboutMeCategoryId;
  label: string;
  items: readonly MoreAboutMeItem[];
};

const item = (
  id: MoreAboutMeId,
  emoji: string,
  label: string,
  category: MoreAboutMeCategoryId
): MoreAboutMeItem => ({ id, emoji, label, category });

export const MORE_ABOUT_ME_CATEGORIES: readonly MoreAboutMeCategory[] = [
  {
    id: "lifestyle",
    label: "Lifestyle",
    items: [
      item("business", "💼", "Business", "lifestyle"),
      item("reading", "📚", "Reading", "lifestyle"),
      item("fitness", "🏋", "Fitness", "lifestyle"),
      item("cooking", "🍳", "Cooking", "lifestyle"),
      item("nature", "🌿", "Nature", "lifestyle"),
      item("shopping", "🛍", "Shopping", "lifestyle"),
      item("nightOwl", "🌙", "Night Owl", "lifestyle"),
      item("morningPerson", "☀", "Morning Person", "lifestyle")
    ]
  },
  {
    id: "entertainment",
    label: "Entertainment",
    items: [
      item("movies", "🎬", "Movies", "entertainment"),
      item("music", "🎵", "Music", "entertainment"),
      item("karaoke", "🎤", "Karaoke", "entertainment"),
      item("podcasts", "🎧", "Podcasts", "entertainment"),
      item("netflix", "📺", "Netflix", "entertainment"),
      item("comedy", "🎭", "Comedy", "entertainment")
    ]
  },
  {
    id: "food",
    label: "Food",
    items: [
      item("foodLover", "🍲", "Food Lover", "food"),
      item("suya", "🍢", "Suya", "food"),
      item("jollofRice", "🍛", "Jollof Rice", "food"),
      item("coffee", "☕", "Coffee", "food"),
      item("nigerianSoups", "🥘", "Nigerian Soups", "food"),
      item("lovesPepper", "🌶", "Loves Pepper", "food")
    ]
  },
  {
    id: "faith",
    label: "Faith",
    items: [item("faith", "🙏", "Faith", "faith")]
  },
  {
    id: "travel",
    label: "Travel",
    items: [
      item("travel", "✈", "Travel", "travel"),
      item("adventure", "🌍", "Adventure", "travel"),
      item("beachTrips", "🏖", "Beach Trips", "travel"),
      item("roadTrips", "🚗", "Road Trips", "travel")
    ]
  },
  {
    id: "sports",
    label: "Sports",
    items: [
      item("football", "⚽", "Football", "sports"),
      item("basketball", "🏀", "Basketball", "sports"),
      item("running", "🏃", "Running", "sports"),
      item("cycling", "🚴", "Cycling", "sports")
    ]
  },
  {
    id: "career",
    label: "Career",
    items: [
      item("ambitious", "🚀", "Ambitious", "career"),
      item("entrepreneur", "💡", "Entrepreneur", "career"),
      item("professional", "💼", "Professional", "career"),
      item("growthMindset", "📈", "Growth Mindset", "career")
    ]
  },
  {
    id: "personality",
    label: "Personality",
    items: [
      item("easygoing", "😊", "Easygoing", "personality"),
      item("romantic", "💜", "Romantic", "personality"),
      item("social", "🎉", "Social", "personality"),
      item("thinker", "🧠", "Thinker", "personality"),
      item("spontaneous", "✨", "Spontaneous", "personality"),
      item("calm", "😌", "Calm", "personality"),
      item("familyOriented", "❤️", "Family-Oriented", "personality"),
      item("loyal", "🤝", "Loyal", "personality")
    ]
  },
  {
    id: "fun",
    label: "Fun",
    items: [
      item("photography", "📷", "Photography", "fun"),
      item("gaming", "🎮", "Gaming", "fun"),
      item("creativity", "🎨", "Creativity", "fun"),
      item("parties", "🎉", "Parties", "fun"),
      item("singing", "🎤", "Singing", "fun")
    ]
  }
] as const;

export const MORE_ABOUT_ME_ITEMS: readonly MoreAboutMeItem[] = MORE_ABOUT_ME_CATEGORIES.flatMap(
  (category) => category.items
);

export const MORE_ABOUT_ME_ITEM_BY_ID: Record<MoreAboutMeId, MoreAboutMeItem> = Object.fromEntries(
  MORE_ABOUT_ME_ITEMS.map((entry) => [entry.id, entry])
) as Record<MoreAboutMeId, MoreAboutMeItem>;

export const MIN_MORE_ABOUT_ME = 0;
export const MAX_MORE_ABOUT_ME = 8;
export const MORE_ABOUT_ME_HERO_PREVIEW = 3;
export const MORE_ABOUT_ME_DISCOVER_PREVIEW = 3;

export const MORE_ABOUT_ME_HEADLINE = "Tell people more about you";
export const MORE_ABOUT_ME_SUBTEXT = "Choose things that feel like you.";
export const MORE_ABOUT_ME_TITLE = "More About Me";
export const MORE_ABOUT_ME_LIMIT_MESSAGE = "You can choose up to 8.";

/** @deprecated use MIN_MORE_ABOUT_ME */
export const MIN_PROFILE_INTERESTS = MIN_MORE_ABOUT_ME;
/** @deprecated use MAX_MORE_ABOUT_ME */
export const MAX_PROFILE_INTERESTS = MAX_MORE_ABOUT_ME;
/** @deprecated use MORE_ABOUT_ME_HERO_PREVIEW */
export const PROFILE_INTERESTS_PREVIEW = MORE_ABOUT_ME_HERO_PREVIEW;

export type InterestCategory = MoreAboutMeCategory;
export const INTEREST_CATEGORIES = MORE_ABOUT_ME_CATEGORIES;
export const ALL_CATEGORIZED_INTERESTS = MORE_ABOUT_ME_ITEMS.map((item) => item.id);
export const INTEREST_OPTIONS = ALL_CATEGORIZED_INTERESTS;

export function formatMoreAboutMeChip(id: string): string {
  const item = MORE_ABOUT_ME_ITEM_BY_ID[id as MoreAboutMeId];
  return item ? `${item.emoji} ${item.label}` : id;
}
