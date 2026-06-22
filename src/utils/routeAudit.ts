import { BAMSIGNAL_FOUNDATION_ROUTES } from "../constants/bamSignalFoundationRoutes";
import { BAMSIGNAL_INSTITUTE_ROUTES } from "../constants/bamSignalInstituteRoutes";
import { CAREERS_ROUTES } from "../constants/careersRoutes";
import { CENTURY_ROUTES } from "../constants/centuryRoutes";
import { CONSULTANT_ROUTES } from "../constants/consultantRoutes";
import { LEGAL_PATHS } from "../constants/footer";
import { hardPathForTab } from "../constants/hardRoutes";
import { JOURNEY_INTELLIGENCE_PATH } from "../constants/journeyIntelligence";
import {
  CONCIERGE_ADMIN_DASHBOARD_PATH,
  OPERATIONS_CENTER_PATH
} from "../constants/operationsCenter";
import type { RouteAuditAreaId, RouteHealthStatusId } from "../constants/routeAudit";
import { ROUTE_AUDIT_ADMIN_PATH } from "../constants/routeAudit";
import { PERMISSIONS_AUDIT_ADMIN_PATH } from "../constants/permissionsAudit";
import { JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH } from "../constants/journeyIntegrityAudit";
import { LAUNCH_READINESS_ADMIN_PATH } from "../constants/launchReadiness";
import {
  AUTH_LOGIN_PATH,
  AUTH_SIGNUP_ALIASES,
  AUTH_SIGNUP_PATH,
  BLOG_INDEX_PATH,
  HARD_AUTH_PATH,
  PAYMENT_SUCCESS_PATH
} from "../constants/routes";
import { SIGNAL_CONCIERGE_ROUTES } from "../constants/signalConciergeRoutes";
import { SIGNAL_EVENTS_ROUTES } from "../constants/signalEventsRoutes";
import { SUPPORT_CENTER_ROUTES } from "../constants/supportCenterRoutes";
import type { RouteInventoryEntry } from "../types/routeAudit";
import type { HardTab } from "../components/admin/adminConsoleNav";
import { HARD_TAB_TITLES } from "../components/admin/adminConsoleNav";

const MEMBER_ROUTES: { path: string; label: string }[] = [
  { path: "/home", label: "Home" },
  { path: "/fast-connection", label: "Fast Connection" },
  { path: "/onboarding", label: "Onboarding" },
  { path: "/discover", label: "Discover" },
  { path: "/chats", label: "Chats" },
  { path: "/signals", label: "Signals" },
  { path: "/profile", label: "Profile" },
  { path: "/voice-vibe", label: "Voice Vibe" },
  { path: "/trusted-member", label: "Trusted Member" },
  { path: "/saved-profiles", label: "Saved Profiles" },
  { path: "/settings", label: "Settings" },
  { path: "/subscription", label: "Subscription" },
  { path: PAYMENT_SUCCESS_PATH, label: "Payment Success" }
];

const PUBLIC_STATIC_ROUTES: { path: string; label: string; source: string }[] = [
  { path: "/", label: "Homepage", source: "public-marketing" },
  { path: "/love", label: "Love landing", source: "auth-shell" },
  { path: AUTH_LOGIN_PATH, label: "Login", source: "auth" },
  { path: AUTH_SIGNUP_PATH, label: "Signup", source: "auth" },
  { path: BLOG_INDEX_PATH, label: "Blog index", source: "blog" },
  { path: "/nigeria", label: "Nigeria SEO index", source: "nigeria-seo" },
  { path: "/cities", label: "Cities SEO hub", source: "seo-routes" },
  { path: "/help", label: "Help hub", source: "seo-routes" },
  { path: "/safety", label: "Safety hub", source: "seo-routes" },
  { path: "/features", label: "Features hub", source: "seo-routes" },
  { path: "/premium", label: "Premium hub", source: "seo-routes" },
  { path: "/faq", label: "FAQ hub", source: "seo-routes" },
  { path: "/guides", label: "Guides hub", source: "seo-routes" },
  { path: "/compare", label: "Compare hub", source: "seo-routes" }
];

const SEO_HUB_OVERLAP_NOTES: Record<string, string> = {
  "/help": "Shared by SEO hub and Support Center™",
  "/premium": "SEO marketing hub — distinct from member subscription",
  "/safety": "SEO safety hub — distinct from /safety-policy legal page"
};

const DEPRECATED_PATHS: { path: string; label: string; note: string }[] = [
  { path: "/admin", label: "Legacy admin root", note: "Redirects to /hard/command" },
  { path: "/admin/metrics", label: "Legacy admin metrics", note: "Redirects to /hard/metrics" }
];

const REDIRECT_ONLY_PATHS: { path: string; label: string; note: string }[] = [
  ...AUTH_SIGNUP_ALIASES.map((path) => ({
    path,
    label: `Signup alias (${path})`,
    note: `Redirects to ${AUTH_SIGNUP_PATH}`
  })),
  { path: "/hard", label: "Hard hub root", note: "Redirects to /hard/command" }
];

function entry(
  id: string,
  path: string,
  areaId: RouteAuditAreaId,
  label: string,
  source: string,
  health: RouteHealthStatusId = "healthy",
  note: string | null = null
): RouteInventoryEntry {
  return { id, path, areaId, label, source, health, note };
}

function entriesFromRecord(
  record: Record<string, string>,
  areaId: RouteAuditAreaId,
  source: string,
  prefix = ""
): RouteInventoryEntry[] {
  return Object.entries(record).map(([key, path]) =>
    entry(`${prefix}${areaId}-${key}`, path, areaId, key, source)
  );
}

export function buildRouteInventory(): RouteInventoryEntry[] {
  const inventory: RouteInventoryEntry[] = [];

  for (const route of PUBLIC_STATIC_ROUTES) {
    inventory.push(
      entry(
        `public-${route.path}`,
        route.path,
        "public",
        route.label,
        route.source,
        SEO_HUB_OVERLAP_NOTES[route.path] ? "duplicate" : "healthy",
        SEO_HUB_OVERLAP_NOTES[route.path] ?? null
      )
    );
  }

  for (const path of LEGAL_PATHS) {
    inventory.push(entry(`public-legal-${path}`, path, "public", path, "legal-paths"));
  }

  for (const route of MEMBER_ROUTES) {
    inventory.push(entry(`member-${route.path}`, route.path, "member", route.label, "member-app-paths"));
  }

  inventory.push(...entriesFromRecord(CONSULTANT_ROUTES, "consultant", "consultant-routes", "consultant-"));

  const adminTabs = Object.keys(HARD_TAB_TITLES) as HardTab[];
  for (const tab of adminTabs) {
    const path = hardPathForTab(tab);
    inventory.push(entry(`admin-tab-${tab}`, path, "admin", tab, "hard-routes"));
  }

  inventory.push(
    entry("admin-auth", HARD_AUTH_PATH, "admin", "Hard auth", "hard-routes"),
    entry("admin-concierge-dashboard", CONCIERGE_ADMIN_DASHBOARD_PATH, "admin", "Concierge dashboard", "operations-center"),
    entry("admin-operations-center", OPERATIONS_CENTER_PATH, "admin", "Operations Center", "operations-center"),
    entry("admin-journey-intelligence", JOURNEY_INTELLIGENCE_PATH, "admin", "Journey Intelligence", "journey-intelligence"),
    entry("admin-route-audit", ROUTE_AUDIT_ADMIN_PATH, "admin", "Route audit", "route-audit"),
    entry("admin-permissions-audit", PERMISSIONS_AUDIT_ADMIN_PATH, "admin", "Permissions audit", "permissions-audit"),
    entry("admin-journey-audit", JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH, "admin", "Journey integrity audit", "journey-audit"),
    entry("admin-launch-readiness", LAUNCH_READINESS_ADMIN_PATH, "admin", "Launch readiness", "launch-readiness")
  );

  inventory.push(
    ...entriesFromRecord(BAMSIGNAL_INSTITUTE_ROUTES, "institute", "institute-routes", "institute-")
  );
  inventory.push(
    ...entriesFromRecord(BAMSIGNAL_FOUNDATION_ROUTES, "public", "foundation-routes", "foundation-")
  );
  inventory.push(...entriesFromRecord(CAREERS_ROUTES, "public", "careers-routes", "careers-"));
  inventory.push(...entriesFromRecord(SIGNAL_EVENTS_ROUTES, "events", "events-routes", "events-"));
  inventory.push(
    entry("events-city-dynamic", "/events/{citySlug}", "events", "City events (dynamic)", "events-routes", "healthy", "Resolved from global city network")
  );
  inventory.push(...entriesFromRecord(SIGNAL_CONCIERGE_ROUTES, "concierge", "concierge-routes", "concierge-"));
  inventory.push(...entriesFromRecord(SUPPORT_CENTER_ROUTES, "public", "support-center-routes", "support-"));
  inventory.push(...entriesFromRecord(CENTURY_ROUTES, "century", "century-routes", "century-"));

  for (const route of DEPRECATED_PATHS) {
    inventory.push(
      entry(`deprecated-${route.path}`, route.path, "admin", route.label, "legacy-console", "deprecated", route.note)
    );
  }

  for (const route of REDIRECT_ONLY_PATHS) {
    inventory.push(
      entry(`redirect-${route.path}`, route.path, "public", route.label, "redirect-aliases", "needs-redirect", route.note)
    );
  }

  inventory.push(
    entry("public-careers-role-dynamic", "/careers/role/{slug}", "public", "Career role (dynamic)", "careers-routes", "healthy", "Resolved from careers seed"),
    entry("public-blog-slug-dynamic", "/blog/{slug}", "public", "Blog article (dynamic)", "blog", "healthy", "Resolved from blog posts"),
    entry("public-moments-dynamic", "/moments/{slug}", "public", "Moment page (dynamic)", "moments", "healthy", "Resolved from moment pages"),
    entry("public-nigeria-dynamic", "/nigeria/{state}/{city?}", "public", "Nigeria SEO (dynamic)", "nigeria-seo", "healthy", "State and city landing pages")
  );

  return inventory.sort((left, right) => left.path.localeCompare(right.path));
}
