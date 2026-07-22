import { Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { AppLogo } from "../AppLogo";
import { SiteFooter } from "../SiteFooter";
import { WorkspaceSwitcher } from "../workspace/WorkspaceSwitcher";
import { SIGNAL_CONCIERGE_BRAND } from "../../constants/signalConcierge";
import { CONCIERGE_ROUTES } from "../../constants/conciergeRoutes";
import { navigateToPath } from "../../constants/routes";
import type { Theme } from "../../types";

type ConciergeShellProps = {
  children: ReactNode;
  theme: Theme;
  onToggleTheme: () => void;
  showDashboardLink?: boolean;
  showStatusLink?: boolean;
  isAuthed?: boolean;
  /** Optional breadcrumb label under the brand (workspace-aware). */
  breadcrumb?: string;
};

/**
 * Dedicated Concierge chrome — premium editorial language, not member fintech shell.
 * Workspace switching uses the shared WorkspaceSwitcher (multi-workspace only).
 */
export function ConciergeShell({
  children,
  theme,
  onToggleTheme,
  showDashboardLink,
  showStatusLink,
  isAuthed,
  breadcrumb
}: ConciergeShellProps) {
  return (
    <div className={`app ${theme} platform-root platform-root--signal-concierge platform-root--concierge`}>
      <div className="signal-concierge-shell concierge-shell">
        <header className="signal-concierge-header concierge-header">
          <div className="signal-concierge-header__inner">
            <div className="concierge-header__brand-block">
              <button
                type="button"
                className="signal-concierge-header__brand"
                onClick={() => navigateToPath(CONCIERGE_ROUTES.landing)}
                aria-label={`${SIGNAL_CONCIERGE_BRAND} home`}
              >
                <AppLogo size="sm" showText />
                <span> · {SIGNAL_CONCIERGE_BRAND}</span>
              </button>
              {breadcrumb ? (
                <p className="concierge-header__breadcrumb" aria-label="Current section">
                  {breadcrumb}
                </p>
              ) : null}
            </div>

            <nav className="concierge-header__nav" aria-label="Concierge">
              <button type="button" className="signal-concierge-header__link" onClick={() => navigateToPath(CONCIERGE_ROUTES.about)}>
                About
              </button>
              <button type="button" className="signal-concierge-header__link" onClick={() => navigateToPath(CONCIERGE_ROUTES.benefits)}>
                Benefits
              </button>
              <button type="button" className="signal-concierge-header__link" onClick={() => navigateToPath(CONCIERGE_ROUTES.pricing)}>
                Pricing
              </button>
              <button type="button" className="signal-concierge-header__link" onClick={() => navigateToPath(CONCIERGE_ROUTES.faq)}>
                FAQ
              </button>
            </nav>

            <div className="signal-concierge-header__actions">
              <button
                type="button"
                className="signal-concierge-header__link"
                onClick={onToggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {isAuthed ? <WorkspaceSwitcher currentWorkspaceId="concierge" variant="concierge" /> : null}
              {showDashboardLink ? (
                <button
                  type="button"
                  className="signal-concierge-header__link"
                  onClick={() => navigateToPath(CONCIERGE_ROUTES.dashboard)}
                >
                  Dashboard
                </button>
              ) : null}
              {showStatusLink ? (
                <button
                  type="button"
                  className="signal-concierge-header__link"
                  onClick={() => navigateToPath(CONCIERGE_ROUTES.status)}
                >
                  Status
                </button>
              ) : null}
              {isAuthed ? (
                <button
                  type="button"
                  className="signal-concierge-btn signal-concierge-btn--ghost signal-concierge-btn--compact"
                  onClick={() => navigateToPath(CONCIERGE_ROUTES.onboarding)}
                >
                  Continue application
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="signal-concierge-header__link"
                    onClick={() => navigateToPath(CONCIERGE_ROUTES.login)}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className="signal-concierge-btn signal-concierge-btn--primary signal-concierge-btn--compact"
                    onClick={() => navigateToPath(CONCIERGE_ROUTES.signup)}
                  >
                    Become a Concierge
                  </button>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="signal-concierge-main" id="concierge-main">
          {children}
        </main>
        <SiteFooter onLogoClick={() => navigateToPath(CONCIERGE_ROUTES.landing)} />
      </div>
    </div>
  );
}
