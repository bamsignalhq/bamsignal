/** Signal Events™ — physical community architecture (reserved fulfillment). */

export const SIGNAL_EVENTS_TITLE = "Signal Events™";
export const SIGNAL_EVENTS_SUBCOPY =
  "Community gatherings — meet new people with warmth, dignity, and intention.";
export const COMMUNITY_LABEL = "Community";
export const MEET_NEW_PEOPLE_LABEL = "Meet New People";
export const DIASPORA_COMMUNITY_LABEL = "Diaspora Community";
export const CELEBRATING_LOVE_LABEL = "Celebrating Love";
export const LEGACY_COUPLES_LABEL = "Legacy Couples";

/** Reserved — never use in member-facing copy. */
export const SIGNAL_EVENTS_AVOID_COPY = [
  "Speed Dating",
  "Hookup Night",
  "Dating Event",
  "Party Crowd",
  "Leaderboard",
  "Top Customers"
] as const;

export const SIGNAL_EVENTS_RESERVED_COPY =
  "Architecture prepared. Ticketing, payments, and VIP fulfillment are not enabled yet.";
export const SIGNAL_EVENTS_FUTURE_READY_COPY =
  "Future ready — reserved for when communities are ready to gather in person.";

export type SignalEventTypeId =
  | "singles-dinner"
  | "brunch-meetup"
  | "coffee-meetup"
  | "professional-mixer"
  | "faith-values-evening"
  | "game-night"
  | "speed-introductions"
  | "relationship-workshop"
  | "couples-dinner"
  | "anniversary-celebration"
  | "legacy-family-gathering"
  | "diaspora-meetup";

export type SignalEventTypeDefinition = {
  id: SignalEventTypeId;
  label: string;
  description: string;
};

export const SIGNAL_EVENT_TYPES: SignalEventTypeDefinition[] = [
  {
    id: "singles-dinner",
    label: "Singles Dinner",
    description: "An elegant evening to meet new people — never a hookup night."
  },
  {
    id: "brunch-meetup",
    label: "Brunch Meetup",
    description: "Warm daytime community over brunch."
  },
  {
    id: "coffee-meetup",
    label: "Coffee Meetup",
    description: "Low-pressure coffee conversations in your city."
  },
  {
    id: "professional-mixer",
    label: "Professional Mixer",
    description: "Values-aligned professionals meeting with intention."
  },
  {
    id: "faith-values-evening",
    label: "Faith & Values Evening",
    description: "Community rooted in faith and shared values."
  },
  {
    id: "game-night",
    label: "Game Night",
    description: "Playful evenings that help people connect naturally."
  },
  {
    id: "speed-introductions",
    label: "Speed Introductions",
    description: "Thoughtful introductions — not speed dating."
  },
  {
    id: "relationship-workshop",
    label: "Relationship Workshop",
    description: "Reserved workshops for couples and intentional singles."
  },
  {
    id: "couples-dinner",
    label: "Couples Dinner",
    description: "Celebrating love — couples honored in community."
  },
  {
    id: "anniversary-celebration",
    label: "Anniversary Celebration",
    description: "Legacy couples celebrated locally with dignity."
  },
  {
    id: "legacy-family-gathering",
    label: "Legacy Family Gathering",
    description: "Family community without sensitive data."
  },
  {
    id: "diaspora-meetup",
    label: "Diaspora Meetup",
    description: "Diaspora community abroad — roots and belonging."
  }
];

export const SIGNAL_EVENT_TYPE_LABELS: Record<SignalEventTypeId, string> = Object.fromEntries(
  SIGNAL_EVENT_TYPES.map((event) => [event.id, event.label])
) as Record<SignalEventTypeId, string>;

export type SignalEventFutureCapability =
  | "ticketing"
  | "vip-events"
  | "premium-dinners"
  | "relationship-workshops"
  | "legacy-anniversary-celebrations"
  | "wedding-expos"
  | "family-events";

export const SIGNAL_EVENT_FUTURE_CAPABILITIES: {
  id: SignalEventFutureCapability;
  label: string;
  description: string;
}[] = [
  { id: "ticketing", label: "Ticketing", description: "Reserved — dignified event registration." },
  { id: "vip-events", label: "VIP events", description: "Reserved — intimate premium gatherings." },
  {
    id: "premium-dinners",
    label: "Premium dinners",
    description: "Reserved — elevated singles and couples dinners."
  },
  {
    id: "relationship-workshops",
    label: "Relationship workshops",
    description: "Reserved — guided workshops with care."
  },
  {
    id: "legacy-anniversary-celebrations",
    label: "Legacy anniversary celebrations",
    description: "Reserved — honoring enduring couples."
  },
  { id: "wedding-expos", label: "Wedding expos", description: "Reserved — celebration showcases." },
  { id: "family-events", label: "Family events", description: "Reserved — family-friendly gatherings." }
];

export type SignalEventArchitectureEntry = {
  id: string;
  citySlug: string;
  eventTypeId: SignalEventTypeId;
  title: string;
  scheduledAt: string;
  status: "reserved";
  note?: string;
};

export function signalEventTypeLabel(eventTypeId: SignalEventTypeId): string {
  return SIGNAL_EVENT_TYPE_LABELS[eventTypeId];
}

export function getSignalEventTypeDefinition(
  eventTypeId: SignalEventTypeId
): SignalEventTypeDefinition | undefined {
  return SIGNAL_EVENT_TYPES.find((event) => event.id === eventTypeId);
}
