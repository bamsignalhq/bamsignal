import { Moon, Sun } from "lucide-react";
import { AppLogo } from "../AppLogo";
import { SiteFooter } from "../SiteFooter";
import { BAMSIGNAL_INSTITUTE_TITLE } from "../../constants/bamSignalInstitute";
import { navigateToPath } from "../../constants/routes";
import {
  bamSignalInstitutePathForRoute,
  type BamSignalInstituteRoute
} from "../../constants/bamSignalInstituteRoutes";
import type { Theme } from "../../types";

type BamSignalInstituteLayoutProps = {
  children: React.ReactNode;
  theme: Theme;
  onToggleTheme: () => void;
  onLogoClick: () => void;
  onLogin?: () => void;
};

export function BamSignalInstituteLayout({
  children,
  theme,
  onToggleTheme,
  onLogoClick,
  onLogin
}: BamSignalInstituteLayoutProps) {
  const go = (route: BamSignalInstituteRoute) =>
    navigateToPath(bamSignalInstitutePathForRoute(route));

  return (
    <div className={`app ${theme} platform-root platform-root--bam-signal-institute`}>
      <div className="institute-shell">
        <header className="institute-header">
          <div className="institute-header__inner">
            <button type="button" className="institute-header__brand" onClick={() => go("landing")}>
              <AppLogo size="sm" showText />
              <span> · {BAMSIGNAL_INSTITUTE_TITLE}</span>
            </button>
            <nav className="institute-header__nav" aria-label="BamSignal Institute">
              <button type="button" className="institute-header__link" onClick={() => go("programs")}>
                Programs
              </button>
              <button type="button" className="institute-header__link" onClick={() => go("annualInsights")}>
                Annual Insights
              </button>
              <button
                type="button"
                className="institute-header__link"
                onClick={() => go("annualRelationshipReports")}
              >
                Annual Reports
              </button>
            </nav>
            <div className="institute-header__actions">
              <button
                type="button"
                className="institute-header__icon"
                onClick={onToggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button type="button" className="institute-header__link" onClick={onLogoClick}>
                BamSignal
              </button>
              {onLogin ? (
                <button type="button" className="institute-header__link" onClick={onLogin}>
                  Member login
                </button>
              ) : null}
            </div>
          </div>
        </header>
        <main className="institute-main">{children}</main>
        <SiteFooter onLogoClick={onLogoClick} />
      </div>
    </div>
  );
}
