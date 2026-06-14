import { AppLogo } from "./AppLogo";
import {
  FOOTER_COPYRIGHT,
  FOOTER_EARLY_ACCESS_LABEL,
  FOOTER_LINKS,
  FOOTER_TRUST_LINE,
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
        <p className="site-footer-trust">{FOOTER_TRUST_LINE}</p>

        <div className="site-footer-bar">
          <button
            type="button"
            className="site-footer-logo"
            onClick={onLogoClick}
            aria-label="BamSignal home"
          >
            <AppLogo size="sm" showText={false} />
          </button>

          <nav className="site-footer-nav" aria-label="Footer">
            <ul className="site-footer-links">
              {FOOTER_LINKS.map((link) => (
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

          <p className="site-footer-copy">{FOOTER_COPYRIGHT}</p>
        </div>

        {showEarlyAccess && <p className="site-footer-edition">{FOOTER_EARLY_ACCESS_LABEL}</p>}
      </div>
    </footer>
  );
}
