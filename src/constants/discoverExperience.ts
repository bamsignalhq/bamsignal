export const DISCOVER_TITLE = "Discover";
export const DISCOVER_SUBTEXT = "People you may enjoy getting to know";
export const DISCOVER_EMPTY_HEADLINE = "Let's find your people 💜";
export const DISCOVER_EMPTY_SUBTEXT = "Meaningful connections begin with curiosity.";

export const DISCOVER_WHY_APPEARS_TITLE = "Why this person appears";

export type DiscoverRelationshipFilter =
  | "all"
  | "same-city"
  | "trusted"
  | "voice-vibe"
  | "relationship"
  | "new-here"
  | "outstanding";

export const DISCOVER_RELATIONSHIP_FILTERS: { id: DiscoverRelationshipFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "same-city", label: "Same city" },
  { id: "trusted", label: "Trusted Members" },
  { id: "voice-vibe", label: "Voice Vibes" },
  { id: "relationship", label: "Relationship-focused" },
  { id: "new-here", label: "New here" },
  { id: "outstanding", label: "Outstanding profiles" }
];

/** Reserved for future products — not implemented. */
export type DiscoverFutureTier =
  | "circle-members"
  | "concierge-introductions"
  | "event-attendees"
  | "ai-ranking"
  | "shared-event-history";

export type DiscoverFutureConfig = {
  tier?: DiscoverFutureTier;
  circleId?: string;
  eventId?: string;
};

export const DISCOVER_FEED_BATCH = 10;
