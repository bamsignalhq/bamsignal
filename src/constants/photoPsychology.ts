export const PHOTO_PSYCHOLOGY_HEADLINE = "Make Your Profile Shine ✨";
export const PHOTO_PSYCHOLOGY_SUBTEXT =
  "Profiles with more photos help people feel comfortable reaching out.";
export const PHOTO_PSYCHOLOGY_VISIBILITY =
  "Members with complete profiles receive more replies and better visibility.";

export const PHOTO_PSYCHOLOGY_EMPTY_HEADLINE = "Every picture tells part of your story";
export const PHOTO_PSYCHOLOGY_SUCCESS_HEADLINE = "Outstanding ✨";
export const PHOTO_PSYCHOLOGY_SUCCESS_SUBTEXT =
  "Your profile paints a beautiful picture of who you are.";
export const PHOTO_PSYCHOLOGY_CTA = "Add Photos";

export const PHOTO_PSYCHOLOGY_SLOT_COUNT = 6;
export const PHOTO_PSYCHOLOGY_HOME_THRESHOLD = 4;

export type PhotoProgressLevelId =
  | "getting-started"
  | "looking-good"
  | "great-profile"
  | "outstanding";

export type PhotoProgressLevel = {
  id: PhotoProgressLevelId;
  label: string;
  minPhotos: number;
  maxPhotos: number;
};

export const PHOTO_PROGRESS_LEVELS: PhotoProgressLevel[] = [
  { id: "getting-started", label: "Getting Started", minPhotos: 1, maxPhotos: 1 },
  { id: "looking-good", label: "Looking Good", minPhotos: 2, maxPhotos: 3 },
  { id: "great-profile", label: "Great Profile", minPhotos: 4, maxPhotos: 5 },
  { id: "outstanding", label: "Outstanding", minPhotos: 6, maxPhotos: 6 }
];

export const PHOTO_PROGRESS_BENEFITS: Record<number, string> = {
  2: "People get a better sense of who you are.",
  4: "Profiles tend to receive more replies.",
  6: "Your personality shines through."
};

export const PHOTO_EDUCATION_SLIDES = [
  {
    id: "real-self",
    headline: "Show your real self",
    subtext: "Clear and recent photos help build trust."
  },
  {
    id: "tell-story",
    headline: "More photos tell your story",
    subtext: "Different moments help people understand your personality."
  },
  {
    id: "natural",
    headline: "Natural photos work best",
    subtext: "Smile, relax and be yourself."
  },
  {
    id: "quality",
    headline: "Quality over perfection",
    subtext: "Authenticity matters more than perfect pictures."
  }
] as const;

export const PHOTO_TIPS_GOOD = [
  "Face visible",
  "Good lighting",
  "Recent photos",
  "Natural smile",
  "Solo pictures"
] as const;

export const PHOTO_TIPS_AVOID = [
  "Heavy filters",
  "AI-generated images",
  "Group photos",
  "Blurry pictures",
  "Sunglasses in every photo"
] as const;

/** Reserved for future products — not implemented. */
export type PhotoPsychologyFutureTier =
  | "quality-scoring"
  | "ai-suggestions"
  | "best-photo-recommendation"
  | "circle-matchmaking";

export type PhotoPsychologyFutureConfig = {
  tier?: PhotoPsychologyFutureTier;
  circleId?: string;
};

export const PHOTO_SLOT_LABELS = [
  "Main Photo",
  "Photo 2",
  "Photo 3",
  "Photo 4",
  "Photo 5",
  "Photo 6"
] as const;
