import { PublicMarketingNav } from "../PublicMarketingNav";
import { SiteFooter } from "../SiteFooter";
import type { Theme } from "../../types";

type CareersLayoutProps = {
  children: React.ReactNode;
  theme: Theme;
  onToggleTheme: () => void;
  onLogoClick: () => void;
  onLogin?: () => void;
  onSignup?: () => void;
};

/** Public Join Our Team shell — no BamSignal job-board navigation. */
export function CareersLayout({
  children,
  theme,
  onToggleTheme,
  onLogoClick,
  onLogin,
  onSignup
}: CareersLayoutProps) {
  return (
    <div className={`app ${theme} platform-root platform-root--careers platform-root--public-web`}>
      <div className="careers-shell">
        <PublicMarketingNav
          theme={theme}
          onToggleTheme={onToggleTheme}
          onLogoClick={onLogoClick}
          onLogin={onLogin}
          onSignup={onSignup}
        />
        <main className="careers-main">{children}</main>
        <SiteFooter onLogoClick={onLogoClick} onSignup={onSignup} />
      </div>
    </div>
  );
}
