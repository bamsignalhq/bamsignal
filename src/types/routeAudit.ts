import type { RouteAuditAreaId, RouteHealthStatusId } from "../constants/routeAudit";

export type RouteInventoryEntry = {
  id: string;
  path: string;
  areaId: RouteAuditAreaId;
  label: string;
  source: string;
  health: RouteHealthStatusId;
  note: string | null;
};

export type NavigationMapEntry = {
  id: string;
  label: string;
  path: string;
  section: string;
  areaId: RouteAuditAreaId;
  linked: boolean;
};

export type RedirectRecommendation = {
  id: string;
  fromPath: string;
  toPath: string;
  reason: string;
  priority: "high" | "medium" | "low";
};

export type NavigationSimplificationOpportunity = {
  id: string;
  title: string;
  summary: string;
  affectedPaths: string[];
};

export type RouteHealthMetric = {
  status: RouteHealthStatusId;
  count: number;
};

export type RouteHealthReport = {
  generatedAt: string;
  inventory: RouteInventoryEntry[];
  navigationMap: NavigationMapEntry[];
  orphans: RouteInventoryEntry[];
  duplicates: RouteInventoryEntry[];
  redirectRecommendations: RedirectRecommendation[];
  simplificationOpportunities: NavigationSimplificationOpportunity[];
  metrics: RouteHealthMetric[];
  totalRoutes: number;
};
