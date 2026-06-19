import { Link } from "../../components/Link";
import { AppLogo } from "../../components/AppLogo";
import { SiteFooter } from "../../components/SiteFooter";
import { AUTH_SIGNUP_PATH } from "../../constants/routes";

type SeoLayoutProps = {
  children: React.ReactNode;
  onLogoClick?: () => void;
  onLogin?: () => void;
  onSignup?: () => void;
};

export function SeoLayout({ children, onLogoClick, onLogin, onSignup }: SeoLayoutProps) {
  return (
    <div className="seo-shell">
      <header className="seo-header">
        <div className="seo-header__inner">
          <button
            type="button"
            className="seo-header__brand"
            onClick={onLogoClick}
            aria-label="BamSignal home"
          >
            <AppLogo size="sm" showText />
          </button>
          <div className="seo-header__actions">
            <button type="button" className="seo-header__login" onClick={onLogin}>
              Login
            </button>
            <button type="button" className="seo-header__join" onClick={onSignup}>
              Join BamSignal
            </button>
          </div>
        </div>
      </header>

      <main className="seo-main">{children}</main>

      <aside className="seo-cta-strip">
        <div className="seo-cta-strip__inner">
          <p className="seo-cta-strip__title">Meet people who match your vibe.</p>
          <p className="seo-cta-strip__sub">Good conversations often begin with a signal.</p>
          <div className="seo-cta-strip__actions">
            <button type="button" className="seo-header__join" onClick={onSignup}>
              Join BamSignal
            </button>
            <Link href={AUTH_SIGNUP_PATH} className="seo-cta-strip__link">
              {AUTH_SIGNUP_PATH}
            </Link>
          </div>
        </div>
      </aside>

      <SiteFooter onLogoClick={onLogoClick} />
    </div>
  );
}
