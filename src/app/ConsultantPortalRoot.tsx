import { useCallback, useEffect, useState } from "react";
import { AdminToastProvider } from "../components/admin/AdminToast";
import { ConsultantLayout } from "../components/consultant/ConsultantLayout";
import { ConsultantLoginPage } from "../components/consultant/ConsultantLoginPage";
import { ConsultantRouteGuard } from "../components/consultant/ConsultantRouteGuard";
import {
  CONSULTANT_ROUTES,
  getConsultantRoute,
  isConsultantLoginRoute,
  isConsultantWorkspaceRoute,
  type ConsultantWorkspaceRoute
} from "../constants/consultantRoutes";
import { navigateToPath, normalizePath } from "../constants/routes";
import type { Theme } from "../types";
import {
  getCurrentConsultant,
  logoutConsultant,
  resolveConciergeConsultantEntry
} from "../utils/consultantSession";
import {
  ConsultantCrmWorkspace,
  ConsultantFollowUpsWorkspace,
  ConsultantIntroductionsWorkspace,
  ConsultantMembersWorkspace,
  ConsultantPortfolioWorkspace,
  ConsultantRegionsWorkspace
} from "../pages/consultant/ConsultantWorkspacePages";

type ConsultantPortalRootProps = {
  theme: Theme;
  onToggleTheme: () => void;
};

function resolveActiveRoute(pathname = window.location.pathname): ConsultantWorkspaceRoute {
  const route = getConsultantRoute(pathname);
  if (route === "home") return "crm";
  if (isConsultantWorkspaceRoute(route)) return route;
  return "crm";
}

export function ConsultantPortalRoot({ theme, onToggleTheme }: ConsultantPortalRootProps) {
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname));
  const [sessionVersion, setSessionVersion] = useState(0);

  const syncRoute = useCallback(() => {
    setPathname(normalizePath(window.location.pathname));
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, [syncRoute]);

  const consultant = getCurrentConsultant();
  const activeRoute = resolveActiveRoute(pathname);
  const onLoginRoute = isConsultantLoginRoute(pathname);

  useEffect(() => {
    if (onLoginRoute && consultant) {
      const entry = resolveConciergeConsultantEntry(consultant);
      navigateToPath(entry.route, true);
      syncRoute();
    }
  }, [consultant, onLoginRoute, syncRoute]);

  const handleAuthed = () => {
    setSessionVersion((value) => value + 1);
    syncRoute();
  };

  const handleLogout = () => {
    logoutConsultant();
    setSessionVersion((value) => value + 1);
    navigateToPath(CONSULTANT_ROUTES.login, true);
    syncRoute();
  };

  const handleNavigate = (path: string) => {
    navigateToPath(path);
    syncRoute();
  };

  if (onLoginRoute) {
    return (
      <div className={`app ${theme} platform-root platform-root--signal-concierge platform-root--consultant`}>
        <ConsultantLoginPage theme={theme} onToggleTheme={onToggleTheme} onAuthed={handleAuthed} />
      </div>
    );
  }

  return (
    <AdminToastProvider>
      <ConsultantRouteGuard key={sessionVersion}>
        {consultant ? (
          <ConsultantLayout
            theme={theme}
            consultant={consultant}
            activeRoute={activeRoute}
            onToggleTheme={onToggleTheme}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          >
            {activeRoute === "crm" || activeRoute === "home" || activeRoute === "portfolio" ? (
              activeRoute === "portfolio" ? (
                <ConsultantPortfolioWorkspace />
              ) : (
                <ConsultantCrmWorkspace />
              )
            ) : activeRoute === "regions" ? (
              <ConsultantRegionsWorkspace />
            ) : activeRoute === "members" ? (
              <ConsultantMembersWorkspace consultantId={consultant.consultantId} />
            ) : activeRoute === "introductions" ? (
              <ConsultantIntroductionsWorkspace />
            ) : (
              <ConsultantFollowUpsWorkspace />
            )}
          </ConsultantLayout>
        ) : null}
      </ConsultantRouteGuard>
    </AdminToastProvider>
  );
}
