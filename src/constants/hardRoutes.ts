import type { HardTab } from "../components/admin/adminConsoleNav";
import { normalizePath } from "./routes";
import { AUDIT_CENTER_ADMIN_PATH } from "./auditCenterAdmin";
import { ROUTE_AUDIT_ADMIN_PATH } from "./routeAudit";
import { DATABASE_AUDIT_ADMIN_PATH } from "./databaseAudit";
import {
  CONCIERGE_ADMIN_DASHBOARD_PATH,
  OPERATIONS_CENTER_PATH
} from "./operationsCenter";
import {
  JOURNEY_INTELLIGENCE_PATH
} from "./journeyIntelligence";

export type ConciergeAdminView = "dashboard" | "operations-center" | "journey-intelligence";
export type AuditAdminView = "compliance" | "routes" | "database";

const TAB_SLUGS: Record<HardTab, string> = {
  command: "command",
  overview: "metrics",
  business: "business",
  users: "users",
  reports: "reports",
  cities: "cities",
  discover: "discover",
  cityhome: "city-home",
  pricing: "pricing",
  verifications: "verify",
  content: "content",
  email: "email",
  ads: "home-ads",
  leads: "leads",
  concierge: "concierge",
  talent: "talent",
  support: "support",
  audit: "audit",
  documents: "documents",
  safety: "safety",
  academy: "academy",
  quality: "quality",
  finance: "finance",
  messages: "messages",
  executive: "executive"
};

const SLUG_TO_TAB = Object.fromEntries(
  Object.entries(TAB_SLUGS).map(([tab, slug]) => [slug, tab as HardTab])
) as Record<string, HardTab>;

export function hardPathForTab(tab: HardTab): string {
  if (tab === "command") return "/hard/command";
  const slug = TAB_SLUGS[tab];
  return `/hard/${slug}`;
}

export function parseHardTabFromPath(pathname = window.location.pathname): HardTab | null {
  const path = normalizePath(pathname);
  if (path === "/hard" || path === "/hard/command") return "command";
  if (
    path === CONCIERGE_ADMIN_DASHBOARD_PATH ||
    path.startsWith(CONCIERGE_ADMIN_DASHBOARD_PATH + "/")
  ) {
    return "concierge";
  }
  if (path === AUDIT_CENTER_ADMIN_PATH || path.startsWith(`${AUDIT_CENTER_ADMIN_PATH}/`)) {
    return "audit";
  }

  const match = path.match(/^\/hard\/([^/]+)$/);
  if (!match) return null;
  return SLUG_TO_TAB[match[1]] ?? null;
}

export function parseConciergeAdminViewFromPath(
  pathname = window.location.pathname
): ConciergeAdminView {
  const path = normalizePath(pathname);
  if (path === OPERATIONS_CENTER_PATH || path.startsWith(OPERATIONS_CENTER_PATH + "/")) {
    return "operations-center";
  }
  if (path === JOURNEY_INTELLIGENCE_PATH || path.startsWith(JOURNEY_INTELLIGENCE_PATH + "/")) {
    return "journey-intelligence";
  }
  return "dashboard";
}

export function hardPathForConciergeView(view: ConciergeAdminView): string {
  if (view === "operations-center") return OPERATIONS_CENTER_PATH;
  if (view === "journey-intelligence") return JOURNEY_INTELLIGENCE_PATH;
  return CONCIERGE_ADMIN_DASHBOARD_PATH;
}

export function parseAuditAdminViewFromPath(pathname = window.location.pathname): AuditAdminView {
  const path = normalizePath(pathname);
  if (path === DATABASE_AUDIT_ADMIN_PATH || path.startsWith(`${DATABASE_AUDIT_ADMIN_PATH}/`)) {
    return "database";
  }
  if (path === ROUTE_AUDIT_ADMIN_PATH || path.startsWith(`${ROUTE_AUDIT_ADMIN_PATH}/`)) {
    return "routes";
  }
  return "compliance";
}

export function hardPathForAuditView(view: AuditAdminView): string {
  if (view === "database") return DATABASE_AUDIT_ADMIN_PATH;
  if (view === "routes") return ROUTE_AUDIT_ADMIN_PATH;
  return AUDIT_CENTER_ADMIN_PATH;
}

export function isHardHubPath(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  if (path === "/hard/auth") return false;
  return path === "/hard" || path.startsWith("/hard/");
}
