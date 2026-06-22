import {
  HOUSE_INSTITUTE_DATA_PIPELINE_TAGLINE,
  HOUSE_PIPELINE_BRIDGE_COPY,
  HOUSE_PIPELINE_DATA_SOURCE_LABELS,
  HOUSE_PIPELINE_DATA_SOURCES,
  HOUSE_PIPELINE_RESEARCH_OUTPUTS,
  type HousePipelineDataSourceId,
  type HousePipelineTrendCategoryId
} from "../constants/houseInstituteDataPipeline";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { IntroductionRecord } from "../types/conciergeIntroduction";
import type {
  HouseInstituteDataPipelineBundle,
  HousePipelineDataSource,
  HousePipelineInstitutionInsight,
  HousePipelineLegacyResearch,
  HousePipelineObservatoryFeedItem,
  HousePipelineTrendCategory,
  HousePipelineTrendRow
} from "../types/houseInstituteDataPipeline";
import {
  buildJourneyIntelligenceMetrics,
  buildLegacyGrowthSignals,
  buildRegionalInsights
} from "./journeyIntelligenceLogic";

const FORBIDDEN_SERIALIZED_PATTERNS = [
  /"journeyId"/i,
  /"memberId"/i,
  /"email"/i,
  /"phone"/i,
  /"firstName"/i,
  /"lastName"/i,
  /"consultantNotes"/i,
  /"privateNotes"/i,
  /BS-JR-\d{4}-\d+/,
  /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
] as const;

function metricCount(
  members: ConciergeMemberRecord[],
  introductions: IntroductionRecord[],
  metricId: string
): number {
  const metrics = buildJourneyIntelligenceMetrics(members, introductions);
  return metrics.find((metric) => metric.id === metricId)?.count ?? 0;
}

function buildDataSources(
  members: ConciergeMemberRecord[],
  introductions: IntroductionRecord[]
): HousePipelineDataSource[] {
  const regional = buildRegionalInsights(members);
  const communityGrowth = regional.cities.reduce((sum, row) => sum + row.count, 0);
  const diasporaTotal = regional.diasporaCorridors.reduce((sum, row) => sum + row.count, 0);

  const counts: Record<HousePipelineDataSourceId, number> = {
    applications: metricCount(members, introductions, "applications-received"),
    consultations: metricCount(members, introductions, "consultations-completed"),
    introductions: metricCount(members, introductions, "introductions-created"),
    relationships: metricCount(members, introductions, "relationships-formed"),
    engagements: metricCount(members, introductions, "engagements"),
    marriages: metricCount(members, introductions, "marriages"),
    "legacy-families": metricCount(members, introductions, "legacy-families"),
    "success-stories": metricCount(members, introductions, "success-stories"),
    "community-growth": communityGrowth,
    "diaspora-corridors": diasporaTotal
  };

  return HOUSE_PIPELINE_DATA_SOURCES.map((source) => ({
    id: source.id,
    label: HOUSE_PIPELINE_DATA_SOURCE_LABELS[source.id],
    count: counts[source.id],
    hint: source.hint
  }));
}

function regionalRows(
  rows: { id: string; label: string; count: number; hint?: string }[],
  limit = 5
): HousePipelineTrendRow[] {
  return [...rows]
    .sort((left, right) => right.count - left.count)
    .slice(0, limit)
    .map((row) => ({
      id: row.id,
      label: row.label,
      count: row.count,
      hint: row.hint
    }));
}

function buildTrendCategories(
  members: ConciergeMemberRecord[],
  introductions: IntroductionRecord[]
): HousePipelineTrendCategory[] {
  const regional = buildRegionalInsights(members);
  const legacyGrowth = buildLegacyGrowthSignals(members);

  const relationshipRows: HousePipelineTrendRow[] = [
    {
      id: "mutual-acceptances",
      label: "Mutual acceptances",
      count: metricCount(members, introductions, "mutual-acceptances")
    },
    {
      id: "relationships-formed",
      label: "Relationships formed",
      count: metricCount(members, introductions, "relationships-formed")
    },
    {
      id: "exclusive-relationships",
      label: "Exclusive relationships",
      count: metricCount(members, introductions, "exclusive-relationships")
    },
    {
      id: "engagements",
      label: "Engagements",
      count: metricCount(members, introductions, "engagements")
    },
    {
      id: "marriages",
      label: "Marriages",
      count: metricCount(members, introductions, "marriages")
    }
  ];

  const familyRows: HousePipelineTrendRow[] = [
    {
      id: "legacy-families",
      label: "Legacy families",
      count: metricCount(members, introductions, "legacy-families")
    },
    {
      id: "success-stories",
      label: "Success stories",
      count: metricCount(members, introductions, "success-stories")
    },
    {
      id: "marriages",
      label: "Marriages",
      count: metricCount(members, introductions, "marriages")
    }
  ];

  const diasporaRows = regionalRows(regional.diasporaCorridors);
  const communityRows = regionalRows(regional.cities);
  const legacyRows: HousePipelineTrendRow[] = [
    ...regionalRows(regional.legacyCities),
    ...legacyGrowth.map((signal) => ({
      id: signal.id,
      label: signal.label,
      count: signal.recent,
      hint: signal.direction === "up" ? "Growing" : signal.direction === "down" ? "Cooling" : "Steady"
    }))
  ];

  const categoryRows: Record<HousePipelineTrendCategoryId, HousePipelineTrendRow[]> = {
    "relationship-trends": relationshipRows,
    "family-trends": familyRows,
    "diaspora-trends": diasporaRows,
    "community-trends": communityRows,
    "legacy-trends": legacyRows
  };

  return HOUSE_PIPELINE_RESEARCH_OUTPUTS.map((output) => {
    const rows = categoryRows[output.id];
    return {
      id: output.id,
      title: output.title,
      description: output.description,
      rows,
      totalCount: rows.reduce((sum, row) => sum + row.count, 0)
    };
  });
}

function buildInstitutionInsights(
  members: ConciergeMemberRecord[],
  introductions: IntroductionRecord[]
): HousePipelineInstitutionInsight[] {
  const relationships = metricCount(members, introductions, "relationships-formed");
  const marriages = metricCount(members, introductions, "marriages");
  const legacyFamilies = metricCount(members, introductions, "legacy-families");
  const regional = buildRegionalInsights(members);
  const corridorCount = regional.diasporaCorridors.filter((row) => row.count > 0).length;

  return [
    {
      id: "journey-to-research",
      title: "Journey to research bridge",
      summary: HOUSE_PIPELINE_BRIDGE_COPY,
      metricLabel: "Data sources",
      metricCount: HOUSE_PIPELINE_DATA_SOURCES.length
    },
    {
      id: "relationship-outcomes",
      title: "Relationship outcomes",
      summary: `${relationships} relationships formed in aggregate — stewarded, never scored.`,
      metricLabel: "Relationships",
      metricCount: relationships
    },
    {
      id: "marriage-outcomes",
      title: "Marriage outcomes",
      summary: `${marriages} marriages registered for institutional research — anonymous only.`,
      metricLabel: "Marriages",
      metricCount: marriages
    },
    {
      id: "legacy-outcomes",
      title: "Legacy outcomes",
      summary: `${legacyFamilies} legacy families inform family and legacy trend research.`,
      metricLabel: "Legacy families",
      metricCount: legacyFamilies
    },
    {
      id: "diaspora-research",
      title: "Diaspora research",
      summary: `${corridorCount} active diaspora corridors in the anonymous research view.`,
      metricLabel: "Corridors",
      metricCount: corridorCount
    }
  ];
}

function buildLegacyResearch(
  members: ConciergeMemberRecord[],
  introductions: IntroductionRecord[]
): HousePipelineLegacyResearch {
  const regional = buildRegionalInsights(members);
  const legacyFamilies = metricCount(members, introductions, "legacy-families");
  const successStories = metricCount(members, introductions, "success-stories");
  const marriages = metricCount(members, introductions, "marriages");
  const rows = regionalRows(regional.legacyCities, 6);

  const narrative =
    legacyFamilies > 0
      ? `${legacyFamilies} legacy families across ${rows.length || "several"} city aggregates inform House Institute legacy research.`
      : "Legacy research awaits the first registered legacy families — architecture is ready.";

  return {
    legacyFamilies,
    successStories,
    marriages,
    rows,
    narrative
  };
}

function buildObservatoryFeed(
  trendCategories: HousePipelineTrendCategory[],
  updatedAt: string
): HousePipelineObservatoryFeedItem[] {
  return trendCategories
    .flatMap((category) =>
      category.rows.slice(0, 2).map((row) => ({
        id: `${category.id}-${row.id}`,
        categoryId: category.id,
        headline: `${category.title}: ${row.label}`,
        summary: `${row.count} in aggregate — ${category.description}`,
        count: row.count,
        observedAt: updatedAt
      }))
    )
    .slice(0, 8);
}

export function buildHouseInstituteDataPipelineBundle(input: {
  members: ConciergeMemberRecord[];
  introductions: IntroductionRecord[];
}): HouseInstituteDataPipelineBundle {
  const updatedAt = new Date().toISOString();
  const trendCategories = buildTrendCategories(input.members, input.introductions);

  const bundle: HouseInstituteDataPipelineBundle = {
    dataSources: buildDataSources(input.members, input.introductions),
    trendCategories,
    institutionInsights: buildInstitutionInsights(input.members, input.introductions),
    legacyResearch: buildLegacyResearch(input.members, input.introductions),
    observatoryFeed: buildObservatoryFeed(trendCategories, updatedAt),
    bridgeSummary: HOUSE_INSTITUTE_DATA_PIPELINE_TAGLINE,
    updatedAt
  };

  assertHousePipelineExcludesPersonalData(bundle);
  return bundle;
}

export function assertHousePipelineExcludesPersonalData(bundle: HouseInstituteDataPipelineBundle): void {
  const serialized = JSON.stringify(bundle);

  for (const pattern of FORBIDDEN_SERIALIZED_PATTERNS) {
    if (pattern.test(serialized)) {
      throw new Error(`House pipeline bundle contains forbidden personal data pattern: ${pattern}`);
    }
  }
}
