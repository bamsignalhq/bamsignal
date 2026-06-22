import { Moon, Sun } from "lucide-react";
import { AppLogo } from "../AppLogo";
import { SiteFooter } from "../SiteFooter";
import { CAREERS_BRAND } from "../../constants/careers";
import { navigateToPath } from "../../constants/routes";
import { careersPathForHub, type CareersHubRoute } from "../../constants/careersRoutes";
import type { Theme } from "../../types";

type CareersLayoutProps = {
  children: React.ReactNode;
  theme: Theme;
  onToggleTheme: () => void;
  onLogoClick: () => void;
  onLogin?: () => void;
};

export function CareersLayout({
  children,
  theme,
  onToggleTheme,
  onLogoClick,
  onLogin
}: CareersLayoutProps) {
  const go = (route: CareersHubRoute) => navigateToPath(careersPathForHub(route));

  return (
    <div className={`app ${theme} platform-root platform-root--careers`}>
      <div className="careers-shell">
        <header className="careers-header">
          <div className="careers-header__inner">
            <button type="button" className="careers-header__brand" onClick={() => go("landing")}>
              <AppLogo size="sm" showText />
              <span> · {CAREERS_BRAND}</span>
            </button>
            <nav className="careers-header__nav" aria-label="Careers">
              <button type="button" className="careers-header__link" onClick={() => go("openRoles")}>
                Open roles
              </button>
              <button type="button" className="careers-header__link" onClick={() => go("culture")}>
                Culture
              </button>
              <button type="button" className="careers-header__link" onClick={() => go("ourValues")}>
                Values
              </button>
              <button type="button" className="careers-header__link" onClick={() => go("hiringProcess")}>
                Hiring
              </button>
            </nav>
            <div className="careers-header__actions">
              <button
                type="button"
                className="careers-header__link"
                onClick={onToggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {onLogin ? (
                <button type="button" className="careers-header__link" onClick={onLogin}>
                  Member login
                </button>
              ) : null}
            </div>
          </div>
        </header>
        <main className="careers-main">{children}</main>
        <SiteFooter onLogoClick={onLogoClick} />
      </div>
    </div>
  );
}
