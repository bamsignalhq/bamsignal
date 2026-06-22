import { Moon, Sun } from "lucide-react";
import { AppLogo } from "../AppLogo";
import { SiteFooter } from "../SiteFooter";
import { SUPPORT_CENTER_BRAND } from "../../constants/supportCenter";
import { navigateToPath } from "../../constants/routes";
import {
  supportCenterPathForRoute,
  type SupportCenterRoute
} from "../../constants/supportCenterRoutes";
import type { Theme } from "../../types";

type SupportCenterLayoutProps = {
  children: React.ReactNode;
  theme: Theme;
  onToggleTheme: () => void;
  onLogoClick: () => void;
  onLogin?: () => void;
};

export function SupportCenterLayout({
  children,
  theme,
  onToggleTheme,
  onLogoClick,
  onLogin
}: SupportCenterLayoutProps) {
  const go = (route: SupportCenterRoute) => navigateToPath(supportCenterPathForRoute(route));

  return (
    <div className={`app ${theme} platform-root platform-root--support-center`}>
      <div className="support-center-shell">
        <header className="support-center-header">
          <div className="support-center-header__inner">
            <button type="button" className="support-center-header__brand" onClick={() => go("help")}>
              <AppLogo size="sm" showText />
              <span> · {SUPPORT_CENTER_BRAND}</span>
            </button>
            <nav className="support-center-header__nav" aria-label="Support">
              <button type="button" className="support-center-header__link" onClick={() => go("tickets")}>
                Tickets
              </button>
              <button type="button" className="support-center-header__link" onClick={() => go("knowledgeBase")}>
                Knowledge base
              </button>
              <button type="button" className="support-center-header__link" onClick={() => go("contact")}>
                Contact
              </button>
            </nav>
            <div className="support-center-header__actions">
              <button
                type="button"
                className="support-center-header__link"
                onClick={onToggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {onLogin ? (
                <button type="button" className="support-center-header__link" onClick={onLogin}>
                  Member login
                </button>
              ) : null}
            </div>
          </div>
        </header>
        <main className="support-center-main">{children}</main>
        <SiteFooter onLogoClick={onLogoClick} />
      </div>
    </div>
  );
}
