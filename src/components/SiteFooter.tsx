import { AppLogo } from "./AppLogo";
import { SocialIconLinks } from "./SocialIconLinks";
import {
  FOOTER_COMPANY_LINKS,
  FOOTER_COPYRIGHT,
  FOOTER_CTA,
  FOOTER_DISCOVER_LINKS,
  FOOTER_EARLY_ACCESS_LABEL,
  FOOTER_LEGAL_LINKS,
  FOOTER_MADE_IN,
  FOOTER_PRIVACY_LINKS,
  FOOTER_TAGLINE,
  navigateToPath,
  type FooterLink
} from "../constants/footer";
import { AUTH_SIGNUP_PATH } from "../constants/routes";
import { SIGNAL_CONCIERGE_ROUTES } from "../constants/signalConciergeRoutes";

type SiteFooterProps = {
  className?: string;
  showEarlyAccess?: boolean;
  showPreFooterCta?: boolean;
  onLogoClick?: () => void;
  onSignup?: () => void;
  onConciergeApply?: () => void;
};

function FooterLinkList({
  links,
  ariaLabel
}: {
  links: readonly FooterLink[];
  ariaLabel: string;
}) {
  return (
    <nav aria-label={ariaLabel}>
      <ul className="site-footer-links">
        {links.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            {link.comingSoon ? (
              <span className="site-footer-link site-footer-link--soon" title="Coming soon">
                {link.label}
                <em>Soon</em>
              </span>
            ) : link.external ? (
              <a
                className="site-footer-link"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ) : (
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
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter({
  className = "",
  showEarlyAccess = false,
  showPreFooterCta = true,
  onLogoClick,
  onSignup,
  onConciergeApply
}: SiteFooterProps) {
  const handlePrimaryCta = () => {
    if (onSignup) {
      onSignup();
      return;
    }
    navigateToPath(AUTH_SIGNUP_PATH);
  };

  const handleSecondaryCta = () => {
    if (onConciergeApply) {
      onConciergeApply();
      return;
    }
    navigateToPath(SIGNAL_CONCIERGE_ROUTES.landing);
  };

  return (
    <footer className={`site-footer ${className}`.trim()} role="contentinfo" aria-label="Site footer">
      {showPreFooterCta ? (
        <section className="site-footer-cta" aria-labelledby="site-footer-cta-title">
          <div className="site-footer-cta__inner">
            <h2 id="site-footer-cta-title" className="site-footer-cta__title">
              {FOOTER_CTA.title}
            </h2>
            <p className="site-footer-cta__body">{FOOTER_CTA.body}</p>
            <div className="site-footer-cta__actions">
              <button type="button" className="site-footer-cta__primary" onClick={handlePrimaryCta}>
                {FOOTER_CTA.primary.label}
              </button>
              <button type="button" className="site-footer-cta__secondary" onClick={handleSecondaryCta}>
                {FOOTER_CTA.secondary.label}
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <div className="site-footer-inner">
        <div className="site-footer-grid site-footer-grid--premium">
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
            <p className="site-footer-tagline">
              <span className="site-footer-tagline__lead">{FOOTER_TAGLINE}</span>
            </p>
            <div className="site-footer-store-badges" aria-label="App downloads coming soon">
              <span className="site-footer-store-badge" aria-hidden>
                App Store
              </span>
              <span className="site-footer-store-badge" aria-hidden>
                Google Play
              </span>
            </div>
          </section>

          <section className="site-footer-section" aria-label="Discover">
            <h3 className="site-footer-heading">Discover</h3>
            <FooterLinkList links={FOOTER_DISCOVER_LINKS} ariaLabel="Discover" />
          </section>

          <section className="site-footer-section" aria-label="Privacy">
            <h3 className="site-footer-heading">Privacy</h3>
            <FooterLinkList links={FOOTER_PRIVACY_LINKS} ariaLabel="Privacy" />
          </section>

          <section className="site-footer-section" aria-label="Company">
            <h3 className="site-footer-heading">Company</h3>
            <FooterLinkList links={FOOTER_COMPANY_LINKS} ariaLabel="Company" />
          </section>

          <section className="site-footer-section" aria-label="Legal">
            <h3 className="site-footer-heading">Legal</h3>
            <FooterLinkList links={FOOTER_LEGAL_LINKS} ariaLabel="Legal" />
          </section>
        </div>

        <div className="site-footer-bottom">
          <p className="site-footer-copy">
            {FOOTER_COPYRIGHT} {FOOTER_MADE_IN}
          </p>
          <SocialIconLinks className="site-footer-social" size={18} />
        </div>

        {showEarlyAccess && <p className="site-footer-edition">{FOOTER_EARLY_ACCESS_LABEL}</p>}
      </div>
    </footer>
  );
}
