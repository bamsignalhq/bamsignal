/** Relationship Health Alerts™ — support opportunities for consultants and admin. */

export const RELATIONSHIP_HEALTH_ALERTS_TITLE = "Relationship Health Alerts™";
export const RELATIONSHIP_HEALTH_ALERTS_SUBCOPY =
  "Journey Support when couples may benefit from thoughtful guidance — never surveillance.";
export const SUPPORT_OPPORTUNITY_LABEL = "Support Opportunity";
export const RELATIONSHIP_HEALTH_LABEL = "Relationship Health";
export const JOURNEY_SUPPORT_LABEL = "Journey Support";

export const RELATIONSHIP_HEALTH_ALERT_PURPOSE_COPY =
  "Support. Never surveillance. Never interference.";
export const RELATIONSHIP_HEALTH_ALERT_VISIBILITY_COPY =
  "Visible to consultants and admin only — never public.";
export const RELATIONSHIP_HEALTH_ALERT_RESERVED_COPY =
  "Architecture prepared. Relationship coaches, marriage mentors, and family advisors are not enabled yet.";

export type RelationshipHealthAlertType =
  | "needs-attention"
  | "distance-challenge"
  | "family-pressure"
  | "communication-concerns"
  | "relocation-stress";

export type RelationshipHealthAlertSeverity = "low" | "moderate" | "high";

export type RelationshipHealthAlertVisibility = "consultant-admin";

export type RelationshipHealthAlertStatus = "open" | "acknowledged" | "support-planned";

export type RelationshipHealthAlertDefinition = {
  id: RelationshipHealthAlertType;
  label: string;
  description: string;
};

export const RELATIONSHIP_HEALTH_ALERT_TYPES: RelationshipHealthAlertDefinition[] = [
  {
    id: "needs-attention",
    label: "Needs Attention",
    description: "A gentle support opportunity — consultant follow-up recommended."
  },
  {
    id: "distance-challenge",
    label: "Distance Challenge",
    description: "Cross-city or diaspora distance may benefit from Journey Support."
  },
  {
    id: "family-pressure",
    label: "Family Pressure",
    description: "Family alignment may need warm, private guidance."
  },
  {
    id: "communication-concerns",
    label: "Communication Concerns",
    description: "Communication rhythm may benefit from thoughtful support."
  },
  {
    id: "relocation-stress",
    label: "Relocation Stress",
    description: "Relocation planning may need diaspora-aware Journey Support."
  }
];

export const RELATIONSHIP_HEALTH_ALERT_TYPE_LABELS: Record<RelationshipHealthAlertType, string> =
  Object.fromEntries(
    RELATIONSHIP_HEALTH_ALERT_TYPES.map((item) => [item.id, item.label])
  ) as Record<RelationshipHealthAlertType, string>;

export const RELATIONSHIP_HEALTH_ALERT_SEVERITIES: {
  id: RelationshipHealthAlertSeverity;
  label: string;
  order: number;
}[] = [
  { id: "low", label: "Low", order: 10 },
  { id: "moderate", label: "Moderate", order: 20 },
  { id: "high", label: "High", order: 30 }
];

export const RELATIONSHIP_HEALTH_ALERT_SEVERITY_LABELS: Record<
  RelationshipHealthAlertSeverity,
  string
> = {
  low: "Low",
  moderate: "Moderate",
  high: "High"
};

export type RelationshipHealthAlertFutureAdvisor =
  | "relationship-coach"
  | "marriage-mentor"
  | "family-advisor";

export const RELATIONSHIP_HEALTH_ALERT_FUTURE_ADVISORS: {
  id: RelationshipHealthAlertFutureAdvisor;
  label: string;
  description: string;
}[] = [
  {
    id: "relationship-coach",
    label: "Relationship coaches",
    description: "Reserved — coaching support for communication and connection."
  },
  {
    id: "marriage-mentor",
    label: "Marriage mentors",
    description: "Reserved — mentorship for engaged and pre-marriage journeys."
  },
  {
    id: "family-advisor",
    label: "Family advisors",
    description: "Reserved — family alignment and values-centered guidance."
  }
];

export function healthAlertTypeLabel(alertType: RelationshipHealthAlertType): string {
  return RELATIONSHIP_HEALTH_ALERT_TYPE_LABELS[alertType];
}

export function healthAlertSeverityLabel(severity: RelationshipHealthAlertSeverity): string {
  return RELATIONSHIP_HEALTH_ALERT_SEVERITY_LABELS[severity];
}

export function getHealthAlertDefinition(
  alertType: RelationshipHealthAlertType
): RelationshipHealthAlertDefinition | undefined {
  return RELATIONSHIP_HEALTH_ALERT_TYPES.find((item) => item.id === alertType);
}

export function healthAlertSeverityOrder(severity: RelationshipHealthAlertSeverity): number {
  return RELATIONSHIP_HEALTH_ALERT_SEVERITIES.find((item) => item.id === severity)?.order ?? 0;
}
