/** Surprise & Delight™ — celebration architecture (reserved). Gifting not implemented. */

export const SURPRISE_DELIGHT_TITLE = "Surprise & Delight™";
export const SURPRISE_DELIGHT_SUBCOPY =
  "Thoughtful Moments for enduring journeys — warm celebrations without promotions or campaigns.";
export const CELEBRATIONS_LABEL = "Celebrations";
export const THOUGHTFUL_MOMENTS_LABEL = "Thoughtful Moments";
export const JOURNEY_MEMORIES_LABEL = "Journey Memories";

export const SURPRISE_DELIGHT_ARCHITECTURE_COPY =
  "Architecture prepared for thoughtful celebrations. Gifting and fulfillment are not enabled.";
export const SURPRISE_DELIGHT_RESERVED_COPY =
  "Architecture prepared. Premium concierge experiences are not enabled yet.";

/** Gifting must remain disabled until explicitly implemented. */
export const SURPRISE_DELIGHT_GIFTING_ENABLED = false;

export type SurpriseEventKind =
  | "anniversary-gifts"
  | "flowers"
  | "couple-dinners"
  | "wedding-congratulations"
  | "legacy-events";

export type SurpriseEventDefinition = {
  id: SurpriseEventKind;
  label: string;
  description: string;
};

export const SURPRISE_DELIGHT_PREPARED_EVENTS: SurpriseEventDefinition[] = [
  {
    id: "anniversary-gifts",
    label: "Anniversary gifts",
    description: "Reserved — thoughtful anniversary recognition for Legacy Archive couples."
  },
  {
    id: "flowers",
    label: "Flowers",
    description: "Reserved — flowers delivered with care and journey context."
  },
  {
    id: "couple-dinners",
    label: "Couple dinners",
    description: "Reserved — intimate dinners celebrating relationship milestones."
  },
  {
    id: "wedding-congratulations",
    label: "Wedding congratulations",
    description: "Reserved — warm congratulations when couples marry."
  },
  {
    id: "legacy-events",
    label: "Legacy events",
    description: "Reserved — legacy celebrations for enduring BamSignal journeys."
  }
];

export const SURPRISE_EVENT_LABELS: Record<SurpriseEventKind, string> = Object.fromEntries(
  SURPRISE_DELIGHT_PREPARED_EVENTS.map((event) => [event.id, event.label])
) as Record<SurpriseEventKind, string>;

export type SurpriseDelightFutureCapability = "premium-concierge-experiences";

export const SURPRISE_DELIGHT_FUTURE_CAPABILITIES: {
  id: SurpriseDelightFutureCapability;
  label: string;
  description: string;
}[] = [
  {
    id: "premium-concierge-experiences",
    label: "Premium concierge experiences",
    description: "Reserved — elevated celebrations coordinated with Signal Concierge."
  }
];

export type LegacyCelebrationTimelineEntry = {
  id: string;
  eventId: SurpriseEventKind;
  label: string;
  milestoneAt: string;
  note?: string;
  /** Reserved — no gifting fulfillment yet. */
  status: "reserved";
};

export const LEGACY_CELEBRATION_ARCHITECTURE_SEED: LegacyCelebrationTimelineEntry[] = [
  {
    id: "lcd_seed_wedding",
    eventId: "wedding-congratulations",
    label: "Wedding congratulations",
    milestoneAt: "2030-04-18T00:00:00.000Z",
    note: "Celebrating progress — thoughtful moment reserved.",
    status: "reserved"
  },
  {
    id: "lcd_seed_anniversary",
    eventId: "anniversary-gifts",
    label: "Anniversary gifts",
    milestoneAt: "2031-04-18T00:00:00.000Z",
    note: "First anniversary — Journey Memories preserved.",
    status: "reserved"
  },
  {
    id: "lcd_seed_dinner",
    eventId: "couple-dinners",
    label: "Couple dinners",
    milestoneAt: "2032-06-01T00:00:00.000Z",
    status: "reserved"
  },
  {
    id: "lcd_seed_flowers",
    eventId: "flowers",
    label: "Flowers",
    milestoneAt: "2033-02-14T00:00:00.000Z",
    status: "reserved"
  },
  {
    id: "lcd_seed_legacy",
    eventId: "legacy-events",
    label: "Legacy events",
    milestoneAt: "2035-04-18T00:00:00.000Z",
    note: "Five years together — legacy celebration reserved.",
    status: "reserved"
  }
];

export function getSurpriseEventDefinition(
  eventId: SurpriseEventKind
): SurpriseEventDefinition | undefined {
  return SURPRISE_DELIGHT_PREPARED_EVENTS.find((event) => event.id === eventId);
}

export function surpriseEventLabel(eventId: SurpriseEventKind): string {
  return SURPRISE_EVENT_LABELS[eventId];
}

export function assertSurpriseDelightGiftingDisabled(): void {
  if (SURPRISE_DELIGHT_GIFTING_ENABLED) {
    throw new Error("Surprise & Delight gifting is not enabled");
  }
}
