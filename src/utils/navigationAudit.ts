import { ADMIN_NAV_SECTIONS, type HardTab } from "../components/admin/adminConsoleNav";
import { AUDIT_CENTER_ADMIN_PATH } from "../constants/auditCenterAdmin";
import { hardPathForTab } from "../constants/hardRoutes";
import {
  CONCIERGE_ADMIN_DASHBOARD_PATH,
  OPERATIONS_CENTER_PATH
} from "../constants/operationsCenter";
import { JOURNEY_INTELLIGENCE_PATH } from "../constants/journeyIntelligence";
import type { RouteAuditAreaId } from "../constants/routeAudit";
import { ROUTE_AUDIT_ADMIN_PATH } from "../constants/routeAudit";
import type { NavigationMapEntry, NavigationSimplificationOpportunity } from "../types/routeAudit";

const NESTED_ADMIN_PATHS: { path: string; label: string; parentTab: HardTab }[] = [
  { path: CONCIERGE_ADMIN_DASHBOARD_PATH, label: "Signal Concierge dashboard", parentTab: "concierge" },
  { path: OPERATIONS_CENTER_PATH, label: "Operations Center", parentTab: "concierge" },
  { path: JOURNEY_INTELLIGENCE_PATH, label: "Journey Intelligence", parentTab: "concierge" },
  { path: ROUTE_AUDIT_ADMIN_PATH, label: "Route & Navigation Audit", parentTab: "audit" }
];

const OVERLAP_GROUPS: { title: string; paths: string[]; summary: string }[] = [
  {
    title: "Finance visibility spread",
    paths: ["/hard/business", "/hard/finance", "/hard/executive"],
    summary: "Business, Finance Operations, and Executive Dashboard each surface revenue — consider a single finance entry with sub-views."
  },
  {
    title: "Quality and audit overlap",
    paths: ["/hard/quality", "/hard/audit", "/hard/audit/routes"],
    summary: "Quality assurance, compliance audit, and route audit are related — cross-link from each hub."
  },
  {
    title: "Concierge nested admin views",
    paths: ["/hard/concierge", "/hard/concierge/operations", "/hard/concierge/intelligence"],
    summary: "Concierge tab hosts three nested views not listed in the main nav — add sub-nav or breadcrumbs."
  },
  {
    title: "Help and support collision",
    paths: ["/help", "/contact", "/knowledge-base", "/tickets"],
    summary: "/help is both SEO hub and Support Center entry — unify support discoverability."
  },
  {
    title: "Institute route density",
    paths: ["/institute", "/institute/bamsignal-house", "/institute/governance"],
    summary: "60+ institute routes — group under fewer institute nav clusters for discoverability."
  }
];

export function buildNavigationMap(): NavigationMapEntry[] {
  const entries: NavigationMapEntry[] = [];

  for (const section of ADMIN_NAV_SECTIONS) {
    for (const item of section.items) {
      entries.push({
        id: `nav-${item.id}`,
        label: item.label,
        path: hardPathForTab(item.id),
        section: section.title,
        areaId: "admin",
        linked: true
      });
    }
  }

  for (const nested of NESTED_ADMIN_PATHS) {
    entries.push({
      id: `nav-nested-${nested.path}`,
      label: nested.label,
      path: nested.path,
      section: "NESTED ADMIN",
      areaId: "admin",
      linked: false
    });
  }

  entries.push({
    id: "nav-audit-compliance",
    label: "Audit & Compliance",
    path: AUDIT_CENTER_ADMIN_PATH,
    section: "NESTED ADMIN",
    areaId: "admin",
    linked: true
  });

  return entries.sort((left, right) => left.path.localeCompare(right.path));
}

export function buildNavigationSimplificationOpportunities(): NavigationSimplificationOpportunity[] {
  return OVERLAP_GROUPS.map((group, index) => ({
    id: `simplify-${index + 1}`,
    title: group.title,
    summary: group.summary,
    affectedPaths: group.paths
  }));
}

export function countUnlinkedNavigationEntries(map: NavigationMapEntry[]): number {
  return map.filter((entry) => !entry.linked).length;
}

export function navigationAreaSummary(map: NavigationMapEntry[]): Record<RouteAuditAreaId, number> {
  return map.reduce(
    (counts, entry) => {
      counts[entry.areaId] = (counts[entry.areaId] ?? 0) + 1;
      return counts;
    },
    {} as Record<RouteAuditAreaId, number>
  );
}
