import type { ExecutiveMetricId } from "../constants/executiveDashboard";
import { EXECUTIVE_METRIC_LABELS, type ExecutiveViewId } from "../constants/executiveDashboard";
import type {
  CommunityOverviewSnapshot,
  ExecutiveAreaInsight,
  ExecutiveMetric,
  GrowthTrendPoint,
  InstitutionHealthSnapshot,
  LegacyGrowthSnapshot,
  ResearchInsightSnapshot
} from "../types/executiveDashboard";

type ViewMetrics = Record<ExecutiveMetricId, { value: string; numeric: number; trend: string | null }>;

const VIEW_METRICS: Record<ExecutiveViewId, ViewMetrics> = {
  today: {
    applications: { value: "12", numeric: 12, trend: "+3" },
    consultations: { value: "8", numeric: 8, trend: "+2" },
    introductions: { value: "4", numeric: 4, trend: null },
    relationships: { value: "2", numeric: 2, trend: null },
    engagements: { value: "0", numeric: 0, trend: null },
    marriages: { value: "0", numeric: 0, trend: null },
    "legacy-families": { value: "0", numeric: 0, trend: null },
    "success-stories": { value: "1", numeric: 1, trend: null },
    cities: { value: "6", numeric: 6, trend: null },
    consultants: { value: "6", numeric: 6, trend: null },
    revenue: { value: "₦225,000", numeric: 225000, trend: "+18%" }
  },
  "30-days": {
    applications: { value: "284", numeric: 284, trend: "+12%" },
    consultations: { value: "196", numeric: 196, trend: "+9%" },
    introductions: { value: "87", numeric: 87, trend: "+15%" },
    relationships: { value: "34", numeric: 34, trend: "+8%" },
    engagements: { value: "6", numeric: 6, trend: "+2" },
    marriages: { value: "2", numeric: 2, trend: "+1" },
    "legacy-families": { value: "4", numeric: 4, trend: "+1" },
    "success-stories": { value: "18", numeric: 18, trend: "+5" },
    cities: { value: "12", numeric: 12, trend: "+1" },
    consultants: { value: "6", numeric: 6, trend: null },
    revenue: { value: "₦4.2M", numeric: 4200000, trend: "+14%" }
  },
  "90-days": {
    applications: { value: "812", numeric: 812, trend: "+22%" },
    consultations: { value: "541", numeric: 541, trend: "+18%" },
    introductions: { value: "248", numeric: 248, trend: "+20%" },
    relationships: { value: "96", numeric: 96, trend: "+12%" },
    engagements: { value: "18", numeric: 18, trend: "+6" },
    marriages: { value: "7", numeric: 7, trend: "+3" },
    "legacy-families": { value: "11", numeric: 11, trend: "+4" },
    "success-stories": { value: "52", numeric: 52, trend: "+14" },
    cities: { value: "14", numeric: 14, trend: "+2" },
    consultants: { value: "6", numeric: 6, trend: "+1" },
    revenue: { value: "₦12.8M", numeric: 12800000, trend: "+19%" }
  },
  "12-months": {
    applications: { value: "3,240", numeric: 3240, trend: "+34%" },
    consultations: { value: "2,180", numeric: 2180, trend: "+28%" },
    introductions: { value: "1,024", numeric: 1024, trend: "+31%" },
    relationships: { value: "412", numeric: 412, trend: "+24%" },
    engagements: { value: "68", numeric: 68, trend: "+22" },
    marriages: { value: "28", numeric: 28, trend: "+12" },
    "legacy-families": { value: "42", numeric: 42, trend: "+18" },
    "success-stories": { value: "186", numeric: 186, trend: "+45" },
    cities: { value: "18", numeric: 18, trend: "+4" },
    consultants: { value: "6", numeric: 6, trend: "+2" },
    revenue: { value: "₦48.6M", numeric: 48600000, trend: "+27%" }
  },
  lifetime: {
    applications: { value: "8,420", numeric: 8420, trend: null },
    consultations: { value: "5,640", numeric: 5640, trend: null },
    introductions: { value: "2,680", numeric: 2680, trend: null },
    relationships: { value: "1,084", numeric: 1084, trend: null },
    engagements: { value: "186", numeric: 186, trend: null },
    marriages: { value: "74", numeric: 74, trend: null },
    "legacy-families": { value: "112", numeric: 112, trend: null },
    "success-stories": { value: "428", numeric: 428, trend: null },
    cities: { value: "22", numeric: 22, trend: null },
    consultants: { value: "6", numeric: 6, trend: null },
    revenue: { value: "₦124M", numeric: 124000000, trend: null }
  }
};

export const EXECUTIVE_AREA_INSIGHTS: ExecutiveAreaInsight[] = [
  {
    areaId: "institution-health",
    title: "Institution Health",
    summary: "Operations, safety, quality, and academy systems operational. Strong institutional foundation.",
    status: "healthy"
  },
  {
    areaId: "growth",
    title: "Growth",
    summary: "Application and consultation volume trending up. Diaspora corridor expansion on track.",
    status: "growing"
  },
  {
    areaId: "journey-outcomes",
    title: "Journey Outcomes",
    summary: "Introduction-to-relationship conversion improving. Engagement pipeline building.",
    status: "growing"
  },
  {
    areaId: "consultant-health",
    title: "Consultant Health",
    summary: "Academy certification progressing. Quality reviews active. One consultant needs support.",
    status: "attention"
  },
  {
    areaId: "communities",
    title: "Communities",
    summary: "12 active cities. Lagos, Abuja, London corridor strongest.",
    status: "strong"
  },
  {
    areaId: "research",
    title: "Research",
    summary: "Relationship Index Q2 draft ready. Institute research partnerships expanding.",
    status: "healthy"
  },
  {
    areaId: "finance",
    title: "Finance",
    summary: "Revenue on track. Settlement batch pending. Consultant payouts scheduled.",
    status: "healthy"
  },
  {
    areaId: "legacy",
    title: "Legacy",
    summary: "Legacy families and success stories growing. Hall of Legacy nominations open.",
    status: "growing"
  }
];

export const EXECUTIVE_STRATEGIC_FOCUS = [
  "Consultant quality and academy completion",
  "Safety infrastructure and escalation response",
  "Diaspora corridor growth",
  "Legacy family documentation",
  "Finance operations visibility"
];

export function getViewMetrics(view: ExecutiveViewId): ExecutiveMetric[] {
  const data = VIEW_METRICS[view];
  return (Object.keys(data) as ExecutiveMetricId[]).map((id) => ({
    id,
    label: EXECUTIVE_METRIC_LABELS[id],
    value: data[id].value,
    numericValue: data[id].numeric,
    trend: data[id].trend
  }));
}

export function buildInstitutionHealth(view: ExecutiveViewId): InstitutionHealthSnapshot {
  const scores: Record<ExecutiveViewId, number> = {
    today: 88,
    "30-days": 89,
    "90-days": 90,
    "12-months": 91,
    lifetime: 92
  };

  return {
    score: scores[view],
    label: scores[view] >= 90 ? "Strong" : scores[view] >= 80 ? "Healthy" : "Attention",
    highlights: [
      "Document Center, Safety Center, and Academy operational",
      "Quality assurance and finance layers active",
      "Internal messaging institutional comms live"
    ]
  };
}

export function buildGrowthTrend(view: ExecutiveViewId): GrowthTrendPoint[] {
  if (view === "today") {
    return [{ period: "Today", applications: 12, consultations: 8, revenueNgn: 225000 }];
  }
  if (view === "30-days") {
    return [
      { period: "Week 1", applications: 58, consultations: 42, revenueNgn: 980000 },
      { period: "Week 2", applications: 72, consultations: 48, revenueNgn: 1100000 },
      { period: "Week 3", applications: 68, consultations: 52, revenueNgn: 1050000 },
      { period: "Week 4", applications: 86, consultations: 54, revenueNgn: 1070000 }
    ];
  }
  return [
    { period: "Q1", applications: 720, consultations: 480, revenueNgn: 11200000 },
    { period: "Q2", applications: 812, consultations: 541, revenueNgn: 12800000 },
    { period: "Q3", applications: 890, consultations: 598, revenueNgn: 14200000 },
    { period: "Q4", applications: 818, consultations: 561, revenueNgn: 10400000 }
  ];
}

export function buildLegacyGrowth(view: ExecutiveViewId): LegacyGrowthSnapshot {
  const metrics = VIEW_METRICS[view];
  return {
    legacyFamilies: metrics["legacy-families"].numeric,
    successStories: metrics["success-stories"].numeric,
    marriages: metrics.marriages.numeric,
    trend: metrics["legacy-families"].trend ?? metrics.marriages.trend ?? "Stable"
  };
}

export function buildResearchInsight(): ResearchInsightSnapshot {
  return {
    title: "Relationship Index — June 2026",
    summary: "Nigerian diaspora corridor shows strongest introduction-to-relationship conversion.",
    reportRef: "RPT-REL-INDEX-2026-06"
  };
}

export function buildCommunityOverview(view: ExecutiveViewId): CommunityOverviewSnapshot {
  const cities = VIEW_METRICS[view].cities.numeric;
  return {
    activeCities: cities,
    corridors: Math.max(3, Math.floor(cities / 2)),
    diasporaReach: cities >= 14 ? "London, Houston, Toronto, Dubai" : "Lagos, Abuja, London"
  };
}
