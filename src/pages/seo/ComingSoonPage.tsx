import { SeoHead } from "./SeoHead";
import { Link } from "../../components/Link";
import { AUTH_SIGNUP_PATH } from "../../constants/routes";
import type { ComingSoonPageConfig } from "../../constants/comingSoonPages";
import { buildWebPageJsonLd } from "../../utils/seoHead";

type ComingSoonPageProps = {
  page: ComingSoonPageConfig;
  onSignup?: () => void;
};

export function ComingSoonPage({ page, onSignup }: ComingSoonPageProps) {
  return (
    <div className="coming-soon-page">
      <SeoHead
        title={`${page.title} | BamSignal`}
        description={page.lede}
        canonicalPath={page.path}
        noindex
        jsonLd={buildWebPageJsonLd({
          title: page.title,
          description: page.lede,
          canonicalPath: page.path
        })}
      />
      <p className="coming-soon-page__eyebrow">{page.eyebrow}</p>
      <h1 className="coming-soon-page__title">{page.title}</h1>
      <p className="coming-soon-page__lede">{page.lede}</p>
      <div className="coming-soon-page__actions">
        {onSignup ? (
          <button type="button" className="coming-soon-page__primary" onClick={onSignup}>
            Get Started
          </button>
        ) : (
          <Link href={AUTH_SIGNUP_PATH} className="coming-soon-page__primary">
            Get Started
          </Link>
        )}
        <Link href="/" className="coming-soon-page__secondary">
          Back to homepage
        </Link>
        <Link href="/privacy" className="coming-soon-page__secondary">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
