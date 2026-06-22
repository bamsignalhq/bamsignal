/** Permanent journey milestone timeline — part of the Journey Archive. */

export const JOURNEY_MILESTONES_TITLE = "Journey Milestones";
export const ANNIVERSARY_TIMELINE_TITLE = "Anniversary Timeline";
export const CELEBRATING_YOUR_JOURNEY = "Celebrating Your Journey";

export type JourneyMilestoneId =
  | "met"
  | "relationship-formed"
  | "exclusive"
  | "engaged"
  | "married"
  | "first-anniversary"
  | "five-years-together"
  | "ten-years-together"
  | "twenty-years-together"
  | "silver-anniversary"
  | "golden-anniversary";

export type JourneyMilestoneDefinition = {
  id: JourneyMilestoneId;
  label: string;
  emoji: string;
  order: number;
};

export const JOURNEY_MILESTONE_DEFINITIONS: JourneyMilestoneDefinition[] = [
  { id: "met", label: "Met", emoji: "✨", order: 10 },
  { id: "relationship-formed", label: "Relationship Formed", emoji: "💜", order: 20 },
  { id: "exclusive", label: "Exclusive", emoji: "🤝", order: 30 },
  { id: "engaged", label: "Engaged", emoji: "💍", order: 40 },
  { id: "married", label: "Married", emoji: "💒", order: 50 },
  { id: "first-anniversary", label: "1st Anniversary", emoji: "🎉", order: 60 },
  { id: "five-years-together", label: "5 Years Together", emoji: "🌿", order: 70 },
  { id: "ten-years-together", label: "10 Years Together", emoji: "🌳", order: 80 },
  { id: "twenty-years-together", label: "20 Years Together", emoji: "🏡", order: 90 },
  { id: "silver-anniversary", label: "Silver Anniversary", emoji: "🥂", order: 100 },
  { id: "golden-anniversary", label: "Golden Anniversary", emoji: "👑", order: 110 }
];

export const JOURNEY_MILESTONE_LABELS: Record<JourneyMilestoneId, string> = Object.fromEntries(
  JOURNEY_MILESTONE_DEFINITIONS.map((item) => [item.id, item.label])
) as Record<JourneyMilestoneId, string>;

export const JOURNEY_MILESTONE_ORDER: Record<JourneyMilestoneId, number> = Object.fromEntries(
  JOURNEY_MILESTONE_DEFINITIONS.map((item) => [item.id, item.order])
) as Record<JourneyMilestoneId, number>;

export const JOURNEY_MILESTONE_FUTURE_CELEBRATIONS = [
  { id: "anniversary-gifts", label: "Anniversary gifts" },
  { id: "couple-events", label: "Couple events" },
  { id: "marriage-celebrations", label: "Marriage celebrations" },
  { id: "family-milestones", label: "Family milestones" }
] as const;

export function getJourneyMilestoneDefinition(id: JourneyMilestoneId) {
  return JOURNEY_MILESTONE_DEFINITIONS.find((item) => item.id === id) ?? null;
}

export function milestoneYearFromDate(isoDate: string): string {
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return "";
  return String(new Date(parsed).getUTCFullYear());
}
