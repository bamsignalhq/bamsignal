import { Moon, Sun } from "lucide-react";
import { AppLogo } from "../AppLogo";
import { SiteFooter } from "../SiteFooter";
import { SIGNAL_EVENTS_TITLE } from "../../constants/signalEvents";
import { navigateToPath } from "../../constants/routes";
import {
  signalEventsPathForHub,
  type SignalEventsHubRoute
} from "../../constants/signalEventsRoutes";
import type { Theme } from "../../types";

type SignalEventsLayoutProps = {
  children: React.ReactNode;
  theme: Theme;
  onToggleTheme: () => void;
  onLogoClick: () => void;
  onLogin?: () => void;
};

export function SignalEventsLayout({
  children,
  theme,
  onToggleTheme,
  onLogoClick,
  onLogin
}: SignalEventsLayoutProps) {
  const go = (route: SignalEventsHubRoute) => navigateToPath(signalEventsPathForHub(route));

  return (
    <div className={`app ${theme} platform-root platform-root--signal-events`}>
      <div className="signal-events-shell">
        <header className="signal-events-header">
          <div className="signal-events-header__inner">
            <button type="button" className="signal-events-header__brand" onClick={() => go("landing")}>
              <AppLogo size="sm" showText />
              <span> · {SIGNAL_EVENTS_TITLE}</span>
            </button>
            <nav className="signal-events-header__nav" aria-label="Signal Events">
              <button type="button" className="signal-events-header__link" onClick={() => go("communities")}>
                Communities
              </button>
              <button type="button" className="signal-events-header__link" onClick={() => go("diaspora")}>
                Diaspora
              </button>
            </nav>
            <div className="signal-events-header__actions">
              <button
                type="button"
                className="signal-events-header__icon"
                onClick={onToggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button type="button" className="signal-events-header__link" onClick={onLogoClick}>
                BamSignal
              </button>
              {onLogin ? (
                <button type="button" className="signal-events-header__link" onClick={onLogin}>
                  Member login
                </button>
              ) : null}
            </div>
          </div>
        </header>
        <main className="signal-events-main">{children}</main>
        <SiteFooter onLogoClick={onLogoClick} />
      </div>
    </div>
  );
}
