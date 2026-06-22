import {
  EXECUTIVE_AREA_LABELS,
  EXECUTIVE_METRIC_LABELS,
  type ExecutiveViewId
} from "../constants/executiveDashboard";
import {
  EXECUTIVE_AREA_INSIGHTS,
  EXECUTIVE_STRATEGIC_FOCUS,
  buildCommunityOverview,
  buildGrowthTrend,
  buildInstitutionHealth,
  buildLegacyGrowth,
  buildResearchInsight,
  getViewMetrics
} from "../data/executiveDashboardSeed";
import type { ExecutiveDashboardBundle } from "../types/executiveDashboard";

export const DEFAULT_EXECUTIVE_VIEW: ExecutiveViewId = "30-days";

export function buildExecutiveDashboardBundle(view: ExecutiveViewId = DEFAULT_EXECUTIVE_VIEW): ExecutiveDashboardBundle {
  const metrics = getViewMetrics(view).map((metric) => ({
    ...metric,
    label: EXECUTIVE_METRIC_LABELS[metric.id]
  }));

  return {
    generatedAt: new Date().toISOString(),
    view,
    metrics,
    areas: EXECUTIVE_AREA_INSIGHTS.map((area) => ({
      ...area,
      title: EXECUTIVE_AREA_LABELS[area.areaId]
    })),
    institutionHealth: buildInstitutionHealth(view),
    growthTrend: buildGrowthTrend(view),
    legacyGrowth: buildLegacyGrowth(view),
    researchInsight: buildResearchInsight(),
    communityOverview: buildCommunityOverview(view),
    strategicFocus: [...EXECUTIVE_STRATEGIC_FOCUS]
  };
}
