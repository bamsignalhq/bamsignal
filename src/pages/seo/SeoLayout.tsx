import { PublicMarketingNav } from "../../components/PublicMarketingNav";
import { SiteFooter } from "../../components/SiteFooter";
import type { Theme } from "../../types";

type SeoLayoutProps = {
  children: React.ReactNode;
  theme: Theme;
  onToggleTheme: () => void;
  onLogoClick?: () => void;
  onLogin?: () => void;
  onSignup?: () => void;
  /** Homepage-style hero: start transparent until scroll */
  transparentNav?: boolean;
};

export function SeoLayout({
  children,
  theme,
  onToggleTheme,
  onLogoClick,
  onLogin,
  onSignup,
  transparentNav = false
}: SeoLayoutProps) {
  return (
    <div className="seo-shell platform-root--public-web">
      <PublicMarketingNav
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogoClick={onLogoClick}
        onLogin={onLogin}
        onSignup={onSignup}
        transparentOverHero={transparentNav}
      />

      <main className="seo-main">{children}</main>

      <SiteFooter
        onLogoClick={onLogoClick}
        onSignup={onSignup}
      />
    </div>
  );
}
