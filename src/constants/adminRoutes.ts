import type { AdminTab } from "../components/admin/adminConsoleNav";
import { normalizePath } from "./routes";

const TAB_SLUGS: Record<AdminTab, string> = {
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
  leads: "leads"
};

const SLUG_TO_TAB = Object.fromEntries(
  Object.entries(TAB_SLUGS).map(([tab, slug]) => [slug, tab as AdminTab])
) as Record<string, AdminTab>;

export function adminPathForTab(tab: AdminTab): string {
  if (tab === "command") return "/admin/command";
  const slug = TAB_SLUGS[tab];
  return `/admin/${slug}`;
}

export function parseAdminTabFromPath(pathname = window.location.pathname): AdminTab | null {
  const path = normalizePath(pathname);
  if (path === "/admin" || path === "/hard") return "command";
  if (path === "/admin/command" || path === "/hard/command") return "command";

  const legacy = path.match(/^\/(?:admin|hard)\/([^/]+)$/);
  if (!legacy) return null;
  return SLUG_TO_TAB[legacy[1]] ?? null;
}

export function isAdminHubPath(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  if (path === "/admin/auth" || path === "/hard/auth") return false;
  return path === "/admin" || path.startsWith("/admin/") || path === "/hard" || path.startsWith("/hard/");
}
