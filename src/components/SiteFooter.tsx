import { AppLogo } from "./AppLogo";
import { SocialIconLinks } from "./SocialIconLinks";
import {
  FOOTER_COPYRIGHT,
  FOOTER_EARLY_ACCESS_LABEL,
  FOOTER_QUICK_LINKS,
  FOOTER_SUBTAGLINE,
  FOOTER_TAGLINE,
  navigateToPath
} from "../constants/footer";

type SiteFooterProps = {
  className?: string;
  showEarlyAccess?: boolean;
  onLogoClick?: () => void;
};

export function SiteFooter({ className = "", showEarlyAccess = false, onLogoClick }: SiteFooterProps) {
  return (
    <footer className={`site-footer ${className}`.trim()} role="contentinfo" aria-label="Site footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          <section className="site-footer-brand" aria-label="Brand">
            <button
              type="button"
              className="site-footer-logo"
              onClick={onLogoClick}
              aria-label="BamSignal home"
            >
              <AppLogo size="sm" showText={false} />
            </button>
            <p className="site-footer-brand-name">BamSignal</p>
            <p className="site-footer-tagline">{FOOTER_TAGLINE}</p>
            <p className="site-footer-subtagline">{FOOTER_SUBTAGLINE}</p>
          </section>

          <section className="site-footer-section" aria-label="Quick links">
            <h3 className="site-footer-heading">Quick Links</h3>
            <nav aria-label="Footer">
              <ul className="site-footer-links">
                {FOOTER_QUICK_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      className="site-footer-link"
                      href={link.href}
                      onClick={(event) => {
                        event.preventDefault();
                        navigateToPath(link.href);
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </section>

          <section className="site-footer-section" aria-label="Social">
            <h3 className="site-footer-heading">Social</h3>
            <SocialIconLinks className="site-footer-social" size={22} />
          </section>
        </div>

        <p className="site-footer-copy">{FOOTER_COPYRIGHT}</p>

        {showEarlyAccess && <p className="site-footer-edition">{FOOTER_EARLY_ACCESS_LABEL}</p>}
      </div>
    </footer>
  );
}
