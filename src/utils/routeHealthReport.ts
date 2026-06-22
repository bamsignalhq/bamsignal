import {
  ROUTE_HEALTH_STATUSES,
  type RouteHealthStatusId
} from "../constants/routeAudit";
import type {
  RedirectRecommendation,
  RouteHealthMetric,
  RouteHealthReport,
  RouteInventoryEntry
} from "../types/routeAudit";
import { buildNavigationMap, buildNavigationSimplificationOpportunities } from "./navigationAudit";
import { buildRouteInventory } from "./routeAudit";
import {
  AUTH_SIGNUP_PATH,
  HARD_HUB_PATH
} from "../constants/routes";

const REDIRECT_TARGETS: Record<string, { toPath: string; reason: string; priority: "high" | "medium" | "low" }> = {
  "/signup": { toPath: AUTH_SIGNUP_PATH, reason: "Legacy signup alias", priority: "high" },
  "/join": { toPath: AUTH_SIGNUP_PATH, reason: "Legacy signup alias", priority: "high" },
  "/register": { toPath: AUTH_SIGNUP_PATH, reason: "Legacy signup alias", priority: "high" },
  "/admin": { toPath: HARD_HUB_PATH, reason: "Legacy admin console root", priority: "high" },
  "/hard": { toPath: HARD_HUB_PATH, reason: "Bare hard hub without tab slug", priority: "medium" }
};

function applyDuplicateDetection(inventory: RouteInventoryEntry[]): RouteInventoryEntry[] {
  const pathOwners = new Map<string, RouteInventoryEntry[]>();

  for (const item of inventory) {
    if (item.path.includes("{")) continue;
    const owners = pathOwners.get(item.path) ?? [];
    owners.push(item);
    pathOwners.set(item.path, owners);
  }

  return inventory.map((item) => {
    if (item.path.includes("{") || item.health !== "healthy") return item;
    const owners = pathOwners.get(item.path) ?? [];
    if (owners.length <= 1) return item;

    return {
      ...item,
      health: "duplicate" as RouteHealthStatusId,
      note: item.note ?? `Shared path across ${owners.map((owner) => owner.source).join(", ")}`
    };
  });
}

function detectOrphans(inventory: RouteInventoryEntry[], navigationMap: ReturnType<typeof buildNavigationMap>) {
  const knownPaths = new Set(inventory.map((item) => item.path));
  const navPaths = new Set(navigationMap.map((item) => item.path));

  const orphans: RouteInventoryEntry[] = [];

  for (const item of inventory) {
    if (item.health === "deprecated" || item.health === "needs-redirect") {
      orphans.push(item);
      continue;
    }

    if (item.path.includes("{")) continue;

    if (item.areaId === "admin" && item.source === "hard-routes" && !navPaths.has(item.path)) {
      orphans.push({
        ...item,
        health: "orphaned",
        note: "Admin tab route missing from navigation map"
      });
    }

    if (!knownPaths.has(item.path) && item.health === "healthy") {
      orphans.push({ ...item, health: "orphaned", note: "Route not present in inventory registry" });
    }
  }

  return orphans;
}

function buildRedirectRecommendations(inventory: RouteInventoryEntry[]): RedirectRecommendation[] {
  const recommendations: RedirectRecommendation[] = [];

  for (const item of inventory) {
    if (item.health !== "needs-redirect" && item.health !== "deprecated") continue;
    const target = REDIRECT_TARGETS[item.path];
    if (!target) continue;

    recommendations.push({
      id: `redirect-${item.path}`,
      fromPath: item.path,
      toPath: target.toPath,
      reason: target.reason,
      priority: target.priority
    });
  }

  for (const [fromPath, target] of Object.entries(REDIRECT_TARGETS)) {
    if (recommendations.some((item) => item.fromPath === fromPath)) continue;
    recommendations.push({
      id: `redirect-${fromPath}`,
      fromPath,
      toPath: target.toPath,
      reason: target.reason,
      priority: target.priority
    });
  }

  return recommendations.sort((left, right) => left.fromPath.localeCompare(right.fromPath));
}

function buildMetrics(inventory: RouteInventoryEntry[]): RouteHealthMetric[] {
  return ROUTE_HEALTH_STATUSES.map((status) => ({
    status: status.id,
    count: inventory.filter((item) => item.health === status.id).length
  }));
}

export function buildRouteHealthReport(): RouteHealthReport {
  const navigationMap = buildNavigationMap();
  const inventory = applyDuplicateDetection(buildRouteInventory());
  const duplicates = inventory.filter((item) => item.health === "duplicate");
  const orphans = detectOrphans(inventory, navigationMap);
  const redirectRecommendations = buildRedirectRecommendations(inventory);
  const simplificationOpportunities = buildNavigationSimplificationOpportunities();

  return {
    generatedAt: new Date().toISOString(),
    inventory,
    navigationMap,
    orphans,
    duplicates,
    redirectRecommendations,
    simplificationOpportunities,
    metrics: buildMetrics(inventory),
    totalRoutes: inventory.length
  };
}
