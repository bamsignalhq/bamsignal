import { SignalConciergeLayout } from "../../components/signalConcierge/SignalConciergeLayout";
import { navigateToPath } from "../../constants/routes";
import {
  signalConciergePathForRoute,
  type SignalConciergeRoute
} from "../../constants/signalConciergeRoutes";
import type { Theme } from "../../types";

export type SignalConciergePageShellProps = {
  children: React.ReactNode;
  theme: Theme;
  onToggleTheme: () => void;
  onLogoClick: () => void;
  onLogin?: () => void;
  showStatusLink?: boolean;
  showDashboardLink?: boolean;
};

export function SignalConciergePageShell({
  children,
  theme,
  onToggleTheme,
  onLogoClick,
  onLogin,
  showStatusLink = false,
  showDashboardLink = false
}: SignalConciergePageShellProps) {
  const go = (route: SignalConciergeRoute) => navigateToPath(signalConciergePathForRoute(route));

  return (
    <SignalConciergeLayout
      theme={theme}
      onToggleTheme={onToggleTheme}
      onLogoClick={onLogoClick}
      onLogin={onLogin}
      onStatus={showStatusLink ? () => go("status") : undefined}
      onDashboard={showDashboardLink ? () => go("dashboard") : showStatusLink ? () => go("dashboard") : undefined}
    >
      {children}
    </SignalConciergeLayout>
  );
}
