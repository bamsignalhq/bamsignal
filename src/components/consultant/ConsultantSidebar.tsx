import { Briefcase, ClipboardList, Globe2, HeartHandshake, LayoutDashboard, Sparkles, Users } from "lucide-react";
import type { ConsultantCapability } from "../../constants/consultantPermissions";
import { CONSULTANT_CRM_BRAND } from "../../constants/consultantCrm";
import { CONSULTANT_ROUTES, type ConsultantWorkspaceRoute } from "../../constants/consultantRoutes";
import { hasConsultantCapability } from "../../utils/consultantSession";

type NavItem = {
  route: ConsultantWorkspaceRoute;
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  capability: ConsultantCapability | ConsultantCapability[];
};

const NAV_ITEMS: NavItem[] = [
  {
    route: "crm",
    path: CONSULTANT_ROUTES.crm,
    label: "Workspace",
    icon: LayoutDashboard,
    capability: "view-portfolio"
  },
  {
    route: "regions",
    path: CONSULTANT_ROUTES.regions,
    label: "Regions",
    icon: Globe2,
    capability: "view-portfolio"
  },
  {
    route: "assist",
    path: CONSULTANT_ROUTES.assist,
    label: "AI Assist",
    icon: Sparkles,
    capability: "view-portfolio"
  },
  {
    route: "members",
    path: CONSULTANT_ROUTES.members,
    label: "Members",
    icon: Users,
    capability: ["view-members", "legacy-members", "global-members", "view-global-members", "view-family-journeys"]
  },
  {
    route: "introductions",
    path: CONSULTANT_ROUTES.introductions,
    label: "Introductions",
    icon: HeartHandshake,
    capability: "manage-introductions"
  },
  {
    route: "followups",
    path: CONSULTANT_ROUTES.followups,
    label: "Follow-Ups",
    icon: ClipboardList,
    capability: "manage-followups"
  }
];

function navItemVisible(capability: ConsultantCapability | ConsultantCapability[]): boolean {
  if (Array.isArray(capability)) {
    return capability.some((item) => hasConsultantCapability(item));
  }
  return hasConsultantCapability(capability);
}

type ConsultantSidebarProps = {
  activeRoute: ConsultantWorkspaceRoute;
  onNavigate: (path: string) => void;
};

export function ConsultantSidebar({ activeRoute, onNavigate }: ConsultantSidebarProps) {
  const visibleItems = NAV_ITEMS.filter((item) => navItemVisible(item.capability));

  return (
    <aside className="consultant-sidebar" aria-label="Consultant workspace">
      <div className="consultant-sidebar__brand">
        <Briefcase size={18} aria-hidden />
        <span>{CONSULTANT_CRM_BRAND}</span>
      </div>
      <nav className="consultant-sidebar__nav">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active =
            activeRoute === item.route ||
            (item.route === "crm" && (activeRoute === "home" || activeRoute === "portfolio"));
          return (
            <button
              key={item.route}
              type="button"
              className={`consultant-sidebar__link${active ? " consultant-sidebar__link--active" : ""}`}
              onClick={() => onNavigate(item.path)}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={16} aria-hidden />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export function getVisibleConsultantNavRoutes(): ConsultantWorkspaceRoute[] {
  return NAV_ITEMS.filter((item) => navItemVisible(item.capability)).map((item) => item.route);
}
