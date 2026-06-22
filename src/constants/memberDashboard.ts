import type { MemberJourneyHealth, MemberJourneyStage } from "../types/memberDashboard";

export const MEMBER_DASHBOARD_BRAND = "Member Dashboard 2.0™";
export const MEMBER_JOURNEY_DASHBOARD_BRAND = "Member Journey Dashboard™";
export const MEMBER_JOURNEY_DASHBOARD_PATH = "/signal-concierge/dashboard";
export const MEMBER_JOURNEY_DASHBOARD_TAGLINE =
  "Your entire Signal Concierge journey in one private destination — journey-centric, never social-app noise.";

export const MEMBER_JOURNEY_READ_ONLY_COPY =
  "Read-only journey view. Your steward remains the operational owner of your concierge experience.";

export const MEMBER_JOURNEY_ID_LABEL = "Journey ID";

export const MEMBER_DASHBOARD_PRIVACY_COPY =
  "Your journey is private, elegant, and centered on you — never public.";

export const MEMBER_JOURNEY_STAGES: {
  id: MemberJourneyStage;
  label: string;
  hint: string;
}[] = [
  { id: "application", label: "Application", hint: "Your private application is on file." },
  { id: "consultation", label: "Consultation", hint: "A private consultation helps us understand your goals." },
  { id: "review", label: "Review", hint: "A steward is reviewing your journey with care." },
  { id: "approved", label: "Approved", hint: "You are approved to move forward when ready." },
  { id: "introductions", label: "Introductions", hint: "Confidential introductions — always with consent." },
  { id: "relationship", label: "Relationship", hint: "Your relationship journey is privately supported." },
  { id: "legacy", label: "Legacy", hint: "Your journey is preserved with dignity." }
];

export const MEMBER_JOURNEY_STAGE_LABELS: Record<MemberJourneyStage, string> = Object.fromEntries(
  MEMBER_JOURNEY_STAGES.map((stage) => [stage.id, stage.label])
) as Record<MemberJourneyStage, string>;

export const MEMBER_JOURNEY_HEALTH_LEVELS: {
  id: MemberJourneyHealth;
  label: string;
  hint: string;
}[] = [
  { id: "steady", label: "Steady", hint: "Your journey is moving at a thoughtful pace." },
  { id: "active", label: "Active", hint: "Your journey has recent steward activity." },
  { id: "celebration", label: "Celebration", hint: "A milestone is being honored privately." },
  { id: "paused", label: "Paused", hint: "Your journey is gently paused." }
];

export const MEMBER_JOURNEY_HEALTH_LABELS: Record<MemberJourneyHealth, string> = Object.fromEntries(
  MEMBER_JOURNEY_HEALTH_LEVELS.map((level) => [level.id, level.label])
) as Record<MemberJourneyHealth, string>;

export const MEMBER_DASHBOARD_FUTURE_CAPABILITIES = [
  { id: "mobile-app" as const, label: "Mobile app" },
  { id: "push-notifications" as const, label: "Push notifications" },
  { id: "anniversary-celebrations" as const, label: "Anniversary celebrations" },
  { id: "success-stories" as const, label: "Success stories" },
  { id: "legacy-family-view" as const, label: "Legacy family view" }
];

/**
 * Future-ready architecture hooks — not implemented.
 */
export const MEMBER_DASHBOARD_FUTURE_ARCHITECTURE = {
  mobileApp: "Native member dashboard with the same journey-centered sections.",
  pushNotifications: "Gentle journey updates — never loud, never public.",
  anniversaryCelebrations: "Private milestone celebrations within your journey archive.",
  successStories: "Opt-in success story sharing with dual approval.",
  legacyFamilyView: "Family-authorized legacy view — human consent required."
} as const;
