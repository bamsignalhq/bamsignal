export type VoiceVibeIdeaCategoryId =
  | "warm"
  | "faith"
  | "funny"
  | "relationship"
  | "professional"
  | "simple"
  | "family"
  | "travel";

export type VoiceVibeIdea = {
  id: string;
  category: VoiceVibeIdeaCategoryId;
  text: string;
  /** Future: locale, city slug, relationship goal */
  tags?: string[];
};

export const VOICE_VIBE_INSPIRATION_HEADLINE = "Need Inspiration?";
export const VOICE_VIBE_INSPIRATION_SUBTEXT =
  "Here are a few ideas to get you started. You can read one or say something completely your own.";
export const VOICE_VIBE_INSPIRATION_USE_LABEL = "Use This Idea";
export const VOICE_VIBE_INSPIRATION_READ_LABEL = "Read aloud";
export const VOICE_VIBE_INSPIRATION_FREESTYLE_HINT = "Say it your way";

export const VOICE_VIBE_EMPTY_HEADLINE = "Not sure what to say?";
export const VOICE_VIBE_EMPTY_SUBTEXT = "Here are a few ideas to help you get started.";

/** Reserved for future products — not implemented. */
export type VoiceVibeIdeasFutureTier =
  | "ai-generated"
  | "city-specific"
  | "voice-language"
  | "relationship-goal-aware";

export type VoiceVibeIdeasFutureConfig = {
  tier?: VoiceVibeIdeasFutureTier;
  citySlug?: string;
  locale?: string;
  relationshipGoal?: string;
};

export const VOICE_VIBE_IDEA_CATEGORIES: Record<VoiceVibeIdeaCategoryId, string> = {
  warm: "Warm",
  faith: "Faith",
  funny: "Funny",
  relationship: "Relationship",
  professional: "Professional",
  simple: "Simple",
  family: "Family",
  travel: "Travel"
};

export const VOICE_VIBE_IDEAS: readonly VoiceVibeIdea[] = [
  {
    id: "warm-lagos",
    category: "warm",
    text: "Hi, I'm Alex from Lagos.\n\nI enjoy travelling, movies and meaningful conversations.\n\nLooking forward to meeting someone genuine 😊"
  },
  {
    id: "relationship-meaningful",
    category: "relationship",
    text: "Hello 😊\n\nI'm hoping to meet someone kind and build something meaningful.\n\nI enjoy laughter, good food and spending time with people I care about.",
    tags: ["relationship-goal:marriage", "relationship-goal:serious"]
  },
  {
    id: "simple-easygoing",
    category: "simple",
    text: "Hi there.\n\nNice to meet you.\n\nI'm easygoing and always open to good conversations."
  },
  {
    id: "funny-friends",
    category: "funny",
    text: "My friends say I'm funny, although I think they're exaggerating 😄\n\nI love good vibes and great company."
  },
  {
    id: "faith-family",
    category: "faith",
    text: "Hello 😊\n\nFaith and family are important to me.\n\nI enjoy meaningful conversations and believe good things take time."
  },
  {
    id: "professional-growth",
    category: "professional",
    text: "Hi.\n\nI'm passionate about my work and always trying to grow.\n\nOutside work, I enjoy music and relaxing with friends."
  },
  {
    id: "travel-explore",
    category: "travel",
    text: "Hi 😊\n\nI love exploring new places and learning new things.\n\nHopefully life gives us plenty of beautiful memories."
  },
  {
    id: "family-peace",
    category: "family",
    text: "Hello.\n\nFamily means a lot to me.\n\nI enjoy peaceful moments and spending time with people I love."
  }
] as const;

/** @deprecated use VOICE_VIBE_IDEAS */
export const VOICE_VIBE_SCRIPTS = VOICE_VIBE_IDEAS.map((idea) => idea.text.replace(/\n+/g, " "));
