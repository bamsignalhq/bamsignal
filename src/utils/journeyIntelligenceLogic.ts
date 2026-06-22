import {
  JOURNEY_INTELLIGENCE_CONSULTANT_METRIC_LABELS,
  JOURNEY_INTELLIGENCE_METRIC_HINTS,
  JOURNEY_INTELLIGENCE_METRIC_LABELS,
  type JourneyIntelligenceMetricId
} from "../constants/journeyIntelligence";
import {
  CORRIDOR_ORIGIN_LABELS,
  PREPARED_DIASPORA_CORRIDORS,
  corridorRouteLabel
} from "../constants/diasporaCorridors";
import { PREPARED_LEGACY_CITIES } from "../constants/legacyCities";
import type { ConciergeIntroductionOutcome } from "../constants/conciergeConsultant";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { IntroductionRecord } from "../types/conciergeIntroduction";
import type {
  JourneyIntelligenceConsultantInsight,
  JourneyIntelligenceLegacyGrowthSignal,
  JourneyIntelligenceMetric,
  JourneyIntelligenceRegionalInsights,
  JourneyIntelligenceRegionalRow
} from "../types/journeyIntelligence";
import { getApplicationReviewSummaryForMember } from "./ApplicationApprovalEngine";
import { portfolioSuccessStories } from "./conciergeConsultantMetrics";

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

const RELATIONSHIP_OUTCOMES = new Set<ConciergeIntroductionOutcome>([
  "relationship",
  "exclusive",
  "completed"
]);

const DESTINATION_CITY_HINTS: Record<string, string> = {
  london: "united-kingdom",
  toronto: "canada",
  houston: "united-states",
  atlanta: "united-states",
  dubai: "uae",
  johannesburg: "south-africa",
  sydney: "australia",
  berlin: "germany",
  dublin: "ireland",
  paris: "france",
  amsterdam: "netherlands"
};

const NIGERIA_CITIES = new Set([
  "lagos",
  "abuja",
  "port harcourt",
  "ibadan",
  "kano",
  "enugu",
  "benin"
]);

function countApplicationsReceived(members: ConciergeMemberRecord[]): number {
  return members.filter(
    (member) =>
      member.status === "applied" ||
      member.status === "under-review" ||
      member.timeline.some((event) => event.type === "application-received")
  ).length;
}

function countApplicationsApproved(members: ConciergeMemberRecord[]): number {
  return members.filter((member) => {
    if (APPROVED_MEMBER_STATUSES.has(member.status)) return true;
    return getApplicationReviewSummaryForMember(member).status === "approved";
  }).length;
}

function countConsultationsCompleted(members: ConciergeMemberRecord[]): number {
  return members.filter((member) =>
    member.timeline.some((event) => event.type === "consultation-completed")
  ).length;
}

function countIntroductionsCreated(
  members: ConciergeMemberRecord[],
  introductions: IntroductionRecord[]
): number {
  const memberIntroCount = members.reduce((sum, member) => sum + member.introductions.length, 0);
  return Math.max(introductions.length, memberIntroCount);
}

function countMutualAcceptances(introductions: IntroductionRecord[]): number {
  return introductions.filter((record) => record.bothConsented).length;
}

function countRelationshipsFormed(members: ConciergeMemberRecord[]): number {
  const fromStatus = members.filter((member) => member.status === "relationship").length;
  const fromIntros = members
    .flatMap((member) => member.introductions)
    .filter((intro) => RELATIONSHIP_OUTCOMES.has(intro.outcome)).length;
  return Math.max(fromStatus, fromIntros);
}

function countExclusiveRelationships(members: ConciergeMemberRecord[]): number {
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

function countSuccessStories(members: ConciergeMemberRecord[]): number {
  return portfolioSuccessStories(members).length;
}

export function buildJourneyIntelligenceMetrics(
  members: ConciergeMemberRecord[],
  introductions: IntroductionRecord[]
): JourneyIntelligenceMetric[] {
  const counts: Record<JourneyIntelligenceMetricId, number> = {
    "applications-received": countApplicationsReceived(members),
    "applications-approved": countApplicationsApproved(members),
    "consultations-completed": countConsultationsCompleted(members),
    "introductions-created": countIntroductionsCreated(members, introductions),
    "mutual-acceptances": countMutualAcceptances(introductions),
    "relationships-formed": countRelationshipsFormed(members),
    "exclusive-relationships": countExclusiveRelationships(members),
    engagements: countEngagements(members),
    marriages: countMarriages(members),
    "legacy-families": countLegacyFamilies(members),
    "success-stories": countSuccessStories(members)
  };

  return (Object.keys(counts) as JourneyIntelligenceMetricId[]).map((id) => ({
    id,
    label: JOURNEY_INTELLIGENCE_METRIC_LABELS[id],
    count: counts[id],
    hint: JOURNEY_INTELLIGENCE_METRIC_HINTS[id]
  }));
}

function consultantNarrative(insight: Omit<JourneyIntelligenceConsultantInsight, "narrative">): string {
  if (insight.marriages > 0) {
    return `${insight.name} has stewarded ${insight.marriages} marriage${insight.marriages === 1 ? "" : "s"} with dignity.`;
  }
  if (insight.relationships > 0) {
    return `${insight.name} supports ${insight.relationships} active relationship journeys.`;
  }
  if (insight.consultations > 0) {
    return `${insight.name} completed ${insight.consultations} consultations — depth over volume.`;
  }
  return `${insight.name} is ready for the next stewarded journey.`;
}

function consultantIdForMember(member: ConciergeMemberRecord): string {
  return member.currentConsultantId ?? member.assignedConsultantId ?? "unassigned";
}

function consultantNameForMember(member: ConciergeMemberRecord): string {
  return member.assignedConsultantName ?? "Unassigned";
}

export function buildConsultantInsights(members: ConciergeMemberRecord[]): JourneyIntelligenceConsultantInsight[] {
  const byConsultant = new Map<
    string,
    Omit<JourneyIntelligenceConsultantInsight, "narrative">
  >();

  for (const member of members) {
    const consultantId = consultantIdForMember(member);
    const existing = byConsultant.get(consultantId) ?? {
      id: consultantId,
      name: consultantNameForMember(member),
      consultations: 0,
      introductions: 0,
      relationships: 0,
      engagements: 0,
      marriages: 0,
      legacyFamilies: 0
    };

    if (member.timeline.some((event) => event.type === "consultation-completed")) {
      existing.consultations += 1;
    }
    existing.introductions += member.introductions.length;
    if (member.status === "relationship") existing.relationships += 1;
    if (member.status === "engaged") existing.engagements += 1;
    if (member.status === "married" || member.status === "legacy-archive") existing.marriages += 1;
    if (
      (member.relationshipLegacyIndex?.legacyFamily?.childrenCount ?? 0) > 0 ||
      Boolean(member.journeyArchive?.isLegacyArchive && member.relationshipLegacyIndex?.legacyFamily)
    ) {
      existing.legacyFamilies += 1;
    }

    byConsultant.set(consultantId, existing);
  }

  return [...byConsultant.values()]
    .filter((insight) => insight.id !== "unassigned" || insight.consultations > 0)
    .sort((a, b) => b.consultations + b.introductions - (a.consultations + a.introductions))
    .map((insight) => ({
      ...insight,
      narrative: consultantNarrative(insight)
    }));
}

function normalizeCityKey(city: string): string {
  return city.trim().toLowerCase();
}

function countryForCity(city: string): string {
  const key = normalizeCityKey(city);
  if (!key) return "Unspecified";
  if (NIGERIA_CITIES.has(key) || key.includes("nigeria")) return "Nigeria";
  if (key === "london") return "United Kingdom";
  if (key === "toronto") return "Canada";
  if (key === "houston" || key === "atlanta" || key.includes("usa")) return "United States";
  if (key === "dubai") return "United Arab Emirates";
  if (key === "johannesburg") return "South Africa";
  if (key === "sydney") return "Australia";
  if (key === "accra") return "Ghana";
  if (key === "nairobi") return "Kenya";
  return "International";
}

function topRegionalRows(counts: Map<string, number>, limit = 8): JourneyIntelligenceRegionalRow[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({
      id: `regional_${label.toLowerCase().replace(/\s+/g, "_")}`,
      label,
      count
    }));
}

export function buildRegionalInsights(members: ConciergeMemberRecord[]): JourneyIntelligenceRegionalInsights {
  const cityCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();
  const corridorCounts = new Map<string, number>();
  const legacyCityCounts = new Map<string, number>();

  for (const member of members) {
    const city = member.aboutYou.city?.trim();
    if (city) {
      cityCounts.set(city, (cityCounts.get(city) ?? 0) + 1);
      const country = countryForCity(city);
      countryCounts.set(country, (countryCounts.get(country) ?? 0) + 1);

      const cityKey = normalizeCityKey(city);
      const destinationId = DESTINATION_CITY_HINTS[cityKey];
      if (destinationId) {
        const corridor = PREPARED_DIASPORA_CORRIDORS.find(
          (item) => item.originId === "nigeria" && item.destinationId === destinationId
        );
        if (corridor) {
          const label = corridorRouteLabel(corridor.originId, corridor.destinationId);
          corridorCounts.set(label, (corridorCounts.get(label) ?? 0) + 1);
        }
      }

      const legacyCity = PREPARED_LEGACY_CITIES.find((item) => item.slug === cityKey);
      if (legacyCity) {
        legacyCityCounts.set(legacyCity.title, (legacyCityCounts.get(legacyCity.title) ?? 0) + 1);
      }
    }
  }

  if (corridorCounts.size === 0) {
    for (const corridor of PREPARED_DIASPORA_CORRIDORS.slice(0, 6)) {
      const label = corridorRouteLabel(corridor.originId, corridor.destinationId);
      corridorCounts.set(
        label,
        corridor.legacyFamiliesCount + corridor.successStoriesCount
      );
    }
  }

  if (legacyCityCounts.size === 0) {
    for (const city of PREPARED_LEGACY_CITIES.slice(0, 6)) {
      legacyCityCounts.set(city.title, city.communityLevel === "legacy-community" ? 2 : 1);
    }
  }

  return {
    cities: topRegionalRows(cityCounts),
    countries: topRegionalRows(countryCounts),
    diasporaCorridors: topRegionalRows(corridorCounts).map((row) => ({
      ...row,
      hint: `${CORRIDOR_ORIGIN_LABELS.nigeria} pathways`
    })),
    legacyCities: topRegionalRows(legacyCityCounts).map((row) => ({
      ...row,
      hint: "Legacy city journeys"
    }))
  };
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

function growthDirection(recent: number, prior: number): JourneyIntelligenceLegacyGrowthSignal["direction"] {
  if (recent > prior) return "up";
  if (recent < prior) return "down";
  return "steady";
}

function growthNarrative(label: string, recent: number, prior: number): string {
  if (recent > prior) {
    return `${label} are growing — ${recent} recorded in the last 90 days.`;
  }
  if (recent < prior) {
    return `${label} are quieter — stewards are prioritizing depth and consent.`;
  }
  return `${label} held steady — consistent care across journeys.`;
}

export function buildLegacyGrowthSignals(
  members: ConciergeMemberRecord[]
): JourneyIntelligenceLegacyGrowthSignal[] {
  const now = Date.now();
  const recentStart = now - 90 * 24 * 60 * 60 * 1000;
  const priorStart = now - 180 * 24 * 60 * 60 * 1000;

  const signals: Array<{
    id: string;
    label: string;
    types: ConciergeMemberRecord["timeline"][number]["type"][];
  }> = [
    { id: "legacy-families", label: JOURNEY_INTELLIGENCE_CONSULTANT_METRIC_LABELS.legacyFamilies, types: ["engagement", "marriage"] },
    { id: "success-stories", label: "Success stories", types: ["success-story"] }
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

export function assertJourneyIntelligenceExcludesSalesLanguage(bundle: {
  metrics: JourneyIntelligenceMetric[];
}): boolean {
  const serialized = JSON.stringify(bundle).toLowerCase();
  return !["revenue", "sales", "conversion rate", "funnel"].some((term) => serialized.includes(term));
}
