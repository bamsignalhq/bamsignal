import { Moon, Sun } from "lucide-react";
import { AppLogo } from "../AppLogo";
import { SiteFooter } from "../SiteFooter";
import { BAMSIGNAL_FOUNDATION_TITLE } from "../../constants/bamSignalFoundation";
import { navigateToPath } from "../../constants/routes";
import {
  bamSignalFoundationPathForRoute,
  type BamSignalFoundationRoute
} from "../../constants/bamSignalFoundationRoutes";
import type { Theme } from "../../types";

type BamSignalFoundationLayoutProps = {
  children: React.ReactNode;
  theme: Theme;
  onToggleTheme: () => void;
  onLogoClick: () => void;
  onLogin?: () => void;
};

export function BamSignalFoundationLayout({
  children,
  theme,
  onToggleTheme,
  onLogoClick,
  onLogin
}: BamSignalFoundationLayoutProps) {
  const go = (route: BamSignalFoundationRoute) =>
    navigateToPath(bamSignalFoundationPathForRoute(route));

  return (
    <div className={`app ${theme} platform-root platform-root--bam-signal-foundation`}>
      <div className="foundation-shell">
        <header className="foundation-header">
          <div className="foundation-header__inner">
            <button type="button" className="foundation-header__brand" onClick={() => go("landing")}>
              <AppLogo size="sm" showText />
              <span> · {BAMSIGNAL_FOUNDATION_TITLE}</span>
            </button>
            <nav className="foundation-header__nav" aria-label="BamSignal Foundation">
              <button type="button" className="foundation-header__link" onClick={() => go("programs")}>
                Programs
              </button>
              <button type="button" className="foundation-header__link" onClick={() => go("stories")}>
                Stories
              </button>
            </nav>
            <div className="foundation-header__actions">
              <button
                type="button"
                className="foundation-header__icon"
                onClick={onToggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button type="button" className="foundation-header__link" onClick={onLogoClick}>
                BamSignal
              </button>
              {onLogin ? (
                <button type="button" className="foundation-header__link" onClick={onLogin}>
                  Member login
                </button>
              ) : null}
            </div>
          </div>
        </header>
        <main className="foundation-main">{children}</main>
        <SiteFooter onLogoClick={onLogoClick} />
      </div>
    </div>
  );
}
