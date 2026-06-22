/** Signal Concierge Success Story consent — privacy first, dual approval required. */

export const SUCCESS_STORY_CONSENT_TITLE = "Share Your Story";
export const SUCCESS_STORY_CONSENT_SUBCOPY =
  "Celebrate your journey on your terms. Nothing is ever published without explicit consent from both of you.";
export const SUCCESS_STORY_PRIVACY_HEADLINE = "Privacy First";
export const SUCCESS_STORY_PRIVACY_NOTE =
  "Everything stays private until you both choose otherwise. No assumptions. No auto-opt-in.";
export const SUCCESS_STORY_TELL_YOUR_STORY = "Tell Your Story";
export const SUCCESS_STORY_CELEBRATE = "Celebrate Your Journey";
export const SUCCESS_STORY_WITHDRAWAL_NOTE =
  "You may withdraw consent at any time. Future publications stop immediately.";
export const SUCCESS_STORY_DUAL_APPROVAL_NOTE =
  "Both people must approve. Single-party approval is never enough.";

export type SuccessStoryVisibilityLevel = "anonymous" | "first-name-only" | "full-story";

export type SuccessStoryPhotoPermission = "no-photos" | "private-photos" | "public-photos";

export type SuccessStoryVideoPermission = "no-video" | "private-video" | "public-video";

export type SuccessStoryTestimonialPermission =
  | "private-feedback-only"
  | "marketing-use-allowed"
  | "website-use-allowed"
  | "social-media-use-allowed";

export type SuccessStoryConsentAction = "granted" | "updated" | "withdrawn";

export const SUCCESS_STORY_VISIBILITY_LABELS: Record<SuccessStoryVisibilityLevel, string> = {
  anonymous: "Anonymous",
  "first-name-only": "First Name Only",
  "full-story": "Full Story"
};

export const SUCCESS_STORY_PHOTO_LABELS: Record<SuccessStoryPhotoPermission, string> = {
  "no-photos": "No Photos",
  "private-photos": "Private Photos",
  "public-photos": "Public Photos"
};

export const SUCCESS_STORY_VIDEO_LABELS: Record<SuccessStoryVideoPermission, string> = {
  "no-video": "No Video",
  "private-video": "Private Video",
  "public-video": "Public Video"
};

export const SUCCESS_STORY_TESTIMONIAL_LABELS: Record<SuccessStoryTestimonialPermission, string> = {
  "private-feedback-only": "Private Feedback Only",
  "marketing-use-allowed": "Marketing Use Allowed",
  "website-use-allowed": "Website Use Allowed",
  "social-media-use-allowed": "Social Media Use Allowed"
};

export const SUCCESS_STORY_CONSENT_ACTION_LABELS: Record<SuccessStoryConsentAction, string> = {
  granted: "Granted",
  updated: "Updated",
  withdrawn: "Withdrawn"
};

export const SUCCESS_STORY_LEVEL_EXAMPLES: Record<SuccessStoryVisibilityLevel, string> = {
  anonymous:
    "Two professionals from Lagos met through Signal Concierge and got married in 2030.",
  "first-name-only": "Chioma and David met through Signal Concierge.",
  "full-story": "Full story with photos, videos, and wedding journey — shared with care."
};

export const DEFAULT_SUCCESS_STORY_CONSENT = {
  visibility: "anonymous" as SuccessStoryVisibilityLevel,
  photoPermission: "no-photos" as SuccessStoryPhotoPermission,
  videoPermission: "no-video" as SuccessStoryVideoPermission,
  testimonialPermission: "private-feedback-only" as SuccessStoryTestimonialPermission
};
