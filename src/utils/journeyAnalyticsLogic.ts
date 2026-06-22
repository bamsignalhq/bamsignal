import {
  JOURNEY_ANALYTICS_FORBIDDEN_TERMS,
  JOURNEY_ANALYTICS_METRIC_HINTS,
  JOURNEY_ANALYTICS_METRIC_LABELS,
  type JourneyAnalyticsMetricId
} from "../constants/journeyAnalytics";
import type { ConciergeIntroductionOutcome } from "../constants/conciergeConsultant";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { IntroductionRecord } from "../types/conciergeIntroduction";
import type {
  JourneyAnalyticsBundle,
  JourneyAnalyticsGrowthSignal,
  JourneyAnalyticsMetric,
  JourneyAnalyticsOutcome,
  JourneyAnalyticsTrendPoint
} from "../types/journeyAnalytics";
import { getApplicationReviewSummaryForMember } from "./ApplicationApprovalEngine";

const RELATIONSHIP_OUTCOMES = new Set<ConciergeIntroductionOutcome>([
  "relationship",
  "exclusive",
  "completed"
]);

const APPROVED_MEMBER_STATUSES = new Set<ConciergeMemberRecord["status"]>([
  "accepted",
  "active-search",
  "introductions-in-progress",
  "relationship",
  "matched",
  "exclusive",
  "engaged",
  "married",
  "legacy-archive",
  "consultation-scheduled"
]);

function countApplications(members: ConciergeMemberRecord[]): number {
  return members.filter(
    (member) =>
      member.status === "applied" ||
      member.status === "under-review" ||
      member.timeline.some((event) => event.type === "application-received")
  ).length;
}

function countConsultations(members: ConciergeMemberRecord[]): number {
  return members.filter((member) =>
    member.timeline.some((event) => event.type === "consultation-completed")
  ).length;
}

function countApprovals(members: ConciergeMemberRecord[]): number {
  return members.filter((member) => {
    if (APPROVED_MEMBER_STATUSES.has(member.status)) return true;
    const summary = getApplicationReviewSummaryForMember(member);
    return summary.status === "approved";
  }).length;
}

function countIntroductions(members: ConciergeMemberRecord[], introductions: IntroductionRecord[]): number {
  const memberIntroCount = members.reduce((sum, member) => sum + member.introductions.length, 0);
  return Math.max(introductions.length, memberIntroCount);
}

function countRelationships(members: ConciergeMemberRecord[]): number {
  const fromStatus = members.filter((member) => member.status === "relationship").length;
  const fromIntros = members
    .flatMap((member) => member.introductions)
    .filter((intro) => RELATIONSHIP_OUTCOMES.has(intro.outcome)).length;
  return Math.max(fromStatus, fromIntros);
}

function countExclusive(members: ConciergeMemberRecord[]): number {
  const fromStatus = members.filter((member) => member.status === "exclusive").length;
  const fromIntros = members
    .flatMap((member) => member.introductions)
    .filter((intro) => intro.outcome === "exclusive").length;
  return Math.max(fromStatus, fromIntros);
}

function countEngagements(members: ConciergeMemberRecord[]): number {
  const fromStatus = members.filter((member) => member.status === "engaged").length;
  const fromIntros = members
    .flatMap((member) => member.introductions)
    .filter((intro) => intro.outcome === "engaged").length;
  return Math.max(fromStatus, fromIntros);
}

function countMarriages(members: ConciergeMemberRecord[]): number {
  const fromStatus = members.filter(
    (member) => member.status === "married" || member.status === "legacy-archive"
  ).length;
  const fromIntros = members
    .flatMap((member) => member.introductions)
    .filter((intro) => intro.outcome === "married").length;
  return Math.max(fromStatus, fromIntros);
}

function countLegacyFamilies(members: ConciergeMemberRecord[]): number {
  return members.filter(
    (member) =>
      (member.relationshipLegacyIndex?.legacyFamily?.childrenCount ?? 0) > 0 ||
      Boolean(member.journeyArchive?.isLegacyArchive && member.relationshipLegacyIndex?.legacyFamily)
  ).length;
}

function buildMetrics(members: ConciergeMemberRecord[], introductions: IntroductionRecord[]): JourneyAnalyticsMetric[] {
  const counts: Record<JourneyAnalyticsMetricId, number> = {
    applications: countApplications(members),
    consultations: countConsultations(members),
    approvals: countApprovals(members),
    introductions: countIntroductions(members, introductions),
    relationships: countRelationships(members),
    exclusive: countExclusive(members),
    engagements: countEngagements(members),
    marriages: countMarriages(members),
    legacyFamilies: countLegacyFamilies(members)
  };

  return (Object.keys(counts) as JourneyAnalyticsMetricId[]).map((id) => ({
    id,
    label: JOURNEY_ANALYTICS_METRIC_LABELS[id],
    count: counts[id],
    hint: JOURNEY_ANALYTICS_METRIC_HINTS[id]
  }));
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric"
  });
}

function buildTrends(members: ConciergeMemberRecord[]): JourneyAnalyticsTrendPoint[] {
  const now = new Date();
  const buckets = new Map<string, number>();

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    buckets.set(monthKey(date), 0);
  }

  for (const member of members) {
    for (const event of member.timeline) {
      if (
        event.type !== "consultation-completed" &&
        event.type !== "introduction" &&
        event.type !== "relationship-update" &&
        event.type !== "success-story"
      ) {
        continue;
      }
      const key = monthKey(new Date(event.at));
      if (!buckets.has(key)) continue;
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  return [...buckets.entries()].map(([key, value]) => ({
    id: `trend_${key}`,
    label: monthLabel(key),
    value,
    period: key
  }));
}

function buildOutcomes(metrics: JourneyAnalyticsMetric[]): JourneyAnalyticsOutcome[] {
  const byId = Object.fromEntries(metrics.map((metric) => [metric.id, metric.count])) as Record<
    JourneyAnalyticsMetricId,
    number
  >;

  return [
    {
      id: "journey-starts",
      label: "Journey starts",
      count: byId.applications,
      narrative: "Members who trusted BamSignal with their story."
    },
    {
      id: "welcomed",
      label: "Welcomed in",
      count: byId.approvals,
      narrative: "Applications approved with human review."
    },
    {
      id: "connected",
      label: "Connected",
      count: byId.introductions,
      narrative: "Introductions made with intention."
    },
    {
      id: "rooted",
      label: "Relationships rooted",
      count: byId.relationships,
      narrative: "Couples moving beyond first conversations."
    },
    {
      id: "committed",
      label: "Commitments",
      count: byId.engagements + byId.marriages,
      narrative: "Engagements and marriages celebrated."
    },
    {
      id: "legacy",
      label: "Legacy families",
      count: byId.legacyFamilies,
      narrative: "Families registered for generations to come."
    }
  ];
}

function eventsInWindow(
  members: ConciergeMemberRecord[],
  startMs: number,
  endMs: number,
  types: ConciergeMemberRecord["timeline"][number]["type"][]
): number {
  let count = 0;
  for (const member of members) {
    for (const event of member.timeline) {
      if (!types.includes(event.type)) continue;
      const at = new Date(event.at).getTime();
      if (at >= startMs && at < endMs) count += 1;
    }
  }
  return count;
}

function growthDirection(recent: number, prior: number): JourneyAnalyticsGrowthSignal["direction"] {
  if (recent > prior) return "up";
  if (recent < prior) return "down";
  return "steady";
}

function growthNarrative(label: string, recent: number, prior: number): string {
  if (recent > prior) {
    return `${label} momentum is building — ${recent} in the last 90 days.`;
  }
  if (recent < prior) {
    return `${label} pace is quieter — consultants are focusing on depth over volume.`;
  }
  return `${label} held steady — consistent care across journeys.`;
}

function buildGrowth(members: ConciergeMemberRecord[]): JourneyAnalyticsGrowthSignal[] {
  const now = Date.now();
  const recentStart = now - 90 * 24 * 60 * 60 * 1000;
  const priorStart = now - 180 * 24 * 60 * 60 * 1000;

  const signals: Array<{
    id: string;
    label: string;
    types: ConciergeMemberRecord["timeline"][number]["type"][];
  }> = [
    { id: "consultations", label: "Consultations", types: ["consultation-completed"] },
    { id: "introductions", label: "Introductions", types: ["introduction"] },
    { id: "relationships", label: "Relationship updates", types: ["relationship-update"] }
  ];

  return signals.map((signal) => {
    const recent = eventsInWindow(members, recentStart, now, signal.types);
    const prior = eventsInWindow(members, priorStart, recentStart, signal.types);
    return {
      id: signal.id,
      label: signal.label,
      recent,
      prior,
      direction: growthDirection(recent, prior),
      narrative: growthNarrative(signal.label, recent, prior)
    };
  });
}

export function buildJourneyAnalyticsBundle(input: {
  members: ConciergeMemberRecord[];
  introductions: IntroductionRecord[];
}): JourneyAnalyticsBundle {
  const metrics = buildMetrics(input.members, input.introductions);

  return {
    metrics,
    trends: buildTrends(input.members),
    outcomes: buildOutcomes(metrics),
    growth: buildGrowth(input.members),
    updatedAt: new Date().toISOString()
  };
}

export function assertJourneyAnalyticsExcludesSalesMetrics(bundle: JourneyAnalyticsBundle): boolean {
  const serialized = JSON.stringify(bundle).toLowerCase();
  return !JOURNEY_ANALYTICS_FORBIDDEN_TERMS.some((term) => serialized.includes(term));
}
