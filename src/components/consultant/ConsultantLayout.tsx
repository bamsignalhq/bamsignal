import type { ReactNode } from "react";
import type { Theme } from "../../types";
import type { ConsultantSession } from "../../utils/consultantSession";
import type { ConsultantWorkspaceRoute } from "../../constants/consultantRoutes";
import { ConsultantHeader } from "./ConsultantHeader";
import { ConsultantSidebar } from "./ConsultantSidebar";

type ConsultantLayoutProps = {
  theme: Theme;
  consultant: ConsultantSession;
  activeRoute: ConsultantWorkspaceRoute;
  onToggleTheme: () => void;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  children: ReactNode;
};

export function ConsultantLayout({
  theme,
  consultant,
  activeRoute,
  onToggleTheme,
  onNavigate,
  onLogout,
  children
}: ConsultantLayoutProps) {
  return (
    <div className={`app ${theme} platform-root platform-root--signal-concierge platform-root--consultant`}>
      <div className="consultant-shell">
        <ConsultantHeader
          theme={theme}
          consultant={consultant}
          onToggleTheme={onToggleTheme}
          onLogout={onLogout}
        />
        <div className="consultant-shell__body">
          <ConsultantSidebar activeRoute={activeRoute} onNavigate={onNavigate} />
          <main className="consultant-main">{children}</main>
        </div>
      </div>
    </div>
  );
}
