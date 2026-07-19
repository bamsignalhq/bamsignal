import { Moon, Sun } from "lucide-react";
import { AppLogo } from "../AppLogo";
import { SiteFooter } from "../SiteFooter";
import { SIGNAL_CONCIERGE_BRAND } from "../../constants/signalConcierge";
import type { Theme } from "../../types";

type SignalConciergeLayoutProps = {
  children: React.ReactNode;
  theme: Theme;
  onToggleTheme: () => void;
  onLogoClick: () => void;
  onLogin?: () => void;
  onStatus?: () => void;
  onDashboard?: () => void;
};

export function SignalConciergeLayout({
  children,
  theme,
  onToggleTheme,
  onLogoClick,
  onLogin,
  onStatus,
  onDashboard
}: SignalConciergeLayoutProps) {
  return (
    <div className={`app ${theme} platform-root platform-root--signal-concierge`}>
      <div className="signal-concierge-shell">
        <header className="signal-concierge-header">
          <div className="signal-concierge-header__inner">
            <button type="button" className="signal-concierge-header__brand" onClick={onLogoClick}>
              <AppLogo size="sm" showText />
              <span> · {SIGNAL_CONCIERGE_BRAND}</span>
            </button>
            <div className="signal-concierge-header__actions">
              <button
                type="button"
                className="signal-concierge-header__link"
                onClick={onToggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {onDashboard ? (
                <button type="button" className="signal-concierge-header__link" onClick={onDashboard}>
                  Journey dashboard
                </button>
              ) : null}
              {onStatus ? (
                <button type="button" className="signal-concierge-header__link" onClick={onStatus}>
                  Application status
                </button>
              ) : null}
              {onLogin ? (
                <button type="button" className="signal-concierge-header__link" onClick={onLogin}>
                  Client Sign In
                </button>
              ) : null}
            </div>
          </div>
        </header>
        <main className="signal-concierge-main">{children}</main>
        <SiteFooter onLogoClick={onLogoClick} />
      </div>
    </div>
  );
}
